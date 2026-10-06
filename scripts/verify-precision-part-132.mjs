// Part XIV · The Throne (levels 132–139, 7.254): routes and the wrong answers that fail.
import {kit,X,range} from './pcore-verify-kit.mjs';
import {ACT,defaultKey} from './pcore-search.mjs';
const K=kit('XIV');
K.routes();
console.log('Part XIV: tempting wrong strategies fail');
const clean=r=>r.exited;                      // with a custom pred, only runs with no deaths count
const Q=[[1,'q'],[1,'']];
const echoAct=[Q];
const noSwap=(g,ev)=>ev.some(e=>e.type==='echo-swap');

// 132 Hold the Door: nobody on the plate, or the echo left beside it.
K.never('Hold the Door: step off the plate and run for the door','p132',
 X(range(0,40,4),[0,1]).map(([w,dash])=>[[30,'r'],[12+w,''],...(dash?[[5,'rx']]:[]),[250,'r']]),clean);
K.never('Hold the Door: the echo left anywhere but on the plate','p132',
 X([10,20,40,60,80,100]).map(([w])=>[[w,'r'],[1,'q'],[1,''],[250,'r']]),clean);
K.hunt('Hold the Door: no way through without the echo','p132',{actions:[...ACT.basic],reject:(g,ev)=>ev.some(e=>e.type==='echo-place'),beam:60,maxDepth:30});

// 133 Still Moving: the spring alone, the echo left low, or a jump from the step.
const echoHigh=[[100,'r'],[14,'rj'],[10,'r'],[12,'j'],[6,'ux'],[10,''],[1,'q'],[40,'']];
K.never('Still Moving: the spring and a dash, no trade','p133',
 X(range(60,90,3),['ux','rux'],range(2,30,4)).map(([L,dd,d])=>[[100,'r'],[14,'rj'],[10,'r'],[40,''],[L,'l'],[d,'r'],[6,dd],[80,'r']]),clean);
K.never('Still Moving: the echo left on the floor or the step, then the spring','p133',
 X(['floor','step'],range(70,90,2),['ux','rux'],[6,14,22]).map(([w,L,dd,d])=>[...(w==='floor'?[[100,'r'],[1,'q'],[1,''],[20,'r']]:[[100,'r'],[14,'rj'],[10,'r'],[1,'q'],[1,'']]),[40,''],[L,'l'],[1,'q'],[d,'r'],[6,dd],[80,'r']]),clean);
K.never('Still Moving: straight up from the step','p133',
 X([0,6,12],['ux','rux'],[0,4,8]).map(([w,dd,at])=>[[100,'r'],[14,'rj'],[10+w,'r'],[12,'rj'],[at,'r'],[6,dd],[80,'r']]),clean);
K.hunt('Still Moving: no way up without trading places','p133',{actions:[...ACT.basic,...ACT.grabs.slice(0,2)],reject:noSwap,score:g=>Math.hypot(g.p.x-320,g.p.y-30),beam:100,maxDepth:45});

// 134 Re-aimed: step off the moment it points the right way, and it has moved by the time you land.
K.never('Re-aimed: step off as it turns to the way out','p134',
 [...range(0,8,2),...range(71,95,3),...range(161,185,3)].map(w=>[[w+1,''],[22,'r'],[140,'']]),clean);
K.hunt('Re-aimed: no way over the wall but the pair','p134',{actions:[...ACT.climb],reject:(g,ev)=>ev.some(e=>e.type==='portal-pass'),score:g=>-g.p.x+Math.abs(g.p.y-100)*.3,beam:80,maxDepth:30});

// 135 Wake Behind: in and out the same way.
K.never('Wake Behind: up the far shaft to the stone and back down','p135',
 X([200,210,220],[0,10,20],['d','','l']).map(([w,top,down])=>[[w,'r'],[14,'rj'],[90+top,'rgu'],[40,down],[200,'l']]),clean);
// Along the top, touching the stone from the lip of the far shaft without dropping in, and back the way you came.
// (Walking on into the shaft is the intended loop, so the family stops short of it or jumps back from it.)
const upLeft135=[[14,'lj'],[20,'lgu'],[20,'rgu'],[14,'rj'],[20,'rgu']];
K.never('Wake Behind: along the top to the stone and back','p135',
 [...X([176,178],['l','lj']),...X(range(180,190,2),['lj'])].map(([top,back])=>[...upLeft135,[top,'ru'],[4,''],[20,back],[200,'l'],[60,'lgd'],[60,'l']]),clean);
// Any route to the door that has not been down both shafts has doubled back somewhere.
const ring135=g=>{const p=g.p;if(p.y>56&&p.y<131){if(p.x<=26)g._L=1;if(p.x>=286)g._R=1;}return g._L&&g._R;};
K.hunt('Wake Behind: no way to the door without going round the ring','p135',{actions:[...ACT.climb],reject:ring135,
 key:g=>defaultKey(g)+'|'+(g._L|0)+(g._R|0),score:g=>g.ents.some(e=>e.type==='stone'&&e.lit)?Math.hypot(g.p.x,g.p.y-133):1000+Math.hypot(g.p.x-296,g.p.y-48),beam:60,maxDepth:50});

