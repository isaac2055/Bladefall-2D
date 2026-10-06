// Room by Room · 31. The Fractured Colossus (7.280, hand-made; replaces fracture.mjs's reflection of 11). Source for
// public/bladefall-rbr-31-f-foundry.js (node scripts/rbr-src/gen.mjs 31). Brief: docs/plans/fractured-hard.md (stage III).
// The Foundry, running the other hand. The region's device is still the Foundry's (bladefall-pcore-dev-foundry.js):
// anvils (N: a downward cut throws you far higher than a pod and gives the dash back) and moulds (U: struck, they set
// into iron for good). Nothing here is a rest: the floors you land on are fault stone (25), the glass from the court
// (29) turns your hands, your shade (27) walks the works behind you, tears (13) cross what no throw reaches. In order:
//   the anvil, cracked (The Cracked Stair: fault perches out to an anvil, the throw through a window of glass)
//   → off the glass (Off the Glass: the anvil's throw through a pane, a jump off its far face, swapped, to a crystal)
//   → the mould, chained (The Mould Bridge: a row of moulds over the pit, set as you land, the glass in the middle)
//   → moulds up a shaft (The Cold Shaft: a mould set as you land, an upward cut to the next, fault perches between)
//   → the crane (The Crane: thrown over the teeth onto a mould you set as you land; the automaton's echo)
//   → with the tear (The Furnace Mouth: an anvil throw into a tear over a thorned wall, the glass in a second tear's mouth)
//   → under a low roof (The Slag Heap: fault stone, an anvil under a roof that stops the throw, the glass)
//   → with the shade (The Hot Line: anvils as stepping stones, glass either side of the second, your shade behind)
//   → synthesis (The Overlook: down to the pit and up again, every tool of the works once)
//   → the Ember Colossus, three rooms, harder: more bays, shorter gathers, the hunt from the first room, and its
//     arena floor is fault stone between stone islands: wherever a pour lands on the fault, the floor there falls.
// Echo: The Sixth Birdhouse (q.needs the base keepsake automaton-grip), down the Crane's hatch: The Cooling Forge and
// The Retrieval Shelf, the region's hardest rooms.
import {grid} from './build.mjs';
import base from './11-colossus.mjs';
const shell=()=>grid().frame();
const room=(id,name,hint,question,m,extra={})=>({id:'ff31-'+id,name,exit:'left',hint,question,map:m.rows(),...extra});
const F={fuse:10,spread:5};

// 1 · The Cracked Stair — two cracked perches far out over the pit, each a jump and a dash from the last (land, and
// go: the crack is already running); a jump down onto the anvil, its throw up to a window of glass in a thorned
// wall, and past the window a crystal and a second pane in the mouth of the way out: through the window your hands
// are turned, through the second pane they are yours again. Your shade follows you out along the perches.
const stair=shell();
stair.rect(34,18,39,22,'#').rect(1,21,33,21,'^').rect(1,22,33,22,'#').rect(24,16,25,16,'T').rect(14,16,15,16,'T').put(11,17,'N')
 .rect(8,1,8,5,'|').rect(8,7,8,20,'#').put(8,6,'^').rect(7,7,7,20,'<').rect(9,7,9,20,'>')
 .rect(0,5,1,22,'#').rect(2,6,2,20,'>').rect(2,5,6,5,'^').rect(3,1,3,4,'|').put(6,3,'o').rect(0,1,0,4,'.').put(36,17,'P');

// 2 · Off the Glass — the anvil's throw ends in a dash through a pane set in a thorned wall; the crystal is far past
// it, so you jump off the glass's far face, swapped, then dash through the crystal, the second pane and a cracked step.
const anvils=shell();
anvils.rect(36,15,39,22,'#').rect(1,21,35,21,'^').rect(1,22,35,22,'#').put(27,18,'N')
 .rect(23,11,23,20,'#').rect(22,11,22,20,'<').rect(24,11,24,20,'>').put(23,10,'^').rect(23,1,23,9,'|')
 .put(15,4,'o').rect(12,1,12,20,'|').rect(5,10,7,10,'T')
 .rect(0,4,3,22,'#').rect(4,4,4,20,'>').rect(0,1,0,3,'.').put(37,14,'P');

