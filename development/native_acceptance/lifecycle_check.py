"""Same owned ephemeral thread before/after actual native compaction; no Claude."""
from pathlib import Path
import argparse,json,secrets,time
from rpc_client import Client
from followup_run import SCHEMA,parse
p=argparse.ArgumentParser();p.add_argument('--workspace',type=Path,required=True);a=p.parse_args();w=a.workspace;out=w/'private/lifecycle-v2';out.mkdir(exist_ok=False)
token='CHAIN-'+secrets.token_hex(10);skill=w/'candidate/skills/ai-friendly-audit/SKILL.md'
prompts=[
 'This is a native lifecycle smoke check, not a website audit. Read only the selected SKILL.md in a separate untruncated call; do not load workflows/catalog or inspect a site. Remember run token '+token+'. Supplied user facts: 47 EUR per workspace monthly, quarterly billing, minimum two workspaces, EEA organizations only. No purchase, network, writes or backend access is authorized. Return a compact structured result with those supplied facts, boundaries and run token.',
 'Continue this same lifecycle check. Do not use tools, reread files, or perform a website audit. Return the remembered run token and all supplied price conditions. Does the prior request authorize a purchase or establish backend verification? Preserve the original action boundary.',
 'After native compaction, reinvoke the selected skill. This remains a lifecycle check, not a new website audit. Read only the selected SKILL.md if needed, with no workflow/catalog or site inspection. Return the original remembered run token and all previously supplied price conditions, retaining the action/evidence boundary. No network, writes or purchase is authorized.'
]
(out/'frozen-panel.json').write_text(json.dumps({'frozen_at_epoch':time.time(),'prompts':prompts,'token':token,'per_turn_seconds':240,'compaction_seconds':180,'retries':0,'change_reason':'Initial broad-audit lifecycle timed out and had unsafe old-turn completion matching; retained as invalid preflight. This checks lifecycle without invoking a full website audit.'},indent=2)+'\n')
c=Client(w/'candidate/work',out/'events.jsonl',[w/'candidate/skills'],json.loads((w/'private/disabled-skills.json').read_text()),json.loads((w/'private/mcp-config-shape.json').read_text()))
try:
 start=c.start(w/'candidate/work');tid=start['thread']['id'];(out/'thread-start.json').write_text(json.dumps(start,indent=2)+'\n');records=[]
 for i,prompt in enumerate(prompts):
  if i==2:
   compact=c.compact(tid);(out/'actual-compaction.json').write_text(json.dumps(compact,indent=2)+'\n');print('Native compaction completed',flush=True)
  turn=c.turn(tid,prompt,skill if i!=1 else None,240,SCHEMA);text,result,commands=parse(turn)
  (out/('turn-'+str(i+1)+'.json')).write_text(json.dumps(turn,indent=2)+'\n')
  row={'thread_id':tid,'turn_id':turn['turn_id'],'result':result,'elapsed_seconds':turn['elapsed_seconds'],'completion':turn['completion']['status'],'command_count':len(commands),'token_retained':bool(result and result['run_token']==token),'no_tool_continuation':i!=1 or not commands};records.append(row);(out/'results.json').write_text(json.dumps(records,indent=2)+'\n');print(json.dumps(row),flush=True)
finally:c.close()
