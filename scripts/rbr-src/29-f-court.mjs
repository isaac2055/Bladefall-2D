// Room by Room · 29. The Fractured Sorcerer (7.280, hand-made; replaces fracture.mjs's reflection of 9). Source for
// public/bladefall-rbr-29-f-court.js (node scripts/rbr-src/gen.mjs 29). Brief: docs/plans/fractured-hard.md (stage III).
// The White Court seen in its own glass. The region's device is still the court's freezing water
// (bladefall-pcore-dev-water.js: a strike freezes a pool, the ice thaws on a short clock); the new thing is the
// mirror pane (bladefall-pcore-dev-mirror.js, glyph |): glass that only a dash passes, and coming through it
// left and right swap until the next pane. Known tools asked alongside: fault stone (T, from 25), the shade
// (from 27), the tear (from 13), crystals. In order:
//   the pane alone (The Cold Pane: a pillar to climb on the far side, swapped, and a crystal at its head)
//   → panes chained (The Pane Stair: three panes, and every perch between them is fault stone)
//   → with the ice (The Mirrored Sluice: freeze, run, dash the glass on the ice, strike the second pool swapped)
//   → falls (The Two Falls: a chimney of frozen falls on short clocks, glass across its head)
//   → chained basins (Thaw Court: three basins and a pane between the second and third)
//   → the Glassworks (the Keeper's echo; the condenser and the glass)
//   → in the air (The High Cache: falls struck in flight, a crystal, a tear over the grate)
//   → with fault stone (The Overlook: the ice and the fault, two floors that leave)
//   → with the shade (The Cold Antechamber: everything on one clock, your shade a second behind)
//   → the Frost Sorcerer, three rooms, harder: shorter thaw, more wounds, and his court is glazed. His orb comes
//     through the glass; return it while swapped (the parry's aim swaps too) into his pool.
// Echo: Under the Jaw (q.needs the base keepsake creature-glove), up the Glassworks' east wall: The Cold Intake and
// The Pen Line, the region's hardest rooms.
import {grid} from './build.mjs';
import base from './09-sorcerer.mjs';
const shell=()=>grid().frame();
const room=(id,name,hint,question,m,extra={})=>({id:'fs29-'+id,name,exit:'left',hint,question,map:m.rows(),...extra});

// 1 · The Cold Pane — the pane alone. Glass from floor to roof beside the spawn ledge; past it, a pillar with a
// thorned head is the only thing to hold, and the crystal over its face gives back the dash the glass took. The
// second pane is the way out, and your hands are the wrong way round until you are through it.
const pane=shell();
pane.rect(31,18,39,22,'#').rect(1,21,30,21,'^').rect(1,22,30,22,'#').rect(30,1,30,20,'|')
 .rect(19,9,21,20,'#').rect(19,8,21,8,'^').put(22,6,'o').rect(17,1,17,20,'|').rect(0,13,16,22,'#').rect(0,8,0,12,'.').put(35,17,'P');

// 2 · The Pane Stair — chained: four panes, each perch between them fault stone, and a crystal before the last.
const stair=shell();
stair.rect(33,18,39,22,'#').rect(1,21,32,21,'^').rect(1,22,32,22,'#').rect(32,1,32,20,'|')
 .rect(23,17,26,17,'T').rect(20,1,20,20,'|').rect(12,15,15,15,'T').rect(10,1,10,20,'|').put(9,9,'o').rect(5,1,5,20,'|').rect(0,13,4,22,'#').rect(0,8,0,12,'.').put(36,17,'P');

// 3 · The Mirrored Sluice — with the ice: freeze the first pool and run it; the glass stands over the divider's
// thorned head, so it is dashed from the ice, and the second pool has to be struck on the way down, swapped.
const sluice=shell();
sluice.rect(33,14,39,22,'#').rect(22,15,32,20,'w').rect(22,21,32,21,'^').rect(20,12,21,22,'#').rect(20,11,21,11,'^')
 .rect(20,1,21,10,'|').rect(10,15,19,20,'w').rect(10,21,19,21,'^').rect(0,6,9,22,'#').rect(0,1,0,5,'.').put(36,13,'P');

