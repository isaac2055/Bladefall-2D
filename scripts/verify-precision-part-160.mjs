// Part XVII · Landing Shores (levels 160–169, 7.254): routes and the wrong answers that fail.
//   node scripts/verify-precision-part-160.mjs          (ONLY=p163,p165 to run a few rooms)
//
// Tide rooms keep a closure on the game (the water module's g.spikeSafe), which structuredClone refuses, so the
// kit's hunt (pcore-search's beam) cannot snapshot them. This script carries a tide-safe copy of the beam: it
// drops spikeSafe for the clone and rebuilds it on the copy. A hunt's find is replayed from the start before
// it counts. Long waits for the tide are shared: a family's prefix is played once and every suffix starts from
// a copy of that state (the same run as playing the whole tape from the start, since the core is deterministic).
// Prefix waits are computed from each room's tide (hold H, move M: low until H, rising to H+M, high until 2H+M,
// falling to 2H+2M), so retiming a tide keeps each family asking what its label says.
import {kit,X,range} from './pcore-verify-kit.mjs';
import {Core,Rooms,expand,keysToInput} from './pcore-tape.mjs';
import {gameAt,compress} from './pcore-search.mjs';
const W=globalThis.BladefallPrecisionWater;
const K=kit('XVII');
const t0=Date.now();

// A probe (this script only). Sticky marks, checked by the hunts, so a search step cannot pass through a state
// and out of it unseen: a super or hyper (lifted or not), a lifted jump, a jump carrying a dash's speed off an
// edge, swimming, the chain, and riding (standing on or climbing) a float the sea has lifted.
(globalThis.BladefallPrecisionDevices||[]).push({name:'xvii-probe',after(g){
 const p=g.p;
 for(const e of g.events){
  if((e.type==='super'&&p.vy<-110)||(e.type==='hyper'&&p.vy<-60))g.liftSuper=true;
  if(e.type==='super'||e.type==='hyper')g.anySuper=true;
  if(e.type==='hyper')g.anyHyper=true;
  if(e.type==='jump'&&e.lift)g.liftJump=true;
  if(e.type==='jump'&&Math.abs(p.vx)>=150)g.speedJump=true;
 }
 if(p.swimming)g.swam=true;
 if(p.state==='hook')g.hooked=true;
 // A landing and a buffered jump can share one frame, so jumps and landings are read from their events too.
 const risen=g.ents.filter(e=>e.type==='float'&&e.y<e.homeY);
 if(risen.some(e=>Core.riderOf(g,e)))g.rodeRisen=true;
 for(const ev of g.events)if(/^(jump|super|hyper|land|climbjump|walljump)$/.test(ev.type)&&ev.y!==undefined)
  if(risen.some(e=>Math.abs(ev.y-e.y)<=2&&ev.x>=e.x-6&&ev.x<=e.x+e.w+6))g.rodeRisen=true;
 // A wall jump off a lifted float's side takes the float's lift too.
 for(const ev of g.events)if(ev.type==='walljump'||ev.type==='climbjump')
  if(risen.some(e=>(Math.abs(ev.x-e.x)<=6||Math.abs(ev.x-(e.x+e.w))<=6)&&ev.y>=e.y-8&&ev.y<=e.y+e.h+8))g.rodeRisen=true;
}});

/* ---------------------------------------------------------------- tide-safe search */
const SKIP=new Set(['defs','rooms','room','spikeSafe']);
function snap(g){const o={};for(const k in g)if(!SKIP.has(k))o[k]=g[k];const c=structuredClone(o);c.defs=g.defs;c.rooms=g.rooms;c.room=g.room;
 if(c.water&&c.water.tide){const t=c.water.tide;c.spikeSafe=(cc,r)=>cc>=t.c0&&cc<=t.c1&&r*8>=W.surfaceY(c);}else c.spikeSafe=g.spikeSafe||null;return c;}
function play(g,seg){const ev=[];let dead=false,exited=false;
 for(const k of expand(seg)){Core.step(g,keysToInput(k));for(const e of g.events){ev.push(e);if(e.type==='death')dead=true;if(e.type==='exit')exited=true;}g.events.length=0;if(dead||exited)break;}
 return {g,dead,exited,events:ev};}
