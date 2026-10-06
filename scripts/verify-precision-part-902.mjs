// Bonus · Void Stone (labels V1–V6, 7.255): the device's rules, the routes, and the wrong answers that fail.
//   node scripts/verify-precision-part-902.mjs            (ONLY=bv3,bv5 runs a subset of rooms while authoring)
// Void stone (bladefall-pcore-dev-void.js, glyph V) is solid to everything, but a dash that meets it carries the
// knight straight through at dash speed. Out the far side: the dash back, the speed kept, and (off a level or
// falling exit) six frames of jump grace. Rock, the room's edge or any solid body in the way inside is fatal.
import {kit,X,range} from './pcore-verify-kit.mjs';
import {ACT} from './pcore-search.mjs';
import {Core,expand,keysToInput} from './pcore-tape.mjs';
const K=kit('BV');
const ONLY=process.env.ONLY?process.env.ONLY.split(','):null,on=id=>!ONLY||ONLY.includes(id);
const say=K.say;

/* ---------------------------------------------------------------- rule fixtures */
// A 40x23 box: walls, a floor at row 20, P at (px,py); `put` edits cells.
function box({P=[3,19],put=[],def={}}={}){
 const m=[];for(let r=0;r<23;r++)m.push((r===0||r>=21?'#'.repeat(40):'#'+'.'.repeat(38)+'#').split(''));
 for(let c=0;c<40;c++)m[20][c]='#';
 m[P[1]][P[0]]='P';
 for(const [c,r,ch]of put)m[r][c]=ch;
 return {id:'fx',name:'fixture',map:m.map(r=>r.join('')),...def};
}
const rect=(c0,r0,w,h,ch)=>{const o=[];for(let r=r0;r<r0+h;r++)for(let c=c0;c<c0+w;c++)o.push([c,r,ch]);return o;};
function play(def,tape){
 const g=Core.createGame([def]);const log=[];
 for(const k of expand(tape)){Core.step(g,keysToInput(k));
  log.push({x:g.p.x,y:g.p.y,vx:g.p.vx,vy:g.p.vy,st:g.p.state,gr:g.p.onGround,d:g.p.dashes,ev:g.events.map(e=>e.type),cause:g.events.find(e=>e.type==='death')?.cause});g.events.length=0;}
 return {g,log,ev:log.flatMap(t=>t.ev),at:t=>log.findIndex(l=>l.ev.includes(t))};
}
if(!ONLY){
console.log('Void stone: rules');
{
 // Pass-through: a wall of void from floor to ceiling, three tiles thick.
 const wall=box({P:[3,19],put:rect(12,1,3,19,'V')});
 const r=play(wall,[[30,'r'],[5,'rx'],[40,'r']]);
 say(r.ev.includes('void-in')&&r.ev.includes('void-out')&&r.g.p.x>120&&!r.ev.includes('death'),`a dash into void stone comes out the far side (x ${r.g.p.x})`);
 const walk=play(wall,[[120,'r']]);say(walk.g.p.x<=88&&!walk.ev.includes('void-in'),'walking or jumping into it: it is solid');
 const jump=play(wall,[[30,'r'],[1,'rj'],[14,'rj'],[60,'r']]);say(jump.g.p.x<=88&&!jump.ev.includes('void-in'),'a jump into it stops at its face');
 // Exit in the air: the dash is back before any ground, and the speed is kept.
 const air=box({P:[3,15],put:[...rect(1,16,6,4,'#'),...rect(8,12,3,5,'V')]});
 const a=play(air,[[20,'r'],[5,'rx'],[30,'r']]);const o=a.at('void-out');
 say(o>0&&a.log[o].d===1&&!a.log[o].gr,'coming out in the air gives the dash back');
 say(o>0&&a.log[o].vx===240&&a.log.slice(o,o+10).every(t=>t.vx>=230||t.gr),`and keeps the dash's speed through the air (${a.log[o]?.vx} px/s for ten frames)`);
 const twice=play(air,[[20,'r'],[5,'rx'],[8,'r'],[5,'rux'],[20,'r']]);
 say(twice.ev.filter(e=>e==='dash').length===2,'and that dash can be spent at once');
 // Buffered: a dash pressed inside fires on the frame you come out.
 const buf=play(air,[[20,'r'],[5,'rx'],[4,'r'],[5,'rx'],[20,'r']]);
 const bo=buf.at('void-out');
 say(bo>0&&buf.log[bo].st==='dash','a dash pressed inside, just before the far face, fires as you come out');
 // Fatal: rock behind the far face, or the room's edge.
 const rock=box({P:[3,19],put:[...rect(12,1,3,19,'V'),...rect(15,1,1,19,'#')]});
 const k=play(rock,[[30,'r'],[5,'rx'],[40,'r']]);const kd=k.log.find(t=>t.cause);
 say(kd&&kd.cause==='void','rock in the way inside the void is fatal');
 const edge=box({P:[33,19],put:rect(36,1,3,19,'V')});
 const e=play(edge,[[5,'rx'],[40,'r']]);say(e.log.some(t=>t.cause==='void'),'so is the room’s wall');
 const part=box({P:[3,19],put:[...rect(12,1,3,19,'V'),...rect(15,1,1,14,'#')]});
 say(!play(part,[[30,'r'],[5,'rx'],[60,'r']]).ev.includes('death'),'rock behind only part of the face: the clear line comes out alive');
 // Upward: a slab overhead, entered from below, throws you higher than a jump; no ground grace after it.
 const slab=box({P:[10,19],put:rect(8,12,5,2,'V')});
 const u=play(slab,[[1,''],[1,'j'],[10,'j'],[5,'ux'],[60,'']]);const uo=u.at('void-out');
 const top=Math.min(...u.log.slice(uo).map(t=>t.y));
 say(uo>0&&u.log[uo].vy<=-220&&96-11-top>=28,`an upward exit throws you ${96-11-top} px above the slab (a jump is about 28)`);
 const uj=play(slab,[[1,''],[1,'j'],[10,'j'],[5,'ux'],[2,''],[1,'j'],[30,'']]);
 const ujo=uj.at('void-out');say(ujo>0&&!uj.log.slice(ujo-1,ujo+6).some(t=>t.ev.includes('jump')),'a jump pressed inside an upward pass does not cut the throw short');
 say(u.log.slice(uo).some(t=>t.gr&&t.y===85),'and you land on top of it: void stone is ground to stand on');
 // Level exit: six frames of jump grace, as if jumping off the void's edge.
 const g6=play(air,[[20,'r'],[5,'rx'],[11,'r'],[1,'rj'],[10,'rj'],[20,'r']]);const go=g6.at('void-out'),gj=g6.at('jump');
 say(go>0&&gj>go&&gj-go<=6&&!g6.log[gj].gr,`a jump just after a level exit jumps off the void's edge (${gj-go} frames after)`);
 const g9=play(air,[[20,'r'],[5,'rx'],[17,'r'],[1,'rj'],[10,'rj'],[20,'r']]);const g9o=g9.at('void-out'),g9j=g9.at('jump');
 say(g9o>0&&(g9j<0||g9.log[g9j-1].gr),'but not nine frames after (only from the ground again)');
 // Diagonal: dash down-right onto its top; through and out the far face at an angle, speed kept.
 const diag=box({P:[3,10],put:[...rect(1,11,5,1,'#'),...rect(8,13,6,4,'V')]});
 const d=play(diag,[[22,'r'],[5,'rdx'],[40,'r']]);const di=d.at('void-in'),dout=d.at('void-out');
 say(di>0&&dout>di&&d.log[dout].vx>150&&d.log[dout].vy>150&&d.log[dout].x>d.log[di].x+30,`a diagonal dash goes through diagonally (out at ${Math.round(d.log[dout]?.vx)}, ${Math.round(d.log[dout]?.vy)} px/s)`);
 // Climbing its face.
 const cl=box({P:[10,19],put:rect(12,8,3,12,'V')});
 const c=play(cl,[[1,''],[1,'rjg'],[14,'rjg'],[20,'rgu']]);say(c.log.some(t=>t.st==='climb'),'you can hold and climb its face');
 // Thorns on its far face pointing the way you go are safe; pointing back at you, they kill.
 const thW=box({P:[3,19],put:[...rect(12,1,3,19,'V'),...rect(15,1,1,19,'>')]});
 say(!play(thW,[[30,'r'],[5,'rx'],[40,'r']]).ev.includes('death'),'thorns on the far face pointing your way: safe to come out through');
 const thA=box({P:[3,19],put:[...rect(12,1,3,19,'V'),...rect(15,1,1,19,'<')]});
 const ta=play(thA,[[30,'r'],[5,'rx'],[40,'r']]);say(ta.log.some(t=>t.cause==='spikes'),'thorns pointing back at you: fatal');
 // The lantern rests on it; the blade does nothing to it.
 const lan=box({P:[9,19],put:[...rect(8,15,4,1,'V'),[10,12,'l']]});
 const L=play(lan,[[40,'']]);const lt=L.g.ents.find(x=>x.type==='lantern');say(lt.y===112&&!lt.returning,'the lantern rests on it');
 // A dash through a gravity prism straight into a void: flipped, then through.
 const pr=box({P:[3,19],put:[[6,18,'Q'],[6,19,'Q'],...rect(7,1,3,19,'V')]});
 const q=play(pr,[[2,''],[5,'rx'],[40,'r']]);
 say(q.ev.includes('gravity')&&q.ev.includes('void-out')&&!q.ev.includes('death')&&q.g.flipped,'a prism then a void in one dash: gravity turns, then the dark carries you through');
}
K.routes();
}
console.log('Bonus · Void Stone: tempting wrong strategies fail');

