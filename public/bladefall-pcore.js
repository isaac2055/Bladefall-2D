/* Bladefall Precision Core — a self-contained, deterministic puzzle-platforming simulation.

   Everything here is integer pixels at a fixed 60 Hz. Positions are whole pixels with a
   sub-pixel remainder; actors move one pixel at a time and stop at the first collision.
   Timers are frame counts. The same input tape always produces the same run, which is
   what lets a player (and our verification) predict exactly where a jump or dash lands.

   A room is one 320x184 screen (40x23 tiles of 8px). The knight has one dash. It refills on
   the ground and from a few visible objects; every other object answers the same few verbs:
   stood on, dashed into, struck, grabbed or carried. No object writes a special-case launch.
   No DOM access: the view (bladefall-pcore-view.js) and node verification share this file. */
(function(root){
'use strict';

const FPS=60,DT=1/60,TILE=8,COLS=40,ROWS=23,W=COLS*TILE,H=ROWS*TILE,COLS0=COLS,ROWS0=ROWS;
const f=s=>Math.round(s*FPS);
/* Movement constants in px/s and px/s². Timers are converted to whole frames once. */
const K=Object.freeze({
 maxRun:90,runAccel:1000,runReduce:400,airMult:.65,flingMaxFall:420,
 gravity:900,halfGravThreshold:40,maxFall:160,fastMaxFall:240,fastMaxAccel:300,
 jumpSpeed:-105,jumpHBoost:40,varJumpFrames:f(.2),jumpGraceFrames:f(.1),bufferFrames:5,
 wallJumpCheck:3,superWallJumpCheck:5,wallJumpForceFrames:f(.16),wallJumpH:130,
 wallSlideStartMax:20,wallSlideFrames:f(1.2),wallSpeedRetentionFrames:4,
 climbMaxStamina:110,climbUpCost:100/2.2,climbStillCost:100/10,climbJumpCost:110/4,climbTired:20,
 climbUpSpeed:-45,climbDownSpeed:80,climbSlipSpeed:30,climbAccel:900,climbCheck:2,
 climbHopX:100,climbHopY:-120,climbHopForceFrames:f(.2),climbJumpBoostFrames:f(.2),climbNoMoveFrames:f(.1),
 dashSpeed:240,endDashSpeed:160,endDashUpMult:.75,dashFrames:f(.15),dashCooldownFrames:f(.2),
 dashRefillCooldownFrames:f(.1),dashFreezeFrames:3,ultraMult:1.2,
 superJumpH:260,hyperXMult:1.25,hyperYMult:.5,superWallJumpSpeed:-160,superWallJumpH:170,superWallVarFrames:f(.25),
 upwardCorner:4,dashCorner:4,
 liftXCap:250,liftYCap:-130,liftGraceFrames:f(.16),
 carryMaxFall:45,throwX:200,throwY:-80,
 strikeFrames:5,strikeCooldownFrames:f(.25),podSpeed:-210,podSide:190,podDown:150,
 springSpeed:-185,
 refillRespawnFrames:f(2.5),crumbleShakeFrames:f(.4),crumbleRespawnFrames:f(2),
 stoneAccel:600,stoneMax:240,
 deathFrames:24,respawnFrames:10,
});

/* ---------------------------------------------------------------- devices (7.254)
   Later regions add their devices as modules that register hooks here, following the portals pattern:
   (root.BladefallPrecisionDevices ||= []).push({name, reset, input, before, forces, airJump, after, gateHold}).
   Each hook is optional. Device entities carry dev:true and answer isSolid through their own `solid` flag
   (and `thru` for one-way tops); a device that presses plates sets `presses`. */
const devs=()=>root.BladefallPrecisionDevices||[];
function devCall(name,...a){let out;for(const d of devs())if(d[name]){const v=d[name](...a);if(v!==undefined&&out===undefined)out=v;}return out;}
function devAny(name,...a){let any=false;for(const d of devs())if(d[name]&&d[name](...a))any=true;return any;}

/* ---------------------------------------------------------------- helpers */
const approach=(v,t,d)=>v>t?Math.max(v-d,t):Math.min(v+d,t);
const sign=v=>v>0?1:v<0?-1:0;
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
const EMPTY=0,SOLID=1,THRU=2,SPIKE_UP=3,SPIKE_DOWN=4,SPIKE_LEFT=5,SPIKE_RIGHT=6;
const TILECHAR={'#':SOLID,'=':THRU,'^':SPIKE_UP,'v':SPIKE_DOWN,'<':SPIKE_LEFT,'>':SPIKE_RIGHT};
const GROUPED='ABKZGHM~'; // multi-tile blocks: flood-filled into rectangles

/* ---------------------------------------------------------------- room parsing */
function parseRoom(def,index){
 // A room is one 40x23 screen unless its definition gives cols/rows (merge pitches: larger, scrolling rooms).
 const COLS=def.cols||COLS0,ROWS=def.rows||ROWS0;
 const rows=def.map.slice(0,ROWS);while(rows.length<ROWS)rows.push('');
 const grid=new Uint8Array(COLS*ROWS),at=(c,r)=>(rows[r]||'')[c]||'.';
 const room={index,id:def.id,name:def.name,hint:def.hint||'',exit:def.exit||'right',grid,spawn:null,entities:[],def,maxDashes:def.dashes??1,
  portalable:new Uint8Array(COLS*ROWS),grill:new Uint8Array(COLS*ROWS),cols:COLS,rows:ROWS,w:COLS*TILE,h:ROWS*TILE};
 const seen=new Uint8Array(COLS*ROWS);
 const groups=[];
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
  const ch=at(c,r),i=r*COLS+c;
  // % is rock a portal can open on (pale portal stone); ! is a barrier line: open air that stops portal shots.
  if(ch==='%'){grid[i]=SOLID;room.portalable[i]=1;continue;}
  if(ch==='!'){room.grill[i]=1;continue;}
  if(TILECHAR[ch]!==undefined){grid[i]=TILECHAR[ch];continue;}
  if(ch==='P'){room.spawn={x:c*TILE,y:r*TILE+TILE-11};continue;}
  if(GROUPED.includes(ch)){
   if(seen[i])continue;
   // Grow a rectangle right, then down, over the same character.
   let w=0;while(c+w<COLS&&at(c+w,r)===ch&&!seen[r*COLS+c+w])w++;
   let h=1;outer:while(r+h<ROWS){for(let k=0;k<w;k++)if(at(c+k,r+h)!==ch||seen[(r+h)*COLS+c+k])break outer;h++;}
   for(let y=0;y<h;y++)for(let k=0;k<w;k++)seen[(r+y)*COLS+c+k]=1;
   groups.push({ch,x:c*TILE,y:r*TILE,w:w*TILE,h:h*TILE,col:c,row:r});
   continue;
  }
  const x=c*TILE,y=r*TILE;
  if(ch==='o')room.entities.push({type:'refill',x:x,y:y,w:8,h:8});
  else if(ch==='c')room.entities.push({type:'stone',x,y,w:8,h:8});
  else if(ch==='b')room.entities.push({type:'pod',x,y,w:8,h:8});
  else if(ch==='x')room.entities.push({type:'bell',x,y,w:8,h:8});
  else if(ch==='s')room.entities.push({type:'spring',x,y:y+5,w:8,h:3});
  else if(ch==='*')room.entities.push({type:'shard',x,y,w:8,h:8});
  else if(ch==='l')room.entities.push({type:'lantern',x,y:y,w:8,h:8});
  else if(ch==='_')room.entities.push({type:'plate',x,y:y+6,w:8,h:2});
 }
 // Touching pieces of the same machinery colour behave as one body: a stone sealed inside a
 // pillar splits the pillar into rectangles, but they all wait together while someone is inside.
 const touch=(a,b)=>a.x<=b.x+b.w&&b.x<=a.x+a.w&&a.y<=b.y+b.h&&b.y<=a.y+a.h;
 const body=groups.map((_,i)=>i),find=i=>body[i]===i?i:(body[i]=find(body[i]));
 groups.forEach((a,i)=>groups.forEach((b,j)=>{if(j>i&&a.ch===b.ch&&(a.ch==='A'||a.ch==='B')&&touch(a,b))body[find(i)]=find(j);}));
 const zips=def.zips||[];let zi=0;
 for(const [gi,g] of groups.entries()){
  const base={x:g.x,y:g.y,w:g.w,h:g.h};
  if(g.ch==='A'||g.ch==='B')room.entities.push({type:'toggle',...base,phase:g.ch==='A'?0:1,solid:g.ch==='A',body:find(gi)});
  else if(g.ch==='K')room.entities.push({type:'slide',...base});
  else if(g.ch==='Z'){const z=zips[zi++]||[0,-4];room.entities.push({type:'zip',...base,tx:g.x+z[0]*TILE,ty:g.y+z[1]*TILE});}
  else if(g.ch==='G')room.entities.push({type:'gate',...base});
  else if(g.ch==='H')room.entities.push({type:'held',...base,solid:true});
  else if(g.ch==='M')room.entities.push({type:'thru',...base});
  else if(g.ch==='~')room.entities.push({type:'crumble',...base});
 }
 if(!room.spawn)throw new Error('Room '+(def.id||index)+' has no spawn P');
 return room;
}

/* Rectangles of one glyph in a room map (grown right, then down), for device modules. */
function groupsOf(def,ch){
 const COLS=def.cols||COLS0,ROWS=def.rows||ROWS0;
 const rows=def.map,at=(c,r)=>(rows[r]||'')[c]||'.',seen=new Set(),out=[];
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
  if(at(c,r)!==ch||seen.has(r*COLS+c))continue;
  let w=0;while(c+w<COLS&&at(c+w,r)===ch&&!seen.has(r*COLS+c+w))w++;
  let h=1;outer:while(r+h<ROWS){for(let k=0;k<w;k++)if(at(c+k,r+h)!==ch||seen.has((r+h)*COLS+c+k))break outer;h++;}
  for(let y=0;y<h;y++)for(let k=0;k<w;k++)seen.add((r+y)*COLS+c+k);
  out.push({x:c*TILE,y:r*TILE,w:w*TILE,h:h*TILE,col:c,row:r});
 }
 return out;
}

