/* Shared authoring transactions. Game definitions remain lossless JSON; edits never execute code. */
(function(root){
'use strict';
const SCHEMA='bladefall.workshop',VERSION=1,MAX_BYTES=8*1024*1024;
const forbidden=new Set(['__proto__','prototype','constructor']);
function assert(ok,message){if(!ok)throw new Error(message);}
function json(value,depth=0){
 assert(depth<=64,'Document nesting is too deep.');
 if(value===null||typeof value==='string'||typeof value==='boolean')return value;
 if(typeof value==='number'){assert(Number.isFinite(value),'Numbers must be finite.');return value;}
 assert(value&&typeof value==='object','Only JSON data can be edited.');
 if(Array.isArray(value))return value.map(v=>json(v,depth+1));
 assert(Object.prototype.toString.call(value)==='[object Object]','Only plain JSON objects can be edited.');
 const out={};for(const [k,v]of Object.entries(value)){assert(!forbidden.has(k),'Reserved property name.');out[k]=json(v,depth+1);}return out;
}
function equal(a,b){if(a===b)return true;if(!a||!b||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return false;const ak=Object.keys(a),bk=Object.keys(b);return ak.length===bk.length&&ak.every(k=>Object.hasOwn(b,k)&&equal(a[k],b[k]));}
function validate(doc){
 const d=json(doc);assert(d.schema===SCHEMA&&d.version===VERSION,'Unsupported workshop document.');
 assert(typeof d.id==='string'&&d.id.length>0&&d.id.length<=160,'Invalid document ID.');
 assert(['explore','ascend'].includes(d.mode),'Choose Explore or Ascend.');
 assert(typeof d.name==='string'&&d.name.trim().length>0&&d.name.length<=160,'Enter a level name.');
 assert(Number.isSafeInteger(d.revision)&&d.revision>=0,'Invalid revision.');
 assert(d.definition&&typeof d.definition==='object'&&!Array.isArray(d.definition),'Missing level definition.');
 assert(JSON.stringify(d).length<=MAX_BYTES,'Level exceeds the 8 MB editing limit.');return d;
}
function create({id,mode,name,source=null,definition}){return validate({schema:SCHEMA,version:VERSION,id,mode,name,source,revision:0,definition});}
function pathCheck(path){assert(Array.isArray(path)&&path.length>0&&path.length<=64,'Invalid edit path.');assert(path[0]==='definition'||path.length===1&&path[0]==='name','Only level content and name can be edited.');for(const k of path)assert(typeof k==='string'&&!forbidden.has(k)||Number.isSafeInteger(k)&&k>=0,'Invalid edit property.');}
function locate(doc,path){pathCheck(path);let p=doc;for(const k of path.slice(0,-1)){assert(p&&typeof p==='object'&&Object.hasOwn(p,k),'Edit parent no longer exists.');p=p[k];}assert(p&&typeof p==='object','Edit parent no longer exists.');const k=path.at(-1);if(Array.isArray(p))assert(Number.isInteger(k)&&k<p.length,'Replace arrays atomically when inserting or deleting.');return {parent:p,key:k};}
function read(doc,path){const {parent,key}=locate(doc,path);return Object.hasOwn(parent,key)?{exists:true,value:json(parent[key])}:{exists:false};}
function write(doc,path,slot){const {parent,key}=locate(doc,path);assert(slot&&typeof slot.exists==='boolean','Invalid edit value.');if(slot.exists)parent[key]=json(slot.value);else{assert(!Array.isArray(parent),'Delete array items with an array replacement.');delete parent[key];}}
const overlap=(a,b)=>a.slice(0,Math.min(a.length,b.length)).every((v,i)=>v===b[i]);
function changes(doc,edits){
 assert(Array.isArray(edits)&&edits.length>0&&edits.length<=10000,'Choose at least one change.');
 const result=edits.map(e=>({path:json(e.path),before:read(doc,e.path),after:e.remove?{exists:false}:{exists:true,value:json(e.value)}}));
 for(let i=0;i<result.length;i++)for(let j=0;j<i;j++)assert(!overlap(result[i].path,result[j].path),'One transaction cannot overlap its own edits.');
 return result.filter(e=>!equal(e.before,e.after));
}
function session(document,{validateDefinition=()=>{},historyLimit=100}={}){
 let doc=validate(document);validateDefinition(doc);
 const sequences=new Map(),receipts=new Map(),undo=new Map(),redo=new Map();
 function snapshot(){return json(doc);}
 function prepare(actor,edits){assert(typeof actor==='string'&&actor.length>0&&actor.length<=160,'Invalid editor identity.');return {document:doc.id,actor,sequence:(sequences.get(actor)||0)+1,base:doc.revision,changes:changes(doc,edits)};}
 function apply(raw,{record=true}={}){
  let tx,key;try{
   tx=json(raw);key=tx.actor+':'+tx.sequence;
   assert(typeof tx.actor==='string'&&tx.actor.length>0&&tx.actor.length<=160,'Invalid editor identity.');
   assert(tx.document===doc.id,'This edit belongs to another level.');
   if(receipts.has(key)){const old=receipts.get(key);assert(equal(old.tx,tx),'Sequence already used for another edit.');return json({...old.result,duplicate:true});}
   assert(Number.isSafeInteger(tx.sequence)&&tx.sequence===(sequences.get(tx.actor)||0)+1,'Resync before sending more edits.');
   assert(Number.isSafeInteger(tx.base)&&tx.base>=0&&tx.base<=doc.revision,'Invalid base revision.');
   assert(Array.isArray(tx.changes)&&tx.changes.length>0&&tx.changes.length<=10000,'Empty or oversized edit.');
   const next=snapshot();
   for(let i=0;i<tx.changes.length;i++){
    const c=tx.changes[i];pathCheck(c.path);
    for(let j=0;j<i;j++)assert(!overlap(c.path,tx.changes[j].path),'Overlapping edits.');
    assert(equal(read(doc,c.path),c.before),'Someone changed this object. Your edit was not applied; review the current version.');
    write(next,c.path,c.after);
   }
   next.revision++;validate(next);validateDefinition(next);
   doc=next;sequences.set(tx.actor,tx.sequence);
   if(record){const stack=undo.get(tx.actor)||[];stack.push(tx.changes);if(stack.length>historyLimit)stack.shift();undo.set(tx.actor,stack);redo.set(tx.actor,[]);}
   const result={ok:true,revision:doc.revision,transaction:tx};receipts.set(key,{tx,result});if(receipts.size>512)receipts.delete(receipts.keys().next().value);return json(result);
  }catch(e){return {ok:false,revision:doc.revision,error:e.message};}
 }
 function submit(actor,edits){try{return apply(prepare(actor,edits));}catch(e){return {ok:false,revision:doc.revision,error:e.message};}}
 function history(actor,direction){const from=direction==='undo'?undo:redo,to=direction==='undo'?redo:undo,stack=from.get(actor)||[];if(!stack.length)return {ok:false,revision:doc.revision,error:'Nothing to '+direction+'.'};
  const entry=stack.at(-1),flipped=entry.map(c=>({path:c.path,before:c.after,after:c.before}));
  const result=apply({document:doc.id,actor,sequence:(sequences.get(actor)||0)+1,base:doc.revision,changes:flipped},{record:false});
  if(result.ok){stack.pop();const other=to.get(actor)||[];other.push(flipped);to.set(actor,other);}return result;
 }
 return Object.freeze({snapshot,prepare,apply,submit,undo:actor=>history(actor,'undo'),redo:actor=>history(actor,'redo'),nextSequence:actor=>(sequences.get(actor)||0)+1,history:actor=>({undo:(undo.get(actor)||[]).length,redo:(redo.get(actor)||[]).length})});
}
root.BladefallWorkshopModel=Object.freeze({SCHEMA,VERSION,MAX_BYTES,json,equal,create,validate,changes,session});
})(globalThis);
