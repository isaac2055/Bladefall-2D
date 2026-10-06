/* Precision Core — touch controls (7.258). Phones and tablets play the new physics with two thumbs:

   Left thumb: a floating stick. It appears wherever the thumb lands and follows it if it drifts too far.
   Right thumb (default gestures, each re-mappable in Touch controls):
     tap ............ jump (a tap gives a full jump; "follows finger" makes a quick tap a short hop)
     swipe .......... dash in the swipe's direction (8-way). Swipe during a jump to jump-dash in one stroke.
     hold ........... grab: cling and climb while held; near a lantern, a hold picks it up and a second hold
                      throws it (stick down + hold sets it down)
     double-tap ..... parry
     two-finger swipe strike, aimed by the swipe
     two-finger tap . portal, aimed by the stick
   Every action can instead sit on an on-screen button. Pause and retry are the two small buttons top right;
   Android's back gesture also pauses.

   The view asks read(dt) for an input object once per loop and calls draw() after its HUD. Gesture timing
   runs on game time (the dt the view passes), so a 120 Hz screen and the test harness behave the same.
   Mouse input is ignored here: desktop play is unchanged. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
let api=null;           // set by init: {canvas, view, save, writeSave, overlayOpen, pause, retry, showOverlay, overlay, controlsCard}
let clock=0,active=false,everTouched=false;
const ptrs=new Map();   // pointerId → state
let stick=null;         // {id,ox,oy,x,y}
let multi=null;         // two-finger gesture {ids:[a,b],x0,y0,t0,done}
let lastTap=null;       // {x,y,t}
const pulses=[];        // {a,until}
const holdTail={jump:0,grab:0};      // a press keeps its action held at least until this time
const gapUntil={jump:0,grab:0,dash:0,strike:0,parry:0,portal:0};   // forced release so a quick second press is a new press
let dirOver=null;       // {l,r,u,d,until}
const fx=[];            // feedback marks {kind,x,y,dx,dy,t}
let hintUntil=0,lastSeenRoom=null,guarded=false,wasPlaying=false;

/* ---------------------------------------------------------------- settings ("mobile keybinds") */
const GESTURES={tap:'Tap',swipe:'Swipe',hold:'Hold',double:'Double-tap',tap2:'Two-finger tap',swipe2:'Two-finger swipe',button:'On-screen button'};
const CHOICES={jump:['tap','button'],dash:['swipe','button'],grab:['hold','button'],strike:['swipe2','button'],parry:['double','tap2','button'],portal:['tap2','double','button']};
const ACTION_NAMES={jump:'Jump',dash:'Dash',grab:'Grab · climb · carry / throw',strike:'Blade strike',parry:'Parry',portal:'Portal'};
const PRESETS={
 gestures:{jump:'tap',dash:'swipe',grab:'hold',strike:'swipe2',parry:'double',portal:'tap2'},
 mixed:{jump:'tap',dash:'swipe',grab:'hold',strike:'button',parry:'button',portal:'button'},
 buttons:{jump:'button',dash:'button',grab:'button',strike:'button',parry:'button',portal:'button'},
};
const PRESET_NAMES={gestures:'Gestures',mixed:'Gestures + buttons for blade, parry, portal',buttons:'Buttons only'};
const DEFAULTS={preset:'gestures',map:{...PRESETS.gestures},hand:'right',stick:'floating',swipe:'medium',tapJump:'full',
 haptics:true,opacity:.55,size:1,hints:true,fullscreen:true};
function settings(){
 const s=api.save;s.touch=s.touch||{};
 const t=Object.assign({},DEFAULTS,s.touch);t.map=Object.assign({},DEFAULTS.map,s.touch.map||{});
 return t;
}
function store(t){api.save.touch=t;api.writeSave(api.save);}
const SWIPE_PX={small:16,medium:24,large:34};
// Timing, in seconds of game time.
const WIN=.065,HOLD=.17,DOUBLE=.26,PRESS=.05,MIN_JUMP=.2,SHORT_JUMP=.05,DASH_LATE=.45,TAP2=.3;

