/* Room by Room · Drowned Throne: paired crown marks, the King's Right Hand and the all-clear bells.
   Marks require two separate bodies at once (knight + lantern in the lesson; knight + echo at the throne).
   The Right Hand exposes himself at either end of a clearly marked seam; reflected bolts also expose him.
   No ordinary blade damage while his ward is closed. The King spends him when the third opening is taken.
   Optional alarm: the small bell makes a short note, the great bell a long note. Three short, two long.
   (7.280, opt-in on crown; a seal without these fields plays exactly as before)
   crown.phases:[[[c,r],[c,r]],…]  more seals: when the first pair has been held, the crown turns and the next
                  pair lights (drawn faint before then, so you can plan). The gate opens after the last seal.
   crown.bolts:{every,first,speed}  the seated King (king:true) throws at the knight: his eyes burn for 24
                  frames, then a bolt flies from his face at where the knight is. Parry it or cut it; standing
                  still to hold a mark is no protection. Bolts pass through the echo.
   (7.280, Fractured King, opt-in)
   crown.shade:true  a walking shade (room field shade) is a body too: it lights a mark it stands on, so your
                  own path, walked again behind you, can hold the first mark while you hold the second.
   hand.open:frames  how long each of the Hand's openings lasts (default 30); hand.hits: wounds to spend him
                  (default 3). */
