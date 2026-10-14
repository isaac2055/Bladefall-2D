/* Authoritative Ascend frame stream over the builder's authenticated, ordered relay.
   Both peers run native physics from the pinned definition; only the host chooses frame inputs.
   No executable state or campaign saves are transferred. A missing frame stops the test. */
(function(root){
'use strict';
const keys=['l','r','u','d','jump','dash','grab','strike','parry','portal'];
const clean=input=>Object.fromEntries(keys.map(k=>[k,input?.[k]===true]));
function create({definition,role,send,onFrame=()=>{},onComplete=()=>{},onError=()=>{}}){
 if(role!=='host'&&role!=='guest')throw Error('Invalid shared Ascend role.');
 const engine=root.BladefallWorkshopAscendCoopCore,s=engine.create(definition);
 let connected=true,peerReady=false,frame=0,received=0,inputSeq=0,remoteSeq=-1,remoteAge=0,remote=clean(),done=false,retryPending=false;
 const pending=[];
 function stop(){connected=false;pending.length=0;remote=clean();}
 function fail(message){stop();onError(message);}
 function ready(){if(connected)send({ascend:'ready'});}
 function advance(inputs,retry=false){if(retry){engine.retry(s);done=false;}s.g.events.length=0;engine.step(s,inputs);onFrame(s);if(s.complete&&!done){done=true;onComplete(s);}}
 function receive(packet){
  if(!connected||!packet||typeof packet!=='object')return;
  if(packet.ascend==='ready'){if(!peerReady){peerReady=true;ready();}return;}
  if(!peerReady)return;
  if(role==='host'&&packet.ascend==='retry'){retryPending=true;return;}
  if(role==='host'&&packet.ascend==='input'){
   if(!Number.isSafeInteger(packet.seq)||packet.seq<=remoteSeq)return;
   remoteSeq=packet.seq;remote=clean(packet.input);remoteAge=0;return;
  }
  if(role==='guest'&&packet.ascend==='frame'){
   if(!Number.isSafeInteger(packet.seq)||packet.seq<=received)return;
   if(packet.seq!==received+1){fail('A shared frame was lost. Restart this test to resynchronize.');return;}
   if(!Array.isArray(packet.inputs)||packet.inputs.length!==2){fail('Invalid shared frame. Restart this test.');return;}
   if(pending.length>=600){fail('The shared preview fell behind. Restart this test to resynchronize.');return;}
   received=packet.seq;pending.push({seq:packet.seq,inputs:packet.inputs.map(clean),retry:packet.retry===true});if(packet.retry===true)done=false;
  }
 }
 function tick(input={}){
  if(!connected||!peerReady||done&&!retryPending)return;
  if(role==='host'){
   if(++remoteAge>30)remote=clean();
   const inputs=[clean(input),remote],retry=retryPending;retryPending=false;advance(inputs,retry);send({ascend:'frame',seq:++frame,inputs,...(retry?{retry:true}:{})});
  }else{
   send({ascend:'input',seq:++inputSeq,input:clean(input)});
   // Catch up after short transport stalls without skipping any physics frames.
   for(let n=0;n<8&&pending.length&&!done;n++){const next=pending.shift();advance(next.inputs,next.retry);frame=next.seq;}
  }
 }
 function requestRetry(){if(!connected||!peerReady)return;if(role==='host')retryPending=true;else send({ascend:'retry'});}
 return {ready,receive,tick,stop,requestRetry,state:()=>({simulation:s,role,connected,peerReady,frame,pending:pending.length})};
}
root.BladefallWorkshopAscendPlay={create};
})(globalThis);
