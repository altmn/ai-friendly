import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath, pathToFileURL} from 'node:url';
const root = process.env.AFF_PACKAGE_ROOT ?? fileURLToPath(new URL('../../ai-friendly-audit/', import.meta.url));
const mod = n => import(pathToFileURL(path.join(root, `scripts/lib/${n}.mjs`)));
const {newAudit,makeGuideCoverage} = await mod('model');
const {readCatalog,parseJson} = await mod('io');
const {validateAudit,calculateCoverage,schemaErrors} = await mod('validation');
const {performCollection} = await mod('collect');
const {renderReport} = await mod('report');
const run = promisify(execFile);
const catalog = await readCatalog();
const channels = {screenshots:'screenshot',computed_accessibility_tree:'browser_ax',aria_snapshot:'aria_snapshot',rendered_dom:'dom',original_source:'source',actual_extractor_output:'extractor',initial_response:'http_response',keyboard_input:'task_event',pointer_input:'task_event',navigation:'task_event',locale_observation:'observation',webmcp_inspection:'tool_declaration',open_shadow_roots:'observation'};
async function fixture(id, variant) {
  const a = await newAudit('https://example.com/');
  const state = a.scope.planned_states[0];
  a.states.push({id:state,url:'https://example.com/',origin:'https://example.com',captured_at:a.run.started_at,session_scope:'observed_anonymously',viewport:{width:null,height:null},representation:'synthetic_fixture',baseline:true,notes:['Synthetic record only.']});
  const rule = catalog.rules.find(r=>r.id===id);
  const c = a.checks.find(c=>c.rule_id===id);
  Object.assign(c,{state_id:state,outcome:'passed',reason_code:null,observed:'Synthetic bounded observation.'});
  if (variant) Object.assign(c,{evidence_variant:variant.id,adaptation:{scope:variant.scope,limitations:['Synthetic evidence; no native behavior verified.'],adequacy_reviewed:true}});
  for (const cap of variant?.required_capabilities ?? rule.required_capabilities) {
    a.capabilities.capabilities[cap]={status:'available',reason:'Synthetic capability.'};
    if (channels[cap]) add(a,c,channels[cap]);
  }
  if (!c.evidence_ids.length) add(a,c,'owner_supplied');
  sync(a);return {a,c};
}
function add(a,c,channel,data={}) {
  const id=`ev-${a.evidence.length}`;
  a.evidence.push({id,run_id:a.run.id,state_id:c.state_id,timestamp:a.run.started_at,sequence:a.evidence.length,channel,representation:'synthetic_fixture',evidence_scope:'frontend_verifiable',test_context:a.run.test_context,sanitized_url:'https://example.com/',sanitized:true,sanitization:{method:'Synthetic fixture',reviewed:true,limitations:[]},collector:a.run.collector,artifact_path:null,sha256:null,summary:'Synthetic fixture evidence.',limitations:[],observed_data:data});
  c.evidence_ids.push(id);return id;
}
function sync(a) {a.guide_coverage=makeGuideCoverage(catalog,a.checks,a.owner_verification);a.coverage=calculateCoverage(a);}
async function errors(a) {a.coverage=calculateCoverage(a);return validateAudit(a);}

