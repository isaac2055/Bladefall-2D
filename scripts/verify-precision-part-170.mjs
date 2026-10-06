// Part XVIII · The Colony (levels 170–179, 7.254): routes and the wrong answers that fail.
// Watch lights (bladefall-pcore-dev-watch.js): six frames seen resets the room; smoke hides you; anything solid
// blocks the light.   node scripts/verify-precision-part-170.mjs        (ONLY=p171,p172 runs a few rooms)
//
// Hunts in rooms whose lamp swings carry the lamp's clock in their state key, so a search can wait for the
// dark (the default key would merge a knight waiting in place with the same knight a moment earlier). A probe
// device sets sticky marks after every frame, so a hunt's reject sees what happened inside a step, not only
// where the step ended.
import {kit,X,range} from './pcore-verify-kit.mjs';
import {ACT,defaultKey} from './pcore-search.mjs';
const K=kit('XVIII');
const t0=Date.now();
const ONLY=process.env.ONLY?process.env.ONLY.split(','):null,on=id=>!ONLY||ONLY.includes(id);
const seen=r=>r.events.some(e=>e.type==='seen');
const ev=(...ts)=>(g,e)=>e.some(x=>ts.includes(x.type));
const clockKey=g=>defaultKey(g)+'|'+(g.watchClock>>2);
const overlap=(p,x,y,w,h)=>p.x<x+w&&p.x+p.w>x&&p.y<y+h&&p.y+p.h>y;

// Sticky marks (this script only): the smoke column of 171 below the corridor, and a knight moving faster than
// any dash (a portal fling fed by a fall).
(globalThis.BladefallPrecisionDevices||[]).push({name:'xviii-probe',after(g){
 const p=g.p;if(p.state==='dead'||p.state==='respawn')return;
 if(g.room.def.id==='p171'&&overlap(p,168,80,24,64))g.inColumn=true;
 if(Math.abs(p.vx)>250)g.fast=true;
}});

if(!ONLY)K.routes();
console.log('Part XVIII: tempting wrong strategies fail');

// 170 Lamplight: walking (or hopping) straight through, whenever you set out, meets the lamp in the second gap.
// Only a stop under the first tent lets it swing past.
if(on('p170')){
K.never('Lamplight: set out at any moment and never stop','p170',
 X(range(0,480,4),['r','rj']).map(([w,k])=>[[1,'l'],[w,''],[400,k]]));
}

// 171 Pit Smoke: the ledges are the short way up, and every one of them is in the lamp's eye.
if(on('p171')){
const steps=[[20,"rgu"],[14,"rj"],[8,"r"],[14,"rj"],[8,"r"],[14,"rj"],[8,""],[14,"rj"],[20,"rgu"],[4,"r"],[14,"rj"],[4,"l"],[4,"r"],[20,"rgu"],[8,""],[8,"rj"],[10,"lgu"],[14,"rj"],[20,"rgu"],[20,"rgu"],[20,"rgu"],[14,"rj"],[100,"r"]];
K.never('Pit Smoke: climb the lit ledges (a route that exits with the lamp out)','p171',
 range(0,60,3).map(w=>[[w,''],...steps]));
K.hunt('Pit Smoke: no way up to the road but the smoke column','p171',{actions:ACT.climb,
 reject:g=>g.inColumn,score:g=>g.p.y-g.p.x*.2,beam:200,maxDepth:50});
}

// 172 A Glance: every beam is wider than a walk or a jump can cross in six frames, even up against the roof.
if(on('p172')){
K.never('A Glance: walk or hop through the beams','p172',
 X(range(0,60,3),[0,6,10,14]).map(([a,j])=>[[a,'r'],...(j?[[1,'rj'],[j,'rj']]:[]),[400,j?'rj':'r']]));
K.hunt('A Glance: no way past the beams without a dash','p172',{actions:ACT.basic.filter(a=>!a[0][1].includes('x')),beam:200,maxDepth:45});
}

// 173 Lantern Thief: carried through the beam (walk or hop, no dash while carrying) the knight is seen;
// dashing through alone leaves the lantern, and the gate, behind.
if(on('p173')){
K.never('Lantern Thief: carry the lantern through the beam','p173',
 X(range(0,40,2),[0,8,14]).map(([a,j])=>[[14,'r'],[1,'rg'],[a,'r'],...(j?[[1,'rj'],[j,'rj']]:[]),[200,'r'],[14,'rj'],[100,'r']]));
K.never('Lantern Thief: dash through without the lantern','p173',
 X(range(20,50,2),[0,14]).map(([a,j])=>[[a,'r'],[1,'rx'],[60,'r'],...(j?[[1,'rj'],[j,'rj']]:[]),[200,'r']]));
K.hunt('Lantern Thief: no way out without the lantern going through on its own','p173',
 {actions:[...ACT.basic,[[1,'g']],[[1,'rg']],[[1,'dg']]],reject:ev('throw'),beam:200,maxDepth:55});
}

// 174 Faster Than a Hop: the floor is never dark for long enough to walk or hop it, whenever you set out.
if(on('p174')){
K.never('Faster Than a Hop: run or hop across at any moment','p174',
 X(range(0,300,3),[0,1]).map(([w,j])=>[[1,'l'],[w,''],[400,j?'rj':'r']]));
K.hunt('Faster Than a Hop: no crossing without a dash','p174',{actions:[[[1,'l'],[8,'']],...ACT.basic.filter(a=>!a[0][1].includes('x'))],
 key:clockKey,beam:200,maxDepth:55});
}

