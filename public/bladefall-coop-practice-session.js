/* Guests submit buttons only. The host owns both knights and every shared mechanism. */
(function(root){
'use strict';
const buttons=['l','r','u','d','jump','dash','grab','strike','parry','portal','use','reset'];
const edges=new Set(['jump','dash','strike','parry','portal','use','reset']);
const pings=['ready','wait','red-circle','blue-square','gold-triangle','here'];
const clean=x=>Object.fromEntries(buttons.map(k=>[k,x?.[k]===true]));
function create({now=()=>Date.now(),send=()=>{},onPing=()=>{},roles=0,room=0,requireReady=false}={}){
 const P=root.BladefallCoopPracticeCore;
 const s={game:P.create(room,roles),connected:false,token:null,seq:-1,epoch:0,lastSeen:0,held:clean(),pending:{},previous:clean(),local:clean(),localPending:{},ready:[!requireReady,!requireReady],lastSnapshot:-1,lastSent:0};
 s.game.paused=true;
 const resetInputs=()=>{s.held=clean();s.pending={};s.previous=clean();s.local=clean();s.localPending={};};
 function broadcast(type='state',extra={}){s.lastSent=now();const state=P.view(s.game,1);if(type==='state')delete state.map;send({type,epoch:s.epoch,ready:s.ready.slice(),...extra,state});}
 function chooseRoom(index,swap=true){if(!Number.isInteger(index)||index<0||index>7)return false;s.game=P.create(index,s.game.roles^(swap?1:0));s.game.paused=true;s.epoch++;s.ready=[!requireReady,!requireReady];resetInputs();broadcast('epoch');return true;}
 function ready(player){if(!s.connected)return false;s.ready[player]=true;
  if(s.game.complete&&s.ready.every(Boolean))return chooseRoom((s.game.index+1)%8,true);
  s.game.paused=!s.ready.every(Boolean);broadcast('ready');return true;
 }
 function ping(kind,player=0,point){if(!pings.includes(kind))return false;if(point&&(!Number.isFinite(point.x)||!Number.isFinite(point.y)||point.x<0||point.x>640||point.y<0||point.y>360))return false;const m={type:'ping',player,kind,...(kind==='here'&&point?{point:{x:Math.round(point.x),y:Math.round(point.y)}}:{})};onPing(m);send(m);return true;}
 function receive(m){
  if(!m||typeof m!=='object')return false;
  if(m.type==='hello'){
   if(typeof m.token!=='string'||m.token.length<16||m.token.length>128||s.token&&s.token!==m.token)return false;
   const rejoin=!!s.token;if(rejoin)s.epoch++;s.token=m.token;s.connected=true;s.lastSeen=now();s.seq=-1;s.ready=[!requireReady,!requireReady];s.game.paused=requireReady;resetInputs();
   broadcast('welcome',{rejoin});return true;
  }
  if(!s.connected||m.token!==s.token)return false;
  if(m.type==='input'){
   if(m.epoch!==s.epoch||!Number.isSafeInteger(m.seq)||m.seq<=s.seq)return false;
   const input=clean(m.buttons);for(const k of edges)if(input[k]&&!s.previous[k])s.pending[k]=true;
   s.previous=input;s.held=input;s.seq=m.seq;s.lastSeen=now();return true;
  }
  if(m.type==='ready'&&m.epoch===s.epoch){s.lastSeen=now();return ready(1);}
  if(m.type==='ping'){s.lastSeen=now();return ping(m.kind,1,m.point);}
  return false;
 }
 function local(input){const next=clean(input);for(const k of edges)if(next[k]&&!s.local[k])s.localPending[k]=true;s.local=next;}
 function disconnect(){s.connected=false;s.game.paused=true;s.ready=[false,false];resetInputs();broadcast('pause');}
 function tick(){
  if(s.connected&&now()-s.lastSeen>1500)disconnect();
  s.game.paused=!s.connected||!s.ready.every(Boolean);
  if(s.game.paused||s.game.complete){if(s.connected&&now()-s.lastSent>=500)broadcast();return;}
  const oldEpoch=s.game.epoch;
  P.step(s.game,[{...s.local,...s.localPending},{...s.held,...s.pending}]);s.pending={};s.localPending={};
  if(s.game.epoch!==oldEpoch){s.epoch++;resetInputs();broadcast('epoch');}
  if(s.game.complete){s.ready=[false,false];broadcast('complete');}
  else if(s.game.frame%3===0){broadcast();s.lastSnapshot=s.game.frame;}
 }
 return {state:s,receive,local,tick,disconnect,chooseRoom,ready:()=>ready(0),ping:(kind,point)=>ping(kind,0,point),snapshot:player=>P.view(s.game,player)};
}
root.BladefallCoopPracticeSession={create,clean};
})(globalThis);
