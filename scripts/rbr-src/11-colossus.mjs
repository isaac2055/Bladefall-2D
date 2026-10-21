// Room by Room · 11. Ember Colossus (the Foundry). Source for public/bladefall-rbr-11-colossus.js (node scripts/rbr-src/gen.mjs 11).
// The base game's Foundry (Deep Stair, Receiving Floor, The Anvil and its counterweight gate, the slab climb over lava,
// the Casting Line, the Mould Hall and its Feeder, the overlook over the Casting Pit, the fissure) as thirteen screens:
// ten on the road, three for the Colossus. Kit: everything granted so far (dash, blade, parry, portal).
// The device is the Foundry module's (bladefall-pcore-dev-foundry.js): anvils (a downward cut throws you far higher than
// a pod and gives the dash back), moulds (struck, they set into iron for good, never around you) and casting belts
// (they carry the knight and the lantern). The precision part's rooms (Part XI) were read, not copied. In order:
//   seen (The Deep Stair: an anvil on a step you hop over, a belt that carries you to the door; Oren)
//   → the anvil alone (The Anvil: the works floor is out of any jump and dash, its face hot)
//   → anvils chained (The Counterweight Gate: one anvil reaches the shelf, the shelf's anvil reaches the top)
//   → the mould alone (The Slab Climb: one empty mould over the lava, halfway up)
//   → moulds chained (The Mould Hall: a stack of moulds you set and climb as you go; an upward cut reaches the next)
//   → anvil + mould (The Crane: thrown over a wall of teeth onto a mould you set as you land; the automaton's hatch)
//   → the belt as a question (The Casting Line: the belt takes the lantern through a slot to the plate that holds the hatch)
//   → with earlier things (The Slag Heap: a cracked step out to a hanging anvil, a roof that stops the throw, a mould)
//   → belt + mould + anvil (The Feeder: set the mould on the line so the lantern stops on the plate; the hatch over the
//     anvil opens)
//   → synthesis of the region's motion (The Overlook: down to the pit, three moulds set as you land; Oren again)
//   → the Ember Colossus, three rooms (The Casting Pit, The Bed, The Last Pour).
// The Colossus is new code, public/bladefall-pcore-dev-rbr-colossus.js (+ -view.js): its ladle rides a rail under the
// roof, gathers over a mould (chevrons down the column) and pours a column of metal that kills what it meets and runs
// straight through an empty mould. Metal poured onto a mould you have set is refused: it sets into an iron pillar from
// the mould to the ladle's lip. Refusals are the fight ("progress counts refusals, not health", as in the base fight).
// The Casting Pit: one mould, refuse it once, climb the pillar it leaves. The Bed: two moulds poured in turn; be at the
// second before the ladle, and the gate opens on the second refusal. The Last Pour: three, faster; the third refusal
// sends the machine down through the fissure, which opens, and the region leaves through its own floor.
// From 7.277 the machine also hunts (opt-in `hunt`, The Bed and The Last Pour): every other move its ladle follows the
// knight along the rail, its chevrons red, locks, and pours on her; a hunted pour that lands on a mould struck cold is
// refused and counts, so the answer is to stand under your own iron.
// The same module emits a `belt` event in Room by Room rooms (knight or lantern coming to rest on a belt) for skip hunts.
// People: Oren reads the machine (The Deep Stair, leaving right; The Overlook); the War Automaton by its hatch (The Crane).
// Quest (optional, branch): The War Automaton · Small Work, down its hatch from The Crane: The Cooling Forge (drop in,
// set the cooling mould as you fall onto it, anvil, mould, anvil, out over the hot wall) and The Retrieval Shelf (an
// anvil above your ledge, a mould under the roof, an anvil that throws you beside the shelf, the attachment on it).
// The keepsake (the gripping attachment) puts the roof on the fifth birdhouse, with a bird on it (f11-birds@automaton-grip).
import {grid} from './build.mjs';

// 1 · The Deep Stair — arrival down the stair from Emberdeep. An anvil on a step (hop it), a belt across the floor.
const stair=grid().frame();
stair.rect(0,18,39,22,'#').rect(0,9,6,22,'#').rect(7,11,10,22,'#').rect(11,13,14,22,'#').rect(15,15,18,22,'#')
 .rect(19,18,33,18,'}').rect(39,13,39,17,'.').put(9,10,'N').put(3,8,'P');