/* ---------------------------------------------------------------- state helpers */
function gestureMap(){const m=settings().map,g={};for(const a in m)if(m[a]!=='button')g[m[a]]=a;return g;}
function pulse(a,dur=PRESS){if(clock<gapUntil[a])return;const live=pulses.find(p=>p.a===a&&p.until>clock);
 if(live){live.until=clock;gapUntil[a]=clock+1.5/60;pulses.push({a,from:gapUntil[a],until:gapUntil[a]+dur});return;}
 pulses.push({a,from:clock,until:clock+dur});}
function startHold(a,ptr){
 // A new press while the action still reads as held (a tail from the last tap) needs a released frame first.
 if(isHeld(a)){gapUntil[a]=clock+1.5/60;holdTail[a]=0;}
 ptr[a+'Held']=true;ptr[a+'From']=Math.max(clock,gapUntil[a]);
 holdTail[a]=Math.max(holdTail[a],ptr[a+'From']+(a==='jump'?(settings().tapJump==='full'?MIN_JUMP:SHORT_JUMP):PRESS));
}
function endHold(a,ptr){if(!ptr[a+'Held'])return;ptr[a+'Held']=false;}
function isHeld(a){if(clock<gapUntil[a])return false;if(clock<holdTail[a])return true;for(const p of ptrs.values())if(p[a+'Held']&&clock>=(p[a+'From']||0))return true;return false;}
function dir8(dx,dy){
 // Snap to eight directions; diagonals need a real diagonal (27°–63°), so a sideways flick is sideways.
 const ax=Math.abs(dx),ay=Math.abs(dy),ang=Math.atan2(ay,ax)*180/Math.PI,o={l:false,r:false,u:false,d:false};
 if(ang<63){if(dx<0)o.l=true;else o.r=true;}
 if(ang>27){if(dy<0)o.u=true;else o.d=true;}
 return o;
}
function override(o,dur=.12){dirOver={...o,until:clock+dur};}
function buzz(ms){try{if(settings().haptics&&navigator.vibrate)navigator.vibrate(ms);}catch(e){}}
function mark(kind,x,y,dx=0,dy=0){fx.push({kind,x,y,dx,dy,t:clock});if(fx.length>24)fx.shift();}
function game(){return api&&api.view&&api.view.g;}
/* When the knight is on a wall, by a lantern or carrying one, the right thumb waits to see a tap or a hold
   before acting: a tap is a jump (a wall jump), a hold is a grab (cling, pick up, throw). Elsewhere a press
   jumps at once and a hold that follows also grabs, so you cling to whatever wall the jump reaches. */
function wantsDefer(){
 const g=game();if(!g||!g.p)return false;const p=g.p,Core=C();
 if(p.carrying||p.state==='climb')return true;
 if(g.ents&&g.ents.some(e=>e.type==='lantern'&&!e.held&&!e.returning&&Core.overlap(p.x-4,p.y-4,p.w+8,p.h+8,e.x,e.y,e.w,e.h)))return true;
 try{return Core.solidAt(g,p.x-2,p.y,p.w,p.h-3)||Core.solidAt(g,p.x+2,p.y,p.w,p.h-3);}catch(e){return false;}
}

/* ---------------------------------------------------------------- layout (CSS pixels) */
function layout(){
 const w=innerWidth,h=innerHeight,t=settings(),s=t.size*Math.max(.8,Math.min(1.3,Math.min(w,h)/400)),m=t.map;
 const right=t.hand==='right';
 const X=x=>right?w-x:x;
 const spots={jump:[66,66,40],dash:[156,58,33],grab:[236,52,28],strike:[62,156,29],parry:[136,140,27],portal:[204,128,25]};
 const buttons=[];
 for(const a of Object.keys(spots))if(m[a]==='button'){const [x,y,r]=spots[a];buttons.push({a,x:X(x*s),y:h-y*s,r:r*s});}
 const ui=24*s,pause={x:X(30*s),y:30*s,r:ui*.8,ui:'pause'},retry={x:X(78*s),y:30*s,r:ui*.8,ui:'retry'};
 return {w,h,s,buttons,pause,retry,stickR:52*s,dead:9*s,right};
}
const GLYPH={jump:'⤒',dash:'➤',grab:'✊',strike:'⚔',parry:'⛨',portal:'◎'};

