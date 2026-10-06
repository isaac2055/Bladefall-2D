// Part XVI · Thunder Cliffs (levels 150–159, 7.254): routes and the wrong answers that fail.
//   node scripts/verify-precision-part-150.mjs            everything
//   ONLY=p153,p157 node scripts/verify-precision-part-150.mjs   some rooms (routes skipped)
import {kit,X,range} from './pcore-verify-kit.mjs';
import {Core} from './pcore-tape.mjs';
import {ACT} from './pcore-search.mjs';
const K=kit('XVI');
const t0=Date.now();

// A probe (this script only). leftFast: the knight left a deck that was moving at more than a pixel a frame
// (a jump off it takes the deck's speed). rings: which rings the chain has caught this life.
(globalThis.BladefallPrecisionDevices||[]).push({name:'xvi-probe',
 reset(g){g.leftFast=false;g.rings=new Set();g.ridePrev=null;},
 after(g){
  const p=g.p;
  if(p.state==='hook'&&p.hook)g.rings.add(p.hook.ring.id);
  const deck=g.ents.find(e=>e.type==='deck'&&Core.riderOf(g,e));
  if(g.ridePrev&&!deck){const d=g.ridePrev.e,v=Math.hypot(d.x-g.ridePrev.x,d.y-g.ridePrev.y);if(v>=1)g.leftFast=true;}
  g.ridePrev=deck?{e:deck,x:deck.x,y:deck.y}:null;
 }});

const ONLY=(process.env.ONLY||'').split(',').filter(Boolean),on=id=>!ONLY.length||ONLY.includes(id);
if(!ONLY.length)K.routes();
console.log('Part XVI: tempting wrong strategies fail');
const to=(x,y)=>g=>Math.hypot(g.p.x-x,g.p.y-y);
// Hook moves for the searches: hold grab while moving, haul in, pay out, jump or let go.
const HOOK=[[[8,'rg']],[[8,'lg']],[[8,'g']],[[16,'ug']],[[16,'dg']],[[1,'jg']],[[1,'rjg']],[[4,'rjg']]];
// Jump-and-dash shapes from wherever the prefix leaves the knight.
const JD=X([4,8,12,14],['rx','rux','ux','lux'],[0,4]).map(([k,d,w])=>[[k,'rj'],[w,'r'],[5,d],[40,'rg'],[100,'r']]);
const SUPERS=X([0,3,6],['rx','rdx'],[1,3,5]).map(([w,d,k])=>[[w,'r'],[1,d],[k,d.replace('x','')],[1,'rj'],[100,'r']]);

if(on('p150')){
 /* 150 First Chain: the ledge is above a jump and a dash from the floor, and its face is thorned. */
 K.never('First Chain: jump, dash and climb from the floor','p150',
  X(range(40,100,6),[8,12,14],['ux','rux','lux'],[0,4,8],['','rgu']).map(([w,j,d,k,gr])=>[[w,'r'],[j,'rj'],[k,''],[5,d],[40,gr||'r'],[100,'r']]));
 K.hunt('First Chain: up without the chain','p150',{actions:ACT.climb,reject:g=>g.p.state==='hook',score:to(200,70),beam:300,maxDepth:28});
}

if(on('p151')){
 /* 151 Let Go: from the start ledge the far ledge is too far and too high; so is a jump and dash from a ring
    hung on at rest. Only the swing's speed, kept on letting go, gets you there. */
 K.never('Let Go: jump and dash, super or hyper from the start ledge','p151',
  [...range(24,40,4).flatMap(w=>JD.map(t=>[[w,'r'],...t])),...range(28,40,4).flatMap(w=>SUPERS.map(t=>[[w,'r'],...t]))]);
 K.never('Let Go: hang from the ring at rest, then jump and dash','p151',
  X([60,100,140],['jg','g'],[0,3,6],['rux','ux','rx']).map(([h,rel,b,d])=>[[36,'r'],[h,'ug'],[1,rel],[b,''],[5,d],[150,'r']]));
 K.never('Let Go: let go on the way down, then dash','p151',
  X(range(12,30,3),['rjg','r'],[0,4,8],['rux','ux','rx']).map(([h,rel,b,d])=>[[36,'r'],[h,'g'],[1,rel],[b,'r'],[5,d],[150,'r']]));
 K.hunt('Let Go: across without the chain','p151',{actions:ACT.climb,reject:g=>g.p.state==='hook',score:to(200,53),beam:300,maxDepth:24});
}

