/* The finale (7.309): Your Echo (Survive World 41) and Vesper, True King (World 42), ported from Explore's last road
   (bladefall-explore-finale.js and the Cloaked Man) into Precision Core rooms. One touch still kills, as everywhere
   in Survive, so every attack is drawn before it lands and every opening is drawn bright. Opt-in per room.

   echoDuel:{floor,c,arena:[c0,c1],need,tell,recover,dash,wave,leapTell,ghost,wake,script,kneel,leave}
     Your Echo, your size, standing on the floor whose top row is `floor`.
     dash   a line along the floor for `tell` frames, then it runs through where you stand and stops five tiles past
            you. Jump it, or parry as it reaches you: it staggers, open.
     leap   a mark where you stand for `leapTell` frames, then it lands there and two waves run out along the floor.
     After either it recovers for `recover` frames, open: cut it. A cut at any other time is turned aside, and each
     wound sends it hopping back out of reach before it attacks again.
     ghost  (frames) an afterimage runs each dash again along the same line, that many frames later.
     wake   (column) it waits until you pass this column.
     script ['dash','leap',…] it plays these once, cannot be wounded, then runs out by the exit (`leave`, a column).
     need   wounds; then it runs out by the exit, or (kneel:true) lowers its sword and yields ('echo-yield').
     phases [{name,need,tell,recover,wave,ghost,double,leapEvery},…] (7.317) the fight goes on through each in turn:
            a phase's fields override the room's. Its last wound sends the Echo back to recover its breath (`shift`,
            untouchable), the hazards clear and the next phase begins. double: every run that reaches its end
            turns and runs back at once. leapEvery: a leap every Nth attack (default 3). A death restarts phase one.

   vesper:{floor,c,arena:[c0,c1],top,ledges:[[c0,c1,row],…],need,gaps}
     Four forms. Each form opens after its attacks; a cut there is one wound, and `need` wounds end the form
     (the Survive finale lowers `need` to 3 once you have merged with your Echo; otherwise his ward holds).
     I   The Cloaked Man: he vanishes, his ghost stands beside you, then he slashes from it. Chains run the floor.
     II  Unbound: aloft, he sends a wall of bats across the room with one gap in it, then dives where you stand.
     III The Bones: teeth crack out of the floor across the room, or the skull lunges along it. Then it rests.
     IV  All of Him: his hand slams the third of the room you stand in, and rests there; bats and teeth between.

   curtain:{every,first,speed,gaps:['floor','low',…],surfaces:{floor:row,low:row,high:row},from:'right'}
     Bats crossing the whole room in a wall with one gap; stand at the gap's height as it passes. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const box=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const alive=p=>p.state!=='dead'&&p.state!=='respawn';
const knight=p=>({x:p.x,y:p.y,w:p.w,h:p.h});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function target(g,z){return g.players?.filter(alive).sort((a,b)=>Math.hypot(a.x-z.x,a.y-z.y)-Math.hypot(b.x-z.x,b.y-z.y))[0]||g.p;}
function eachPlayer(g,fn){const p=g.p,a=g.coopActor;try{for(const [i,k]of (g.players||[p]).entries()){if(!alive(k))continue;g.p=k;if(g.players)g.coopActor=i;fn(k);}}finally{g.p=p;g.coopActor=a;}}
function hurt(g,area,cause){eachPlayer(g,p=>{if(box(knight(p),area))C().kill(g,p,cause);});}
function cut(g,p,body,key){
 if(!alive(p)||!(p.strikeTimer>0)||p.strikeHit.has(key))return false;
 const sb=C().strikeBox(p);if(!C().overlap(...sb,body.x-2,body.y-2,body.w+4,body.h+4))return false;
 p.strikeHit.add(key);return true;
}

/* ---------------------------------------------------------------- bats */
const BAT=Object.freeze({speed:2.2,tell:50,w:8,gap:21});
function surfaceY(d,name){const s=d.surfaces||{};return (s[name]??s.floor)*8;}
function newCurtain(d,from,gap,speed){
 const x=from==='left'?d.arena[0]*8-8:(d.arena[1]+1)*8;
 const s=surfaceY(d,gap);return {x,dir:from==='left'?1:-1,speed:speed||BAT.speed,top:s-BAT.gap,bot:s+1,gap,t:0,tell:BAT.tell,done:false};
}
function stepCurtain(g,cu,x0,x1){
 if(cu.t++<cu.tell)return;
 cu.x+=cu.dir*cu.speed;
 if(cu.dir>0?cu.x>x1:cu.x+BAT.w<x0){cu.done=true;return;}
 eachPlayer(g,p=>{if(p.x+p.w>cu.x&&p.x<cu.x+BAT.w&&(p.y<cu.top||p.y+p.h>cu.bot)&&p.y+p.h>8)C().kill(g,p,'bats');});
}
function curtainReset(g){
 const d=g.room.def.curtain;g.curtain=null;if(!d)return;
 g.curtain={d,list:[],t:0,i:0};
}
function curtainBefore(g){
 const z=g.curtain;if(!z||!g.awake)return;const d=z.d;
 const first=d.first??30,every=d.every??170;
 if(z.t>=first&&(z.t-first)%every===0){const gaps=d.gaps||['floor'];z.list.push(newCurtain({surfaces:d.surfaces,arena:[0,g.room.cols-1]},d.from||'right',gaps[z.i++%gaps.length],d.speed));}
 z.t++;
 const W=g.room.w;for(const cu of z.list)stepCurtain(g,cu,0,W);z.list=z.list.filter(c=>!c.done);
}

