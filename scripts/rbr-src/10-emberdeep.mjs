// Room by Room · 10. Emberdeep. Source for public/bladefall-rbr-10-emberdeep.js (node scripts/rbr-src/gen.mjs 10).
// The base game's six rooms (The Cooling Road, The Pour Schedule, The Draw, The Held Bridge, The Pour Floor, The Deep
// Stair) as thirteen screens, in from the White Court's Ember Door and down the stair to the Foundry's floor. No boss.
// Kit: everything granted so far (dash, blade, parry, portal). The device is Part X's heat slab
// (bladefall-pcore-dev-ember.js): stone → molten → glass on the room's own clock, pips counting to the next change.
// Stone is floor and wall, molten burns from any side, glass is a floor from above and a door from below or the side.
// Every room is a study room (the clock starts with your first input). The owner's cuts in docs/charters/10-emberdeep
// hold: one line on the schedule, "wait, then jump", no falling weights, no screen shake. In order:
//   seen (The Ember Door: a slab hangs in its casting frame over the road)
//   → alone, as floor (The Cooling Road: one slab is the only step up from the channel)
//   → alone, glass as a door (The Draw: the seal fills its wall floor to roof; only glass lets you through)
//   → chained (The Pour Schedule: four slabs up, each setting a beat after the one before; Under the Spouts: three
//     decks sealed but for a hatch, glass from below, each hatch opening about when you can have walked to it)
//   → combined: the causeway's lift through a seal (The Held Bridge); the Outskirts' cracked stone, where you cannot
//     wait (The Stamping Line); the keep's lantern, whose glide is your wait (The Ledger Hall); the Gaol's pressure
//     pod up through a hatch (The Mould Pits); the portal shot through a window that only stone stops (The Casting Window)
//   → synthesis (The Pour Floor: two slabs on a beat, a hatch over cracked stone, the seal on the deck)
//   → the descent (The Deep Stair: a stair of slab steps that set one after another, so the dry stone runs down ahead
//     of you; The Stair Foot: the last slab in the seam to the Foundry, and Oren).
// People: Oren the courier at his bellows by the Ember Door, through the seal in The Draw, at the far end of the Held
// Bridge (he leaves each time), and waiting at the Stair Foot. Maker at the head of the Stamping Line, Breaker at its
// scrap end.
// Quest (optional, branch): The Quota · Maker and Breaker, up the return chute from the Stamping Line. The Return Chute
// (three decks, hatches out of reach of a jump alone at alternate ends, each over cracked stone, thorned walls) and The
// Counting Loft (three slabs on a quick beat, a seal into the latch alcove, the stamped piece on the latch, and the
// chute back down to the line). The keepsake turns both quota counters green and puts lunch on the bench
// (ed-counter@quota-piece, ed-bench@quota-piece).
// bladefall-pcore-dev-rbr-emberdeep.js emits a `slab` event (touching a slab that is not molten) for skip hunts.
// SKIPS: see the end of this header.
import {grid} from './build.mjs';

// Every slab room waits for the first input (study): the pour clock starts when you move, so you can read the pips.
const ST={study:true};

// 1 · The Ember Door — in from the White Court. A heat slab hangs in its casting frame over the road: seen, not needed.
const door=grid().frame();
door.rect(0,18,39,22,'#').rect(33,15,39,17,'#').rect(39,11,39,14,'.').rect(14,12,21,12,'E').put(3,17,'P');

// 2 · The Cooling Road — alone: one slab over the channel is the only step up to the far road.
const cooling=grid().frame();
cooling.rect(0,18,8,22,'#').rect(9,21,27,21,'^').rect(9,22,27,22,'#').rect(28,9,39,22,'#').rect(27,10,27,20,'<')
 .rect(39,4,39,8,'.').rect(15,13,20,13,'E').put(3,17,'P');

// 3 · The Draw — glass alone, as a door: the seal fills the wall from floor to roof, and only glass lets you through.
const draw=grid().frame();
draw.rect(0,18,39,22,'#').rect(19,1,20,17,'#').rect(19,15,20,17,'E').rect(39,14,39,17,'.').put(3,17,'P');

