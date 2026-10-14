/* Thunder Cliffs: two downward cuts free each Hydra collar. Each cut needs a fresh hooked ascent.
   (7.280, opt-in on chainHydra; a collar without these fields plays exactly as before)
   need:n                 cuts to free the collar (default 2).
   locks:[[c,r],…]        the collar is dragged: after each cut its gold lock moves to locks[cuts so far] (locks[0]
                          replaces c,r). Its chain always runs to the head, so the next lock is easy to read.
   spit:{every,first,speed}  the head's second pattern: its jaw glows for 24 frames, then it spits a bolt at where
                          the knight is (in the air too). Cut it or parry it. */
(function(root){'use strict';const C=()=>root.BladefallPrecisionCore;
function reset(g){g.chainHydra=g.room.def.chainHydra?{...g.room.def.chainHydra,t:0,hits:0,serial:0,spent:0,grace:0,done:false}:null;if(g.chainHydra)for(const e of g.ents)if(e.type==='gate')e.devKeyed=true;
 const h=g.chainHydra;if(h&&h.locks&&h.locks.length){h.c=h.locks[0][0];h.r=h.locks[0][1];}
 if(h&&h.hunt){h.mode='watch';h.clock=0;h.face=-1;h.jawX=h.c*8+4;h.jawY=h.r*8+4;g.parryable=true;}
 if(h&&h.spit){h.st=0;g.foes=g.foes||[];g.bolts=g.bolts||[];g.parryable=true;}}
const HS=Object.freeze({every:110,first:80,speed:110,tell:24,x:236,y:150});   // the head's jaw
function spitDue(h){const s=h.spit;if(!s)return Infinity;const every=s.every||HS.every,first=s.first??HS.first;return h.st<first?first-h.st:(every-(h.st-first)%every)%every;}
function target(g,x,y){return g.players?.filter(p=>p.state!=='dead'&&p.state!=='respawn').sort((a,b)=>Math.hypot(a.x+4-x,a.y+5.5-y)-Math.hypot(b.x+4-x,b.y+5.5-y))[0]||g.p;}
function before(g){if(g.players){for(const p of g.players)if(p.hydraClimb?.grace>0)p.hydraClimb.grace--;for(const e of g.ents)if(e.type==='hydra-spine'&&e.pending&&!g.players.some(p=>p.state!=='dead'&&p.state!=='respawn'&&C().overlap(p.x,p.y,p.w,p.h,e.x,e.y,e.w,e.h))){e.pending=false;e.solid=true;}}const h=g.chainHydra;if(h?.hunt){jawBefore(g,h);return;}if(h&&!h.done&&g.awake){h.t++;if(h.grace>0)h.grace--;
 if(h.spit){const p=target(g,HS.x,HS.y);if(spitDue(h)===0&&p.state!=='dead'&&p.state!=='respawn'){const sp=h.spit.speed||HS.speed,dx=p.x+4-HS.x,dy=p.y+5.5-HS.y,n=Math.hypot(dx,dy)||1;
   g.bolts.push({x:HS.x-2+dx/n*8,y:HS.y-2+dy/n*8,w:4,h:4,vx:dx/n*sp,vy:dy/n*sp,friendly:false,alive:true,from:'hydra'});C().emit(g,'enemy-shot',{x:HS.x,y:HS.y,hydra:true});}
  h.st++;}}}
function after(g){const h=g.chainHydra,p=g.p,Core=C();if(!h||h.done||p.state==='dead'||p.state==='respawn')return;if(h.hunt){jawAfter(g,h);return;}
 const progress=g.players?(p.hydraClimb||(p.hydraClimb={serial:0,spent:0,grace:0})):h;
 if(g.events.some(e=>e.type==='hook'&&(!g.players||e.frame===g.frame&&e.player===g.coopActor)))progress.serial++;
 const phase=h.t%240,open=phase>=50&&phase<205;
 if(p.state==='hook'&&open&&progress.serial>progress.spent)progress.grace=108;
 if(p.strikeTimer>0&&p.strikeDir.y>0&&!p.strikeHit.has('hydra-lock')&&Core.overlap(...Core.strikeBox(p),h.c*8,h.r*8,8,9)){
  p.strikeHit.add('hydra-lock');if(progress.grace>0&&progress.serial>progress.spent){progress.spent=progress.serial;progress.grace=0;h.hits++;Core.emit(g,'hydra-lock',{x:h.c*8+4,y:h.r*8});if(h.hits===(h.need||2)){h.done=true;Core.emit(g,'hydra-free',{x:h.c*8+4,y:h.r*8});}
   else if(h.locks&&h.locks[h.hits]){const [c,r]=h.locks[h.hits];if(c!==h.c||r!==h.r){const from={x:h.c*8+4,y:h.r*8};h.c=c;h.r=r;Core.emit(g,'hydra-drag',{x:c*8+4,y:r*8,fx:from.x,fy:from.y});}}}
 }
 // A low committed lunge. The collar above it is the safe way onto the chain.
 if(phase>=40&&phase<50&&Core.overlap(p.x,p.y,p.w,p.h,80,132,160,12))Core.kill(g,p,'hydra-lunge');
}
// Authored jaw encounters: visible wind-up, committed bite, exposed jaw.
// No grapple-history prerequisite: the weapon hits the head the player can see.
function jawBefore(g,h){
 if(h.done||!g.awake)return;const Core=C(),p=target(g,h.c*8+4,h.r*8+4),d={...h.hunt,...h.hunt.stages?.[h.hits]},ax=h.c*8+4,ay=h.r*8+4;
 h.t++;h.clock++;h.jawY=ay;
 if(h.mode==='watch'){
  h.jawX=ax;
  if(p.state!=='dead'&&p.state!=='respawn'&&Math.abs(p.x+4-ax)<(d.notice??160)&&Math.abs(p.y+6-ay)<80){h.face=p.x+4<ax?-1:1;h.mode='tell';h.clock=0;Core.emit(g,'hydra-tell',{x:ax,y:ay,dx:h.face,reach:d.reach??40});}
 }else if(h.mode==='tell'){
  h.jawX=ax-h.face*Math.min(5,h.clock/8);
  if(h.clock>=(d.tell??42)){h.mode='bite';h.clock=0;Core.emit(g,'hydra-bite',{x:ax,y:ay,dx:h.face});}
 }else if(h.mode==='bite'){
  h.jawX=ax+h.face*(d.reach??40)*Math.min(1,h.clock/8);
  if(h.clock>=(d.bite??16)){h.mode='open';h.clock=0;Core.emit(g,'hydra-open',{x:h.jawX,y:ay});}
 }else if(h.mode==='open'){
  if(h.clock>=(d.open??84)){h.mode='recover';h.clock=0;}
 }else if(h.mode==='recover'){
  h.jawX=ax+h.face*(d.reach??40)*Math.max(0,1-h.clock/(d.recover??24));
  if(h.clock>=(d.recover??24)){h.mode='watch';h.clock=0;}
 }
}
function jawAfter(g,h){
 const Core=C(),p=g.p;
 if(h.mode==='bite'){
  const ax=h.c*8+4,x=Math.min(ax,h.jawX)-9,w=Math.abs(ax-h.jawX)+18;
  if(Core.overlap(p.x,p.y,p.w,p.h,x,h.jawY-6,w,12))Core.kill(g,p,'hydra-bite');
 }
 if(p.strikeTimer<=0||p.strikeHit.has('hydra-jaw'))return;
 if(!Core.overlap(...Core.strikeBox(p),h.jawX-11,h.jawY-9,22,18))return;
 p.strikeHit.add('hydra-jaw');
 if(h.mode!=='open'){Core.emit(g,'guard-block',{x:h.jawX,y:h.jawY});return;}
 h.hits++;Core.emit(g,'hydra-lock',{x:h.jawX,y:h.jawY,hits:h.hits,jaw:true});
 const bone=h.hunt.spines?.[h.hits-1];if(bone){g.ents.push({type:'hydra-spine',dev:true,solid:true,id:'hydra-spine-'+h.hits,x:bone.c*8,y:bone.r*8,w:bone.w*8,h:8});const e=g.ents[g.ents.length-1];if(g.players?.some(p=>p.state!=='dead'&&p.state!=='respawn'&&Core.overlap(p.x,p.y,p.w,p.h,e.x,e.y,e.w,e.h))){e.pending=true;e.solid=false;}Core.emit(g,'hydra-spine',{x:bone.c*8,y:bone.r*8,w:bone.w*8});}
 if(h.hits>=(h.need||h.locks?.length||2)){h.done=true;Core.emit(g,'hydra-free',{x:h.jawX,y:h.jawY});return;}
 const next=h.locks?.[h.hits];if(next){const fx=h.jawX,fy=h.jawY;h.c=next[0];h.r=next[1];h.jawX=h.c*8+4;h.jawY=h.r*8+4;Core.emit(g,'hydra-drag',{fx,fy,x:h.jawX,y:h.jawY,jaw:true});}
 h.mode='watch';h.clock=0;
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rbr-cliffs',reset,before,after,afterPlayer:after,gateHold:g=>!!(g.chainHydra&&!g.chainHydra.done)});
root.BladefallPrecisionHydra=Object.freeze({HS,spitDue});
})(typeof window!=='undefined'?window:globalThis);