test('AUD-001: other-state semantic channels cannot establish a current-state pass',async()=>{
  const {a,c}=await fixture('AFF-SEM-001');
  assert.deepEqual(await errors(a),[]);
  a.states.push({...a.states[0],id:'other'});
  a.evidence.forEach(e=>e.state_id='other');add(a,c,'http_response');
  assert.ok((await errors(a)).some(e=>e.includes('corresponding evidence')));
});
test('AUD-002: evaluated guide exclusion and omitted owner cannot validate',async()=>{
  const {a}=await fixture('AFF-FORM-004');assert.deepEqual(await errors(a),[]);
  const row=a.guide_coverage.find(g=>g.checklist_id==='G-A04');
  Object.assign(row,{applicability:'inapplicable',disposition:'inapplicable',check_ids:[],owner_verification_ids:[]});
  a.owner_verification=a.owner_verification.filter(o=>o.id!=='OWN-SECURITY-001');
  assert.ok((await errors(a)).some(e=>e.includes('evaluated mapped checks')));
});
test('AUD-002: required owner cannot disappear through contradictory applicability',async()=>{
  const a=await newAudit('https://example.com/');
  const row=a.guide_coverage.find(g=>g.checklist_id==='G-A10');row.applicability='applicable';row.disposition='owner_verification_required';
  const owner=a.owner_verification.find(o=>o.id==='OWN-AUTH-001');owner.applicability='inapplicable';
  assert.ok((await errors(a)).some(e=>e.includes('cannot be inapplicable')));
  owner.applicability='unknown';assert.deepEqual(await errors(a),[]);
  assert.ok(a.coverage.owner_verification_required_count > 0);
  const ev=add(a,a.checks[0],'observation');
  owner.applicability='inapplicable';owner.conditional_exclusion={reason:'Synthetic inspected scope excludes this conditional guarantee.',evidence_ids:[ev],adequacy_reviewed:true};
  assert.deepEqual(await errors(a),[]);
  owner.conditional_exclusion.evidence_ids=['missing'];assert.ok((await errors(a)).some(e=>e.includes('Unresolved')));
});
test('AUD-003: standalone JSON validates, incomplete bundle identifies each missing file',async()=>{
  const work=await fs.mkdtemp(path.join(os.tmpdir(),'aff-bundle-'));
  try {
    const a=await newAudit('https://example.com/');await fs.writeFile(path.join(work,'audit.json'),JSON.stringify(a));
    await run(process.execPath,[path.join(root,'scripts/audit.mjs'),'validate','--input',path.join(work,'audit.json')]);
    await assert.rejects(run(process.execPath,[path.join(root,'scripts/audit.mjs'),'validate','--input',work]),e=>e.code===1 && ['audit-report.md','evidence-index.json','remediation-plan.md','owner-verification.md','compatibility-tests.json'].every(n=>e.stderr.includes(n)));
  } finally {await fs.rm(work,{recursive:true,force:true});}
});
test('AUD-004: compressed 429 retains status and Retry-After, never body/cookies or static passes',async()=>{
  const server=http.createServer((req,res)=>{res.writeHead(429,{'content-encoding':'gzip','retry-after':'60','set-cookie':'session=DO_NOT_SAVE'});res.end('DO_NOT_SAVE_BODY');});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try {
    const a=await performCollection(`http://127.0.0.1:${server.address().port}/`,{fixture:true});
    assert.deepEqual(await errors(a),[]);
    const response=a.evidence.find(e=>e.channel==='http_response');
    assert.equal(response.observed_data.status,429);assert.equal(response.observed_data.headers['retry-after'],'60');
    assert.equal(a.capabilities.capabilities.network_egress.status,'available');assert.equal(a.checks.some(c=>c.outcome==='passed'),false);
    assert.ok(a.checks.every(c=>c.reason_code==='site_access_barrier'));assert.ok(!JSON.stringify(a).includes('DO_NOT_SAVE'));
  } finally {await new Promise(r=>server.close(r));}
});
test('AUD-005: catalog with optional variants validates offline',async()=>assert.deepEqual(await schemaErrors(catalog,'rule-catalog'),[]));
for (const r of catalog.rules) for (const v of r.evidence_variants ?? []) {
  test(`AUD-005: ${r.id}/${v.id} requires explicit scoped review and its actual evidence`,async()=>{
    const {a,c}=await fixture(r.id,v);
    if (r.id==='AFF-STATE-001') {
      const before=add(a,c,'aria_snapshot');const after=add(a,c,'aria_snapshot');
      add(a,c,'task_event',{execution_trace:{kind:'state_transition',authorized:true,action:'Toggle synthetic control',before_evidence_ids:[before],after_evidence_ids:[after]}});
    }
    assert.deepEqual(await errors(a),[]);
    assert.ok(renderReport(a).includes(v.id));
    delete c.adaptation;assert.ok((await errors(a)).length>0);
    c.adaptation={scope:v.scope,limitations:['Scoped fixture'],adequacy_reviewed:true};
    if (v.required_capabilities.length) {a.capabilities.capabilities[v.required_capabilities[0]].status='unsupported';assert.ok((await errors(a)).some(e=>e.includes('required capability')));}
  });
}
test('AUD-006: nested and escaped duplicate keys fail; sibling keys and string syntax survive',()=>{
  for(const text of ['{"outcome":"failed","outcome":"passed"}','{"a":[{"k":1,"\\u006b":2}]}']) assert.throws(()=>parseJson(text),/Duplicate/);
  const value={a:[{k:1},{k:2}],syntax:'escaped " } [ : , \\ text'};assert.deepEqual(parseJson(JSON.stringify(value)),value);
  assert.throws(()=>parseJson('{bad json}'));
});
for (const [id,kind] of [['AFF-TOOL-003','tool_invocation'],['AFF-STATE-001','state_transition']]) {
  test(`AUD-008: ${id} rejects static evidence, unauthorized and incomplete traces`,async()=>{
    const {a,c}=await fixture(id);assert.ok((await errors(a)).some(e=>e.includes('execution trace')));
    const before=add(a,c,'screenshot'),after=add(a,c,'screenshot');
    const trace={kind,authorized:true,action:'Synthetic safe action',result:{selection:'sample'},before_evidence_ids:[before],after_evidence_ids:[after]};
    add(a,c,'task_event',{execution_trace:trace});assert.deepEqual(await errors(a),[]);
    trace.authorized=false;assert.ok((await errors(a)).some(e=>e.includes('execution trace')));trace.authorized=true;
    trace.after_evidence_ids=['nonexistent'];assert.ok((await errors(a)).some(e=>e.includes('execution trace')));
  });
}