// 4 · The Pour Schedule — chained: four slabs up over the channel, each setting a beat after the one before it.
const schedule=grid().frame();
schedule.rect(0,18,5,22,'#').rect(6,21,34,21,'^').rect(6,22,34,22,'#').rect(35,9,39,22,'#').rect(34,10,34,20,'<')
 .rect(8,17,11,17,'E').rect(15,15,18,15,'E').rect(22,13,25,13,'E').rect(29,11,32,11,'E').rect(39,4,39,8,'.').put(2,17,'P');
// Slab k sets `beat` frames after slab k-1 (offset −k·beat on a molten → glass → stone cycle).
const chain=(n,beat,d={molten:60,glass:45,stone:110},first=0)=>{const cyc=d.molten+d.glass+d.stone;
 return Array.from({length:n},(_,k)=>({...d,start:'molten',offset:(((first-k*beat)%cyc)+cyc)%cyc}));};

// Glass first at clock T: the offset for a slab that starts molten.
const glassAt=(T,d={molten:60,glass:45,stone:120})=>{const cyc=d.molten+d.glass+d.stone;return {...d,start:'molten',offset:((d.molten-T)%cyc+cyc)%cyc};};

// 5 · Under the Spouts — glass from below, chained: three casting decks, each sealed but for one hatch, the
// hatches at alternate ends. Each hatch turns glass about when you can have walked to it from the last.
const spouts=grid().frame();
spouts.rect(0,18,39,22,'#').rect(1,15,38,15,'#').rect(1,12,38,12,'#').rect(1,9,38,9,'#')
 .rect(30,15,32,15,'E').rect(7,12,9,12,'E').rect(30,9,32,9,'E').rect(39,5,39,8,'.').put(23,17,'P');

// 6 · The Held Bridge — with the causeway's lift: the lift runs when you board it, through a seal that keeps its
// own time. Nothing goes over the seal and nothing under it.
const bridge=grid().frame();
bridge.rect(0,18,6,22,'#').rect(7,21,33,21,'^').rect(7,22,33,22,'#').rect(7,18,9,18,'Z').rect(34,18,39,22,'#')
 .rect(20,1,21,11,'#').rect(20,12,21,17,'E').rect(20,20,21,22,'#').rect(20,19,21,19,'^').rect(39,14,39,17,'.').put(2,17,'P');

// 7 · The Stamping Line — with the Outskirts' cracked stone: cracked stone gives way under you and the slab will
// not hurry, so you wait on the slab, never on the crack. Maker and Breaker work the line; the return chute goes up
// past the counters from the west end (the quest).
const line=grid().frame();
line.rect(0,18,7,22,'#').rect(8,21,31,21,'^').rect(8,22,31,22,'#').rect(32,8,39,22,'#').rect(31,9,31,20,'<')
 .rect(11,16,13,16,'~').rect(18,14,21,14,'E').rect(26,10,28,10,'~').rect(39,3,39,7,'.')
 .rect(6,1,7,12,'#').rect(1,0,5,0,'.').rect(1,9,2,9,'=').put(3,17,'P');

// 8 · The Ledger Hall — with the keep's lantern: carried, it slows your fall to a glide, and molten takes it home.
// The plate that holds the door is past the casting bed, and the bed is molten when you set off.
const ledger=grid().frame();
ledger.rect(1,1,36,3,'#').rect(0,6,8,22,'#').rect(9,21,28,21,'^').rect(9,22,28,22,'#').rect(19,12,24,12,'E')
 .rect(29,13,39,22,'#').put(32,12,'_').rect(35,4,36,12,'H').rect(39,9,39,12,'.').put(5,5,'l').put(2,5,'P');

// 9 · The Mould Pits — with the Gaol's pressure pod: down into it is up, and it gives the dash back. The way up is a
// hatch in the gantry over the pits, out of reach of any jump and dash, and it keeps its own time.
const moulds=grid().frame();
moulds.rect(0,18,9,22,'#').rect(10,21,38,21,'^').rect(10,22,38,22,'#').rect(1,6,38,6,'#').rect(12,6,15,6,'E')
 .put(13,14,'R').rect(39,1,39,5,'.').put(3,17,'P');

