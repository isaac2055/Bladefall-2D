// Room by Room · 30. The Fractured Emberdeep (7.280, hand-made; replaces fracture.mjs's reflection of 10). Source for
// public/bladefall-rbr-30-f-emberdeep.js (node scripts/rbr-src/gen.mjs 30). Brief: docs/plans/fractured-hard.md (stage III).
// The buried forge, pouring backwards. The region's device is still the heat slab (bladefall-pcore-dev-ember.js,
// glyph E: stone, then molten, then glass, on the room's own clock from your first input). Nothing here is a rest:
// a slab is stone for less than a second, the floor is thorns, and the known tools come in beside the pour: mirror
// panes (29), fault stone (25), the shade (27), the tear (13), crystals and the Gaol's pressure pod. In order:
//   the wave (The Ember Door: four slabs set one after another, and a pane in the middle of them)
//   → the one step (The Cooling Road: fault stone up to it, and a slab that is a step only for a moment)
//   → the seal and the glass (The Draw: two seals, each with a pane against it; dash both at once)
//   → the schedule (four slabs up on a tight beat, a crystal and a pane between the second and the third)
//   → the spouts (three decks, hatches at alternate ends, and your shade a second behind: you cannot wait under one)
//   → the held tear (a tear through a seal: ride it only while the seal is not molten)
//   → the Stamping Line (the workers' echo; cracked stone and a slab, the chute up past the counters)
//   → the glass shift (a pane between two slabs on opposite beats)
//   → the mould pits (the pod up through a hatch that keeps its own time, then the glass)
//   → the pour floor (synthesis: two slabs on a beat, a hatch over fault stone, the seal and a pane on the deck)
//   → the Deep Stair (a stair of slabs setting one after another, your shade behind: walk with the dry stone)
//   → the Stair Foot (the last slab and a tear into the Foundry).
// Echo: Both Counters Green (q.needs the base keepsake quota-piece), up the Stamping Line's return chute: The Return
// Chute and The Counting Loft, the region's hardest rooms.
import {grid} from './build.mjs';
import base from './10-emberdeep.mjs';
const shell=()=>grid().frame();
const ST={study:true};
const room=(id,name,hint,question,m,extra={})=>({id:'fe30-'+id,name,exit:'left',hint,question,map:m.rows(),...ST,...extra});
// A slab that is glass first at clock T (then stone, then molten): d = {molten, glass, stone} frames.
const glassAt=(T,d)=>{const cyc=d.molten+d.glass+d.stone;return {...d,start:'molten',offset:((d.molten-T)%cyc+cyc)%cyc};};
// The room def's slabs in map order (row-major, the order the ember module reads them): list = [[c,r,spec], ...].
const slabs=list=>list.slice().sort((a,b)=>a[1]-b[1]||a[0]-b[0]).map(x=>x[2]);
const QUICK={molten:70,glass:40,stone:45};
const TIGHT={molten:60,glass:30,stone:25};   // set for less than a second: never a rest

// 1 · The Ember Door — the wave: three slab steps over the channel, each a jump and a dash from the last and each
// setting a beat after the one before, so the dry stone runs left ahead of you; the second gap is dashed through a pane.
const door=shell();
door.rect(34,18,39,22,'#').rect(1,21,33,21,'^').rect(1,22,33,22,'#').rect(23,16,25,16,'E').rect(19,1,19,20,'|').rect(12,14,14,14,'E')
 .rect(4,10,6,10,'E').rect(0,6,1,22,'#').rect(0,1,0,5,'.').put(36,17,'P');
const doorSlabs=slabs([[23,16,glassAt(15,QUICK)],[12,14,glassAt(55,QUICK)],[4,10,glassAt(95,QUICK)]]);

// 2 · The Cooling Road — the one step: fault stone out over the channel, and a single slab that is a step up to
// the high road only for a moment.
const cooling=shell();
cooling.rect(32,18,39,22,'#').rect(12,21,31,21,'^').rect(12,22,31,22,'#').rect(0,9,11,22,'#').rect(12,10,12,20,'>')
 .rect(24,16,27,16,'T').rect(14,13,17,13,'E').rect(0,4,0,8,'.').put(35,17,'P');

