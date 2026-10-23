/* Ascend quests you go and do (7.375), for the same three people as Explore's (bladefall-quest-errands.js):
     Black Woods, Elsie: the lantern moths have her lantern. They wait on the road ahead and move on as you come
       close, out through her branch; catch them where they settle, carry the lantern back to her kitchen. Die and
       the moths take it back.
     Broken Causeway, Silas: strike the governor's bright tooth at the end of his branch (anything else only
       clangs); take the winding key from his back and hang it at the top of the next climb, on the toll hook.
     Ruined Keep, the Archivist: three accounts in his branch: one bricked up (strike it open), one at the top of
       the gallery climb, and the bell-ringer's pages in the rain room (gather them before the wind takes them back).
   The heart is given when you hand the thing over, not for touching the end of the branch. Every spot is a point on
   the room's own intended route (routePath), so it is always reachable. Nothing runs while a route is watched. */
(function(root){
'use strict';
const KEY='bladefall.climb.errands.v1';
const QUESTS={
 refuge:{world:2,
  steps:[{kind:'chase',perches:[['cl2-w2-kitchen',.82],['cl2-w2-q-fork',.12],['cl2-w2-q-fork',.38],['cl2-w2-q-fork',.64],['cl2-w2-q-fork',.93]]},
         {kind:'carry',item:'lantern',to:'giver'}],
  lines:['The moths took my lantern, off into the trees past the kitchen. They never go far at a time. Could you follow them?',
         'Bring her home steady. If you fall, the moths will have her back.'],
  hud:['Follow the lantern moths','Bring the lantern to Elsie']},
 defector:{world:3,
  steps:[{kind:'tooth',at:['cl3-c3-q-governor',.9]},
         {kind:'carry',item:'key',from:'giver',to:['cl3-c3-chain','top']}],
  lines:['Thirty-nine, forty. The governor at the top of the ladder turns me. Strike its bright tooth; anything else and you only bruise your arm.',
         'Take the key from my back, would you? Hang it on the toll hook, at the top of the next climb. Where nobody can wind me.'],
  hud:['Strike the governor’s bright tooth','Hang the winding key on the toll hook']},
 archivist:{world:6,anyOrder:true,
  steps:[{kind:'break',at:['cl6-k6-q-stack',.5],hits:3},
         {kind:'find',at:['cl6-k6-q-gallery','top']},
         {kind:'gather',at:[['cl6-k6-q-rain',.18],['cl6-k6-q-rain',.38],['cl6-k6-q-rain',.58],['cl6-k6-q-rain',.78],['cl6-k6-q-rain',.95]],seconds:18},
         {kind:'carry',item:'accounts',to:'giver',after:3}],
  lines:['Three accounts of the night the gate fell: one bricked up in the stacks, one at the top of the gallery, and the bell-ringer’s pages, out in the rain. Bring them?',
         'The bell-ringer saw the counterweight. Bring them here.'],
  hud:['Find the three accounts','Bring the accounts to the Archivist']},
};
let ctx=null;   // the climb view's helpers, handed over each tick (bladefall-climb-view.js)
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{};}catch(e){return {};}};
const save=s=>{try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){}};
function state(id){const all=load();return all[id]||{step:0,perch:0,found:[]};}
function put(id,s){const all=load();all[id]=s;save(all);}
const handles=q=>!!(q&&QUESTS[q.id]);
/* A point on a room's intended route: a fraction along it, or its highest point. */
function spot(room,at){
 const path=ctx.routePath(ctx.defOf(room));if(!path||!path.length)return null;
 if(at==='top'){let best=path[0];for(const q of path)if(q.y<best.y)best=q;return {room,x:best.x,y:best.y-6};}
 const q=path[Math.min(path.length-1,Math.max(0,Math.round(at*(path.length-1))))];return {room,x:q.x,y:q.y-6};
}
function giverSpot(q){
 const d=ctx.defOf(q.from),who=(d.people||[]).find(p=>p.quest===q.id);if(!who)return null;
 return {room:q.from,x:who.c*8+4,y:who.ceiling?who.r*8+6:who.r*8+2};
}
const live=()=>ctx&&ctx.st&&ctx.st.world&&!ctx.st.view.replay&&!ctx.st.review&&!ctx.st.watching;
function questHere(){const w=ctx.st.world;const q=w.quests.find(q=>QUESTS[q.id]&&QUESTS[q.id].world===w.n);return q||null;}
const heldBy=()=>ctx.st._errandHeld||null;
/* ---------------------------------------------------------------- per tick */
function tick(c){
 ctx=c;if(!live())return;
 const q=questHere();if(!q||ctx.questDone(q))return;
 const Q=QUESTS[q.id],s=state(q.id),g=ctx.st.view.g,p=g.p,room=g.room.id;
 const met=ctx.st.spoke.has(q.from+':'+((ctx.defOf(q.from).people||[]).find(w=>w.quest===q.id)||{}).who);
 if(!met)return;
 const px=p.x+p.w/2,py=ctx.uprightY(g)+p.h/2,at=(sp,rx=9,ry=11)=>sp&&sp.room===room&&Math.abs(px-sp.x)<rx&&Math.abs(py-sp.y)<ry;
 const E=ctx.st._errand||(ctx.st._errand={deaths:g.deaths,strike:0,pages:null,hits:0,flash:0});
 const died=g.deaths>E.deaths;E.deaths=g.deaths;   // before the room check: dying can put you in another room
 if(E.room!==room){E.room=room;E.hits=0;}
 const strikeNew=p.strikeTimer>0&&!E.strike;E.strike=p.strikeTimer>0;
 const struck=box=>strikeNew&&ctx.Core.overlap(...ctx.Core.strikeBox(p),box.x-10,box.y-10,20,20);
 const step=Q.steps[s.step];if(!step)return;
 if(E.flash>0)E.flash--;
 const away=p.state==='dead'||p.state==='respawn';   // a body where it fell catches nothing
 if(step.kind==='chase'){
  const sp=spot(...step.perches[s.perch]);
  const last=s.perch===step.perches.length-1;
  if(!away&&sp&&sp.room===room&&Math.abs(px-sp.x)<(last?10:44)&&Math.abs(py-sp.y)<(last?12:40)){
   if(last){s.step++;put(q.id,s);ctx.st._errandHeld='lantern';ctx.announce('The lantern · bring it to Elsie',170);}
   else{E.fly={from:sp,t:0};s.perch++;put(q.id,s);}
  }
 }
 if(step.kind==='carry'){
  const item=step.item;
  if(heldBy()!==item){
   // pick it up: from the giver (Silas's key), or where it was dropped
   const from=step.from==='giver'?giverSpot(q):s.dropped?{room:s.dropped.room,x:s.dropped.x,y:s.dropped.y}:null;
   if(item==='accounts'||at(from,16,18)){ctx.st._errandHeld=item;if(step.from==='giver')ctx.announce('The winding key',140);}
  }else{
   if(died){ctx.st._errandHeld=null;
    if(item==='lantern'){s.step=0;s.perch=QUESTS.refuge.steps[0].perches.length-1;ctx.announce('The moths take it back',160);}
    else if(item==='key')ctx.announce('Silas catches the key',140);
    put(q.id,s);return;}
   const to=step.to==='giver'?giverSpot(q):spot(...step.to);
   if(!away&&at(to,14,18)){ctx.st._errandHeld=null;s.step++;put(q.id,s);ctx.claim(q);ctx.announce(q.id==='defector'?'Hung on the hook':'Handed over',150);}
  }
 }
 if(step.kind==='tooth'||Q.anyOrder){
  if(step.kind==='tooth'){const sp=spot(...step.at);if(sp&&sp.room===room){const open=(g.frame%144)<44;
   if(struck(sp)){if(open){s.step++;put(q.id,s);ctx.announce('The governor stops · take the key from Silas',190);}else{E.flash=8;ctx.announce('Clang · wait for the bright tooth',90);}}}}
 }
 if(Q.anyOrder&&s.step<3){
  for(const [i,st] of Q.steps.slice(0,3).entries()){if(s.found.includes(i))continue;
   if(st.kind==='break'){const sp=spot(...st.at);if(sp&&sp.room===room){
     if(!s.open?.includes(i)){if(struck(sp)){E.hits++;E.flash=6;if(E.hits>=st.hits){(s.open||(s.open=[])).push(i);put(q.id,s);ctx.announce('The bricked-up shelf',120);}}}
     else if(at(sp))found(q,s,i);}}
   if(st.kind==='find'&&at(spot(...st.at)))found(q,s,i);
   if(st.kind==='gather'){
    const pages=st.at.map(a=>spot(...a));E.got=E.got||[];
    pages.forEach((sp,n)=>{if(!E.got.includes(n)&&at(sp)){E.got.push(n);if(!E.pages)E.pages={t:st.seconds*60};}});
    if(E.got.length===pages.length){E.pages=null;E.got=[];found(q,s,i);}
   }
  }
  if(E.pages&&--E.pages.t<=0){E.pages=null;E.got=[];ctx.announce('The wind takes the pages back',150);}
 }
}
function found(q,s,i){s.found.push(i);if(s.found.length>=3)s.step=3;put(q.id,s);ctx.announce(s.found.length>=3?'All three accounts · bring them to the Archivist':'An account · '+(3-s.found.length)+' to go',170);}
/* ---------------------------------------------------------------- drawing, in room coordinates */
function draw(b,c){
 ctx=c;if(!ctx.st.world)return;const q=questHere();if(!q)return;
 const g=ctx.st.view.g,room=g.room.id,t=g.frame,Q=QUESTS[q.id],s=state(q.id),done=ctx.questDone(q),E=ctx.st._errand||{};
 const R=(x,y,w,h,col)=>{b.fillStyle=col;b.fillRect(Math.round(x),Math.round(y),w,h);};
 const step=Q.steps[s.step];
 // moths
 if(!done&&step?.kind==='chase'){const sp=spot(...step.perches[s.perch]);if(sp&&sp.room===room){
  let x=sp.x,y=sp.y;if(E.fly&&E.fly.from.room===room&&E.fly.t<40){const k=E.fly.t++/40;x=E.fly.from.x+(sp.x-E.fly.from.x)*k;y=E.fly.from.y+(sp.y-E.fly.from.y)*k-Math.sin(k*Math.PI)*20;}
  lantern(b,x,y,t,true);}}
 // the gear stays where it was, stopped once struck
 if(q.id==='defector'){const sp=spot(...Q.steps[0].at);if(sp&&sp.room===room)gear(b,sp.x,sp.y,t,s.step>=1||done,(t%144)<44,E.flash);}
 if(q.id==='defector'&&(s.step>=2||done)){const sp=spot('cl3-c3-chain','top');if(sp&&sp.room===room){R(sp.x-1,sp.y-8,2,8,'#7c6c55');R(sp.x-3,sp.y-8,6,1,'#7c6c55');R(sp.x-1,sp.y-6,2,4,'#d0a85f');}}
 if(q.id==='defector'&&s.step===1&&!done){const sp=spot('cl3-c3-chain','top');if(sp&&sp.room===room){R(sp.x-1,sp.y-8,2,8,'#7c6c55');R(sp.x-3,sp.y-8,6,1,'#7c6c55');}}
 if(Q.anyOrder&&!done){
  Q.steps.slice(0,3).forEach((st,i)=>{if(s.found.includes(i))return;
   if(st.kind==='break'){const sp=spot(...st.at);if(sp&&sp.room===room){if(!s.open?.includes(i)){R(sp.x-7,sp.y-9,14,14,'#6d6876');for(let r=0;r<3;r++)R(sp.x-7,sp.y-9+r*5,14,1,'#4e4a57');if(E.flash&&E.room===room)R(sp.x-7,sp.y-9,14,14,'rgba(255,255,255,.3)');}else book(b,sp.x,sp.y,t);}}
   if(st.kind==='find'){const sp=spot(...st.at);if(sp&&sp.room===room)book(b,sp.x,sp.y,t);}
   if(st.kind==='gather')st.at.forEach((a,n)=>{const sp=spot(...a);if(sp&&sp.room===room&&!(E.got||[]).includes(n)){const w=Math.sin(t/8+n);R(sp.x-2+w,sp.y-3,4,5,'#e6dcc4');R(sp.x-1+w,sp.y-2,2,1,'#8d8274');}});
  });
  if(E.pages){b.fillStyle='#e6dcc4';b.font='6px monospace';b.textAlign='center';b.fillText(Math.ceil(E.pages.t/60)+'s',g.p.x+4,ctx.uprightY(g)-6);}
 }
 // what you carry
 const held=heldBy();if(held&&!done){const x=g.p.x+4-g.p.facing*6,y=ctx.uprightY(g)+2;
  if(held==='lantern')lantern(b,x,y,t,false);else if(held==='key'){R(x-1,y-6,2,5,'#d0a85f');R(x-2,y-7,4,1,'#d0a85f');}else book(b,x,y+2,t);}
}
function lantern(b,x,y,t,moths){
 const gl=b.createRadialGradient(x,y,0,x,y,12);gl.addColorStop(0,'rgba(255,233,168,.45)');gl.addColorStop(1,'rgba(255,233,168,0)');b.fillStyle=gl;b.fillRect(x-12,y-12,24,24);
 b.fillStyle='#f1d991';b.fillRect(Math.round(x-2),Math.round(y-3),4,5);b.fillStyle='#6b5a3e';b.fillRect(Math.round(x-1),Math.round(y-4),2,1);
 if(moths)for(let i=0;i<5;i++){const a=t/9+i*1.3;b.fillStyle='#c4ecd0';b.fillRect(Math.round(x+Math.cos(a)*7),Math.round(y-5+Math.sin(a*1.4)*4),1+(t+i)%2,1);}
}
function book(b,x,y,t){const bob=Math.round(Math.sin(t/14));b.fillStyle='#7c5a9a';b.fillRect(Math.round(x-3),Math.round(y-4+bob),6,5);b.fillStyle='#bca4db';b.fillRect(Math.round(x-3),Math.round(y-4+bob),6,1);}
function gear(b,x,y,t,stop,open,flash){
 b.save();b.translate(Math.round(x),Math.round(y-4));b.rotate(stop?0:t*(Math.PI*2/144));
 for(let i=0;i<8;i++){b.rotate(Math.PI/4);b.fillStyle=i===7&&!stop?(open?'#fff1b8':'#a87c45'):stop?'#665d4b':'#d0a85f';b.fillRect(-1,-9,3,4);}
 b.fillStyle=stop?'#665d4b':'#d0a85f';b.beginPath();b.arc(0,0,6,0,7);b.fill();b.fillStyle='#292c2d';b.fillRect(-1,-1,2,2);
 if(flash){b.fillStyle='rgba(255,255,255,.4)';b.beginPath();b.arc(0,0,8,0,7);b.fill();}b.restore();
}
/* What the giver says now, and the HUD line. */
function line(q,done){if(!handles(q)||done)return null;const s=state(q.id),Q=QUESTS[q.id];return Q.lines[Math.min(Q.lines.length-1,s.step>=(Q.anyOrder?3:1)?1:0)];}
function hud(q){if(!handles(q))return null;const s=state(q.id),Q=QUESTS[q.id];
 if(Q.anyOrder)return s.step>=3?Q.hud[1]:Q.hud[0]+' · '+s.found.length+'/3';return Q.hud[Math.min(Q.hud.length-1,s.step)];}
/* Its heart comes from handing the thing over, not from the end of the branch. */
const ownsReward=q=>handles(q);
/* Where each step's things are (for checks): resolved spots per step. */
function where(id){if(!ctx)return null;const Q=QUESTS[id],q=ctx.st.world&&ctx.st.world.quests.find(x=>x.id===id);
 return Q.steps.map(st=>st.perches?st.perches.map(a=>spot(...a)):st.at?(Array.isArray(st.at[0])?st.at.map(a=>spot(...a)):spot(...st.at)):st.to==='giver'?giverSpot(q):st.to?spot(...st.to):null);}
root.BladefallClimbErrands=Object.freeze({QUESTS,tick,draw,line,hud,ownsReward,handles,where,state,reset:id=>{const all=load();delete all[id];save(all);}});
})(typeof globalThis!=='undefined'?globalThis:window);