// 10 · The Casting Window — with the portal: the window in the casting house is too high to reach and over thorns.
// A shot passes it while it is not stone; your end goes on the pale stone in the casting house's roof.
const castw=grid().frame();
castw.rect(0,18,39,22,'#').rect(4,18,5,18,'%').rect(26,1,39,22,'#').rect(27,3,38,8,'.').rect(39,5,39,8,'.')
 .rect(27,2,34,2,'%').rect(26,3,26,7,'E').rect(25,9,25,17,'<').put(2,17,'P');

// 11 · The Pour Floor — everything the pour has taught: two slabs on a beat, cracked stone under a hatch (so you
// cannot wait for the hatch where you stand), and the seal on the deck above.
const pourfloor=grid().frame();
pourfloor.rect(0,18,5,22,'#').rect(6,21,38,21,'^').rect(6,22,38,22,'#').rect(1,11,38,11,'#').rect(22,11,24,11,'E')
 .rect(8,17,11,17,'E').rect(15,16,18,16,'E').rect(21,14,25,14,'~').rect(32,1,33,10,'#').rect(32,8,33,10,'E')
 .rect(39,7,39,10,'.').put(2,17,'P');

// 12 · The Deep Stair — where the plateau ends: a stair of slab steps down into the sump, each step setting a
// beat after the one above it, so the dry stone runs down the stair ahead of you and the melt follows behind.
const stair=grid().frame();
stair.rect(0,5,5,6,'#').rect(1,21,38,21,'^').rect(1,22,38,22,'#').rect(31,19,38,22,'#').rect(33,19,35,22,'.')
 .rect(7,7,9,7,'E').rect(11,9,13,9,'E').rect(15,11,17,11,'E').rect(19,13,21,13,'E').rect(23,15,25,15,'E').rect(27,17,29,17,'E')
 .put(2,4,'P');
// Step k: solid for 75 frames in every 180, a beat of 30 after step k−1.
const stairSlabs=()=>Array.from({length:6},(_,k)=>glassAt(50+30*k,{molten:105,glass:30,stone:45}));

// 13 · The Stair Foot — the foundry floor. A last slab at the seam, Oren waiting, and the Foundry's ladles beyond.
const foot=grid().frame();
foot.rect(0,18,39,22,'#').rect(17,18,22,18,'E').rect(17,19,22,22,'#').rect(39,14,39,17,'.').put(3,17,'P');

// The Quota (quest rooms), up the return chute from the Stamping Line. The chute: three decks, each sealed but for
// a hatch out of reach of a jump alone, the hatches at alternate ends; the deck under the next hatch is cracked, so
// you cannot stand and wait for it. The walls are thorned.
const chute=grid().frame();
chute.rect(1,1,11,22,'#').rect(28,1,38,22,'#').rect(12,18,27,22,'#').rect(12,1,12,17,'>').rect(27,1,27,17,'<').rect(13,0,26,0,'.')
 .rect(13,13,26,13,'#').rect(23,13,26,13,'E').rect(13,13,17,13,'~')
 .rect(13,8,26,8,'#').rect(13,8,16,8,'E').rect(22,8,26,8,'~')
 .rect(13,3,26,3,'#').rect(23,3,26,3,'E').put(15,17,'P');
// The counting loft: three slabs on a quick beat up to the latch alcove, a seal into it, and the stamped piece on the
// latch. The return chute drops from the alcove back to the line.
const loft=grid().frame();
loft.rect(0,18,5,22,'#').rect(6,21,30,21,'^').rect(6,22,30,22,'#').rect(31,1,38,22,'#').rect(32,6,37,9,'.').rect(31,7,31,9,'E')
 .rect(30,1,30,6,'<').rect(30,10,30,20,'<').rect(36,10,37,22,'.')
 .rect(9,15,11,15,'E').rect(17,13,19,13,'E').rect(25,11,27,11,'E').put(34,9,'*').put(2,17,'P');