const vin=ev=>ev.some(e=>e.type==='void-in');
const voidKey=g=>{const p=g.p,j=g.jailers&&g.jailers[0];return [p.x>>1,p.y>>1,Math.round(p.vx/30),Math.round(p.vy/30),p.state,p.dashes,p.onGround?1:0,j?(j.alive?j.dir:'x')+j.state:''].join('|');};

// V1 Into the Night: one dash takes you through the first wall; only the dash it gives back takes you through the second.
if(on('bv1')){
K.never('Into the Night: through the first wall, then jump or wait for ground','bv1',
 X(range(20,60,4),[0,2,4,8,12],['','j','rj']).map(([w,d,k])=>[[w,'r'],[5,'rx'],[d,'r'],...(k?[[1,k],[12,k]]:[]),[200,'r']]));
K.hunt('Into the Night: no way past the walls without the dark','bv1',{actions:ACT.climb,reject:(g,ev)=>vin(ev),key:voidKey,beam:250,maxDepth:40});
}

// V2 Kept Speed: the shelf is higher than a jump and a dash, and the thorns longer than a dash and a jump from the floor.
if(on('bv2')){
K.never('Kept Speed: jump and dash across the thorns from the floor','bv2',
 X(range(60,130,5),[0,4,8,12],['r','ru'],[0,1]).map(([w,j,d,again])=>[[w,'r'],...(j?[[1,'rj'],[j,'rj']]:[]),[5,d+'x'],[6,'r'],...(again?[[1,'rj'],[12,'rj']]:[]),[200,'r']]));
K.never('Kept Speed: jump and dash up the shelf without the dark slab','bv2',
 X(range(0,90,6),[8,12,14],['u','ru','lu']).map(([w,j,d])=>[[w,'r'],[1,'j'],[j,'j'],[5,d+'x'],[30,'rgu'],[200,'r']]),r=>r.g.p.y<=60&&!vin(r.events));
K.hunt('Kept Speed: no way up and across without the dark','bv2',{actions:ACT.climb,reject:(g,ev)=>vin(ev),key:voidKey,
 score:g=>g.p.y<=60?-g.p.x:200+g.p.y-g.p.x/4,beam:250,maxDepth:45});
}