// 2 · The Anvil — one anvil; the works floor is higher than any jump and dash, and its face is hot.
const anvil=grid().frame();
anvil.rect(0,18,39,22,'#').rect(30,8,39,22,'#').rect(29,8,29,17,'<').rect(39,4,39,7,'.').put(22,17,'N').put(3,17,'P');

// 3 · The Counterweight Gate — two anvils: the first throws you up onto the counterweight shelf, the second out of the top.
const gate=grid().frame();
gate.rect(0,21,39,22,'#').rect(24,12,39,22,'#').rect(23,12,23,20,'<').rect(1,1,25,2,'#').rect(32,1,38,2,'#').rect(38,3,38,11,'<')
 .rect(26,0,31,0,'.').put(12,20,'N').put(28,11,'N').put(3,20,'P');

// 4 · The Slab Climb — one empty mould over the lava, halfway up to the works floor.
const climb=grid().frame();
climb.rect(0,18,12,22,'#').rect(13,21,23,21,'^').rect(24,6,39,22,'#').rect(23,6,23,20,'<').rect(39,2,39,5,'.')
 .put(16,12,'U').put(3,17,'P');

// 5 · The Mould Hall — a stack of empty moulds and nothing else to climb.
const hall=grid().frame();
hall.rect(0,18,39,22,'#').rect(18,7,18,17,'U').rect(20,7,39,22,'#').rect(19,8,19,17,'<').rect(39,3,39,6,'.').put(3,17,'P');

// 6 · The Crane — the anvil throws you over a wall of teeth; beyond it only a mould hangs over the lava.
// The cooling forge is down the hatch by the automaton (the quest).
const crane=grid().frame();
crane.rect(0,18,13,22,'#').rect(1,18,2,22,'.').rect(14,10,16,22,'#').rect(14,9,16,9,'^').rect(13,10,13,17,'<').rect(17,10,17,20,'>')
 .rect(17,21,32,21,'^').rect(33,11,39,22,'#').rect(32,11,32,20,'<').rect(39,7,39,10,'.').put(9,17,'N').put(24,9,'U').put(6,17,'P');

// 7 · The Casting Line — the hatch is held from a room you cannot get into; the belt runs there through a slot.
const line=grid().frame();
line.rect(0,18,39,22,'#').rect(1,1,29,12,'#').rect(30,12,38,12,'#').rect(32,12,34,12,'H').rect(1,13,10,16,'#')
 .rect(4,18,20,18,'{').put(3,17,'_').put(23,17,'l').rect(39,8,39,11,'.').put(27,17,'P');

// 8 · The Slag Heap — a cracked step out to an anvil hanging over the lava, and a mould under the roof.
const heap=grid().frame();
heap.rect(0,18,7,22,'#').rect(8,21,34,21,'^').rect(15,1,34,4,'#').rect(11,16,14,16,'~').put(18,14,'N').put(26,8,'U')
 .rect(35,8,39,22,'#').rect(34,9,34,20,'<').rect(39,4,39,7,'.').put(3,17,'P');

// 9 · The Feeder — the belt carries the light past the plate unless something stops it there; the plate holds
// the hatch over the anvil.
const feeder=grid().frame();
feeder.rect(0,18,39,22,'#').rect(4,18,30,18,'}').rect(31,18,38,18,'^').rect(1,9,26,9,'#').rect(27,9,30,9,'H')
 .rect(31,9,38,9,'#').put(20,17,'_').put(21,17,'U').put(28,17,'N').put(3,17,'l').rect(39,4,39,8,'.').put(2,17,'P');

// 10 · The Overlook — down to the casting pit: moulds to stop on, the pit floor hot.
const look=grid().frame();
look.rect(0,8,7,22,'#').rect(8,21,30,21,'^').rect(31,22,38,22,'.').rect(31,18,31,21,'#').rect(39,0,39,22,'#')
 .put(13,11,'U').put(20,14,'U').put(27,17,'U').put(3,7,'P');

// 11 · The Casting Pit — the Colossus pours into the mould over the lava. Refuse it once.
const pit=grid().frame();
pit.rect(0,18,10,22,'#').rect(11,21,26,21,'^').rect(27,5,39,22,'#').rect(26,6,26,20,'<').rect(39,1,39,4,'.')
 .put(7,17,'N').put(18,16,'U').put(3,17,'P');