/* ---------------------------------------------------------------- game state */
function createGame(defs,opts={}){
 const g={defs,rooms:defs.map(parseRoom),roomIndex:0,room:null,frame:0,roomFrame:0,freeze:0,deaths:0,roomDeaths:0,
  shards:new Set(opts.shards||[]),events:[],phase:0,p:null,ents:[],prev:{},buf:{jump:0,dash:0,grab:0,strike:0},
  exited:false,assist:{infiniteStamina:false,...(opts.assist||{})}};
 loadRoom(g,opts.room||0);
 return g;
}
function emit(g,type,data={}){g.events.push({type,frame:g.frame,...data});}

function makePlayer(room){
 return {x:room.spawn.x+0,y:room.spawn.y,w:8,h:11,remX:0,remY:0,vx:0,vy:0,facing:1,state:'normal',
  dashes:room.maxDashes,maxDashes:room.maxDashes,stamina:K.climbMaxStamina,onGround:true,wasGround:true,
  jumpGrace:0,varJump:0,varJumpSpeed:0,forceMoveX:0,forceMoveTimer:0,autoJump:false,
  dashTimer:0,dashCooldown:0,dashRefillCooldown:0,dashDir:{x:1,y:0},beforeDash:{x:0,y:0},dashAim:false,ducking:false,
  wallSlide:K.wallSlideFrames,wallBoostDir:0,wallBoostTimer:0,climbNoMove:0,retainTimer:0,retained:0,
  maxFall:K.maxFall,liftX:0,liftY:0,liftTimer:0,carrying:null,strikeTimer:0,strikeCooldown:0,strikeDir:{x:1,y:0},strikeHit:new Set(),
  deadTimer:0,respawnTimer:0,dashFlash:0,parryTimer:0,parryCooldown:0,fling:false,portalCool:0};
}
function loadRoom(g,index,respawn=false){
 if(g.room)devCall('unload',g);   // e.g. a flipped room is turned back upright before it is rebuilt
 g.walkSeams=null;g.roomIndex=index;g.room=g.rooms[index];g.roomFrame=0;g.phase=0;g.exited=false;g.roomDeaths=g.roomDeaths||0;
 g.spikeSafe=null;g.flipped=false;
 g.ents=g.room.entities.map((e,i)=>({...e,id:i,ox:e.x,oy:e.y,remX:0,remY:0,vx:0,vy:0,timer:0,t:0,state:'idle'}));
 for(const e of g.ents){if(e.type==='shard'&&g.shards.has(g.room.id+':'+e.id))e.gone=true;}
 g.p=makePlayer(g.room);if(respawn){g.p.respawnTimer=K.respawnFrames;g.p.state='respawn';}
 // Rooms with foes can wait, still, until the first input: study the room, then act.
 g.awake=!(g.room.def.study||g.room.def.combat?.waitForMove);
 root.BladefallPrecisionCombat?.reset(g);
 root.BladefallPrecisionFoes?.reset(g);
 root.BladefallPrecisionPortals?.reset(g);
 devCall('reset',g);
}
function resetRoom(g){const d=g.deaths,rd=g.roomDeaths;loadRoom(g,g.roomIndex,true);g.deaths=d;g.roomDeaths=rd;}

/* ---------------------------------------------------------------- collision queries */
function tileAt(g,c,r){const rm=g.room;if(c<0||c>=rm.cols||r<0||r>=rm.rows)return EMPTY;return rm.grid[r*rm.cols+c];}
function boundsBlock(g,x,y,w,h){
 const ex=g.room.exit,sd=g.sideSealed?null:g.room.def.side;   // side: a second, optional way out (Room by Room's quest branches; sealed until earned)
 // Climb walking seams admit the whole body through an authored opening.
 // Other modes and closed paths retain the normal room boundary.
 const seam=edge=>(g.walkSeams||[]).some(s=>s.edge===edge&&y>=s.floor*8-Math.max(32,(s.height||0)*8)&&y+h<=s.floor*8+1);   // (a taller seam, 7.275: a terminal room's whole open exit)
 // Folded corridors end at their mouth planes, not their decorative apron.
 const ports=g.room.def.atlasFold?g.room.def.atlasSockets:null;
 const left=ports?Math.min(...ports.map(s=>s.plane)):0,right=ports?Math.max(...ports.map(s=>s.plane)):g.room.w;
 if(x<left&&ex!=='left'&&sd!=='left'&&!seam('left'))return true;
 if(x+w>right&&ex!=='right'&&sd!=='right'&&!seam('right'))return true;
 if(y<0&&ex!=='up'&&sd!=='up')return true;
 return false;
}
function isSolidEnt(e){
 if(e.gone)return false;
 switch(e.type){
  case 'toggle':return e.solid;
  case 'slide':case 'zip':return true;
  case 'gate':return !e.open;
  case 'held':return e.solid;
  case 'crumble':return !e.broken;
  case 'combatGate':case 'brittle':return !e.open;
  case 'foeSolid':return e.solid;
  default:return !!(e.dev&&e.solid);
 }
}
/* Returns the first blocker at a rect: 'bounds', 'tile', or an entity. */
function blockerAt(g,x,y,w,h,ignore){
 if(boundsBlock(g,x,y,w,h))return 'bounds';
 const c0=Math.floor(x/TILE),c1=Math.floor((x+w-1)/TILE),r0=Math.floor(y/TILE),r1=Math.floor((y+h-1)/TILE);
 for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)if(tileAt(g,c,r)===SOLID&&!(g.portalHoles&&g.portalHoles.has(r*g.room.cols+c)))return 'tile';
 for(const e of g.ents)if(e!==ignore&&isSolidEnt(e)&&overlap(x,y,w,h,e.x,e.y,e.w,e.h))return e;
 return null;
}
function solidAt(g,x,y,w,h,ignore){return !!blockerAt(g,x,y,w,h,ignore);}
/* One-way platforms: a floor only for something whose feet were at or above its top. */
function thruBelow(g,x,y,w,h){
 const bottom=y+h;
 if(bottom%TILE===0){const r=bottom/TILE,c0=Math.floor(x/TILE),c1=Math.floor((x+w-1)/TILE);for(let c=c0;c<=c1;c++)if(tileAt(g,c,r)===THRU)return true;}
 for(const e of g.ents)if((e.type==='thru'||e.dev&&e.thru&&!e.gone)&&e.y===bottom&&x<e.x+e.w&&x+w>e.x)return true;
 return false;
}