const key=g=>{const p=g.p;return [p.x>>1,p.y>>1,Math.round(p.vx/30),Math.round(p.vy/30),p.state,p.dashes,p.onGround?1:0,Math.floor((g.water?.tide?.clock||0)/6),
 (g.foes||[]).map(f=>f.alive?1:0).join(''),(g.jailers||[]).map(j=>j.alive?j.dir:0).join(''),p.hook?Math.round(p.hook.len/4):'-'].join('|');};
function beam(id,{actions,goal=g=>g.exited,score,beam:B=300,maxDepth=40,start=[],reject=null}){
 const g0=gameAt(id,start);let frontier=[{s:snap(g0),tape:[]}];const seen=new Set([key(g0)]);
 for(let depth=0;depth<maxDepth&&frontier.length;depth++){
  let next=[];
  for(const n of frontier)for(const a of actions){
   const g=snap(n.s);const r=play(g,a);if(r.dead)continue;
   const tape=[...n.tape,...a];
   if(reject&&reject(g,r.events))continue;
   if(goal(g,r.events,r))return {tape:compress([...start,...tape])};
   if(r.exited)continue;
   const k=key(g);if(seen.has(k))continue;seen.add(k);next.push({s:snap(g),tape,sc:score(g)});
  }
  next.sort((a,b)=>a.sc-b.sc);if(next.length>B)next=next.slice(0,B);frontier=next;
 }
 return null;
}
/* A find counts only if it replays from the start to the exit with no death and never trips the reject. */
function hunt(label,id,opts){
 const r=beam(id,opts);let real=false;
 if(r){const g=gameAt(id);const rr=play(g,r.tape);real=rr.exited&&!rr.dead&&!(opts.reject&&opts.reject(g,rr.events));}
 K.say(!real,`${id}: ${label} (adversarial beam search${real?' FOUND '+JSON.stringify(r.tape):' found none'})`);return real;
}
/* A family from a shared prefix: none of the suffixes satisfies pred (default: exits with no death on the way). */
function neverFrom(label,id,prefixes,suffixes,pred=r=>r.exited&&!r.dead){
 let n=0,tried=0,first=null;
 for(const pre of prefixes){const s0=snap(gameAt(id,pre));for(const sf of suffixes){tried++;const g=snap(s0);const r=play(g,sf);if(pred(r,g)){n++;first=first||[...pre,...sf];}}}
 K.say(n===0,`${id}: ${label} (${tried} tried, ${n} succeed${first?' e.g. '+JSON.stringify(compress(first)):''})`);return n;
}
const tideOf=id=>Rooms.all.find(d=>d.id===id).tide;
const to=(x,y)=>g=>Math.hypot(g.p.x-x,g.p.y-y);
const air=['','r','l'].flatMap(d=>[[[12,d+'j']],[[4,d+'j']]]);
const dashes=['r','u','ru','rd','l','lu'].map(d=>[[5,d+'x']]);
const walk=[[[6,'r']],[[6,'l']],[[6,'']],[[3,'r']],[[3,'l']]];
const wait=[[[20,'']],[[20,'r']],[[20,'u']]];
const BASIC=[...walk,...air,...dashes];
const grabs=[[[6,'rg']],[[12,'rg']],[[6,'g']],[[6,'lg']],[[12,'lg']],[[6,'rug']],[[20,'rgu']],[[20,'lgu']]];
// Jump-and-dash shapes from where you stand: hold the jump k frames, drift w more, dash one of four ways, drift.
const JD=X([4,8,12,16,20],[0,8,16,24,32],['rx','rux','ux','rdx']).map(([k,w,d])=>[[k,'rj'],[w,'r'],[5,d],[40,'r'],[60,'r']]);
// Supers, early (the dash is spent) and late (the ground has given it back), with or without a second dash.
const SUPERS=X([2,5,8,9,10,11],[6,12,20],[null,'rx','rux'],[0,8,16,24]).filter(([k,j,d,w])=>d||!w)
 .map(([k,j,d,w])=>[[1,'rx'],[k,'r'],[j,'rj'],...(d?[[w,'r'],[5,d]]:[]),[100,'r']]);
