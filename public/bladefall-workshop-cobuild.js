/* Editor-facing co-build lifecycle. Every participant retains a private local recovery journal. */
(function(root){
'use strict';
const M=()=>root.BladefallWorkshopModel;
function validate(doc){(doc.mode==='ascend'?root.BladefallWorkshopAscend:root.BladefallWorkshopExplore).compile(doc.definition);}
function open({document:original,onSession,onCancel}){
 const el=document.createElement('section');el.style.cssText='position:fixed;inset:0;z-index:10002;background:#101721;color:#e9f0fa;padding:24px;font:15px system-ui';el.innerHTML='<div style="max-width:600px;margin:auto"><h1>Build together</h1><p>Host a shared copy of this level, or join a friend’s build. Everyone can edit and undo their own changes. Test invitations use a fixed revision while editing continues.</p><label>Your name <input data-name maxlength="40" value="Builder"></label><p><button data-host>Host this level</button></p><label>Build code <input data-code maxlength="6" placeholder="ABC234" style="text-transform:uppercase"></label><button data-join>Join</button><p data-status role="status"></p><button data-recover hidden>Open recovered local copy</button><button data-back>Back to editor</button></div>';
 el.setAttribute('aria-label','Build together');document.body.append(el);const q=s=>el.querySelector(s),abort=new AbortController();let current=null,busy=false,closed=false;
 const status=message=>{if(!closed)q('[data-status]').textContent=message;};
 function close(){closed=true;abort.abort();el.remove();}
 async function begin(role){if(busy)return;busy=true;q('[data-recover]').hidden=true;const code=role==='host'?root.BladefallWorkshopNetwork.makeCode():q('[data-code]').value.trim().toUpperCase(),name=q('[data-name]').value.trim()||'Builder';
  if(!/^[A-HJ-NP-Z2-9]{6}$/.test(code)){status('Enter the six-character build code.');busy=false;return;}
  let ui=null,link=null,protocol,actor='host',people=[],invitation=null,net={phase:'starting',message:'Connecting…'},lastPresence=0,opened=false,disposed=false;const waiters=[],playListeners=new Set();
  function played(message){for(const listener of playListeners)listener(message);}
  function info(){return {role,code,people,invitation,phase:net.phase,message:net.message,pending:role==='guest'&&!!protocol?.state().pending,error:role==='guest'?protocol?.state().error:null};}
  function refresh(){if(!disposed)ui?.collaborationChanged();}
  function receivedTest(test){invitation={id:test.id,document:M().validate(test.document)};validate(invitation.document);for(const waiter of waiters.splice(0)){clearTimeout(waiter.timer);waiter.resolve(invitation);}refresh();}
  function changed(doc){if(disposed)return;if(!opened){opened=true;close();onSession(doc,controller);}else{ui?.refresh({remote:true});void ui?.save();}refresh();}
  function identity(){const key='bladefall.workshop.identity.'+code;let id;try{id=JSON.parse(root.sessionStorage.getItem(key));}catch{}if(!id?.actor||!id?.token){id={actor:root.crypto.randomUUID(),token:root.crypto.randomUUID()};root.sessionStorage.setItem(key,JSON.stringify(id));}return id;}
  const controller={get session(){return protocol.session;},get actor(){return actor;},info,attach:editor=>{ui=editor;refresh();},
   play:message=>protocol.play(message),onPlay(listener){playListeners.add(listener);return ()=>playListeners.delete(listener);},
   presence(p){const now=Date.now();if(p.cursor&&now-lastPresence<100)return;lastPresence=now;protocol.presence(p);},
   offerTest(){return new Promise((resolve,reject)=>{if(role==='guest'&&!protocol.state().connected){reject(Error('Reconnect before inviting collaborators to test.'));return;}const waiter={resolve,reject};waiter.timer=setTimeout(()=>{const i=waiters.indexOf(waiter);if(i>=0)waiters.splice(i,1);reject(Error('The host did not confirm the test. Please reconnect and retry.'));},10000);waiters.push(waiter);protocol.test();});},
   reconnect(){link?.reconnect();},
   localCopy(){let doc=protocol.session.snapshot(),warning=null;const pending=role==='guest'?protocol.state().pending:null;if(pending?.type==='edit'){const model=M().session(doc,{validateDefinition:validate}),result=model.apply({...pending.transaction,sequence:1,base:doc.revision});if(result.ok)doc=model.snapshot();else warning='Your pending edit is kept in reconnect recovery. This copy contains the last confirmed shared version.';}else if(pending)warning='Your pending undo is kept in reconnect recovery. This copy contains the last confirmed shared version.';return {document:M().create({id:root.crypto.randomUUID(),mode:doc.mode,name:(doc.name+' local').slice(0,160),source:doc.source,definition:doc.definition}),warning};},
   close(){disposed=true;playListeners.clear();link?.close();for(const waiter of waiters.splice(0)){clearTimeout(waiter.timer);waiter.reject(Error('Left the shared build.'));}},
  };
  current=controller;
  try{
   if(role==='host'){
    const doc=M().create({id:root.crypto.randomUUID(),mode:original.mode,name:original.name,source:original.source,definition:original.definition});
    protocol=root.BladefallWorkshopCollaboration.host({document:doc,validateDefinition:validate,onChange:changed,onPeople:rows=>{people=rows;refresh();},onTest:receivedTest,onPlay:played});
   }else{
    const id=identity();actor=id.actor;const key='bladefall.workshop.recovery.'+code+'.'+actor,journal=root.BladefallWorkshopStore.create();let saved=await journal.loadJournal(key);if(!saved){try{saved=JSON.parse(root.localStorage.getItem(key));if(saved){await journal.saveJournal(key,saved);root.localStorage.removeItem(key);}}catch{}}
    protocol=root.BladefallWorkshopCollaboration.guest({...id,name,saved,validateDefinition:validate,persist:value=>journal.saveJournal(key,value),onChange:changed,onPeople:rows=>{people=rows;refresh();},onTest:receivedTest,onPlay:played,onState:s=>{if(s.error)net.message=s.error;refresh();}});
    if(saved?.document){q('[data-recover]').hidden=false;q('[data-recover]').onclick=()=>{const recovered=controller.localCopy();controller.close();close();onSession(recovered.document,null,recovered.warning);};}
   }
   link=await root.BladefallWorkshopNetwork.connect({role,code,protocol,onStatus:s=>{net=s;status(s.message);refresh();}});
   if(disposed){link.close();return;}if(role==='host')changed(protocol.snapshot());
  }catch(e){status(e.message);busy=false;controller.close();}
 }
 q('[data-host]').onclick=()=>void begin('host');q('[data-join]').onclick=()=>void begin('guest');q('[data-back]').onclick=()=>{current?.close();close();onCancel();};
 document.addEventListener('keydown',e=>{e.stopImmediatePropagation();if(e.code==='Escape'){e.preventDefault();current?.close();close();onCancel();}},{capture:true,signal:abort.signal});
 return {element:el,close:()=>{current?.close();close();}};
}
root.BladefallWorkshopCoBuild={open};
})(globalThis);