/* ---------------------------------------------------------------- actor movement */
function moveX(g,a,amount,onCollide,ignore){
 a.remX+=amount;let move=Math.round(a.remX);if(!move)return null;a.remX-=move;const s=sign(move);
 while(move){const b=blockerAt(g,a.x+s,a.y,a.w,a.h,ignore);if(b){a.remX=0;if(onCollide)onCollide(b,s);return b;}a.x+=s;move-=s;}
 return null;
}
function moveY(g,a,amount,onCollide,ignore,thru=true){
 a.remY+=amount;let move=Math.round(a.remY);if(!move)return null;a.remY-=move;const s=sign(move);
 while(move){let b=blockerAt(g,a.x,a.y+s,a.w,a.h,ignore);if(!b&&s>0&&thru&&thruBelow(g,a.x,a.y,a.w,a.h))b='thru';
  if(b){a.remY=0;if(onCollide)onCollide(b,s);return b;}a.y+=s;move-=s;}
 return null;
}
/* Exact moves used by corner correction and pushes (no remainder bookkeeping). */
function tryShift(g,a,dx,dy,ignore){if(solidAt(g,a.x+dx,a.y+dy,a.w,a.h,ignore))return false;a.x+=dx;a.y+=dy;return true;}

/* ---------------------------------------------------------------- input */
function readInput(g,raw){
 const prev=g.prev,cur={l:!!raw.l,r:!!raw.r,u:!!raw.u,d:!!raw.d,jump:!!raw.jump,dash:!!raw.dash,grab:!!raw.grab,strike:!!raw.strike,parry:!!raw.parry,portal:!!raw.portal};
 const pressed=k=>cur[k]&&!prev[k];
 if(pressed('jump'))g.buf.jump=K.bufferFrames;
 if(pressed('dash'))g.buf.dash=K.bufferFrames;
 if(pressed('grab'))g.buf.grab=3;
 if(pressed('strike'))g.buf.strike=3;
 if(pressed('parry'))g.buf.parry=3;
 if(pressed('portal'))g.buf.portal=3;
 g.prev=cur;
 const mx=(cur.r?1:0)-(cur.l?1:0),my=(cur.d?1:0)-(cur.u?1:0);
 return {...cur,mx,my};
}

/* ---------------------------------------------------------------- the step */
function step(g,raw={}){
 g.frame++;
 raw=devCall('input',g,raw)||raw;
 // lock: verbs a room does not grant yet (Room by Room: the blade before the Oathblade, and so on).
 if(g.room.def.lock){raw={...raw};for(const k of g.room.def.lock)raw[k]=false;}
 // Presses made during a freeze are remembered; buffers count down before new presses land,
 // so a jump pressed up to four frames before touching down still happens.
 if(g.freeze>0){readInput(g,raw);g.freeze--;return;}
 for(const k in g.buf)if(g.buf[k]>0)g.buf[k]--;
 const inp=readInput(g,raw);
 g.roomFrame++;
 updateEntities(g,inp);
 const p=g.p;
 if(p.state==='dead'){if(--p.deadTimer<=0){g.roomDeaths++;resetRoom(g);emit(g,'respawn');}return;}
 if(p.state==='respawn'){if(--p.respawnTimer<=0)p.state='normal';return;}
 if(!g.awake&&(inp.mx||inp.my||inp.jump||inp.dash||inp.grab||inp.strike||inp.parry))g.awake=true;
 if(g.awake&&(g.combat||g.foes||g.parryable))parryStep(g,p,inp);
 root.BladefallPrecisionCombat?.before(g,inp);
 root.BladefallPrecisionFoes?.before(g,inp);
 root.BladefallPrecisionPortals?.before(g,inp);
 devCall('before',g,inp);
 updatePlayer(g,p,inp);
 if(p.state!=='dead')interact(g,p,inp);
 if(p.state!=='dead')root.BladefallPrecisionCombat?.after(g,inp);
 if(p.state!=='dead')root.BladefallPrecisionFoes?.after(g,inp);
 if(p.state!=='dead')root.BladefallPrecisionPortals?.after(g,inp);
 if(p.state!=='dead')devCall('after',g,inp);
 if(p.state!=='dead')checkExit(g,p);
}

/* ---------------------------------------------------------------- parry (rooms with foes)
   One ward for every foe: a press arms it for nine ticks; a whiff costs eighteen before the next.
   The direction held at the press aims a returned projectile; nothing held sends it straight back.
   Each foe module decides what its attacks do when they meet an armed ward, then calls parrySuccess. */
const PARRY=Object.freeze({window:9,recovery:18,freeze:3});
function parryStep(g,p,inp){
 if(p.parryTimer>0)p.parryTimer--;
 if(p.parryCooldown>0)p.parryCooldown--;
 if(g.buf.parry>0&&p.parryCooldown<=0&&p.state!=='dash'&&!p.carrying){
  g.buf.parry=0;g.buf.strike=0;g.buf.dash=0;p.strikeTimer=0;
  p.parryTimer=PARRY.window;p.parryCooldown=PARRY.recovery;
  p.parryAim={x:inp.mx,y:inp.my};emit(g,'parry-ready',{x:p.x+p.w/2,y:p.y+p.h/2});
 }
}
function parrySuccess(g,p){p.parryTimer=0;p.parryCooldown=0;refillDash(g,p);g.freeze=Math.max(g.freeze,PARRY.freeze);}

function kill(g,p,cause){
 if(p.state==='dead')return;
 p.state='dead';p.deadTimer=K.deathFrames;g.deaths++;if(p.carrying){p.carrying.held=false;p.carrying=null;}
 g.freeze=4;emit(g,'death',{x:p.x+4,y:p.y+6,cause,vx:p.vx,vy:p.vy});
}

function onGroundCheck(g,p){
 if(p.vy<0)return false;
 if(p.dropT>0)return solidAt(g,p.x,p.y+1,p.w,p.h);
 return solidAt(g,p.x,p.y+1,p.w,p.h)||thruBelow(g,p.x,p.y,p.w,p.h);
}
/* Thorns on the wall beside the knight, pointing at him (within wallbounce reach). */
function thornedFace(g,p,dir){
 const want=dir>0?SPIKE_LEFT:SPIKE_RIGHT,x0=dir>0?p.x+p.w:p.x-K.superWallJumpCheck,x1=x0+K.superWallJumpCheck-1;
 const c0=Math.floor(x0/TILE),c1=Math.floor(x1/TILE),r0=Math.floor(p.y/TILE),r1=Math.floor((p.y+p.h-1)/TILE);
 for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)if(tileAt(g,c,r)===want)return true;
 return false;
}
function wallJumpCheck(g,p,dir,dist=K.wallJumpCheck){return solidAt(g,p.x+dir*dist,p.y,p.w,p.h)&&!p.onGround;}
function climbCheck(g,p,dir,yAdd=0){
 // The wall must be beside the upper body; you cannot grab spikes or one-way platforms.
 return solidAt(g,p.x+dir*K.climbCheck,p.y+yAdd,p.w,p.h-3);
}
function standingOn(g,p,e){return p.y+p.h===e.y&&p.x<e.x+e.w&&p.x+p.w>e.x&&(p.onGround||p.state==='dash');}
function climbingOn(g,p,e){return p.state==='climb'&&(p.facing>0?p.x+p.w===e.x:p.x===e.x+e.w)&&p.y<e.y+e.h&&p.y+p.h>e.y;}