// V3 Which Way In: straight right comes out short of the ledge, whose face is thorned; straight up comes down on
// the crown of thorns; down-right comes out into the pit. A second dash on the way out does not rescue any of them.
if(on('bv3')){
K.never('Which Way In: straight in, straight up or down-right, with any second dash','bv3',
 X(range(28,48,4),[0,4,8,12],['r','u','rd'],[0,4,8,12],['','rx','rux','ux']).map(([w,j,d,k,a])=>[[w,'r'],[1,'rj'],[j,'rj'],[5,d+'x'],[k,'r'],...(a?[[5,a]]:[]),[150,'r']]));
K.hunt('Which Way In: no way onto the ledge without an up-right pass','bv3',{actions:ACT.climb,
 reject:(g,ev)=>ev.some(e=>e.type==='void-in'&&e.dx>0&&e.dy<0),key:voidKey,beam:400,maxDepth:45});
}

// V4 Rock Behind: from the floor the first wall's dark leads into rock; jumped into at the top of a jump (the line
// that worked on the first wall), the second wall's dark leads into rock.
if(on('bv4')){
K.never('Rock Behind: dash into the first wall from the floor, or up or down a slant','bv4',
 X(range(20,60,4),['r','ru','rd'],[0,1]).map(([w,d,j])=>[[w,'r'],...(j?[[1,'rj'],[3,'rj']]:[]),[5,d+'x'],[200,'r']]));
const past1=[[40,'r'],[1,'j'],[10,'j'],[5,'rx'],[100,'r']];
K.never('Rock Behind: take the second wall at the top of a jump, as the first','bv4',
 X(range(0,20,2),[4,8,12,14],['rx','rux']).map(([w,j,d])=>[...past1,[w,'l'],[1,'rj'],[j,'rj'],[5,d],[100,'r']]));
K.hunt('Rock Behind: no way past without the clear lines','bv4',{actions:ACT.climb,reject:(g,ev)=>vin(ev),key:voidKey,beam:300,maxDepth:45});
}