// 3 · The Draw — two seals, each a slab from floor to roof with a pane against it. Only a dash passes the glass,
// and the seal only lets you through while it is glass, so you dash both at once.
const draw=shell();
draw.rect(0,18,39,22,'#').rect(10,18,30,18,'^').rect(28,1,28,17,'|').rect(25,1,26,17,'E').rect(16,1,16,17,'|').rect(13,1,14,17,'E')
 .rect(19,15,22,15,'T').rect(0,13,0,17,'.').put(35,17,'P');

// 4 · The Pour Schedule — four slabs up on a tight beat, and a crystal and a pane between the second and third.
const schedule=shell();
schedule.rect(34,18,39,22,'#').rect(6,21,33,21,'^').rect(6,22,33,22,'#').rect(0,9,5,22,'#').rect(5,10,5,20,'>')
 .rect(28,17,31,17,'E').rect(21,15,24,15,'E').put(18,11,'o').rect(16,1,16,20,'|').rect(10,13,13,13,'E').rect(6,10,8,10,'E')
 .rect(0,4,0,8,'.').put(36,17,'P');
const schedSlabs=slabs([[28,17,glassAt(15,TIGHT)],[21,15,glassAt(50,TIGHT)],[10,13,glassAt(100,TIGHT)],[6,10,glassAt(135,TIGHT)]]);

// 5 · Under the Spouts — three decks, a hatch at alternate ends of each (glass lets you up through it), and your
// shade a second behind, so you cannot wait under a hatch. Glass in the second and third corridors.
const spouts=shell();
spouts.rect(0,18,39,22,'#').rect(1,15,38,15,'#').rect(1,12,38,12,'#').rect(1,9,38,9,'#')
 .rect(7,15,9,15,'E').rect(30,12,32,12,'E').rect(7,9,9,9,'E').rect(13,17,14,17,'^').rect(20,13,20,14,'|').rect(20,10,20,11,'|').rect(26,11,27,11,'^')
 .rect(0,5,0,8,'.').put(23,17,'P');
const spoutSlabs=slabs([[7,15,glassAt(72,{molten:80,glass:40,stone:40})],[30,12,glassAt(200,{molten:80,glass:40,stone:40})],[7,9,glassAt(328,{molten:80,glass:40,stone:40})]]);

// 6 · The Held Tear — a tear across the channel, through a seal: the ride carries you through stone and glass, but
// molten takes you. Then a fault perch, the glass, a second fault perch, and the wall up to the way out.
const tear=shell();
tear.rect(32,18,39,22,'#').rect(1,21,31,21,'^').rect(1,22,31,22,'#').rect(20,1,21,20,'E').rect(12,16,15,16,'T').rect(9,1,9,20,'|')
 .rect(4,15,6,15,'T').rect(0,7,1,22,'#').rect(0,2,0,6,'.').put(36,17,'P');

// 7 · The Stamping Line — cracked stone gives way, the slab will not hurry, and the glass is between them. The
// workers' echo is at the head of the line; the return chute goes up past the counters (the echo).
const line=shell();
line.rect(32,18,39,22,'#').rect(5,21,31,21,'^').rect(5,22,31,22,'#').rect(0,6,4,22,'#').rect(5,7,5,20,'>')
 .rect(24,16,26,16,'~').rect(14,13,17,13,'E').rect(12,1,12,12,'|').rect(7,9,9,9,'~').rect(0,1,0,5,'.').rect(33,0,37,0,'.').put(36,17,'P');

// 8 · The Glass Shift — two slabs on opposite beats with a pane between them: leave the first as it melts, through
// the glass onto the second as it sets, and on to the step under the far ledge.
const shift=shell();
shift.rect(33,18,39,22,'#').rect(6,21,32,21,'^').rect(6,22,32,22,'#').rect(25,16,29,16,'E').rect(21,1,21,20,'|').rect(13,15,17,15,'E')
 .rect(7,12,9,12,'E').rect(0,10,5,22,'#').rect(5,11,5,20,'>').rect(0,5,0,9,'.').put(36,17,'P');