function refillDash(g,p){if(p.dashes<p.maxDashes){p.dashes=p.maxDashes;p.dashFlash=8;emit(g,'refill-dash',{x:p.x+4,y:p.y});return true;}return false;}
function refillStamina(p){p.stamina=K.climbMaxStamina;}
function liftBoost(p){
 if(p.liftTimer<=0)return {x:0,y:0};
 return {x:Math.max(-K.liftXCap,Math.min(K.liftXCap,p.liftX)),y:p.liftY<0?Math.max(K.liftYCap,p.liftY):0};
}

function jump(g,p,inp){
 g.buf.jump=0;p.jumpGrace=0;p.varJump=K.varJumpFrames;p.autoJump=false;p.wallSlide=K.wallSlideFrames;p.wallBoostTimer=0;
 p.vx+=K.jumpHBoost*inp.mx;p.vy=K.jumpSpeed;const l=liftBoost(p);p.vx+=l.x;p.vy+=l.y;p.varJumpSpeed=p.vy;p.liftTimer=0;
 emit(g,'jump',{x:p.x+4,y:p.y+p.h,lift:l.x||l.y?1:0});
}
function superJump(g,p,inp){
 g.buf.jump=0;p.jumpGrace=0;p.varJump=K.varJumpFrames;p.autoJump=false;p.wallSlide=K.wallSlideFrames;
 const dir=sign(p.dashDir.x)||p.facing;p.facing=dir;
 p.vx=K.superJumpH*dir;p.vy=K.jumpSpeed;
 const hyper=p.ducking;if(hyper){p.vx*=K.hyperXMult;p.vy*=K.hyperYMult;p.ducking=false;}
 const l=liftBoost(p);p.vx+=l.x;p.vy+=l.y;p.varJumpSpeed=p.vy;p.liftTimer=0;
 p.state='normal';emit(g,hyper?'hyper':'super',{x:p.x+4,y:p.y+p.h});
}
function wallJump(g,p,inp,dir){
 g.buf.jump=0;p.ducking=false;p.jumpGrace=0;p.varJump=K.varJumpFrames;p.autoJump=false;p.wallSlide=K.wallSlideFrames;p.wallBoostTimer=0;
 if(inp.mx!==0){p.forceMoveX=dir;p.forceMoveTimer=K.wallJumpForceFrames;}
 p.vx=K.wallJumpH*dir;p.vy=K.jumpSpeed;const l=liftBoost(p);p.vx+=l.x;p.vy+=l.y;p.varJumpSpeed=p.vy;p.facing=dir;
 p.state='normal';emit(g,'walljump',{x:p.x+(dir>0?0:8),y:p.y+6,dir});
}
function superWallJump(g,p,inp,dir){
 g.buf.jump=0;p.ducking=false;p.jumpGrace=0;p.varJump=K.superWallVarFrames;p.autoJump=false;p.wallSlide=K.wallSlideFrames;p.wallBoostTimer=0;
 p.vx=K.superWallJumpH*dir;p.vy=K.superWallJumpSpeed;const l=liftBoost(p);p.vx+=l.x;p.vy+=l.y;p.varJumpSpeed=p.vy;p.facing=dir;
 p.state='normal';emit(g,'wallbounce',{x:p.x+(dir>0?0:8),y:p.y+6,dir});
}
function climbJump(g,p,inp){
 if(!g.assist.infiniteStamina)p.stamina-=K.climbJumpCost;
 jump(g,p,inp);
 if(inp.mx===0){p.wallBoostDir=-p.facing;p.wallBoostTimer=K.climbJumpBoostFrames;}
 p.state='normal';emit(g,'climbjump',{x:p.x+4,y:p.y+p.h});
}
function startDash(g,p,inp){
 g.buf.dash=0;p.dashes--;p.state='dash';p.dashTimer=K.dashFrames;p.dashCooldown=K.dashCooldownFrames;p.dashRefillCooldown=K.dashRefillCooldownFrames;
 p.beforeDash={x:p.vx,y:p.vy};p.pressAim={x:inp?inp.mx:0,y:inp?inp.my:0};p.vx=0;p.vy=0;p.dashAim=true;p.ducking=false;p.wallBoostTimer=0;p.varJump=0;
 g.freeze=K.dashFreezeFrames;
 // A dash also flips every two-phase machine in the room: the Switchback rule.
 flipPhase(g,'dash');
}
function flipPhase(g,cause){
 const has=g.ents.some(e=>e.type==='toggle');if(!has)return;
 g.phase^=1;emit(g,'phase',{phase:g.phase,cause});
}

function updatePlayer(g,p,inp){
 // timers
 if(p.dashCooldown>0)p.dashCooldown--;
 if(p.dashRefillCooldown>0)p.dashRefillCooldown--;
 if(p.forceMoveTimer>0)p.forceMoveTimer--;
 if(p.wallBoostTimer>0)p.wallBoostTimer--;
 if(p.climbNoMove>0)p.climbNoMove--;
 if(p.liftTimer>0)p.liftTimer--;
 if(p.strikeCooldown>0)p.strikeCooldown--;
 if(p.dashFlash>0)p.dashFlash--;
 if(p.varJump>0)p.varJump--;
 const mx=p.forceMoveTimer>0?p.forceMoveX:inp.mx;
 const I={...inp,mx};

 // drop-through (g.dropThru, set by The Climb, 7.269): down + jump on a one-way ledge falls through it
 if(p.dropT>0)p.dropT--;
 if(g.dropThru&&inp.my>0&&g.buf.jump>0&&p.state==='normal'&&thruBelow(g,p.x,p.y,p.w,p.h)&&!solidAt(g,p.x,p.y+1,p.w,p.h)){g.buf.jump=0;p.dropT=8;p.jumpGrace=0;p.y+=1;}
 p.wasGround=p.onGround;p.onGround=onGroundCheck(g,p);
 if((p.fling||p.coast)&&(p.onGround||p.state==='climb'||p.state==='dash'))p.fling=p.coast=false;
 if(p.onGround){
  if(!p.wasGround&&p.lastFallSpeed>40)emit(g,'land',{x:p.x+4,y:p.y+p.h,speed:p.lastFallSpeed});
  p.jumpGrace=K.jumpGraceFrames;p.wallSlide=K.wallSlideFrames;
  if(p.state!=='climb'){refillStamina(p);if(p.dashRefillCooldown<=0)refillDash(g,p);}
 }else if(p.jumpGrace>0)p.jumpGrace--;
 p.lastFallSpeed=p.vy;
 if(g.assist.infiniteStamina)p.stamina=K.climbMaxStamina;

 // Wall-speed retention: hit a wall at speed, clear it within four frames, keep the speed.
 if(p.retainTimer>0){p.retainTimer--;if(!solidAt(g,p.x+sign(p.retained),p.y,p.w,p.h)){p.vx=p.retained;p.retainTimer=0;}}

 // strike (normal and climb states)
 if(g.buf.strike>0&&p.strikeCooldown<=0&&p.state!=='dash'&&!p.carrying&&!(p.parryTimer>0)){
  g.buf.strike=0;p.strikeTimer=K.strikeFrames;p.strikeCooldown=K.strikeCooldownFrames;p.strikeHit.clear();
  const side=p.state==='climb'?-p.facing:p.facing;
  // aim8 (a room flag; The Climb, 7.268): the blade cuts in every direction a dash can go, diagonals too
  if(g.room.def.aim8)p.strikeDir=inp.my<0?{x:inp.mx,y:-1}:(inp.my>0&&!p.onGround?{x:inp.mx,y:1}:{x:inp.mx||side,y:0});
  else p.strikeDir=inp.my<0?{x:0,y:-1}:(inp.my>0&&!p.onGround?{x:0,y:1}:{x:side,y:0});
  emit(g,'strike',{dir:p.strikeDir});
 }

 if(p.state==='normal')normalUpdate(g,p,I);
 else if(p.state==='climb')climbUpdate(g,p,I);
 else if(p.state==='dash')dashUpdate(g,p,I);
 if(p.state==='dead')return;

 // Carried lantern follows before the move so it can test the space it will occupy.
 devCall('forces',g,p,inp);
 if(p.state==='dead')return;
 const hitH=(b,s)=>onCollideH(g,p,b,s),hitV=(b,s)=>onCollideV(g,p,b,s);
 moveX(g,p,p.vx*DT+(p.pushX||0),hitH);p.pushX=0;
 if(p.state!=='dead')moveY(g,p,p.vy*DT,hitV,undefined,!(p.dropT>0));
 if(p.carrying){p.carrying.x=p.x;p.carrying.y=p.y-8;}
 if(p.strikeTimer>0)p.strikeTimer--;
}

