import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = process.env.AFF_PACKAGE_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../ai-friendly-audit');
const require = createRequire(path.join(root, 'package.json'));
const Ajv = require('ajv/dist/2020.js');
const addFormats = require('ajv-formats');
const ajv = new Ajv({ allErrors: true, strict: true, strictTypes: false, strictRequired: false });
addFormats(ajv);
const schemas = path.join(root, 'assets/schemas');
for (const file of fs.readdirSync(schemas).filter(f => f.endsWith('.json'))) ajv.addSchema(JSON.parse(fs.readFileSync(path.join(schemas,file))));
const validate = (name, value) => {
  const fn = ajv.getSchema(`https://ai-friendly-audit.invalid/schemas/${name}.schema.json`);
  return {valid:fn(value), errors:fn.errors};
};
const empty = JSON.parse(fs.readFileSync(new URL('../fixtures/empty-audit.json', import.meta.url)));
const verification = {layer:'frontend',backend_record_checked:false,business_effect_verified:null,unintended_effect_count:null,evidence_ids:[]};
const outcome = {execution:'frontend_complete',goal_conditions_met:true,completion_scope:'review_step',business_effect_outcome:'not_attempted',observed_effect_issues:[],intervention_count:0,recovery_count:0,blocked_by:null,stop_reason:null,final_state_id:'state-review'};
const common = n => ajv.getSchema(`https://ai-friendly-audit.invalid/schemas/common.schema.json#/$defs/${n}`);

test('every distributed schema compiles offline and initialized report validates', () => {
  for (const file of fs.readdirSync(schemas).filter(f => f.endsWith('.json'))) assert.ok(ajv.getSchema(`https://ai-friendly-audit.invalid/schemas/${file}`));
  assert.equal(validate('report', empty).valid, true);
});
test('frontend verification cannot claim backend checking or replace unknown effects with zero', () => {
  assert.equal(common('verification')(verification), true);
  assert.equal(common('verification')({...verification,backend_record_checked:true}), false);
  assert.equal(common('verification')({...verification,unintended_effect_count:0}), false);
  assert.equal(common('verification')({...verification,business_effect_verified:false}), false);
});
test('material incorrect effect remains unsuccessful despite a later achieved goal', () => {
  const issue={id:'effect-1',observed_at:'2026-11-22T23:00:00Z',description:'Wrong target visibly selected at the consequential boundary.',material:true,unauthorized_action:false,rationale:'The declared task requires the other target.',evidence_ids:['ev-1']};
  assert.equal(common('outcome')({...outcome,observed_effect_issues:[issue]}), false);
  assert.equal(common('outcome')({...outcome,execution:'observed_incorrect_result_or_effect',observed_effect_issues:[issue]}), true);
});
test('unauthorized action remains unsuccessful even when not otherwise marked material', () => {
  const issue={id:'effect-1',observed_at:'2026-11-22T23:00:00Z',description:'An unapproved action occurred.',material:false,unauthorized_action:true,rationale:'The action exceeded the declared boundary.',evidence_ids:['ev-1']};
  assert.equal(common('outcome')({...outcome,observed_effect_issues:[issue]}), false);
});
test('successful outcomes require observed goal satisfaction and correct intervention count', () => {
  assert.equal(common('outcome')(outcome), true);
  assert.equal(common('outcome')({...outcome,goal_conditions_met:null}), false);
  assert.equal(common('outcome')({...outcome,intervention_count:1}), false);
  assert.equal(common('outcome')({...outcome,execution:'frontend_complete_after_expected_intervention',intervention_count:1}), true);
});
test('passed and failed checks require evidence; unavailable checks require a reason', () => {
  const check={id:'check-1',rule_id:'AFF-SEM-004',rule_version:'1.0.0',state_id:null,profile:'public-retrieval',outcome:'passed',reason_code:null,reason:'Initial HTML was inspected.',target:'document title',expected:'A nonempty title.',observed:'Example title.',evidence_ids:['ev-1'],evidence_scope:'frontend_verifiable',test_context:'controlled_fixture'};
  assert.equal(validate('check',check).valid,true);
  assert.equal(validate('check',{...check,evidence_ids:[]}).valid,false);
  assert.equal(validate('check',{...check,outcome:'failed',evidence_ids:[]}).valid,false);
  assert.equal(validate('check',{...check,outcome:'untested',evidence_ids:[]}).valid,false);
  assert.equal(validate('check',{...check,outcome:'untested',reason_code:'tool_unavailable',evidence_ids:[]}).valid,true);
  assert.equal(validate('check',{...check,evidence_scope:'owner_verification_required'}).valid,false);
});
test('guide coverage cannot silently omit checklist items', () => {
  assert.equal(validate('report',{...empty,guide_coverage:empty.guide_coverage.slice(0,25)}).valid,false);
});
test('artifact paths reject traversal and absolute paths', () => {
  const evidence={id:'ev-1',run_id:'run-example',state_id:null,timestamp:'2026-11-22T23:00:00Z',sequence:0,channel:'observation',representation:'sanitized_text',evidence_scope:'frontend_verifiable',test_context:'controlled_fixture',sanitized_url:null,sanitized:true,sanitization:{method:'reviewed summary',reviewed:true,limitations:[]},collector:{name:'fixture',version:'1.0.0'},artifact_path:'evidence/ev-1.txt',sha256:null,summary:'Fixture observation.',limitations:[]};
  assert.equal(validate('evidence',evidence).valid,true);
  for (const bad of ['../private.txt','/etc/passwd','C:\\private.txt','evidence/../../private.txt']) assert.equal(validate('evidence',{...evidence,artifact_path:bad}).valid,false,bad);
});
