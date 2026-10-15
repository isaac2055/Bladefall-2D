/* Original-level catalogue. Native sources load in disposable frames, never in the live campaign. */
(function(root){
'use strict';
const TYPE='bladefall-workshop-source',validMode=m=>m==='ascend'||m==='explore';
function entries(mode){
 if(mode==='explore')return root.BladefallWorkshopExploreRuntime.stages().map((s,i)=>({id:'explore-stage-'+i,name:s.name||'Stage '+i,group:'Explore',index:i}));
 const rows=[],seen=new Set(),worldRooms=new Set();
 function add(room,group,prefix,tape=null,flags={}){const id=prefix+':'+room.id;if(seen.has(id))return;seen.add(id);rows.push({id,name:room.name||room.id,group,room,tape,flags});}
 // (7.340) each original keeps its route and the physics the game plays it with, so a copy can be checked after edits.
 const tapes=root.BladefallPrecisionRooms?.tapes||{},climb=(room,core)=>({dropThru:room.campaignImport?!!room.dropThru:true,springUp:!room.campaignImport&&!core});
 for(const w of root.BladefallClimb?.worlds||[])for(const room of w.rooms){worldRooms.add(room);add(room,w.name||'Ascend '+w.n,'world-'+w.n,tapes[room.id]||null,climb(room,!!w.core));}
 for(const record of root.BladefallRoomBank?.records||[]){worldRooms.add(record.room);add(record.room,'Room Bank','bank',record.tape||tapes[record.room.id]||null,climb(record.room,!!record.room.coreCheckpoints));}
 for(const ch of root.BladefallPrecisionRooms?.chapters||[])for(const room of ch.rooms)if(!worldRooms.has(room))add(room,ch.name||'Courses',ch.id,tapes[room.id]||null,ch.climb?climb(room,false):{});
 return rows;
}
function source(mode,id){const row=entries(mode).find(r=>r.id===id);if(!row)throw Error('This original level is unavailable.');return {mode,name:row.name,source:{mode,id:row.id},definition:mode==='explore'?root.BladefallWorkshopExploreRuntime.captureSource(row.index):ascend(row)};}
function ascend(row){const d=root.BladefallWorkshopAscend.fromRoom(row.room);return root.BladefallWorkshopRoutes?root.BladefallWorkshopRoutes.attach(d,row.tape,row.flags):d;}
if(root.BLADEFALL_WORKSHOP_SOURCE)root.addEventListener('message',e=>{
 if(e.source!==root.parent||e.source===root||e.origin!==root.location.origin||e.data?.type!==TYPE||!validMode(e.data.mode)||typeof e.data.nonce!=='string'||e.data.nonce.length>128)return;
 const {nonce,mode,action,id}=e.data;try{let result;if(action==='list')result=entries(mode).map(({id,name,group})=>({id,name,group}));else if(action==='get'&&typeof id==='string')result=source(mode,id);else throw Error('Unknown catalogue request.');root.parent.postMessage({type:TYPE,nonce,result},root.location.origin);}catch(error){root.parent.postMessage({type:TYPE,nonce,error:error.message},root.location.origin);}
});
function create(){
 const frames=new Map(),pending=new Map();let closed=false;
 const receive=e=>{const p=pending.get(e.data?.nonce);if(!p||e.data.type!==TYPE||e.origin!==root.location.origin||e.source!==p.frame.contentWindow)return;pending.delete(e.data.nonce);clearTimeout(p.timer);e.data.error?p.reject(Error(String(e.data.error))):p.resolve(e.data.result);};root.addEventListener('message',receive);
 function frameFor(mode){if(frames.has(mode))return frames.get(mode);const frame=document.createElement('iframe');frame.hidden=true;frame.title=mode+' original level catalogue';let cancel;const ready=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Original levels took too long to load. Close and reopen the library to retry.')),30000);cancel=()=>{clearTimeout(timer);reject(Error('Level library is closed.'));};frame.onload=()=>{clearTimeout(timer);resolve(frame);};frame.onerror=()=>{clearTimeout(timer);reject(Error('Could not load original levels.'));};});ready.catch(()=>{});frame.src=(mode==='ascend'?'precision.html?pitch=climb&':'index.html?')+'workshopSource=1';frames.set(mode,{frame,ready,cancel});document.body.append(frame);return frames.get(mode);}
 async function request(mode,action,id){if(closed)throw Error('Level library is closed.');if(!validMode(mode))throw Error('Unknown game mode.');const {frame,ready}=frameFor(mode);await ready;if(closed)throw Error('Level library is closed.');return new Promise((resolve,reject)=>{const nonce=root.crypto.randomUUID(),timer=setTimeout(()=>{pending.delete(nonce);reject(Error('Original level request timed out.'));},30000);pending.set(nonce,{frame,resolve,reject,timer});frame.contentWindow.postMessage({type:TYPE,nonce,mode,action,id},root.location.origin);});}
 function close(){closed=true;root.removeEventListener('message',receive);for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('Level library is closed.'));}pending.clear();for(const {frame,cancel}of frames.values()){cancel();frame.remove();}frames.clear();}
 return {list:mode=>request(mode,'list'),get:(mode,id)=>request(mode,'get',id),close};
}
root.BladefallWorkshopSources={create,entries,source};
})(globalThis);
