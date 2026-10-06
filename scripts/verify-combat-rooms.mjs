// Replays exercise real inputs. Focused fixtures check interactions that complete routes
// alone cannot prove (carrying, final-hit rebounds, moving solids and retry state).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Core as C,Rooms,keysToInput,expand,runRoom} from './pcore-tape.mjs';
const Combat=globalThis.BladefallPrecisionCombat;
// Since 7.250 these nine rooms live among the Part IV levels; the Combat rooms file still owns their data.
const rooms=globalThis.BladefallCombatRooms.rooms;
let passed=0;
function check(name,fn){fn();passed++;console.log('ok  '+name);}
const rules={
 'combat-01':{'parry':1,'enemy-defeat':1,'combat-gate':1},
 'combat-03':{'shot-return':1,'receiver-lit':1},
 'combat-04':{'enemy-pogo':2},
 'combat-05':{'shot-return':1,'receiver-lit':1},
 'combat-06':{'zip-start':1,'shot-return':1,'receiver-lit':1},
 'combat-07':{'breach':1},
 'combat-08':{'pickup':1,'throw':1,'held-open':1,'shot-return':1},
 'combat-09':{'phase':1,'receiver-lit':2},
 'combat-10':{'parry':3,'enemy-pogo':1,'zip-start':1,'receiver-lit':1}
};
const receipts=[];
check('each room waits safely at its entrance until the player acts',()=>{
 for(const room of rooms){const g=C.createGame([room]),initial=structuredClone(g.combat);for(let n=0;n<600;n++)C.step(g,{});assert.equal(g.deaths,0);assert.deepEqual(g.combat,initial);C.step(g,{parry:true});assert.equal(g.combat.awake,true);}
});
check('nine named rooms, each with a question and a real input recording, all placed in Part IV',()=>{
 assert.equal(rooms.length,9);assert.equal(new Set(rooms.map(r=>r.id)).size,9);
 for(const r of rooms)assert.ok(Rooms.chapters.some(c=>c.part==='IV'&&c.rooms.includes(r)),r.id+' is placed in Part IV');
 for(const r of rooms){assert.ok(r.question&&r.name&&Rooms.tapes[r.id]?.length);assert.equal(r.map.length,23);assert.ok(r.map.every(row=>row.length===40));}
});
for(const room of rooms){
 check(room.id+' · '+room.name+' · full-state deterministic, zero deaths, mechanics exercised',()=>{
  const a=C.createGame([room]),b=C.createGame([room]),events=[];
  for(const [i,k]of expand(Rooms.tapes[room.id]).entries()){
   C.step(a,keysToInput(k));C.step(b,keysToInput(k));
   assert.deepEqual(a,b,`${room.id}: all simulation state at frame ${i}`);
   for(const e of a.events)events.push({...e,frame:i});
   const exited=a.events.some(e=>e.type==='exit');a.events.length=b.events.length=0;
   if(exited)break;
  }
  assert.equal(a.deaths,0);assert.ok(events.some(e=>e.type==='exit'));
  for(const [type,min]of Object.entries(rules[room.id]))assert.ok(events.filter(e=>e.type===type).length>=min,`${room.id} needs ${type}`);
  if(room.id==='combat-04'){assert.equal(a.phase,0);assert.ok(!events.some(e=>e.type==='dash'));}
  receipts.push({id:room.id,name:room.name,frames:a.frame,deaths:a.deaths,parries:a.combat.parries,pogos:a.combat.pogos,kills:a.combat.kills,coils:a.combat.receivers.filter(r=>r.lit).length,events:[...new Set(events.map(e=>e.type))]});
 });
}
for(const [id,key]of [['combat-01','p'],['combat-03','p'],['combat-04','s'],['combat-05','p'],['combat-06','p'],['combat-08','g'],['combat-09','p'],['combat-10','p']]){
 check(id+' · removing '+({p:'parries',s:'blade strikes',g:'lantern handling'}[key])+' breaks this route',()=>{
  const r=runRoom(rooms,rooms.findIndex(r=>r.id===id),Rooms.tapes[id].map(([n,k])=>[n,k.replaceAll(key,'')]),{maxExtra:100});
  assert.equal(r.exited,false);
 });
}
function fixture(combat={enemies:[]},edits=[]){
 const map=Array.from({length:23},(_,y)=>Array(40).fill(y>=20?'#':'.'));map[19][3]='P';
 for(const [x,y,ch]of edits)map[y][x]=ch;
 return C.createGame([{id:'fixture',exit:'right',map:map.map(r=>r.join('')),combat}]);
}
function step(g,k='',n=1){for(let i=0;i<n;i++)C.step(g,keysToInput(k));}
function attack(g,kind='guard'){
 const e=g.combat.enemies[0];Object.assign(e,{kind,x:g.p.x+16,y:g.p.y-5,face:-1,state:'attack',t:8,vx:0,vy:0});return e;
}
const guard=()=>fixture({enemies:[{kind:'guard',x:40,y:144,delay:999}]});
check('air parry refunds the spent dash without changing phase or injecting a launch',()=>{
 const g=guard();g.p.y=115;g.p.dashes=0;g.p.vx=60;g.p.vy=20;attack(g);
 step(g,'p');assert.equal(g.combat.parries,1);assert.equal(g.p.dashes,1);assert.equal(g.phase,0);assert.ok(g.p.vy>=20);assert.ok(g.p.vx>0);
 step(g,'p',25);assert.equal(g.combat.parries,1);assert.equal(g.p.dashes,1);
});
check('a whiff grants no dash; holding parry does not continuously re-arm it',()=>{
 const g=fixture();g.p.y=40;g.p.dashes=0;step(g,'p',20);assert.equal(g.p.dashes,0);assert.equal(g.p.parryTimer,0);
 const h=guard();step(h,'p',20);attack(h);step(h,'p');assert.equal(h.p.state,'dead');assert.equal(h.combat.parries,0);
});
check('ordinary bodies are safe; an active weapon is dangerous',()=>{
 const g=guard();g.combat.enemies[0].x=g.p.x;step(g);assert.notEqual(g.p.state,'dead');attack(g);step(g);assert.equal(g.p.state,'dead');
});
check('carrying the lantern prevents parry and blade actions',()=>{
 const g=fixture({enemies:[]},[[4,19,'l']]);step(g,'g');assert.ok(g.p.carrying);step(g);step(g,'ps');assert.equal(g.p.parryTimer,0);assert.equal(g.p.strikeTimer,0);
});
check('a final-hit pogo uses the seed-pod rebound and refunds a dash',()=>{
 const g=fixture({enemies:[{kind:'wing',x:24,y:139,delay:999,left:24,right:24}]});
 g.p.y=120;g.p.dashes=0;g.combat.enemies[0].hp=1;step(g,'ds');
 assert.ok(g.combat.enemies[0].dead);assert.equal(g.p.vy,C.K.podSpeed);assert.equal(g.p.dashes,1);assert.equal(g.combat.pogos,1);
});
check('an exposed upward cut preserves a live launch target; side cut finishes',()=>{
 const g=guard(),e=g.combat.enemies[0];Object.assign(e,{x:24,y:135,exposed:60,state:'recover',t:60});step(g,'us');assert.equal(e.hp,1);assert.ok(e.vy<0);assert.ok(!e.dead);
 const h=guard(),f=h.combat.enemies[0];Object.assign(f,{x:32,exposed:60,state:'recover',t:60});step(h,'rs');assert.ok(f.dead);
});
check('guard armour blocks frontal cuts and allows cuts from behind',()=>{
 const g=guard(),e=g.combat.enemies[0];e.x=32;e.face=-1;step(g,'rs');assert.equal(e.hp,2);assert.ok(g.events.some(e=>e.type==='guard-block'));
 const h=guard(),f=h.combat.enemies[0];f.x=32;f.face=1;step(h,'rs');assert.equal(f.hp,1);
});
check('an attack locks its aim when the tell begins',()=>{
 const g=fixture({enemies:[{kind:'sentry',x:150,y:144,delay:1}]});step(g);const e=g.combat.enemies[0],aim=[e.aimX,e.aimY];
 g.p.x=230;step(g,'',12);assert.deepEqual([e.aimX,e.aimY],aim);assert.equal(e.face,-1);
});
check('walls stop swept projectiles before the knight',()=>{
 const g=fixture({enemies:[]},[[8,18,'#'],[8,19,'#']]);
 g.combat.shots.push({id:1,x:90,y:150,w:4,h:4,remX:0,remY:0,vx:-3000,vy:0,life:10,reflected:false});step(g);assert.notEqual(g.p.state,'dead');assert.equal(g.combat.shots.length,0);
});
check('hostile bolts cannot activate receivers; a redirected bolt can ring a bell',()=>{
 const g=fixture({enemies:[],receivers:[{id:'r',x:70,y:145}]},[[10,18,'x'],[12,19,'A']]);
 const shot=reflected=>({id:1,x:66,y:146,w:4,h:4,remX:0,remY:0,vx:180,vy:0,life:100,reflected});
 g.combat.shots.push(shot(false));step(g,'',12);assert.equal(g.combat.receivers[0].lit,false);assert.equal(g.phase,0);
 g.combat.shots=[{...shot(true),x:81}];step(g,'',4);assert.equal(g.phase,1);assert.ok(g.events.some(e=>e.type==='bell'));
});
check('a hound can break masonry; killing it first leaves the barrier intact',()=>{
 const d={x:96,y:8,w:8,h:152,brittle:true};
 const g=fixture({enemies:[{kind:'hound',x:60,y:150,delay:999}],doors:[d]});
 const e=g.combat.enemies[0];Object.assign(e,{state:'attack',t:80,face:1});step(g,'',15);assert.equal(g.ents.find(e=>e.type==='brittle').open,true);
 const h=fixture({enemies:[{kind:'hound',x:60,y:150,delay:999}],doors:[d]});h.combat.enemies[0].dead=true;step(h,'',30);assert.equal(h.ents.find(e=>e.type==='brittle').open,false);
});
check('moving solids carry grounded enemies, push fliers, and crush against walls',()=>{
 const g=fixture({enemies:[{kind:'guard',x:80,y:128,delay:999}]});const e=g.combat.enemies[0];
 const platform={x:72,y:144,w:32,h:8};const riders=Combat.solidRiders(g,platform);platform.x++;Combat.solidMoved(g,platform,1,0,riders);assert.equal(e.x,81);
 Object.assign(e,{kind:'wing',x:90,y:140,w:12,h:10});const block={x:80,y:140,w:20,h:16};Combat.solidMoved(g,block,1,0,new Set());assert.equal(e.x,100);
 const h=fixture({enemies:[{kind:'wing',x:80,y:149,delay:999}]});const f=h.combat.enemies[0],press={x:72,y:144,w:32,h:8};Combat.solidMoved(h,press,0,1,new Set());assert.ok(f.dead);
});
check('phase blocks wait for an enemy to leave before appearing',()=>{
 const g=fixture({enemies:[{kind:'sentry',x:80,y:144,delay:999}]},[[10,18,'A'],[10,19,'A']]);
 const block=g.ents.find(e=>e.type==='toggle');block.solid=false;step(g);assert.equal(block.solid,false);
 g.combat.enemies[0].x=120;step(g);assert.equal(block.solid,true);
});
check('retry resets enemies, gates, projectiles, parry and room phase',()=>{
 for(const room of rooms){
  const r=runRoom([room],0,Rooms.tapes[room.id]),g=r.g;C.resetRoom(g);const fresh=C.createGame([room],{shards:[...g.shards]});
  assert.deepEqual(g.combat,fresh.combat);assert.deepEqual(g.ents,fresh.ents);
  assert.equal(g.p.state,'respawn');assert.equal(g.p.respawnTimer,C.K.respawnFrames);
  assert.deepEqual({...g.p,state:'normal',respawnTimer:0},fresh.p);
  assert.equal(g.phase,0);assert.equal(g.freeze,0);assert.deepEqual(g.prev,{});
 }
});
check('combat assets ship in HTML, offline cache and local build manifest',()=>{
 const html=fs.readFileSync(new URL('../public/precision.html',import.meta.url),'utf8');
 const sw=fs.readFileSync(new URL('../public/sw.js',import.meta.url),'utf8');
 const build=fs.readFileSync(new URL('../build-deploy.sh',import.meta.url),'utf8');
 for(const name of ['combat','combat-rooms','combat-tapes','combat-view'])for(const source of [html,sw,build])assert.ok(source.includes('bladefall-pcore-'+name+'.js'));
});
console.log(`\n${passed} combat checks passed. All nine input recordings exit without deaths.`);
if(process.argv.includes('--write'))fs.writeFileSync(new URL('../docs/evidence/combat-rooms-verification.json',import.meta.url),JSON.stringify({generatedAt:new Date().toISOString(),checks:passed,scope:'Full-state deterministic input replays and focused combat interactions; not a human difficulty playtest.',rooms:receipts},null,2)+'\n');
