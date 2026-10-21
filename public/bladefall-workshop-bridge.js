/* In-game entry and isolated native preview frames. Draft geometry never replaces the campaign. */
(function(root){
'use strict';
let active=null,preview=null,playDocument=null,opening=false;
const store=()=>!root.BLADEFALL_WORKSHOP_PLAY&&root.BladefallWorkshopCloud?root.BladefallWorkshopCloud.library():root.BladefallWorkshopStore.create(),M=()=>root.BladefallWorkshopModel;
function complete(){if(!root.BLADEFALL_WORKSHOP_PLAY)return false;const V=root.BladefallPrecisionView,watched=!!V?.view.replay;if(V){V.view.paused=true;V.view.replay=null;}root.BladefallWorkshopRoutes?.exit(watched);root.parent.postMessage({type:'bladefall-workshop-complete',document:playDocument?.id,watched},root.location.origin);return true;}
async function play(doc,ui,co=null,test=null){if(!co)await store().save(doc);co?.presence({status:'testing',revision:doc.revision});ui.suspend();const wrapper=document.createElement('section');wrapper.style.cssText='position:fixed;inset:0;z-index:10001;background:#0c121b;display:flex;flex-direction:column';const bar=document.createElement('div');bar.style.cssText='display:flex;gap:12px;align-items:center;padding:10px;color:white;font:14px system-ui';const back=document.createElement('button');back.textContent='Return to builder';const status=document.createElement('span');status.textContent='Testing revision '+doc.revision+' · any authored exit finishes this room test';const retry=document.createElement('button');retry.textContent='Restart test';bar.append(back,retry,status);const frame=document.createElement('iframe');frame.title='Playtest '+doc.name;frame.style.cssText='border:0;flex:1;width:100%;background:#0c121b';frame.src=(doc.mode==='ascend'?'precision.html':'index.html')+'?workshopPlay='+encodeURIComponent(doc.id);wrapper.append(bar,frame);document.body.append(wrapper);
 let shared=!!(co&&test),generation=0,joined=false;
 const solo=document.createElement('button');solo.textContent='Play solo';solo.hidden=!shared;bar.insertBefore(solo,status);
 const sendChild=message=>frame.contentWindow.postMessage({type:'bladefall-workshop-coop',document:doc.id,message},root.location.origin);
 solo.onclick=()=>{if(joined)co.play({action:'leave',test:test.id});joined=false;shared=false;solo.hidden=true;status.textContent='Testing solo · revision '+doc.revision;sendChild({event:'solo'});};
 const unsubscribe=shared?co.onPlay(message=>{if(!shared)return;if(message.event!=='disconnected'&&message.test!==test.id)return;if(message.event==='roster'){generation=message.generation;const seat=message.players.indexOf(co.actor);if(seat<0)return;status.textContent=message.players.every(Boolean)?'Playing together · revision '+doc.revision:'Waiting for a partner · join this test from the builder';sendChild({...message,role:seat===0?'host':'guest',connected:message.players.every(Boolean)});}else if(message.event==='full'){joined=false;status.textContent='Both co-op seats are occupied · this preview remains solo';}else{if(message.event==='disconnected')status.textContent='Shared test paused · return to the builder to reconnect';sendChild(message);}}):null;
 const receive=e=>{if(e.source!==frame.contentWindow||e.origin!==root.location.origin)return;if(shared&&e.data?.type==='bladefall-workshop-coop-ready'&&e.data.document===doc.id){joined=true;co.play({action:'join',test:test.id});return;}if(shared&&e.data?.type==='bladefall-workshop-coop-send'&&e.data.document===doc.id){co.play({action:'packet',test:test.id,generation,packet:e.data.packet});return;}if(e.data?.type==='bladefall-workshop-document-request'&&e.data.id===doc.id&&typeof e.data.nonce==='string'&&e.data.nonce.length<=128){frame.contentWindow.postMessage({type:'bladefall-workshop-document',nonce:e.data.nonce,document:doc},root.location.origin);return;}if(e.data?.type==='bladefall-workshop-complete'){status.textContent=e.data.watched?'The intended route reached the exit · Restart test to play':'Draft complete · return to edit or retry';co?.presence({status:'completed',revision:doc.revision});}if(e.data?.type==='bladefall-workshop-error')status.textContent='Could not start: '+String(e.data.message);};root.addEventListener('message',receive);const routes=!shared&&root.BladefallWorkshopRoutes?root.BladefallWorkshopRoutes.bar({bar,status,frame,doc,ui}):()=>{};retry.onclick=()=>{if(shared&&joined)co.play({action:'restart',test:test.id});else frame.contentWindow.postMessage({type:'bladefall-workshop-retry',document:doc.id},root.location.origin);};back.onclick=()=>{unsubscribe?.();routes();if(shared&&joined)co.play({action:'leave',test:test.id});root.removeEventListener('message',receive);wrapper.remove();preview=null;co?.presence({status:'editing',revision:ui.snapshot().revision});ui.resume();};preview=wrapper;
}
function openEditor(doc,library,onExit,co=null){
 const adapter=doc.mode==='ascend'?root.BladefallWorkshopAscend:root.BladefallWorkshopExplore;
 // (7.363) saving a draft of a game level also makes it that level in the game (bladefall-workshop-applied.js)
 const applied=root.BladefallWorkshopApplied,onSave=async d=>{const r=await library.save(d);applied?.record(d);return r;},savedNote=d=>applied?.keyOf(d)&&applied.has(d.mode,d.mode==='ascend'?d.source.id:d.source.id.slice(14))?' · now the game’s level':'';
 active=root.BladefallWorkshopUI.open({document:doc,adapter,session:co?.session,actor:co?.actor,collaboration:co,cloud:library.cloud,onSave,savedNote,onTest:async(current,ui)=>{if(co){const test=await co.offerTest();await play(test.document,ui,co,test);}else await play(current,ui);},onJoinTest:async(test,ui)=>{try{if(test)await play(test.document,ui,co,test);}catch(e){ui.status(e.message,true);ui.resume();}},onExit:()=>{co?.close();active=null;onExit();},onCoBuild:(current,ui)=>{ui.suspend();root.BladefallWorkshopCoBuild.open({document:current,onCancel:()=>ui.resume(),onSession:(next,collaboration,warning)=>{ui.close({notify:false});active=null;const opened=openEditor(next,library,onExit,collaboration);if(!collaboration)void opened.save().then(()=>{if(warning)opened.status(warning,true);});}});},onLeaveBuild:()=>{const recovered=co.localCopy();co.close();active.close({notify:false});active=null;const next=openEditor(recovered.document,library,onExit);void next.save().then(()=>{if(recovered.warning)next.status(recovered.warning,true);});},onLibrary:(current,ui)=>{
  ui.suspend();root.BladefallWorkshopLibrary.open({document:current,store:library,onClose:()=>ui.resume(),onOpen:async next=>{
   // Validate before replacing the open editor; a corrupt import must leave its edits recoverable.
   const A=next.mode==='ascend'?root.BladefallWorkshopAscend:root.BladefallWorkshopExplore;A.compile(next.definition);
   ui.close({notify:false});active=null;openEditor(next,library,onExit);
  }});
 }});co?.attach(active);if(co)void active.save();if(doc.mode==='ascend'&&root.BladefallWorkshopRoutes)active.status(root.BladefallWorkshopRoutes.describe(doc));return active;
}
/* (7.363) Rebuild the room you are in from its applied draft (or the original again), and start it from its spawn. */
function refreshAscendRoom(){
 const V=root.BladefallPrecisionView,g=V?.view.g,C=root.BladefallPrecisionCore,A=root.BladefallWorkshopApplied;if(!g||!C||!A)return false;
 const next=A.ascend(A.original(g.room.def));if(next===g.room.def)return false;
 const i=g.roomIndex;g.defs=g.defs.slice();g.defs[i]=next;g.rooms[i]=C.parseRoom(next,i);C.resetRoom(g);return true;
}
function useOriginal(mode){
 const A=root.BladefallWorkshopApplied;if(!A)return false;
 if(mode==='ascend'){const g=root.BladefallPrecisionView?.view.g;if(!g)return false;const id=g.room.def.origin||g.room.id;if(!A.restore('ascend',id))return false;refreshAscendRoom();return true;}
 const runtime=root.BladefallWorkshopExploreRuntime,g=runtime?.state();if(!g||!A.restore('explore',g.stageIndex))return false;runtime.reload?.();return true;
}
function edited(mode){const A=root.BladefallWorkshopApplied;if(!A)return false;if(mode==='ascend'){const g=root.BladefallPrecisionView?.view.g;return !!g&&A.has('ascend',g.room.def.origin||g.room.id);}const g=root.BladefallWorkshopExploreRuntime?.state();return !!g&&A.has('explore',g.stageIndex);}
async function editAscend(){if(active||opening||root.BLADEFALL_WORKSHOP_PLAY)return;const V=root.BladefallPrecisionView,g=V?.view.g;if(!g)return;
 opening=true;const view=V.view,oldPaused=view.paused;view.paused=true;V.clearInput();root.BladefallRouteRecording?.stop('opened level editor');root.BladefallClimbSession?.invalidate('level editor');
 try{const library=store(),source={id:g.room.def.origin||g.room.id,mode:'ascend'},list=await library.list(),last=list.find(d=>d.mode==='ascend'&&d.source?.id===source.id);const W=root.BladefallWorkshopRoutes,tape=root.BladefallPrecisionRooms?.tapes?.[g.room.id],flags={dropThru:!!g.dropThru,springUp:!!g.springUp},fresh=root.BladefallWorkshopAscend.fromRoom(g.room.def);
  let doc=last?await library.load(last.id):M().create({id:root.crypto.randomUUID(),mode:'ascend',name:g.room.def.name||g.room.id,source,definition:W?W.attach(fresh,tape,flags):fresh});await library.save(doc);
  // (7.340) an older draft gains the game's route too, so edits can be checked against it.
  const seedRoute=!doc.definition.route&&W?W.attach(fresh,tape,flags).route:null;
  const overlay=document.getElementById('pcOverlay');overlay?.classList.remove('show');if(overlay)overlay.innerHTML='';
  const before=root.BladefallWorkshopApplied?.revision('ascend',source.id);
  const ui=openEditor(doc,library,()=>{if(root.BladefallWorkshopApplied?.revision('ascend',source.id)!==before)refreshAscendRoom();view.paused=false;view.frameAcc=0;V.clearInput();});if(seedRoute)ui.apply({path:['definition','route'],value:seedRoute});
 }catch(e){view.paused=oldPaused;root.alert('Could not open the editor: '+e.message);}finally{opening=false;}
}
async function editExplore(){
 if(active||opening||root.BLADEFALL_WORKSHOP_PLAY)return;const runtime=root.BladefallWorkshopExploreRuntime,g=runtime?.state();if(!g)return;
 opening=true;runtime.pause();root.BladefallPlaytest?.invalidate?.('level editor');
 try{const library=store(),source={id:'explore-stage-'+g.stageIndex,mode:'explore'},list=await library.list(),last=list.find(d=>d.mode==='explore'&&d.source?.id===source.id);
  const doc=last?await library.load(last.id):M().create({id:root.crypto.randomUUID(),mode:'explore',name:runtime.stages()[g.stageIndex].name,source,definition:runtime.capture()});
  await library.save(doc);const stage=g.stageIndex,before=root.BladefallWorkshopApplied?.revision('explore',stage);
  openEditor(doc,library,()=>{runtime.resume();if(root.BladefallWorkshopApplied?.revision('explore',stage)!==before)runtime.reload?.();});
 }catch(e){runtime.resume();root.alert('Could not open the editor: '+e.message);}finally{opening=false;}
}
async function loadPlayDocument(id){
 if(root.parent===root)return store().load(id);
 return new Promise((resolve,reject)=>{const nonce=root.crypto.randomUUID();let timer;
  const receive=e=>{if(e.source!==root.parent||e.origin!==root.location.origin||e.data?.type!=='bladefall-workshop-document'||e.data.nonce!==nonce)return;try{const doc=M().validate(e.data.document);if(doc.id!==id)throw Error('The supplied draft does not match this playtest.');cleanup();resolve(doc);}catch(err){cleanup();reject(err);}};
  const cleanup=()=>{root.removeEventListener('message',receive);clearTimeout(timer);};root.addEventListener('message',receive);timer=setTimeout(()=>{cleanup();reject(Error('The builder did not supply the draft. Return to the builder and retry.'));},10000);root.parent.postMessage({type:'bladefall-workshop-document-request',id,nonce},root.location.origin);
 });
}
let playGeneration=-1,playTest=null;
root.addEventListener('message',e=>{if(!root.BLADEFALL_WORKSHOP_PLAY||e.source!==root.parent||e.origin!==root.location.origin||e.data?.type!=='bladefall-workshop-coop'||e.data.document!==playDocument?.id)return;const m=e.data.message,N=root.BladefallWorkshopNativePlay;if(!N||!m)return;try{if(m.event==='roster'){if(m.test===playTest&&m.generation<=playGeneration)return;playTest=m.test;playGeneration=m.generation;N.start({document:playDocument,role:m.role,connected:m.connected,send:packet=>root.parent.postMessage({type:'bladefall-workshop-coop-send',document:playDocument.id,packet},root.location.origin)});}else if(m.event==='packet'&&m.test===playTest&&m.generation===playGeneration)N.receive(m.packet);else if(m.event==='disconnected')N.disconnected();else if(m.event==='solo'){N.stop();playTest=null;playGeneration=-1;if(playDocument.mode==='ascend'){const V=root.BladefallPrecisionView;V.startChapter(root.BladefallPrecisionRooms.chapters.findIndex(ch=>ch.id==='workshop-'+playDocument.id));V.view.g.workshop=true;}else root.BladefallWorkshopExploreRuntime.retry();}}catch(error){root.parent.postMessage({type:'bladefall-workshop-error',message:error.message},root.location.origin);}});
root.addEventListener('message',e=>{if(!root.BLADEFALL_WORKSHOP_PLAY||e.source!==root.parent||e.origin!==root.location.origin||e.data?.type!=='bladefall-workshop-retry'||e.data.document!==playDocument?.id)return;const V=root.BladefallPrecisionView;if(V){V.retryRoom();V.view.paused=false;V.clearInput();}else root.BladefallWorkshopExploreRuntime?.retry();});
async function bootPlaytest(){const share=new URLSearchParams(root.location.search).get('workshopShare');if(share){try{const library=store(),shared=await library.cloud.shared(share),adapter=shared.mode==='ascend'?root.BladefallWorkshopAscend:root.BladefallWorkshopExplore;adapter.compile(shared.definition);const doc=M().create({id:root.crypto.randomUUID(),mode:shared.mode,name:shared.name,source:shared.source,definition:shared.definition});await library.save(doc);if(root.BladefallPrecisionView)root.BladefallPrecisionView.view.paused=true;else root.BladefallWorkshopExploreRuntime?.pause();openEditor(doc,library,()=>root.location.assign(root.location.pathname));}catch(e){root.alert('Could not open the shared level: '+e.message);}return;}const id=new URLSearchParams(root.location.search).get('workshopPlay');if(!id)return;
 try{const doc=await loadPlayDocument(id);if(!doc)throw Error('This draft is not saved on this device.');playDocument=doc;
  if(doc.mode==='ascend'){
   const R=root.BladefallPrecisionRooms,V=root.BladefallPrecisionView,A=root.BladefallWorkshopAscend,room=A.compile(doc.definition),W=root.BladefallWorkshopRoutes,checked=W?.check(doc,room);
   // (7.340) a route that still reaches the exit is the draft's intended route: Watch it from the pause menu or the test bar.
   R.addPart({part:'workshop',title:'Workshop',chapters:[{id:'workshop-'+doc.id,name:doc.name,palette:room.palette||'footing',rooms:[room]}],tapes:checked?.ok?{[room.id]:doc.definition.route.tape}:{}});
   const PV=root.BladefallPitchView,old=PV?.palette;if(PV)PV.palette=function(ch){return PV.climb?.palette?.(room.palette)||old?.call(this,ch)||V.palettes.footing;};
   V.startChapter(R.chapters.findIndex(ch=>ch.id==='workshop-'+doc.id));V.view.g.workshop=true;W?.begin(doc,room,V.view.g,checked);root.BladefallPlaytest?.invalidate?.('level editor playtest');
  }else root.BladefallWorkshopExploreRuntime.start(doc.definition);
  root.parent.postMessage({type:'bladefall-workshop-coop-ready',document:doc.id},root.location.origin);
 }catch(e){root.parent.postMessage({type:'bladefall-workshop-error',message:e.message},root.location.origin);}
}
root.BladefallWorkshopBridge={editAscend,editExplore,useOriginal,edited,refreshAscendRoom,complete,isPlaytest:()=>!!root.BLADEFALL_WORKSHOP_PLAY,loadPlayDocument,state:()=>({active,preview,playDocument})};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootPlaytest);else void bootPlaytest();
})(globalThis);
