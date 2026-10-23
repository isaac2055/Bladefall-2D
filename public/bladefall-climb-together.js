/* Ascend Together (7.375): two-player puzzle rooms played like normal Ascend (Isaac: "just like normal ascend but
   built for two-player puzzles like portal 2", fullscreen, online). It replaces the old Two Banks page (7.370).
   - Online over the Ascend co-op link (bladefall-climb-coop.js: the four-letter code, PeerJS; ?coop=local for two
     tabs). The host starts the puzzles from the Co-op panel on the world map; the partner's game follows.
   - One shared room, both knights in it (bladefall-workshop-ascend-coop-core.js): plates, held doors, bells and
     stones answer either knight. The host picks each frame's two inputs and both games run the same native physics
     (bladefall-workshop-ascend-play.js), so the two screens never disagree.
   - A death retries the room for both. Both knights out of the room opens the next; three rooms in all
     (bladefall-climb-together-rooms.js, each proven by a two-knight route: scripts/together/prove.mjs).
   While a puzzle runs, the climb view steps aside (BladefallPitchView defers to the base view). */
(function(root){
'use strict';
const V=()=>root.BladefallPrecisionView,P=()=>root.BladefallPitchView,CO=()=>root.BladefallClimbCoop,DATA=()=>root.BladefallClimbTogetherRooms;
let cur=null;   // {role, index, engine, done}
const active=()=>!!cur;
function send(packet){CO()?.send?.({t:'tg',...packet});}
function overlay(html){const o=document.getElementById('pcOverlay');if(!o)return null;o.innerHTML=html;o.classList.add('show');return o;}
function hideOverlay(){const o=document.getElementById('pcOverlay');if(o){o.classList.remove('show');o.innerHTML='';}}
/* Begin room `index` (both games call this: the host when it chooses, the partner when told). */
function begin(index,role){
 const room=DATA().rooms[index];if(!room)return finishAll();
 const view=V().view;cur?.engine?.stop();
 const c=cur={role,index,done:false,started:Date.now()};
 c.engine=root.BladefallWorkshopAscendPlay.create({definition:room,role,send:packet=>{if(cur===c)send({frame:packet});},
  onFrame:s=>{if(cur!==c)return;s.g.p=s.g.players[role==='host'?0:1];V().workshopFrame(s.g);},
  onComplete:()=>{if(cur!==c||c.done)return;c.done=true;roomDone(c);},
  onError:message=>{if(cur!==c)return;view.paused=true;overlay(`<div class="pcCard"><h1>Lost the link</h1><p class="pcSub">${message}</p><button class="pcBtn" id="tgLeave">Back to the world map</button></div>`);document.getElementById('tgLeave').onclick=()=>leave(true);}});
 const g=c.engine.state().simulation.g;g.p=g.players[role==='host'?0:1];
 Object.assign(view,{g,replay:null,wipe:0,wipeTo:null,frameAcc:0,camRoom:null,trail:[],mode:'play',paused:false});
 hideOverlay();V().clearInput();
 c.engine.ready();
 P().climb?.announce?.(`${room.name} · ${index+1} of ${DATA().rooms.length}`,200);
}
function roomDone(c){
 const last=c.index>=DATA().rooms.length-1,view=V().view;view.paused=true;
 const secs=Math.round((Date.now()-c.started)/1000);
 overlay(`<div class="pcCard"><h1>${DATA().rooms[c.index].name}</h1><p class="pcSub">Both of you through · ${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}</p>
  ${c.role==='host'?(last?'<button class="pcBtn" id="tgNext" data-focus-first>Finish</button>':'<button class="pcBtn" id="tgNext" data-focus-first>Next room</button>'):'<p class="pcSub">Waiting for your partner to go on…</p>'}
  <button class="pcBtn ghost" id="tgLeave">Leave the puzzles</button></div>`);
 const next=document.getElementById('tgNext');if(next)next.onclick=()=>{if(last){send({end:true});finishAll();}else{send({start:c.index+1});begin(c.index+1,'host');}};
 document.getElementById('tgLeave').onclick=()=>leave(true);
}
function finishAll(){
 cur?.engine?.stop();cur=null;const view=V().view;view.paused=true;
 overlay(`<div class="pcCard"><h1>Together</h1><p class="pcSub">All ${DATA().rooms.length} rooms, both of you. More are on the way.</p><button class="pcBtn" id="tgBack" data-focus-first>Back to the world map</button></div>`);
 document.getElementById('tgBack').onclick=()=>{hideOverlay();backToClimb();};
}
function backToClimb(){const st=P().climb?.state?.();V().view.paused=false;if(st?.world)P().climb.startWorld(st.world.n);else P().climb?.menu?.();}
function leave(tell){if(tell)send({leave:true});cur?.engine?.stop();cur=null;hideOverlay();backToClimb();}
/* The host starts from the Co-op panel (once both of you are connected). */
function start(){if(CO()?.state?.().status!=='on'||CO().state().role!=='host')return false;send({start:0});begin(0,'host');return true;}
function receive(m){
 if(m.start!=null){begin(m.start,'guest');return;}
 if(m.end){finishAll();return;}
 if(m.leave){if(cur){cur.engine?.stop();cur=null;overlay(`<div class="pcCard"><h1>Your partner left the puzzles</h1><button class="pcBtn" id="tgBack" data-focus-first>Back to the world map</button></div>`);document.getElementById('tgBack').onclick=()=>{hideOverlay();backToClimb();};}return;}
 if(m.frame&&cur){cur.engine.receive(m.frame);}
}
/* Each frame from the view: your input goes to the shared room (the host's game runs it, the partner's follows). */
function tick(input){if(!cur)return false;if(!cur.done)cur.engine.tick(input);return true;}
/* Escape: a small menu (the climb's own pause menu is about its world). */
function pause(){
 if(!cur)return false;const view=V().view;
 if(view.paused){view.paused=false;hideOverlay();return true;}
 view.paused=true;
 overlay(`<div class="pcCard"><h1>${DATA().rooms[cur.index].name}</h1><p class="pcSub">${DATA().rooms[cur.index].hint}</p><p class="pcSub">Your partner keeps playing while this is open.</p>
  <button class="pcBtn" id="tgResume" data-back>Resume</button><button class="pcBtn ghost" id="tgRetry">Retry the room (both of you)</button><button class="pcBtn ghost" id="tgLeave">Leave the puzzles</button></div>`);
 document.getElementById('tgResume').onclick=()=>{view.paused=false;hideOverlay();};
 document.getElementById('tgRetry').onclick=()=>{cur.engine.requestRetry();view.paused=false;hideOverlay();};
 document.getElementById('tgLeave').onclick=()=>leave(true);
 return true;
}
/* Which room, and who is who, over the base view's title line (which would name the climb world behind it); the
   room's hint is already along the bottom. */
function hud(ctx,ox,oy,scale,fs){
 if(!cur)return;ctx.save();ctx.font=`${fs}px ui-monospace,Menlo,monospace`;ctx.textBaseline='top';
 const t=`Together · ${DATA().rooms[cur.index].name} · room ${cur.index+1} of ${DATA().rooms.length} · you are ${cur.role==='host'?'P1':'P2'}`,w=Math.max(ctx.measureText(t).width+fs,fs*34),y=oy+4;
 ctx.fillStyle='rgb(14,16,24)';ctx.fillRect(ox+4,y,w,fs*1.8);ctx.fillStyle='#7ad1c2';ctx.fillText(t,ox+4+fs/2,y+fs*.4);
 ctx.restore();
}
root.BladefallClimbTogether=Object.freeze({active,start,begin,receive,tick,pause,hud,leave,state:()=>cur&&{role:cur.role,index:cur.index,done:cur.done,frame:cur.engine.state().frame,simulation:cur.engine.state().simulation}});
})(typeof window!=='undefined'?window:globalThis);