/* ---------------------------------------------------------------- Your Echo */
const EK=Object.freeze({w:8,h:11,tell:36,recover:60,dash:6,past:40,wave:2.5,waveH:7,waveW:6,leapTell:40,leap:40,leapH:44,poise:40,hop:20,hopDist:80,stagger:90,run:2.5});
const ev=(z,k)=>(z.ph&&z.ph[k]!==undefined?z.ph[k]:z.d[k])??EK[k];
function duelReset(g){
 const d=g.room.def.echoDuel;g.duel=null;if(!d)return;
 const z={d,x:d.c*8,y:d.floor*8-EK.h,w:EK.w,h:EK.h,mode:'idle',t:0,order:0,dir:-1,face:-1,to:0,from:0,base:d.floor*8-EK.h,
  wounds:0,need:d.script?0:(d.phases?.[0]?.need??d.need??3),waves:[],ghosts:[],script:d.script?[...d.script]:null,hurt:0,phase:0,ph:d.phases?.[0]||null};
 g.duel=z;g.parryable=true;for(const e of g.ents)if(e.type==='gate')e.devKeyed=true;
}
const ax0=z=>z.d.arena[0]*8,ax1=z=>(z.d.arena[1]+1)*8-EK.w;
function nextEcho(g,z){
 const p=target(g,z),px=p.x;let act;
 if(z.script){act=z.script.shift();if(!act){z.mode='leave';z.t=0;C().emit(g,'echo-leave',{x:z.x+4,y:z.y});return;}}
 else{const every=ev(z,'leapEvery')||3;act=z.order++%every===every-1?'leap':'dash';}
 z.t=0;
 if(act==='dash'){z.mode='dash-tell';z.dir=Math.sign(px-z.x)||z.face;z.face=z.dir;z.to=clamp(px+z.dir*ev(z,'past'),ax0(z),ax1(z));
  if(Math.abs(z.to-z.x)<24)z.to=clamp(z.x+z.dir*64,ax0(z),ax1(z));C().emit(g,'echo-tell',{x:z.x+4,y:z.y,dash:true});}
 else{z.mode='leap-tell';z.to=clamp(px,ax0(z),ax1(z));z.face=Math.sign(z.to-z.x)||z.face;C().emit(g,'echo-tell',{x:z.to+4,y:z.base+EK.h,leap:true});}
}
function duelBefore(g){
 const z=g.duel;if(!z)return;const Core=C(),p=target(g,z);
 if(z.hurt>0)z.hurt--;
 if(g.solvedBefore&&!z.d.kneel&&z.mode!=='gone'){z.mode='gone';z.waves=[];z.ghosts=[];}
 // waves and afterimages run whatever the Echo is doing
 const floorY=z.d.floor*8;
 for(const w of z.waves){w.x+=w.dir*ev(z,'wave');if(w.x<ax0(z)-4||w.x>ax1(z)+EK.w+4)w.done=true;
  else hurt(g,{x:w.x-EK.waveW/2,y:floorY-EK.waveH,w:EK.waveW,h:EK.waveH},'echo-wave');}
 z.waves=z.waves.filter(w=>!w.done);
 for(const q of z.ghosts){if(q.delay>0){q.delay--;continue;}
  const nx=q.dir>0?Math.min(q.to,q.x+ev(z,'dash')):Math.max(q.to,q.x-ev(z,'dash'));
  hurt(g,{x:Math.min(q.x,nx),y:z.base,w:Math.abs(nx-q.x)+EK.w,h:EK.h},'echo-ghost');
  q.x=nx;if(q.x===q.to)q.done=true;}
 z.ghosts=z.ghosts.filter(q=>!q.done);
 if(z.mode==='gone'||z.mode==='kneel')return;
 if(!g.awake&&z.mode==='idle')return;
 z.t++;
 if(z.mode!=='leave'&&z.mode!=='hop'&&z.mode!=='dash'&&z.mode!=='leap')z.face=Math.sign(p.x-z.x)||z.face;
 switch(z.mode){
  case 'idle':if(z.d.wake==null||(g.players||[p]).some(k=>alive(k)&&k.x>=z.d.wake*8)){z.mode='poise';z.t=0;}break;
  case 'poise':if(z.t>=ev(z,'poise'))nextEcho(g,z);break;
  case 'dash-tell':z.face=z.dir;if(z.t>=ev(z,'tell')){z.mode='dash';z.t=0;z.from=z.x;if(z.d.ghost)z.ghosts.push({x:z.x,to:z.to,dir:z.dir,delay:z.d.ghost});Core.emit(g,'echo-dash',{x:z.x+4,y:z.y+5});}break;
  case 'dash':{const nx=z.dir>0?Math.min(z.to,z.x+ev(z,'dash')):Math.max(z.to,z.x-ev(z,'dash'));
   const area={x:Math.min(z.x,nx),y:z.y,w:Math.abs(nx-z.x)+EK.w,h:EK.h};
   const parrier=(g.players||[p]).find(k=>alive(k)&&k.parryTimer>0&&box(knight(k),area));
   if(parrier){eachPlayer(g,k=>{if(k!==parrier)return;Core.parrySuccess(g,k);z.x=clamp(nx-z.dir*12,ax0(z),ax1(z));z.mode='stagger';z.t=0;Core.emit(g,'echo-parried',{x:z.x+4,y:z.y+5});});break;}
   hurt(g,area,'echo-dash');
   z.x=nx;if(z.x===z.to){
    // (7.317) a doubled run turns at once and comes back
    if(ev(z,'double')&&!z.back){z.back=true;z.dir=-z.dir;z.face=z.dir;z.to=clamp(p.x+z.dir*ev(z,'past'),ax0(z),ax1(z));if(Math.abs(z.to-z.x)<24)z.to=clamp(z.x+z.dir*64,ax0(z),ax1(z));z.mode='dash-tell';z.t=Math.max(0,ev(z,'tell')-12);Core.emit(g,'echo-tell',{x:z.x+4,y:z.y,dash:true});break;}
    z.back=false;z.mode='recover';z.t=0;}break;}
  case 'leap-tell':if(z.t>=ev(z,'leapTell')){z.mode='leap';z.t=0;z.from=z.x;Core.emit(g,'echo-leap',{x:z.x+4,y:z.y});}break;
  case 'leap':{const n=ev(z,'leap'),u=Math.min(1,z.t/n);z.x=z.from+(z.to-z.from)*u;z.y=z.base-Math.sin(u*Math.PI)*ev(z,'leapH');
   if(u>=1){z.x=z.to;z.y=z.base;hurt(g,z,'echo-land');
    z.waves.push({x:z.x+EK.w/2,dir:-1},{x:z.x+EK.w/2,dir:1});Core.emit(g,'echo-wave',{x:z.x+4,y:z.base+EK.h});z.mode='recover';z.t=0;}break;}
  case 'recover':if(z.t>=ev(z,'recover'))nextEcho(g,z);break;
  case 'stagger':if(z.t>=ev(z,'stagger'))nextEcho(g,z);break;
  case 'shift':z.y=z.base;if(z.t>=70){z.mode='poise';z.t=0;Core.emit(g,'echo-phase',{x:z.x+4,y:z.y,phase:z.phase,name:z.ph?.name||''});}break;
  case 'hop':{const n=EK.hop,u=Math.min(1,z.t/n);z.x=z.from+(z.to-z.from)*u;z.y=z.base-Math.sin(u*Math.PI)*20;if(u>=1){z.y=z.base;z.mode='poise';z.t=Math.floor(ev(z,'poise')*.4);}break;}
  case 'leave':{const L=(z.d.leave??(g.room.cols+2))*8;z.face=Math.sign(L-z.x)||1;z.x+=z.face*EK.run;if(z.face>0?z.x>=L:z.x<=L){z.mode='gone';Core.emit(g,'echo-gone',{x:z.x,y:z.y});}break;}
 }
}
function duelAfter(g){
 const z=g.duel;if(!z||z.mode==='shift'||!['poise','dash-tell','leap-tell','recover','stagger','dash','leap'].includes(z.mode))return;
 const Core=C(),p=g.p;if(!cut(g,p,z,'echo-duel'))return;
 const open=(z.mode==='recover'||z.mode==='stagger')&&z.need>0;
 Core.bladeRebound(g,p,p.strikeDir);
 if(!open){Core.emit(g,'guard-block',{x:z.x+4,y:z.y+5,echo:true});return;}
 g.freeze=Math.max(g.freeze,4);z.wounds++;z.hurt=14;Core.emit(g,'echo-wound',{x:z.x+4,y:z.y+5,wounds:z.wounds,need:z.need});
 // (7.317) the next phase: it breaks away, the field clears, and it comes again harder
 if(z.wounds>=z.need&&z.d.phases&&z.phase+1<z.d.phases.length){z.phase++;z.ph=z.d.phases[z.phase];z.wounds=0;z.need=z.ph.need??3;z.waves=[];z.ghosts=[];z.back=false;z.order=0;
  z.mode='shift';z.t=0;z.from=z.x;z.x=clamp(z.x+(Math.sign(z.x-p.x)||1)*EK.hopDist,ax0(z),ax1(z));Core.emit(g,'echo-shift',{x:z.x+4,y:z.y,phase:z.phase});return;}
 if(z.wounds>=z.need){z.ghosts=[];
  if(z.d.kneel){z.mode='kneel';z.t=0;z.waves=[];Core.emit(g,'echo-yield',{x:z.x+4,y:z.y+5});}
  else{z.mode='leave';z.t=0;Core.emit(g,'echo-leave',{x:z.x+4,y:z.y});}return;}
 const away=Math.sign(z.x-p.x)||-z.face;z.mode='hop';z.t=0;z.from=z.x;z.to=clamp(z.x+away*EK.hopDist,ax0(z),ax1(z));
 if(Math.abs(z.to-z.x)<40)z.to=clamp(z.x-away*EK.hopDist,ax0(z),ax1(z));
}