/* ---------------------------------------------------------------- pointer handling */
function inLeftZone(x,L){return L.right?x<L.w*.42:x>L.w*.58;}
function onDown(e){
 if(e.pointerType==='mouse')return;
 setActive(true);
 if(!api||api.overlayOpen())return;
 e.preventDefault();
 try{api.canvas.setPointerCapture(e.pointerId);}catch(err){}
 maybeFullscreen();
 const x=e.clientX,y=e.clientY,L=layout(),hit=b=>Math.hypot(x-b.x,y-b.y)<=b.r*1.25;
 if(hit(L.pause)){ptrs.set(e.pointerId,{role:'ui'});api.pause();return;}
 if(hit(L.retry)){ptrs.set(e.pointerId,{role:'ui'});api.retry();mark('tap',x,y);return;}
 for(const b of L.buttons)if(hit(b)){const p={role:'button',a:b.a,x,y};ptrs.set(e.pointerId,p);pressButton(b.a,p);return;}
 if(inLeftZone(x,L)){
  if(stick){ptrs.set(e.pointerId,{role:'ignore'});return;}
  const fixed=settings().stick==='fixed';
  const ox=fixed?(L.right?L.stickR*2:L.w-L.stickR*2):x,oy=fixed?L.h-L.stickR*2:y;
  stick={id:e.pointerId,ox,oy,x,y};ptrs.set(e.pointerId,{role:'stick'});return;
 }
 // Right side: one finger is a gesture; a second finger turns both into a two-finger gesture.
 const others=[...ptrs.entries()].filter(([id,p])=>p.role==='right'&&!p.multi);
 const p={role:'right',x0:x,y0:y,x,y,t0:clock,state:'pending',defer:false,dashed:false};
 ptrs.set(e.pointerId,p);
 if(others.length&&clock-others[0][1].t0<.35){
  const [oid,o]=others[0];
  // The first finger's jump has not happened yet (or only just); either way it is now half of a pair.
  if(o.state==='pending'){o.state='multi';}
  else{endHold('jump',o);endHold('grab',o);o.state='multi';}
  o.multi=p.multi=true;p.state='multi';
  multi={ids:[oid,e.pointerId],x0:(o.x+x)/2,y0:(o.y+y)/2,t0:clock,done:false};
  return;
 }
 const G=gestureMap();
 if(G.double&&lastTap&&clock-lastTap.t<DOUBLE&&Math.hypot(x-lastTap.x,y-lastTap.y)<56){
  lastTap=null;p.state='double';pulse(G.double);mark('double',x,y);buzz(8);return;
 }
 p.defer=!!(G.tap==='jump'&&G.hold==='grab'&&wantsDefer());
}
function onMove(e){
 if(e.pointerType==='mouse')return;
 const p=ptrs.get(e.pointerId);if(!p)return;e.preventDefault();
 const x=e.clientX,y=e.clientY;
 if(p.role==='stick'&&stick&&stick.id===e.pointerId){
  stick.x=x;stick.y=y;const L=layout(),dx=x-stick.ox,dy=y-stick.oy,d=Math.hypot(dx,dy);
  if(d>L.stickR&&settings().stick==='floating'){stick.ox=x-dx/d*L.stickR;stick.oy=y-dy/d*L.stickR;}
  return;
 }
 if(p.role==='right'){p.x=x;p.y=y;
  if(p.multi&&multi&&!multi.done){
   const [a,b]=multi.ids.map(id=>ptrs.get(id));if(!a||!b)return;
   const cx=(a.x+b.x)/2,cy=(a.y+b.y)/2,dx=cx-multi.x0,dy=cy-multi.y0,G=gestureMap();
   if(Math.hypot(dx,dy)>=SWIPE_PX[settings().swipe]&&G.swipe2){multi.done=true;const o=dir8(dx,dy);override(o,.14);pulse(G.swipe2);mark('swipe2',cx,cy,dx,dy);buzz(10);}
   return;
  }
  step(p);
 }
}
function onUp(e){
 if(e.pointerType==='mouse')return;
 const p=ptrs.get(e.pointerId);if(!p)return;
 ptrs.delete(e.pointerId);
 if(p.role==='stick'){if(stick&&stick.id===e.pointerId)stick=null;return;}
 if(p.role==='button'){releaseButton(p.a,p);return;}
 if(p.role!=='right')return;
 if(p.multi){
  if(multi&&multi.ids.includes(e.pointerId)){
   const rest=multi.ids.filter(id=>id!==e.pointerId&&ptrs.has(id));
   if(!rest.length){const G=gestureMap();if(!multi.done&&clock-multi.t0<TAP2&&G.tap2){pulse(G.tap2);mark('tap2',p.x,p.y);buzz(8);}multi=null;}
  }
  return;
 }
 const G=gestureMap();
 if(p.state==='pending'){
  // Lifted before the swipe window: a tap.
  if(G.tap==='jump'){startHold('jump',p);endHold('jump',p);}else if(G.tap)pulse(G.tap);
  lastTap={x:p.x,y:p.y,t:clock};mark('tap',p.x,p.y);
 }else if(p.state==='jumping'){
  endHold('jump',p);endHold('grab',p);
  if(clock-p.t0<.22&&!p.dashed&&Math.hypot(p.x-p.x0,p.y-p.y0)<14)lastTap={x:p.x,y:p.y,t:clock};
 }else if(p.state==='holding'){endHold('grab',p);endHold('jump',p);}
}
/* The right thumb's state machine, run on every move and once per loop. */
function step(p){
 const G=gestureMap(),D=SWIPE_PX[settings().swipe],dx=p.x-p.x0,dy=p.y-p.y0,far=Math.hypot(dx,dy)>=D,age=clock-p.t0;
 if(p.state==='pending'){
  if(far&&G.swipe){swipe(p,dx,dy,G);p.state='swiped';return;}
  // Already moving at the window's end: probably a slower swipe on its way, so wait a little longer before jumping.
  const travelling=Math.hypot(dx,dy)>=D*.35&&age<WIN+.07;
  if(!p.defer&&age>=WIN&&!travelling){
   if(G.tap==='jump'){startHold('jump',p);p.state='jumping';mark('press',p.x0,p.y0);}
   else if(G.hold&&age>=HOLD){startHold(G.hold==='grab'?'grab':G.hold,p);p.state='holding';mark('hold',p.x,p.y);}
   else if(!G.tap&&!G.hold)p.state='idle';
   return;
  }
  if(p.defer&&age>=HOLD&&G.hold){startHold('grab',p);p.state='holding';mark('hold',p.x,p.y);buzz(6);}
  return;
 }
 if((p.state==='jumping'||p.state==='holding')&&!p.dashed&&far&&G.swipe&&age<DASH_LATE+HOLD){
  // A swipe while the thumb is still down: the jump-dash in one stroke, or a dash off a wall you hold.
  p.x0=p.x;p.y0=p.y;swipe(p,dx,dy,G);
  if(p.state==='holding'){endHold('grab',p);}
  return;
 }
 if(p.state==='jumping'&&G.hold==='grab'&&!p.grabHeld&&age>=HOLD&&!far){startHold('grab',p);}
}
function swipe(p,dx,dy,G){
 p.dashed=true;const o=dir8(dx,dy);override(o,.12);pulse(G.swipe);mark('swipe',p.x,p.y,dx,dy);
}
function pressButton(a,p){
 mark('button',p.x,p.y);
 if(a==='jump'||a==='grab')startHold(a,p);else pulse(a);
 buzz(6);
}
function releaseButton(a,p){if(a==='jump'||a==='grab')endHold(a,p);}
function releaseAll(){ptrs.clear();stick=null;multi=null;dirOver=null;for(const a in holdTail)holdTail[a]=0;pulses.length=0;}