// Props: rectangles [dx,dy,w,h,colour] from the tile's left edge and the floor line under it (dy up is negative).
const IRON='#5a4c46',IRONL='#8a7a70',HOT='#ff9a4a',GLOW='#ffd27a';
const links=n=>{const r=[];for(let i=0;i<n;i++){r.push([3,-6-i*6,2,5,'#5a4a44']);r.push([3,-6-i*6,1,1,'#9a8478']);}return r;};
const props={
 'ed-chain':links(4),'ed-chain-long':links(11),'ed-chain-14':links(14),'ed-chain-16':links(16),
 // The Ember Door: the White Court's cold still in the arch behind you.
 'ed-door':[[0,-34,3,34,'#4a4458'],[13,-34,3,34,'#4a4458'],[0,-37,16,3,'#6a6480'],[3,-31,10,31,'#16202e'],[4,-28,8,1,'#9ad8f0'],[5,-20,1,1,'#cfefff'],[9,-14,1,1,'#cfefff'],[7,-24,1,1,'#cfefff']],
 // Oren's bellows on its frame, and the forge's standing orders.
 'ed-bellows':[[0,-2,16,2,'#3a2a22'],[1,-10,13,8,'#6e4a2a'],[1,-10,13,1,'#b0743e'],[4,-9,1,6,'#4a3018'],[9,-9,1,6,'#4a3018'],[14,-8,4,2,IRON],[17,-7,2,1,HOT]],
 'ed-ledger':[[2,-10,1,10,'#4a3a2c'],[0,-12,7,3,'#6a5038'],[1,-13,5,1,'#d8cfb4'],[3,-13,1,1,'#7a1f1e']],
 'ed-orders':[[0,-20,1,20,'#4a3a2c'],[11,-20,1,20,'#4a3a2c'],[0,-20,12,10,'#3a2c26'],[1,-19,10,8,'#c8b48a'],[2,-17,7,1,'#5a4a3a'],[2,-15,8,1,'#5a4a3a'],[2,-13,5,1,'#5a4a3a']],
 // A spout hanging from the roof (place it in the tile under the roof); its lip glows.
 'ed-spout':[[2,-8,4,4,IRON],[1,-4,6,2,IRONL],[2,-2,4,1,'#3a2c26'],[3,-1,2,1,HOT]],
 // A mould the size of a soldier, stood on end; and scrap turned back at the seal.
 'ed-mould':[[0,-22,10,22,'#3e302c'],[0,-22,10,1,'#6a5a52'],[3,-19,4,4,'#1e1614'],[2,-15,6,7,'#1e1614'],[3,-8,1,6,'#1e1614'],[6,-8,1,6,'#1e1614']],
 'ed-scrap':[[0,-3,12,3,'#4a403c'],[2,-5,4,2,'#6a5e58'],[7,-6,3,3,'#5a4e48'],[4,-7,2,2,IRONL]],
 'ed-winch':[[0,-12,1,12,'#4a3a2c'],[11,-12,1,12,'#4a3a2c'],[0,-13,12,1,'#6a5a48'],[2,-10,8,6,'#6e5236'],[2,-8,8,1,'#c8a060'],[1,-1,10,1,'#3a2e24']],
 // The stamping line: the belt, the quota counters, the bench. With the piece looped through both counters the lamps
 // are green and the bench has lunch on it.
 'ed-belt':[[0,-3,64,2,'#3a3230'],[0,-3,64,1,'#6a5e58'],[2,-1,2,1,IRON],[14,-1,2,1,IRON],[26,-1,2,1,IRON],[38,-1,2,1,IRON],[50,-1,2,1,IRON],[60,-1,2,1,IRON],[8,-5,4,2,'#9a8a7a'],[30,-5,4,2,'#9a8a7a']],
 'ed-counter':[[3,-14,2,14,IRON],[0,-20,8,7,'#3a3230'],[1,-19,6,4,'#1a1412'],[2,-18,1,2,'#d84a3a'],[5,-18,1,2,'#d84a3a']],
 'ed-counter@quota-piece':[[3,-14,2,14,IRON],[0,-20,8,7,'#3a3230'],[1,-19,6,4,'#1a1412'],[2,-18,1,2,'#6ad86a'],[5,-18,1,2,'#6ad86a']],
 'ed-bench':[[0,-4,14,2,'#5a4632'],[1,-2,1,2,'#3a2e22'],[12,-2,1,2,'#3a2e22']],
 'ed-bench@quota-piece':[[0,-4,14,2,'#5a4632'],[1,-2,1,2,'#3a2e22'],[12,-2,1,2,'#3a2e22'],[2,-7,5,3,'#c8a06a'],[2,-7,5,1,'#e8c890'],[9,-6,3,2,'#d8d2c0']],
 // The latch on the counting loft, and the dead ladle jammed over its set mould at the foot of the stair.
 'ed-latch':[[0,-10,2,10,IRON],[2,-8,5,2,IRONL],[6,-9,2,4,IRON]],
 'ed-ladle':[[10,-40,2,26,IRON],[2,-16,18,10,'#4a3c36'],[2,-16,18,1,IRONL],[0,-14,3,2,IRON],[19,-14,3,2,IRON],[9,-30,4,8,'#3a3030'],[10,-26,2,4,'#6a5a52'],[0,-6,22,6,'#2e2624'],[0,-6,22,1,'#5a4a44']],
 'ed-mark':[[1,-1,6,1,'#c8b48a'],[3,-1,2,1,'#e8d8b0']],
};

