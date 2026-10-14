/* Room by Room · Void Tyrant. The three bands are portal alignment puzzles.
   tyrant:{shotRow,weakRow,hits,every,first,final}: the crown fires horizontally left;
   only a bolt carried through a portal and returned to the lit band breaks the ward.
   A parry returns a bolt, a blade destroys it, and neither alone breaks the ward.
   The shot line is fixed and telegraphed. No contact damage, no stat damage race.
   Gates open after the ward folds; the final crown rises away, as in the campaign.
   (7.280, opt-in; a room without these fields fights exactly as before)
   lanes:[row,…]  the firing lane for each return still to come: after the first return the crown fires from
                  lanes[1], and so on (lanes[0] replaces shotRow). The lane he will fire on is marked on his
                  mantle all fight, and the dotted line shows before every bolt. Re-aim your entry portal.
   bands:[row,…]  the same for the lit band (bands[0] replaces weakRow): the ward walks after each return.
   rake:{every,first,speed}  a second pattern: his eyes and low hand flare for 24 frames, then a bolt flies
                  from the hand at where the knight is (a ledger in the way stops it). Cut it, parry it or step aside; a rake bolt carried through a portal is
                  the knight's like any other.
   (7.308, opt-in; without these fields he fights exactly as above)
   hunt:{every,first,speed,tell}  he never fires down a fixed lane: his mask burns for `tell` frames with a line drawn
                  to the knight, then a bolt flies from his mask at where the knight is. No fixed shotRow volley.
   home:true      a bolt of his that comes out of a portal flies home to him (straight at his body, through stone), and
                  any part of his body is the ward. So: put your door on his side of the stone, then get behind it.
   perches:[{c,r,…},…]  where he stands for each hit still to come (perches[0] replaces c,r), each with optional
                  hunt overrides (every, speed, tell, volley, gap): after a hit he folds
                  into the void and unfolds at the next perch (`fold` frames, default 36), and fires again `land`
                  frames later (default 40). */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore,P=()=>root.BladefallPrecisionPortals;
const hit=(a,b)=>C().overlap(a.x,a.y,a.w,a.h,b.x,b.y,b.w,b.h);
// Optional c/r/height use tiles; shot and weak rows remain absolute room rows.
function reset(g){
 const d=g.room.def.tyrant;g.tyrant=null;if(!d)return;
 const p0=d.perches?.[0];
 g.tyrant={d,x:(p0?.c??d.c??33)*8,y:(p0?.r??d.r??3)*8,w:16,h:(d.height??14)*8,t:0,hits:0,need:d.hits||1,shots:[],retreat:0,gone:false,lane:d.shotRow,band:d.weakRow,fold:0,kt:0,first:null,aimAt:null};g.parryable=true;
 walk(g.tyrant);
 for(const e of g.ents)if(e.type==='gate')e.devKeyed=true;
}
// The lane and band for the next return (default: the fixed shotRow/weakRow).
function walk(z){const d=z.d,k=z.hits;if(d.lanes&&d.lanes.length)z.lane=d.lanes[Math.min(k,d.lanes.length-1)];if(d.bands&&d.bands.length)z.band=d.bands[Math.min(k,d.bands.length-1)];}
const RAKE=Object.freeze({every:150,first:110,speed:95,tell:24,ox:-8,oy:84});   // thrown from his low hand
function rakeDue(z){const r=z.d.rake;if(!r)return Infinity;const every=r.every||RAKE.every,first=r.first??RAKE.first;return z.t<first?first-z.t:(every-(z.t-first)%every)%every;}
const HUNT=Object.freeze({every:80,first:50,speed:130,tell:24,fold:36,land:40,home:600,volley:1,gap:12});
// Each perch may override any hunt timing (e.g. volley:2 on the last).
const hv=(z,k)=>z.d.perches?.[Math.min(z.hits,z.d.perches.length-1)]?.[k]??z.d.hunt?.[k]??HUNT[k];
// Frames until his next hunting bolt (0 = this frame); a volley throws `volley` bolts `gap` frames apart.
function huntDue(z){if(!z.d.hunt||z.fold)return Infinity;const first=z.first??hv(z,'first'),every=hv(z,'every'),n=hv(z,'volley'),gap=hv(z,'gap');
 if(z.kt<first)return first-z.kt;const k=(z.kt-first)%every;for(let i=0;i<n;i++)if(k===i*gap)return 0;for(let i=1;i<n;i++)if(k<i*gap)return i*gap-k;return every-k;}