if(on('p152')){
 /* 152 Deck: the ledge is above a jump and a dash from the floor; the only way up is to ride. */
 K.never('Deck: jump, dash and climb from the floor, deck anywhere','p152',
  X([1,40,80,120,160,200],range(60,130,10),['ux','rux'],[8,14]).map(([w,r,d,j])=>[[1,'l'],[w,''],[r,'r'],[j,'rj'],[5,d],[40,'rgu'],[100,'r']]));
 K.never('Deck: step off before the top','p152',
  range(0,70,5).map(w=>[[1,'l'],[70,''],[82,'r'],[w,''],[80,'r']]));
 K.hunt('Deck: up without riding the deck','p152',{actions:ACT.climb,reject:g=>g.ents.some(e=>e.type==='deck'&&Core.riderOf(g,e)&&e.y<150),
  score:to(200,61),beam:300,maxDepth:24});
}

if(on('p153')){
 /* 153 Running Start: from the deck at rest (either end) nothing reaches the far ledge; nor does walking
    off the deck's end while it runs, without a jump. */
 const rest=[[[1,'l'],[42,'']],[[1,'l'],[44,''],[8,'r']],[[1,'l'],[42,''],[16,'r']],[[1,'l'],[86,''],[6,'r']]];
 K.never('Running Start: jump and dash, super or hyper from the deck at rest','p153',
  rest.flatMap(pre=>[...JD,...SUPERS,...SUPERS.map(t=>t.map(([n,k])=>[n,k.replace('rx','rdx')]))].map(t=>[...pre,...t])));
 K.hunt('Running Start: across without leaving a moving deck','p153',{actions:[...ACT.basic,[[20,'']]],reject:g=>g.leftFast,
  score:to(280,133),beam:300,maxDepth:24});
}

if(on('p154')){
 /* 154 Chain Ladder: walls thorned, no ledge; one ring is not enough. */
 K.never('Chain Ladder: one ring, then jump and dash','p154',
  X([4,8],[20,40,60],['jg','rjg','ljg'],[0,4],['ux','rux','lux']).map(([k,h,rel,b,d])=>[[k,'rj'],[h,'rgu'],[1,rel],[b,''],[5,d],[60,'']]));
 K.hunt('Chain Ladder: out on a single ring','p154',{actions:[...ACT.basic,...HOOK],reject:g=>g.rings.size>1,score:to(160,-10),beam:200,maxDepth:22});
}

if(on('p155')){
 /* 155 Deck to Ring: the ring is too far out for the start, and the far ledge is too high for anything off
    the deck without the chain. */
 K.never('Deck to Ring: jump and dash or super off the deck, without the chain','p155',
  range(0,120,12).flatMap(w=>[...JD,...SUPERS].map(t=>[[1,'l'],[w,''],...t])));
 K.never('Deck to Ring: jump for the ring while the deck rests, at either end','p155',
  X([92,96,100,104,108,0,4,196],[10,20,30,40,50,60]).map(([w,h])=>[[1,'l'],[w,''],[14,'rjg'],[h,'rg'],[1,'rjg'],[5,'rux'],[150,'r']]));
 K.hunt('Deck to Ring: across without the chain','p155',{actions:[...ACT.climb,[[20,'']]],reject:g=>g.p.state==='hook',score:to(260,45),beam:250,maxDepth:24});
}

if(on('p156')){
 /* 156 Moth Between: the fling and the dash fall short; the moth's cut gives the height and the dash back. */
 K.never('Moth Between: fling and dash, no cut','p156',
  X(range(32,48,2),[0,3,6,9,12,15],['rux','ux','rx']).map(([h,b,d])=>[[36,'r'],[h,'g'],[1,'rjg'],[b,'r'],[5,d],[150,'r']]));
 K.hunt('Moth Between: across without the moth','p156',{actions:[...ACT.basic,...HOOK],
  reject:(g,ev)=>ev.some(e=>e.type==='enemy-defeat'||e.type==='rebound'||e.type==='enemy-hit'),score:to(260,29),beam:250,maxDepth:26});
}

