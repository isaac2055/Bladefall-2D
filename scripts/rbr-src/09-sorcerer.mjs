// Room by Room · 9. The Frost Sorcerer (the White Court). Source for public/bladefall-rbr-09-sorcerer.js
// (node scripts/rbr-src/gen.mjs 09).
// The base game's White Court (aqueduct latch, West Sluice, the service wheel, the Sluice Refuge, Thaw Court and its
// high cache, the Glassworks, the Petition Gallery, the quiet overlook, the court doors, the White Court) as thirteen
// screens: ten on the road, three for the Sorcerer. Arrival is by the aqueduct from Frostfell.
// Kit: everything granted so far (dash, blade, parry, portal). The device is the White Court's water
// (bladefall-pcore-dev-water.js), used for its freezing: a strike into water freezes the whole pool into ice that
// thaws on a clock you can watch; a condenser freezes every pool in the room. In order:
//   water seen (The Aqueduct: swim it, dive under the arch)
//   → alone: the strike freezes (West Sluice: a siphon too wide to cross)
//   → the clock (The Service Wheel: across for the catch, and the ice is gone on the way back; strike again)
//   → frozen water is stone (The Sluice Refuge: climb the frozen overflow)
//   → chained (Thaw Court: three thorn-rimmed basins, each on its own clock, struck as you come over them)
//   → in the air, with a crystal (The High Cache: freeze the second fall before you reach it)
//   → the condenser, with the lantern (The Glassworks: hands full, so the condenser freezes the pool)
//   → with the portal (Petition Gallery: the pool is one body, so the ice that carries you to the pier also hides
//     the pale stone; shoot when it thaws, from the top of your jump, and the floor portal throws you to the door)
//   → with cracked stone (The Overlook: the ice and a cracked ledge, two floors that leave)
//   → synthesis (The Cold Antechamber: condenser, pool, fall, and a second fall its clock does not reach)
//   → the Frost Sorcerer, three rooms (The White Court, The Glass Gallery, The Last Ward).
// The Sorcerer is new code, public/bladefall-pcore-dev-rbr-sorcerer.js (+ -view.js). He stands on his pool, and while
// it is water nothing touches him; frozen, he stands on ice, staggered, and one cut is a wound. His frost (foe bolts,
// so the parry and the blade answer them) freezes any water it touches, his own included. The White Court: strike his
// pool from the bank and run the ice. The Glass Gallery: he is up on a basin behind a fall; the condenser freezes both
// (or his own frost, aimed at you through the fall, freezes the fall for you). The Last Ward: his water is a cup on a
// shelf out of reach; stand close under him and his frost falls into it; off his ice he drops to the floor. Two
// wounds, and he kneels. Rooms with him wait for the first input (study). The Last Ward (7.277): three wounds, and every
// other cast is icicles (opt-in `icicles`): they grow on the roof over you and to either side, fall, freeze water they
// fall into (his cup too) and stick in stone as ice stakes for a while (cover from his orbs, and obstacles).
// People: Vey keeps the sluice now (The Service Wheel); Ada the glassworker in the refuge; the Creature Keeper (shown
// as "Handler") at her creature's pen on the Glassworks gallery.
// Quest (optional, branch): A Little Winter, up the Glassworks' west wall: The Cold Intake (a chimney of two falls
// on short clocks; the high one is struck from the low one) and The Pen Line (a portal down through the pool past a
// wall that reaches the roof, a fall struck on the way up out of the floor portal, her spare glove on the shelf). The
// keepsake (the glove) leaves the creature asleep on a patch of frost in its pen (s9-pen@creature-glove).
// SKIPS (node scripts/rbr-skip.mjs <room> --without <event> --plain):
//   West Sluice (introduction, --without freeze): no skip found.
//   SKIPLIST
import {grid} from './build.mjs';

// 1 · The Aqueduct — water, seen: the channel from Frostfell is calm and too wide to jump. Swim it.
const aqueduct=grid().frame();
aqueduct.rect(0,13,7,22,'#').rect(8,14,31,20,'w').rect(8,21,31,22,'#').rect(32,13,39,22,'#').rect(39,8,39,12,'.')
 .rect(18,1,21,17,'#').put(3,12,'P');