// 4 · The Two Falls — a short fall and a tall one make a chimney over the grate. Neither stays ice for a climb,
// so the tall one is climbed in jumps; at its head the glass, and beyond it a fault bridge over the grate.
const falls=shell();
falls.rect(0,21,39,22,'#').rect(1,20,26,20,'^').rect(22,12,23,19,'w').rect(18,4,19,19,'w')
 .rect(0,7,0,19,'#').rect(1,7,13,7,'T').rect(14,1,14,19,'|').rect(0,2,0,6,'.').put(32,20,'P');

// 5 · Thaw Court — three thorn-rimmed basins climb the court, each on the same short clock, and a pane stands
// between the second and the third: the third is struck, and run, swapped.
const court=grid();
['########################################',
 '#......................................#',
 '#......................................#',
 '.......................................#',
 '.......................................#',
 '.......................................#',
 '.......................................#',
 '.......................................#',
 '####^wwwwwww^..........................#',
 '#####wwwwwww>..........................#',
 '#####wwwwwww>..........................#',
 '#####wwwwwww>..........................#',
 '#####^^^^^^^>^^wwwwwwww^...............#',
 '############>##wwwwwwww>...............#',
 '############>##wwwwwwww>...............#',
 '############>##wwwwwwww>...............#',
 '############>##^^^^^^^^>wwwwwwwww^.....#',
 '############>##########>wwwwwwwww>.....#',
 '############>##########>wwwwwwwww>..P..#',
 '############>##########>wwwwwwwww#######',
 '############>##########>wwwwwwwww#######',
 '########################^^^^^^^^^#######',
 '########################################'].forEach((row,r)=>[...row].forEach((ch,c)=>court.put(c,r,ch)));
court.rect(14,1,14,11,'|');

// 6 · The Glassworks — the condenser and the glass: the condenser freezes the whole floor of the works for a
// moment, and two panes stand in it; a third stands on the far ledge under the high way out, so you leave by a
// jump and a dash through glass, swapped. Your shade crosses the works behind you.
// The Keeper's pen is on the shelf; her cold intake (the echo) is up through the roof over it.
const glass=shell();
glass.rect(29,12,39,22,'#').rect(28,13,28,15,'<').rect(8,16,28,20,'w').rect(8,21,28,21,'^').rect(0,12,7,22,'#')
 .rect(22,1,22,15,'|').rect(14,1,14,15,'|').rect(3,1,3,11,'|').rect(35,0,38,0,'.').rect(0,3,0,6,'.').put(29,11,'n').put(35,11,'P');

// 7 · The High Cache — in the air: up the first fall, the crystal, the glass, and the second fall struck in
// flight, swapped, before you reach it. Your shade climbs the first fall behind you.
const cache=shell();
cache.rect(31,18,39,22,'#').rect(29,8,30,20,'w').rect(10,21,30,21,'^').rect(0,7,9,22,'#').rect(9,8,9,20,'>')
 .rect(12,6,13,20,'w').rect(17,1,17,20,'|').put(22,5,'o').rect(0,3,0,6,'.').put(35,17,'P');

// 8 · The Overlook — with fault stone: the ice is a floor you make, the fault ledges floors that leave, and the
// glass stands in the pool between them.
const overlook=shell();
overlook.rect(34,15,39,22,'#').rect(8,15,33,20,'w').rect(8,21,33,21,'^').rect(0,5,7,22,'#').rect(7,6,7,20,'>')
 .rect(25,1,25,14,'|').rect(12,10,15,10,'T').rect(9,7,10,7,'T').rect(0,1,0,4,'.').put(36,14,'P');

// 8b · The Glazed Gallery — four panes in a row and nowhere to stand but fault stone: a crystal between the first
// two, a perch between the second and third, a pillar to climb before the last. Every pane flips your hands again.
const glazed=shell();
glazed.rect(34,18,39,22,'#').rect(1,21,33,21,'^').rect(1,22,33,22,'#').rect(33,1,33,20,'|').put(28,14,'o').rect(25,1,25,20,'|')
 .rect(19,17,22,17,'T').rect(17,1,17,20,'|').rect(11,9,12,20,'#').rect(11,8,12,8,'^').put(13,7,'o').rect(7,1,7,20,'|')
 .rect(0,11,6,22,'#').rect(0,6,0,10,'.').put(36,17,'P');

