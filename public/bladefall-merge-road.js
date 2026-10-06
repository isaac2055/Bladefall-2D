/* Merge Pitches (7.257): the title menu, and Pitch C · "The road itself".

   Pitch C plays the base game's own Outskirts road. Two stretches of it are pockets: when the knight walks
   into one, the camera pulls back until the whole stretch fills the screen, and that stretch plays in the
   Precision Core (precision.html?pitch=pocket-…, a transparent frame laid exactly over the world). The
   pocket's floor is the road's ground line, so the knight walks in, solves one screen, and walks out onto
   the base game's road where the pocket's right edge meets it; the camera closes back in.

   Scale: one precision pixel is four world units, so both knights stand 44 units tall. A pocket is one
   40x23-tile screen: 1280 x 736 units, its floor (row 18) on the world's ground (y = 0).

   This file owns the session; the base game only answers three hooks (all keyed on G.mergeRoad):
   saveRunAtStage leaves the Continue save alone, the renderer skips a knight marked mergeHidden, and
   the gate trials stand aside. Pitches A and B live entirely in precision.html. */
(function(root){
'use strict';
const PX=4,ROOM_W=1280,FLOOR_UP=144*PX;            // the pocket's top-left is 576 units above the ground
const POCKETS=[
 {id:'pocket-a',room:'mp-pocket-mile',x0:7440,name:'The Fallen Mile'},   // over the Hollow Mile's two pits; lets out on the ground at 8680
 {id:'pocket-b',room:'mp-pocket-muster',x0:9640,name:'Broken Muster'},
];
const START_X=6980,END_X=11900,POCKET_VH=800;
let S=null;   // the session: {pockets:[{...,frame,ready,done}], active, phase, t, ...}

/* ---------------------------------------------------------------- the menu */
function menu(){
 if(typeof showOvHTML!=='function')return;
 mode='merge-menu';
 showOvHTML(`<div class="card"><h1 class="ovh">Merge Pitches</h1><p class="ovsub">Three ways the new physics could carry more of the base game. Playable prototypes, not decisions.</p>
  <button class="choice" id="mpClimb"><div class="cname">The Climb · worlds 1–9</div><div class="cdesc">Pitch B, carried through the first nine worlds: each world one continuous place, a fire at the start of every section, easy worlds first. The hardest rooms are kept for later.</div></button>
  <button class="choice" id="mpRbr"><div class="cname">Room by Room · the whole game</div><div class="cdesc">Pitch A, carried through every region: the base game’s twenty, then the twenty Fractured. Quests branch off the road and come back. Regions appear as they are built.</div></button>
  <button class="choice" id="mpOutskirts"><div class="cname">A · The Outskirts, room by room</div><div class="cdesc">The Outskirts as six linked screens in the new physics. Rooms slide into each other; the region's people speak as you pass; Mara's bearings open the way.</div></button>
  <button class="choice" id="mpFrostfell"><div class="cname">B · Frostfell, one mountain</div><div class="cdesc">Frostfell as one scrolling climb with no screens. Ice, wind and feathers; hearths keep your place; Nim follows.</div></button>
  <button class="choice" id="mpRoad"><div class="cname">C · The road itself</div><div class="cdesc">The real base-game road. Where it breaks, the camera pulls back and that stretch plays in the new physics. Walk out onto the road again.</div></button>
  <button class="bigbtn ghost" id="mpBack">Back</button></div>`);
 document.getElementById('mpClimb').onclick=()=>{location.href='precision.html?pitch=climb';};
 document.getElementById('mpRbr').onclick=()=>{location.href='precision.html?pitch=rbr';};
 document.getElementById('mpOutskirts').onclick=()=>{location.href='precision.html?pitch=outskirts';};
 document.getElementById('mpFrostfell').onclick=()=>{location.href='precision.html?pitch=frostfell';};
 document.getElementById('mpRoad').onclick=startRoad;
 document.getElementById('mpBack').onclick=()=>titleScreen();
}

/* ---------------------------------------------------------------- Pitch C */
function startRoad(){
 try{showOverlay(false);}catch(e){}
 beginRun(0,null,{hp:1,dmg:1},{startStage:0,levelSelect:true});
 S={pockets:POCKETS.map(p=>({...p,frame:null,ready:false,done:false,lastMsg:''})),active:null,phase:'road',t:0,ended:false};
 G.mergeRoad=S;
 // Wait for the run's first frame, then stand the knight at Hollow Mile with the road ahead.
 let tries=0;const place=()=>{
  if(!G||!G.p||++tries>200)return;
  if(typeof mode!=='undefined'&&mode!=='play'){setTimeout(place,50);return;}
  G.mergeRoad=S;G.p.x=START_X;G.p.y=0;G.p.vx=G.p.vy=0;
  try{BFCamera.reset(Math.max(0,START_X-VW*.35),0);}catch(e){}
  clearPockets();preload(S.pockets[0]);
  toast('Merge Pitch C · walk on. Where the road breaks, the new physics takes over.',3400);
 };
 setTimeout(place,80);
 requestAnimationFrame(loop);
}
/* Until a pocket is cleared the base world there keeps only its scenery and its ground: its ledges, foes and
   props would sit in the pocket's way. Once it is cleared the road's own ledges come back, so walking back
   over that stretch is the base game again. */
function clearPockets(){
 for(const pk of S.pockets){
  const a=pk.x0-30,b=pk.x0+ROOM_W+30,inside=o=>o.x>a&&o.x<b,keep=o=>!inside(o)||o.type==='scenery'||(o.type==='plat'&&!(o.y>0));
  pk.removed=G.obstacles.filter(o=>!keep(o)&&o.type!=='enemy');
  G.obstacles=G.obstacles.filter(keep);
  if(G.enemies)G.enemies=G.enemies.filter(e=>!inside(e));
 }
}
function frameFor(pk){
 if(pk.frame)return pk.frame;
 const f=document.createElement('iframe');
 f.src=`precision.html?pitch=${pk.id}&v=${typeof VERSION!=='undefined'?VERSION:'0'}`;
 f.title='Merge pocket';f.setAttribute('allowtransparency','true');
 Object.assign(f.style,{position:'fixed',left:'0',top:'0',width:'100vw',height:'100vh',border:'0',background:'transparent',
  zIndex:'40',opacity:'0',visibility:'hidden',pointerEvents:'none',colorScheme:'normal'});
 document.body.appendChild(f);pk.frame=f;return f;
}
function preload(pk){if(pk&&!pk.done)frameFor(pk);}
addEventListener('message',e=>{
 const m=e.data;if(!m||m.source!=='bladefall-pcore'||!S)return;
 const pk=S.pockets.find(p=>p.frame&&p.frame.contentWindow===e.source);if(!pk)return;
 if(m.type==='pocket-ready'){pk.ready=true;sendFrame(pk,true);}
 if(m.type==='pocket-cleared'&&S.active===pk&&S.phase==='pocket')leavePocket(pk,m);
});

/* World units to the screen, from the respec renderer's own mapping: x = wx - G.cam, y = GROUND_Y + camY - wy,
   in canvas pixels, which LittleJS stretches over the window. */
function screenOf(){
 const cv=typeof mainCanvas!=='undefined'?mainCanvas:document.querySelector('#gameContainer canvas');
 const r=cv.getBoundingClientRect(),k=r.height/cv.height;
 return {r,k};
}
function sendFrame(pk,force){
 if(!pk.frame||!pk.frame.contentWindow)return;
 const {r,k}=screenOf();
 const ox=r.left+(pk.x0-G.cam)*k,oy=r.top+(GROUND_Y+(G.camY||0)-FLOOR_UP)*k,scale=PX*k;
 const key=[ox.toFixed(1),oy.toFixed(1),scale.toFixed(3)].join();
 if(!force&&key===pk.lastMsg)return;pk.lastMsg=key;
 pk.frame.contentWindow.postMessage({source:'bladefall-road',type:'pocket-frame',ox,oy,scale},'*');
}

/* ---------------------------------------------------------------- per frame */
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
function ratioFor(vh){return Math.min(2.5,vh/innerHeight);}
function closeRatio(){const z=Math.min(1.15,Math.max(.85,+(meta&&meta.viewZoom)||1));return meta&&meta.viewScale==='window'?1:Math.min(2.5,400/z/innerHeight);}
function loop(){
 if(!S||!G||G.mergeRoad!==S){S=null;return;}
 requestAnimationFrame(loop);
 const p=G.p;if(!p)return;
 if(S.phase==='road'){
  if(mode!=='play')return;
  const next=S.pockets.find(pk=>!pk.done);
  if(next){
   if(p.x>next.x0-1600)preload(next);
   if(!next.ready&&p.x>next.x0){p.x=next.x0;p.vx=0;}   // still loading: the road waits at the edge
   if(p.x>=next.x0+10&&p.x<next.x0+200&&p.vx>=0&&next.ready)enterPocket(next);
  }else if(!S.ended&&p.x>END_X){S.ended=true;endCard();}
  return;
 }
 const pk=S.active;S.t++;
 if(S.phase==='opening'){
  // The camera pulls back until the pocket fills the frame, and centres on it.
  const k=ease(Math.min(1,S.t/42));
  canvasPixelRatio=S.r0+(S.r1-S.r0)*k;
  const vw=innerWidth*canvasPixelRatio,camX=pk.x0+ROOM_W/2-vw/2;
  G.cam=S.cam0+(camX-S.cam0)*k;G.camY=(S.camY0||0)*(1-k);
  pk.frame.style.visibility='visible';pk.frame.style.opacity=String(Math.max(0,(k-.35)/.65));
  sendFrame(pk);
  if(S.t>=44){S.phase='pocket';S.t=0;p.mergeHidden=true;pk.frame.style.opacity='1';pk.frame.style.pointerEvents='auto';
   sendFrame(pk,true);pk.frame.contentWindow.postMessage({source:'bladefall-road',type:'pocket-go'},'*');
   try{pk.frame.focus();pk.frame.contentWindow.focus();}catch(e){}}
  return;
 }
 if(S.phase==='pocket'){sendFrame(pk);return;}
 if(S.phase==='closing'){
  const k=ease(Math.min(1,S.t/34));
  canvasPixelRatio=S.r1+(S.r0-S.r1)*k;
  const vw=innerWidth*canvasPixelRatio,camX=Math.max(0,p.x-vw*.4);
  G.cam=S.cam1+(camX-S.cam1)*k;G.camY=0;
  if(pk.frame)pk.frame.style.opacity=String(Math.max(0,1-S.t/10));
  if(S.t>=36){
   if(pk.frame){pk.frame.remove();pk.frame=null;}
   S.phase='road';S.active=null;
   try{applyViewScale();}catch(e){canvasPixelRatio=S.r0;}
   try{BFCamera.reset(G.cam,G.camY||0);}catch(e){}
   mode='play';try{showGameUI(true);}catch(e){}
   try{root.focus();}catch(e){}
   preload(S.pockets.find(q=>!q.done));
  }
 }
}
function enterPocket(pk){
 S.active=pk;S.phase='opening';S.t=0;
 mode='merge-pocket';try{showGameUI(false);}catch(e){}
 const p=G.p;p.vx=0;p.vy=0;p.x=pk.x0+16;p.y=0;
 S.r0=closeRatio();S.r1=ratioFor(Math.max(POCKET_VH,(ROOM_W+80)/(innerWidth/innerHeight)));
 S.cam0=G.cam;S.camY0=G.camY||0;
 sendFrame(pk,true);
}
function leavePocket(pk,m){
 // The precision knight's feet, in world units, become the base knight's place on the road.
 const p=G.p;
 // A few units above the road, so the ground catches him as he lands (a ledge only holds what falls onto it).
 p.x=pk.x0+(m.x+4)*PX;p.y=Math.max(0,FLOOR_UP-(m.y+11)*PX)+3;p.onGround=false;
 p.vx=(m.vx||0)*PX*.5;p.vy=0;p.mergeHidden=false;p.face=1;
 pk.done=true;pk.frame.style.pointerEvents='none';
 if(pk.removed){G.obstacles.push(...pk.removed);pk.removed=null;}
 S.phase='closing';S.t=0;S.cam1=G.cam;
 const left=S.pockets.filter(q=>!q.done).length;
 toast(left?`${pk.name} · back on the road`:`${pk.name} · that was the last pocket. The road is yours.`,2600);
}
function endCard(){
 mode='merge-menu';try{showGameUI(false);}catch(e){}
 showOvHTML(`<div class="card"><h1 class="ovh">Merge Pitch C</h1><p class="ovsub">The road itself: the base game ran the whole way, and the new physics took over only where the road broke. No wall, no menu and no frame to step into.</p>
  <button class="bigbtn" id="mpKeep">Keep walking</button><button class="bigbtn ghost" id="mpMenu">Back to Merge Pitches</button></div>`);
 document.getElementById('mpKeep').onclick=()=>{showOverlay(false);mode='play';showGameUI(true);};
 document.getElementById('mpMenu').onclick=()=>{G.mergeRoad=null;S=null;try{applyViewScale();}catch(e){}menu();};
}

/* precision.html's "Back to Merge Pitches" lands on index.html?pitches: open the menu once the title is up. */
function openFromQuery(){
 let q;try{q=new URLSearchParams(location.search);}catch(e){return;}
 if(!q.has('pitches'))return;
 let n=0;const wait=()=>{if(typeof mode!=='undefined'&&mode==='title'&&typeof showOvHTML==='function'){menu();return;}if(++n<200)setTimeout(wait,50);};wait();
}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',openFromQuery);else openFromQuery();

root.BladefallMergeRoad=Object.freeze({menu,startRoad,POCKETS,active:()=>S});
})(typeof window!=='undefined'?window:globalThis);
