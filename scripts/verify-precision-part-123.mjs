// Part XIII · The Citadel (levels 123–131, 7.254): routes and the wrong answers that fail.
// Also fixes the two foothold rules the Citadel depends on (see bladefall-pcore-dev-citadel.js).
import {kit,X,range} from './pcore-verify-kit.mjs';
import {ACT} from './pcore-search.mjs';
import {Core,expand,keysToInput} from './pcore-tape.mjs';
const K=kit('XIII');
// Optional: check one room's wrong strategies only, e.g. `node scripts/verify-precision-part-123.mjs p127`.
const only=process.argv[2];
if(only)for(const f of ['never','hunt']){const o=K[f];K[f]=(label,id,...a)=>id===only?o(label,id,...a):0;}

console.log('Part XIII: the foothold rules');
{
 const box=put=>{const m=[];for(let r=0;r<23;r++)m.push((r===0||r>=20?'#'.repeat(40):'#'+'.'.repeat(38)+'#').split(''));for(const [c,r,ch]of put)m[r][c]=ch;return {id:'fx',name:'fx',map:m.map(r=>r.join(''))};};
 const play=(def,tape)=>{const g=Core.createGame([def]);const ev=[];for(const k of expand(tape)){Core.step(g,keysToInput(k));ev.push(...g.events.map(e=>e.type));g.events.length=0;}return {g,ev};};
 // Holding jump on a foothold: every landing jumps again on the same frame. It is still spent once.
 const hop=play(box([[8,17,'Y'],[9,17,'Y'],[10,17,'Y'],[9,16,'P']]),[[120,'j']]);
 K.say(hop.ev.filter(e=>e==='foothold-spent').length===1&&hop.g.p.y>140,'a buffered jump off a foothold still spends it (no hopping on it forever)');
 // Kicking off a foothold's side is leaving it.
 const wall=[[5,19,'P']];for(let r=10;r<16;r++)wall.push([12,r,'Y']);
 const kick=play(box(wall),[[14,'r'],[16,'rj'],[1,''],[1,'lj'],[30,'l']]);
 K.say(kick.ev.includes('walljump')&&kick.ev.includes('foothold-spent'),'a wall jump off a foothold’s side spends it');
}

K.routes();
console.log('Part XIII: tempting wrong strategies fail');
const clean=r=>r.exited;                      // with a custom pred, only runs with no deaths count
const lit=r=>r.g.ents.filter(e=>e.type==='stone').every(e=>e.lit);
const noMomentum=(g,ev)=>ev.some(e=>['super','hyper','ultra','wallbounce'].includes(e.type));

// 123 Good Once: hop in place on a foothold and it is gone under you; and the thorns are too wide to leap.
K.never('Good Once: hop on a foothold, then carry on','p123',
 X([0,1,2],[8,14,20],range(1,3)).map(([n,j,k])=>{const t=[[14,'rj'],[22,'r'],[14,'rj'],[22,'r'],[14,'rj'],[36,'r'],[14,'rj'],[56,'r']];const at=2*n+1;return [...t.slice(0,at),...Array.from({length:k},()=>[[j,'j'],[30,'']]).flat(),...t.slice(at)];}),clean);
K.never('Good Once: leap the thorns without the footholds','p123',
 X(range(0,30,3),[8,14],['r','ru','rd'],[2,6,10,14]).map(([w,j,d,at])=>[[w,'r'],[j,'rj'],[at,'r'],[5,d+'x'],[40,'r'],[14,'rj'],[60,'r']]),r=>r.exited&&!r.events.some(e=>e.type==='foothold-spent'));

// 124 Out and Back: the high road out spends the only way home.
const high124=[[6,'r'],[10,'rj'],[5,'rux'],[110,'r'],[14,'rj'],[20,'r']];
K.say(lit(K.sim('p124',high124)),'Out and Back: the high road does reach the stone');
K.never('Out and Back: high road out, then any way home','p124',
 X(range(0,40,8),[8,14],['l','lu','ld','u'],[0,6,12,18,24]).map(([w,j,d,at])=>[...high124,[w,'l'],[j,'lj'],[at,'l'],[5,d+'x'],[30,'l'],[20,'lgu'],[14,'lj'],[80,'lu']]),clean);
