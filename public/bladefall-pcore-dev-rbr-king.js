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
   crown.duel:{tell,speed}: occupying both marks calls a telegraphed falling blade. Parry it while
                  both marks remain occupied to break that seal; standing still alone cannot win.
   crown.c/r: optional throne position in tiles, shared by its artwork and projectile origin.
   crown.shade:true  a walking shade (room field shade) is a body too: it lights a mark it stands on, so your
                  own path, walked again behind you, can hold the first mark while you hold the second.
   hand.open:frames  how long each of the Hand's openings lasts (default 30); hand.hits: wounds to spend him
                  (default 3).
   (7.308, opt-in room field `court`; rooms without it are untouched) The Abyss King holds court and never waits.
   court:{thrones:[{c,r,…}],first,every,tell,speed,volley,gap,guard,slamTell,slamRest,stun,leap,land,aim}
                  c,r is the tile his feet stand on. Each throne may override every timing below.
    - He throws: his eyes burn for `tell` frames (default 24) with a line drawn to his mark, then a bolt flies from
      his face (`volley` bolts, `gap` frames apart). Parry it, cut it or get out of its line.
    - His guard is the ring drawn round him (`guard` px, default 44). It cannot be crossed: step over it at any time,
      even while he kneels, and he rises for `slamTell`
      frames (default 24), then slams: anything inside dies. Your echo is not hurt. `answer` frames (default 20)
      after the slam he throws at whoever ran.
    - Parry his bolt with no direction held and it flies straight back at him (an aimed parry goes where aimed).
      His own bolt back into him throws him to his knees for `stun` frames (default 110): his guard is down
      and one cut is a wound (the cut rebounds you like a pod). Before that the blade glances off. Returned bolts
      fly back at `back` px/s at least (default 300).
    - Per throne: parry:false — his ward turns returned bolts aside; winded:frames — a slam that finds no one
      inside leaves him winded (kneeling) that long. Trade out to your echo as he slams, then trade back in.
    - A wound shatters your echo, and he leaps (`leap` frames) to his next throne, throwing again `land` frames after.
      With the last wound he falls from his seat and the room's gates open.
    - aim:'echo' (the Fractured King): while your echo stands, he throws at it, not at you. */