// 2 · West Sluice — the strike freezes: the sluice drags everything to its grate, and it is too wide to cross.
const sluice=grid().frame();
sluice.rect(0,14,6,22,'#').rect(7,15,32,20,'w').rect(7,21,32,21,'^').rect(33,13,39,22,'#').rect(32,13,32,14,'<')
 .rect(39,9,39,12,'.').put(3,13,'P');

// 3 · The Service Wheel — the clock: the wheel's catch (a stake) is across the sluice and the door is on this
// side, up the chimney. The ice will not wait for the way back.
const wheel=grid().frame();
wheel.rect(0,14,7,22,'#').rect(8,15,31,20,'w').rect(8,21,31,21,'^').rect(32,14,39,22,'#')
 .rect(6,1,7,9,'#').rect(1,3,5,3,'G').rect(1,0,5,0,'.').put(35,13,'c').put(3,13,'P');

// 4 · The Sluice Refuge — frozen water is stone: the overflow falls down the refuge wall to its grate, and the way
// on is a ledge above it whose face is thorned. Frozen, the fall is a pillar you can climb.
const refuge=grid().frame();
refuge.rect(0,18,19,22,'#').rect(20,6,22,20,'w').rect(20,21,22,21,'^').rect(20,22,22,22,'#')
 .rect(23,7,39,22,'#').rect(23,8,23,20,'<').rect(39,2,39,6,'.').put(4,17,'P');

// 5 · Thaw Court — chained: three basins climb the court, thorn-rimmed, each on its own clock. The ice is the only
// footing, so each one is struck as you come over it.
const court=grid().frame();
court.rect(0,19,5,22,'#').rect(6,19,6,22,'#').put(6,16,'^').rect(6,17,6,18,'<').rect(7,16,15,20,'w').rect(7,21,15,21,'^')
 .rect(16,12,26,22,'#').rect(17,12,24,15,'w').rect(17,16,24,16,'^').put(16,12,'^').rect(16,13,16,20,'<').rect(25,12,26,12,'^')
 .rect(27,8,39,22,'#').rect(28,8,34,11,'w').rect(28,12,34,12,'^').put(27,8,'^').rect(27,9,27,20,'<').put(35,8,'^')
 .rect(39,3,39,7,'.').put(3,18,'P');

// 6 · The High Cache — with a crystal: up one frozen fall, across on the dash and the crystal, and the second fall
// has to be struck in the air before you reach it.
const cache=grid().frame();
cache.rect(0,18,8,22,'#').rect(9,6,10,20,'w').rect(9,21,10,21,'^').rect(11,21,25,21,'^').rect(26,4,27,20,'w').rect(26,21,27,21,'^')
 .rect(28,21,29,21,'^').rect(30,5,39,22,'#').rect(30,6,30,20,'<').rect(39,1,39,4,'.').put(18,6,'o').put(4,17,'P');

// 7 · The Glassworks — the condenser, with the lantern: the light has to reach the kiln plate across the pool, and
// with it in your hands the blade is no use. The gallery's face is thorned, so there is no climbing back for it.
// The Keeper's pen is on the gallery; her cold intake (the quest) is up the west wall, through the roof.
const glass=grid().frame();
glass.rect(0,9,10,22,'#').rect(11,10,11,15,'>').rect(11,16,31,20,'w').rect(11,21,31,21,'^').rect(32,16,39,22,'#')
 .rect(39,12,39,15,'H').rect(1,0,4,0,'.').put(1,8,'l').put(3,8,'n').put(35,15,'_').put(5,8,'P');

// 8 · Petition Gallery — with the portal: one pool runs under the pier. Frozen, it carries you to the pier; frozen,
// it also hides the only pale stone, at the bottom under the far half. A portal shot passes water, not ice.
const gallery=grid().frame();
gallery.rect(0,13,5,22,'#').rect(6,13,32,20,'w').rect(6,21,32,21,'^').rect(22,21,23,21,'%').rect(16,8,18,12,'#')
 .rect(33,12,39,22,'#').rect(35,12,36,12,'%').rect(37,3,39,3,'#').put(37,3,'<').rect(38,4,38,11,'<').rect(39,1,39,2,'.').put(2,12,'P');

