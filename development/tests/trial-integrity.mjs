import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=process.env.AFF_PACKAGE_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../ai-friendly-audit');
const {validateAudit,calculateCoverage}=await import(pathToFileURL(path.join(root,'scripts/lib/validation.mjs')));
const {renderReport}=await import(pathToFileURL(path.join(root,'scripts/lib/report.mjs')));
const empty=JSON.parse(fs.readFileSync(new URL('../fixtures/empty-audit.json',import.meta.url)));

function fixture() {
  const a=structuredClone(empty);
  a.run.mode='limited-browser';a.run.status='completed';a.run.completed_at='2026-11-22T23:01:00Z';
  a.scope.planned_states=['state-start','state-review'];
  a.states=a.scope.planned_states.map(id=>({id,url:'https://example.com/review',origin:'https://example.com',captured_at:'2026-11-22T23:00:00Z',session_scope:'observed_anonymously',viewport:{width:1280,height:800},representation:'fixture_keyboard_observation',baseline:true,notes:['Synthetic validator fixture; not a live browser result.']}));
  a.capabilities.capabilities.keyboard_input={status:'available',reason:'Synthetic capability declaration for validator tests.'};
  a.evidence=[{id:'event-1',run_id:a.run.id,state_id:'state-review',timestamp:'2026-11-22T23:00:30Z',sequence:0,channel:'task_event',representation:'fixture_task_trace',evidence_scope:'frontend_verifiable',test_context:'controlled_fixture',sanitized_url:'https://example.com/review',sanitized:true,sanitization:{method:'Synthetic fixture',reviewed:true,limitations:[]},collector:{name:'fixture',version:'1.0.0'},artifact_path:null,sha256:null,summary:'Fixture trace records keyboard traversal to review with no commit action.',limitations:['Synthetic validation input, not an actual website observation.']}];
  const obs=()=>({status:'passed',description:'Synthetic frontend observation for schema and reference validation.',evidence_ids:['event-1']});
  a.journeys=[{schema_version:'1.0.0',id:'journey-1',trial_number:1,started_at:'2026-11-22T23:00:00Z',completed_at:'2026-11-22T23:01:00Z',guide_revision:'2.0',guide_sections:['2.1','11.4'],guide_goal:'operate',profile:'browser-operability',test_context:'controlled_fixture',skill_host:{product:'fixture-validator',product_version:'1.0.0',model:'not_exposed',skill_version:'1.0.0'},tested_agent:{product:'fixture-validator',product_version:'1.0.0',model:'not_exposed',relationship_to_skill_host:'same_actor'},execution:{conversation_surface:'cli',execution_location:'local',mode:'fixture',interaction_mode:'keyboard',browser_version:'not_exposed',provider_or_profile:'fixture',adapter_version:'1.0.0',capability_manifest_id:a.capabilities.id,prior_diagnostic_assistance:false},session:{status:'anonymous',credential_exported:false},environment:{locale:'en-US',timezone:'America/Los_Angeles',currency:'USD',viewport:{width:1280,height:800}},task:{prompt:'Reach review and stop before booking.',prompt_redacted:false,starting_state_id:'state-start',frontend_success_conditions:['Review details are reached without a booking-submit event.'],action_boundary:'stop_before_booking',consequential_commit_permitted:false,fixture_id:'synthetic-validation-input',reset_method:'recreate_fixture',fault_injection:'none',budget:{max_actions:10,max_seconds:60}},observations:{access:obs(),comprehension:obs(),execution:obs(),correctness:obs()},verification:{layer:'frontend',backend_record_checked:false,business_effect_verified:null,unintended_effect_count:null,evidence_ids:['event-1']},outcome:{execution:'frontend_complete',goal_conditions_met:true,completion_scope:'review_step',business_effect_outcome:'not_attempted',observed_effect_issues:[],intervention_count:0,recovery_count:0,blocked_by:null,stop_reason:null,final_state_id:'state-review'}}];
  a.verdicts=[{profile:'browser-operability',verdict:'demonstrated_for_tested_scope',summary:'Synthetic validator input only.',evidence_ids:['event-1'],journey_ids:['journey-1'],limitations:['Not a real browser run.']}];
  a.coverage=calculateCoverage(a);
  return a;
}
test('a coherent scoped frontend trial and companion validate',async()=>{
  const a=fixture();
  assert.deepEqual(await validateAudit(a),[]);
  const {id,...rest}=structuredClone(a.journeys[0]);
  a.compatibility_tests=[{...rest,test_id:'test-1',journey_id:id,documented_support:[]}];
  assert.deepEqual(await validateAudit(a),[]);
});
test('changing a declared interaction mode cannot borrow another mode’s success',async()=>{
  const a=fixture();a.journeys[0].execution.interaction_mode='visual';
  const errors=await validateAudit(a);assert.ok(errors.length>0);assert.ok(errors.some(e=>/visual|screenshot/i.test(e)));
});
test('contradictory compatibility companion outcomes are rejected',async()=>{
  const a=fixture();const {id,...rest}=structuredClone(a.journeys[0]);
  a.compatibility_tests=[{...rest,test_id:'test-1',journey_id:id,documented_support:[]}];
  a.compatibility_tests[0].outcome.execution='unresolved';a.compatibility_tests[0].outcome.goal_conditions_met=null;
  const errors=await validateAudit(a);assert.ok(errors.some(e=>/companion|differ|match|outcome/i.test(e)));
});
test('material error survives recovery and excludes a positive profile verdict',async()=>{
  const a=fixture();const j=a.journeys[0];j.outcome.execution='observed_incorrect_result_or_effect';
  j.outcome.observed_effect_issues=[{id:'issue-1',observed_at:'2026-11-22T23:00:20Z',description:'Synthetic wrong-target effect.',material:true,unauthorized_action:false,rationale:'The declared target was different.',evidence_ids:['event-1']}];
  j.outcome.recovery_count=1;a.coverage=calculateCoverage(a);
  assert.equal(a.coverage.successful_trials,0);assert.equal(a.coverage.material_error_trials,1);
  assert.ok((await validateAudit(a)).some(e=>/positive|successful|material/i.test(e)));
  a.verdicts[0].verdict='observed_material_error';assert.deepEqual(await validateAudit(a),[]);
});
test('human reports retain fact values, qualifiers, trial errors and honest no-trial wording',()=>{
  const a=fixture();
  a.representation_comparisons=[{id:'comparison-1',fact_id:'monthly-price',profile:'public-retrieval',material_qualifiers:['Per user, billed monthly; U.S. accounts only.'],availability:'partial',mismatch_type:'unknown',observations:[{state_id:'state-review',representation:'supplied_initial_html',observed_value:'29 USD per month',captured_at:'2026-11-22T23:00:00Z',evidence_ids:['event-1']}],evidence_ids:['event-1'],limitations:['No actual extractor output was observed.']}];
  a.journeys[0].outcome.observed_effect_issues=[{id:'issue-1',observed_at:'2026-11-22T23:00:20Z',description:'Wrong target selected at the consequential boundary.',material:true,unauthorized_action:false,rationale:'The declared task requires a different record.',evidence_ids:['event-1']}];
  a.journeys[0].outcome.execution='observed_incorrect_result_or_effect';
  a.verdicts[0].verdict='observed_material_error';a.coverage=calculateCoverage(a);
  const report=renderReport(a);
  for(const text of ['29 USD per month','Per user, billed monthly','Wrong target selected','requires a different record','Comprehension','applicable-guide denominator']) {
    assert.ok(report.toLowerCase().includes(text.toLowerCase()),text);
  }
  const unrun=renderReport(empty);assert.ok(unrun.includes('No actual task trials were recorded'));assert.ok(!unrun.includes('0/0'));
});