/* ---------------------------------------------------------------- Vesper, True King */
const VK=Object.freeze({w:12,h:28,poise:46,shift:80,vanish:12,
 phantom:{tell:44,tell2:32,reach:44,side:24,slash:6,recover:56},
 chains:{tell:30,wave:2.6,recover:56},
 dive:{tell:34,speed:7,recover:70},rise:40,
 teeth:{step:5,seg:24,tell:30,up:24,recover:70,h:14},
 lunge:{tell:36,speed:5,recover:64},skull:{w:24,h:14},
 slam:{tell:44,rest:72,h:44,hand:{w:24,h:12}}});
const FORMS=Object.freeze(['VESPER','UNBOUND','THE BONES','ALL OF HIM']);
const PATTERN=Object.freeze([['phantom','phantom','chains'],['curtain'],['teeth','lunge'],['slam','curtain','slam','teeth']]);
function vesperNeed(d){
 const V=root.BladefallPrecisionView?.view,F=root.BladefallClimbFinale;
 // only Survive's World 42 reads the save; the Room Bank's copy is the merged fight
 if(F&&F.vesperNeed&&!(V&&V.replay)&&root.BladefallPitchView?.climb?.state?.()?.world?.n===42)return F.vesperNeed();
 return d.need??3;
}
function vReset(g){
 const d=g.room.def.vesper;g.vesper=null;if(!d)return;
 const fy=d.floor*8,z={d,form:0,mode:'idle',t:0,x:d.c*8,y:fy-VK.h,w:VK.w,h:VK.h,face:-1,wounds:0,need:vesperNeed(d),order:0,gapI:0,side:1,
  ghost:null,waves:[],curtains:[],teeth:null,lunge:null,hand:null,hurt:0,said:0,fy,total:0};
 g.vesper=z;g.parryable=true;for(const e of g.ents)if(e.type==='gate')e.devKeyed=true;
}
const vx0=z=>z.d.arena[0]*8,vx1=z=>(z.d.arena[1]+1)*8;
function supportY(z,x,y){let best=z.fy;for(const [c0,c1,r] of z.d.ledges||[])if(x+4>=c0*8&&x+4<(c1+1)*8&&r*8>=y-2&&r*8<best)best=r*8;return best;}
function spanAt(z,x,s){if(s===z.fy)return [vx0(z),vx1(z)];for(const [c0,c1,r] of z.d.ledges||[])if(r*8===s&&x>=c0*8-8&&x<(c1+1)*8+8)return [c0*8,(c1+1)*8];return [vx0(z),vx1(z)];}
function vNext(g,z){
 const pat=PATTERN[z.form],act=pat[z.order++%pat.length],p=target(g,z),Core=C();z.t=0;
 if(act==='phantom'){z.mode='vanish';z.second=z.order%3===2;}
 else if(act==='chains'){z.mode='chains-tell';}
 else if(act==='curtain'){
  const gaps=z.d.gaps||['low','floor','high','floor','low','high'],gap=gaps[z.gapI++%gaps.length];z.side=-z.side;
  const surf=z.d.surfaces;z.curtains.push(newCurtain({arena:z.d.arena,surfaces:surf},z.side>0?'left':'right',gap));
  if(z.form===1){z.mode='aloft';}else z.mode='summon';
  Core.emit(g,'vesper-bats',{x:z.x+6,y:z.y,gap});}
 else if(act==='teeth'){const dir=(z.order>>1)%2?-1:1,x0=vx0(z),x1=vx1(z),n=Math.ceil((x1-x0)/VK.teeth.seg),segs=[];
  for(let i=0;i<n;i++){const k=dir>0?i:n-1-i;segs.push({x:x0+k*VK.teeth.seg,at:i*VK.teeth.step});}
  z.teeth={segs,t:0,end:(n-1)*VK.teeth.step+VK.teeth.tell+VK.teeth.up};z.mode=z.form===2?'teeth':'summon';Core.emit(g,'vesper-teeth',{x:z.x,y:z.fy,dir});}
 else if(act==='lunge'){z.mode='lunge-tell';z.lunge={dir:Math.sign(p.x-z.x)||-1};}
 else if(act==='slam'){const third=Math.floor(clamp((p.x+4-vx0(z))/((vx1(z)-vx0(z))/3),0,2.99)),w=(vx1(z)-vx0(z))/3;
  z.hand={third,x0:vx0(z)+third*w,x1:vx0(z)+(third+1)*w,mode:'lift',t:0};z.mode='slam';Core.emit(g,'vesper-hand',{x:vx0(z)+third*w+w/2,y:z.fy-60});}
}
function vForm(g,z,f){
 const Core=C();z.form=f;z.order=0;z.wounds=0;z.t=0;z.ghost=null;z.waves=[];z.curtains=[];z.teeth=null;z.lunge=null;z.hand=null;
 const c=(vx0(z)+vx1(z))/2;
 if(f===1){z.x=c-VK.w/2;z.y=z.d.top*8;z.w=VK.w;z.h=VK.h;}
 else if(f===2){z.w=VK.skull.w;z.h=VK.skull.h;z.x=c-z.w/2;z.y=z.fy-z.h;}
 else if(f===3){z.w=VK.w;z.h=VK.h;z.x=c-z.w/2;z.y=z.d.top*8-24;}
 else{z.w=VK.w;z.h=VK.h;z.x=c-z.w/2;z.y=z.fy-z.h;}
 z.mode='shift';Core.emit(g,'vesper-form',{x:c,y:z.y,form:f,name:FORMS[f]});
}
function vBefore(g){
 const z=g.vesper;if(!z)return;const Core=C(),p=target(g,z);
 if(z.hurt>0)z.hurt--;
 // hazards: waves, bats, teeth, the lunge
 for(const w of z.waves){w.x+=w.dir*VK.chains.wave;if(w.x<w.x0-4||w.x>w.x1+4)w.done=true;
  else hurt(g,{x:w.x-3,y:w.y-7,w:6,h:7},'vesper-chains');}
 z.waves=z.waves.filter(w=>!w.done);
 for(const cu of z.curtains)stepCurtain(g,cu,vx0(z),vx1(z));z.curtains=z.curtains.filter(c=>!c.done);
 if(z.teeth){const T=z.teeth,k=VK.teeth;T.t++;for(const s of T.segs){const u=T.t-s.at;s.crack=u>=0&&u<k.tell;s.up=u>=k.tell&&u<k.tell+k.up;
   if(s.up)hurt(g,{x:s.x,y:z.fy-k.h,w:k.seg,h:k.h},'vesper-teeth');}
  if(T.t>T.end)z.teeth=null;}
 if(z.mode==='still'||z.mode==='gone')return;
 if(z.mode==='idle'){if(g.awake&&(z.d.wake==null||(g.players||[p]).some(k=>alive(k)&&k.x>=z.d.wake*8))){z.mode='poise';z.t=0;Core.emit(g,'vesper-wake',{x:z.x+6,y:z.y});}return;}
 z.t++;
 const toward=Math.sign(p.x+4-(z.x+z.w/2))||z.face;
 switch(z.mode){
  case 'shift':if(z.t>=VK.shift){z.mode='poise';z.t=0;}break;
  case 'poise':z.face=toward;if(z.t>=VK.poise*(z.form===0&&!z.total?1:.6))vNext(g,z);break;
  // I · the Cloaked Man
  case 'vanish':if(z.t>=VK.vanish){const s=supportY(z,p.x,p.y+p.h),[l,r]=spanAt(z,p.x,s),room=r-p.x>p.x-l?1:-1,side=room*VK.phantom.side;
    const gx=clamp(p.x+4+side-VK.w/2,l,r-VK.w);z.ghost={x:gx,y:s-VK.h,face:-room};z.mode='ghost';z.t=0;Core.emit(g,'vesper-ghost',{x:gx+6,y:s-VK.h});}break;
  case 'ghost':if(z.t>=(z.second?VK.phantom.tell2:VK.phantom.tell)){z.x=z.ghost.x;z.y=z.ghost.y;z.face=z.ghost.face;z.ghost=null;z.mode='slash';z.t=0;Core.emit(g,'vesper-slash',{x:z.x+6,y:z.y+14});}break;
  case 'slash':{const R=VK.phantom.reach,cx=z.x+z.w/2,zone={x:z.face>0?cx:cx-R,y:z.y+z.h-30,w:R,h:30};hurt(g,zone,'vesper-slash');
   if(z.t>=VK.phantom.slash){z.mode='open';z.t=0;z.openFor=VK.phantom.recover;}break;}
  case 'chains-tell':z.face=toward;if(z.t>=VK.chains.tell){const s=z.y+z.h,[l,r]=spanAt(z,z.x,s);z.waves.push({x:z.x+z.w/2,dir:-1,y:s,x0:l,x1:r},{x:z.x+z.w/2,dir:1,y:s,x0:l,x1:r});
    Core.emit(g,'vesper-chains',{x:z.x+6,y:s});z.mode='open';z.t=0;z.openFor=VK.chains.recover;}break;
  // II · Unbound
  case 'aloft':if(!z.curtains.length){z.mode='dive-tell';z.t=0;z.diveX=clamp(p.x+4-VK.w/2,vx0(z),vx1(z)-VK.w);Core.emit(g,'vesper-dive-tell',{x:z.diveX+6,y:z.fy});}break;
  case 'dive-tell':z.x+=(z.diveX-z.x)*.25;if(z.t>=VK.dive.tell){z.x=z.diveX;z.mode='dive';z.t=0;}break;
  case 'dive':{const ny=Math.min(z.fy-z.h,z.y+VK.dive.speed);hurt(g,{x:z.x,y:z.y,w:z.w,h:ny-z.y+z.h},'vesper-dive');z.y=ny;
   if(z.y>=z.fy-z.h){z.mode='open';z.t=0;z.openFor=VK.dive.recover;z.dizzy=true;Core.emit(g,'vesper-land',{x:z.x+6,y:z.fy});}break;}
  case 'rise':{const ty=z.d.top*8,tx=(vx0(z)+vx1(z))/2-VK.w/2;z.y+=(ty-z.y)*.12;z.x+=(tx-z.x)*.12;if(z.t>=VK.rise){z.y=ty;z.x=tx;vNext(g,z);}break;}
  // III · the Bones
  case 'teeth':if(!z.teeth){z.mode='open';z.t=0;z.openFor=VK.teeth.recover;}break;
  case 'lunge-tell':if(z.t>=VK.lunge.tell){z.mode='lunge';z.t=0;Core.emit(g,'vesper-lunge',{x:z.x+12,y:z.fy});}break;
  case 'lunge':{const L=z.lunge,nx=clamp(z.x+L.dir*VK.lunge.speed,vx0(z),vx1(z)-z.w);hurt(g,{x:Math.min(z.x,nx),y:z.y,w:Math.abs(nx-z.x)+z.w,h:z.h},'vesper-lunge');
   const stop=nx===z.x;z.x=nx;if(stop){z.lunge=null;z.mode='open';z.t=0;z.openFor=VK.lunge.recover;}break;}
  // IV · all of him
  case 'slam':{const h=z.hand,s=VK.slam;h.t++;
   if(h.mode==='lift'&&h.t>=s.tell){h.mode='down';h.t=0;Core.emit(g,'vesper-slam',{x:(h.x0+h.x1)/2,y:z.fy});
    eachPlayer(g,p=>{if(p.x+p.w>h.x0&&p.x<h.x1&&p.y+p.h>z.fy-s.h)Core.kill(g,p,'vesper-slam');});}
   else if(h.mode==='down'&&h.t>=4){h.mode='rest';h.t=0;z.mode='open';z.t=0;z.openFor=s.rest;}
   break;}
  case 'summon':if(!z.curtains.length&&!z.teeth){z.mode='poise';z.t=Math.floor(VK.poise*.4);}break;
  case 'open':if(z.t>=z.openFor)vClose(g,z);break;
 }
}
function vClose(g,z){
 z.dizzy=false;
 if(z.form===1){z.mode='rise';z.t=0;return;}
 if(z.hand){z.hand.mode='up';}
 z.mode='poise';z.t=0;
}
function vTarget(z){
 if(z.form===3)return z.hand&&z.hand.mode==='rest'?{x:(z.hand.x0+z.hand.x1)/2-VK.slam.hand.w/2,y:z.fy-VK.slam.hand.h,w:VK.slam.hand.w,h:VK.slam.hand.h}:null;
 return {x:z.x,y:z.y,w:z.w,h:z.h};
}
function vAfter(g){
 const z=g.vesper;if(!z||z.mode==='still'||z.mode==='idle'||z.mode==='shift')return;const Core=C(),p=g.p,body=vTarget(z);
 if(!body||['vanish','ghost'].includes(z.mode))return;
 if(!cut(g,p,body,'vesper'))return;
 Core.bladeRebound(g,p,p.strikeDir);
 if(z.mode!=='open'){Core.emit(g,'guard-block',{x:body.x+body.w/2,y:body.y+body.h/2,ward:true});return;}
 g.freeze=Math.max(g.freeze,4);z.wounds++;z.total++;z.hurt=14;
 Core.emit(g,'vesper-wound',{x:body.x+body.w/2,y:body.y+body.h/2,wounds:z.wounds,need:z.need,form:z.form});
 if(z.wounds>=z.need){
  if(z.form<3){vForm(g,z,z.form+1);return;}
  z.mode='still';z.t=0;z.hand=null;z.waves=[];z.curtains=[];z.teeth=null;z.x=(vx0(z)+vx1(z))/2-VK.w/2;z.y=z.fy-VK.h;z.w=VK.w;z.h=VK.h;
  Core.emit(g,'vesper-still',{x:z.x+6,y:z.y});return;
 }
 vClose(g,z);
}

/* ---------------------------------------------------------------- hooks */
function reset(g){g.solvedBefore=false;duelReset(g);vReset(g);curtainReset(g);}
function before(g){duelBefore(g);vBefore(g);curtainBefore(g);}
function after(g){duelAfter(g);vAfter(g);}
function gateHold(g){return !!(g.duel&&!['gone','leave','kneel'].includes(g.duel.mode)||g.vesper&&g.vesper.mode!=='still');}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'finale',reset,before,after,afterPlayer:after,gateHold});
root.BladefallPrecisionFinale=Object.freeze({EK,VK,BAT,FORMS,PATTERN,supportY});
})(typeof window!=='undefined'?window:globalThis);