if(on('p157')){
 /* 157 Long Chain: the stone is below the plain swing; without paying out, the gate stays shut. */
 K.never('Long Chain: swing and cross without paying out','p157',
  X([10,20,40,60,80],[0,6,12,18,24],['rux','ux','rx']).map(([h,w,d])=>[[36,'r'],[h,'ug'],[w,'g'],[1,'jg'],[3,''],[5,d],[150,'r']]));
 K.never('Long Chain: pay out too little','p157',
  X([4,8,12],[60,80],[0,12,24]).map(([d,u,w])=>[[36,'r'],[d,'dg'],[u,'ug'],[w,'g'],[1,'jg'],[3,''],[5,'rux'],[150,'r']]));
 K.hunt('Long Chain: out without lighting the stone','p157',{actions:[...ACT.basic,[[8,'rg']],[[8,'g']],[[16,'ug']],[[1,'jg']]],
  reject:(g,ev)=>ev.some(e=>e.type==='stone-lit'),score:to(300,69),beam:200,maxDepth:24});
}

if(on('p158')){
 /* 158 Returned Fire: cut the bolt, dodge it, or parry it any way but up, and the stone stays dark. */
 K.never('Returned Fire: cut, dodge, or parry it sideways','p158',
  X(range(104,124,2),['ugs','gs','rgp','lgp','gp','dgp','g']).map(([p,a])=>[[36,'r'],[60,'ug'],[p-96,'ug'],[1,a],[20,'ug'],[1,'jg'],[4,''],[5,'rux'],[200,'r']]));
 K.hunt('Returned Fire: out without a parry','p158',{actions:[...ACT.basic,...HOOK,[[1,'us']],[[1,'s']]],
  reject:(g,ev)=>ev.some(e=>e.type==='parry'),score:to(300,77),beam:200,maxDepth:26});
}

if(on('p159a')){
 /* 159a The Staple: deck, ring, fling and dash leave you short of the ledge; the moth is the last step. */
 K.never('The Staple: deck, ring and dash, no moth','p159a',
  X([38,42,46,50],[30,35,40,45],[0,6,12],['rux','ux']).map(([a,b,s,d])=>[[1,'l'],[a,''],[14,'rjg'],[b,'rg'],[1,'rjg'],[s,'r'],[5,d],[150,'r']]));
 K.hunt('The Staple: up without the moth','p159a',{actions:[...ACT.basic,...HOOK,[[20,'']]],
  reject:(g,ev)=>ev.some(e=>e.type==='enemy-defeat'||e.type==='rebound'),score:to(290,13),beam:200,maxDepth:26});
}

if(on('p159b')){
 /* 159b The Lip: no room in front of the warder, and his shield turns the blade; only a landing behind
    him opens the gate. */
 K.never('The Lip: at the shield from the front, by fling, dash and cut','p159b',
  X(range(30,44,2),[0,4,8],['rx','dx'],['ls','s','ds','p']).map(([h,b,d,a])=>[[36,'r'],[h,'g'],[1,'rjg'],[b,'r'],[5,d],[1,a],[10,''],[1,'rs'],[150,'r']]));
 // Narrowed honestly: a hyper off the start ledge reaches the warder's shield face, where you can hang on him
 // and parry his thrust. Hypers are not taught before Part XVII, so this search leaves them out (PART-XVI.md).
 K.hunt('The Lip: fell the warder without landing behind him (no super or hyper)','p159b',{actions:[...ACT.basic,...HOOK,[[1,'rs']],[[1,'ds']],[[1,'p']]],
  goal:(g,ev)=>ev.some(e=>e.type==='jailer-fell'),reject:(g,ev)=>(g.jailers&&g.p.x>g.jailers[0].x+g.jailers[0].w-2)||ev.some(e=>e.type==='hyper'||e.type==='super'),
  score:to(170,61),beam:200,maxDepth:26});
}

console.log(`(${((Date.now()-t0)/1000).toFixed(0)} s)`);
K.done();
