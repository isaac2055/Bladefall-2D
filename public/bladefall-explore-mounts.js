/* Explore (7.343): quest mounts. Finishing a region's side story can leave you something that gets you
   across it faster. The first is the Outskirts': Rowan's bell came down out of the old tower, and the bronze
   drake that roosted in that belfry came with it. With "A Bell for the Camp" finished, the Bellwing perches
   by the camp; Up at its roost flies you over the whole road to the Mothlight Door, and back again from the
   roost by the door. If it is waiting at the other end, Up whistles it over first.

   Nothing here runs under the watch/TAS rules (Watch, ● Record, route building), in co-op, or before the
   story is finished, so routes, recordings and the shared session never see it. The flight is a short
   cinematic: the world holds still, as for a gate walk, while the drake carries the knight; the camera
   follows. Hold the way you are flying to hurry it. */
(function(root){
'use strict';
const MOUNTS={
 // Region 0: the Outskirts. Roosts stand on open road at each end; the drake lands you short of the door,
 // facing it, so the crossing is still yours to walk.
 0:{id:'bellwing',name:'The Bellwing',story:'gatekeeper',accent:'#d8b070',cruise:430,speed:1400,
  roosts:[{id:'camp',x:1050,land:900,face:-1,label:'the camp',flyTo:'door'},
          {id:'door',x:13330,land:13440,face:1,label:'the Mothlight Door',flyTo:'camp'}],
  intro:'The bronze drake from the old belfry. It followed the bell down and never went back up.'},
};
const COLORS={body:'#8a6a3a',dark:'#4a3420',belly:'#c9a46a',wing:'#6b4a2a',edge:'#d8b070',eye:'#ffd27a',horn:'#e8dcc0'};
const ok=()=>typeof G!=='undefined'&&!!G&&!G.workshopBlank;
const mount=()=>ok()?MOUNTS[G.stageIndex]||null:null;
function earned(m){
 try{return root.BladefallSideStories.row(root.BladefallSideStoryWorld.state(),m.story).phase==='completed';}catch(e){return false;}
}
const usable=()=>!watchLike()&&!G.coopSession&&!G.bossRush;
function floorAt(x){
 let y=0;for(const o of G.obstacles)if(o.type==='plat'&&!o.gone&&!o.ceiling&&!o.fake&&(o.y||0)<=60&&x>=o.x-o.w/2&&x<=o.x+o.w/2)y=Math.max(y,o.y||0);
 return y;
}
function install(){
 if(!ok())return;
 G.obstacles=G.obstacles.filter(o=>!o.mountRoost);G.mountFlight=null;
 const m=mount();if(!m||!usable()||!earned(m))return;
 G.mountAt=G.mountAt&&m.roosts.some(r=>r.id===G.mountAt)?G.mountAt:m.roosts[0].id;
 for(const r of m.roosts)G.obstacles.push({type:'mountRoost',mountRoost:r.id,mount:m.id,x:r.x,y:floorAt(r.x),w:96,h:70,accent:m.accent});
}
const roostOf=o=>mount()?.roosts.find(r=>r.id===o.mountRoost)||null;
function interactable(o){return !!(mount()&&roostOf(o)&&!G.mountFlight&&usable());}
function prompt(o){return G.mountAt===o.mountRoost?'↑  RIDE THE '+mount().name.replace(/^The /,'').toUpperCase():'↑  WHISTLE';}
function interact(o){
 const m=mount(),r=roostOf(o);if(!m||!r)return false;
 const to=m.roosts.find(x=>x.id===r.flyTo);
 const here=G.mountAt===r.id;
 const text=here?m.intro+' It shakes out its wings and looks toward '+to.label+'.':'You whistle. Somewhere far down the road, wings open.';
 const session=G;
 const close=()=>{if(G!==session)return;mode='play';BFKeyboard.clearPressed();showGameUI(true);hudUpdate();};
 BladefallConversation.show({title:m.name,text,accent:m.accent,onClose:close,choices:[
  {label:'Fly to '+to.label,action:()=>{BladefallConversation.close();start(m,r,to,!here);}},
  {label:'Not now',action:()=>{if(!here)G.mountFlight={kind:'arrive',roost:r,t:0,dur:1.6,dir:r.x<G.levelLength/2?1:-1};BladefallConversation.close();}},
 ]});
 mode='conversation';document.getElementById('bosshpwrap')?.classList.remove('on');
 return true;
}
// One flight: (optionally) the drake swoops in to the roost, the knight climbs on, it climbs to cruising
// height, crosses the region and sets him down facing the far roost's door.
function start(m,from,to,arriving){
 const dir=to.x>from.x?1:-1,dist=Math.abs(to.land-from.x);
 // Low enough that the road stays in view below (the view is VH units tall, the ground a fifth of it up).
 G.mountFlight={kind:'ride',from,to,dir,arrive:arriving?0:1,mount:0,u:0,dur:dist/m.speed,cruise:Math.min(m.cruise,Math.round(VH*.62)),x:from.x,y:floorAt(from.x)+26,t:0,lock:0};
}
const ease=u=>u*u*u*(u*(u*6-15)+10);
function update(dt){
 const f=G?.mountFlight;if(!f)return false;
 const p=G.p;G.time+=dt;f.t+=dt;
 if(f.kind==='arrive'){
  // Whistled for and left at the roost: it lands and waits there.
  if(f.t>=f.dur){G.mountAt=f.roost.id;G.mountFlight=null;}
  return false;   // the world keeps running while it comes
 }
 p.vx=0;p.vy=0;p.invuln=Math.max(p.invuln||0,1);p.atkTimer=0;p.dodgeTimer=0;p.slamming=false;
 const groundY=floorAt(f.from.x)+26;
 if(f.arrive<1){f.arrive=Math.min(1,f.arrive+dt/1.4);p.onGround=true;cameraTo(p.x,p.y,dt);return true;}
 if(f.mount<1){
  // He hops up onto its back.
  if(f.mount===0)f.climbFrom={x:p.x,y:p.y};
  f.mount=Math.min(1,f.mount+dt/.45);const k=ease(f.mount);
  p.x=f.climbFrom.x+(f.from.x-f.dir*4-f.climbFrom.x)*k;p.y=f.climbFrom.y+(groundY+12-f.climbFrom.y)*k+Math.sin(Math.PI*k)*30;
  p.face=f.dir;p.onGround=true;f.x=f.from.x;f.y=groundY;cameraTo(p.x,p.y,dt);return true;
 }
 const hurry=keyDownFor(f.dir>0?'right':'left')?1.9:1;
 f.u=Math.min(1,f.u+dt/f.dur*hurry);
 const u=f.u,landY=floorAt(f.to.land)+26;
 const up=Math.min(1,u/.12),down=Math.min(1,(1-u)/.15);
 const lift=ease(up)*ease(down);
 f.x=f.from.x+(f.to.land-f.from.x)*ease(u);
 f.y=(groundY*(1-u)+landY*u)+(f.cruise-groundY)*lift+Math.sin(f.t*3.1)*9*lift;
 p.x=f.x-f.dir*4;p.y=f.y+15;p.face=f.dir;p.onGround=true;
 f.lock=Math.min(1,f.lock+dt*1.5);cameraTo(f.x+f.dir*VW*.12,f.y,dt,f.lock);
 if(u>=1){
  // Set down short of the door, facing it; the drake perches on the roost there.
  p.x=f.to.land;p.y=floorAt(f.to.land);p.vx=0;p.vy=0;p.onGround=false;p.face=f.to.face;p.safeX=p.x;
  G.mountAt=f.to.id;G.mountFlight=null;BFKeyboard.clearPressed();
  if(typeof addText==='function')addText(p.x,GROUND_Y-p.y-70,f.to.label.toUpperCase(),mount()?.accent||'#d8b070',true);
 }
 return true;
}
// The camera eases onto the drake, then holds it (lock 1): at full speed the eased camera fell a screen behind.
// The knight rides in the upper third of the view with the road below.
function cameraTo(x,y,dt,lock=0){
 const tx=Math.max(0,Math.min(Math.max(0,G.levelLength-VW),x-VW*.5)),ty=Math.max(0,y-GROUND_Y+VH*.3);
 const k=Math.max(1-Math.exp(-5*dt),lock);G.cam+=(tx-G.cam)*k;G.camY+=(ty-G.camY)*k;
 if(typeof BFCamera!=='undefined')BFCamera.sync(G.cam,G.camY);
}
// ---- drawing: the drake, side on, facing +x; mirrored for -x. Body centre at (0,0), y up the screen. ----
function wing(c,a,near){
 c.save();c.translate(-4,-10);c.rotate(-a);
 c.fillStyle=near?COLORS.wing:COLORS.dark;c.globalAlpha=near?.95:.8;
 c.beginPath();c.moveTo(0,0);c.lineTo(-14,-38);c.lineTo(10,-56);c.lineTo(30,-34);c.lineTo(26,-6);c.closePath();c.fill();
 c.globalAlpha=1;c.strokeStyle=COLORS.edge;c.lineWidth=2;
 c.beginPath();c.moveTo(0,0);c.lineTo(10,-56);c.moveTo(0,0);c.lineTo(30,-34);c.moveTo(0,0);c.lineTo(-14,-38);c.stroke();
 c.restore();
}
function drake(c,x,y,dir,t,pose){
 // pose: 'perch' (sitting, wings folded) or 'fly'
 const fly=pose==='fly',flap=fly?Math.sin(t*9)*.75:0,breathe=Math.sin(t*2)*1.2;
 c.save();c.translate(Math.round(x),Math.round(GROUND_Y-y));c.scale(dir,1);
 if(!fly){c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(0,26,40,5,0,0,Math.PI*2);c.fill();}
 if(fly)wing(c,.35+flap,false);
 // tail
 c.strokeStyle=COLORS.body;c.lineWidth=7;c.lineCap='round';
 const sw=Math.sin(t*(fly?4:1.4))*(fly?6:3);
 c.beginPath();c.moveTo(-28,2);c.quadraticCurveTo(-56,8+sw,-80,(fly?4:20)+sw);c.stroke();
 c.fillStyle=COLORS.edge;c.beginPath();c.moveTo(-80,(fly?4:20)+sw);c.lineTo(-92,(fly?-2:14)+sw);c.lineTo(-90,(fly?10:26)+sw);c.closePath();c.fill();
 // legs (tucked in flight)
 c.fillStyle=COLORS.dark;
 if(fly){c.fillRect(-14,10,10,5);c.fillRect(8,10,10,5);}
 else{c.fillRect(-18,8,7,18);c.fillRect(12,8,7,18);c.fillRect(-21,24,11,3);c.fillRect(10,24,11,3);}
 // body
 c.fillStyle=COLORS.body;c.beginPath();c.ellipse(0,breathe*.3,34,15+breathe*.3,0,0,Math.PI*2);c.fill();
 c.fillStyle=COLORS.belly;c.beginPath();c.ellipse(4,7,24,6,0,0,Math.PI*2);c.fill();
 for(let i=-20;i<=16;i+=9){c.fillStyle=COLORS.dark;c.fillRect(i,-15,3,4);}   // back ridges
 // neck and head
 const hy=fly?-4:-22-breathe;
 c.strokeStyle=COLORS.body;c.lineWidth=11;c.beginPath();c.moveTo(24,-4);c.quadraticCurveTo(38,-8,46,hy);c.stroke();
 c.fillStyle=COLORS.body;c.beginPath();c.moveTo(42,hy-8);c.lineTo(66,hy-2);c.lineTo(64,hy+5);c.lineTo(42,hy+7);c.closePath();c.fill();
 c.fillStyle=COLORS.horn;c.beginPath();c.moveTo(44,hy-7);c.lineTo(36,hy-17);c.lineTo(49,hy-8);c.closePath();c.fill();
 c.fillStyle=COLORS.eye;c.fillRect(53,hy-4,4,3);
 if(!fly&&Math.sin(t*.7)>.97){c.fillStyle='rgba(255,170,90,.5)';c.beginPath();c.arc(70,hy+2,4,0,Math.PI*2);c.fill();}   // a puff of warm breath now and then
 if(!fly){c.fillStyle=COLORS.wing;c.beginPath();c.moveTo(-18,-10);c.lineTo(14,-12);c.lineTo(-4,-30);c.closePath();c.fill();
  c.strokeStyle=COLORS.edge;c.lineWidth=2;c.beginPath();c.moveTo(-18,-10);c.lineTo(-4,-30);c.lineTo(14,-12);c.stroke();}
 c.restore();
}
function drawRoost(c,o){
 const m=mount();if(!m)return;
 const gx=o.x,gy=GROUND_Y-(o.y||0);
 // The roost: a bell-post with a crossbar, like the one Rowan hung the bell from.
 c.save();c.fillStyle='#3a2c22';c.fillRect(gx+34,gy-74,6,74);c.fillRect(gx+22,gy-74,30,5);
 c.fillStyle=m.accent;c.globalAlpha=.85;c.beginPath();c.arc(gx+37,gy-62,4,0,Math.PI*2);c.fill();c.globalAlpha=1;c.restore();
 const f=G.mountFlight,t=G.time||0;
 if(f?.kind==='arrive'&&f.roost.id===o.mountRoost){
  const k=ease(Math.min(1,f.t/f.dur));drake(c,o.x+(1-k)*f.dir*-520,(o.y||0)+26+(1-k)*420,f.dir,t,k<.9?'fly':'perch');return;
 }
 if(f?.kind==='ride'&&f.from.id===o.mountRoost&&f.arrive<1){
  const k=ease(f.arrive);drake(c,o.x+(1-k)*f.dir*-520,(o.y||0)+26+(1-k)*420,f.dir,t,k<.9?'fly':'perch');return;
 }
 if(G.mountAt===o.mountRoost&&!(f?.kind==='ride'))drake(c,o.x,(o.y||0)+26,o.x<G.levelLength/2?1:-1,t,'perch');
}
function drawUnder(c){
 const f=G?.mountFlight;if(!f||f.kind!=='ride'||f.arrive<1)return;
 drake(c,f.mount<1?f.from.x:f.x,f.mount<1?floorAt(f.from.x)+26:f.y,f.dir,G.time||0,f.mount<1?'perch':'fly');
}
function drawOver(c){
 const f=G?.mountFlight;if(!f||f.kind!=='ride'||f.arrive<1||f.mount<1)return;
 c.save();c.translate(Math.round(f.x),Math.round(GROUND_Y-f.y));c.scale(f.dir,1);wing(c,.35+Math.sin((G.time||0)*9)*.75,true);c.restore();
}
root.BladefallMounts=Object.freeze({MOUNTS,install,interactable,prompt,interact,update,drawRoost,drawUnder,drawOver,flying:()=>!!(G?.mountFlight?.kind==='ride')});
})(typeof window!=='undefined'?window:globalThis);
