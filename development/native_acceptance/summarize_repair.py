"""Offline, minimized evidence assembly for the frozen field-name/max panel."""
import argparse,copy,hashlib,json,re
from collections import Counter
from datetime import datetime,timezone
from pathlib import Path
from repair_trials import checks

def load(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,data):p.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
def stamp(t):return datetime.fromtimestamp(t,timezone.utc).isoformat()
def manifest(root):return {str(p.relative_to(root)):sha(p) for p in sorted(root.rglob('*')) if p.is_file() and 'node_modules' not in p.parts}
def mh(data):return hashlib.sha256(json.dumps(data,sort_keys=True).encode()).hexdigest()

def main():
 p=argparse.ArgumentParser();p.add_argument('--workspace',type=Path,required=True);p.add_argument('--output',type=Path,required=True);a=p.parse_args()
 w,out=a.workspace,a.output;root=Path(__file__).resolve().parents[2];panel=load(w/'frozen-panel.json');now=datetime.now(timezone.utc).isoformat()
 assert sha(Path(__file__).with_name('repair_trials.py'))==panel['grader_sha256']
 assert sha(Path(__file__).with_name('rpc_client.py'))==panel['client_sha256']
 assert manifest(root/'ai-friendly-audit')==panel['candidate_manifest']
 for condition in ['candidate','previous']:
  assert manifest(w/'stages'/condition/'skills/ai-friendly-audit')==panel[condition+'_manifest']
 assert all(sha(w/name)==expected for name,expected in panel['input_hashes'].items())
 public=copy.deepcopy(panel)
 public['prompt']=re.sub(r'(helpers may run with ).*?(; do not execute)',r'\1<supported-node-executable>\2',public['prompt'],flags=re.S)
 if 'node_path' in public:public['node_path']='<supported-node-executable>'
 public['private_marker']='synthetic canary; literal retained privately only'
 public['private_panel_sha256']=sha(w/'frozen-panel.json')
 public['prompt_sha256']=hashlib.sha256(panel['prompt'].encode()).hexdigest()
 public['candidate_manifest_sha256']=mh(panel['candidate_manifest']);public['previous_manifest_sha256']=mh(panel['previous_manifest'])
 public['digest_method']='SHA-256 of UTF-8 json.dumps(sorted relative file/hash map, sort_keys=True); not an archive hash'
 public['preflight']=load(w/'preflight.json')
 public['setup_attempts']=[{'name':f.stem,'sha256':sha(f),'inference':False} for f in sorted((w/'private').glob('preflight*jsonl'))]
 public['executed_preparer_sha256']=sha(Path('/private/tmp/aff-prepare-repair-trials.py')) if Path('/private/tmp/aff-prepare-repair-trials.py').exists() else None
 write(out/'source-max-repair-panel.json',public)
 rows=[]
 for condition,repeat in [('candidate',0),('candidate',1),('previous',0),('baseline',0)]:
  folder=w/'private'/(condition+'-'+str(repeat));records={r['label']:r for r in load(folder/'results.json')} if (folder/'results.json').exists() else {}
  for case in panel['cases']:
   r=copy.deepcopy(records.get(case['id'],{'label':case['id'],'condition':condition,'repeat':repeat+1,'outcome':'not_run'}))
   eventfile=folder/case['id']/'events.jsonl'
   if eventfile.exists():
    es=[json.loads(line) for line in eventfile.read_text().splitlines()]
    starts=[e for e in es if e.get('method')=='turn/started']
    if starts:
     begin=starts[0];tid=begin['params']['turn']['id'];thread=begin['params']['threadId']
     selected=[e for e in es if e.get('params',{}).get('threadId')==thread and (e.get('params',{}).get('turnId')==tid or e.get('params',{}).get('turn',{}).get('id')==tid)]
     r['thread_id']=thread;r['turn_id']=tid;r['started_at']=stamp(begin['emittedAtMs']/1000)
     r['last_observed_at']=stamp(max(e.get('emittedAtMs',begin['emittedAtMs']) for e in selected)/1000)
     items=[e['params']['item'] for e in selected if e.get('method')=='item/completed']
     commands=[i for i in items if i.get('type')=='commandExecution']
     final=[i.get('text','') for i in items if i.get('type')=='agentMessage']
     usage=[e['params']['tokenUsage']['total'] for e in selected if e.get('method')=='thread/tokenUsage/updated']
     r['usage']=usage[-1] if usage else None;r['cost_usd']=None
     r['usage_limit']='Final native snapshot' if r['outcome'] in ['passed','failed'] else 'Last reported snapshot; unfinished call usage may be missing'
     r['command_count']=len(commands);r['command_output_bytes']=sum(len(c.get('aggregatedOutput','').encode()) for c in commands)
     r['item_types']=dict(Counter(i['type'] for i in items))
     r['matching_native_completion']=any(e.get('method')=='turn/completed' and e['params']['turn'].get('status')=='completed' for e in selected)
     if r['outcome'] in ['passed','failed']:
      assert r['matching_native_completion'] and final
      actual=json.loads(final[-1]);assert actual==r['result']
      expected=checks(case,actual,final[-1],panel['private_marker'])
      assert all(r['checks'][k]==v for k,v in expected.items())
      assert r['outcome']==('passed' if all(r['checks'].values()) else 'failed')
      r['final_sha256']=hashlib.sha256(final[-1].encode()).hexdigest()
      if condition=='baseline':
       # Display the control's satisfied alternative without claiming a read.
       r['checks']['target_absent']=r['checks'].pop('exact_entrypoint_read')
       r['selected_entrypoint_read']=None
   # Raw events/commands stay private; results contain only synthetic facts.
   encoded=json.dumps(r,ensure_ascii=False).replace(panel['private_marker'],'[synthetic value omitted]')
   encoded=encoded.replace(str(w.resolve()),'<workspace>').replace(str(w),'<workspace>')
   rows.append(json.loads(encoded))
 summary={c:dict(Counter(r['outcome'] for r in rows if r['condition']==c)) for c in ['candidate','previous','baseline']}
 assert len(rows)==24
 write(out/'source-max-repair-results.json',{'recorded_at':now,'rows':rows,'summary':summary,
    'scheduled':panel['scheduled'],'input_hashes_match':True,'runtime_matches_frozen_candidate':True,
    'scope':'Six author-written intent clusters, repeated candidate trials; no broad reliability, realistic routing or causal speed/cost claim.',
    'qualification':'Candidate and previous package changes are a combined treatment. Current no-skill success must be reported alongside candidate outcomes. The baseline conditional activation predicate is displayed as target_absent, not a nonexistent entrypoint read. Previous timeouts are budget failures with quality inconclusive, never excluded successes.',
    'usage':'Reported provider snapshots, including failed attempts where exposed. No byte-to-token conversion; cost and separately tokenized activated context unknown.',
    'forbidden_effects':'Network/writes/other agents forbidden in actor prompts; native read-only/network-denied policy and output invariants checked. No universal enforcement claim.'})
 def evidence(name,scope):return {'kind':'artifact','ref':'docs/audit/'+name,'sha256':sha(out/name),'observed_at':now,'scope':scope}
 def check(id,outcome,reason):return {'id':id,'outcome':outcome,'evidence':[evidence('source-max-repair-results.json',reason)],'reason':reason}
 def identity(condition):
  m={} if condition=='baseline' else panel[condition+'_manifest']
  return {'artifact_id':'source-max-repair-'+condition,'source_commit':panel['source_commit_before_changes'] if condition=='previous' else None,
          'package_sha256':mh(m),'activated_source':None if condition=='baseline' else 'private disposable stage/skills/ai-friendly-audit/SKILL.md',
          'activated_sha256':m.get('SKILL.md'),'missing_identity_reason':'Uncommitted candidate pinned by 45-file manifest' if condition=='candidate' else 'No skill enabled in verified control' if condition=='baseline' else None}
 target={'product':'Codex CLI','surface':'owned ephemeral app-server stdio threads','distribution':'private disposable project-scoped skill',
         'version':'0.170.0','os':'macOS arm64','policy':{'sandbox':'read-only','network':False,'approval':'never','reasoning_effort':'max','security_hooks_retained':True},
         'missing_details':['Provider model build, monetary cost and separately tokenized activated context not exposed.']}
 def metric(n,unit):return {'value':n,'unit':unit,'source':'measured' if n is not None else 'unknown','missing_reason':None if n is not None else 'Not exposed or no completed observation; never inferred.'}
 base=load(out/'followup-evaluation-receipt.json')
 base.update(case_id='AUD-007-SOURCE-MAX-REPAIR',recorded_at=now,artifact=identity('candidate'),
  panel={'id':'source-max-repair-frozen','sha256':sha(out/'source-max-repair-panel.json'),'acceptance_frozen_at':panel['frozen_at'],
    'retry_policy':'Zero retries; every scheduled case retained. Candidate repeats reversed.',
    'exclusion_policy':'No within-panel attempt excluded. Timeouts/infrastructure errors remain inconclusive for quality; no best-of-repeat scoring.',
    'control_identity':{'kind':'no_skill','artifact':identity('baseline'),'isolation':panel['isolation'],'reason':'Fresh native process/thread each case; verified zero enabled baseline skills and zero MCP tools/resources.'}},
  budget={'max_attempts':24,'max_elapsed_seconds':None,'max_cost':None,'currency':None,
    'enforcement':'180-second absolute turn deadline including turn/start; cleanup bounded separately by six seconds. Preflight RPCs have separate 30-second absolute bounds. No lower reasoning, larger timeout or retries.'},
  runtime_versions={'codex':'0.170.0','model':'gpt-6.1-sol','reasoning':'max','node':'24.22.3','parse5':'7.3.0'},attempts=[],
  elapsed=metric(None,'seconds'),usage={k:metric(None,'USD' if k=='cost' else 'tokens' if k.endswith('tokens') else 'calls') for k in ['input_tokens','output_tokens','tool_calls','cost']},
  outcome='blocked',checks=[],artifacts=[],
  grader={'id':'source-max-repair-literals-and-native-completion','version':'1.0','sha256':panel['grader_sha256'],'method':'deterministic',
          'calibration':'Required known field strings/qualifiers and null boundaries frozen before inference. Historical five naming omissions retained; helper and deadline adverse regressions reproduced before fixes. No grader tuning or subject reruns.'},
  omissions=['Claude remains blocked at user direction; zero calls.','No cloud-browser execution or updated live-browser acceptance.',
    'Narrow read-only source panel does not qualify full canonical/live max-profile audits or broad routing reliability.',
    'Shared caches and parallel conditions prevent causal speed/cost inference; no general benefit claim.',
    'Historical native discovery/browser/lifecycle evidence applies to earlier bytes; not transferred to this changed candidate.'],
  redaction='Only minimized synthetic results and hashes published; raw host events, config inventory, account metadata and canary literal remain private.')
 for r in rows:
  if r['outcome']=='not_run':continue
  u=r.get('usage') or {};outcome=r['outcome']
  predicates=[check(k,'passed' if v else 'failed',k) for k,v in r.get('checks',{}).items()]
  if outcome=='inconclusive':predicates.append(check('within-budget-completion','failed','No completed native output within the declared window; quality remains inconclusive.'))
  base['attempts'].append({'attempt_id':r['condition']+'-'+str(r['repeat'])+'-'+r['label'],'case_id':'AUD-007-SOURCE-MAX-REPAIR',
    'condition':'no_skill' if r['condition']=='baseline' else r['condition'],'started_at':r.get('started_at',now),'ended_at':r.get('last_observed_at',now),
    'artifact':identity(r['condition']),'target':target,'model':{'name':'gpt-6.1-sol','version':None,'missing_reason':'Native model name/effort observed; provider build not exposed.'},
    'input_hashes':{'panel':public['private_panel_sha256'],'source':panel['input_hashes']['stages/'+r['condition']+'/work/'+r['label']+'.html']},
    'permissions':{'network':False,'file_edits':False,'other_agents':False,'external_effects':False},'outcome':outcome,'checks':predicates,
    'evidence':[evidence('source-max-repair-results.json','Matching native identities, result predicates and raw-event hash.')],
    'elapsed':metric(r.get('elapsed_seconds'),'seconds'),
    'usage':{'input_tokens':metric(u.get('inputTokens'),'tokens'),'output_tokens':metric(u.get('outputTokens'),'tokens'),
             'tool_calls':metric(r.get('command_count'),'completed command items'),'cost':metric(None,'USD')},
    'reason':'Completed rows measure native turn time; timeout elapsed includes preflight/cleanup. Unfinished usage may be incomplete. '+r.get('error','Frozen mechanical case predicates.')})
 complete=all(r['outcome']!='not_run' for r in rows)
 candidate=[r for r in rows if r['condition']=='candidate']
 base['checks']=[check('candidate-source-regressions','passed' if all(r['outcome']=='passed' for r in candidate) else 'inconclusive','All candidate repeats must satisfy material facts, evidence boundaries and within-budget matching completion.'),
  check('scheduled-attempt-accounting','passed' if complete else 'inconclusive','All 24 scheduled slots retained; no hidden retries.'),
  check('claude-release-gate','blocked','Claude execution deliberately left blocked by the user.'),
  check('broad-release-gate','blocked','Cloud-browser, larger held-out/full-catalog and full-audit max-profile acceptance remain unproved.')]
 base['artifacts']=[evidence(n,'Minimized repair evidence') for n in ['source-max-repair-panel.json','source-max-repair-results.json']]
 write(out/'source-max-repair-evaluation-receipt.json',base)
 host=load(out/'followup-codex-host.json');host.update(artifact=identity('candidate'),target=target,documented_at=now,tested_at=now,
   capabilities={},documentation_sources=['docs/audit/source-max-repair.md'])
 exercise={'outcome':'passed' if all(r['outcome']=='passed' for r in candidate) else 'inconclusive',
           'reason':'Narrow explicit read-only source regression panel at max; no general host support claim.',
           'evidence':[evidence('source-max-repair-results.json','Frozen native source cases and all attempts.')]}
 host['capabilities']['focused_source_review']={'availability':'supported' if exercise['outcome']=='passed' else 'untested',
    'implementation':'Conditional supplied-source workflow, paired-name evidence and bounded helpers.','documented_version_range':None,
    'tested_versions':['0.170.0'],'test_case_ids':['AUD-007-SOURCE-MAX-REPAIR'],'exercise':exercise,
    'failure_behavior':'Preserve timeout/partial evidence; never raise budget or weaken policy to obtain a pass.',
    'documentation_sources':['docs/audit/source-max-repair.md']}
 host['claims']={k:copy.deepcopy(exercise) for k in ['format','discovery','functional','safety','support']}
 host['claims']['format']['reason']='Exact staged SKILL.md parsed; complete native entrypoint reads verified.'
 host['claims']['discovery']['reason']='Exactly one selected staged skill or zero in clean control; no global activation claim.'
 host['claims']['safety']['reason']='Narrow source cases retain false/null/null and private-marker omission; no universal enforcement claim.'
 host['claims']['support']={'outcome':'blocked','reason':'Claude, cloud browser and broader/current-candidate acceptance remain unproved.',
      'evidence':[evidence('source-max-repair-results.json','Bounded evidence scope, not full release qualification.')]}
 write(out/'source-max-repair-codex-host.json',host)
 print(json.dumps({'summary':summary,'scheduled_slots':len(rows),'runtime_files':len(panel['candidate_manifest'])}))

if __name__=='__main__':main()