/* ---------------------------------------------------------------- per loop */
function read(dt){
 const out={l:false,r:false,u:false,d:false,jump:false,dash:false,grab:false,strike:false,parry:false,portal:false,any:false};
 if(!api||!active)return out;
 clock+=Math.max(0,Math.min(.1,dt||0));
 const playing=api.view.mode==='play'&&!api.overlayOpen();if(playing!==wasPlaying){wasPlaying=playing;document.documentElement.classList.toggle('pcPlaying',playing);}
 if(api.overlayOpen()){if(ptrs.size)releaseAll();return out;}
 for(const p of ptrs.values())if(p.role==='right'&&!p.multi)step(p);
 // The stick.
 if(stick){const L=layout(),dx=stick.x-stick.ox,dy=stick.y-stick.oy;if(Math.hypot(dx,dy)>L.dead)Object.assign(out,dir8(dx,dy));}
 if(dirOver){if(clock<dirOver.until){out.l=dirOver.l;out.r=dirOver.r;out.u=dirOver.u;out.d=dirOver.d;}else dirOver=null;}
 out.jump=isHeld('jump');out.grab=isHeld('grab');
 for(let i=pulses.length-1;i>=0;i--){const q=pulses[i];if(clock>=q.until){pulses.splice(i,1);continue;}if(clock>=q.from&&clock>=gapUntil[q.a])out[q.a]=true;}
 out.any=['jump','dash','grab','strike','parry','portal','l','r','u','d'].some(k=>out[k]);
 // The rule names show for a few seconds whenever a new room begins.
 const g=game();if(g&&g.room&&g.room.id!==lastSeenRoom){lastSeenRoom=g.room.id;if(settings().hints)hintUntil=clock+5;}
 return out;
}