const mask=z=>({x:z.x+8,y:z.y+10});
function advance(g){
 const z=g.tyrant;if(!z||!g.awake||z.gone)return;
 const Core=C(),m=mask(z),p=g.players?.filter(p=>p.state!=='dead'&&p.state!=='respawn').sort((a,b)=>Math.hypot(a.x+4-m.x,a.y+5.5-m.y)-Math.hypot(b.x+4-m.x,b.y+5.5-m.y))[0]||g.p;
 if(z.retreat){if(++z.retreat>48){z.gone=true;Core.emit(g,'tyrant-withdraw',{x:z.x+8,y:z.y,final:!!z.d.final});}return;}
 if(z.fold){// folded into the void between perches: nothing fires, nothing lands on him
  if(++z.fold===Math.floor(hv(z,'fold')/2)){const q=z.d.perches[Math.min(z.hits,z.d.perches.length-1)];z.x=q.c*8;z.y=q.r*8;Core.emit(g,'tyrant-unfold',{x:z.x+8,y:z.y+z.h/2});}
  if(z.fold>=hv(z,'fold')){z.fold=0;z.kt=0;z.first=hv(z,'land');}
  stepShots(g,z);return;}
 z.aimAt=null;
 if(z.d.hunt){const due=huntDue(z),alive=p.state!=='dead'&&p.state!=='respawn';
  if(due<=hv(z,'tell')&&alive)z.aimAt={x:p.x+4,y:p.y+5.5};
  if(due===0&&alive){const m=mask(z),sp=hv(z,'speed'),dx=p.x+4-m.x,dy=p.y+5.5-m.y,n=Math.hypot(dx,dy)||1;
   z.shots.push({x:m.x-2+dx/n*10,y:m.y-2+dy/n*10,w:5,h:5,vx:dx/n*sp,vy:dy/n*sp,through:false,cool:0,hunt:true});Core.emit(g,'enemy-shot',{x:m.x,y:m.y,hunt:true});}
  z.kt++;stepShots(g,z);return;}
 const every=z.d.every||140,first=z.d.first??80;z.t++;
 if(z.t>=first&&(z.t-first)%every===0){z.shots.push({x:z.x-7,y:z.lane*8,w:4,h:4,vx:-120,vy:0,through:false,cool:0});Core.emit(g,'enemy-shot',{x:z.x,y:z.lane*8});}
 if(z.d.rake&&rakeDue(z)===0&&p.state!=='dead'&&p.state!=='respawn'){
  const sp=z.d.rake.speed||RAKE.speed,ox=z.x+RAKE.ox,oy=z.y+RAKE.oy,dx=p.x+4-ox,dy=p.y+5.5-oy,n=Math.hypot(dx,dy)||1;
  z.shots.push({x:ox-2+dx/n*10,y:oy-2+dy/n*10,w:4,h:4,vx:dx/n*sp,vy:dy/n*sp,through:false,cool:0,rake:true});Core.emit(g,'enemy-shot',{x:ox,y:oy,rake:true});
 }
 stepShots(g,z);
}
function stepShots(g,z){const Core=C();
 // A walking fight lights a wider band (20 px): put the exit portal level with it and the return lands.
 const walking=!!(z.d.lanes||z.d.bands),weak=z.d.home?{x:z.x-2,y:z.y,w:z.w+4,h:z.h}:walking?{x:z.x-2,y:z.band*8-8,w:z.w+4,h:20}:{x:z.x-2,y:z.band*8-4,w:z.w+4,h:12};
 for(const b of z.shots){
  if(b.gone)continue;if(b.cool>0)b.cool--;
  const steps=Math.ceil(Math.max(Math.abs(b.vx),Math.abs(b.vy))*Core.DT);
  for(let k=0;k<steps&&!b.gone;k++){
   b.x+=b.vx*Core.DT/steps;b.y+=b.vy*Core.DT/steps;
   const entry=!b.cool&&P().entered(g,b.x,b.y,b.w,b.h);
   if(entry){const to=P().other(g,entry),pos=P().exitPos(entry,to,b.x,b.y,b.w,b.h),v=P().turn(b.vx,b.vy,entry.face,to.face);
    Object.assign(b,pos,{vx:v[0],vy:v[1],through:true,cool:10});Core.emit(g,'portal-pass',{x:b.x,y:b.y,kind:'tyrant-bolt',from:entry.color});
    // (7.308) home:true — out of the door it turns and flies home to him, through stone.
    if(z.d.home&&!z.fold){b.home=true;const sp=Math.max(Math.hypot(b.vx,b.vy),HUNT.home),dx=z.x+8-(b.x+b.w/2),dy=z.y+z.h/2-(b.y+b.h/2),n=Math.hypot(dx,dy)||1;b.vx=dx/n*sp;b.vy=dy/n*sp;}}
   if(b.home&&!z.fold){const sp=Math.hypot(b.vx,b.vy),dx=z.x+8-(b.x+b.w/2),dy=z.y+z.h/2-(b.y+b.h/2),n=Math.hypot(dx,dy)||1;b.vx=dx/n*sp;b.vy=dy/n*sp;}
   if(b.through&&!z.fold&&hit(b,weak)){b.gone=true;z.hits++;Core.emit(g,'tyrant-hit',{x:z.x+8,y:b.y,hits:z.hits});if(z.hits>=z.need){z.retreat=1;z.shots=[];}
    else if(z.d.perches){z.fold=1;for(const q of z.shots)q.gone=true;Core.emit(g,'tyrant-fold',{x:z.x+8,y:z.y+z.h/2});}
    else if(z.d.lanes||z.d.bands){const was=[z.lane,z.band];walk(z);if(was[0]!==z.lane||was[1]!==z.band){
     // The ward flares as it walks: every bolt still in the air is spent (his and yours), so each return
     // after a walk is made on the new lane.
     for(const q of z.shots)if(q!==b)q.gone=true;Core.emit(g,'tyrant-walk',{x:z.x+8,y:z.lane*8,lane:z.lane,band:z.band});}}break;}
   if(!b.home&&Core.solidAt(g,Math.round(b.x),Math.round(b.y),b.w,b.h)||b.x<-8||b.x>g.room.w+8||b.y<-8||b.y>g.room.h+8){b.gone=true;if(!b.home)Core.emit(g,'enemy-hit',{x:b.x,y:b.y});break;}
   if(!b.home)answerShot(g,b);
  }
 }
 z.shots=z.shots.filter(b=>!b.gone);
}
function answerShot(g,b){
 const Core=C(),actor=g.coopActor,players=(g.players||[g.p]).filter(p=>p.state!=='dead'&&p.state!=='respawn');
 const bind=p=>{if(g.players)g.coopActor=g.players.indexOf(p);};
 try{
  // Both knights get a chance to defend before either receives contact damage.
  for(const p of players){bind(p);
   if(p.parryTimer>0&&hit(b,{x:p.x-5,y:p.y-5,w:p.w+10,h:p.h+10})){
    b.vx=Math.abs(b.vx)*(b.x>=p.x?1:-1);b.vy=-b.vy;Core.parrySuccess(g,p);Core.emit(g,'parry',{x:b.x,y:b.y});return;
   }
   if(p.strikeTimer>0&&Core.overlap(...Core.strikeBox(p),b.x,b.y,b.w,b.h)){b.gone=true;Core.emit(g,'enemy-hit',{x:b.x,y:b.y});return;}
  }
  for(const p of players)if(hit(b,p)){bind(p);Core.kill(g,p,'tyrant-bolt');b.gone=true;return;}
 }finally{g.coopActor=actor;}
}
function after(g){if(!g.players)advance(g);}
function afterPlayers(g){advance(g);}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rbr-tyrant',reset,after,afterPlayers,gateHold:g=>!!g.tyrant&&!g.tyrant.gone});
root.BladefallPrecisionTyrant=Object.freeze({RAKE,rakeDue,HUNT,huntDue});
})(typeof window!=='undefined'?window:globalThis);
