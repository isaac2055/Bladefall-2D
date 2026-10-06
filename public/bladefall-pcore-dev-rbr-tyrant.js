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
                  the knight's like any other. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore,P=()=>root.BladefallPrecisionPortals;
const hit=(a,b)=>C().overlap(a.x,a.y,a.w,a.h,b.x,b.y,b.w,b.h);
function reset(g){
 const d=g.room.def.tyrant;g.tyrant=null;if(!d)return;
 g.tyrant={d,x:264,y:24,w:16,h:112,t:0,hits:0,need:d.hits||1,shots:[],retreat:0,gone:false,lane:d.shotRow,band:d.weakRow};g.parryable=true;
 walk(g.tyrant);
 for(const e of g.ents)if(e.type==='gate')e.devKeyed=true;
}
// The lane and band for the next return (default: the fixed shotRow/weakRow).
function walk(z){const d=z.d,k=z.hits;if(d.lanes&&d.lanes.length)z.lane=d.lanes[Math.min(k,d.lanes.length-1)];if(d.bands&&d.bands.length)z.band=d.bands[Math.min(k,d.bands.length-1)];}
const RAKE=Object.freeze({every:150,first:110,speed:95,tell:24,ox:-8,oy:84});   // thrown from his low hand
function rakeDue(z){const r=z.d.rake;if(!r)return Infinity;const every=r.every||RAKE.every,first=r.first??RAKE.first;return z.t<first?first-z.t:(every-(z.t-first)%every)%every;}
function after(g){
 const z=g.tyrant;if(!z||!g.awake||z.gone)return;
 const Core=C(),p=g.p;
 if(z.retreat){if(++z.retreat>48){z.gone=true;Core.emit(g,'tyrant-withdraw',{x:z.x+8,y:z.y,final:!!z.d.final});}return;}
 const every=z.d.every||140,first=z.d.first??80;z.t++;
 if(z.t>=first&&(z.t-first)%every===0){z.shots.push({x:z.x-7,y:z.lane*8,w:4,h:4,vx:-120,vy:0,through:false,cool:0});Core.emit(g,'enemy-shot',{x:z.x,y:z.lane*8});}
 if(z.d.rake&&rakeDue(z)===0&&p.state!=='dead'&&p.state!=='respawn'){
  const sp=z.d.rake.speed||RAKE.speed,ox=z.x+RAKE.ox,oy=z.y+RAKE.oy,dx=p.x+4-ox,dy=p.y+5.5-oy,n=Math.hypot(dx,dy)||1;
  z.shots.push({x:ox-2+dx/n*10,y:oy-2+dy/n*10,w:4,h:4,vx:dx/n*sp,vy:dy/n*sp,through:false,cool:0,rake:true});Core.emit(g,'enemy-shot',{x:ox,y:oy,rake:true});
 }
 // A walking fight lights a wider band (20 px): put the exit portal level with it and the return lands.
 const walking=!!(z.d.lanes||z.d.bands),weak=walking?{x:z.x-2,y:z.band*8-8,w:z.w+4,h:20}:{x:z.x-2,y:z.band*8-4,w:z.w+4,h:12};
 for(const b of z.shots){
  if(b.gone)continue;if(b.cool>0)b.cool--;
  const steps=Math.ceil(Math.max(Math.abs(b.vx),Math.abs(b.vy))*Core.DT);
  for(let k=0;k<steps&&!b.gone;k++){
   b.x+=b.vx*Core.DT/steps;b.y+=b.vy*Core.DT/steps;
   const entry=!b.cool&&P().entered(g,b.x,b.y,b.w,b.h);
   if(entry){const to=P().other(g,entry),pos=P().exitPos(entry,to,b.x,b.y,b.w,b.h),v=P().turn(b.vx,b.vy,entry.face,to.face);
    Object.assign(b,pos,{vx:v[0],vy:v[1],through:true,cool:10});Core.emit(g,'portal-pass',{x:b.x,y:b.y,kind:'tyrant-bolt',from:entry.color});}
   if(b.through&&hit(b,weak)){b.gone=true;z.hits++;Core.emit(g,'tyrant-hit',{x:z.x+8,y:weak.y+6,hits:z.hits});if(z.hits>=z.need){z.retreat=1;z.shots=[];}
    else if(z.d.lanes||z.d.bands){const was=[z.lane,z.band];walk(z);if(was[0]!==z.lane||was[1]!==z.band){
     // The ward flares as it walks: every bolt still in the air is spent (his and yours), so each return
     // after a walk is made on the new lane.
     for(const q of z.shots)if(q!==b)q.gone=true;Core.emit(g,'tyrant-walk',{x:z.x+8,y:z.lane*8,lane:z.lane,band:z.band});}}break;}
   if(Core.solidAt(g,Math.round(b.x),Math.round(b.y),b.w,b.h)||b.x<-8||b.x>328||b.y<-8||b.y>192){b.gone=true;break;}
   if(p.state==='dead'||p.state==='respawn')continue;
   if(p.parryTimer>0&&hit(b,{x:p.x-5,y:p.y-5,w:p.w+10,h:p.h+10})){
    b.vx=Math.abs(b.vx)*(b.x>=p.x?1:-1);b.vy=-b.vy;Core.parrySuccess(g,p);Core.emit(g,'parry',{x:b.x,y:b.y});
   }else if(p.strikeTimer>0&&Core.overlap(...Core.strikeBox(p),b.x,b.y,b.w,b.h)){b.gone=true;Core.emit(g,'enemy-hit',{x:b.x,y:b.y});}
   else if(hit(b,p)){Core.kill(g,p,'tyrant-bolt');b.gone=true;}
  }
 }
 z.shots=z.shots.filter(b=>!b.gone);
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rbr-tyrant',reset,after,gateHold:g=>!!g.tyrant&&!g.tyrant.gone});
root.BladefallPrecisionTyrant=Object.freeze({RAKE,rakeDue});
})(typeof window!=='undefined'?window:globalThis);
