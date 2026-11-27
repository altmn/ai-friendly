"""Frozen max-profile regressions. No live installs, Claude, or external effects."""
import argparse
from datetime import datetime,timezone
import hashlib
import json
from pathlib import Path
import re
import time
from rpc_client import Client
from followup_run import SCHEMA,parse


def checks(case,result,final,marker):
    result=result or {}
    text=' '.join(str(v) for k in ['facts','indicators','unavailable'] for v in result.get(k,[])).casefold()
    common={'backend_false':result.get('backend_record_checked') is False,
            'business_null':result.get('business_effect_verified','missing') is None,
            'unintended_null':result.get('unintended_effect_count','missing') is None,
            'limitations':bool(result.get('unavailable')),'private_marker_omitted':marker not in final}
    for fact in case['required_literals']:common['fact:'+fact]=fact.casefold() in text
    for label,pattern in case.get('required_patterns',{}).items():common[label]=bool(re.search(pattern,text))
    return common


def main():
    p=argparse.ArgumentParser();p.add_argument('--workspace',type=Path,required=True)
    p.add_argument('--condition',choices=['candidate','previous','baseline'],required=True)
    p.add_argument('--shard',type=int,default=0);a=p.parse_args();w=a.workspace
    panel=json.loads((w/'frozen-panel.json').read_text());stage=w/'stages'/a.condition
    out=w/'private'/(a.condition+'-'+str(a.shard));out.mkdir(exist_ok=False)
    rows=[];sk=stage/'skills/ai-friendly-audit/SKILL.md' if a.condition!='baseline' else None
    cases=panel['cases'] if a.condition!='candidate' else panel['cases'] if a.shard==0 else list(reversed(panel['cases']))
    for case in cases:
        label=case['id'];folder=out/label;folder.mkdir()
        before=time.time();client=None;record={'label':label,'condition':a.condition,'repeat':a.shard+1}
        try:
            client=Client(stage/'work',folder/'events.jsonl',[] if not sk else [stage/'skills'],
                json.loads((w/'private/disabled-skills.json').read_text()),
                json.loads((w/'private/mcp-config-shape.json').read_text()),reasoning_effort='max')
            catalog=client.catalog(stage/'work')
            enabled=[s['name'] for e in catalog['data'] for s in e['skills'] if s.get('enabled')]
            assert enabled==([] if not sk else ['ai-friendly-audit']),enabled
            servers=client.call('mcpServerStatus/list',{})
            expected_servers=json.loads((w/'private/mcp-config-shape.json').read_text())
            assert {s['name'] for s in servers['data']}==set(expected_servers)
            assert all(not s.get('tools') and not s.get('resources') and not s.get('resourceTemplates') for s in servers['data']), 'Disabled MCP integrations must expose no tools/resources'
            started=client.start(stage/'work');(folder/'start.json').write_text(json.dumps(started,indent=2)+'\n')
            assert started['model']==panel['model'] and started['reasoningEffort']=='max'
            assert started['sandbox']=={'type':'readOnly','networkAccess':False}
            record.update(thread_id=started['thread']['id'],model=started['model'],reasoning_effort=started['reasoningEffort'],enabled_skills=enabled)
            prompt=panel['prompt'].replace('{file}',case['file'])
            turn=client.turn(record['thread_id'],prompt,sk,180,SCHEMA)
            (folder/'turn.json').write_text(json.dumps(turn,indent=2)+'\n')
            final,result,commands=parse(turn)
            predicates=checks(case,result,final,panel['private_marker'])
            predicates['native_completed']=turn['completion'].get('status')=='completed'
            predicates['exact_entrypoint_read']=not sk or any(sk.read_text() in c.get('aggregatedOutput','') for c in commands)
            usages=[e['params']['tokenUsage']['total'] for e in turn['events'] if e.get('method')=='thread/tokenUsage/updated' and e.get('params',{}).get('turnId')==turn['turn_id']]
            record.update(turn_id=turn['turn_id'],elapsed_seconds=turn['elapsed_seconds'],result=result,
                checks=predicates,outcome='passed' if all(predicates.values()) else 'failed',
                command_count=len(commands),command_output_bytes=sum(len(c.get('aggregatedOutput','').encode()) for c in commands),
                usage=usages[-1] if usages else None,cost_usd=None,
                turn_sha256=hashlib.sha256((folder/'turn.json').read_bytes()).hexdigest())
        except Exception as e:
            record.update(outcome='inconclusive',error=str(e),elapsed_seconds=time.time()-before)
        finally:
            if client:client.close()
        record['owned_server_exited']=client is None or client.proc.poll() is not None
        record['raw_events_sha256']=hashlib.sha256((folder/'events.jsonl').read_bytes()).hexdigest() if (folder/'events.jsonl').exists() else None
        rows.append(record);(out/'results.json').write_text(json.dumps(rows,indent=2,ensure_ascii=False)+'\n')
        print(json.dumps({k:record[k] for k in ['condition','repeat','label','outcome','elapsed_seconds','owned_server_exited']}),flush=True)


if __name__=='__main__':main()