function normalUpdate(g,p,inp){
 if(inp.mx!==0&&p.forceMoveTimer<=0)p.facing=inp.mx;
 if(p.forceMoveTimer>0)p.facing=p.forceMoveX;
 // Grab: lanterns first, then walls.
 if(g.buf.grab>0&&!p.carrying){
  const lan=g.ents.find(e=>e.type==='lantern'&&!e.held&&!e.returning&&overlap(p.x-4,p.y-4,p.w+8,p.h+8,e.x,e.y,e.w,e.h));
  if(lan){g.buf.grab=0;lan.held=true;lan.vx=lan.vy=0;p.carrying=lan;emit(g,'pickup');}
 }else if(g.buf.grab>0&&p.carrying){
  g.buf.grab=0;const lan=p.carrying;p.carrying=null;lan.held=false;
  if(inp.my>0){lan.vx=p.vx*.5;lan.vy=0;}else{lan.vx=K.throwX*p.facing+p.vx*.3;lan.vy=K.throwY;}
  // Throw from the head; if a ceiling is there, from the chest.
  lan.x=p.x;lan.y=p.y-8;if(solidAt(g,lan.x,lan.y,8,8)){lan.y=p.y;if(solidAt(g,lan.x,lan.y,8,8)){lan.x=p.x;lan.y=p.y+3;}}
  lan.remX=lan.remY=0;emit(g,'throw',{dir:p.facing});
 }
 if(inp.grab&&!p.carrying&&p.stamina>=K.climbTired&&p.vy>=0&&sign(p.vx)!==-p.facing){
  if(climbCheck(g,p,p.facing)){enterClimb(g,p);return climbUpdate(g,p,inp);}
  // Climb snap: a wall just above the hands pulls you up to it.
  if(inp.my<1)for(let i=1;i<=2;i++)if(!solidAt(g,p.x,p.y-i,p.w,p.h)&&climbCheck(g,p,p.facing,-i)){p.y-=i;enterClimb(g,p);return climbUpdate(g,p,inp);}
 }
 if(g.buf.dash>0&&p.dashes>0&&p.dashCooldown<=0&&!p.carrying){startDash(g,p,inp);return;}

 // Horizontal: keep momentum above the run cap while you hold its direction.
 const mult=p.onGround?(p.traction??1):K.airMult,max=K.maxRun;
 // A portal fling keeps its speed in the air (no drag) until you land, grab or dash; pressing back brakes it.
 if((p.fling||p.coast)&&!p.onGround&&Math.abs(p.vx)>max){if(inp.mx===-sign(p.vx))p.vx=approach(p.vx,0,K.runReduce*mult*DT);}
 else if(Math.abs(p.vx)>max&&sign(p.vx)===inp.mx)p.vx=approach(p.vx,max*inp.mx,K.runReduce*mult*DT);
 else p.vx=approach(p.vx,max*inp.mx,K.runAccel*mult*DT);
 // Climb-jump refund: jump off a wall without a direction, then press away within 0.2 s.
 if(p.wallBoostTimer>0&&inp.mx===p.wallBoostDir){p.vx=K.wallJumpH*inp.mx;if(!g.assist.infiniteStamina)p.stamina+=K.climbJumpCost;p.wallBoostTimer=0;emit(g,'wallboost');}

 // Vertical
 if(!p.onGround){
  let maxFall=p.carrying?K.carryMaxFall:(inp.my>0&&p.vy>=K.maxFall?K.fastMaxFall:K.maxFall);
  p.maxFall=approach(p.maxFall,maxFall,K.fastMaxAccel*DT);if(p.carrying)p.maxFall=Math.min(p.maxFall,K.carryMaxFall);
  if(p.fling&&!p.carrying)p.maxFall=Math.max(p.maxFall,K.flingMaxFall);   // a fall through portals keeps building; the lantern's glide still wins
  let fall=p.maxFall;
  // Wall slide: pressing into a wall slows the fall, briefly.
  if(inp.mx===p.facing&&p.vy>0&&!p.carrying&&climbCheck(g,p,p.facing)){
   fall=K.wallSlideStartMax+(fall-K.wallSlideStartMax)*(1-p.wallSlide/K.wallSlideFrames);
   if(p.wallSlide>0)p.wallSlide--;
  }
  const half=Math.abs(p.vy)<K.halfGravThreshold&&(inp.jump||p.autoJump);
  p.vy=approach(p.vy,fall,K.gravity*(half?.5:1)*DT);
 }
 if(p.varJump>0){if(inp.jump||p.autoJump)p.vy=Math.min(p.vy,p.varJumpSpeed);else p.varJump=0;}
 if(p.vy>=0)p.autoJump=false;

 // Jump
 if(g.buf.jump>0){
  if(p.jumpGrace>0)jump(g,p,inp);
  else if(!p.carrying&&wallJumpCheck(g,p,1)){if(p.facing===1&&inp.grab&&p.stamina>0&&climbCheck(g,p,1))climbJump(g,p,inp);else wallJump(g,p,inp,-1);}
  else if(!p.carrying&&wallJumpCheck(g,p,-1)){if(p.facing===-1&&inp.grab&&p.stamina>0&&climbCheck(g,p,-1))climbJump(g,p,inp);else wallJump(g,p,inp,1);}
  else devCall('airJump',g,p,inp);
 }
}

function enterClimb(g,p){
 p.state='climb';p.vx=0;p.vy*=.2;p.wallSlide=K.wallSlideFrames;p.climbNoMove=K.climbNoMoveFrames;p.wallBoostTimer=0;p.varJump=0;
 // Snap flush to the wall.
 for(let i=0;i<K.climbCheck;i++)if(!solidAt(g,p.x+p.facing,p.y,p.w,p.h))p.x+=p.facing;else break;
 emit(g,'grab',{x:p.x+(p.facing>0?8:0),y:p.y+4});
}
function climbUpdate(g,p,inp){
 if(!inp.grab||p.carrying){p.state='normal';return;}
 if(g.buf.jump>0){
  if(inp.mx===-p.facing)wallJump(g,p,inp,-p.facing);else climbJump(g,p,inp);
  return;
 }
 if(g.buf.dash>0&&p.dashes>0&&p.dashCooldown<=0){startDash(g,p,inp);return;}
 p.vx=0;
 if(!climbCheck(g,p,p.facing)){
  // Hands have cleared the top of the wall: hop onto the ledge.
  if(p.vy<0||inp.my<0){p.vx=K.climbHopX*p.facing;p.vy=Math.min(p.vy,K.climbHopY);p.forceMoveX=p.facing;p.forceMoveTimer=K.climbHopForceFrames;p.state='normal';emit(g,'climbhop');return;}
  p.state='normal';return;
 }
 let target=0,cost=K.climbStillCost;
 if(p.climbNoMove<=0){
  if(inp.my<0){
   // Blocked head: hold still. Wall ends at the head: climb hops over above.
   if(solidAt(g,p.x,p.y-1,p.w,p.h)){target=0;}else{target=K.climbUpSpeed;cost=K.climbUpCost;}
  }else if(inp.my>0){target=K.climbDownSpeed;cost=0;}
 }
 if(p.stamina<=0){target=K.climbSlipSpeed;}
 p.vy=approach(p.vy,target,K.climbAccel*DT);
 if(!g.assist.infiniteStamina)p.stamina-=cost*DT;
 if(p.stamina<=0&&!g.assist.infiniteStamina){p.stamina=0;p.state='normal';emit(g,'tired');}
 // Stamina low: the knight shakes (view reads p.stamina).
 if(inp.my>0&&p.onGround)p.state='normal';
}