(function(root){
'use strict';const C=()=>root.BladefallPrecisionCore;
const overlap=(a,b)=>C().overlap(a.x,a.y,a.w,a.h,b.x,b.y,b.w,b.h);
function reset(g){
 const d=g.room.def;
 g.crown=d.crown?{...d.crown,t:0,lit:[],done:false,phase:0,kt:0,verdict:null,answered:false}:null;
 if(g.crown&&g.crown.phases)g.crown.phases=g.crown.phases.map(pair=>pair.map(m=>Array.isArray(m)?{c:m[0],r:m[1]}:m));
 if(g.crown&&(g.crown.bolts||g.crown.duel)){g.foes=g.foes||[];g.bolts=g.bolts||[];g.parryable=true;}
 g.alarm=d.alarm?{...d.alarm,at:0,done:false,flash:0}:null;
 g.hand=d.hand?{...d.hand,need:d.hand.hits||3,x:d.hand.places[0].c*8,y:(d.hand.places[0].r+1)*8-22,w:14,h:22,t:0,i:0,hits:0,gone:false,fade:0}:null;
 if(g.hand){g.foes=g.foes||[];g.bolts=g.bolts||[];g.parryable=true;}
 g.court=d.court?courtReset(g,d.court):null;
 if(g.crown||g.alarm||g.hand||g.court)for(const e of g.ents)if(e.type==='gate')e.devKeyed=true;
}
const KB=Object.freeze({every:100,first:70,speed:120,tell:24,x:282,y:86});   // the seated King's face
function kingDue(s){const b=s.bolts;if(!b)return Infinity;const every=b.every||KB.every,first=b.first??KB.first;return s.kt<first?first-s.kt:(every-(s.kt-first)%every)%every;}
function before(g){
 const s=g.crown;
 if(s?.verdict&&!s.done&&g.awake){const v=s.verdict;
  if(--v.t===0){g.bolts.push({x:v.x-2,y:v.y,w:4,h:8,vx:0,vy:s.duel.speed||150,friendly:false,alive:true,from:'king-verdict',seal:s.phase});C().emit(g,'crown-verdict',{x:v.x,y:v.y});}
  if(v.t< -60)s.verdict=null;
 }
 if(s&&s.bolts&&!s.done&&g.awake){const p=g.p;
  if(kingDue(s)===0&&p.state!=='dead'&&p.state!=='respawn'){const sp=s.bolts.speed||KB.speed,ox=(s.c??34)*8+10,oy=(s.r??12)*8-10,dx=p.x+4-ox,dy=p.y+5.5-oy,n=Math.hypot(dx,dy)||1;
   g.bolts.push({x:ox-2+dx/n*8,y:oy-2+dy/n*8,w:4,h:4,vx:dx/n*sp,vy:dy/n*sp,friendly:false,alive:true,from:'king'});C().emit(g,'enemy-shot',{x:ox,y:oy,king:true});}
  s.kt++;
 }
 handBefore(g);
 courtBefore(g);
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
  if(s.duel){
   const answer=(g.bolts||[]).find(b=>b.alive&&b.friendly&&b.from==='king-verdict'&&b.seal===s.phase);
   if(answer){answer.alive=false;if(both){s.answered=true;Core.emit(g,'crown-answer',{x:p.x+4,y:p.y+5});}}
   if(both&&!s.verdict&&!s.answered){s.verdict={x:(s.marks.find(m=>overlap(p,{x:m.c*8-2,y:m.r*8,w:12,h:8}))?.c??Math.floor(p.x/8))*8+4,y:p.y-40,t:s.duel.tell||42};Core.emit(g,'crown-challenge',{x:p.x+4,y:p.y-40});}
  }
  s.t=both?s.t+1:0;if(s.t>=(s.hold||1)&&(!s.duel||s.answered)){
   const more=s.phases&&s.phase<s.phases.length;
   Core.emit(g,'crown-seal',{x:s.marks[1].c*8,y:s.marks[1].r*8,phase:s.phase,last:!more});
   if(more){s.marks=s.phases[s.phase];s.phase++;s.t=0;s.lit=[];s.verdict=null;s.answered=false;for(const b of g.bolts||[])if(b.from==='king-verdict')b.alive=false;Core.emit(g,'crown-turn',{x:s.marks[1].c*8,y:s.marks[1].r*8,phase:s.phase});}
   else {s.done=true;if(s.duel)for(const b of g.bolts||[])if(b.from==='king'||b.from==='king-verdict')b.alive=false;}
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
 courtAfter(g);
}

// ---------------------------------------------------------------- (7.308) the court
const CK=Object.freeze({first:40,answer:20,every:90,tell:24,speed:120,volley:1,gap:14,guard:44,slamTell:24,slamRest:24,stun:70,winded:0,parry:true,back:300,leap:48,land:36,w:20,h:30,fall:60});
const cv=(k,z)=>{const t=z.d.thrones[z.i]||{};return t[k]??z.d[k]??CK[k];};
function place(z,i){const t=z.d.thrones[i];z.i=i;z.x=t.c*8+4-CK.w/2;z.y=(t.r+1)*8-CK.h;}
function courtReset(g,d){
 const z={d,i:0,x:0,y:0,w:CK.w,h:CK.h,mode:'seat',timer:0,kt:0,wounds:0,need:d.hits||d.thrones.length,shots:0,aimAt:null,leapFrom:null};
 place(z,0);g.foes=g.foes||[];g.bolts=g.bolts||[];g.parryable=true;return z;
}
const centre=z=>({x:z.x+z.w/2,y:z.y+z.h/2});
const alive=p=>p.state!=='dead'&&p.state!=='respawn';
function inGuard(g,z){const p=g.p,c=centre(z);return alive(p)&&Math.hypot(p.x+4-c.x,p.y+5.5-c.y)<cv('guard',z);}
// Whom he throws at: the knight, or (aim:'echo') the echo while it stands.
function mark(g,z){const e=z.d.aim==='echo'&&g.echo;return e?{x:e.x+4,y:e.y+5.5,echo:true}:{x:g.p.x+4,y:g.p.y+5.5,echo:false};}
// Frames until his next throw (0 = this frame); the tell is drawn while it is under `tell`.
function courtDue(z){if(z.mode!=='seat')return Infinity;const first=z.first??cv('first',z),every=cv('every',z),n=cv('volley',z),gap=cv('gap',z);
 if(z.kt<first)return first-z.kt;const k=(z.kt-first)%every;for(let i=0;i<n;i++)if(k===i*gap)return 0;return every-k;}
function shoot(g,z){const Core=C(),c=centre(z),ox=c.x,oy=z.y+6,m=mark(g,z),sp=cv('speed',z),dx=m.x-ox,dy=m.y-oy,n=Math.hypot(dx,dy)||1;
 g.bolts.push({x:ox-2+dx/n*8,y:oy-2+dy/n*8,w:5,h:5,vx:dx/n*sp,vy:dy/n*sp,friendly:false,alive:true,from:'court'});Core.emit(g,'enemy-shot',{x:ox,y:oy,king:true,echo:m.echo});}
function courtBefore(g){const z=g.court;if(!z||z.mode==='gone'||!g.awake)return;const Core=C(),p=g.p;
 z.aimAt=null;
 if(z.mode==='seat'){
  if(inGuard(g,z)){rise(g,z);return;}
  const due=courtDue(z);if(due<=cv('tell',z)&&alive(p))z.aimAt=mark(g,z);
  if(due===0&&alive(p))shoot(g,z);
  z.kt++;return;
 }
 if(z.mode==='rise'){if(--z.timer>0)return;const c=centre(z),r=cv('guard',z),hit=inGuard(g,z);
  Core.emit(g,'court-slam',{x:c.x,y:c.y,r});if(hit)Core.kill(g,p,'king-slam');
  // A slam that finds no one winds him (opt-in per throne): the same opening as kneeling.
  if(!hit&&cv('winded',z)>0){z.mode='kneel';z.timer=cv('winded',z);z.winded=true;Core.emit(g,'court-winded',{x:c.x,y:c.y});return;}
  z.mode='rest';z.timer=cv('slamRest',z);return;}
 if(z.mode==='rest'){if(--z.timer<=0){z.mode='seat';z.first=z.kt+cv('answer',z);}return;}
 if(z.mode==='kneel'){if(--z.timer<=0){z.mode='seat';z.winded=false;z.first=z.kt+18;Core.emit(g,'court-rise',{x:centre(z).x,y:z.y});}return;}
 if(z.mode==='leap'){const L=z.leapFrom,t=++z.timer,n=cv('leap',z),u=Math.min(1,t/n),to=z.d.thrones[z.i],tx=to.c*8+4-CK.w/2,ty=(to.r+1)*8-CK.h;
  z.x=L.x+(tx-L.x)*u;z.y=L.y+(ty-L.y)*u-Math.sin(u*Math.PI)*Math.max(32,Math.abs(tx-L.x)*.25);
  if(u>=1){z.x=tx;z.y=ty;z.mode='seat';z.kt=0;z.first=cv('land',z);Core.emit(g,'court-land',{x:centre(z).x,y:z.y+z.h});}return;}
 if(z.mode==='fall'){z.y+=Math.min(4,1+z.timer/8);if(++z.timer>=CK.fall){z.mode='gone';Core.emit(g,'court-gone',{x:centre(z).x,y:z.y});}}
}
function rise(g,z){z.mode='rise';z.timer=cv('slamTell',z);z.winded=false;C().emit(g,'court-guard',{x:centre(z).x,y:centre(z).y});}
function shatterEcho(g){const e=g.echo;if(!e)return;const i=g.ents.indexOf(e);if(i>=0)g.ents.splice(i,1);g.echo=null;C().emit(g,'echo-break',{x:e.x+4,y:e.y+5});}
function courtAfter(g){const z=g.court;if(!z||z.mode==='gone'||z.mode==='fall'||!g.awake)return;const Core=C(),p=g.p;
 // His ring cannot be crossed: step over it, even while he kneels, and he springs up to slam. A trade does not cross.
 const inside=inGuard(g,z),traded=g.events.some(e=>e.type==='echo-swap'&&e.frame===g.frame);
 if(inside&&!z.inside&&!traded&&(z.mode==='kneel'||z.mode==='rest'))rise(g,z);
 z.inside=inside;
 const body={x:z.x,y:z.y,w:z.w,h:z.h},c=centre(z);
 // His own bolt, parried with no direction held, flies straight back at his face (an aimed parry goes where aimed).
 for(const b of g.bolts||[])if(b.alive&&b.friendly&&b.from==='court'&&!b.returned){b.returned=true;const a=p.parryAim;
  if(!a||!a.x&&!a.y){const sp=Math.max(Math.hypot(b.vx,b.vy),cv('back',z)),dx=c.x-(b.x+b.w/2),dy=z.y+8-(b.y+b.h/2),n=Math.hypot(dx,dy)||1;b.vx=dx/n*sp;b.vy=dy/n*sp;}}
 for(const b of g.bolts||[])if(b.alive&&b.friendly&&z.mode!=='leap'&&overlap(b,body)){b.alive=false;
  if(!cv('parry',z)){Core.emit(g,'guard-block',{x:b.x,y:b.y,ward:true});continue;}
  if(z.mode!=='kneel'){z.mode='kneel';z.timer=cv('stun',z);Core.emit(g,'court-kneel',{x:centre(z).x,y:centre(z).y});}}
 if(!alive(p)||!(p.strikeTimer>0)||z.mode==='leap'||p.strikeHit.has('court-king')||!Core.overlap(...Core.strikeBox(p),body.x,body.y,body.w,body.h))return;
 p.strikeHit.add('court-king');
 if(z.mode!=='kneel'){Core.emit(g,'guard-block',{x:centre(z).x,y:centre(z).y});return;}
 Core.bladeRebound(g,p,p.strikeDir);g.freeze=Math.max(g.freeze,4);z.wounds++;
 for(const b of g.bolts||[])if(b.from==='court')b.alive=false;
 shatterEcho(g);Core.emit(g,'court-wound',{x:centre(z).x,y:centre(z).y,wounds:z.wounds,need:z.need});
 if(z.wounds>=z.need||z.i+1>=z.d.thrones.length){z.mode='fall';z.timer=0;Core.emit(g,'court-fall',{x:centre(z).x,y:centre(z).y});return;}
 z.leapFrom={x:z.x,y:z.y};z.mode='leap';z.timer=0;z.first=undefined;z.i++;Core.emit(g,'court-leap',{x:centre(z).x,y:z.y,to:z.i});
}
function gateHold(g){return !!(g.crown&&!g.crown.done||g.alarm&&!g.alarm.done||g.hand&&!g.hand.gone||g.court&&g.court.mode!=='gone');}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rbr-king',reset,before,after,gateHold});
root.BladefallPrecisionKing=Object.freeze({KB,kingDue,handOpen,CK,courtDue,inGuard});
})(typeof window!=='undefined'?window:globalThis);