// 9 · The Overlook — with cracked stone: the ice is a floor you make, the cracked ledge a floor that leaves, and the
// way out is too high to reach from either alone.
const overlook=grid().frame();
overlook.rect(0,13,5,22,'#').rect(6,14,33,20,'w').rect(6,21,33,21,'^').rect(34,6,39,22,'#').rect(34,7,34,20,'<')
 .rect(29,10,31,10,'~').rect(39,1,39,5,'.').put(2,12,'P');

// 10 · The Cold Antechamber — everything the court has taught: a condenser, a pool to cross, a fall to climb, and a
// second fall across the gap that the condenser's clock will not reach in time.
const ante=grid().frame();
ante.rect(0,15,6,22,'#').rect(7,15,17,20,'w').rect(7,21,17,21,'^').rect(18,15,18,22,'#')
 .rect(19,3,20,14,'w').rect(19,15,20,15,'^').rect(19,16,20,22,'#').rect(21,21,32,21,'^').rect(33,4,34,20,'w').rect(33,21,35,21,'^')
 .rect(36,5,39,22,'#').rect(36,6,36,20,'<').rect(39,1,39,4,'.').put(4,13,'n').put(2,14,'P');

// 11 · The White Court — the Sorcerer, first: he stands on his pool at the far end, and the pool is his ward. Strike
// the near end and the whole pool goes to ice under him; run it and cut him before it thaws.
const white=grid().frame();
white.rect(0,15,7,22,'#').rect(8,15,33,20,'w').rect(8,21,33,21,'^').rect(34,15,39,22,'#').rect(39,11,39,14,'G').put(3,14,'P');

// 12 · The Glass Gallery — he stands on a basin high on the gallery, behind a fall. A condenser freezes every pool at
// once: the fall becomes a pillar, and his basin goes to ice under him.
const gglass=grid().frame();
gglass.rect(0,18,24,22,'#').rect(25,6,26,20,'w').rect(25,21,26,21,'^').rect(27,21,29,21,'^').rect(30,8,39,22,'#').rect(31,8,37,10,'w').put(30,8,'^').rect(30,9,30,20,'<')
 .rect(39,1,39,7,'G').put(6,16,'n').put(3,17,'P');

// 13 · The Last Ward — he stands on a cupful of water on a shelf high on each wall, out of any jump and dash. His
// frost freezes what it touches: stand close under the shelf, so his line runs down through his own water, and on the
// ice he loses his footing and falls. Two wounds; he kneels.
const ward=grid().frame();
ward.rect(0,18,39,22,'#').rect(34,6,38,7,'#').put(34,6,'w').put(33,6,'^').put(33,7,'<')
 .rect(1,6,5,7,'#').put(5,6,'w').put(6,6,'^').put(6,7,'>').rect(39,14,39,17,'G').put(20,17,'P');

// The Keeper's errand (quest rooms), up the Glassworks' east wall. The intake: two falls make a chimney. The low one
// is reached from the floor; the high one comes down the intake shaft to a thorned buttress, out of reach, and only
// clinging to the low fall does the blade reach it. Up the high one and out of the shaft. Each is on its own short clock.
const intake=grid().frame();
intake.rect(0,21,30,22,'#').rect(19,3,28,8,'#').rect(29,0,29,8,'>').rect(30,0,30,0,'.')
 .rect(25,9,26,16,'w').rect(25,17,26,17,'^').rect(25,18,26,18,'#')
 .rect(31,0,32,8,'w').rect(31,9,32,9,'^').rect(31,10,32,22,'#').rect(30,10,30,20,'>').rect(33,1,38,22,'#').put(4,20,'P');