/* ---------------------------------------------------------------- drawing (device pixels; dpr given by the view) */
function draw(ctx,dpr){
 if(!api||!active||api.overlayOpen())return;
 const view=api.view;if(!view.g||view.mode!=='play')return;
 const L=layout(),t=settings(),k=dpr,a=t.opacity;
 ctx.save();ctx.lineWidth=2*k;
 const circle=(x,y,r,fill,stroke)=>{ctx.beginPath();ctx.arc(x*k,y*k,r*k,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}};
 // Stick.
 if(stick){
  const dx=stick.x-stick.ox,dy=stick.y-stick.oy,d=Math.hypot(dx,dy),m=Math.min(d,L.stickR),kx=d?dx/d*m:0,ky=d?dy/d*m:0;
  ctx.globalAlpha=a*.7;circle(stick.ox,stick.oy,L.stickR,'rgba(20,24,34,.45)','rgba(233,220,192,.55)');
  ctx.globalAlpha=a*1.2;circle(stick.ox+kx,stick.oy+ky,L.stickR*.42,'rgba(233,220,192,.5)','rgba(255,240,210,.8)');
 }
 // Buttons.
 const held=b=>[...ptrs.values()].some(p=>p.role==='button'&&p.a===b.a);
 ctx.textAlign='center';ctx.textBaseline='middle';
 for(const b of L.buttons){ctx.globalAlpha=a*(held(b)?1.4:.9);circle(b.x,b.y,b.r,held(b)?'rgba(201,168,106,.55)':'rgba(20,24,34,.5)','rgba(233,220,192,.6)');
  ctx.globalAlpha=Math.min(1,a*1.5);ctx.fillStyle='#f0e2c2';ctx.font=`${Math.round(b.r*.95*k)}px system-ui,sans-serif`;ctx.fillText(GLYPH[b.a],b.x*k,b.y*k+1*k);}
 // Pause and retry.
 ctx.globalAlpha=Math.min(1,a*1.3);
 for(const b of [L.pause,L.retry]){circle(b.x,b.y,b.r,'rgba(14,16,24,.55)','rgba(233,220,192,.45)');ctx.fillStyle='#e9dcc0';
  if(b.ui==='pause'){ctx.fillRect((b.x-b.r*.32)*k,(b.y-b.r*.38)*k,b.r*.22*k,b.r*.76*k);ctx.fillRect((b.x+b.r*.1)*k,(b.y-b.r*.38)*k,b.r*.22*k,b.r*.76*k);}
  else{ctx.beginPath();ctx.arc(b.x*k,b.y*k,b.r*.42*k,-Math.PI*.35,Math.PI*1.35);ctx.strokeStyle='#e9dcc0';ctx.stroke();ctx.beginPath();const ax=b.x+b.r*.42*Math.cos(-Math.PI*.35),ay=b.y+b.r*.42*Math.sin(-Math.PI*.35);
   ctx.moveTo((ax+b.r*.22)*k,ay*k);ctx.lineTo((ax-b.r*.06)*k,(ay-b.r*.26)*k);ctx.lineTo((ax-b.r*.1)*k,(ay+b.r*.12)*k);ctx.closePath();ctx.fill();}}
 // Feedback marks: where a tap landed, which way a swipe went.
 for(const f of fx){const age=clock-f.t;if(age>.35)continue;const q=1-age/.35;ctx.globalAlpha=q*.8;
  if(f.kind==='swipe'||f.kind==='swipe2'){const d=Math.hypot(f.dx,f.dy)||1,ux=f.dx/d,uy=f.dy/d,len=46;ctx.strokeStyle=f.kind==='swipe'?'#ffd98a':'#bfe4ff';ctx.lineWidth=(f.kind==='swipe'?4:3)*k;
   ctx.beginPath();ctx.moveTo((f.x-ux*len)*k,(f.y-uy*len)*k);ctx.lineTo(f.x*k,f.y*k);ctx.stroke();}
  else{ctx.strokeStyle=f.kind==='double'?'#b5ffea':f.kind==='hold'?'#ffb347':'#e9dcc0';ctx.lineWidth=2*k;ctx.beginPath();ctx.arc(f.x*k,f.y*k,(14+age*90)*k,0,Math.PI*2);ctx.stroke();}}
 // First seconds of a room: what the thumbs do, in the side margins (only where there is room beside the play area).
 if(t.hints&&clock<hintUntil){
  const scale=api.view.scale||1,gameW=320*scale/k,margin=(L.w-gameW)/2;
  if(margin>=96){
   const q=Math.min(1,(hintUntil-clock)/1),fs=Math.round(Math.min(13,margin/11)*k),lh=fs*1.35;ctx.globalAlpha=q*.85;ctx.font=`${fs}px ui-monospace,Menlo,monospace`;ctx.fillStyle='#e9dcc0';
   const G=gestureMap(),list=[];for(const [gest,name] of [['tap','tap'],['swipe','swipe'],['hold','hold'],['double','double-tap'],['swipe2','2-finger swipe'],['tap2','2-finger tap']])if(G[gest])list.push([name,G[gest]]);
   const rx=L.right?L.w-margin/2:margin/2,lx=L.right?margin/2:L.w-margin/2,y0=Math.max(L.h*.22,L.h*.5-list.length*lh/k);ctx.textAlign='center';
   ctx.fillText('drag',lx*k,L.h*.62*k);ctx.fillText('to move',lx*k,L.h*.62*k+lh);
   list.forEach(([g2,a2],i)=>{ctx.fillStyle='#e9dcc0';ctx.fillText(g2,rx*k,y0*k+i*2*lh);ctx.fillStyle='#ffd98a';ctx.fillText(a2,rx*k,y0*k+i*2*lh+lh*.95);});
  }
 }
 ctx.restore();
}

