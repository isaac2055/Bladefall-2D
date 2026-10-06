// Precision Core device rules (7.254+): one fixture per rule of every device added after Part VI.
// Rooms are built in code; each check replays a short tape and measures the rule.
import {Core,expand,keysToInput} from './pcore-tape.mjs';
let fail=0,pass=0;const say=(ok,msg)=>{ok?pass++:fail++;console.log((ok?'  ok   ':'  FAIL ')+msg);};
/* A 40x23 box room: walls, a floor at row 20, P at (px,19); `put` edits cells. */
export function box({P=[3,19],put=[],def={}}={}){
 const m=[];for(let r=0;r<23;r++)m.push((r===0||r>=21?'#'.repeat(40):'#'+'.'.repeat(38)+'#').split(''));
 for(let c=0;c<40;c++)m[20][c]='#';
 m[P[1]][P[0]]='P';
 for(const [c,r,ch]of put)m[r][c]=ch;
 return {id:'fx',name:'fixture',map:m.map(r=>r.join('')),...def};
}
export function play(def,tape,watch){
 const g=Core.createGame([def]);const log=[];
 for(const k of expand(tape)){Core.step(g,keysToInput(k));log.push({x:g.p.x,y:g.p.y,vx:g.p.vx,vy:g.p.vy,st:g.p.state,gr:g.p.onGround,d:g.p.dashes,ev:g.events.map(e=>e.type),w:watch?watch(g):null});g.events.length=0;}
 return {g,log,ev:log.flatMap(t=>t.ev)};
}
const row=(r,c0,c1,ch)=>{const o=[];for(let c=c0;c<=c1;c++)o.push([c,r,ch]);return o;};

console.log('Gaol: jailers and pressure pods');
{
 // A pressure pod on the floor: dash down into it from above and you go up, farther than a pod strike.
 const def=box({P:[10,19],put:[[10,17,'R']]});
 const r=play(def,[[2,''],[10,'j'],[5,'dx'],[40,'']]);
 const top=Math.min(...r.log.slice(18).map(t=>t.y));
 say(r.ev.includes('recoil')&&top<r.log[0].y-40,`down into a pressure pod throws you up (rose to ${r.log[0].y-top} px above the floor)`);
 say(r.log.some((t,i)=>i>0&&t.ev.includes('recoil')&&t.d===1),'the pressure pod returns the dash');
 // Sideways: dash right into it, come out left, and keep the speed in the air.
 const s=box({P:[10,19],put:[[14,17,'R']]});
 const q=play(s,[[2,''],[10,'j'],[5,'rx'],[14,'']]);
 const after=q.log.slice(q.log.findIndex(t=>t.ev.includes('recoil'))+1);
 say(after.length&&after[0].vx<-200&&after.slice(0,8).every(t=>t.gr||t.vx<-200),`sideways in, sideways back out at speed (${after[0]?.vx|0} px/s, kept in the air)`);
 const noDash=play(s,[[2,''],[10,'j'],[40,'r']]);say(!noDash.ev.includes('recoil'),'touching a pressure pod without dashing does nothing');
}
{
 // A jailer facing left on the floor: the blade from the front glances; from behind it fells it.
 const def=box({P:[5,19],def:{jailers:[{x:20,y:19,dir:-1,turn:0}]},put:[[30,19,'c'],[34,17,'G'],[34,18,'G'],[34,19,'G']]});
 const front=play(def,[[64,'r'],[1,'rs'],[20,'']]);
 say(front.ev.includes('guard-block')&&!front.ev.includes('jailer-fell'),'a cut at the shield glances off');
 const g0=Core.createGame([def]);say(g0.jailers.length===1,'jailer placed');
 // Walk into its reach and it thrusts.
 const hit=play(def,[[70,'r'],[40,'']]);say(hit.ev.includes('death'),'standing in its reach gets you speared');
 // Parry the thrust: it staggers, and then a cut from the front fells it.
 const idx=hit.log.findIndex(t=>t.ev.includes('enemy-tell'));
 const par=play(def,[[idx+1,'r'],[10,''],[1,'p'],[6,''],[1,'rs'],[20,'']]);
 say(par.ev.includes('parry')&&par.ev.includes('jailer-fell'),'parry the thrust, then cut it while the shield is down');
 // From behind: jump over it and cut back.
 const beh=box({P:[5,19],def:{jailers:[{x:20,y:19,dir:1,turn:0}]}});
 const b=play(beh,[[64,'r'],[1,'rs'],[20,'']]);say(b.ev.includes('jailer-fell'),'a cut at its back fells it');
 const wall=play(def,[[64,''],[120,'r']]);say(wall.g.p.x<150,'its body blocks the way: you cannot walk through a jailer');
 // Gate held while it stands.
 const gr=play(def,[[200,'r']]);const gate=gr.g.ents.find(e=>e.type==='gate');say(gate&&!gate.open,'a jailer with keys keeps the gate shut');
 // Turning: stand behind it and it turns after its commit time.
 const tr=box({P:[30,19],def:{jailers:[{x:20,y:19,dir:-1,turn:30}]}});
 const tt=play(tr,[[60,'']]);say(tt.ev.includes('jailer-turn')&&tt.g.jailers[0].dir===1,'standing behind it, it turns after its commit time');
}