// The pen's cold line: a portal down through the water to the only pale stone, out of the floor beyond the wall,
// a fall struck on the way up, and her glove on the shelf at the top.
const pen=grid().frame();
pen.rect(0,8,6,22,'#').rect(7,15,16,20,'w').rect(7,21,16,21,'^').rect(11,21,12,21,'%').rect(17,1,17,22,'#').rect(16,2,16,14,'<')
 .rect(18,20,38,22,'#').rect(21,20,22,20,'%').rect(24,3,25,15,'w').rect(24,16,25,16,'^').rect(24,17,25,19,'#')
 .rect(26,3,38,4,'#').rect(26,5,26,8,'<').rect(34,0,36,0,'.').put(31,2,'*').put(3,7,'P');

// Props: rectangles [dx,dy,w,h,colour] from the tile's left edge and the floor line under it (dy up is negative).
const GLASS='#bfe3ef',GLASSD='#7fa9bb',BRASS='#c8a050',WOOD='#5a4632',STONE='#6a7480';
const props={
 // The service wheel: a paddle wheel on its post, the catch on its axle.
 's9-wheel':[[3,-26,2,26,WOOD],[-4,-30,16,2,'#7a6a52'],[-4,-16,16,2,'#7a6a52'],[-4,-30,2,16,'#7a6a52'],[10,-30,2,16,'#7a6a52'],[3,-30,2,16,'#8a7a5a'],[-4,-24,16,2,'#8a7a5a'],[2,-25,4,4,BRASS]],
 // Ada's molds cooling on a board: glass vessels, one still glowing.
 's9-molds':[[0,-3,14,3,WOOD],[1,-8,3,5,GLASS],[1,-8,3,1,'#ffffff'],[5,-9,3,6,GLASSD],[9,-7,4,4,'#ffb070'],[10,-8,2,1,'#ffe0b0']],
 // The high cache: a lockbox on the ledge.
 's9-lockbox':[[0,-6,9,6,'#4a4a52'],[0,-6,9,1,'#8a8a96'],[3,-4,3,2,BRASS]],
 // The kiln the lantern lights, and the Keeper's pen: a low fence, the creature pacing, red and hot.
 's9-kiln':[[0,-14,10,14,'#5a4a44'],[1,-13,8,1,'#8a7060'],[3,-9,4,5,'#2a1a14'],[4,-8,2,3,'#ff9a4a']],
 's9-pen':[[0,-6,1,6,WOOD],[13,-6,1,6,WOOD],[0,-5,14,1,'#7a6040'],[0,-2,14,1,'#7a6040'],[4,-4,5,3,'#c8502a'],[8,-5,2,2,'#c8502a'],[9,-5,1,1,'#ffd070'],[3,-3,1,1,'#e86a3a']],
 // With the glove kept: a patch of frost in one corner, and the creature asleep on it, curled.
 's9-pen@creature-glove':[[0,-6,1,6,WOOD],[13,-6,1,6,WOOD],[0,-5,14,1,'#7a6040'],[0,-2,14,1,'#7a6040'],[1,-1,7,1,'#e8fbff'],[2,-3,5,2,'#b8402a'],[2,-3,2,1,'#c8502a'],[6,-2,1,1,'#ffd070']],
 // The doors of the White Court, tall and pale.
 's9-doors':[[0,-30,14,30,'#d8dee4'],[0,-30,14,1,'#ffffff'],[6,-29,2,29,'#9aa4ae'],[2,-16,2,2,BRASS],[10,-16,2,2,BRASS]],
 // The cold intake: a grille in the floor, frost on its bars, and its pipe.
 's9-intake':[[0,-2,16,2,STONE],[1,-2,1,2,'#2a3038'],[4,-2,1,2,'#2a3038'],[7,-2,1,2,'#2a3038'],[10,-2,1,2,'#2a3038'],[13,-2,1,2,'#2a3038'],[0,-3,16,1,'#e8fbff'],[6,-20,4,18,STONE],[6,-20,4,1,'#9aa4ae']],
};