const HYPERS=X([0,4,8],[6,12,20],[null,'rx','rux'],[0,8,16,24]).filter(([k,j,d,w])=>d||!w)
 .map(([k,j,d,w])=>[[1,'rdx'],[k,'rd'],[j,'rj'],...(d?[[w,'r'],[5,d]]:[]),[100,'r']]);

const ONLY=(process.env.ONLY||'').split(',').filter(Boolean),on=id=>!ONLY.length||ONLY.includes(id);
if(!ONLY.length)K.routes();
console.log('Part XVII: tempting wrong strategies fail');

if(on('p160')){
/* 160 Slack Water — the reef hangs down to two tiles above the thorn bed. Before the sea comes, the only way
   under it is to fly the whole passage a hand's breadth over bare thorns. */
const {hold:H,move:M}=tideOf('p160');
neverFrom('Slack Water: dive under the reef before the sea comes',
 'p160',range(0,H,10).map(w=>[[26,'r'],[w,'']]),
 [...X([2,6,10,14,18,24],['rx','rdx','rux'],['r','rd']).map(([k,d,h])=>[[k,'r'],[5,d],[120,h]]),
  ...X([4,12],[0,8,14,20,26],['rx','rdx']).map(([k,w,d])=>[[k,'rj'],[w,'r'],[5,d],[120,'r']])]);
hunt('Slack Water: no way under the reef but through the sea','p160',{actions:[...BASIC,...wait,...grabs],
 reject:g=>g.swam,score:to(312,110),beam:250,maxDepth:30});
}

if(on('p161')){
/* 161 Wreck Lift — the pier from the sand, from the hull at rest, and from the high sea. */
const {hold:H,move:M}=tideOf('p161');
const board=[[32,'r'],[10,'rj'],[40,'r']];            // onto the hull and along to its seaward end
const low2=2*H+2*M;                                     // the sea is out again and the hull rests
neverFrom('Wreck Lift: jump and dash for the pier from the hull at rest',
 'p161',range(low2+12,low2+H-12,8).map(w=>[...board,[w-82,'']]),JD);
neverFrom('Wreck Lift: jump and dash for the pier from the sand',
 'p161',range(0,30,6).map(w=>[[w,'r']]),JD);
neverFrom('Wreck Lift: stroke and dash up the pier from the high sea',
 'p161',[[[20,'r'],[10,'rj'],[H+M-30,'r']],[[20,'r'],[10,'rj'],[H+M-10,'r']]].map(p=>[...p,[30,'r'],[40,'d']]),
 X([0,10,20],[6,10,14],['ux','rux','lux'],[4,8,14]).map(([w,k,d,h])=>[[w,'l'],[k,'j'],[5,d],[h,'u'],[60,'r']]));
hunt('Wreck Lift: nothing but the lifted hull reaches the pier','p161',{actions:[...BASIC,...wait,...grabs],
 reject:g=>g.rodeRisen,score:to(300,20),beam:250,maxDepth:36});
}

if(on('p162')){
/* 162 Spring Tide — jumps and dashes from the float at rest (high or low), and any jump that is not lifted. */
const {hold:H,move:M}=tideOf('p162');
neverFrom('Spring Tide: jump and up-dash from the float at rest, high water or low',
 'p162',[...range(0,H-12,6),...range(H+M+12,2*H+M-4,6),...range(2*H+2*M+12,3*H+2*M-4,8)].map(w=>[[1,'u'],[w,'']]),
 X([8,10,12,14,16],[0,2,4,6],['ux','rux'],[6,10]).map(([k,d,dd,u])=>[[k,'j'],[d,''],[5,dd],[u,'u'],[140,'r']]));
hunt('Spring Tide: every way up without a lifted jump','p162',{actions:[...BASIC,...wait,...grabs],
 reject:g=>g.liftJump||g.liftSuper,score:to(300,10),beam:250,maxDepth:34});
}