// 3 · The Mould Bridge — a row of empty moulds over the pit: cut each one as you come down onto it and it sets
// under your feet. The glass stands over the middle of the bridge, and your shade walks it behind you.
const bridge=shell();
bridge.rect(34,18,39,22,'#').rect(1,21,33,21,'^').rect(1,22,33,22,'#').rect(28,17,29,17,'U').rect(22,16,23,16,'U').rect(16,15,17,15,'U')
 .rect(13,1,13,20,'|').rect(8,14,9,14,'U').rect(3,13,4,13,'U').rect(0,12,1,22,'#').rect(0,7,0,11,'.').put(36,17,'P');

// 4 · The Cold Shaft — up a shaft between hot walls: a mould set as you land, another above it, a cracked perch,
// the glass splitting the shaft's head, and a last mould under the mouth, set as you come down onto it swapped.
const shaft=shell();
shaft.rect(1,1,11,22,'#').rect(29,1,38,22,'#').rect(12,1,12,17,'>').rect(28,1,28,17,'<').rect(12,18,28,22,'#').rect(13,17,25,17,'^')
 .rect(19,15,20,15,'U').rect(14,12,15,12,'U').rect(22,9,25,9,'T').rect(20,1,20,7,'|').rect(15,4,16,4,'U').rect(13,0,17,0,'.').put(26,17,'P');

// 5 · The Crane — the anvil throws you over a wall of teeth, and beyond it is nothing to land on until you cut the
// mould as you come down. The glass stands on the far side. The automaton's echo waits by its hatch (the echo).
const crane=shell();
crane.rect(30,18,39,22,'#').rect(37,18,38,22,'.').rect(1,21,29,21,'^').rect(1,22,29,22,'#').put(27,17,'N')
 .rect(19,9,21,20,'#').rect(19,8,21,8,'^').rect(18,9,18,20,'<').rect(22,9,22,20,'>').rect(13,14,14,14,'U').rect(10,1,10,20,'|')
 .rect(6,12,7,12,'U').put(6,6,'o').rect(0,4,2,22,'#').rect(3,5,3,20,'>').rect(0,1,0,3,'.').put(33,17,'P');

// 6 · The Furnace Mouth — an anvil's throw carries you up to a tear's mouth over a thorned wall; the tear sets you on
// a cracked ledge, and one dash down through the glass carries straight into the mouth of a second tear, which climbs
// to the way out. Your shade rides behind you.
const mouth=shell();
mouth.rect(34,18,39,22,'#').rect(1,21,33,21,'^').rect(1,22,33,22,'#').put(29,16,'N')
 .rect(20,6,20,20,'#').put(20,5,'^').rect(19,6,19,20,'<').rect(21,6,21,20,'>').rect(13,5,16,5,'T').rect(13,14,17,14,'#').rect(13,13,17,13,'^')
 .rect(10,1,10,5,'#').rect(9,1,9,5,'>').rect(11,1,11,5,'<').rect(10,6,10,20,'|')
 .rect(0,4,1,22,'#').rect(2,5,2,20,'>').rect(0,1,0,3,'.').put(36,17,'P');

// 7 · The Slag Heap — cracked stone out to an anvil hung under a low roof: the roof stops any throw, so the anvil is
// only a step; through the glass onto the next cracked step, and the last anvil, out from under the roof, is the
// throw to the high way out. Your shade follows you along the heap.
const heap=shell();
heap.rect(33,18,39,22,'#').rect(1,21,32,21,'^').rect(1,22,32,22,'#').rect(27,16,30,16,'T').put(22,16,'N').rect(16,1,26,11,'#')
 .rect(15,1,15,20,'|').rect(10,14,12,14,'T').put(6,16,'N').rect(0,4,2,22,'#').rect(3,5,3,20,'>').rect(0,1,0,3,'.').put(36,17,'P');

// 8 · The Hot Line — two anvils in a line used as stepping stones, a pane before and after the second, a cracked
// step and the wall up to the way out; your shade a second behind, so no perch here waits.
const hot=shell();
hot.rect(36,18,39,22,'#').rect(1,21,35,21,'^').rect(1,22,35,22,'#').put(29,17,'N').rect(21,1,21,20,'|')
 .put(15,15,'N').rect(11,1,11,20,'|').rect(5,10,7,10,'T').rect(0,6,2,22,'#').rect(3,7,3,20,'>').rect(0,1,0,5,'.').put(36,17,'P');