// 12 · The Bed — two bays.
const bed=grid().frame();
bed.rect(0,18,39,22,'#').rect(8,18,30,18,'^').rect(38,1,38,4,'G').rect(39,1,39,4,'.').rect(35,5,38,5,'#')
 .put(6,17,'N').put(15,12,'U').put(24,12,'U').put(32,17,'N').put(2,17,'P');

// 13 · The Last Pour — three bays; the fissure in the floor.
const pour=grid().frame();
pour.rect(0,18,39,22,'#').rect(6,18,33,18,'^').rect(16,18,25,18,'G').rect(16,19,25,22,'.')
 .put(3,17,'N').put(10,11,'U').put(20,9,'U').put(30,11,'U').put(36,17,'N').put(1,17,'P');

// Quest · Small Work: the cooling forge under the Crane.
const forge=grid().frame();
forge.rect(1,0,4,0,'.').rect(0,21,39,22,'#').rect(1,20,38,20,'^').rect(1,3,5,3,'#').put(9,8,'U').put(10,17,'N').put(20,10,'U').put(25,15,'N')
 .rect(34,6,39,22,'#').rect(33,7,33,19,'<').rect(39,2,39,5,'.').put(2,2,'P');
const shelf=grid().frame();
shelf.rect(0,21,39,22,'#').rect(1,20,38,20,'^').rect(0,14,6,22,'#').rect(33,0,37,0,'.').put(10,12,'N').put(20,7,'U').put(30,12,'N')
 .rect(32,3,38,3,'#').rect(38,4,38,19,'<').put(35,2,'*').put(3,13,'P');

const IRON='#4a4d55',IRONL='#8a8e98',WOOD='#5a4632',HOT='#ff8a3a',BRASS='#c9a24a';
const chain=n=>{const r=[];for(let i=0;i<n;i++){r.push([3,-6-i*6,2,5,'#5c5f68']);r.push([3,-6-i*6,1,1,'#9aa0aa']);}return r;};
const birdhouse=(dx,roof)=>[[dx+1,-6,6,6,'#7a5a3a'],[dx+3,-4,2,2,'#2a1e14'],...(roof?[[dx,-8,8,2,'#a07a4a'],[dx+1,-9,6,1,'#c09a6a']]:[[dx,-8,3,1,'#a07a4a'],[dx+5,-7,3,1,'#6a4a2a']])];
const props={
 'f11-chain':chain(4),'f11-chain-long':chain(9),
 // a crucible on its stand, still warm
 'f11-crucible':[[0,-2,12,2,'#3a2e24'],[1,-9,10,7,IRON],[1,-9,10,1,IRONL],[2,-8,8,1,HOT],[0,-6,1,3,'#3a2e24'],[11,-6,1,3,'#3a2e24']],
 // a rack of finished castings
 'f11-rack':[[0,-16,1,16,WOOD],[13,-16,1,16,WOOD],[0,-16,14,1,WOOD],[0,-8,14,1,WOOD],[2,-14,4,5,IRON],[8,-14,4,5,IRON],[3,-6,4,5,IRON],[9,-6,3,5,IRON]],
 // the standing orders, nailed up
 'f11-orders':[[0,-20,12,14,'#c8b88a'],[0,-20,12,1,'#e8d8aa'],[2,-17,8,1,'#5a4a32'],[2,-14,6,1,'#5a4a32'],[2,-11,8,1,'#5a4a32'],[5,-6,2,6,WOOD]],
 // a flywheel
 'f11-gear':[[2,-16,12,12,'#4a4038'],[4,-18,8,16,'#4a4038'],[0,-14,16,8,'#4a4038'],[5,-13,6,6,'#2a2420'],[7,-11,2,2,BRASS]],
 // the automaton's birdhouses, none fit for a bird; with the attachment back, the fifth has its roof and a visitor
 'f11-birds':[...birdhouse(0,false),...birdhouse(10,false),[20,-4,6,4,'#7a5a3a'],[21,-6,4,1,'#6a4a2a']],
 'f11-birds@automaton-grip':[...birdhouse(0,false),...birdhouse(10,false),...birdhouse(20,true),[23,-11,3,2,'#8a8a90'],[25,-12,1,1,'#e8c060']],
 // the cooling-forge hatch
 'f11-hatch':[[-1,-1,18,1,BRASS],[0,0,16,1,'#2a2420']],
};