// 136 Swap Past It: climb back down past the shade, or leave the echo up top.
const up136=[[100,'r'],[14,'rj'],[104,'rgu']];
K.never('Swap Past It: climb or drop back down the shaft','p136',
 X([0,10,20],['d','','gd'],[0,1]).map(([w,down,q])=>[[100,'r'],...(q?Q:[]),[14,'rj'],[104+w,'rgu'],[60,down],[150,'l']]),clean);
K.never('Swap Past It: the echo left at the head of the shaft','p136',
 X([0,10,20],[0,20,40]).map(([w,t])=>[...up136,[w,'gu'],...Q,[t,'d'],...Q,[150,'l']]),clean);
K.hunt('Swap Past It: no way out without trading places','p136',{actions:[...ACT.climb],reject:noSwap,
 score:g=>g.ents.some(e=>e.type==='stone'&&!e.lit)?1000+Math.hypot(g.p.x-160,g.p.y-24):Math.hypot(g.p.x,g.p.y-130),beam:80,maxDepth:45});

// 137 Onto the Plate: the echo left on the plate, or none at all.
const chamber137=[[1,''],[20,'r'],[40,'']];     // the first bounce into the slab while it leads up
K.never('Onto the Plate: into the chamber with no echo below','p137',
 X([10,20,30],[0,1],[0,40,90]).map(([w,q,t])=>[...chamber137,[w,'r'],...(q?Q:[]),[t,''],...Q,[120,'r'],[120,'l']]),clean);
K.never('Onto the Plate: the echo left on the plate, then out the way you came','p137',
 X([33,36],[0,45,90,135],['l','r','']).map(([w,t,d])=>[...chamber137,[w,'r'],...Q,[t,''],[40,'l'],[20,d],...Q,[150,'r']]),clean);
K.hunt('Onto the Plate: no way through without trading places','p137',{actions:[...ACT.basic,...echoAct],
 reject:noSwap,score:g=>g.ents.find(e=>e.type==='plate').down?Math.hypot(g.p.x-320,g.p.y-150):Math.hypot(g.p.x-228,g.p.y-37),beam:80,maxDepth:45});

// 138 Room Above: back along the lower passage (the drop you came down cannot be climbed), with or without a hop into the thorn shaft first.
const down138=[[22,'l'],[50,''],[170,'r']];
K.never('Room Above: light the stone and run back along the passage','p138',
 X([0,10,20],['','j'],[0,1]).map(([t,j,hop])=>[...down138,...(hop?[[14,'l'],[14,'j'],[5,'ux'],[30,'']]:[]),[t,''],[20,'l'+j],[180,'l'],[14,'lj'],[120,'lgu'],[60,'r']]),clean);
K.never('Room Above: up the thorn shaft on a jump and a dash, no moth','p138',
 X([10,14,18],[8,14],['ux','lux'],[0,10,20]).map(([a,b,d,w])=>[...down138,[a,'l'],[b,'j'],[5,d],[w,''],[160,'l'],[14,'lj'],[60,'l']]),clean);
K.hunt('Room Above: no way up without the moth','p138',{actions:[...ACT.basic,...ACT.climb.slice(-6),...ACT.strikes.slice(0,3)],
 reject:(g,ev)=>ev.some(e=>e.type==='enemy-defeat'),score:g=>g.ents.some(e=>e.type==='stone'&&!e.lit)?(g.p.y<100?2000+Math.hypot(g.p.x-48,g.p.y-150):1000+Math.abs(g.p.x-290)):Math.hypot(g.p.x,g.p.y-45),beam:100,maxDepth:50});

// 139 The Throne: set off at once and wait at the edge; leave the echo nowhere, in the pit or in the throne room; trade off the throne.
const fly139=[[50,''],[34,'l']],out139=[[1,'lq'],[100,'l']];
K.never('The Throne: set off at once and wait at the edge for the door','p139',
 X(range(0,84,4),[14,18,22]).map(([t,k])=>[[1,'q'],[1,''],[38,'r'],[t,''],[k,'r'],...fly139,...out139]),clean);
K.never('The Throne: step off while the door shows the throne','p139',
 X([0,10,20,30,90,100,110],[14,18,22]).map(([w,k])=>[[1,'q'],[w,''],[38,'r'],[k,'r'],...fly139,...out139]),clean);
K.never('The Throne: no echo until the throne room','p139',
 X([56,64,72],[0,1]).map(([w,twice])=>[[w,''],[60,'r'],...fly139,...Q,...(twice?Q:[]),[100,'l']]),clean);
K.never('The Throne: the echo left in the pit on the way down','p139',
 X([56,64,72],[44,50,56,62,70]).map(([w,at])=>[[w,''],[at,'r'],...Q,[60-at>0?60-at:1,'r'],...fly139,...out139]),clean);
K.never('The Throne: trade anywhere in the throne room but the throne','p139',
 [0,8,16,44,52,60].map(n=>[[1,'q'],[64,''],[60,'r'],[50,''],[n,'l'],...out139]),clean);
K.hunt('The Throne: no way out without trading places','p139',{actions:[...ACT.climb,...echoAct],reject:noSwap,score:g=>Math.hypot(g.p.x,g.p.y-37),beam:40,maxDepth:30});
K.hunt('The Throne: no way to the throne but the door','p139',{actions:[...ACT.climb],reject:(g,ev)=>ev.some(e=>e.type==='portal-pass'),score:g=>Math.hypot(g.p.x-256,g.p.y-53),goal:g=>g.p.x>=208&&g.p.y<64,beam:60,maxDepth:30});
K.done();
