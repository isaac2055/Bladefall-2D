/* Host-ordered co-building. Transport carries data only; native adapters validate every committed edit. */
(function(root){
'use strict';
const M=()=>root.BladefallWorkshopModel;
const validId=s=>typeof s==='string'&&s.length>=1&&s.length<=160;
function host({document,session,actor='host',validateDefinition,onChange=()=>{},onPeople=()=>{},onTest=()=>{},onPlay=()=>{}}){
 const model=session||M().session(document,{validateDefinition}),members=new Map(),requests=new Map(),epoch=root.crypto.randomUUID();
 const play=root.BladefallWorkshopPlayLink?.create({deliver:(who,message)=>{if(who===actor)onPlay(message);else members.get(who)?.send?.(message);}});
 let testing=null,hostPresence={status:'editing'};
 const roster=()=>[{actor,name:'Host',connected:true,...hostPresence},...[...members.values()].map(m=>({actor:m.actor,name:m.name,connected:!!m.send,...m.presence}))];
 function people(){const rows=roster();onPeople(rows);for(const m of members.values())m.send?.({type:'people',people:rows});}
 function state(m,ack){m.send?.({type:'state',epoch,document:model.snapshot(),sequence:model.nextSequence(m.actor),history:model.history(m.actor),people:roster(),ack:ack||null,test:testing});}
 function publish(result,who,ack){
  if(!result.ok||result.duplicate){const m=members.get(who);if(m)state(m,ack);return result;}
  for(const m of members.values())m.send?.({type:'commit',epoch,transaction:result.transaction,revision:result.revision,sequence:model.nextSequence(m.actor),history:model.history(m.actor),ack:m.actor===who?ack:null});
  onChange(model.snapshot(),{actor:who,result});return result;
 }
 const local={snapshot:model.snapshot,prepare:model.prepare,history:()=>model.history(actor),nextSequence:()=>model.nextSequence(actor),submit:(_a,edits)=>publish(model.submit(actor,edits),actor),undo:()=>publish(model.undo(actor),actor),redo:()=>publish(model.redo(actor),actor)};
 function connect(send){let member=null,closed=false;const rawSend=send;send=message=>{try{rawSend(message);}catch{close();}};
  function close(){if(closed)return;closed=true;if(member?.send===send){member.send=null;play?.disconnect(member.actor);people();}}
  function receive(raw){if(closed)return;let msg;
   try{msg=M().json(raw);if(!msg||typeof msg.type!=='string')throw Error('Invalid workshop message.');
    if(msg.type==='hello'){
     if(member)throw Error('Already joined.');if(!validId(msg.actor)||msg.actor===actor||!validId(msg.token)||typeof msg.name!=='string'||msg.name.length>40)throw Error('Invalid collaborator identity.');
     const old=members.get(msg.actor);if(old&&old.token!==msg.token)throw Error('This collaborator identity belongs to another connection.');
     if(!old&&members.size>=8)throw Error('This build already has eight collaborators.');
     member=old||{actor:msg.actor,token:msg.token,name:msg.name||'Builder',presence:{status:'editing'}};member.send=send;members.set(member.actor,member);state(member);people();return;
    }
    if(!member||member.send!==send)throw Error('Join this build before editing.');
    if(msg.type==='play'){play?.receive(member.actor,msg);return;}
    if(msg.type==='sync'){state(member);return;}
    if(msg.type==='presence'){
     const p=msg.presence;if(!p||!['editing','testing','completed'].includes(p.status))return;
     member.presence={status:p.status,revision:Number.isSafeInteger(p.revision)?p.revision:null};
     if(p.cursor&&Number.isFinite(p.cursor.x)&&Number.isFinite(p.cursor.y))member.presence.cursor={x:p.cursor.x,y:p.cursor.y};
     if(p.selection===null||validId(p.selection))member.presence.selection=p.selection;people();return;
    }
    if(msg.type==='test'){startTest();return;}
    if(!['edit','undo','redo'].includes(msg.type)||!validId(msg.id))throw Error('Unknown edit request.');
    const key=member.actor+':'+msg.id,previous=requests.get(key);if(previous){if(!M().equal(previous.message,msg))throw Error('Request ID was reused for another edit.');state(member,previous.ack);return;}
    let result;
    if(msg.type==='edit'){if(msg.transaction?.actor!==member.actor)throw Error('An edit cannot impersonate another builder.');result=model.apply(msg.transaction);}
    else if(msg.sequence!==model.nextSequence(member.actor))result={ok:false,error:'Resync before changing your undo history.'};
    else result=model[msg.type](member.actor);
    const ack={id:msg.id,ok:result.ok,error:result.error||null};requests.set(key,{message:msg,ack});
    // Old successful requests also consume their actor sequence, so evicted receipts cannot repeat an undo.
    if(requests.size>1024)requests.delete(requests.keys().next().value);
    publish(result,member.actor,ack);
   }catch(e){send({type:'error',message:e.message});}
  }
  return {receive,close};
 }
 function startTest(){const doc=model.snapshot();testing={id:root.crypto.randomUUID(),document:doc};play?.register(testing);for(const m of members.values())m.send?.({type:'test',test:testing});onTest(testing);return testing;}
 return {session:local,connect,play:message=>play?.receive(actor,message),people:roster,test:startTest,presence:p=>{hostPresence=M().json(p);people();},snapshot:model.snapshot};
}
function guest({actor,token,name='Builder',saved=null,persist=()=>{},validateDefinition,onChange=()=>{},onState=()=>{},onPeople=()=>{},onTest=()=>{},onPlay=()=>{}}){
 let doc=saved?.document?M().validate(saved.document):null,pending=saved?.pending?M().json(saved.pending):null,sequence=1,history={undo:0,redo:0},epoch=null,send=null,connected=false,lastError=null,mirror=null,testId=null;
 function stash(){return persist({document:doc?M().json(doc):null,pending:pending?M().json(pending):null});}
 function checkpoint(){try{const saved=stash();saved?.catch?.(e=>report('Could not save reconnect recovery: '+e.message));}catch(e){report('Could not save reconnect recovery: '+e.message);}}
 function report(message){lastError=message;onState({connected,pending:!!pending,error:lastError});}
 function applyAck(ack){if(!ack||ack.id!==pending?.id)return;pending=null;if(ack.ok)lastError=null;checkpoint();if(!ack.ok)report(ack.error||'Your change conflicts with a newer edit.');}
 function transmitPending(){const id=pending?.id;if(!id)return;const saved=stash(),deliver=()=>{if(connected&&pending?.id===id)send(pending);};if(saved?.then)saved.then(deliver).catch(e=>report('Could not preserve the pending edit: '+e.message+' · keep a local copy before leaving.'));else deliver();}
 function request(message){if(!connected||!doc)return {ok:false,error:'Reconnect before editing. Your saved draft is still available.'};if(pending)return {ok:false,error:'Waiting for the host to confirm your previous edit.'};
  pending={...message,id:root.crypto.randomUUID()};try{transmitPending();}catch(e){pending=null;return {ok:false,error:'Could not preserve the pending edit: '+e.message};}report(null);return {ok:true,pending:true};
 }
 function receive(raw){try{const msg=M().json(raw);
  if(msg.type==='error'){report(msg.message);return;}
  if(msg.type==='play'){onPlay(msg);return;}
  if(msg.type==='people'){onPeople(msg.people);return;}
  if(msg.type==='test'){if(msg.test?.id!==testId){const test={id:msg.test.id,document:M().validate(msg.test.document)};validateDefinition?.(test.document);testId=test.id;onTest(test);}return;}
  if(msg.type==='state'){
   const next=M().validate(msg.document);validateDefinition?.(next);
   if(doc&&doc.id!==next.id&&pending){report('This room has changed. Your pending edit is kept locally; reconnect to its original build.');return;}
   doc=next;epoch=msg.epoch;sequence=msg.sequence;history=msg.history;mirror=M().session(doc,{validateDefinition});connected=true;lastError=null;applyAck(msg.ack);checkpoint();onChange(doc);onPeople(msg.people);onState({connected,pending:!!pending,error:lastError});
   if(msg.test&&msg.test.id!==testId){testId=msg.test.id;onTest(msg.test);}if(pending)transmitPending();return;
  }
  if(msg.type==='commit'){
   if(!doc||epoch!==msg.epoch||msg.revision>doc.revision+1){send?.({type:'sync'});return;}
   if(msg.revision===doc.revision+1){const tx={...msg.transaction,sequence:mirror.nextSequence(msg.transaction.actor)},result=mirror.apply(tx);if(!result.ok){send?.({type:'sync'});return;}doc=mirror.snapshot();}
   sequence=msg.sequence;history=msg.history;applyAck(msg.ack);checkpoint();onChange(doc);onState({connected,pending:!!pending,error:lastError});
  }
 }catch(e){report('Could not receive the shared level: '+e.message);}}
 const session={snapshot:()=>{if(!doc)throw Error('Waiting for the shared level.');return M().json(doc);},history:()=>({...history}),submit:(_a,edits)=>{try{return request({type:'edit',transaction:{document:doc.id,actor,sequence,base:doc.revision,changes:M().changes(doc,edits)}});}catch(e){return {ok:false,error:e.message};}},undo:()=>request({type:'undo',sequence}),redo:()=>request({type:'redo',sequence})};
 return {session,receive,connect:sender=>{send=sender;connected=false;sender({type:'hello',actor,token,name});},disconnect:()=>{connected=false;send=null;onPlay({type:'play',event:'disconnected'});report('Connection lost. Your draft and pending edit are kept on this device.');},play:message=>{if(connected)send({type:'play',...message});},presence:p=>{if(connected)send({type:'presence',presence:p});},test:()=>{if(connected)send({type:'test'});},state:()=>({connected,pending:pending?M().json(pending):null,document:doc?M().json(doc):null,error:lastError}),exportRecovery:()=>({document:doc,pending})};
}
root.BladefallWorkshopCollaboration={host,guest};
})(globalThis);