// 9 · The Overlook — down into the pit and up again: cracked steps down, moulds set as you land, the glass, an
// anvil off the pit floor's last mould, and the overlook's far ledge.
const look=shell();
look.rect(33,6,39,22,'#').rect(1,21,32,21,'^').rect(1,22,32,22,'#').rect(27,9,30,9,'T').rect(22,13,23,13,'U').rect(16,16,17,16,'U')
 .rect(14,1,14,20,'|').rect(8,14,9,20,'#').rect(8,13,9,13,'^').rect(7,14,7,20,'<').rect(10,14,10,20,'>')
 .put(5,18,'N').put(5,4,'o').rect(0,3,2,22,'#').rect(3,4,3,20,'>').rect(0,1,0,2,'.').put(36,5,'P');

// 10 · The Casting Pit — the Colossus, first, harder: two moulds, and the floor between the stone islands is fault
// stone; wherever the pour lands on it, the floor falls there.
const pit=shell();
pit.rect(1,18,38,22,'#').rect(1,18,4,18,'#').rect(5,18,34,18,'T').rect(14,18,16,18,'#').rect(24,18,26,18,'#').rect(5,19,34,20,'.')
 .rect(5,21,34,21,'^').rect(11,13,12,13,'U').rect(30,13,31,13,'U').rect(0,1,0,4,'G').rect(0,5,0,17,'#').put(36,17,'P');

// 11 · The Bed — three moulds poured in turn, and every other move it hunts you; the floor between its islands
// cracks wherever it pours.
const bed=shell();
bed.rect(1,18,38,22,'#').rect(5,18,34,18,'T').rect(5,19,34,20,'.').rect(5,21,34,21,'^').rect(12,18,13,18,'#').rect(19,18,20,18,'#')
 .rect(26,18,27,18,'#').rect(12,12,13,12,'U').rect(20,10,21,10,'U').rect(31,12,32,12,'U').put(16,16,'N').rect(0,1,0,4,'G').rect(0,5,0,17,'#').put(36,17,'P');

// 12 · The Last Pour — four moulds, faster, hunting every other move, and nothing under you but fault stone and two
// anvils; the fourth refusal sends it down through the fissure.
const pour=shell();
pour.rect(1,18,38,22,'#').rect(4,18,35,18,'T').rect(4,19,35,20,'.').rect(4,21,13,21,'^').rect(26,21,35,21,'^').rect(14,18,25,18,'G')
 .rect(14,19,25,22,'.').rect(4,12,5,12,'U').rect(15,9,16,9,'U').rect(24,12,25,12,'U').rect(33,12,34,12,'U').put(12,16,'N').put(28,16,'N').put(37,17,'P');

// Echo · The Sixth Birdhouse (the Automaton's echo; sealed until the base keepsake, the Gripping Attachment, is
// held). Down the Crane's hatch. The region's two hardest rooms.
// The Cooling Forge — dropped in over a hot floor: a mould set as you fall onto it, an anvil, the glass, a cracked
// perch, an anvil again, a mould, and out over the hot wall. Your shade follows you down.
const forge=shell();
forge.rect(34,4,39,5,'#').rect(1,21,38,21,'^').rect(1,22,38,22,'#').rect(32,12,33,12,'U').put(27,16,'N').rect(22,1,22,20,'|')
 .rect(16,9,18,9,'T').put(12,15,'N').rect(6,9,7,9,'U').rect(0,5,3,22,'#').rect(4,6,4,20,'>').rect(0,1,0,4,'.').put(36,3,'P');
// The Retrieval Shelf — the attachment is on a shelf under its own roof, high in the far corner. Off the ledge onto
// an anvil cut on the way down, through the glass, a cracked ledge, a crystal, the glass again, the second anvil
// and up into the shelf's mouth. Your shade climbs behind you: nowhere here waits.
const shelf=shell();
shelf.rect(33,18,39,22,'#').rect(1,21,32,21,'^').rect(1,22,32,22,'#').put(29,18,'N')
 .rect(24,9,26,20,'#').rect(23,9,23,20,'<').rect(27,9,27,20,'>').put(24,8,'^').put(26,8,'^').rect(25,1,25,8,'|')
 .rect(16,10,20,10,'T')
 .rect(10,1,10,11,'#').rect(10,17,10,20,'#').rect(10,12,10,16,'|').rect(11,1,11,11,'<').rect(11,17,11,20,'<').rect(9,1,9,11,'>').rect(9,17,9,20,'>')
 .put(6,18,'N').rect(1,6,4,6,'T').put(2,5,'*').rect(1,1,4,1,'#').rect(5,0,8,0,'.').put(36,17,'P');