/* ---------------------------------------------------------------- the settings card */
function card(back){
 const t=settings(),opt=(v,l,cur)=>`<option value="${v}" ${v===cur?'selected':''}>${l}</option>`;
 const rows=Object.keys(CHOICES).map(a=>`<label class="pcOpt pcTouchRow"><span>${ACTION_NAMES[a]}</span><select data-map="${a}">${CHOICES[a].map(g=>opt(g,GESTURES[g],t.map[a])).join('')}</select></label>`).join('');
 api.showOverlay(`<div class="pcCard mid"><h1>Touch controls</h1>
 <p class="pcSub">Left thumb: drag anywhere on the left to move. Right thumb: the gestures below. Pause and retry are the two small buttons in the top corner, and Android's back gesture pauses too.</p>
 <label class="pcOpt pcTouchRow"><span>Layout</span><select id="tcPreset">${Object.keys(PRESETS).map(p=>opt(p,PRESET_NAMES[p],t.preset)).join('')}${t.preset==='custom'?opt('custom','Custom','custom'):''}</select></label>
 ${rows}
 <h2 class="pcPart">Feel</h2>
 <label class="pcOpt pcTouchRow"><span>Tap jump height</span><select id="tcJump">${opt('full','Full jump on every tap',t.tapJump)}${opt('finger','Follows the finger (quick tap = short hop)',t.tapJump)}</select></label>
 <label class="pcOpt pcTouchRow"><span>Swipe distance</span><select id="tcSwipe">${opt('small','Short',t.swipe)}${opt('medium','Medium',t.swipe)}${opt('large','Long',t.swipe)}</select></label>
 <label class="pcOpt pcTouchRow"><span>Stick</span><select id="tcStick">${opt('floating','Floating: appears where you press',t.stick)}${opt('fixed','Fixed in the corner',t.stick)}</select></label>
 <label class="pcOpt pcTouchRow"><span>Hands</span><select id="tcHand">${opt('right','Stick left, gestures right',t.hand)}${opt('left','Stick right, gestures left',t.hand)}</select></label>
 <label class="pcOpt pcTouchRow"><span>Control size</span><select id="tcSize">${[.85,1,1.15,1.3].map(v=>opt(String(v),Math.round(v*100)+'%',String(t.size))).join('')}</select></label>
 <label class="pcOpt pcTouchRow"><span>Control opacity</span><select id="tcOpacity">${[.3,.55,.8].map(v=>opt(String(v),{.3:'Faint',.55:'Medium',.8:'Strong'}[v],String(t.opacity))).join('')}</select></label>
 <label class="pcOpt"><input type="checkbox" id="tcHaptics" ${t.haptics?'checked':''}> Vibrate on dash, grab and death</label>
 <label class="pcOpt"><input type="checkbox" id="tcHints" ${t.hints?'checked':''}> Show the gestures for a moment in each new room</label>
 <label class="pcOpt"><input type="checkbox" id="tcFull" ${t.fullscreen?'checked':''}> Go full screen when play starts (in the browser)</label>
 <p class="pcSub pcNote" id="tcNote"></p>
 <div class="pcRow"><button class="pcBtn ghost" id="tcReset">Reset touch controls</button>${api.controlsCard?'<button class="pcBtn ghost" id="tcKeys">Keyboard &amp; controller</button>':''}</div>
 <button class="pcBtn" id="tcBack" data-back>Back</button></div>`);
 const o=api.overlay(),note=o.querySelector('#tcNote');
 o.querySelectorAll('[data-map]').forEach(sel=>sel.onchange=()=>{
  const a=sel.dataset.map,v=sel.value,n=settings();n.map[a]=v;
  // Double-tap and two-finger tap can each carry one action: the other one swaps over.
  if(v!=='button')for(const b in n.map)if(b!==a&&n.map[b]===v){const alt=CHOICES[b].find(x=>x!==v&&!Object.values(n.map).includes(x))||'button';n.map[b]=alt;note.textContent=`${ACTION_NAMES[b]} moved to ${GESTURES[alt].toLowerCase()}.`;}
  n.preset=Object.keys(PRESETS).find(p=>Object.keys(PRESETS[p]).every(k=>PRESETS[p][k]===n.map[k]))||'custom';store(n);card(back);});
 o.querySelector('#tcPreset').onchange=e=>{const n=settings();if(PRESETS[e.target.value]){n.preset=e.target.value;n.map={...PRESETS[n.preset]};store(n);}card(back);};
 const bind=(id,key,fn=v=>v)=>{o.querySelector(id).onchange=e=>{const n=settings();n[key]=e.target.type==='checkbox'?e.target.checked:fn(e.target.value);store(n);};};
 bind('#tcJump','tapJump');bind('#tcSwipe','swipe');bind('#tcStick','stick');bind('#tcHand','hand');bind('#tcSize','size',Number);bind('#tcOpacity','opacity',Number);
 bind('#tcHaptics','haptics');bind('#tcHints','hints');bind('#tcFull','fullscreen');
 o.querySelector('#tcReset').onclick=()=>{store({...DEFAULTS,map:{...DEFAULTS.map}});card(back);};
 if(api.controlsCard)o.querySelector('#tcKeys').onclick=()=>api.controlsCard(()=>card(back));
 o.querySelector('#tcBack').onclick=back;
}