const shiftSlabs=slabs([[25,16,glassAt(5,{molten:75,glass:35,stone:45})],[13,15,glassAt(60,{molten:75,glass:35,stone:45})],[7,12,glassAt(100,{molten:75,glass:35,stone:45})]]);

// 9 · The Mould Pits — the pod throws you up (down into it is up, with your dash back) through a hatch in the
// gantry that keeps its own time; above it, the glass, a fault perch over the thorns, and your shade coming up
// through the hatch behind you.
const moulds=shell();
moulds.rect(31,18,39,22,'#').rect(1,21,30,21,'^').rect(1,22,30,22,'#').rect(1,6,38,6,'#').rect(25,6,28,6,'E').put(27,15,'R')
 .rect(14,1,14,5,'|').rect(3,5,12,5,'^').rect(9,4,10,4,'T').rect(0,1,0,5,'.').put(35,17,'P');

// 10 · The Pour Floor — everything the pour has taught: two slabs on a beat, a hatch over fault stone (no waiting
// under it), and on the deck the seal with a pane against it.
const pourfloor=shell();
pourfloor.rect(34,18,39,22,'#').rect(1,21,33,21,'^').rect(1,22,33,22,'#').rect(28,17,31,17,'E').rect(21,16,24,16,'E')
 .rect(1,11,38,11,'#').rect(11,11,14,11,'T').rect(18,11,21,11,'T').rect(15,11,17,11,'E').rect(13,14,19,14,'T').rect(9,1,10,10,'E').rect(12,1,12,10,'|').rect(0,6,0,10,'.').put(36,17,'P');
const pourSlabs=slabs([[9,1,glassAt(150,{molten:60,glass:35,stone:50})],[15,11,glassAt(95,{molten:70,glass:35,stone:40})],[28,17,glassAt(0,QUICK)],[21,16,glassAt(30,QUICK)]]);

// 11 · The Deep Stair — a stair of slab steps down to the sump, switching back across a pane that splits the
// stair from roof to floor: every flight is a jump and a dash through the glass, so your hands turn at every
// landing. A thorned band under the second step keeps the last flight to the far side of the glass. Each step
// sets a beat after the one above it, and your shade walks the stair behind you.
const stair=shell();
stair.rect(33,5,39,6,'#').rect(1,21,38,21,'^').rect(1,22,38,22,'#').rect(1,19,11,22,'#').rect(9,19,11,22,'.')
 .rect(1,12,19,12,'^').rect(1,13,19,13,'v').rect(20,1,20,20,'|')
 .rect(26,7,28,7,'E').rect(12,10,14,10,'E').rect(26,13,28,13,'E').rect(12,17,14,17,'E').put(36,4,'P');
const stairSlabs=[13,59,121,171].map(T=>glassAt(T,{glass:12,stone:28,molten:70}));

// 12 · The Stair Foot — the seam into the Foundry: cracked stone off the landing, a slab over the sump set only
// for a moment, and a hop beyond it the glass standing in the mouth of a tear. One dash takes both, the tear sets you on cracked stone under the way out, and a crystal hangs between it and the ledge.
const foot=shell();
foot.rect(35,18,39,22,'#').rect(3,21,34,21,'^').rect(3,22,34,22,'#').rect(31,18,34,18,'T').rect(22,18,28,18,'E')
 .rect(17,1,17,20,'|').rect(3,18,6,18,'T').rect(0,9,2,22,'#').put(4,12,'o').rect(0,4,0,8,'.').put(36,17,'P');
const footSlabs=[glassAt(28,{glass:15,stone:35,molten:80})];