export default {
 n:10,name:'Emberdeep',kit:['dash','strike','parry','portal'],
 folk:{
  oren:{cloak:'#5b4a3a',trim:'#c8883a',skin:'#cfa07e',cap:true},
  maker:{cloak:'#7a5236',trim:'#e3a571',skin:'#d6ae88',hood:true},
  breaker:{cloak:'#4e4a48',trim:'#9a8f86',skin:'#c69a7a',helm:true},
 },
 props,
 blurb:'Under the White Court, the buried forge is still pouring for nobody. Nothing here is floor for good: a heat slab is stone, then molten, then glass, on a clock of its own.',
 outro:'Emberdeep, door to stair foot. The pour never waited for you; you waited for it.',
 note:'Heat slabs (bladefall-pcore-dev-ember.js); bladefall-pcore-dev-rbr-emberdeep.js adds a slab event for skip hunts. See the header of scripts/rbr-src/10-emberdeep.mjs.',
 rooms:[
  {id:'e10-door',name:'The Ember Door',exit:'right',...ST,slabs:[{stone:120,molten:60,glass:45,start:'molten'}],
   hint:'A heat slab keeps its own clock: stone, then molten, then glass',question:'The works is running with nobody in it. What does the slab over the road do while you watch?',
   people:[{who:'oren',c:9,r:17,face:-1,leave:'right',line:'Court’s cold still on you? Enjoy it. Nothing down here’s done cooling.'}],
   decor:[{k:'ed-door',c:0,r:17},{k:'ed-bellows',c:11,r:17},{k:'ed-chain-14',c:14,r:11},{k:'ed-chain-14',c:21,r:11},{k:'ed-ledger',c:28,r:17},{k:'ed-orders',c:35,r:14}],map:door.rows()},
  {id:'e10-cooling',name:'The Cooling Road',exit:'right',...ST,slabs:[{stone:120,molten:60,glass:45,start:'molten'}],
   hint:'Stone and glass hold you; molten burns · the pips count down to the next change',question:'The only step over the channel is molten. When is it a step?',
   decor:[{k:'ed-chain-16',c:15,r:12},{k:'ed-chain-16',c:20,r:12},{k:'ed-mould',c:31,r:8},{k:'ed-mould',c:34,r:8},{k:'ed-scrap',c:2,r:17}],map:cooling.rows()},
  {id:'e10-draw',name:'The Draw',exit:'right',...ST,slabs:[{stone:90,molten:60,glass:40,start:'stone'}],
   hint:'Glass lets you through from the side · stone that sets around you waits until you leave',question:'The seal is wall from floor to roof. When is it not a wall?',
   people:[{who:'oren',c:14,r:17,face:1,leave:'right',line:'The seal turns iron back. Lets me through. Don’t ask.'}],
   decor:[{k:'ed-scrap',c:15,r:17},{k:'ed-scrap',c:9,r:17},{k:'ed-orders',c:4,r:17},{k:'ed-mould',c:30,r:17}],map:draw.rows()},
  {id:'e10-schedule',name:'The Pour Schedule',exit:'right',...ST,slabs:chain(4,70).reverse(),
   hint:'Each slab sets a beat after the one before it',question:'Four steps, and never two of them ready at once for long. Where do you wait?',
   decor:[{k:'ed-spout',c:9,r:1},{k:'ed-spout',c:16,r:1},{k:'ed-spout',c:23,r:1},{k:'ed-spout',c:30,r:1},{k:'ed-mould',c:36,r:8}],map:schedule.rows()},
  {id:'e10-spouts',name:'Under the Spouts',exit:'right',...ST,slabs:[glassAt(350),glassAt(210),glassAt(70)],
   hint:'Glass lets you up through it from below, and holds you once you are on it',question:'Each deck is sealed but for one hatch. When does a hatch let you up?',
   decor:[{k:'ed-spout',c:6,r:1},{k:'ed-spout',c:16,r:1},{k:'ed-spout',c:34,r:1},{k:'ed-scrap',c:3,r:17},{k:'ed-scrap',c:20,r:14},{k:'ed-mould',c:20,r:8},{k:'ed-mould',c:24,r:8},{k:'ed-chain-long',c:12,r:8}],map:spouts.rows()},
  {id:'e10-bridge',name:'The Held Bridge',exit:'right',...ST,zips:[[24,0]],slabs:[{stone:100,molten:60,glass:45,start:'stone'}],
   hint:'A lift runs only once you are on it · the seal keeps its own time',question:'The lift will carry you through the seal whatever it is. When do you step on?',
   people:[{who:'oren',c:36,r:17,face:-1,leave:'right',line:'I used to be the weight that held this. Now it holds itself.'}],
   decor:[{k:'ed-winch',c:2,r:17},{k:'ed-chain-long',c:15,r:11},{k:'ed-chain-long',c:27,r:11},{k:'ed-scrap',c:35,r:17}],map:bridge.rows()},
  {id:'e10-line',name:'The Stamping Line',exit:'right',side:'up',...ST,slabs:[{stone:90,molten:100,glass:40,start:'molten'}],
   people:[{who:'maker',c:6,r:17,face:1,quest:'quota',line:'I finish one, he smashes it. Every time. The counters are up the chute.',
     lineDone:'Mine’s green. His is green. Break time.'},
    {who:'breaker',c:34,r:7,face:-1,quest:'quota',line:'It comes down, I scrap it. Nobody’s been in that office for months.',
     lineDone:'Same piece, counted twice. Sit. She brought lunch for two.'}],
   hint:'Cracked stone gives way a moment after you stand on it · a slab keeps its own time',question:'The cracked stone won’t wait and the slab won’t hurry. When do you leave the last safe place?',
   decor:[{k:'ed-belt',c:0,r:17},{k:'ed-counter',c:1,r:8},{k:'ed-bench',c:3,r:17},{k:'ed-spout',c:19,r:1},{k:'ed-belt',c:32,r:7},{k:'ed-scrap',c:36,r:7},{k:'ed-counter',c:38,r:7}],map:line.rows()},
  {id:'e10-ledger',name:'The Ledger Hall',exit:'right',...ST,slabs:[{stone:100,molten:150,glass:45,start:'molten'}],
   hint:'Carried, the lantern slows your fall · molten stone takes it home',question:'The casting bed is molten when you set off. How long can you stay in the air?',
   decor:[{k:'ed-ledger',c:7,r:5},{k:'ed-orders',c:29,r:12},{k:'ed-chain-long',c:19,r:11},{k:'ed-chain-long',c:24,r:11}],map:ledger.rows()},
  {id:'e10-moulds',name:'The Mould Pits',exit:'right',...ST,slabs:[{stone:100,molten:90,glass:45,start:'stone'}],
   hint:'Dash down into a pressure pod and it throws you up, with your dash',question:'The hatch is out of reach of any jump and dash, and it keeps its own time. When do you leave the ledge?',
   decor:[{k:'ed-mould',c:6,r:17},{k:'ed-scrap',c:1,r:17},{k:'ed-mould',c:25,r:5},{k:'ed-mould',c:29,r:5},{k:'ed-mould',c:33,r:5}],map:moulds.rows()},
  {id:'e10-window',name:'The Casting Window',exit:'right',...ST,portalMode:'one',portals:[{color:'orange',c:4,r:18,face:'u'}],slabs:[{stone:90,molten:60,glass:45,start:'stone'}],
   hint:'A portal shot passes a slab that is not stone',question:'The window is out of reach, and only stone stops a shot. When do you fire?',
   decor:[{k:'ed-mark',c:14,r:17},{k:'ed-scrap',c:18,r:17},{k:'ed-mould',c:30,r:8},{k:'ed-mould',c:34,r:8},{k:'ed-orders',c:9,r:17}],map:castw.rows()},
  {id:'e10-pourfloor',name:'The Pour Floor',exit:'right',...ST,
   slabs:[glassAt(330,{molten:60,glass:45,stone:100}),glassAt(230,{molten:60,glass:45,stone:100}),glassAt(130,{molten:60,glass:45,stone:110}),glassAt(60,{molten:60,glass:45,stone:110})],
   hint:'Everything the pour has taught, on one floor',question:'Two steps on a beat, a hatch over cracked stone, a seal on the deck. Where can you wait, and where can’t you?',
   decor:[{k:'ed-spout',c:9,r:12},{k:'ed-spout',c:16,r:12},{k:'ed-orders',c:5,r:10},{k:'ed-mould',c:12,r:10},{k:'ed-mould',c:16,r:10},{k:'ed-scrap',c:28,r:10}],map:pourfloor.rows()},
  {id:'e10-stair',name:'The Deep Stair',exit:'down',...ST,slabs:stairSlabs(),
   hint:'A run of slabs sets one after another · the dry stone moves, so walk with it',question:'The floor of every flight melts and sets in a wave. How fast do you walk?',
   decor:[{k:'ed-ladle',c:16,r:4},{k:'ed-scrap',c:1,r:4},{k:'ed-mould',c:36,r:18}],map:stair.rows()},
  {id:'e10-foot',name:'The Stair Foot',exit:'right',...ST,slabs:[{stone:150,molten:120,glass:45,start:'molten'}],
   hint:'The foundry floor keeps the same clock as the forge',question:'The last slab sits in the seam to the Foundry. Do you still read it?',
   people:[{who:'oren',c:30,r:17,face:-1,line:'Foundry’s through there. Still pouring. Nobody to pour for.'}],
   decor:[{k:'ed-ladle',c:6,r:17},{k:'ed-mould',c:25,r:17},{k:'ed-scrap',c:13,r:17},{k:'ed-orders',c:33,r:17}],map:foot.rows()},
 ],
 quests:[
  {id:'quota',title:'The Quota',giver:'Maker and Breaker',from:'e10-line',back:{c:3,r:17},
   keepsake:{id:'quota-piece',name:'The Stamped Piece',gives:'Maker and Breaker share lunch on the bench while the same piece goes round both counters. In the Fractured Emberdeep it opens the workers’ echo.'},
   rooms:[
    {id:'e10-q-chute',name:'The Return Chute',exit:'up',...ST,slabs:[glassAt(330,{molten:60,glass:40,stone:90}),glassAt(200,{molten:60,glass:40,stone:90}),glassAt(70,{molten:60,glass:40,stone:90})],
     hint:'No hatch is in reach of a jump alone · cracked stone will not let you wait under the next one',
     question:'Each hatch is over cracked stone and out of reach of a jump. When do you start across?',decor:[{k:'ed-counter',c:20,r:17},{k:'ed-scrap',c:19,r:12},{k:'ed-scrap',c:18,r:7}],map:chute.rows()},
    {id:'e10-q-loft',name:'The Counting Loft',exit:'down',...ST,slabs:[glassAt(165,{molten:60,glass:30,stone:60}),...chain(3,40,{molten:80,glass:25,stone:45},40).reverse()],
     hint:'The loft’s slabs set on a quick beat · the latch is behind the seal',
     question:'Three steps that never hold long, and a seal at the top. Can you keep the beat all the way to the latch?',decor:[{k:'ed-counter',c:2,r:17},{k:'ed-counter',c:32,r:9},{k:'ed-latch',c:34,r:9}],map:loft.rows()},
   ]},
 ],
};