/* ---------------------------------------------------------------- labels for prompts and room hints */
function label(a){const m=settings().map[a];if(!m)return null;if(m==='button')return GLYPH[a]+' button';return GESTURES[m].toLowerCase();}

/* ---------------------------------------------------------------- page plumbing */
function setActive(on){
 if(on===active)return;active=on;if(on)everTouched=true;
 document.documentElement.classList.toggle('pcTouch',on);
 if(on&&!guarded){guarded=true;guardBack();}
 api&&api.onDevice&&api.onDevice(on?'touch':null);
}
function maybeFullscreen(){
 // Only in a plain browser tab: an installed app is already full screen, and a frame inside the game is not ours.
 try{if(!settings().fullscreen||root.parent!==root||document.fullscreenElement||matchMedia('(display-mode: standalone),(display-mode: fullscreen)').matches)return;
  const el=document.documentElement;if(el.requestFullscreen)el.requestFullscreen({navigationUI:'hide'}).then(()=>{try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{});}catch(e){}}).catch(()=>{});}catch(e){}
}
/* Android's back gesture: pause instead of leaving the page (a history entry is kept in reserve). */
function guardBack(){
 if(root.parent!==root)return;
 try{history.pushState({pcGuard:1},'');addEventListener('popstate',()=>{if(active&&api&&api.back&&api.back()){history.pushState({pcGuard:1},'');return;}history.back();});}catch(e){}
}
/* Some Android builds drop the click on a tap inside a scrolling menu; synthesize it when no real click came. */
function clickShim(){
 let dx=0,dy=0,dt=0,lastNative=0;
 document.addEventListener('click',e=>{if(e.isTrusted)lastNative=performance.now();},true);
 document.addEventListener('pointerdown',e=>{dx=e.clientX;dy=e.clientY;dt=performance.now();},true);
 document.addEventListener('pointerup',e=>{
  if(e.pointerType==='mouse'||e.target===api.canvas)return;
  if(Math.hypot(e.clientX-dx,e.clientY-dy)>12||performance.now()-dt>700)return;
  let el=e.target;while(el&&el!==document&&!/^(BUTTON|A|LABEL)$/.test(el.tagName))el=el.parentElement;
  if(!el||el===document)return;const target=el;
  setTimeout(()=>{if(performance.now()-lastNative<400)return;target.click();},120);
 },true);
}
function init(a){
 api=a;const cv=a.canvas;
 cv.addEventListener('pointerdown',onDown,{passive:false});
 cv.addEventListener('pointermove',onMove,{passive:false});
 cv.addEventListener('pointerup',onUp);cv.addEventListener('pointercancel',onUp);cv.addEventListener('lostpointercapture',onUp);
 cv.addEventListener('contextmenu',e=>e.preventDefault());
 // A keyboard, controller or mouse in use hands the screen back to them.
 addEventListener('keydown',()=>setActive(false));
 addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&!active)setActive(true);},true);
 clickShim();
 try{if(matchMedia('(pointer: coarse)').matches&&!matchMedia('(pointer: fine)').matches)setActive(true);}catch(e){}
}
/* Haptics for events the view sees. */
function event(e){if(!active)return;if(e.type==='death')buzz(30);else if(e.type==='dash')buzz(8);}

root.BladefallPrecisionTouch={init,read,draw,card,label,event,releaseAll,active:()=>active,settings,
 _debug:()=>({clock,ptrs:[...ptrs.entries()],stick,multi,pulses:pulses.slice(),holdTail:{...holdTail},gapUntil:{...gapUntil}})};
})(typeof window!=='undefined'?window:globalThis);