export default {
 n:11,name:'Ember Colossus',kit:['dash','strike','parry','portal'],
 folk:{
  oren:{cloak:'#5b4a3a',trim:'#c8883a',skin:'#cfa07e',cap:true},
  automaton:{cloak:'#5a5e66',trim:'#e4b787',skin:'#8a8e98',helm:true},
 },
 props,
 blurb:'The Foundry under Emberdeep, where the moulds are poured. Anvils throw you higher than anything yet, moulds set into iron where you strike them, and the Colossus pours into whatever is under its ladle.',
 outro:'The Foundry, stair to fissure. Three pours refused, and the Colossus went down through its own floor.',
 note:'Anvils, belts and moulds (bladefall-pcore-dev-foundry.js); the Colossus needs bladefall-pcore-dev-rbr-colossus.js. See the header of scripts/rbr-src/11-colossus.mjs.',
 rooms:[
  {id:'f11-stair',decor:[{k:'f11-crucible',c:1,r:8},{k:'f11-chain-long',c:24,r:8},{k:'f11-chain',c:30,r:4},{k:'f11-orders',c:33,r:17}],name:'The Deep Stair',exit:'right',hint:'A casting belt carries whatever stands on it',question:'The works below are running. Where does the floor take you?',
   people:[{who:'oren',c:36,r:17,face:-1,leave:'right',line:'Every mould in Emberdeep came from down here. Keep your distance.'}],map:stair.rows()},
  {id:'f11-anvil',decor:[{k:'f11-rack',c:6,r:17},{k:'f11-chain-long',c:13,r:8},{k:'f11-chain',c:21,r:4},{k:'f11-gear',c:33,r:7}],name:'The Anvil',exit:'right',hint:'Cut down on an anvil and it throws you far higher than a pod · a cut from the side only rings',question:'The works floor is higher than any jump and dash, and its face is hot. What answers a cut from above?',map:anvil.rows()},
  {id:'f11-gate',decor:[{k:'f11-gear',c:5,r:20},{k:'f11-chain-long',c:17,r:11},{k:'f11-chain',c:33,r:7}],name:'The Counterweight Gate',exit:'up',hint:'An anvil throws you as high wherever it stands, and gives the dash back',question:'One anvil reaches the counterweight shelf, not the gate above it. What is waiting on the shelf?',map:gate.rows()},
  {id:'f11-climb',decor:[{k:'f11-crucible',c:5,r:17},{k:'f11-chain-long',c:10,r:8},{k:'f11-rack',c:31,r:5}],name:'The Slab Climb',exit:'right',hint:'Strike an empty mould and it sets into iron for good · it will not set around you',question:'Nothing over the lava will hold you. What will, once you strike it?',map:climb.rows()},
  {id:'f11-hall',decor:[{k:'f11-rack',c:7,r:17},{k:'f11-chain-long',c:11,r:8},{k:'f11-gear',c:30,r:6}],name:'The Mould Hall',exit:'right',hint:'A struck mould is iron you can climb · an upward cut reaches the one above you',question:'Nothing in the hall reaches the works floor. What could you make into a wall?',map:hall.rows()},
  {id:'f11-crane',decor:[{k:'f11-hatch',c:1,r:17},{k:'f11-birds',c:10,r:17},{k:'f11-chain-long',c:23,r:8},{k:'f11-chain',c:35,r:4}],name:'The Crane',exit:'right',side:'down',hint:'A mould struck from above sets as you land on it',question:'The anvil throws you over the teeth, and there is nothing beyond them to land on. What will there be, once you cut it?',
   people:[{who:'automaton',c:4,r:17,face:1,quest:'automaton',line:'Please hold the left panel. I am building a birdhouse. My hands are too large.',lineDone:'It is holding. A bird is inspecting it. Do not move.'}],map:crane.rows()},
  {id:'f11-line',decor:[{k:'f11-rack',c:33,r:17},{k:'f11-chain',c:22,r:16},{k:'f11-chain-long',c:35,r:9}],name:'The Casting Line',exit:'right',hint:'A belt carries the lantern as well as you · a plate holds its hatch only while something rests on it',question:'The hatch is held from a room you cannot get into. What can go there for you?',map:line.rows()},
  {id:'f11-heap',decor:[{k:'f11-gear',c:0,r:17},{k:'f11-chain-long',c:18,r:13},{k:'f11-chain',c:26,r:9}],name:'The Slag Heap',exit:'right',hint:'Cracked stone gives way a moment after you stand on it · the roof stops any throw',question:'The anvil hangs over the lava under a low roof. Where do you come down once the roof has stopped you?',map:heap.rows()},
  {id:'f11-feeder',decor:[{k:'f11-crucible',c:33,r:17},{k:'f11-chain',c:14,r:13},{k:'f11-orders',c:6,r:8}],name:'The Feeder',exit:'right',hint:'A cast mould stops whatever the belt carries into it',question:'The belt carries the light straight past the plate. What would stop it there?',map:feeder.rows()},
  {id:'f11-look',decor:[{k:'f11-orders',c:1,r:7},{k:'f11-chain-long',c:17,r:8},{k:'f11-chain',c:25,r:4}],name:'The Overlook',exit:'down',
   people:[{who:'oren',c:5,r:7,face:1,line:'Machines don’t keep standing orders. Whatever it pours, don’t be under it.'}],hint:'Cut down as you land and a mould sets under you',question:'The pit floor is a long way down, and all of it is hot. Where do you stop on the way?',map:look.rows()},
  {id:'f11-pit',decor:[{k:'f11-rack',c:1,r:17},{k:'f11-chain-long',c:13,r:8}],name:'The Casting Pit',exit:'right',study:true,hint:'The Colossus pours where its ladle gathers · metal poured onto cold iron sets there',question:'It means to fill the mould over the lava. What happens if the mould is already full?',
   colossus:{rail:3,x:34,bays:[18],body:'right',leave:'right'},map:pit.rows()},
  {id:'f11-bed',decor:[{k:'f11-crucible',c:34,r:17},{k:'f11-chain-long',c:20,r:8}],name:'The Bed',exit:'right',study:true,hint:'It pours each mould in turn · a refused pour stands as an iron pillar · red chevrons: it is pouring on you',question:'Two moulds, and the gate opens only when both refuse it. Can you be at the second before the ladle?',
   colossus:{rail:2,x:20,bays:[15,24],body:'right',leave:'up',hunt:{every:2}},map:bed.rows()},
  {id:'f11-pour',decor:[{k:'f11-chain-long',c:5,r:8},{k:'f11-chain-long',c:34,r:8}],name:'The Last Pour',exit:'down',study:true,hint:'Refuse every pour and it has nothing left to stand on · when it hunts you, cold iron over your head takes the pour',question:'Three moulds, poured in turn, and every other time it pours on you instead. Where are you safe when it hunts?',
   colossus:{rail:2,x:20,bays:[10,30,20],speed:150,gather:45,rest:30,jam:30,body:'right',leave:'down',hunt:{every:2,lock:16}},map:pour.rows()},
 ],
 quests:[
  {id:'automaton',title:'Small Work',giver:'The War Automaton',from:'f11-crane',back:{c:6,r:17},
   keepsake:{id:'automaton-grip',name:'The Gripping Attachment',gives:'The automaton fits the roof on its fifth birdhouse, and a bird comes down to look. In the Fractured Colossus it opens the Automaton’s echo.'},
   rooms:[
    {id:'f11-q-forge',decor:[{k:'f11-crucible',c:2,r:2},{k:'f11-chain-long',c:15,r:8},{k:'f11-chain',c:29,r:4}],name:'The Cooling Forge',exit:'right',hint:'A mould struck as you fall sets under your feet · anvils give the dash back',question:'The forge floor is all hot and the way out is high. How many times can you make somewhere to land?',map:forge.rows()},
    {id:'f11-q-shelf',decor:[{k:'f11-rack',c:1,r:13},{k:'f11-chain-long',c:25,r:7}],name:'The Retrieval Shelf',exit:'up',hint:'A throw stops at whatever is over you · the shelf has a roof of its own',question:'The attachment is on the shelf under the roof. What will you stand on to reach it, and to leave?',map:shelf.rows()},
   ]},
 ],
};