if(on('p163')){
/* 163 Launch — from the float at high water: jump and dash, early supers and hypers without the dash. */
const {hold:H,move:M}=tideOf('p163');
const high=range(H+M+4,2*H+M-30,12).flatMap(w=>[0,12,24].map(r=>[[1,'l'],[4,'l'],[w,''],[r,'r']]));
neverFrom('Launch: jump and dash from anywhere on the float at high water','p163',high,JD);
neverFrom('Launch: an early super, the dash spent on the ground','p163',high,SUPERS.filter(t=>t[1][0]<8&&t.length<=4));
hunt('Launch: over the drop without a dash\'s speed in the jump (super, hyper, or off the edge mid-dash)','p163',{actions:[...BASIC,...wait,...grabs],start:[[1,'l'],[4,'l'],[H+M-10,'']],
 reject:g=>g.anySuper||g.speedJump,score:to(300,70),beam:220,maxDepth:30});
}

if(on('p164')){
/* 164 Tern — stroke, dash and climb at the pier without the moth. */
const {hold:H,move:M}=tideOf('p164');
neverFrom('Tern: stroke and dash up the pier face from the water',
 'p164',range(100,160,15).map(s=>[[1,'u'],[H+M,''],[s,'ru']]),
 X([6,10,14],['ux','rux'],[0,6,12]).map(([k,d,h])=>[[k,'j'],[5,d],[h,'u'],[60,'r']]));
hunt('Tern: up the pier without the moth','p164',{actions:[...BASIC,...wait,...grabs,[[1,'ds']]],
 reject:(g,ev)=>ev.some(e=>e.type==='enemy-defeat'),score:to(300,20),beam:250,maxDepth:36});
}

if(on('p165')){
/* 165 Buoy — the buoy is three tiles wide: too short for a ground dash to give the dash back before its edge.
   From the ledge, or standing on the buoy, nothing reaches the far pier; land on it out of a down-diagonal dash
   (a wavedash) and the dash comes back at once, and the jump out of the slide is a hyper. */
const {hold:H,move:M}=tideOf('p165');
const onBuoy=[-4,0,4,8].map(r=>[[1,'r'],[H+M,''],[30,'r'],[14,'rj'],[20,'r'],[20,''],r<0?[-r,'l']:[r,'r']]);
neverFrom('Buoy: stand on the buoy, then super, hyper or jump and dash','p165',onBuoy,[...SUPERS,...HYPERS,...JD]);
// Straight from the ledge to the pier (a flight that touches the buoy on the way is the buoy's question, above).
neverFrom('Buoy: super, hyper or jump and dash from the ledge to the pier','p165',range(8,40,8).map(r=>[[1,'r'],[H+M,''],[r,'r']]),[...SUPERS,...HYPERS,...JD],
 (r,g)=>r.exited&&!r.dead&&!g.rodeRisen);
hunt('Buoy: over the sea without a hyper','p165',{actions:[...BASIC,...wait,...grabs],start:[[1,'r'],[H+M-10,'']],
 reject:g=>g.anyHyper,score:to(300,70),beam:220,maxDepth:30});
}

if(on('p166')){
/* 166 Mooring Ring — supers, hypers and jump-and-dash from the hull at every height it passes; and the swing
   taken from the hull once it has stopped: a plain jump never gets above the ring, so the chain catches you
   with nothing to swing on. */
const {hold:H,move:M}=tideOf('p166');
const pre=range(0,2*H+2*M,32).map(w=>[[1,'l'],[w,'']]);
neverFrom('Mooring Ring: super, hyper and jump-and-dash from the hull','p166',pre,[...SUPERS,...HYPERS,...JD]);
const SWING=X([8,14],[20,30,40,50,60,70,80],['r','rj'],[0,10,20],['rx','rux',null]).map(([k,n,rel,w,d])=>[[k,'rj'],[n,'rg'],[rel==='rj'?10:1,rel],[w,'r'],...(d?[[5,d]]:[]),[80,'r']]);
neverFrom('Mooring Ring: jump for the ring from the hull at rest, high water or low','p166',
 [...range(4,H-24,12),...range(H+M+12,2*H+M-24,12)].flatMap(w=>[[[1,'l'],[w,''],[4,'r']],[[1,'l'],[w,''],[14,'r']]]),SWING);
hunt('Mooring Ring: across without the chain','p166',{actions:[...BASIC,...wait,...grabs],start:[[1,'l'],[H,'']],
 reject:g=>g.hooked,score:to(300,25),beam:220,maxDepth:30});
}

