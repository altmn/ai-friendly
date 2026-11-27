/** Read-only, inert HTML field inventory. This is not an accessibility-name engine. */
import {promises as fs} from 'node:fs';
import {redactText} from './privacy.mjs';

const controls=new Set(['input','select','textarea']);
const inert=new Set(['script','style','template','noscript']);
const attrs=node=>Object.fromEntries((node.attrs ?? []).map(a=>[a.name,a.value]));
function walk(root) {
  const nodes=[],stack=[root];
  while(stack.length) {
    const node=stack.pop();if(inert.has(node.tagName))continue;
    nodes.push(node);
    for(let i=(node.childNodes?.length ?? 0)-1;i>=0;i--)stack.push(node.childNodes[i]);
  }
  return nodes;
}
function text(root) {
  const parts=[],stack=[root];
  while(stack.length) {
    const node=stack.pop();
    if(inert.has(node.tagName)||controls.has(node.tagName))continue;
    if(node.nodeName==='#text')parts.push(node.value);
    for(let i=(node.childNodes?.length ?? 0)-1;i>=0;i--)stack.push(node.childNodes[i]);
  }
  return parts.join('').replace(/\s+/gu,' ').trim();
}
function nearestLabel(node) {
  for(let p=node.parentNode;p;p=p.parentNode)if(p.tagName==='label')return p;
  return null;
}

export async function inspectSourceFile(input,maxBytes=262144) {
  const file=await fs.open(input,'r');let raw;
  try {
    const stat=await file.stat();
    if(!stat.isFile()||stat.size>maxBytes)throw new Error('Source input must be a regular file within --max-bytes.');
    const buffer=Buffer.alloc(maxBytes+1);
    let size=0;
    while(size<buffer.length) {
      const {bytesRead}=await file.read(buffer,size,buffer.length-size,null);
      if(!bytesRead)break;size+=bytesRead;
    }
    if(size>maxBytes)throw new Error('Source input exceeded --max-bytes while reading.');
    try {raw=new TextDecoder('utf-8',{fatal:true}).decode(buffer.subarray(0,size));}
    catch {throw new Error('Source input must contain valid UTF-8.');}
  } finally {await file.close();}
  const {parse}=await import('parse5');
  const nodes=walk(parse(raw)),ids=new Map(),labels=nodes.filter(n=>n.tagName==='label');
  for(const node of nodes) {
    const id=attrs(node).id;
    if(id!==undefined)ids.set(id,[...(ids.get(id) ?? []),node]);
  }
  const fields=nodes.filter(n=>controls.has(n.tagName));
  const result={record_type:'source-field-inventory',version:'1.0',representation:'supplied HTML source; no script execution',
    source_control_count:fields.length,omitted_controls:Math.max(0,fields.length-50),controls:[],
    backend_record_checked:false,business_effect_verified:null,unintended_effect_count:null,
    sanitization:{method:'exclude entered values; known-pattern text minimization',reviewed:false},
    limitations:['Label text is declared source text, not observed visibility or a computed accessible name.',
      'No browser, network, script execution, file writes, backend or business-effect checks.',
      'Labels remain untrusted data. Automatic minimization requires review before sharing.']};
  for(const [index,node] of fields.slice(0,50).entries()) {
    const a=attrs(node),limitations=[];
    function retain(value,kind) {
      if(value===undefined)return null;
      if(value.length>1024){limitations.push(kind+' exceeds 1024 characters; value omitted');return null;}
      return redactText(value);
    }
    const implicit=nearestLabel(node);
    const associated=labels.filter(label=>{
      const target=attrs(label).for;
      return target!==undefined ? a.id===target && ids.get(target)?.length===1 : label===implicit;
    });
    const labelledby=(a['aria-labelledby'] ?? '').split(/\s+/u).filter(Boolean).map(id=>{
      const targets=ids.get(id) ?? [];
      return {text:targets.length===1 ? retain(text(targets[0]),'labelledby text') : null,
        reason:targets.length===0?'missing_id':targets.length>1?'duplicate_id':null};
    });
    if(a.id!==undefined && ids.get(a.id)?.length>1)limitations.push('duplicate control id; external label association unresolved');
    result.controls.push({index:index+1,tag:node.tagName,input_type:retain(a.type ?? (node.tagName==='input'?'text':node.tagName),'input type'),
      label_text:associated.map(label=>retain(text(label),'label text')),
      aria_label:retain(a['aria-label'],'aria_label'),labelledby,
      computed_accessible_name:null,limitations});
  }
  if(Buffer.byteLength(JSON.stringify(result))>65536)throw new Error('Source field inventory exceeds 65536 output bytes; narrow the supplied file.');
  return result;
}