// Echo · Both Counters Green (the workers' echo; sealed until the base keepsake, the quota piece, is held). Up the
// Stamping Line's return chute. The region's two hardest rooms: nowhere to stand still in either.
// The Return Chute — a shaft between thorned walls: a slab, a fault perch, the glass across the upper shaft, a
// slab beyond it, a fault perch back through the glass, and the chute's mouth. Your shade climbs behind you.
const chute=shell();
chute.rect(1,1,9,22,'#').rect(30,1,38,22,'#').rect(10,1,10,17,'>').rect(29,1,29,17,'<').rect(10,18,29,22,'#').rect(11,0,15,0,'.')
 .rect(11,17,23,17,'^').rect(19,15,22,15,'E').rect(12,12,14,12,'T').rect(17,1,17,8,'|').rect(21,9,24,9,'E').rect(12,6,14,6,'T').put(26,17,'P');
const chuteSlabs=slabs([[19,15,glassAt(6,{glass:10,stone:34,molten:70})],[21,9,glassAt(62,{glass:8,stone:66,molten:60})]]);
// The Counting Loft — the counting house is a stairwell split from roof to floor by a pane: each half has its own
// floors, the left half's three tiers in step between the right half's, so no floor can be climbed past on its
// own side. Every flight is a jump and a dash through the glass onto the next floor on the other side (your hands
// turn at every landing), the walls either side are hot, and your shade climbs the stairwell a second behind, so
// no floor here waits. At the top, off the last floor onto the shelf where the latch lies; the way back down is
// the shaft beside it.
const loft=shell();
loft.rect(34,18,39,22,'#').rect(3,21,33,21,'^').rect(3,22,33,22,'#').rect(20,1,20,20,'|').rect(38,1,38,17,'<')
 .rect(3,4,8,22,'#').rect(9,5,9,20,'>').rect(1,22,2,22,'.')
 .rect(25,17,27,17,'#').rect(9,15,19,15,'#').rect(21,12,38,12,'#').rect(9,9,19,9,'#').rect(21,6,38,6,'#').rect(9,3,19,3,'#')
 .put(5,3,'*').put(36,17,'P');