K.hunt('Out and Back: no way home once the high road is spent','p124',{actions:[...ACT.climb],
 reject:(g,ev)=>noMomentum(g,ev)||g.ents.some(e=>e.type==='stone'&&e.lit)&&!g.ents.find(e=>e.type==='foothold'&&e.w>100).used,
 score:g=>g.ents.some(e=>e.type==='stone'&&!e.lit)?1000+Math.hypot(g.p.x-288,g.p.y-80):Math.hypot(g.p.x,g.p.y-48),beam:120,maxDepth:45});

// 125 Thrown Through: walk, jump or dash into the portal and you come out too slow.
// (A jump the moment the zip stops, w=0 with rj, is the intended answer, so it is left out.)
K.never('Thrown Through: into the portal at walking, jumping or dashing speed','p125',
 X(['rq','ruq'],[0,20,40],['r','rj','rx','rjx'],[0,4,8]).filter(([q,w,m])=>!(w===0&&m==='rj')).map(([q,w,m,d])=>[[1,q],[20,'r'],[27+w,''],...(m==='rj'?[[14,'rj']]:m==='rx'?[[5,'rx']]:m==='rjx'?[[6,'rj'],[5,'rx']]:[[20,'r']]),[d,'r'],[6,'ux'],[100,'r']]),clean);
K.hunt('Thrown Through: no way out without the zip’s throw','p125',{actions:[...ACT.basic,...['r','ru','u'].map(d=>[[1,d+'q'],[1,'']])],
 reject:(g,ev)=>ev.some(e=>e.type==='jump'&&e.lift),score:g=>g.portals.blue?Math.hypot(g.p.x-320,g.p.y-60):1000,beam:100,maxDepth:35});

// 126 One Stand: jump for the orange end before aiming, and the foothold is gone under you.
K.never('One Stand: up into the orange end first, aim after','p126',
 X([0,6,12],['ruq','rq','uq'],[0,10,20]).map(([w,q,t])=>[[16,'r'],[14,'rj'],[10,'r'],[20+w,''],[14,'j'],[t,''],[1,q],[10,''],[14,'j'],[80,'r']]),clean);
K.never('One Stand: aim from the start ledge instead','p126',
 X(['rq','ruq','uq','rdq'],[0,4,8,12,16]).map(([q,w])=>[[w,'r'],[1,q],[1,''],[16,'r'],[14,'rj'],[10,'r'],[20,''],[14,'j'],[80,'r']]),clean);
K.hunt('One Stand: no way over without standing on the foothold','p126',{actions:[...ACT.basic,...['r','ru','u'].map(d=>[[1,d+'q'],[1,'']])],
 reject:g=>g.ents.some(e=>e.type==='foothold'&&e.used),score:g=>g.portals.blue?Math.hypot(g.p.x-320,g.p.y-150):Math.hypot(g.p.x-88,g.p.y-100),beam:100,maxDepth:30});

// 127 Moth Road: out on the bridge, then home without the moths.
const out127=[[20,'r'],[14,'rj'],[132,'r'],[14,'rj'],[30,'r']];
K.say(lit(K.sim('p127',out127)),'Moth Road: the bridge does reach the stone');
K.never('Moth Road: bridge out, home on jumps and dashes alone','p127',
 X(range(0,24,6),[8,14],['l','lu','u'],[0,8,16,24]).map(([w,j,d,at])=>[...out127,[w,'l'],[j,'lj'],[at,'l'],[5,d+'x'],[60,'l'],[14,'lj'],[60,'l']]),clean);
K.hunt('Moth Road: no way home without a moth','p127',{actions:[...ACT.basic,...ACT.climb.slice(-6)],
 reject:(g,ev)=>ev.some(e=>e.type==='enemy-pogo'),score:g=>g.ents.some(e=>e.type==='stone'&&!e.lit)?1000+Math.hypot(g.p.x-288,g.p.y-128):Math.hypot(g.p.x,g.p.y-70),beam:120,maxDepth:45});

// 128 First Step: the low stone first spends the stair's first step.
const low128=[[14,'rj'],[8,'r'],[14,'rj'],[20,'r']];
K.never('First Step: the low stone first, then any way up','p128',
 X([0,10,20],['l','r',''],[8,14],[0,1]).map(([w,d,j,twice])=>[...low128,[w,d],[j,'lj'],[20,'l'],[14,'lj'],...(twice?[[14,'lj'],[14,'rj']]:[]),[14,'rj'],[14,'rj'],[60,'r']]),clean);
