// Part VIII · Frostfell (levels 83–90, 7.254): routes, the wrong answers that fail, and the skips that aren't there.
// "Without X" hunts run the same room with one device taken out (a blanked tile, or no wind / no moth) and
// expect the adversarial search to find no way out: each device in each room is load-bearing.
import {kit,X,range} from './pcore-verify-kit.mjs';
import {ACT} from './pcore-search.mjs';
import {Rooms} from './pcore-tape.mjs';
const K=kit('VIII');
K.routes();

/* A copy of a room with some tiles blanked and/or def fields replaced, appended to the room list. */
function without(id,tag,{blank=[],def={}}={}){
 const d=Rooms.all.find(r=>r.id===id),m=d.map.map(r=>r.split(''));
 for(const [c,r] of blank)m[r][c]='.';
 const v={...d,...def,id:`${id}-no-${tag}`,map:m.map(r=>r.join(''))};Rooms.all.push(v);return v.id;
}
const row=(c0,c1,r)=>range(c0,c1).map(c=>[c,r]);
const inWind=g=>(g.winds||[]).some(z=>g.p.x<z.x+z.w&&g.p.x+8>z.x&&g.p.y<z.y+z.h&&g.p.y+11>z.y);
const climbAct=ACT.climb,H={beam:400,maxDepth:70};

console.log('Part VIII: tempting wrong strategies fail');

// 83 Frost Feather: a jump and a dash, however timed and aimed, never reach the thorn-faced ledge.
K.never('Frost Feather: one jump and one dash, any timing and aim','p83',
 X(range(20,44,4),[1,8,14],range(0,30,3),['u','ru','r']).map(([a,j,t,d])=>[[a,'r'],[j,'rj'],[t,'r'],[6,d+'x'],[120,'r']]));
K.never('Frost Feather: a super off the lip, then an up-dash','p83',
 X(range(20,40,4),[4,6,8],range(4,24,4),['u','ru']).map(([a,k,t,d])=>[[a,'r'],[k,'rx'],[14,'rj'],[t,'r'],[6,d+'x'],[120,'r']]));
K.hunt('Frost Feather: no way up without the feather',without('p83','feather',{blank:[[14,15]]}),{actions:climbAct,...H});

// 84 Black Ice: a floe will not hold you still. Land, stop (or brake), then go on: you slide into the thorns.
K.never('Black Ice: land on the first floe and stand, or brake, before the next jump','p84',
 X([16,20],range(24,48,4),['','l'],range(14,30,4)).map(([a,w,k,n])=>[[a,'r'],[14,'rj'],[w,'r'],[n,k],[14,'rj'],[20,'r'],[14,'rj'],[20,'r'],[14,'rj'],[20,'r'],[14,'rj'],[60,'r']]));

// 85 Updraft: spend the dash getting into the wind and there is nothing left at the top.
K.never('Updraft: dash into the wind, then ride it up','p85',
 X([16,20,24],range(0,24,3),['r','ru','u'],[20,40,60]).map(([a,t,d,h])=>[[a,'r'],[14,'rj'],[t,'r'],[6,d+'x'],[30,'r'],[h,''],[6,'rux'],[140,'r']]));
K.hunt('Updraft: no way up without the wind',without('p85','wind',{def:{winds:[]}}),{actions:climbAct,...H});

// 86 One at a Time: carry the first feather up past the second (by a dash) and the second ignores you.
K.never('One at a Time: dash up past the second feather still carrying the first','p86',
 X(range(0,12,3),['u','ru'],range(0,20,4),range(0,16,4)).map(([d1,dd,d2,d3])=>[[20,'r'],[14,'rj'],[d1,'r'],[6,dd+'x'],[d2,'r'],[14,'rj'],[d3,'r'],[6,'rux'],[6,'r'],[6,'rux'],[100,'r']]));
{const sc=g=>g.p.y+Math.max(0,200-g.p.x);
 K.hunt('One at a Time: no way up without the second feather',without('p86','second',{blank:[[14,12]]}),{actions:climbAct,score:sc,...H});
 K.hunt('One at a Time: no way up without the crystal',without('p86','crystal',{blank:[[19,7]]}),{actions:climbAct,score:sc,...H});}

