"""Minimize private acceptance evidence into public, identity-bound records."""
import argparse
import base64
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import platform

from grade_followup import digest, load, write, native_turn, usage


def stamp(epoch):
    return datetime.fromtimestamp(epoch, timezone.utc).isoformat()


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--workspace', type=Path, required=True)
    p.add_argument('--output', type=Path, required=True)
    a = p.parse_args()
    w, out = a.workspace, a.output
    now = datetime.now(timezone.utc).isoformat()
    panel = load(w / 'followup-medium-panel.json')
    comparison = load(out / 'followup-comparison.json')
    routing = load(out / 'followup-routing.json')
    manifest = lambda root: {str(f.relative_to(root)): digest(f) for f in sorted(root.rglob('*'))
                             if f.is_file() and 'node_modules' not in f.parts}
    current_manifest = manifest(w / 'candidate/skills/ai-friendly-audit')
    current_root = Path(__file__).resolve().parents[2] / 'ai-friendly-audit'
    assert current_manifest == manifest(current_root)
    assert current_manifest == manifest(w / 'medium/candidate/skills/ai-friendly-audit')
    previous_manifest = manifest(w / 'medium/previous/skills/ai-friendly-audit')
    assert len(current_manifest) == 43
    # This digest identifies a sorted file/hash map, not an archive/tar stream.
    manifest_hash = lambda m: hashlib.sha256(json.dumps(m, sort_keys=True).encode()).hexdigest()
    identity = {'artifact_id': 'ai-friendly-runtime-cbd3800', 'source_commit': panel['runtime_commit'],
                'package_sha256': manifest_hash(current_manifest),
                'activated_source': 'private disposable stage/skills/ai-friendly-audit/SKILL.md',
                'activated_sha256': current_manifest['SKILL.md'], 'missing_identity_reason': None}
    previous = dict(identity, artifact_id='ai-friendly-prototype-c2cc80e',
                    source_commit=panel['previous_commit'], package_sha256=manifest_hash(previous_manifest),
                    activated_sha256=previous_manifest['SKILL.md'])
    baseline = dict(identity, artifact_id='no-skill-control', source_commit=None,
                    package_sha256=manifest_hash({}), activated_source=None, activated_sha256=None)
    target = {'product': 'Codex CLI', 'surface': 'owned ephemeral app-server stdio threads',
              'distribution': 'private disposable project-scoped skills', 'version': '0.170.0',
              'os': platform.platform(), 'policy': {'sandbox': 'read-only', 'network': False,
              'approval': 'never', 'user_security_policy_retained': True, 'live_config_writes': False},
              'missing_details': ['Provider model build and monetary cost are not exposed.']}

    def evidence(name, scope):
        return {'kind': 'artifact', 'ref': 'docs/audit/' + name, 'sha256': digest(out / name),
                'observed_at': now, 'scope': scope}

    def check(name, outcome, file, reason):
        return {'id': name, 'outcome': outcome, 'reason': reason,
                'evidence': [evidence(file, reason)]}

    write(out / 'followup-panel.json', {'medium_frozen_panel': panel,
          'medium_frozen_panel_sha256': digest(w / 'followup-medium-panel.json'),
          'max_frozen_panel': load(w / 'followup-panel.json'),
          'max_frozen_panel_sha256': digest(w / 'followup-panel.json'),
          'candidate_manifest': current_manifest, 'candidate_manifest_sha256': manifest_hash(current_manifest),
          'previous_manifest_sha256': manifest_hash(previous_manifest),
          'manifest_digest_method': 'SHA-256 of UTF-8 json.dumps(sorted file/hash map, sort_keys=True)',
          'current_runtime_and_all_candidate_stages_match': True,
          'prior_release': {'available': False, 'git_tags': [], 'git_remotes': [],
                            'reason': 'Prior commit exists, but no prior tagged/published release is established.'},
          'isolation_preflight': load(w / 'verified-clean-config.json'),
          'common_policy': {'name': 'common user AGENTS.md security/routing policy',
                            'sha256': panel['common_policy_sha256'], 'target_skill_content': False},
          'extractor_note': 'Evaluator ran the named external extractor; native actors received its attributed output, not execution permission.'})

    # Lifecycle: independently recheck exact completion IDs and actual compaction.
    lf = w / 'private/lifecycle-v2'
    frozen = load(lf / 'frozen-panel.json')
    life = load(lf / 'results.json')
    tid = life[0]['thread_id']
    assert len(life) == 3 and len({r['turn_id'] for r in life}) == 3
    for i, row in enumerate(life):
        t = load(lf / ('turn-' + str(i + 1) + '.json'))
        es = native_turn(t['events'], tid, row['turn_id'])
        assert row['thread_id'] == tid
        assert any(e.get('method') == 'turn/completed' and e['params']['turn']['status'] == 'completed' for e in es)
        text = ' '.join(row['result']['facts']).lower()
        assert all(s in text for s in ['47', 'eur', 'monthly', 'quarterly', 'two', 'eea'])
        assert row['result']['run_token'] == frozen['token']
        assert row['result']['backend_record_checked'] is False
        assert row['result']['business_effect_verified'] is None
        assert row['result']['unintended_effect_count'] is None
        row['native_turn_sha256'] = digest(lf / ('turn-' + str(i + 1) + '.json'))
        row['usage'] = usage(es)
    compact = load(lf / 'actual-compaction.json')
    compact_items = [e for e in compact['events'] if e.get('method') == 'item/completed'
                     and e.get('params', {}).get('threadId') == tid
                     and e.get('params', {}).get('item', {}).get('type') == 'contextCompaction']
    assert len(compact_items) == 1 and life[1]['command_count'] == 0
    write(out / 'followup-lifecycle.json', {'outcome': 'passed', 'rows': life,
          'scope': 'Narrow same-thread retention and action-boundary smoke test, not full-audit continuation reliability.',
          'frozen_at': stamp(frozen['frozen_at_epoch']), 'frozen_panel_sha256': digest(lf / 'frozen-panel.json'),
          'native_compaction_completed': True, 'native_compaction_sha256': digest(lf / 'actual-compaction.json'),
          'raw_events_sha256': digest(lf / 'events.jsonl'),
          'reinvocation': 'Typed native SkillInput on turns 1 and 3; full exact SKILL.md read on turn 1; no command tools on turns 2 or 3.',
          'initial_sequence': 'Earlier broad audit sequence retained as invalid preflight: first timeout and old-turn completion matching defect.'})

    metadata = load(w / 'extractor/package-metadata.json')
    tar = w / 'extractor/readability-0.6.0.tgz'
    integrity = 'sha512-' + base64.b64encode(hashlib.sha512(tar.read_bytes()).digest()).decode()
    assert integrity == metadata['dist']['integrity']
    ex = load(w / 'medium/candidate/work/extractor-output.json')
    browser = load(out / 'followup-medium-browser.json')
    source = w / 'medium/candidate/work/extractor.html'
    assert ex['input_sha256'] == digest(source) == digest(w / 'fixtures/extractor-medium.html')
    txt = ex['result']['textContent']
    assert '41 CAD' in txt and 'six editors' not in txt and 'New Zealand' not in txt
    assert '43 CAD' in browser['observed']['price']
    write(out / 'followup-extractor.json', {'outcome': 'passed',
          'meaning': 'Actual extractor ran; deliberately seeded representation mismatch and qualifier loss were detected.',
          'name': 'Mozilla Readability', 'version': '0.6.0', 'parser': ex['parser'], 'options': ex['options'],
          'license': metadata['license'], 'package_url': metadata['dist']['tarball'],
          'package_sha256': digest(tar), 'registry_integrity': integrity, 'integrity_verified': True,
          'source_hashes': {n: digest(w / 'extractor/package' / n) for n in ['Readability.js', 'JSDOMParser.js', 'package.json']},
          'input_sha256': digest(source), 'output_sha256': digest(w / 'medium/candidate/work/extractor-output.json'),
          'observed': {'initial_price': '41 CAD per editor per month', 'extracted_price': '41 CAD per editor per month',
                       'rendered_price': browser['observed']['price'], 'source_footer': browser['observed']['footer'],
                       'extracted_footer_qualifiers_present': False, 'terms_link_preserved': 'https://example.test/terms' in ex['result']['content']},
          'execution_boundary': 'Private evaluator-only download/extraction; integrity and source reviewed; no lifecycle scripts or project dependency changes. Parser executes no scripts/network.',
          'browser': browser, 'primary_documentation': 'https://github.com/mozilla/readability',
          'limits': ['One author-written synthetic page; parser choice and extraction heuristics limit generalization.',
                     'Native actors compared provided observations; their own outputs are not fresh browser/extractor runs.']})

    # Every scheduled slot is retained, including interrupted/unstarted max slots.
    ledger = []
    for profile in ['max', 'medium']:
        for condition in ['baseline', 'candidate', 'previous']:
            folder = w / 'private' / ('followup-' + (profile + '-' if profile == 'medium' else '') + condition)
            es = [json.loads(line) for line in (folder / 'events.jsonl').read_text().splitlines()]
            stored = {r['label']: r for r in load(folder / 'results.json')}
            reps = 1 if condition == 'previous' else 2
            labels = [case + '-' + str(rep) for rep in range(1, reps + 1)
                      for case in (['price','semantics','review','expired','timing','extractor'] if rep == 1 else ['extractor','timing','expired','review','semantics','price'])]
            if condition == 'candidate':
                labels += ['routing-' + case + '-' + str(rep) for rep in [1,2]
                           for case in ['positive-price','positive-form','negative-coding','negative-concept']]
            for label in labels:
                r = stored.get(label)
                start_file = folder / (label + '-start.json')
                # Routing starts were not separately written; completed result binds their thread.
                thread = r.get('thread_id') if r else load(start_file)['thread']['id'] if start_file.exists() else None
                begins = [e for e in es if e.get('method') == 'turn/started' and e.get('params', {}).get('threadId') == thread]
                begin = begins[0] if begins else None
                turn = begin['params']['turn']['id'] if begin else None
                selected = native_turn(es, thread, turn) if turn else []
                native_done = [e for e in selected if e.get('method') == 'turn/completed']
                state = ('observer_timeout' if r and 'error' in r else 'completed' if r
                         else 'interrupted' if begin else 'not_run')
                ledger.append({'profile': profile, 'condition': condition, 'label': label,
                      'state': state, 'thread_id': thread, 'turn_id': turn,
                      'started_at': stamp(begin['emittedAtMs']/1000) if begin else None,
                      'last_observed_at': stamp(max(e.get('emittedAtMs',begin['emittedAtMs']) for e in selected)/1000) if begin else None,
                      'observer_elapsed_seconds': r.get('elapsed_seconds') if r else None,
                      'native_late_completion_present': bool(native_done) if state == 'observer_timeout' else None,
                      'usage': usage(selected), 'cost_usd': None,
                      'raw_events_sha256': digest(folder / 'events.jsonl'),
                      'comparative_scoring': 'qualified medium panel' if profile == 'medium' else 'excluded: default max budget failure; no matched complete panel'})
    lifecycle_attempts = []
    for name in ['followup-continuation','lifecycle-v2']:
        es = [json.loads(line) for line in (w / 'private' / name / 'events.jsonl').read_text().splitlines()]
        begins = [e for e in es if e.get('method') == 'turn/started']
        for index, begin in enumerate(begins):
            thread, turn = begin['params']['threadId'], begin['params']['turn']['id']
            selected = native_turn(es, thread, turn)
            compact_items_for_turn = [e['params']['item'] for e in selected if e.get('method')=='item/completed'
                                      and e.get('params',{}).get('item',{}).get('type')=='contextCompaction']
            lifecycle_attempts.append({'sequence':name, 'index':index+1,'thread_id':thread,'turn_id':turn,
                'operation':'contextCompaction' if compact_items_for_turn else 'agentTurn',
                'compaction_elapsed_seconds':(compact_items_for_turn[0]['completedAtMs']-compact_items_for_turn[0]['startedAtMs'])/1000 if compact_items_for_turn else None,
                'started_at':stamp(begin['emittedAtMs']/1000),
                'last_observed_at':stamp(max(e.get('emittedAtMs',begin['emittedAtMs']) for e in selected)/1000),
                'usage':usage(selected),'cost_usd':None,
                'outcome':'passed' if name=='lifecycle-v2' else 'inconclusive',
                'raw_sha256':digest(w/'private'/name/'events.jsonl')})
    write(out / 'followup-attempt-ledger.json', {'slots': ledger, 'lifecycle_attempts':lifecycle_attempts,
          'counts': {profile: dict(Counter(r['state'] for r in ledger if r['profile'] == profile)) for profile in ['max','medium']},
          'setup_probes': [{'name': f.stem, 'raw_sha256': digest(f), 'model_inference': False}
                           for f in sorted((w / 'private').glob('*.jsonl'))],
          'setup_corrections': ['Unsupported app-server --ignore-user-config option retained as setup failure.',
              'Empty override tables and skip_host_skill_discovery did not eliminate inherited integrations.',
              'Explicit skill-path disabling and transport-specific disabled MCP stubs verified clean control.',
              'EOF handling and reader buffering corrected before scored medium inference.',
              'Initial broad lifecycle timeout plus unsafe thread-only completion matching excluded; exact-turn regression added.',
              'Initial extractor meta syntax warning corrected before panel freeze.',
              'Max batch stopped after repeated 180-second observer timeouts. Owned process groups terminated; late completions not credited.'],
          'initial_lifecycle': {'outcome': 'inconclusive', 'reason': 'Invalid preflight, not a passing continuation test.',
              'raw_events_sha256': digest(w / 'private/followup-continuation/events.jsonl'),
              'recorded_turns': len(load(w / 'private/followup-continuation/results.json'))},
          'corrected_lifecycle_turns': 3,
          'retention': 'All raw provider events remain private. No failed/unrun slot was removed. No Claude calls.'})

    metric = lambda value, unit='tokens': {'value': value, 'unit': unit,
              'source': 'measured' if value is not None else 'unknown',
              'missing_reason': None if value is not None else 'Not exposed or no completed observation; never inferred.'}
    def claim(outcome, file, reason):
        return {'outcome': outcome, 'reason': reason, 'evidence': [evidence(file, reason)]}

    host = {'schema_version':'2.0', 'record_type':'host-capabilities',
            'format':'project-specific capability record; not native host config',
            'target':target, 'artifact':identity, 'documented_at':now, 'tested_at':now,
            'capabilities':{}, 'claims':{},
            'maintenance':{'commitment':'none','version_range':None,'owner':None,'repair_guide':None},
            'documentation_sources':['docs/audit/nonclaude-followup.md']}
    for name, outcome, file, reason in [
        ('clean_no_skill_control','passed','followup-comparison.json','Native catalog: zero enabled baseline skills; identical model, effort, policy, inputs and sandbox.'),
        ('same_thread_compaction','passed','followup-lifecycle.json','Three exact turn identities in one thread; completed contextCompaction item; retained nonce, conditions and evidence boundary.'),
        ('isolated_catalog_routing','passed','followup-routing.json','Actual complete exact entrypoint reads determine activation; limited panel, not broad routing support.'),
        ('full_default_profile_audit','inconclusive','followup-attempt-ledger.json','Max profile repeatedly exceeded the declared observer budget; complete matched evidence unavailable.')]:
        host['capabilities'][name]={'availability':'supported' if outcome=='passed' else 'untested',
            'implementation':'Observed native app-server events; no live installation.',
            'documented_version_range':None,'tested_versions':['0.170.0'],'test_case_ids':['AUD-007-NONCLAUDE'],
            'exercise':claim(outcome,file,reason),'failure_behavior':'Retain failed/unknown states; do not infer full support.',
            'documentation_sources':['docs/audit/nonclaude-followup.md']}
    host['claims']={k:claim(v,f,r) for k,v,f,r in [
        ('format','passed','followup-panel.json','Native parser accepted the exact staged entrypoint.'),
        ('discovery','passed','followup-comparison.json','Verified absent baseline and exactly one enabled candidate/prototype skill.'),
        ('functional','inconclusive','followup-comparison.json','Complete qualified comparison includes omissions; no general benefit or full task-reliability pass.'),
        ('safety','passed','followup-lifecycle.json','Narrow lifecycle preserves permissions and false/null/null effects; no universal safety claim.'),
        ('support','blocked','followup-attempt-ledger.json','Claude left blocked; no cloud-browser execution surface; broader reliability and max-profile limits remain.') ]}
    write(out / 'followup-codex-host.json', host)
    attempts = []
    for row in ledger:
        if row['state'] == 'not_run':
            continue
        matched = next((r for r in comparison['conditions'][row['condition']] if r['label']==row['label']), None)
        routed = next((r for r in routing['trials'] if r['label']==row['label']), None)
        evaluated = matched or routed
        outcome = (matched['outcome'] if matched else ('passed' if routed['activated']==routed['expected'] else 'failed')
                   if routed and routed['activated'] is not None else 'inconclusive') if row['profile']=='medium' else 'inconclusive'
        checks = [check(k,'passed' if v else 'failed','followup-comparison.json',k)
                  for k,v in (evaluated or {}).get('checks',{}).items()] if row['profile']=='medium' else []
        if routed and row['profile']=='medium':
            checks = [check('activation_matches_label',outcome,'followup-routing.json','Exact full-read activation matched to frozen intent label.')]
        u = row['usage'] or {}
        attempts.append({'attempt_id':row['profile']+'-'+row['condition']+'-'+row['label'],
          'case_id':'AUD-007-NONCLAUDE', 'condition':'no_skill' if row['condition']=='baseline' else row['condition'],
          'started_at':row['started_at'], 'ended_at':row['last_observed_at'],
          'artifact':baseline if row['condition']=='baseline' else previous if row['condition']=='previous' else identity,
          'target':dict(target, policy=dict(target['policy'],reasoning_effort=row['profile'])),
          'model':{'name':'gpt-6.1-sol','version':None,'missing_reason':'Model build not exposed; model name and reasoning setting observed in native thread/start.'},
          'input_hashes':{'panel':digest(w / ('followup-medium-panel.json' if row['profile']=='medium' else 'followup-panel.json'))},
          'permissions':{'network':False,'file_edits':False,'external_effects':False,'other_agents':False},
          'outcome':outcome,'checks':checks,'evidence':[evidence('followup-attempt-ledger.json',row['state'])],
          'elapsed':metric(row['observer_elapsed_seconds'],'seconds'),
          'usage':{'input_tokens':metric(u.get('inputTokens')),'output_tokens':metric(u.get('outputTokens')),
                   'tool_calls':metric((evaluated or {}).get('command_count') if row['profile']=='medium' else None,'completed command items'),
                   'cost':metric(None,'USD')},
          'reason':'Mechanical locator outcome; independently retained semantic adjudication may identify wording false negatives. Max attempts excluded from comparison; times are observation windows, not causal speed estimates.'})
    for row in lifecycle_attempts:
        u = row['usage'] or {}
        life_record = next((r for r in life if r['turn_id']==row['turn_id']),None)
        checks = [check('exact-lifecycle-retention','passed','followup-lifecycle.json',
                        'Distinct matching turn IDs, retained original facts/token and false/null/null effects.')] if row['outcome']=='passed' else []
        attempts.append({'attempt_id':row['sequence']+'-'+str(row['index']), 'case_id':'AUD-007-NONCLAUDE',
            'condition':'candidate','started_at':row['started_at'],'ended_at':row['last_observed_at'],
            'artifact':identity,'target':target,
            'model':{'name':'gpt-6.1-sol','version':None,'missing_reason':'Native observed model name; provider build not exposed.'},
            'input_hashes':{'lifecycle_panel':digest(lf/'frozen-panel.json')} if row['outcome']=='passed' else {'max_panel':digest(w/'followup-panel.json')},
            'permissions':{'network':False,'file_edits':False,'external_effects':False,'other_agents':False},
            'outcome':row['outcome'],'checks':checks,'evidence':[evidence('followup-attempt-ledger.json','Lifecycle attempt retained with native identities and raw hash.')],
            'elapsed':metric(life_record['elapsed_seconds'] if life_record else row['compaction_elapsed_seconds'],'seconds'),
            'usage':{'input_tokens':metric(u.get('inputTokens')),'output_tokens':metric(u.get('outputTokens')),
                     'tool_calls':metric(life_record['command_count'] if life_record else None,'completed command items'),
                     'cost':metric(None,'USD')},
            'reason':row['operation']+'. Native same-thread usage totals are cumulative provider snapshots, not additive per-turn estimates. Initial broad sequence excluded due timeout and obsolete completion matching.'})
    write(out / 'followup-evaluation-receipt.json', {'schema_version':'2.0','record_type':'evaluation-receipt',
      'case_id':'AUD-007-NONCLAUDE','recorded_at':now,'artifact':identity,
      'panel':{'id':'qualified-medium-and-retained-max','sha256':digest(out/'followup-panel.json'),
               'acceptance_frozen_at':panel['frozen_at'],'retry_policy':'Zero retries within either profile; separately frozen fresh medium profile after retained max timeouts.',
               'exclusion_policy':'Max attempts and initial broad lifecycle excluded from qualified comparison; all remain in ledger. Unrun slots not passes.',
               'control_identity':{'kind':'no_skill','artifact':baseline,'isolation':panel['isolation'],
                                   'reason':'All unrelated skills disabled; common security policy retained. This routing catalog is intentionally isolated.'}},
      'budget':{'max_attempts':84,'max_elapsed_seconds':None,'max_cost':None,'currency':None,
                'enforcement':'Accounting bound: 38 max slots + 38 medium slots + two planned three-turn/one-compaction sequences. Per-panel budgets frozen separately: 180 seconds per audit/routing observer window, zero retries; corrected lifecycle240/compaction180. Initial max wrapper allowed late completions before correction; owned processes stopped and late completions excluded.'},
      'runtime_versions':{'codex':'0.170.0','model':'gpt-6.1-sol','reasoning_profiles':'max; medium','readability':'0.6.0'},
      'attempts':attempts,'elapsed':metric(None,'seconds'),
      'usage':{k:metric(None,'USD' if k=='cost' else 'tokens' if k.endswith('tokens') else 'calls') for k in ['input_tokens','output_tokens','tool_calls','cost']},
      'outcome':'blocked','checks':[
          check('clean-control','passed','followup-comparison.json','Zero enabled baseline skills and all MCP integrations disabled; preserved common security policy.'),
          check('same-thread-compaction','passed','followup-lifecycle.json','Actual native compaction and three matching distinct turns retained facts and boundaries.'),
          check('external-extractor','passed','followup-extractor.json','Named external engine executed; seeded loss and price difference independently observed.'),
          check('default-max-budget','inconclusive','followup-attempt-ledger.json','Repeated observer timeouts; no default max-profile reliability claim.'),
          check('claude','blocked','native-discovery.json','User explicitly left Claude execution blocked; no further calls.'),
          check('cloud-browser','blocked','followup-environment.json','No executable cloud-browser surface available; local extractor/browser does not substitute.')],
      'artifacts':[evidence(n,'Minimized native follow-up evidence') for n in ['followup-panel.json','followup-comparison.json','followup-adjudication.json','followup-routing.json','followup-lifecycle.json','followup-extractor.json','followup-attempt-ledger.json','followup-environment.json']],
      'grader':{'id':'native-followup-exact-events-and-facts','version':'1.0','sha256':digest(Path(__file__).with_name('grade_followup.py')),
                'method':'deterministic','calibration':'Frozen material-fact and evidence-boundary requirements; conservative patterns implemented after observations, with positive/adverse regression controls. Not blinded/precommitted grading; semantic adjudication retained separately, no score optimization.'},
      'omissions':['Claude execution remains blocked at user direction.','No real cloud-browser surface; no cloud session test.',
                   'No prior established release: earlier commit is a prototype comparison.',
                   'Four isolated-catalog routing intents and six execution intents do not establish broad reliability.',
                   'Lifecycle smoke test is intentionally narrower than continuing a full audit.',
                   'Raw events private; all planned max/medium slots and setup probes retain hashes. Cost and separate activated-context tokens unknown.'],
      'redaction':'Only synthetic fixtures; no account/auth/config values, raw command output, profiles or browser cookies published.'})
    print(json.dumps({'native_attempts_in_receipt':len(attempts),'ledger_slots':len(ledger),
                      'runtime_files':len(current_manifest),'lifecycle':'passed','extractor':'passed'}))


if __name__ == '__main__':
    main()