function dashUpdate(g,p,inp){
 if(p.dashAim){
  // Direction is read when the freeze ends, so a slightly late aim still counts.
  p.dashAim=false;
  let dx=inp.mx,dy=inp.my;if(!dx&&!dy){dx=p.pressAim.x;dy=p.pressAim.y;}if(!dx&&!dy)dx=p.facing;
  const len=Math.hypot(dx,dy);p.dashDir={x:dx/len,y:dy/len};if(dx)p.facing=sign(dx);
  let vx=p.dashDir.x*K.dashSpeed,vy=p.dashDir.y*K.dashSpeed;
  if(sign(p.beforeDash.x)===sign(vx)&&Math.abs(p.beforeDash.x)>Math.abs(vx))vx=p.beforeDash.x;
  p.vx=vx;p.vy=vy;
  if(p.dashDir.y>0&&p.dashDir.x!==0)p.ducking=true;
  emit(g,'dash',{x:p.x+4,y:p.y+6,dx:p.dashDir.x,dy:p.dashDir.y});
 }
 // Landing during a down-diagonal dash turns it into a fast ground dash (the wavedash rule).
 if(p.onGround&&p.dashDir.x!==0&&p.dashDir.y>0){p.dashDir={x:sign(p.dashDir.x),y:0};p.vy=0;p.vx*=K.ultraMult;p.ducking=true;emit(g,'ultra');}
 if(g.buf.jump>0){
  if(p.dashDir.y===0&&p.jumpGrace>0){superJump(g,p,inp);return;}
  if(p.dashDir.x===0&&p.dashDir.y<0){
   // A thorned face is not a wall to push off (7.254): the thorn strip is thin, so without this a
   // wallbounce could reach the rock behind it from five pixels away.
   if(solidAt(g,p.x+K.superWallJumpCheck,p.y,p.w,p.h)&&!thornedFace(g,p,1)){superWallJump(g,p,inp,-1);return;}
   if(solidAt(g,p.x-K.superWallJumpCheck,p.y,p.w,p.h)&&!thornedFace(g,p,-1)){superWallJump(g,p,inp,1);return;}
  }
  if(p.jumpGrace>0){p.state='normal';p.ducking=false;jump(g,p,inp);return;}
  if(wallJumpCheck(g,p,1)){wallJump(g,p,inp,-1);return;}
  if(wallJumpCheck(g,p,-1)){wallJump(g,p,inp,1);return;}
 }
 if(inp.grab&&p.dashTimer<K.dashFrames-2&&!p.onGround&&p.dashDir.y<=0&&climbCheck(g,p,p.facing)&&sign(p.vx)!==-p.facing){enterClimb(g,p);return;}
 if(--p.dashTimer<=0){
  if(p.dashDir.y<=0){p.vx=p.dashDir.x*K.endDashSpeed*(Math.abs(p.vx)>K.dashSpeed?Math.abs(p.vx)/K.dashSpeed:1);p.vy=p.dashDir.y*K.endDashSpeed;}
  if(p.vy<0)p.vy*=K.endDashUpMult;
  p.state='normal';p.ducking=false;p.maxFall=K.maxFall;
 }
}

function onCollideH(g,p,b,s){
 if(p.state==='dash'){
  if(b&&b.type==='slide'){pushStone(g,p,b,s,0);return;}
  if(b&&b.dev&&devCall('dashHit',g,p,b,s,0))return;
  // Dash corner correction: a horizontal dash clipping a ledge slides over or under it.
  if(p.dashDir.y===0)for(let i=1;i<=K.dashCorner;i++)for(const j of [-1,1]){
   if(!solidAt(g,p.x+s,p.y+i*j,p.w,p.h)){p.y+=i*j;p.x+=s;return;}
  }
 }
 if(Math.abs(p.vx)>0&&p.retainTimer<=0){p.retained=p.vx;p.retainTimer=K.wallSpeedRetentionFrames;}
 p.vx=0;
}
function onCollideV(g,p,b,s){
 if(s<0){
  if(p.state==='dash'&&b&&b.type==='slide'){pushStone(g,p,b,0,-1);return;}
  if(p.state==='dash'&&b&&b.dev&&devCall('dashHit',g,p,b,0,-1))return;
  // Upward corner correction: a jump that clips a ceiling corner by up to 4 px slides past it.
  const order=p.vx<0?[-1]:p.vx>0?[1]:[-1,1];
  for(const d of order)for(let i=1;i<=K.upwardCorner;i++){
   if(!solidAt(g,p.x+i*d,p.y-1,p.w,p.h)){p.x+=i*d;return;}
  }
  p.vy=0;p.varJump=0;
  return;
 }
 if(p.state==='dash'&&b&&b.type==='slide'){pushStone(g,p,b,0,1);return;}
 if(p.state==='dash'&&b&&b.dev&&devCall('dashHit',g,p,b,0,1))return;
 p.vy=0;
}

/* ---------------------------------------------------------------- stones: dash to slide */
function pushStone(g,p,stone,sx,sy){
 if(stone.moving)return;
 stone.moving=true;stone.dirX=sx;stone.dirY=sy;stone.speed=60;stone.acc=0;stone.remX=stone.remY=0;
 // The knight rebounds off the face it struck; the dash is spent.
 p.state='normal';p.dashTimer=0;p.ducking=false;
 if(sx){p.vx=-sx*120;p.vy=-120;p.varJumpSpeed=p.vy;p.varJump=f(.15);p.autoJump=true;}
 else if(sy>0){p.vx=0;p.vy=-160;p.varJumpSpeed=p.vy;p.varJump=f(.15);p.autoJump=true;}
 else{p.vx=0;p.vy=60;}
 g.freeze=2;emit(g,'stone-hit',{x:stone.x+stone.w/2,y:stone.y+stone.h/2,dx:sx,dy:sy});
}

/* ---------------------------------------------------------------- solids that move */
function riderOf(g,e){const p=g.p;if(p.state==='dead'||p.state==='respawn')return false;return standingOn(g,p,e)||climbingOn(g,p,e);}
/* Moves a solid entity by whole pixels; carries a rider and pushes the knight. */
function moveSolid(g,e,dx,dy){
 e.remX+=dx;e.remY+=dy;const mx=Math.round(e.remX),my=Math.round(e.remY);e.remX-=mx;e.remY-=my;
 const p=g.p,riding=riderOf(g,e),lan=g.ents.find(q=>q.type==='lantern'&&!q.held&&q.y+q.h===e.y&&q.x<e.x+e.w&&q.x+q.w>e.x);
 const combatRiders=root.BladefallPrecisionCombat?.solidRiders(g,e);
 const alive=p.state!=='dead'&&p.state!=='respawn';
 const push=(ax,ay)=>{
  e.x+=ax;e.y+=ay;
  if(alive&&overlap(p.x,p.y,p.w,p.h,e.x,e.y,e.w,e.h)){
   // Push the knight clear; if another solid is in the way, it is crushed.
   const nx=ax?(ax>0?e.x+e.w:e.x-p.w):p.x,ny=ay?(ay>0?e.y+e.h:e.y-p.h):p.y;
   const ddx=nx-p.x,ddy=ny-p.y;
   for(let i=0;i<Math.abs(ddx);i++)if(!tryShift(g,p,sign(ddx),0,e)){kill(g,p,'crush');return;}
   for(let i=0;i<Math.abs(ddy);i++)if(!tryShift(g,p,0,sign(ddy),e)){kill(g,p,'crush');return;}
  }else if(alive&&riding){tryShift(g,p,ax,0,e);tryShift(g,p,0,ay,e);}
  if(lan&&!lan.held){tryShift(g,lan,ax,0,e);tryShift(g,lan,0,ay,e);}
  root.BladefallPrecisionCombat?.solidMoved(g,e,ax,ay,combatRiders);
 };
 for(let i=0;i<Math.abs(mx);i++)push(sign(mx),0);
 for(let i=0;i<Math.abs(my);i++)push(0,sign(my));
 if(alive&&(riding||overlap(p.x-1,p.y-1,p.w+2,p.h+2,e.x,e.y,e.w,e.h))&&(mx||my)){p.liftX=dx*FPS;p.liftY=dy*FPS;p.liftTimer=K.liftGraceFrames;}
}

