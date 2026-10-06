// Part VII · The Gaol (levels 75–82, 7.254): routes and the wrong answers that fail.
import {kit,X,range} from './pcore-verify-kit.mjs';
import {ACT} from './pcore-search.mjs';
const K=kit('VII');
K.routes();
console.log('Part VII: tempting wrong strategies fail');
const inShaft=(g,x0,x1,y0,y1)=>g.p.x+8>x0&&g.p.x<x1&&g.p.y<y1&&g.p.y+11>y0;
// 75 Committed: the front is thorns under a low roof; only the crawl and the shaft reach its back.
K.never('Committed: straight at the shield, by jump, dash, cut or parry','p75',
 X(range(0,60,4),[0,8,14],['r','ru','u',''],['s','p','x']).map(([w,j,d,a])=>[[60,'r'],[w,'r'],...(j?[[j,'rj']]:[]),[1,a==='x'?d+'x':d+a],[5,'r'],[1,'rs'],[20,'r'],[1,'s'],[200,'r']]));
K.hunt('Committed: no way to its back but the shaft','p75',{actions:[...ACT.climb,...ACT.strikes],
 reject:g=>inShaft(g,216,232,104,136),score:g=>(g.jailers[0].alive?1000:0)-g.p.x,beam:500,maxDepth:70});
// 76 Stagger: no way round, and the shield turns every cut; only a parried thrust drops it.
K.never('Stagger: every cut, dash or jump at the shield without a parry','p76',
 X(range(60,120,6),['s','rs','us','ds'],[0,6,14],['','x','rx']).map(([w,s,j,d])=>[[w,'r'],...(j?[[j,'rj']]:[]),[1,s],[4,''],...(d?[[5,d]]:[]),[1,'rs'],[30,''],[1,'rs'],[200,'r']]));
// 77 Recoil Well: the ledge is higher than a jump and a dash, and its face is thorned.
K.never('Recoil Well: jump and dash without the pod','p77',
 X(range(0,60,4),[8,12,16],['u','ru','lu'],[0,4,8],['','rgu','lgu']).map(([w,j,d,k,g])=>[[w,'r'],[j,'j'],[k,''],[5,d+'x'],[40,g],[160,'r']]));
K.hunt('Recoil Well: no way up without the pod','p77',{actions:ACT.climb,reject:(g,ev)=>ev.some(e=>e.type==='recoil'),
 score:g=>g.p.y<70?-g.p.x:Math.hypot(g.p.x-150,g.p.y-60),beam:600,maxDepth:60});
// 78 Back Door: the cell has no door; the only way in is the portal, and you land behind it. Dawdle there and it turns.
K.never('Back Door: land behind it, wait until it turns, then cut','p78',
 X(range(46,90,4),[8,12,16],['ls','s']).map(([w,l,s])=>[[12,'r'],[1,'rdq'],[1,''],[14,'r'],[w,''],[l,'l'],[1,s],[240,'r']]));
K.never('Back Door: a portal anywhere but the floor below does not open','p78',
 X(range(0,40,2),['r','ru','u','d']).map(([w,d])=>[[w,'r'],[1,d+'q'],[1,''],[60,'r'],[200,'r']]));
K.hunt('Back Door: no way behind it but through the portal','p78',{actions:[...ACT.basic,...ACT.strikes,[[1,'p']],[[1,'rp']]],
 reject:(g,ev)=>ev.some(e=>e.type==='portal-pass'),score:g=>(g.jailers[0].alive?1000:0)-g.p.x,beam:300,maxDepth:50});
// 80 Two Wardens: take the quick one first; the slow one first means a parry.
K.never('Two Wardens: the slow one first, with no parry, never gets out','p80',
 X([104,108,112],[12,16,20,24,28],[0,2,4],[0,4,8,12,16,24],[0,4,8,12,20,30],['rs','s']).map(([w,a,b,c,d,s])=>[[w,'r'],[a,''],[20+b,'l'],[1,'ls'],[c,''],[d,'r'],[1,s],[30,''],[1,'rs'],[300,'r']]));
// 79 Up and Over: the crawl is above a jump and a dash; its face and the far wall are thorned.
K.never('Up and Over: no way onto the crawl without the pod','p79',
 X(range(0,80,10),[8,12,16],['u','ru','lu'],[0,4,8],['','rgu','lgu']).map(([w,a,d,k,g])=>[[w,'r'],[a,'j'],[k,''],[5,d+'x'],[40,g],[200,'r']]),
 r=>r.g.p.y+11<=96&&r.g.p.x>=96);
K.hunt('Up and Over: no way behind it without the pod','p79',{actions:[...ACT.climb,...ACT.strikes],reject:(g,ev)=>ev.some(e=>e.type==='recoil'),
 goal:g=>!g.jailers[0].alive||g.exited,score:g=>g.p.y<96?-g.p.x:Math.hypot(g.p.x-96,g.p.y-80)+500,beam:600,maxDepth:50});
// 81 On the Lip: face to face on the lip, the thrust must be parried.
K.never('On the Lip: up by the pod, but no parry','p81',
 X([52,54,56],[10,14,18],['ux','rux'],range(0,30,3),['rs','s','us','rx']).map(([w,d,e,k,a])=>[[w,'r'],[14,'j'],[5,'dx'],[d,''],[5,e],[k,'r'],[1,a==='rx'?'rx':a],[10,'r'],[1,'rs'],[300,'r']]));
K.never('On the Lip: no way up without the pod','p81',
 X(range(0,80,8),[8,12,16],['u','ru'],[0,4,8]).map(([w,a,d,k])=>[[w,'r'],[a,'j'],[k,''],[5,d+'x'],[40,'r'],[300,'r']]));
// 82 The Sentence. Roof Door: the stone is above a jump and a dash. Sentence: nowhere to stand in front, so parry in the air.
K.never('Roof Door: the portal in the roof is out of reach without the pod','p82a',
 X(range(20,32,2),[8,12,16],['u','ru','lu'],[0,4,8]).map(([w,a,d,k])=>[[w,'r'],[1,'uq'],[1,''],[a,'j'],[k,''],[5,d+'x'],[60,''],[300,'r']]));
K.hunt('Roof Door: no way behind it but the roof','p82a',{actions:[...ACT.basic,...ACT.strikes,[[1,'uq'],[1,'']],[[1,'p']]],reject:(g,ev)=>ev.some(e=>e.type==='portal-pass'),
 score:g=>(g.jailers[0].alive?1000:0)-g.p.x,beam:300,maxDepth:50});
K.never('Sentence: up by the pod to the first jailer, but no parry','p82b',
 X([46,48,50],[14,18],['ux','rux'],range(0,30,3),['rs','s','rx','']).map(([w,d,e,k,a])=>[[w,'r'],[14,'j'],[5,'dx'],[d,''],[5,e],[k,'r'],...(a?[[a==='rx'?5:1,a]]:[]),[10,'r'],[1,'rs'],[300,'r']]));
K.done();