// 87 Kite: no dash in this room; without the lantern the updraft only slows your fall. The chimney is wide
// and thorned so there are no wall-jump chains up it.
K.never('Kite: ride the updraft empty-handed, jumping from anywhere on the ledge','p87',
 X(range(16,48,4),[0,10,20,40],['','r','l'],[0,6,14]).map(([a,w,k,j])=>[[a,'r'],[14,'rj'],[w,k],...(j?[[j,'j']]:[]),[160,'r']]));
K.hunt('Kite: no way up without the lantern',without('p87','lantern',{blank:[[5,19]]}),{actions:climbAct,score:g=>g.p.y+Math.max(0,150-g.p.x),...H});

// 88 Faultline: wait on a stone and it drops you into the thorns.
const p88a=[[14,'r'],[14,'rj'],[8,'r'],[6,'rx'],[10,'r']];
K.never('Faultline: stop on the first stone to line up the next jump','p88',
 X(range(20,60,5),['','l','r']).map(([n,k])=>[...p88a,[n,k],[14,'rj'],[8,'r'],[6,'rux'],[18,''],[4,'r'],[14,'rj'],[4,'r'],[14,'rj'],[6,'ux'],[80,'r']]));
K.hunt('Faultline: no way up without the feather',without('p88','feather',{blank:[[27,8]]}),{actions:climbAct,score:g=>-g.p.x*2+g.p.y,...H});

// 89 Moth Wing: the feather must last to the far wall; only the moth keeps you off the ground.
K.never('Moth Wing: pass the moth by, with the feather and the dash in any order','p89',
 X(range(0,16,4),['r','ru'],range(0,24,4),['ru','u']).map(([a,d1,b,d2])=>[[20,'r'],[14,'rj'],[a,'r'],[6,d1+'x'],[b,'r'],[14,'rj'],[4,'r'],[6,d2+'x'],[100,'r']]));
K.never('Moth Wing: spend the feather on the way to the moth','p89',
 X(range(1,13,3),range(4,20,4),range(8,24,4)).map(([a,b,c])=>[[20,'r'],[14,'rj'],[a,'r'],[14,'rj'],[b,'r'],[6,'rx'],[c,'r'],[1,'ds'],[20,'r'],[6,'rux'],[12,'r'],[14,'rj'],[100,'r']]));
K.hunt('Moth Wing: no way across without the moth',without('p89','moth',{def:{foes:[]}}),{actions:climbAct,...H});

// 90 Muster Crown: spend the dash reaching the wind and nothing takes you to the stone; from the stone, a jump
// and a dash (any timing, walking off its edge included) fall short of the crown without the feather.
const p90a=[[10,'r'],[14,'rj'],[16,'r'],[14,'rj']],p90b=[[10,'r'],[20,''],[4,'r'],[6,'rx'],[20,'r']];
K.never('Muster Crown: dash into the wind off the floe','p90',
 X(range(0,20,2),['r','ru','u'],[10,20,40],['r','rd']).map(([a,d,w,d2])=>[...p90a,[a,'r'],[6,d+'x'],[10,'r'],[w,''],[4,'r'],[6,d2+'x'],[32,'r'],[1,''],[14,'rj'],[6,'r'],[14,'rj'],[8,'r'],[6,'ux'],[100,'r']]));
K.never('Muster Crown: from the stone, one jump and one dash','p90',
 X(range(8,32,4),['r',''],[4,8,14],range(0,16,4),['u','ru','r']).map(([a,k,j,c,d])=>[...p90a,...p90b,[a,k],[j,'rj'],[c,'r'],[6,d+'x'],[100,'r']]));
{const sc=g=>g.p.y*2-g.p.x;
 K.hunt('Muster Crown: no way up without the feather',without('p90','feather',{blank:[[31,8]]}),{actions:climbAct,score:sc,...H});
 K.hunt('Muster Crown: no way up without the fractured stone',without('p90','stone',{blank:row(26,28,13)}),{actions:climbAct,score:sc,...H});
 K.hunt('Muster Crown: no way up without the wind',without('p90','wind',{def:{winds:[]}}),{actions:climbAct,score:sc,...H});}
K.done();