if(on('p167')){
/* 167 Spring Super — a super from the float at rest, and a lifted jump and dash. */
const {hold:H,move:M}=tideOf('p167');
// At rest: the whole super, run-up included, starts and ends its ground dash before the rise or after the stop.
const rest=[0,12,24].flatMap(r=>[...range(0,H-r-16,10),...range(H+M+12,2*H+M-r-16,14)].map(w=>[[1,'l'],[w,''],[r,'r']]));
const rising=range(H,H+M+6,3).flatMap(w=>[0,12,24].map(r=>[[1,'l'],[w-(r?r:0),''],[r,'r']]));
neverFrom('Spring Super: supers and hypers from the float at rest, high water or low','p167',rest,[...SUPERS,...HYPERS]);
neverFrom('Spring Super: a lifted jump and dash','p167',rising,JD);
hunt('Spring Super: across without a lifted super','p167',{actions:[...BASIC,...wait,...grabs],start:[[1,'l']],
 reject:g=>g.liftSuper,score:to(300,20),beam:220,maxDepth:34});
}

if(on('p168')){
/* 168 Belled — he stands at the very edge of the pier, shield to the sea: there is nowhere to land in front of
   him, and from the float at rest nothing gets over his helm. Every approach but a lifted leap, then a cut. */
const {hold:H,move:M}=tideOf('p168');
const rest=[0,12,24].flatMap(r=>[...range(0,H-r-16,10),...range(H+M+12,2*H+M-r-16,14)].map(w=>[[1,'l'],[w,''],[r,'r']]));
const cut=[[14,'r'],[20,'l'],[1,'ls'],[4,''],[1,'p'],[100,'r']];
neverFrom('Belled: supers, hypers and jumps and dashes from the float at rest, then a cut','p168',rest,[...SUPERS,...HYPERS,...JD].map(t=>[...t.slice(0,-1),...cut]));
neverFrom('Belled: a lifted jump and dash (no super), then a cut','p168',range(H,H+M+6,3).flatMap(w=>[0,12,24].map(r=>[[1,'l'],[Math.max(0,w-r),''],[r,'r']])),JD.map(t=>[...t.slice(0,-1),...cut]));
hunt('Belled: the gate without a lifted leap','p168',{actions:[...BASIC,...wait,...grabs,[[1,'ls']],[[1,'rs']],[[1,'p']],[[1,'ds']]],start:[[1,'l']],
 reject:g=>g.liftSuper||g.liftJump,score:g=>(g.jailers[0].alive?200:0)+to(300,20)(g),beam:220,maxDepth:34});
}

if(on('p169')){
/* 169 Landfall — each beat is needed: the lifted super (the moth is out of any other reach), the moth (the ring
   is out of reach of anything that has spent its dash), the ring (the headland is past anything the moth gives). */
hunt('Landfall: ashore without the moth','p169',{actions:[...BASIC,...wait,...grabs,[[1,'ds']]],start:[[1,'l']],
 reject:(g,ev)=>ev.some(e=>e.type==='enemy-defeat'),score:to(320,30),beam:220,maxDepth:34});
hunt('Landfall: ashore without the ring','p169',{actions:[...BASIC,...wait,[[1,'ds']],[[4,'rj']]],start:[[1,'l']],
 reject:g=>g.hooked,score:to(320,30),beam:220,maxDepth:34});
hunt('Landfall: ashore without a lifted super','p169',{actions:[...BASIC,...wait,...grabs,[[1,'ds']]],start:[[1,'l']],
 reject:g=>g.liftSuper,score:to(320,30),beam:220,maxDepth:34});
const {hold:H,move:M}=tideOf('p169');
neverFrom('Landfall: supers and hypers from the float at rest, then the moth and the ring','p169',
 [0,8,16].flatMap(r=>[...range(0,H-r-16,6),...range(H+M+12,2*H+M-r-16,8)].map(w=>[[1,'l'],[w,''],[r,'r']])),
 [...SUPERS,...HYPERS].map(t=>[...t.slice(0,-1),[20,'r'],[1,'ds'],[16,'rg'],[1,'rx'],[8,'r'],[14,'rj'],[16,'rgu'],[70,'r']]));
}

console.log(`(${((Date.now()-t0)/1000).toFixed(0)} s)`);
K.done();
