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
 if(h&&h.spit){h.st=0;g.foes=g.foes||[];g.bolts=g.bolts||[];g.parryable=true;}}
const HS=Object.freeze({every:110,first:80,speed:110,tell:24,x:236,y:150});   // the head's jaw
function spitDue(h){const s=h.spit;if(!s)return Infinity;const every=s.every||HS.every,first=s.first??HS.first;return h.st<first?first-h.st:(every-(h.st-first)%every)%every;}
function before(g){const h=g.chainHydra;if(h&&!h.done&&g.awake){h.t++;if(h.grace>0)h.grace--;
 if(h.spit){const p=g.p;if(spitDue(h)===0&&p.state!=='dead'&&p.state!=='respawn'){const sp=h.spit.speed||HS.speed,dx=p.x+4-HS.x,dy=p.y+5.5-HS.y,n=Math.hypot(dx,dy)||1;
   g.bolts.push({x:HS.x-2+dx/n*8,y:HS.y-2+dy/n*8,w:4,h:4,vx:dx/n*sp,vy:dy/n*sp,friendly:false,alive:true,from:'hydra'});C().emit(g,'enemy-shot',{x:HS.x,y:HS.y,hydra:true});}
  h.st++;}}}
function after(g){const h=g.chainHydra,p=g.p,Core=C();if(!h||h.done||p.state==='dead'||p.state==='respawn')return;
 if(g.events.some(e=>e.type==='hook'))h.serial++;
 const phase=h.t%240,open=phase>=50&&phase<205;
 if(p.state==='hook'&&open&&h.serial>h.spent)h.grace=108;
 if(p.strikeTimer>0&&p.strikeDir.y>0&&!p.strikeHit.has('hydra-lock')&&Core.overlap(...Core.strikeBox(p),h.c*8,h.r*8,8,9)){
  p.strikeHit.add('hydra-lock');if(h.grace>0&&h.serial>h.spent){h.spent=h.serial;h.grace=0;h.hits++;Core.emit(g,'hydra-lock',{x:h.c*8+4,y:h.r*8});if(h.hits===(h.need||2)){h.done=true;Core.emit(g,'hydra-free',{x:h.c*8+4,y:h.r*8});}
   else if(h.locks&&h.locks[h.hits]){const [c,r]=h.locks[h.hits];if(c!==h.c||r!==h.r){const from={x:h.c*8+4,y:h.r*8};h.c=c;h.r=r;Core.emit(g,'hydra-drag',{x:c*8+4,y:r*8,fx:from.x,fy:from.y});}}}
 }
 // A low committed lunge. The collar above it is the safe way onto the chain.
 if(phase>=40&&phase<50&&Core.overlap(p.x,p.y,p.w,p.h,80,132,160,12))Core.kill(g,p,'hydra-lunge');
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rbr-cliffs',reset,before,after,gateHold:g=>!!(g.chainHydra&&!g.chainHydra.done)});
root.BladefallPrecisionHydra=Object.freeze({HS,spitDue});
})(typeof window!=='undefined'?window:globalThis);