// 9 · The Cold Antechamber — everything on one clock, and your shade a second behind: the condenser, the pool, a
// fall to climb, the glass, a crystal, and a second fall the condenser's clock no longer reaches.
const ante=shell();
ante.rect(29,16,39,22,'#').rect(22,16,28,20,'w').rect(22,21,28,21,'^').rect(20,15,21,22,'#').rect(20,7,21,14,'w')
 .rect(16,1,16,20,'|').rect(6,21,19,21,'^').put(14,5,'o').rect(6,4,7,20,'w').rect(0,4,5,22,'#').rect(5,5,5,20,'>')
 .rect(0,1,0,3,'.').put(33,15,'n').put(31,15,'P');

// 10 · The White Court — the Sorcerer, first, harder: two pools and two wounds, the glass over the divider
// between them. Freeze his pool and cut him; he blinks to the far pool, beyond the glass, and you take the second
// wound swapped.
const white=shell();
white.rect(34,15,39,22,'#').rect(22,15,33,20,'w').rect(22,21,33,21,'^').rect(20,13,21,22,'#').rect(20,12,21,12,'^')
 .rect(20,1,21,11,'|').rect(6,15,19,20,'w').rect(6,21,19,21,'^').rect(0,15,5,22,'#').rect(0,11,0,14,'G').put(36,14,'P');

// 11 · The Glass Gallery — he stands on a basin high on the gallery, and the glass between you breaks his frost.
// Come through it, and his orb reaches you: turn it into his basin (swapped, so the parry's aim is too), then
// cross to his ice and cut him.
const gglass=shell();
gglass.rect(24,18,39,22,'#').rect(9,21,23,21,'^').rect(9,22,23,22,'#').rect(0,8,2,22,'#').rect(3,11,6,22,'#').rect(3,8,6,10,'w').put(2,8,'^')
 .rect(23,1,23,20,'|').rect(17,16,19,16,'#').rect(12,11,14,11,'#').rect(0,1,0,7,'G').put(34,17,'P');

// 12 · The Last Ward — his water is a cup on a shelf in each top corner, and the ward is glazed in three. His
// frost breaks on glass, so to make it fall into his cup you stand under the shelf on his side of the panes,
// swapped or not, while every other cast brings the roof down. Three wounds; he kneels.
const ward=shell();
ward.rect(0,18,39,22,'#').rect(34,6,38,7,'#').put(34,6,'w').put(33,6,'^').put(33,7,'<')
 .rect(1,6,5,7,'#').put(5,6,'w').put(6,6,'^').put(6,7,'>').rect(13,1,13,17,'|').rect(26,1,26,17,'|').rect(0,14,0,17,'G').put(20,17,'P');

// Echo · Under the Jaw (the Keeper's echo; sealed until the base keepsake, the Bite-Proof Glove, is held). Up the
// Glassworks' east wall. The region's two hardest rooms.
// The Cold Intake — two falls on short clocks, a fault ledge between them, the glass at the head of the second, and
// a crystal to reach the intake's mouth, swapped.
const intake=shell();
intake.rect(0,21,39,22,'#').rect(7,20,38,20,'^').rect(9,9,10,19,'w').rect(14,12,17,12,'T').rect(21,3,22,19,'w').rect(26,1,26,19,'|').put(30,8,'o')
 .rect(33,0,38,0,'.').put(3,20,'P');
