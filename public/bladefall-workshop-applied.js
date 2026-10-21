/* (7.363) A saved edit of a game level IS that level on this device.
   The editor's draft of an Ascend room or an Explore stage (a document whose `source` is the game level) is applied
   whenever it is saved: Ascend rooms are built from it (pcore createGame), Explore stages assemble natively and then
   take its geometry (workshop explore runtime). Pause → "Use the original level" removes it. Test-play and catalogue
   frames never apply anything, so a draft is always tested as drafted. */
(function(root){
'use strict';
const KEY='bladefall.workshop.applied.v1';
const M=()=>root.BladefallWorkshopModel;
let index={};
const exploreDefs=new Map(),built=new WeakMap(),originals=new WeakMap();   // stage index → Explore definition, read from the draft library at start
try{index=JSON.parse(root.localStorage?.getItem(KEY)||'{}')||{};}catch(_e){index={};}
const off=()=>!!(root.BLADEFALL_WORKSHOP_PLAY||root.BLADEFALL_WORKSHOP_SOURCE);
function write(){try{root.localStorage?.setItem(KEY,JSON.stringify(index));return true;}catch(_e){return false;}}
function keyOf(doc){
 if(!doc?.source?.id)return null;
 if(doc.mode==='ascend')return 'ascend:'+doc.source.id;
 const m=/^explore-stage-(\d+)$/.exec(doc.source.id);return doc.mode==='explore'&&m?'explore:'+m[1]:null;
}
/* Called after each successful save. An edit that does not compile yet (no spawn, overlapping tiles) keeps the last good one. */
function record(doc){
 if(off())return false;const key=keyOf(doc);if(!key)return false;
 try{
  if(doc.mode==='ascend'){const room=root.BladefallWorkshopAscend.compile(doc.definition);delete room.route;index[key]={doc:doc.id,revision:doc.revision,name:doc.name,room};}
  else{root.BladefallWorkshopExplore.compile(doc.definition);index[key]={doc:doc.id,revision:doc.revision,name:doc.name};exploreDefs.set(+key.slice(8),M().json(doc.definition));}
 }catch(_e){return false;}
 if(!write()&&doc.mode==='ascend'){delete index[key];return false;}
 return true;
}
function ascend(def){
 if(off()||!def)return def;const e=index['ascend:'+(def.origin||def.id)];if(!e?.room)return def;
 const hit=built.get(def);if(hit?.e===e)return hit.room;   // one object per draft, so identity checks still hold
 const room={...e.room,id:def.id};if(def.origin)room.origin=def.origin;built.set(def,{e,room});originals.set(room,def);return room;
}
function original(def){return originals.get(def)||def;}
function explore(stage){return off()?null:exploreDefs.get(stage)||null;}
function has(mode,id){return !off()&&!!index[mode==='ascend'?'ascend:'+id:'explore:'+id];}
function revision(mode,id){return index[mode==='ascend'?'ascend:'+id:'explore:'+id]?.revision||0;}
function restore(mode,id){const key=mode==='ascend'?'ascend:'+id:'explore:'+id;if(!index[key])return false;delete index[key];if(mode!=='ascend')exploreDefs.delete(+id);write();return true;}
const ready=(async()=>{
 if(off()||!root.BladefallWorkshopStore)return;
 const library=root.BladefallWorkshopStore.create();
 for(const [key,e] of Object.entries(index)){
  if(!key.startsWith('explore:'))continue;
  try{const doc=await library.load(e.doc);if(doc)exploreDefs.set(+key.slice(8),M().json(doc.definition));}catch(_e){}
 }
})();
root.BladefallWorkshopApplied=Object.freeze({record,ascend,original,explore,has,revision,restore,ready,keyOf});
})(globalThis);