console.log('Frostfell: ice, wind and the frost feather');
{
 const ice=box({P:[3,19],put:row(20,1,38,'I')});
 const a=play(ice,[[90,'r'],[90,'']]);const b=play(box({P:[3,19]}),[[90,'r'],[90,'']]);
 const slideA=a.log[179].x-a.log[89].x,slideB=b.log[179].x-b.log[89].x;
 say(slideA>slideB+20,`on ice you slide on after letting go (${slideA} px against ${slideB} on rock)`);
 const start=play(ice,[[20,'r']]),startB=play(box({P:[3,19]}),[[20,'r']]);
 say(start.g.p.x<startB.g.p.x,'on ice you gather speed slowly');
 const w=box({P:[3,19],def:{winds:[{c:1,r:1,w:38,h:19,dx:60}]}});const wr=play(w,[[60,'']]);
 say(wr.g.p.x>=3*8+50,`wind pushes a standing knight (${wr.g.p.x-24} px in 1 s at 60 px/s)`);
 const f=box({P:[10,19],put:[[10,16,'f']]});
 const fr=play(f,[[2,''],[14,'j'],[10,'j'],[1,''],[14,'j'],[40,'']]);
 const top1=Math.min(...fr.log.slice(0,26).map(t=>t.y)),top2=Math.min(...fr.log.map(t=>t.y));
 say(fr.ev.includes('feather')&&fr.ev.includes('feather-jump')&&top2<top1-10,`the frost feather is a second jump in the air (rose ${top1-top2} px more)`);
 const nf=play(box({P:[10,19]}),[[2,''],[14,'j'],[10,'j'],[1,''],[14,'j'],[40,'']]);say(!nf.ev.includes('feather-jump'),'without a feather there is no second jump');
 const melt=play(f,[[2,''],[14,'j'],[40,''],[1,''],[14,'j'],[2,''],[1,''],[10,'j']]);say(melt.ev.includes('feather-melt')&&melt.ev.filter(e=>e==='feather-jump').length===0,'the feather melts when you land');
}
console.log('White Court: water and freezing');
{
 const pool=[];for(let r=15;r<=19;r++)for(let c=12;c<=24;c++)pool.push([c,r,'w']);
 const def=box({P:[3,19],put:[...pool,...row(20,1,38,'#')],def:{}});
 // Walk into the water: sink slowly.
 const r=play(def,[[80,'r'],[30,'']]);say(r.ev.includes('splash'),'walking into water splashes');
 const d=box({P:[3,14],put:[...row(15,1,11,'#'),...pool,...row(15,25,38,'#')]});
 // stand at the edge, jump and cut down into the pool: it freezes and you can stand on it.
 const fr=play(d,[[46,'r'],[2,'rj'],[1,'rds'],[80,'r']]);
 say(fr.ev.includes('freeze'),'a cut into water freezes the pool');
 say(fr.g.p.y===109&&fr.g.p.x>=200,`the frozen pool holds you up (x ${fr.g.p.x}, y ${fr.g.p.y})`);
 const th=play(d,[[46,'r'],[2,'rj'],[1,'rds'],[40,'r'],[300,'']]);say(th.ev.includes('thaw'),'the ice thaws on its clock');
 const sw=play(def,[[80,'r'],[30,''],[1,''],[12,'j'],[1,''],[12,'j']]);say(sw.ev.includes('stroke'),'a jump under water is a stroke');
}
console.log('Emberdeep: heat slabs');
{
 const def=box({P:[3,19],put:[...row(20,10,13,'E')],def:{slabs:[{stone:30,molten:30,glass:30}]}});
 const g=Core.createGame([def]);const seen=new Set();for(let i=0;i<100;i++){Core.step(g,keysToInput(i===0?'r':''));seen.add(g.slabs[0].state);}
 say(seen.has('stone')&&seen.has('molten')&&seen.has('glass'),'a slab cycles stone, molten, glass');
 const walk=play(def,[[80,'r']]);say(walk.ev.includes('death'),'walking onto a molten slab is death');
}
console.log('Foundry: anvils, belts and moulds');
{
 const def=box({P:[10,19],put:[[10,17,'N']]});
 const r=play(def,[[1,''],[40,'']]);
 const a=play(box({P:[10,15],put:[[10,17,'N'],...row(16,9,11,'.')]}),[[2,''],[1,'j'],[3,''],[1,'ds'],[40,'j']]);
 const rise=a.log[0].y-Math.min(...a.log.map(t=>t.y));say(a.ev.includes('anvil')&&rise>50,`a downward cut on an anvil throws you high (${rise} px)`);
 const belt=box({P:[10,19],put:row(20,5,30,'}')});const b=play(belt,[[60,'']]);say(b.g.p.x>=80+50,`a belt carries a standing knight (${b.g.p.x-80} px in 1 s)`);
 const m=box({P:[10,19],put:[[12,19,'U']]});const mr=play(m,[[2,''],[1,'rs'],[5,''],[60,'r']]);say(mr.ev.includes('cast')&&mr.g.p.x<12*8,'a struck mould sets solid');
}
console.log('Inversion: gravity prisms');
{
 const def=box({P:[3,19],put:[[6,18,'Q'],[6,19,'Q']]});
 const r=play(def,[[2,''],[5,'rx'],[90,'']]);
 say(r.ev.includes('gravity')&&r.g.flipped,'dashing through a prism turns gravity over');
 // After the flip the knight falls to the ceiling: on screen (unmirrored) y near the top.
 const screenY=184-r.g.p.y-r.g.p.h;say(screenY<=10&&r.g.p.onGround,`flipped, the knight stands on the ceiling (screen y ${screenY})`);
 const tall=box({P:[3,19],put:row(0,0,0,'#').concat(Array.from({length:19},(_,i)=>[6,i+1,'Q']))});
 const back=play(tall,[[2,''],[5,'rx'],[90,''],[1,''],[5,'lx'],[90,'']]);say(back.ev.filter(e=>e==='gravity').length===2&&!back.g.flipped,'a second pass turns it back');
 Core.resetRoom(r.g);say(!r.g.flipped&&!r.g.room.mirrored,'retrying the room sets gravity right');
}
console.log('Citadel: spent footholds');
{
 const def=box({P:[9,16],put:[...row(17,8,10,'Y')]});
 const r=play(def,[[60,'r']]);
 say(r.ev.includes('foothold-spent')&&r.g.ents.find(e=>e.type==='foothold').gone,'a foothold falls away once you leave it');
}
console.log('Throne: echo, wake and re-aimed portals');
{
 const def=box({P:[3,19],put:[[12,19,'_'],[30,17,'H'],[30,18,'H'],[30,19,'H']],def:{echo:true}});
 const r=play(def,[[1,''],[1,'q'],[60,'r'],[1,'q'],[20,'']]);
 say(r.ev.includes('echo-place')&&r.ev.includes('echo-swap')&&r.g.p.x<40,'the portal key leaves an echo, then trades places with it');
 const plate=play(def,[[50,'r'],[1,'q'],[1,''],[60,'l']]);const held=plate.g.ents.find(e=>e.type==='held');
 say(held&&!held.solid,'an echo holds a plate down');
 const wk=box({P:[3,19],def:{wake:{delay:30}}});const w=play(wk,[[40,'r'],[40,'l']]);say(w.ev.includes('death'),'doubling back into your wake is death');
 const ok=play(wk,[[200,'r']]);say(!ok.ev.includes('death'),'keeping ahead of the wake is safe');
}
console.log('Deep Line: carts');
{
 const def=box({P:[5,17],put:[...row(20,1,38,'-'),[5,19,'C'],[6,19,'C']]});
 const r=play(def,[[30,''],[60,'r']]);const cart=r.g.ents.find(e=>e.type==='cart');
 say(cart.x>60&&Math.abs(r.g.p.x+4-(cart.x+8))<=2,`seated, right leans the cart along (${cart.x-40} px) and you ride it`);
 const j=play(def,[[30,''],[60,'r'],[1,'j'],[20,'']]);say(j.g.p.vx>100||j.log.slice(-20).some(t=>t.vx>100),'jumping out keeps the cart\'s speed');
 const bdef=box({P:[5,17],put:[...row(20,1,38,'-'),[5,19,'C'],[6,19,'C'],[12,20,')']]});const b=play(bdef,[[30,''],[20,'r'],[30,'']]);
 say(b.ev.includes('boost'),'a boost strip throws the cart');
}
console.log('Thunder Cliffs: hook rings and decks');
{
 const def=box({P:[10,19],put:[[14,12,'O']]});
 const r=play(def,[[2,''],[14,'rj'],[1,'rjg'],[40,'g'],[40,'']]);
 say(r.ev.includes('hook')&&r.log.some(t=>t.st==='hook'),'grab near a ring in the air catches it');
 const rel=r.log.findIndex(t=>t.ev.includes('unhook'));say(rel>0,'letting go of grab releases the chain');
 const dk=box({P:[5,17],def:{decks:[{c:4,r:18,w:3,to:[10,0],period:120}]}});
 // Decks start with the room's first input (the fixture's first frame holds grab on the ground: no move).
 const still=play(dk,[[60,'']]);say(still.g.ents.find(e=>e.type==='deck').x===32,'a deck waits for the room\'s first input');
 const d=play(dk,[[1,'g'],[59,'']]);say(d.g.p.x>80,`a deck carries the knight (${d.g.p.x} px)`);
}
console.log('Colony: watch lights and smoke');
{
 const def=box({P:[3,19],def:{lights:[{c:20,r:10,dir:90,sweep:0,range:120,width:30}]}});
 const r=play(def,[[120,'r']]);say(r.ev.includes('seen'),'walking through a lamp\'s cone gets you seen');
 const s=[];for(let c=17;c<=23;c++)for(let rr=17;rr<=19;rr++)s.push([c,rr,'S']);
 const sm=box({P:[3,19],put:s,def:{lights:[{c:20,r:10,dir:90,sweep:0,range:120,width:25}]}});
 const q=play(sm,[[120,'r']]);say(!q.ev.includes('seen'),'smoke hides the knight from the lamp');
}
console.log('Light: beams, mirrors, shutters, portals');
{
 const def=box({P:[3,19],put:[[0,10,'#'],[30,10,'/'],[30,3,'c'],[35,3,'G'],[35,4,'G']],def:{beams:[{c:0,r:10,dir:'r'}]}});
 const g=Core.createGame([def]);Core.step(g,keysToInput(''));
 say(g.ents.find(e=>e.type==='stone').lit,'a beam turned by a mirror lights a tally stone');
 const burn=box({P:[3,19],def:{beams:[{c:10,r:0,dir:'d'}]}});const b=play(burn,[[80,'r']]);say(b.ev.includes('death'),'walking into a beam is death');
 const mdef=box({P:[32,11],put:[[0,10,'#'],[30,10,'\\'],[30,3,'c'],...row(12,31,38,'#')],def:{beams:[{c:0,r:10,dir:'r'}]}});
 const m=play(mdef,[[1,'l'],[1,'ls'],[20,'']]);
 say(m.ev.includes('mirror')&&m.g.ents.find(e=>e.type==='stone').lit,'striking a mirror turns it, and the beam with it');
 const sh=box({P:[3,19],put:[[0,10,'#'],[20,10,'X'],[30,10,'c']],def:{beams:[{c:0,r:10,dir:'r'}],shutters:[{open:30,shut:30,offset:30}]}});
 const sg=Core.createGame([sh]);Core.step(sg,keysToInput(''));const early=sg.ents.find(e=>e.type==='stone').lit;
 for(let i=0;i<40;i++)Core.step(sg,keysToInput(''));
 say(!early&&sg.ents.find(e=>e.type==='stone').lit,'a shut shutter stops the beam until it opens');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