K.hunt('First Step: no way to the exit that lights the low stone first','p128',{actions:[...ACT.move,...ACT.jumps],
 reject:g=>{const s=g.ents.filter(e=>e.type==='stone'),h=s.find(e=>e.y<60),l=s.find(e=>e.y>60);return l.lit&&!h.lit;},
 score:g=>{const s=g.ents.filter(e=>e.type==='stone'),h=s.find(e=>e.y<60);return !h.lit?1000+Math.hypot(g.p.x-h.x,g.p.y-h.y):Math.hypot(g.p.x-320,g.p.y-150);},beam:150,maxDepth:45});

// 129 Clear the Way: throw with the foothold still standing, or aim from the zip.
K.never('Clear the Way: throw before the foothold is spent','p129',
 X(['rq','q',''],range(24,40,2),[8,14]).map(([q,w,j])=>[[1,q],[20,'r'],[w,''],[j,'rj'],[10,'r'],[6,'ux'],[90,'r']]),clean);
K.never('Clear the Way: aim from the zip, not the foothold','p129',
 X([0,10,20,30],['rq','ruq'],range(100,116,4)).map(([a,q,w])=>[[20,'r'],[a,''],[1,q],[41-a,''],[14,'rj'],[4,'r'],[10,''],[6,''],[20,'lj'],[20,'lj'],[8,'r'],[w,''],[14,'rj'],[10,'r'],[6,'ux'],[90,'r']]),clean);
K.hunt('Clear the Way: no way out without the zip’s throw','p129',{actions:[...ACT.basic,[[1,'rq'],[1,'']]],
 reject:(g,ev)=>noMomentum(g,ev)||ev.some(e=>e.type==='jump'&&e.lift),score:g=>g.portals.blue?Math.hypot(g.p.x-320,g.p.y-70):Math.hypot(g.p.x-140,g.p.y-125),beam:100,maxDepth:40});

// 130 Leave a Body: go down without leaving yourself up top.
K.never('Leave a Body: down to the stone with no echo above','p130',
 X([0,30,60],['','q'],[0,1]).map(([w,late,swapBack])=>[[w,'r'],[140,'r'],...(late?[[1,'q'],[1,'']]:[]),...(swapBack?[[1,'q'],[1,'']]:[]),[14,'lj'],[20,'lgu'],[80,'l']]),clean);
K.hunt('Leave a Body: no way back up without trading places','p130',{actions:[...ACT.climb,[[1,'q'],[1,'']]],
 reject:(g,ev)=>ev.some(e=>e.type==='echo-swap'),score:g=>g.ents.some(e=>e.type==='stone'&&!e.lit)?1000+Math.abs(g.p.x-192):Math.hypot(g.p.x,g.p.y-30),beam:80,maxDepth:30});

// 131 The Citadel: the echo left low, or a swap without the zip's speed, or no swap at all.
const stair131=[[14,'rj'],[8,'l'],[14,'rj'],[8,'r'],[14,'lj'],[8,'r'],[14,'rj'],[14,'rj'],[8,'l']];
K.never('The Citadel: jump or dash for the way out from the top of the stair','p131',
 X([0,1],[8,14],['r','ru'],[0,6,12,18]).map(([q,j,d,at])=>[...stair131,...(q?[[1,'q'],[1,'']]:[]),[j,'rj'],[at,'r'],[5,d+'x'],[80,'r']]),clean);
// (The echo at the top traded for while riding, top with still=0, is the intended answer, so it is left out.)
K.never('The Citadel: trade places standing still, or with the echo left at the bottom','p131',
 X(['top','bottom'],range(8,32,2),[0,20]).filter(([where,w,still])=>where==='bottom'||still).map(([where,w,still])=>[...stair131,...(where==='top'?[[1,'q'],[1,'']]:[]),[42,'l'],[20,''],...(where==='bottom'?[[1,'q'],[1,'']]:[]),[20,'r'],[w+still,''],...(still?[[1,'q'],[1,''],[14,'rj']]:[[1,'rj'],[1,'rjq'],[28,'rj']]),[5,'rux'],[80,'r']]),clean);
K.hunt('The Citadel: no way out without trading places','p131',{actions:[...ACT.basic],
 reject:(g,ev)=>ev.some(e=>e.type==='echo-swap'),score:g=>Math.hypot(g.p.x-320,g.p.y-20),beam:100,maxDepth:45});
K.done();