/* ---------------------------------------------------------------- entities */
function updateEntities(g,inp){
 const p=g.p;
 const stonesLeft=g.ents.filter(e=>e.type==='stone'&&!e.lit).length;
 const pressed=new Set();
 // Machinery bodies with the knight or a lantern inside wait to become solid.
 const occupied=new Set();
 for(const e of g.ents)if(e.type==='toggle'&&(overlap(p.x,p.y,p.w,p.h,e.x,e.y,e.w,e.h)||g.ents.some(l=>l.type==='lantern'&&overlap(l.x,l.y,l.w,l.h,e.x,e.y,e.w,e.h))||root.BladefallPrecisionCombat?.occupies(g,e)))occupied.add(e.body);
 for(const e of g.ents){
  if(e.type==='plate'){
   const who=(p.state!=='dead'&&overlap(p.x,p.y,p.w,p.h,e.x,e.y-1,e.w,e.h+1))||g.ents.some(l=>(l.type==='lantern'&&!l.held||l.presses&&!l.gone)&&overlap(l.x,l.y,l.w,l.h,e.x,e.y-1,e.w,e.h+1));
   if(who&&!e.down)emit(g,'plate',{x:e.x+4,y:e.y});e.down=who;if(who)pressed.add(true);
  }
 }
 for(const e of g.ents){
  switch(e.type){
   case 'toggle':{
    const want=e.phase===g.phase;
    if(want&&!e.solid){if(occupied.has(e.body))e.pending=true;else{e.solid=true;e.pending=false;}}
    else if(!want){e.solid=false;e.pending=false;}
    break;}
   case 'gate':if(!e.open&&stonesLeft===0&&(g.ents.some(s=>s.type==='stone')||e.devKeyed)&&!devAny('gateHold',g,e)){e.open=true;e.t=0;emit(g,'gate-open',{x:e.x+e.w/2,y:e.y+e.h/2});}if(e.open)e.t++;break;
   case 'held':{
    const open=e.latchedOpen||pressed.size>0;
    if(open){if(e.solid)emit(g,'held-open',{x:e.x+e.w/2,y:e.y+e.h/2});e.solid=false;}
    else if(!e.solid){if(!overlap(p.x,p.y,p.w,p.h,e.x,e.y,e.w,e.h)&&!root.BladefallPrecisionCombat?.occupies(g,e)){e.solid=true;emit(g,'held-close',{x:e.x+e.w/2,y:e.y+e.h/2});}}
    break;}
   case 'refill':if(e.timer>0&&--e.timer===0)emit(g,'refill-back',{x:e.x+4,y:e.y+4});break;
   case 'pod':if(e.timer>0)e.timer--;break;
   case 'bell':if(e.timer>0)e.timer--;break;
   case 'crumble':
    if(e.broken){if(e.timer>0)e.timer--;else if(!overlap(p.x,p.y,p.w,p.h,e.x,e.y,e.w,e.h)){e.broken=false;e.shaking=0;emit(g,'crumble-back',{x:e.x+e.w/2,y:e.y});}}
    else if(e.shaking>0){if(--e.shaking===0){e.broken=true;e.timer=K.crumbleRespawnFrames;emit(g,'crumble',{x:e.x+e.w/2,y:e.y,w:e.w});}}
    else if(riderOf(g,e)){e.shaking=K.crumbleShakeFrames;emit(g,'crumble-shake',{x:e.x+e.w/2,y:e.y});}
    break;
   case 'slide':if(e.moving){
    e.speed=Math.min(K.stoneMax,e.speed+K.stoneAccel*DT);
    // Probe ahead pixel by pixel; stop flush against the first solid.
    e.acc=(e.acc||0)+e.speed*DT;const n=Math.floor(e.acc);e.acc-=n;let stopped=false;
    for(let i=0;i<n;i++){
     if(blockerAt(g,e.x+e.dirX,e.y+e.dirY,e.w,e.h,e)){stopped=true;break;}
     moveSolid(g,e,e.dirX,e.dirY);e.remX=e.remY=0;
    }
    if(!n&&blockerAt(g,e.x+e.dirX,e.y+e.dirY,e.w,e.h,e))stopped=true;
    if(stopped){e.moving=false;e.speed=0;emit(g,'stone-stop',{x:e.x+e.w/2,y:e.y+e.h/2,dx:e.dirX,dy:e.dirY});}
   }break;
   case 'zip':updateZip(g,e);break;
   case 'lantern':updateLantern(g,e);break;
  }
 }
}
function updateZip(g,e){
 const p=g.p;
 if(e.state==='idle'){if(e.cool>0)e.cool--;else if(riderOf(g,e)){e.state='wind';e.t=0;emit(g,'zip-start',{x:e.x+e.w/2,y:e.y});}}
 else if(e.state==='wind'){if(++e.t>=4){e.state='go';e.t=0;}}
 else if(e.state==='go'){
  // Accelerate toward the target: fast, readable, with a hard stop.
  e.t++;const T=30,a=Math.min(1,e.t/T),ease=a*a;
  const nx=e.ox+(e.tx-e.ox)*ease,ny=e.oy+(e.ty-e.oy)*ease;
  moveSolid(g,e,nx-(e.x+e.remX),ny-(e.y+e.remY));
  if(a>=1){e.x=e.tx;e.y=e.ty;e.remX=e.remY=0;e.state='hold';e.t=0;emit(g,'zip-stop',{x:e.x+e.w/2,y:e.y+e.h/2});}
 }else if(e.state==='hold'){if(++e.t>=30){e.state='back';e.t=0;}}
 else if(e.state==='back'){
  e.t++;const T=120,a=Math.min(1,e.t/T);
  const nx=e.tx+(e.ox-e.tx)*a,ny=e.ty+(e.oy-e.ty)*a;
  moveSolid(g,e,nx-(e.x+e.remX),ny-(e.y+e.remY));
  if(a>=1){e.x=e.ox;e.y=e.oy;e.remX=e.remY=0;e.state='idle';e.cool=20;emit(g,'zip-home',{x:e.x+e.w/2,y:e.y+e.h/2});}
 }
}
function updateLantern(g,e){
 if(e.held)return;
 if(e.returning){if(--e.timer<=0){e.returning=false;e.x=e.ox;e.y=e.oy;e.vx=e.vy=0;emit(g,'lantern-back',{x:e.x+4,y:e.y+4});}return;}
 const grounded=solidAt(g,e.x,e.y+1,e.w,e.h)||thruBelow(g,e.x,e.y,e.w,e.h);
 if(grounded){e.vx=approach(e.vx,0,350*DT);}else e.vy=approach(e.vy,K.maxFall,K.gravity*DT);
 moveX(g,e,e.vx*DT,()=>{e.vx*=-.4;});
 moveY(g,e,e.vy*DT,(b,s)=>{if(s>0&&e.vy>60)emit(g,'lantern-land',{x:e.x+4,y:e.y+8});e.vy=0;});
 // A lantern lost to a pit or spikes floats home: missing a throw costs time, not the room.
 let lost=e.y>g.room.h+8;
 const c0=Math.floor(e.x/TILE),c1=Math.floor((e.x+e.w-1)/TILE),r0=Math.floor(e.y/TILE),r1=Math.floor((e.y+e.h-1)/TILE);
 for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){const t=tileAt(g,c,r);if(t>=SPIKE_UP&&!(g.spikeSafe&&g.spikeSafe(c,r)))lost=true;}
 if(lost){e.returning=true;e.timer=40;emit(g,'lantern-lost',{x:e.x+4,y:Math.min(e.y,g.room.h)});}
}