export default {
 n:31,name:'The Fractured Colossus',kit:['dash','strike','parry','portal'],
 folk:base.folk,props:base.props,
 blurb:'The Foundry, running the other hand. The anvils still throw and the moulds still set, but nothing you land on waits for you, and the Colossus pours onto a floor that cracks.',
 outro:'The Colossus goes down through its own cracked floor. Up ahead, the floor and ceiling trade places.',
 note:'Hand-made for the Fractured ramp (docs/plans/fractured-hard.md). Anvils and moulds (bladefall-pcore-dev-foundry.js), fault stone, mirror panes, the shade, tears; the Colossus (bladefall-pcore-dev-rbr-colossus.js) with the opt-in crack field.',
 rooms:[
  room('stair','The Cracked Stair','Cracked stone will not wait · an anvil cut from above throws you high, with your dash · your shade a second behind','Two cracked perches, an anvil, and a window of glass in a thorned wall. Once you are through, which way do you jump off the glass?',stair,
   {mirror:{},fault:F,shade:{delay:50},decor:[{k:'f11-crucible',c:38,r:8},{k:'f11-chain-long',c:18,r:8},{k:'f11-orders',c:36,r:17}]}),
  room('anvils','Off the Glass','The anvil gives the dash back · glass is a wall to all but a dash: climb it, jump from it','The throw ends at the glass, and the crystal is far beyond it. Which way do you jump off glass once your hands have turned?',anvils,
   {mirror:{},fault:F,decor:[{k:'f11-rack',c:36,r:17},{k:'f11-chain-long',c:29,r:8},{k:'f11-gear',c:6,r:5}]}),
  room('bridge','The Mould Bridge','Cut a mould as you come down onto it and it sets under you · your shade walks the bridge behind you','Five empty moulds and the glass over the middle. Can you set each one before you reach it?',bridge,
   {mirror:{},shade:{delay:50},decor:[{k:'f11-crucible',c:36,r:17},{k:'f11-chain-long',c:21,r:8}]}),
  room('shaft','The Cold Shaft','Cut a mould as you come down onto it · the glass splits the shaft’s head','A mould, a mould above it, a cracked perch, the glass and a mould under the mouth. How do you climb what is not there yet?',shaft,
   {exit:'up',mirror:{},fault:F,shade:{delay:50},decor:[{k:'f11-chain',c:24,r:4}]}),
  room('crane','The Crane','The anvil throws you over the teeth · cut the mould as you come down','Over the teeth there is nothing to land on. What will there be, once you cut it, and which way is left beyond the glass?',crane,
   {side:'down',mirror:{},shade:{delay:50},
    people:[{who:'automaton',c:35,r:17,face:-1,quest:'automaton-echo',line:'I made a sixth birdhouse. My hands are still too large for the roof.',lineDone:'Please hold the panel. Gently. A bird is near.',name:'THE AUTOMATON’S ECHO'}],
    decor:[{k:'f11-hatch',c:37,r:17},{k:'f11-birds',c:31,r:17},{k:'f11-chain-long',c:16,r:8}]}),
  room('mouth','The Furnace Mouth','An anvil throws you into the tear · it sets you on cracked stone · the glass stands in the mouth of a second tear','The tear’s mouth is high over the pit, past a thorned wall. What throws you there, and can one dash take the glass and the second tear together?',mouth,
   {mirror:{},fault:{fuse:8,spread:4},shade:{delay:50},lines:[{a:[28,4],b:[15,4],setDown:true},{a:[7,10],b:[1,3]}],decor:[{k:'f11-chain-long',c:30,r:8},{k:'f11-crucible',c:37,r:17}]}),
  room('heap','The Slag Heap','The roof stops any throw · cracked stone gives way a moment after you touch it · your shade a second behind','The anvil hangs under a low roof, and your shade comes along the heap behind you. Where do you come down once the roof has stopped you, and which way is left?',heap,
   {mirror:{},fault:F,shade:{delay:50},decor:[{k:'f11-gear',c:37,r:17},{k:'f11-chain',c:13,r:9}]}),
  room('hot','The Hot Line','Anvils in a line are stepping stones too · glass on both sides of the second · your shade a second behind','Nothing in the line waits, and your shade walks where you walked. Which way is left at each anvil?',hot,
   {mirror:{},fault:F,shade:{delay:50},decor:[{k:'f11-rack',c:36,r:17},{k:'f11-chain-long',c:14,r:8}]}),
  {...room('look','The Overlook','Down to the pit floor and up again · every tool of the works once','Cracked steps, moulds, the glass, a mould swapped and an anvil off the pit floor, and your shade behind you. Where do you stop on the way? Nowhere.',look,
   {mirror:{},fault:F,shade:{delay:55},decor:[{k:'f11-orders',c:38,r:5},{k:'f11-chain-long',c:22,r:8}]})},
  room('pit','The Casting Pit','The Colossus pours where its ladle gathers · metal on cold iron sets there · its pours crack the fault floor','Two moulds, and the floor between the islands falls wherever it pours. Where do you stand?',pit,
   {study:true,fault:{fuse:12,spread:5},colossus:{rail:3,x:30,bays:[30,11],gather:50,rest:30,jam:40,speed:100,body:'left',leave:'left',crack:true},
    decor:[{k:'f11-rack',c:38,r:17},{k:'f11-chain-long',c:26,r:8}]}),
  room('bed','The Bed','It pours each mould in turn and hunts you every other move · the floor cracks where it pours','Three moulds, an anvil, and a floor that will not hold under a pour. Can you be at each mould before the ladle?',bed,
   {study:true,fault:{fuse:12,spread:5},colossus:{rail:2,x:31,bays:[31,12,20],speed:120,gather:45,rest:30,jam:35,body:'left',leave:'up',crack:true,hunt:{every:2,lock:16}},
    decor:[{k:'f11-crucible',c:37,r:17},{k:'f11-chain-long',c:19,r:8}]}),
  room('pour','The Last Pour','Refuse every pour and it has nothing left to stand on · when it hunts you, cold iron over your head takes the pour','Four moulds, poured fast, and under you nothing but cracked stone and two anvils. Where are you safe when it hunts?',pour,
   {study:true,exit:'down',fault:{fuse:12,spread:5},colossus:{rail:2,x:33,bays:[33,5,24,16],speed:160,gather:40,rest:26,jam:28,body:'left',leave:'down',crack:true,hunt:{every:2,lock:14}},
    decor:[{k:'f11-chain-long',c:34,r:8},{k:'f11-chain-long',c:5,r:8}]}),
 ],
 quests:[
  {id:'automaton-echo',title:'The Sixth Birdhouse',giver:'The automaton’s echo',from:'ff31-crane',back:{c:33,r:17},needs:'automaton-grip',
   keepsake:{id:'automaton-remembered',name:'The War Automaton, remembered',gives:'A bird nested in the sixth birdhouse, and the automaton kept very still. Shown at the end.'},
   rooms:[
    room('q-forge','The Cooling Forge','A mould cut as you fall sets under you · anvils give the dash back · your shade follows you down','The forge floor is all hot and the way out is high. How many times can you make somewhere to land, and which way is left by then?',forge,
     {mirror:{},fault:F,shade:{delay:50},decor:[{k:'f11-crucible',c:37,r:2},{k:'f11-chain-long',c:24,r:8}]}),
    {...room('q-shelf','The Retrieval Shelf','Cut each anvil as you come down · the window in the wall is glass · even the shelf is cracked stone','The attachment is on a cracked shelf under its roof, two anvils and two panes away. Which way is left at the window, and where is your dash when you reach the shelf?',shelf,
     {mirror:{},fault:F,
      people:[{who:'automaton',name:'THE AUTOMATON’S ECHO',c:4,r:5,quest:'automaton-echo',line:'It is holding. The bird is inside.',lineDone:'We should stop moving. It is sleeping.'}],
      decor:[{k:'f11-rack',c:38,r:19},{k:'f11-chain-long',c:15,r:7}]}),exit:'up'},
   ]},
 ],
};
