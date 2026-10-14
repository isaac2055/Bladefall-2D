/* Compose section edits into one validated, undoable transaction, including array-backed devices. */
(function(root){
'use strict';
const M=()=>root.BladefallWorkshopModel;
function diff(before,after,path=['definition']){
 if(M().equal(before,after))return [];
 if(before&&after&&!Array.isArray(before)&&!Array.isArray(after)&&typeof before==='object'&&typeof after==='object'){
  return [...new Set([...Object.keys(before),...Object.keys(after)])].flatMap(k=>!Object.hasOwn(after,k)?[{path:[...path,k],remove:true}]:!Object.hasOwn(before,k)?[{path:[...path,k],value:after[k]}]:diff(before[k],after[k],[...path,k]));
 }
 return [{path,value:after}];
}
function edit(document,adapter,ids,operation,{dx=0,dy=0,newId=()=>root.crypto.randomUUID()}={}){
 const before=document.definition,selected=[...new Set(ids)].map(id=>{const o=adapter.objects(before).find(o=>o.id===id);if(!o)throw Error('A selected object no longer exists.');return o;});
 if(!selected.length)throw Error('Select at least one object.');
 const draft=M().json(document),copies=new Map(),originalNodes=new Set(Object.keys(before.graph?.nodes||{}));
 function apply(edits){for(const e of Array.isArray(edits)?edits:[edits]){M().changes(draft,[e]);let p=draft;for(const k of e.path.slice(0,-1))p=p[k];if(e.remove)delete p[e.path.at(-1)];else p[e.path.at(-1)]=M().json(e.value);}}
 if(operation==='move')for(const o of selected)apply(adapter.move(draft.definition,o.id,{x:o.x+dx,y:o.y+dy}));
 else if(operation==='delete'){
  // Array indices are source identities; remove later siblings before earlier ones.
  selected.sort((a,b)=>{const ap=a.path.slice(0,-1),bp=b.path.slice(0,-1);return M().equal(ap,bp)&&typeof a.path.at(-1)==='number'&&typeof b.path.at(-1)==='number'?b.path.at(-1)-a.path.at(-1):b.path.length-a.path.length;});
  for(const o of selected){if(!adapter.objects(draft.definition).some(n=>n.id===o.id))continue;apply(adapter.remove(draft.definition,o.id));}
 }else if(operation==='duplicate'){
  for(const o of selected){const id='new-'+newId();copies.set(o.id,id);apply(adapter.duplicate(draft.definition,o.id,{newId:id,dx,dy}));}
  // Duplicated Explore objects keep their shared relationships within the copied section.
  if(draft.definition.graph){const remap=v=>{if(!v||typeof v!=='object')return;if(v.$ref&&copies.has(v.$ref))v.$ref=copies.get(v.$ref);for(const x of Object.values(v))remap(x);};for(const[id,node]of Object.entries(draft.definition.graph.nodes))if(!originalNodes.has(id))remap(node);}
 }else throw Error('Unknown section edit.');
 adapter.compile(draft.definition);
 return {edits:diff(before,draft.definition),copies:operation==='duplicate'?adapter.objects(draft.definition).filter(o=>!adapter.objects(before).some(old=>old.id===o.id)).map(o=>o.id):[]};
}
root.BladefallWorkshopSelection={edit,diff};
})(globalThis);
