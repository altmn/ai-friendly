import test from 'node:test';
import assert from 'node:assert/strict';
import {promises as fs} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const run=promisify(execFile);
const root=process.env.AFF_PACKAGE_ROOT ?? fileURLToPath(new URL('../../ai-friendly-audit/',import.meta.url));
const cli=path.join(root,'scripts/audit.mjs');
const work=await fs.mkdtemp(path.join(os.tmpdir(),'aff-source-review-'));
test.after(()=>fs.rm(work,{recursive:true,force:true}));
async function command(args,code=0) {
  try {const r=await run(process.execPath,[cli,...args],{cwd:work,timeout:10000,maxBuffer:1_000_000});assert.equal(code,0);return r;}
  catch(e) {assert.equal(e.code,code,e.stderr ?? e.message);return e;}
}
async function inspect(html,name='source with spaces.html',flags=[]) {
  const file=path.join(work,name);await fs.writeFile(file,html);
  const r=await command(['inspect-source','--input',file,...flags]);
  assert.equal(await fs.readFile(file,'utf8'),html,'inspection must not rewrite source');
  return JSON.parse(r.stdout);
}

test('AUD-007: scoped rule lookup preserves full selected records and linked owners',async()=>{
  const full=JSON.parse((await command(['rules'])).stdout);
  const part=JSON.parse((await command(['rules','--ids','AFF-SEM-002,AFF-FORM-004'])).stdout);
  assert.equal(part.record_type,'rule-selection');
  assert.deepEqual(part.rules,full.rules.filter(r=>['AFF-SEM-002','AFF-FORM-004'].includes(r.id)));
  assert(part.rules.length===2 && full.rules.length===71);
  for(const r of part.rules)for(const id of r.owner_verification_ids)assert(part.owner_requirements.some(o=>o.id===id));
  assert(Buffer.byteLength(JSON.stringify(part)) < Buffer.byteLength(JSON.stringify(full))/5);
});
test('scoped rule lookup rejects unknown, duplicate and empty IDs before output',async()=>{
  for(const ids of ['AFF-NO-999','AFF-SEM-002,AFF-NO-999','AFF-SEM-002,AFF-SEM-002','AFF-SEM-002,']) {
    const r=await command(['rules','--ids',ids],1);assert.equal(r.stdout,'');
  }
  assert.equal((await command(['rules','--ids','AFF-SEM-002','--format','markdown'],1)).stdout,'');
});
test('AUD-007: source inventory preserves both field-name strings without computed-name claims',async()=>{
  const d=await inspect('<label>Billing phone <input aria-label="Operator key"></label><label for="other">勤務先メール</label><input id="other" type="email">');
  assert.deepEqual(d.controls[0].label_text,['Billing phone']);
  assert.equal(d.controls[0].aria_label,'Operator key');
  assert.deepEqual(d.controls[1].label_text,['勤務先メール']);
  assert.equal(d.controls[1].input_type,'email');
  assert(d.controls.every(c=>c.computed_accessible_name===null));
  assert.equal(d.backend_record_checked,false);assert.equal(d.business_effect_verified,null);
  assert.equal(d.unintended_effect_count,null);
});
test('field inspection ignores inert fake controls and never executes target scripts',async()=>{
  const sentinel=path.join(work,'must-not-exist');
  const d=await inspect('<script>require("node:fs").writeFileSync('+JSON.stringify(sentinel)+',"bad");</script><template><input aria-label="Fake"></template><noscript><input aria-label="Fallback"></noscript><label>Actual<input></label>');
  assert.equal(d.source_control_count,1);assert.deepEqual(d.controls[0].label_text,['Actual']);
  await assert.rejects(fs.stat(sentinel),{code:'ENOENT'});
});
test('field inventory excludes entered values, selected text and textarea content; redacts label secrets',async()=>{
  const d=await inspect('<label>Account<input value="NEVER_SAVE_VALUE"></label><label>Choice<select><option selected>NEVER_SAVE_OPTION</option></select></label><label>Message<textarea>NEVER_SAVE_TEXT</textarea></label><input aria-label="password=NEVER_SAVE_LABEL">');
  assert(!JSON.stringify(d).includes('NEVER_SAVE'));
  assert.deepEqual(d.controls[1].label_text,['Choice']);
  assert.deepEqual(d.controls[2].label_text,['Message']);
  assert.equal(d.controls[3].aria_label,'password=[redacted]');
  assert.equal(d.sanitization.reviewed,false);
});
test('missing and ambiguous labelledby targets stay unresolved',async()=>{
  const d=await inspect('<span id="same">First</span><span id="same">Second</span><input aria-labelledby="same missing"><span id="unique">Project code</span><input aria-labelledby="unique">');
  assert.deepEqual(d.controls[0].labelledby.map(x=>x.reason),['duplicate_id','missing_id']);
  assert(d.controls[0].labelledby.every(x=>x.text===null));
  assert.equal(d.controls[1].labelledby[0].text,'Project code');
});
test('bounded source view reports omitted controls and oversized names honestly',async()=>{
  const d=await inspect('<input aria-label="'+ 'X'.repeat(1100)+'">'+'<input>'.repeat(51));
  assert.equal(d.source_control_count,52);assert.equal(d.controls.length,50);assert.equal(d.omitted_controls,2);
  assert.equal(d.controls[0].aria_label,null);
  assert(d.controls[0].limitations.includes('aria_label exceeds 1024 characters; value omitted'));
});
test('source input limit and malformed UTF-8 fail closed with no partial JSON',async()=>{
  const file=path.join(work,'bounded.html');await fs.writeFile(file,'x'.repeat(2048));
  assert.equal((await command(['inspect-source','--input',file,'--max-bytes','1024'],1)).stdout,'');
  await fs.writeFile(file,Buffer.from([0xc3,0x28]));
  assert.equal((await command(['inspect-source','--input',file],1)).stdout,'');
  assert.equal((await command(['inspect-source','--input',work],1)).stdout,'');
});
test('source inventory output quota fails without emitting partial or excessive JSON',async()=>{
  const file=path.join(work,'many-labels.html');
  await fs.writeFile(file,('<label for="field">'+'A'.repeat(900)+'</label>').repeat(80)+'<input id="field">');
  const r=await command(['inspect-source','--input',file],1);
  assert.equal(r.stdout,'');assert.match(r.stderr,/exceeds 65536 output bytes/);
});