// V5 Behind the Shield: the front is thorns under a roof of night; cuts, dashes and parries from the floor glance
// or die. Coming down through the roof straight onto him is fatal (his body is solid); behind him, it lands you there.
if(on('bv5')){
K.never('Behind the Shield: at him from the front, with a jump, dash, cut or parry','bv5',
 X(range(30,70,4),[0,6,12],['r','ru',''],['s','p','x']).map(([w,j,d,a])=>[[w,'r'],...(j?[[j,'rj']]:[]),[1,a==='x'?d+'x':d+a],[4,'r'],[1,'rs'],[20,'r'],[1,'p'],[10,''],[1,'rs'],[200,'r']]));
const up=[[26,'r'],[1,'rjg'],[14,'rjg'],[60,'rgu']];
K.never('Behind the Shield: come down through the roof on top of him','bv5',
 range(30,41,1).map(w=>[...up,[w,'r'],[5,'dx'],[12,''],[2,'l'],[1,'ls'],[30,''],[90,'r']]));
// Any way out that does not come down through the roof behind him (body x 158–170): the floor, the shield's face,
// a parry, or the roof in front of him or on top of him.
K.hunt('Behind the Shield: no way out but down through the dark behind him','bv5',{actions:[...ACT.climb,...ACT.strikes,[[1,'p']],[[1,'rp']]],
 reject:(g,ev)=>ev.some(e=>e.type==='void-in'&&e.x>=170),key:voidKey,score:g=>(g.jailers[0].alive?1000:0)-g.p.x+(g.p.y<110?-200:0),beam:300,maxDepth:55});
}

// V6 Night Crossing: no ground from the first ledge to the last. Skip any one of the four dashes and the next
// face stops you over the thorns.
if(on('bv6')){
const parts=[[[10,'r'],[5,'rx']],[[16,'r'],[5,'rux']],[[20,'r'],[5,'rx']],[[20,'r'],[5,'rx']]];
K.never('Night Crossing: miss out any one dash, waiting a little longer instead','bv6',
 X([0,1,2,3],[0,6,12,20]).map(([skip,w])=>[...parts.flatMap((p,i)=>i===skip?[[p[0][0]+5+w,'r']]:p),[100,'r']]));
K.hunt('Night Crossing: nowhere to stand between the ledges','bv6',{actions:ACT.climb,key:voidKey,
 goal:g=>g.p.state==='normal'&&g.p.onGround&&g.p.x>40&&g.p.x<264,beam:300,maxDepth:40});
K.hunt('Night Crossing: no way across without the dark','bv6',{actions:ACT.climb,reject:(g,ev)=>vin(ev),key:voidKey,beam:300,maxDepth:40});
}
K.done();
