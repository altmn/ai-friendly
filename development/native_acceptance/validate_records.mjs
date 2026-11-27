/** Optional validation against skill-builder's original, locally supplied v2 schemas. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../../',import.meta.url));
const require=createRequire(path.join(root,'ai-friendly-audit/package.json'));
const Ajv=require('ajv/dist/2020.js'),formats=require('ajv-formats');
const schemaDir=process.argv[2];if(!schemaDir)throw Error('Supply a local directory of the original v2 skill-builder record schemas.');
const engine=new Ajv({allErrors:true,strict:false});formats(engine);
for(const name of (await fs.readdir(schemaDir)).filter(n=>n.endsWith('.schema.json')))engine.addSchema(JSON.parse(await fs.readFile(path.join(schemaDir,name),'utf8')));
const out=path.join(root,'docs/audit'),results=[];
const names=process.argv.slice(3);
if(!names.length)names.push('native-codex-host.json','native-browser-host.json','native-claude-host.json','native-evaluation-receipt.json');
for(const name of names){
 const data=JSON.parse(await fs.readFile(path.join(out,name),'utf8'));const validator=engine.getSchema(data.record_type+'.schema.json');
 const valid=validator(data);results.push({file:name,valid,errors:validator.errors});
}
let references=0;const missing=[];
async function walk(x){if(!x||typeof x!=='object')return;if(x.kind==='artifact'&&x.ref&&x.sha256){references++;try{const bytes=await fs.readFile(path.resolve(root,x.ref));if(createHash('sha256').update(bytes).digest('hex')!==x.sha256)missing.push(x.ref);}catch{missing.push(x.ref);}}for(const v of Object.values(x))await walk(v);}
for(const name of names)await walk(JSON.parse(await fs.readFile(path.join(out,name),'utf8')));
results.push({check:'local evidence hashes',valid:missing.length===0,references,errors:missing});
const resultName=names.every(n=>n.startsWith('source-max-repair-'))?'source-max-repair-record-validation.json':names.every(n=>n.startsWith('followup-'))?'followup-record-validation.json':'native-record-validation.json';
await fs.writeFile(path.join(out,resultName),JSON.stringify({engine:'AJV 8.17.1; original unmodified v2 record schemas; local registry, no remote retrieval',results},null,2)+'\n');
console.log(JSON.stringify(results,null,2));if(results.some(r=>!r.valid))process.exitCode=1;
