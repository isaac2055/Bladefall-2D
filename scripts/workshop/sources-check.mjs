import assert from 'node:assert/strict';
import {exploreRuntime} from './explore-runtime-harness.mjs';
const app=await exploreRuntime('?workshopSource=1');
try{
 const {w}=app,S=w.BladefallWorkshopSources,A=w.BladefallWorkshopExplore;
 assert(w.BLADEFALL_WORKSHOP_SOURCE);assert(w.BLADEFALL_WORKSHOP_PLAY);
 // Parent client correlates requests to its own isolated frame and releases it on close.
 const client=S.create(),request=client.list('explore'),frame=w.document.querySelector('iframe');assert(frame.hidden);assert(frame.src.includes('workshopSource=1'));
 let sent;frame.contentWindow.postMessage=message=>{sent=message;};frame.dispatchEvent(new w.Event('load'));await Promise.resolve();await Promise.resolve();assert(sent);
 let delivered=false;request.then(()=>{delivered=true;});const response={type:sent.type,nonce:sent.nonce,result:[{id:'fixture',name:'Fixture',group:'Explore'}]};
 w.dispatchEvent(new w.MessageEvent('message',{source:w,origin:w.location.origin,data:response}));await Promise.resolve();assert(!delivered);
 w.dispatchEvent(new w.MessageEvent('message',{source:frame.contentWindow,origin:'https://other.example',data:response}));await Promise.resolve();assert(!delivered);
 w.dispatchEvent(new w.MessageEvent('message',{source:frame.contentWindow,origin:w.location.origin,data:response}));assert.equal((await request)[0].id,'fixture');client.close();assert(!frame.isConnected);
 const abandoned=S.create(),loading=abandoned.list('ascend');abandoned.close();await assert.rejects(loading,/closed/);
 const rows=S.entries('explore');assert.equal(rows.length,46);assert.equal(new Set(rows.map(r=>r.id)).size,46);
 let objects=0;
 for(const row of rows){const input=S.source('explore',row.id),level=A.compile(input.definition,{nativeRoot:w.__BF.G});assert.equal(level.stageIndex,row.index);assert.equal(w.__BF.mode,'pause');assert.equal(level.obstacles.length,w.__BF.G.obstacles.length);objects+=level.obstacles.length;}
 assert.throws(()=>S.source('explore','missing'),/unavailable/);
 w.BLADEFALL_WORKSHOP_SOURCE=false;assert.throws(()=>w.BladefallWorkshopExploreRuntime.captureSource(0),/isolated/);w.BLADEFALL_WORKSHOP_SOURCE=true;
 assert.throws(()=>w.BladefallWorkshopExploreRuntime.captureSource(-1),/Unknown/);
 // Child replies only to its parent, from the same origin and with a bounded nonce.
 const replies=[];Object.defineProperty(w,'parent',{value:{postMessage:data=>replies.push(data)},configurable:true});
 const data={type:'bladefall-workshop-source',mode:'explore',action:'list',nonce:'catalogue-check'};
 for(const [source,origin]of [[{},w.location.origin],[w.parent,'https://other.example']])w.dispatchEvent(new w.MessageEvent('message',{source,origin,data}));assert.equal(replies.length,0);
 w.dispatchEvent(new w.MessageEvent('message',{source:w.parent,origin:w.location.origin,data}));assert.equal(replies.length,1);assert.equal(replies[0].result.length,46);assert(!replies[0].result[0].definition);
 console.log('PASS: all 46 native Explore sources capture while paused ('+objects+' obstacles), isolated-only capture, invalid IDs, and source/origin-guarded catalogue replies.');
}finally{app.close();}
// Catalogue the actual Ascend registries, including campaign branches, Cores and bank rooms.
const {createRequire}=await import('node:module'),require=createRequire(import.meta.url);
await import('../pcore-tape.mjs');globalThis.BLADEFALL_CLIMB=true;
for(const f of ['climb','climb-bank-passages','climb-atlas','climb-passages','climb-passage-tapes','climb-worlds','climb-finale-tapes','climb-finale','climb-core-tapes','climb-cores','room-bank','workshop-model','workshop-ascend','workshop-sources'])require('../../public/bladefall-'+f+'.js');
const S=globalThis.BladefallWorkshopSources,A=globalThis.BladefallWorkshopAscend,rows=S.entries('ascend');assert(rows.length>1000);assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);
for(const row of rows)assert.deepEqual(A.compile(S.source('ascend',row.id).definition),JSON.parse(JSON.stringify(row.room)),row.id);
for(const world of globalThis.BladefallClimb.worlds)for(const room of world.rooms)assert(rows.some(r=>r.room===room),room.id+' available');
assert(rows.some(r=>r.room.id==='bank-f97'));assert(rows.some(r=>r.room.id==='bank-f105'));
console.log('PASS: '+rows.length+' distinct catalogue entries cover every loaded Ascend world room and the native course/bank registries; every source compiles losslessly.');