// The Pen Line — the first pool from the landing, the glass over the divider, the second pool struck in the air
// on the far side (swapped), the fall at the end of it climbed in jumps, and a fault bridge under the roof back
// through the same pane (swapped back) to the Keeper's shelf, where her glove lies. Nowhere to stand between: your
// shade walks the whole line a second behind you.
const pen=shell();
pen.rect(1,15,5,22,'#').rect(6,15,15,20,'w').rect(6,21,15,21,'^').rect(16,1,16,20,'|').put(16,21,'^')
 .rect(17,15,27,20,'w').rect(17,21,27,21,'^').rect(28,15,28,22,'#').put(28,14,'^').rect(29,3,30,20,'w').rect(29,21,30,21,'^')
 .rect(31,1,38,22,'#').rect(1,4,10,4,'#').rect(12,3,26,3,'T').put(5,3,'*').rect(2,0,6,0,'.').put(3,14,'P');

export default {
 n:29,name:'The Fractured Sorcerer',kit:['dash','strike','parry','portal'],
 folk:base.folk,props:base.props,
 blurb:'The White Court seen in its own glass. The pools still freeze, and thaw sooner; between them the court is glazed, and glass only lets a dash through, turning left into right.',
 outro:'The Sorcerer kneels in his glazed court. Below, the forge is pouring backwards.',
 note:'Hand-made for the Fractured ramp (docs/plans/fractured-hard.md). Freezing pools (bladefall-pcore-dev-water.js), mirror panes (bladefall-pcore-dev-mirror.js), fault stone, the shade; the Sorcerer (bladefall-pcore-dev-rbr-sorcerer.js).',
 rooms:[
  room('pane','The Cold Pane','A dash passes glass · through it, left and right swap','The glass costs your dash and turns your hands. What gives the dash back, and which way is the way out now?',pane,{mirror:{}}),
  room('stair','The Pane Stair','Every perch here is fault stone · land, and go','Four panes, and nowhere to stand still. Which way is left after each one?',stair,{mirror:{},fault:{fuse:10,spread:5}}),
  room('sluice','The Mirrored Sluice','A pane on the ice is still glass · strike the second pool on the way down','The glass stands over the divider and the ice will not wait. Which way does the blade cut once you are through?',sluice,
   {mirror:{},thaw:40,currents:[{c:22,r:15,w:11,h:6,dy:180},{c:10,r:15,w:10,h:6,dy:180}]}),
  room('falls','The Two Falls','Frozen falls are walls for as long as the ice lasts · climb in jumps','Neither fall stays ice for a climb. How fast can you go up between them?',falls,
   {mirror:{},thaw:70,fault:{fuse:10,spread:5},currents:[{c:22,r:12,w:2,h:8,dy:220},{c:18,r:4,w:2,h:16,dy:220}]}),
  room('court','Thaw Court','Every basin keeps the same short clock · the glass swaps the last one','Three basins, a pane before the last. Which way do you strike it, and which way do you run it?',court,
   {mirror:{},thaw:45,currents:[{c:24,r:16,w:9,h:5,dy:180},{c:15,r:12,w:8,h:4,dy:180},{c:5,r:8,w:7,h:4,dy:180}]}),
  room('glass','The Glassworks','A condenser freezes every pool at once · glass still takes your dash · your shade a second behind','The whole floor is ice for a moment, two panes stand in it and a third on the far ledge. Where does the dash come back, and which way is out?',glass,
   {mirror:{},thaw:75,shade:{delay:50},side:'up',currents:[{c:8,r:16,w:21,h:5,dy:180}],
   people:[{who:'handler',c:37,r:11,face:-1,quest:'creature-echo',line:'He never settled again without the cold. I kept the glove.',lineDone:'Gently. He knows the glove, not you.',name:'THE KEEPER’S ECHO'}],
   decor:[{k:'s9-pen',c:31,r:11}]}),
  room('cache','The High Cache','A strike freezes a fall you are still flying at · even swapped · your shade a second behind','The crystal, the glass, and a fall that would sweep you down, and your shade on the climb behind you. Which way do you cut once you are through?',cache,
   {mirror:{},thaw:75,shade:{delay:50},currents:[{c:29,r:8,w:2,h:13,dy:200},{c:12,r:6,w:2,h:15,dy:200}],decor:[{k:'s9-lockbox',c:2,r:6}]}),
  room('overlook','The Overlook','Ice and fault stone are both floors that leave','The way out is high over the far end of the pool. What carries you there, and for how long?',overlook,
   {mirror:{},thaw:50,fault:{fuse:10,spread:5},currents:[{c:8,r:15,w:26,h:6,dy:180}]}),
  room('glazed','The Glazed Gallery','Four panes, and only fault stone between them','Four panes in a row. Which way is left at each one, and where is the next dash?',glazed,
   {mirror:{},fault:{fuse:10,spread:5}}),
  room('ante','The Cold Antechamber','Everything the court has taught, on one clock · your shade a second behind','A condenser, a fall, the glass, a crystal and a second fall, and you cannot wait anywhere. In what order?',ante,
   {mirror:{},thaw:120,shade:{delay:60},currents:[{c:22,r:16,w:7,h:5,dy:180},{c:20,r:7,w:2,h:8,dy:220},{c:6,r:4,w:2,h:17,dy:220}],decor:[{k:'s9-doors',c:1,r:3}]}),
  room('white','The White Court','He stands on his pool and the pool is his ward · the second pool is beyond the glass','Two pools, two wounds, and the glass between them. Which way do you cut on the far side?',white,
   {study:true,mirror:{},thaw:50,currents:[{c:22,r:15,w:12,h:6,dy:180},{c:6,r:15,w:14,h:6,dy:180}],
    sorcerer:{posts:[{c:25,r:14},{c:9,r:14}],hits:2,every:60,tell:24,first:20,speed:150,leave:'left'}}),
  room('gglass','The Glass Gallery','Glass breaks his frost · through it, turn his orb into his basin, aimed as your hands are now','He is high behind the glass, and no blade reaches his basin. What else freezes water?',gglass,
   {study:true,mirror:{},thaw:150,
    sorcerer:{posts:[{c:4,r:7}],hits:1,every:75,tell:28,speed:130,leave:'left'}}),
  room('ward','The Last Ward','Glass breaks his frost · stand under his cup on his side of the panes · icicles where you stand','His water is out of reach, the ward is glazed in three, and every other cast brings the roof down. Where do you stand for each wound?',ward,
   {study:true,mirror:{},thaw:100,
    sorcerer:{posts:[{c:34,r:5,fall:{c:31,r:17}},{c:5,r:5,fall:{c:8,r:17}}],hits:3,every:90,tell:34,leave:'kneel',icicles:{every:2,n:3,gap:4,stake:120}}}),
 ],
quests:[
  {id:'creature-echo',title:'Under the Jaw',giver:'The keeper’s echo',from:'fs29-glass',back:{c:36,r:11},needs:'creature-glove',
   keepsake:{id:'creature-remembered',name:'The Creature Keeper, remembered',gives:'The creature slept on its frost, and the Keeper slept beside it. Shown at the end.'},
   rooms:[
    {...room('q-intake','The Cold Intake','Two falls, one fault ledge, and the glass at the head of the climb','Neither fall stays ice for long and the ledge between them cracks. How fast can you go up?',intake,
      {thaw:50,mirror:{},fault:{fuse:10,spread:5},currents:[{c:9,r:9,w:2,h:11,dy:220},{c:21,r:3,w:2,h:17,dy:220}],decor:[{k:'s9-intake',c:2,r:20}]}),exit:'up'},
    {...room('q-pen','The Pen Line','The bridge under the roof is fault stone · run it · your shade walks the line behind you','The glove is on the Keeper’s shelf, across the pool, the glass, the fall and a bridge that will not wait. Which way is left by the time you are up?',pen,
      {thaw:70,mirror:{},fault:{fuse:12,spread:6},shade:{delay:50},currents:[{c:6,r:15,w:10,h:6,dy:170},{c:17,r:15,w:11,h:6,dy:170},{c:29,r:3,w:2,h:18,dy:220}],
       people:[{who:'handler',name:'THE KEEPER’S ECHO',c:8,r:3,quest:'creature-echo',line:'Look at his feet. Properly asleep.',lineDone:'That’s all I wanted. One more time.'}]}),exit:'up'},
   ]},
 ],
};