// 175 Low Road: the pit is too long for a jump and a dash, a super hits the thorns in the roof, and a
// hyper made while the lamp looks down the road is seen.
if(on('p175')){
K.never('Low Road: super, jump and dash, or a plain dash over the pit','p175',
 X(range(0,40,2),[1,4,7,10],['super','jd','dash']).map(([w,b,k])=>[[16,'r'],[26,''],[w,'r'],
  ...(k==='super'?[[1,'rx'],[b,'r'],[1,'rj'],[30,'rj']]:k==='jd'?[[1,'rj'],[b,'rj'],[1,'rx'],[30,'r']]:[[1,'rx'],[b,'r'],[30,'r']]),[100,'r']]));
K.never('Low Road: a hyper when the lamp is looking','p175',
 range(60,120,2).map(w=>[[1,'l'],[w,''],[16,'r'],[26,''],[1,'rdx'],[5,'rd'],[1,'rj'],[30,'rj'],[100,'r']]));
K.hunt('Low Road: no crossing without a hyper','p175',{reject:ev('hyper'),key:clockKey,beam:200,maxDepth:60});
}

// 176 Fling: the yard lamp holds a curtain of light across the yard, wider than a walk, a jump, a dash or a
// super crosses in six frames. Only a fling fed by a long fall is quicker.
if(on('p176')){
K.never('Fling: walk or hop out of the tower portal','p176',
 X(range(0,120,3),['walk','hop']).map(([w,k])=>[[1,'ldq'],[1,''],[w,''],...(k==='walk'?[[20,'l']]:[[1,'lj'],[8,'l']]),[90,''],[100,'r']]));
const out=[[1,'ldq'],[1,''],[20,'l'],[60,'']];   // out of the wall portal slowly, standing in the yard
K.never('Fling: dash, super or hyper through the curtain','p176',
 X(range(0,36,2),['dash','super','jd','hyper']).map(([a,k])=>[...out,[a,'r'],...(k==='dash'?[[1,'rx'],[40,'r']]:k==='super'?[[1,'rx'],[7,'r'],[1,'rj'],[40,'rj']]:
  k==='hyper'?[[1,'rdx'],[5,'rd'],[1,'rj'],[40,'rj']]:[[1,'rj'],[6,'rj'],[1,'rx'],[40,'r']]),[100,'r']]));
K.hunt('Fling: no way across the yard without a fall-fed fling','p176',{start:[[1,'ldq'],[1,'']],
 actions:[...ACT.climb,[[1,'dq']],[[1,'ldq']],[[1,'rdq']]],reject:g=>g.fast,beam:150,maxDepth:60});
}

// 177 Let Go: the chain's swing is hidden in smoke; the long flight to the tunnel is not. Leave the ledge while
// the lamp is looking toward the tunnel and it is still looking when you let go.
if(on('p177')){
const swing=[[14,"rj"],[14,"j"],[8,"lg"],[8,"lgu"],[14,"rj"],[14,"rj"],[14,"rj"],[14,"rj"],[60,"r"]];
K.never('Let Go: set out while the lamp looks at the landing','p177',
 [...range(0,160,4),...range(292,460,4)].map(w=>[[1,'l'],[w,''],...swing]));
K.hunt('Let Go: no way over the thorns without the chain','p177',{reject:ev('hook'),key:clockKey,beam:200,maxDepth:50});
}

// 178 Shade: the stone's shadow is the only dark in the hall. Hop over it and run, and the lamp sees you.
if(on('p178')){
K.never('Shade: hop over the stone and run the hall','p178',
 X(range(0,28,2),[8,14]).map(([a,j])=>[[a,'r'],[1,'rj'],[j,'rj'],[200,'r']]),r=>r.g.p.x>120);
const moved=g=>g.ents.some(e=>e.type==='slide'&&e.x!==e.ox);
K.hunt('Shade: no way down the hall with the stone left where it stands','p178',{reject:moved,beam:150,maxDepth:40});
}

// 179 The Watch: the lamp looks away twice a turn, for about half a second (set out 36–66 or 102–129 frames
// after the first input, then every 180). Leave the smoke at any other
// moment and it is looking; take the low road without a hyper and the thorns or the pit have you.
if(on('p179')){
const run=[[5,"rdx"],[14,"rj"],[14,"rj"],[14,"rj"],[5,"rx"],[14,"rj"],[14,"rj"],[14,"rj"],[14,"rj"]];
K.never('The Watch: leave the smoke while the lamp is looking','p179',
 [...range(0,30,3),...range(72,96,3),...range(138,210,3),...range(252,276,3)].map(w=>[[1,'l'],[w,''],...run]));
K.never('The Watch: super, jump and dash, or a dash under the thorn roof','p179',
 X([48,51,54,57,60],[0,2,4,6],['super','jd','dash']).map(([w,b,k])=>[[1,'l'],[w,''],
  ...(k==='super'?[[1,'rx'],[b+6,'r'],[1,'rj'],[30,'rj']]:k==='jd'?[[1,'rj'],[b+2,'rj'],[1,'rx'],[30,'r']]:[[1,'rx'],[30,'r']]),
  [5,'rx'],[14,'rj'],[14,'rj'],[14,'rj'],[14,'rj']]));
K.hunt('The Watch: no crossing without a hyper','p179',{reject:ev('hyper'),key:clockKey,beam:200,maxDepth:50});
}

console.log(`(${((Date.now()-t0)/1000).toFixed(0)} s)`);
K.done();