export default {
 n:30,name:'The Fractured Emberdeep',kit:['dash','strike','parry','portal'],
 folk:base.folk,props:base.props,
 blurb:'The buried forge, pouring backwards. Every slab is stone for less than a second, the floor is thorns, and the glass from the court above has come down with you.',
 outro:'The last slab cools behind you. The foundry beyond is hammering.',
 note:'Hand-made for the Fractured ramp (docs/plans/fractured-hard.md). Heat slabs (bladefall-pcore-dev-ember.js), mirror panes, fault stone, the shade, tears.',
 rooms:[
  room('door','The Ember Door','The slabs set one after another · the glass between them swaps your hands','Three steps, each a beat after the last, and a pane in the second gap. Can you keep the beat swapped?',door,{slabs:doorSlabs,mirror:{}}),
  room('cooling','The Cooling Road','Fault stone will not wait · the slab is a step only for a moment','The fault won’t wait and the slab won’t hurry. When do you leave the fault?',cooling,{slabs:[{stone:25,molten:70,glass:30,start:'molten'}],fault:{fuse:10,spread:5}}),
  room('draw','The Draw','Glass lets a dash through · a seal lets you through only while it is glass','Two seals, each with a pane against it. When are both open to one dash?',draw,
   {slabs:[{stone:60,molten:50,glass:35,start:'stone'},{stone:60,molten:50,glass:35,start:'molten'}],mirror:{},fault:{fuse:14,spread:6}}),
  room('schedule','The Pour Schedule','Each slab sets a beat after the one before · a crystal for the glass','Four steps on a tight beat, and a pane after the second. Where does the dash come back?',schedule,{slabs:schedSlabs,mirror:{}}),
  room('spouts','Under the Spouts','Glass lets you up through a hatch · your shade walks a second behind','Each deck is sealed but for one hatch, and you cannot wait under it. When do you set off?',spouts,{slabs:spoutSlabs,mirror:{},shade:{delay:50}}),
  room('tear','The Held Tear','A tear carries you through a seal · molten still burns','The tear runs through the seal. When is it safe to ride?',tear,
   {slabs:[{stone:50,molten:55,glass:40,start:'stone'}],lines:[{a:[31,17],b:[14,15],setDown:true}],fault:{fuse:10,spread:5},mirror:{}}),
  room('line','The Stamping Line','Cracked stone gives way · the slab keeps its own time · the glass between','The cracked stone won’t wait and the slab won’t hurry, and the glass costs your dash. When do you leave the crack?',line,
   {side:'up',slabs:[{stone:45,molten:70,glass:35,start:'molten'}],mirror:{},
    people:[{who:'maker',c:34,r:17,face:-1,quest:'quota-echo',line:'Same piece, round and round. We never stopped it.',lineDone:'You can stop it. Up there, with the counters.',name:'THE WORKERS’ ECHO'}],
    decor:[{k:'ed-belt',c:39,r:17},{k:'ed-counter',c:38,r:17}]}),
  room('shift','The Glass Shift','Two slabs on opposite beats · the pane between them','The first slab melts as the second sets, and the glass is between. When do you dash?',shift,{slabs:shiftSlabs,mirror:{}}),
  room('moulds','The Mould Pits','Dash down into the pod and it throws you up, with your dash · the hatch keeps its own time','The hatch is out of reach of any jump and dash, and the glass is beyond it. When do you dash into the pod?',moulds,
   {slabs:[{stone:45,molten:80,glass:40,start:'molten'}],mirror:{},fault:{fuse:10,spread:5},shade:{delay:50}}),
  room('pourfloor','The Pour Floor','Everything the pour has taught, on one floor','Two steps on a beat, a hatch over fault stone, a seal and a pane on the deck. Where can you wait? Nowhere.',pourfloor,{slabs:pourSlabs,mirror:{},fault:{fuse:12,spread:5}}),
  {...room('stair','The Deep Stair','Every flight is a jump and a dash through the glass · your shade walks the stair behind you','Every flight crosses the glass, every step is set only on its beat, and your shade is on the stair. Which way is down at each landing?',stair,{slabs:stairSlabs,mirror:{},shade:{delay:50}}),exit:'down'},
  room('foot','The Stair Foot','The slab is set only for a moment · the glass stands in the mouth of a tear','The cracked stone will not wait, the slab is set for a moment, and the glass stands in the tear’s mouth. When do you go?',foot,
   {slabs:footSlabs,mirror:{},fault:{fuse:12,spread:6},lines:[{a:[16,17],b:[6,17]}]}),
 ],
 quests:[
  {id:'quota-echo',title:'Both Counters Green',giver:'The workers’ echo',from:'fe30-line',back:{c:36,r:17},needs:'quota-piece',
   keepsake:{id:'quota-remembered',name:'Maker and Breaker, remembered',gives:'Maker and Breaker left the line running and never went back to it. Shown at the end.'},
   rooms:[
    {...room('q-chute','The Return Chute','No perch here waits · the glass crosses the upper chute · your shade climbs behind you','A slab, cracked stone, the glass, a slab, the glass again, and the chute’s mouth. In what order, and on what beat?',chute,
      {slabs:chuteSlabs,mirror:{},fault:{fuse:10,spread:5},shade:{delay:50},decor:[{k:'ed-counter',c:27,r:17}]}),exit:'up'},
    {...room('q-loft','The Counting Loft','Every flight crosses the glass · no floor can be climbed past on its own side · your shade climbs behind you','Five flights up the stairwell, each through the glass onto the other side, and your shade a flight behind. Which way is left at each landing?',loft,
      {mirror:{},shade:{delay:50},
       people:[{who:'maker',name:'THE WORKERS’ ECHO',c:7,r:3,quest:'quota-echo',line:'Both green. Nobody counted after that.',lineDone:'Lunch for two, on the bench, for good.'}],
       decor:[{k:'ed-counter',c:37,r:17},{k:'ed-latch',c:5,r:3}]}),exit:'down'},
   ]},
 ],
};