(function(root){
'use strict';const C=()=>root.BladefallPrecisionCore;
const overlap=(a,b)=>C().overlap(a.x,a.y,a.w,a.h,b.x,b.y,b.w,b.h);
function reset(g){
 const d=g.room.def;
 g.crown=d.crown?{...d.crown,t:0,lit:[],done:false,phase:0,kt:0}:null;
 if(g.crown&&g.crown.phases)g.crown.phases=g.crown.phases.map(pair=>pair.map(m=>Array.isArray(m)?{c:m[0],r:m[1]}:m));
 if(g.crown&&g.crown.bolts){g.foes=g.foes||[];g.bolts=g.bolts||[];g.parryable=true;}
 g.alarm=d.alarm?{...d.alarm,at:0,done:false,flash:0}:null;
 g.hand=d.hand?{...d.hand,need:d.hand.hits||3,x:d.hand.places[0].c*8,y:(d.hand.places[0].r+1)*8-22,w:14,h:22,t:0,i:0,hits:0,gone:false,fade:0}:null;
 if(g.hand){g.foes=g.foes||[];g.bolts=g.bolts||[];g.parryable=true;}
 if(g.crown||g.alarm||g.hand)for(const e of g.ents)if(e.type==='gate')e.devKeyed=true;
}
const KB=Object.freeze({every:100,first:70,speed:120,tell:24,x:282,y:86});   // the seated King's face
function kingDue(s){const b=s.bolts;if(!b)return Infinity;const every=b.every||KB.every,first=b.first??KB.first;return s.kt<first?first-s.kt:(every-(s.kt-first)%every)%every;}
function before(g){
 const s=g.crown;
 if(s&&s.bolts&&!s.done&&g.awake){const p=g.p;
  if(kingDue(s)===0&&p.state!=='dead'&&p.state!=='respawn'){const sp=s.bolts.speed||KB.speed,dx=p.x+4-KB.x,dy=p.y+5.5-KB.y,n=Math.hypot(dx,dy)||1;
   g.bolts.push({x:KB.x-2+dx/n*8,y:KB.y-2+dy/n*8,w:4,h:4,vx:dx/n*sp,vy:dy/n*sp,friendly:false,alive:true,from:'king'});C().emit(g,'enemy-shot',{x:KB.x,y:KB.y,king:true});}
  s.kt++;
 }
 handBefore(g);
}
function handBefore(g){const h=g.hand;if(!h||h.gone||!g.awake)return;
 h.t=(h.t+1)%180;
 if(h.t===60){h.i=(h.i+1)%h.places.length;const q=h.places[h.i];h.x=q.c*8;h.y=(q.r+1)*8-h.h;C().emit(g,'hand-seam',{x:h.x,y:h.y});}
 if(h.t===110){const p=g.p,dx=p.x+4-(h.x+7),dy=p.y+5-(h.y+10),n=Math.hypot(dx,dy)||1;
  g.bolts.push({x:h.x+7+dx/n*12,y:h.y+10+dy/n*12,w:4,h:4,vx:dx/n*110,vy:dy/n*110,friendly:false,alive:true,from:'hand'});C().emit(g,'enemy-shot',{x:h.x+7,y:h.y+10});}
}
// The Hand's openings: the first `open` frames after each arrival (30 unless the room shortens them).
function handOpen(h){const o=h.open||30;return h.t<o||h.t>=60&&h.t<60+o;}
function wound(g,h){const window=Math.floor(g.roomFrame/180)*2+(h.t>=60?1:0);if(h.lastWound===window)return;h.lastWound=window;h.hits++;C().emit(g,'hand-hit',{x:h.x+7,y:h.y+10});if(h.hits>=(h.need||3)){h.gone=true;C().emit(g,'hand-spent',{x:h.x+7,y:h.y});}}
function after(g){
 const Core=C(),p=g.p;
 if(g.crown&&!g.crown.done){const s=g.crown;
  const bodies=[p,...g.ents.filter(e=>e.type==='echo'||!s.echoOnly&&e.type==='lantern'&&!e.held||s.shade&&e.type==='shade'&&e.state==='on')];
  const living=p.state!=='dead'&&p.state!=='respawn';
  const matches=s.marks.map(m=>bodies.filter(b=>living&&overlap(b,{x:m.c*8-2,y:m.r*8,w:12,h:8})));
  s.lit=matches.map(x=>x.length>0);
  const both=matches.length===2&&matches[0].some(a=>matches[1].some(b=>a!==b));
  s.t=both?s.t+1:0;if(s.t>=(s.hold||1)){
   const more=s.phases&&s.phase<s.phases.length;
   Core.emit(g,'crown-seal',{x:s.marks[1].c*8,y:s.marks[1].r*8,phase:s.phase,last:!more});
   if(more){s.marks=s.phases[s.phase];s.phase++;s.t=0;s.lit=[];Core.emit(g,'crown-turn',{x:s.marks[1].c*8,y:s.marks[1].r*8,phase:s.phase});}
   else s.done=true;
  }
 }
 const a=g.alarm;if(a&&!a.done){if(a.flash>0)a.flash--;
  if(p.strikeTimer>0)for(const [i,bell] of a.bells.entries()){
   const key='alarm:'+i;if(p.strikeHit.has(key))continue;
   if(!Core.overlap(...Core.strikeBox(p),bell.c*8,bell.r*8,8,10))continue;
   p.strikeHit.add(key);a.at=bell.note===a.pattern[a.at]?a.at+1:0;a.flash=24;
   Core.emit(g,'alarm-note',{x:bell.c*8,y:bell.r*8,note:bell.note,correct:a.at>0});
   if(a.at===a.pattern.length){a.done=true;Core.emit(g,'all-clear',{x:bell.c*8,y:bell.r*8});}
  }
 }
 const h=g.hand;if(h&&!h.gone){
  for(const b of g.bolts||[])if(b.alive&&b.friendly&&overlap(b,h)){b.alive=false;wound(g,h);break;}
  if(!h.gone&&p.strikeTimer>0&&!p.strikeHit.has('right-hand')&&Core.overlap(...Core.strikeBox(p),h.x,h.y,h.w,h.h)){
   p.strikeHit.add('right-hand');
   if(handOpen(h))wound(g,h);else Core.emit(g,'guard-block',{x:h.x,y:h.y});
  }
 }
 if(h&&h.gone)h.fade=Math.min(60,h.fade+1);
}
function gateHold(g){return !!(g.crown&&!g.crown.done||g.alarm&&!g.alarm.done||g.hand&&!g.hand.gone);}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rbr-king',reset,before,after,gateHold});
root.BladefallPrecisionKing=Object.freeze({KB,kingDue,handOpen});
})(typeof window!=='undefined'?window:globalThis);