/* ---------------------------------------------------------------- touches, hazards, blade */
function spikeHit(g,p){
 const hx=p.x,hy=p.y,hw=p.w,hh=9; // hurtbox: the feet are not vulnerable
 const c0=Math.floor(hx/TILE),c1=Math.floor((hx+hw-1)/TILE),r0=Math.floor(hy/TILE),r1=Math.floor((hy+hh-1)/TILE);
 for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){
  const t=tileAt(g,c,r);if(t<SPIKE_UP)continue;
  if(g.spikeSafe&&g.spikeSafe(c,r))continue;   // a device can make thorns harmless (the tide drowns them)
  const x=c*TILE,y=r*TILE;let b;
  // Each spike is a 3 px strip against its base; moving the way it points is safe.
  if(t===SPIKE_UP){b=[x,y+5,8,3];if(p.vy<0)continue;}
  else if(t===SPIKE_DOWN){b=[x,y,8,3];if(p.vy>0)continue;}
  else if(t===SPIKE_LEFT){b=[x+5,y,3,8];if(p.vx<0)continue;}
  else {b=[x,y,3,8];if(p.vx>0)continue;}
  if(overlap(hx,hy,hw,hh,...b))return true;
 }
 return false;
}
function strikeBox(p){
 const d=p.strikeDir;
 if(d.x&&d.y)return [d.x>0?p.x+p.w-3:p.x-11,d.y<0?p.y-12:p.y+p.h-3,14,14];   // a diagonal cut (aim8)
 if(d.y<0)return [p.x-3,p.y-14,14,14];
 if(d.y>0)return [p.x-3,p.y+p.h,14,13];
 return d.x>0?[p.x+p.w,p.y-1,15,12]:[p.x-15,p.y-1,15,12];
}
/* Shared blade rebound: living targets and seed pods use the same movement rule. */
function bladeRebound(g,p,d){
 if(d.y>0){p.vy=K.podSpeed;p.varJumpSpeed=p.vy;p.varJump=f(.12);p.autoJump=true;}
 else if(d.y<0){p.vy=K.podDown;}
 else{p.vx=-d.x*K.podSide;p.vy=Math.min(p.vy,-90);p.forceMoveX=-d.x;p.forceMoveTimer=f(.12);}
 if(p.state==='climb')p.state='normal';
 p.jumpGrace=0;refillDash(g,p);refillStamina(p);
}
function interact(g,p,inp){
 if(spikeHit(g,p)){kill(g,p,'spikes');return;}
 if(p.y>g.room.h+2&&g.room.exit!=='down'&&g.room.def.side!=='down'){kill(g,p,'fall');return;}
 const box=[p.x,p.y,p.w,p.h];
 for(const e of g.ents){
  if(e.gone)continue;
  const touch=overlap(...box,e.x,e.y,e.w,e.h);
  switch(e.type){
   case 'refill':if(touch&&e.timer===0){const a=refillDash(g,p);const b=p.stamina<K.climbTired;if(a||b){refillStamina(p);e.timer=K.refillRespawnFrames;g.freeze=2;emit(g,'refill',{x:e.x+4,y:e.y+4});}}break;
   case 'stone':if(touch&&!e.lit){e.lit=true;emit(g,'stone-lit',{x:e.x+4,y:e.y+4,left:g.ents.filter(s=>s.type==='stone'&&!s.lit).length});}break;
   case 'spring':if(touch&&p.vy>=0&&p.state!=='climb'){
    // g.springUp (The Climb, 7.270): a spring sends you straight up, centred on it, whatever speed you came in with
    if(g.springUp){p.vx=0;p.forceMoveTimer=0;p.remX=0;const cx=Math.round(e.x+e.w/2-p.w/2);if(!solidAt(g,cx,p.y,p.w,p.h))p.x=cx;}
    p.state='normal';p.dashTimer=0;p.ducking=false;p.vy=K.springSpeed;p.varJumpSpeed=p.vy;p.varJump=K.varJumpFrames;p.autoJump=true;p.jumpGrace=0;p.remY=0;
    refillDash(g,p);refillStamina(p);e.timer=8;emit(g,'spring',{x:e.x+4,y:e.y});}
    if(e.timer>0)e.timer--;break;
   case 'shard':if(touch){e.gone=true;g.shards.add(g.room.id+':'+e.id);emit(g,'shard',{x:e.x+4,y:e.y+4,id:g.room.id+':'+e.id});}break;
  }
 }
 // Blade: pods bounce you away from the cut and restore the dash; bells turn the machines;
 // a cut stone lights as surely as a touched one.
 if(p.strikeTimer>0){
  const sb=strikeBox(p);
  for(const e of g.ents){
   if(p.strikeHit.has(e.id))continue;
   if(!overlap(...sb,e.x-2,e.y-2,e.w+4,e.h+4))continue;
   if(e.type==='pod'&&e.timer===0){
    p.strikeHit.add(e.id);e.timer=f(.5);const d=p.strikeDir;
    bladeRebound(g,p,d);g.freeze=3;emit(g,'pod',{x:e.x+4,y:e.y+4,dx:d.x,dy:d.y});
   }else if(e.type==='stone'&&!e.lit){p.strikeHit.add(e.id);e.lit=true;emit(g,'stone-lit',{x:e.x+4,y:e.y+4,left:g.ents.filter(s=>s.type==='stone'&&!s.lit).length,cut:true});
   }else if(e.type==='bell'&&e.timer===0){p.strikeHit.add(e.id);e.timer=f(.3);flipPhase(g,'bell');g.freeze=2;emit(g,'bell',{x:e.x+4,y:e.y+4});}
  }
 }
}
function checkExit(g,p){
 const ex=g.room.exit;let out=false;
 const RW=g.room.w,RH=g.room.h;
 if(ex==='right')out=p.x>=RW-2;else if(ex==='left')out=p.x<=-p.w+2;else if(ex==='up')out=p.y<=-3;else if(ex==='down')out=p.y>=RH-2;
 let side=false;const sd=g.sideSealed?null:g.room.def.side;
 if(!out&&sd){if(sd==='right')out=p.x>=RW-2;else if(sd==='left')out=p.x<=-p.w+2;else if(sd==='up')out=p.y<=-3;else if(sd==='down')out=p.y>=RH-2;side=out;}
 if(out&&!g.exited){g.exited=true;emit(g,'exit',side?{room:g.roomIndex,side:true}:{room:g.roomIndex});}
}

/* Advance to another room (the view calls this after its transition). */
function enterRoom(g,index){g.roomDeaths=0;loadRoom(g,index);}

/* A compact state digest for determinism checks. */
function digest(g){const p=g.p;return [g.roomIndex,g.frame,p.x,p.y,p.vx.toFixed(3),p.vy.toFixed(3),p.state,p.dashes,g.phase,g.deaths].join(',');}

root.BladefallPrecisionCore=Object.freeze({K,FPS,DT,TILE,COLS,ROWS,W,H,EMPTY,SOLID,THRU,SPIKE_UP,SPIKE_DOWN,SPIKE_LEFT,SPIKE_RIGHT,
 parseRoom,createGame,step,loadRoom,resetRoom,enterRoom,kill,solidAt,tileAt,strikeBox,digest,onGroundCheck,
 moveX,moveY,blockerAt,overlap,refillDash,bladeRebound,flipPhase,emit,PARRY,parrySuccess,
 moveSolid,tryShift,jump,spikeHit,riderOf,standingOn,groupsOf,devCall,devAny});
})(typeof window!=='undefined'?window:globalThis);