export default {
 n:9,name:'Frost Sorcerer',kit:['dash','strike','parry','portal'],
 folk:{
  ada:{cloak:'#6a5a50',trim:'#e8c9a0',skin:'#d9b38c',cap:true},
  handler:{cloak:'#7a3a2a',trim:'#e0a070',skin:'#cfa98a',hood:true},
 },
 props,
 blurb:'The White Court, from the aqueduct to the Sorcerer’s pool. Water you swim in; a blade that freezes it; ice that thaws on a clock you can watch.',
 outro:'The White Court, end to end. The Sorcerer kneels on his own ice, and the stair down to Emberdeep is open.',
 note:'Freezing pools (bladefall-pcore-dev-water.js); the Sorcerer needs bladefall-pcore-dev-rbr-sorcerer.js. See the header of scripts/rbr-src/09-sorcerer.mjs.',
 rooms:[
  {id:'s9-aqueduct',name:'The Aqueduct',exit:'right',hint:'In water, jump is a stroke and down is a dive',question:'The aqueduct’s arch comes down into the water. What is under it?',
   map:aqueduct.rows()},
  {id:'s9-sluice',name:'West Sluice',exit:'right',hint:'Strike water and the whole pool freezes · the ticks along the ice are its clock',question:'The sluice drags everything down to its grate, and it is too wide to cross. What does the blade do to water?',
   currents:[{c:7,r:15,w:26,h:6,dy:180}],map:sluice.rows()},
  {id:'s9-wheel',name:'The Service Wheel',exit:'up',thaw:150,hint:'Ice thaws when its ticks run out · strike the water again',question:'The wheel’s catch is across the sluice and the door is on this side. Will the ice still be there on the way back?',
   currents:[{c:8,r:15,w:24,h:6,dy:180}],
   people:[{who:'vey',c:5,r:13,face:1,line:'Water I understand. It goes downhill. The wheel’s catch is past the far side.'}],
   decor:[{k:'s9-wheel',c:37,r:13}],map:wheel.rows()},
  {id:'s9-refuge',name:'The Sluice Refuge',exit:'right',thaw:200,hint:'Frozen water is stone while it lasts · you can climb it',question:'The way on is above the overflow, and its ledge is thorned. What is a waterfall, frozen?',
   currents:[{c:20,r:6,w:3,h:15,dy:320}],
   people:[{who:'ada',c:9,r:17,face:1,line:'Hit the overflow hard enough and it stands up like glass.'}],
   decor:[{k:'bench',c:4,r:17},{k:'s9-molds',c:12,r:17},{k:'hearth',c:15,r:17}],map:refuge.rows()},
  {id:'s9-court',name:'Thaw Court',exit:'right',thaw:120,hint:'Every pool keeps its own clock · strike each as you come over it',question:'Three basins climb the court and their rims are thorned. When do you strike each one?',
   currents:[{c:7,r:16,w:9,h:5,dy:180},{c:17,r:12,w:8,h:4,dy:180},{c:28,r:8,w:7,h:4,dy:180}],
   decor:[],map:court.rows()},
  {id:'s9-cache',name:'The High Cache',exit:'right',thaw:200,hint:'A strike freezes a fall you are still flying at',question:'The second fall would sweep you down to the grate. When do you freeze it?',
   currents:[{c:9,r:6,w:2,h:15,dy:200},{c:26,r:4,w:2,h:17,dy:200}],
   decor:[{k:'s9-lockbox',c:35,r:4}],map:cache.rows()},
  {id:'s9-glass',name:'The Glassworks',exit:'right',side:'up',thaw:300,hint:'Strike a condenser and every pool in the room freezes · with the lantern in your hands you cannot strike',
   question:'The light has to reach the kiln plate, and with it in your hands the blade is useless. What else can freeze the pool?',
   currents:[{c:11,r:16,w:21,h:5,dy:180}],
   people:[{who:'handler',c:7,r:8,face:1,quest:'creature',line:'Don’t touch his back. He’s too hot to sleep. The cold intake’s up through the roof.',
    lineDone:'Look at his feet. He only does that asleep.'}],
   decor:[{k:'s9-kiln',c:33,r:15},{k:'s9-pen',c:8,r:8}],map:glass.rows()},
  {id:'s9-gallery',name:'Petition Gallery',exit:'right',thaw:200,portalMode:'one',portals:[{color:'orange',c:35,r:12,face:'u'}],
   hint:'A portal shot passes through water, not ice · a floor portal remembers how far you fell',
   question:'The only pale stone is under the far half of the pool. When can a shot reach it?',
   currents:[{c:6,r:13,w:27,h:8,dy:160}],
   decor:[],map:gallery.rows()},
  {id:'s9-overlook',name:'The Overlook',exit:'right',thaw:150,hint:'Ice and cracked stone are both floors that leave · each keeps its own time',
   question:'The way out is too high to reach from the ice. What stands between the ice and the ledge, and for how long?',
   currents:[{c:6,r:14,w:28,h:7,dy:180}],
   decor:[],map:overlook.rows()},
  {id:'s9-ante',name:'The Cold Antechamber',exit:'right',thaw:240,hint:'Everything the court has taught, on one clock',
   question:'A pool, a fall, and a second fall across the gap, on one clock. Which do you freeze at once, and which on the way?',
   currents:[{c:7,r:15,w:11,h:6,dy:180},{c:19,r:3,w:2,h:12,dy:200},{c:33,r:4,w:2,h:17,dy:200}],
   decor:[{k:'s9-doors',c:37,r:4}],map:ante.rows()},
  {id:'s9-white',name:'The White Court',exit:'right',study:true,hint:'He stands on his pool and the pool is his ward · on ice he is only a man',
   question:'Nothing touches him while he stands on water. What does the blade do to his pool?',
   currents:[{c:8,r:15,w:26,h:6,dy:180}],
   sorcerer:{posts:[{c:30,r:14}],hits:1,leave:'right'},decor:[],map:white.rows()},
  {id:'s9-gglass',name:'The Glass Gallery',exit:'right',study:true,thaw:360,hint:'A condenser freezes every pool in the room · ice stops his frost',
   question:'He is up on the gallery behind the fall. What freezes the fall and his basin at once?',
   currents:[{c:25,r:6,w:2,h:15,dy:200}],
   sorcerer:{posts:[{c:34,r:7}],hits:1,leave:'right'},decor:[],map:gglass.rows()},
  {id:'s9-ward',name:'The Last Ward',exit:'right',study:true,thaw:120,hint:'His frost freezes the water it touches, his own too · staff raised, icicles fall where you stand and stick as ice',
   question:'His water is out of reach of the blade, and every other cast brings the roof down. Where do you stand for each?',
   sorcerer:{posts:[{c:34,r:5,fall:{c:31,r:17}},{c:5,r:5,fall:{c:8,r:17}}],hits:3,leave:'kneel',icicles:{every:2,n:3,gap:4,stake:150}},decor:[],map:ward.rows()},
 ],
 quests:[
  {id:'creature',title:'A Little Winter',giver:'The Creature Keeper',from:'s9-glass',back:{c:3,r:8},
   keepsake:{id:'creature-glove',name:'The Bite-Proof Glove',gives:'The creature sleeps on a patch of frost in its pen, and wakes only to snap at the glove. In the Fractured Sorcerer it opens the Keeper’s echo.'},
   rooms:[
    {id:'s9-q-intake',name:'The Cold Intake',exit:'up',thaw:70,hint:'Clinging to one fall, the blade strikes the other · each keeps its own clock',
     question:'Two falls make a chimney, and neither stays ice for the whole climb. When do you strike each one again?',
     currents:[{c:25,r:9,w:2,h:8,dy:200},{c:31,r:0,w:2,h:9,dy:320}],decor:[{k:'s9-intake',c:8,r:20}],map:intake.rows()},
    {id:'s9-q-pen',name:'The Pen Line',exit:'up',thaw:150,portalMode:'one',portals:[{color:'orange',c:21,r:20,face:'u'}],
     hint:'The wall runs to the roof · the only way past it is down through the water',
     question:'The glove is beyond a wall that reaches the roof. Where does the other side of the pale stone come out, and what is beside it on the way up?',
     currents:[{c:7,r:15,w:10,h:6,dy:170},{c:24,r:3,w:2,h:13,dy:200}],decor:[],map:pen.rows()},
   ]},
 ],
};
