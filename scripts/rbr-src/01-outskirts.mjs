// Room by Room · 1. The Outskirts. Source for public/bladefall-rbr-01-outskirts.js (node scripts/rbr-src/gen.mjs 01).
// Merge Pitch A's six screens are the draft: Verge, Camp Echo, Watcher's Cut, Hollow Mile and the Gatehouse are kept
// (Broken Muster comes from Pitch C's pocket). Mothlight Descent moves to Black Woods, because its pods need the blade.
// The road is twelve rooms. Kit: jump, climb and dash. Each new thing is shown alone, then chained:
//   climb (White Flowers) → wall-jump chimney (the Lookout) → crystal (Watcher's Ridge, then the Cut)
//   → cracked road (Cracked Road, then the Hollow Mile) → all of it (Muster Yard) → the lantern (Gatehouse).
// Quests (optional): Rowan's bell (a two-room branch up the old bell tower from Camp Echo), and Mara's survey
// (three bearings — ASH, GLASS, IRON — set off the road in three rooms; she waits at the Muster).
// Known skips (rbr-skip.mjs, ordinary play unless noted):
//   White Flowers — the first wall can be scaled by repeated wall jumps instead of climbing (needs the timing; the hint teaches grab).
//   Muster Yard   — a wall jump off the cracked ledge's side can stand in for the crystal. Both still use a device.
//   Old Bell Tower (quest) — the walls' unpoisoned patches can be climbed past the cracked ledges; the patches are narrow.
//   Watcher's Ridge, Cracked Road, the Lookout — no ordinary skip found (hypers, which fly ~30 tiles, are mastery).
import {grid} from './build.mjs';

const P={vey:"Fire’s for anyone. Just don’t touch the white flowers."};

// 1 · The Verge Road — jump only. Two poison beds and a bank.
const road=grid().frame();
road.rect(0,18,39,22,'#').rect(11,18,12,18,'^').rect(20,16,33,17,'#').rect(26,16,29,16,'^').rect(39,13,39,17,'.').put(3,17,'P');

// 3 · White Flowers — the climb. A wall too tall to jump, a plank over the flowers, a taller wall.
const flowers=grid().frame();
flowers.rect(0,18,13,22,'#').rect(14,9,16,22,'#').rect(17,18,29,22,'#').rect(17,18,29,18,'^')
 .rect(22,12,24,12,'#').rect(30,4,32,22,'#').rect(33,18,39,22,'#').rect(39,14,39,17,'.').put(3,17,'P');

// 5 · The Lookout — up the sentinel's chimney, a tower over the drop. Poison on alternate walls; out by the top right.
const lookout=grid().frame();
lookout.rect(1,0,38,0,'.').rect(0,8,0,22,'#').rect(1,21,28,21,'^').rect(1,22,28,22,'#').rect(29,8,32,22,'#').rect(33,22,38,22,'#').rect(38,10,39,21,'#')
 .rect(33,12,33,14,'>').rect(37,16,37,18,'<').rect(37,10,37,11,'<').rect(39,2,39,9,'.').rect(28,9,28,20,'<').put(35,21,'P');

// 6 · Watcher's Ridge — one crystal over a cut too wide for one dash.
const ridge=grid().frame();
ridge.rect(0,18,7,22,'#').rect(8,21,38,21,'^').rect(8,22,38,22,'#').rect(38,8,38,20,'<').rect(30,6,38,7,'#')
 .rect(39,1,39,5,'.').put(18,11,'o').put(26,9,'o').put(3,17,'P');   // 7.277: the second crystal (26,9) lets a plain route
   // (no dash-jump) reach the ledge; with one crystal only a super crossed (momentum is kept for the Fractured regions).

// 8 · Cracked Road — the road gives way a moment after you stand on it.
const cracked=grid().frame();
cracked.rect(0,18,9,22,'#').rect(10,21,30,21,'^').rect(10,22,30,22,'#').rect(31,9,39,22,'#').rect(30,10,30,20,'<')
 .rect(14,16,16,16,'~').rect(21,13,23,13,'~').rect(39,4,39,8,'.').put(3,17,'P');

// 11 · Muster Yard — cracked stone, a crystal, the yard wall, all in one breath.
const yard=grid().frame();
yard.rect(0,18,5,22,'#').rect(6,21,35,21,'^').rect(6,22,35,22,'#').rect(11,16,13,16,'~').put(22,11,'o')
 .rect(30,6,32,22,'#').rect(29,10,29,20,'<').rect(36,10,39,22,'#').rect(35,11,35,20,'<').rect(39,4,39,9,'.').put(2,17,'P');

// Rowan's tower (quest rooms). The yard: a stake on a pillar over the flowers opens the tower door.
const towerYard=grid().frame();
towerYard.rect(0,18,39,22,'#').rect(12,18,27,18,'^').rect(18,10,19,17,'#').put(18,9,'c').rect(23,13,25,13,'~')
 .rect(38,13,38,17,'G').rect(39,13,39,17,'.').put(3,17,'P');
// The tower: poison up both walls, so the cracked ledges and the crystal are the only footholds; the bell on its beam.
const tower=grid().frame();
tower.rect(1,1,13,22,'#').rect(26,1,38,22,'#').rect(14,21,25,22,'#').rect(18,0,21,0,'.')
 .rect(14,2,14,19,'>').rect(25,2,25,19,'<').rect(14,11,14,13,'.').rect(25,15,25,17,'.').rect(25,6,25,8,'.')
 .rect(22,17,24,17,'~').rect(15,12,17,12,'~').rect(21,7,23,7,'~').put(19,10,'o')
 .rect(16,3,17,3,'#').put(16,2,'*').put(16,20,'P');

export default {
 n:1,name:'The Outskirts',kit:['dash'],
 folk:{rowan:{cloak:'#6b6a52',trim:'#b8c5a0',skin:'#cfa98a',cap:true}},
 blurb:'The broken camp and the old road east, from Vey’s watchfire to the Mothlight gate. Jump, climb, dash: the whole kit, one piece at a time.',
 outro:'The Outskirts, end to end, without leaving the road.',
 note:'Merge Pitch A is the draft; see the header of scripts/rbr-src/01-outskirts.mjs.',
 rooms:[
  {id:'o1-road',name:'The Verge Road',exit:'right',hint:'Hold jump to jump higher',question:'Two beds of white flowers and a bank. How high, and how far, does one jump go?',
   people:[{who:'vey',c:6,r:17,face:1,line:P.vey}],decor:[{k:'tent',c:1,r:17},{k:'watchfire',c:8,r:17},{k:'trumpets',c:11,r:17},{k:'trumpets',c:27,r:15}],map:road.rows()},
  {id:'o1-verge',name:'The Poisoned Verge',exit:'right',hint:'A dash crosses what a jump cannot',question:'The pool is wider than any jump. What else carries you?',
   people:[{who:'mara',c:4,r:17,face:1,quest:'mara',leave:'right',line:'Oh! Hello. Mara, surveyor. Three posts off this road: Ash, Glass, Iron. Touch them for me?'}],
   decor:[{k:'trumpets',c:27,r:17},{k:'trumpets',c:33,r:17}],map:[
  "########################################",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#.......................................",
  "#...................######..............",
  "#...................######..............",
  "#..P................######..............",
  "##########^^^^############^^^^^^^^^^^^##",
  "########################################",
  "########################################",
  "########################################",
  "########################################"]},
  {id:'o1-flowers',name:'White Flowers',exit:'right',hint:'Hold grab against a wall to cling and climb',question:'The wall is taller than any jump. What do your hands do?',
   decor:[{k:'trumpets',c:19,r:17},{k:'trumpets',c:26,r:17},{k:'palisade',c:34,r:17}],map:flowers.rows()},
  {id:'o1-camp',name:'Camp Echo',exit:'up',side:'right',hint:'A survey stake lights when you touch it · every stake lit opens the shaft',question:'The shaft is shut. What up on the perch would open it?',
   bearing:'ASH',
   people:[{who:'sentinel',c:17,r:17,face:-1,line:'Came up the west road? Huh. Touch the stake on the perch.'},
    {who:'rowan',c:31,r:17,face:-1,quest:'rowan',line:'Gate’s shut. You got through anyway. Bell’s up the east tower.',lineDone:'There. Now we’ll hear them coming.'}],
   decor:[{k:'clock',c:24,r:17},{k:'tent',c:27,r:17},{k:'post',c:33,r:17}],map:[
  "##################################....##",
  "##################################GGGG##",
  "##################################GGGG##",
  "#................................#....##",
  "#................................#....##",
  "#..c.............................#....##",
  "#######..........................#....##",
  "#######....##....................#....##",
  "#..........##....................#....##",
  "#..........##....................#....##",
  "#..........##....................#====##",
  "#..........##.........................##",
  "#..........##.....*...................##",
  "#..........##.........................##",
  "#..........##...........................",
  "#..........##...........................",
  "#..........##...........................",
  "#..P.......##...........................",
  "########################################",
  "########################################",
  "########################################",
  "########################################",
  "########################################"]},
  {id:'o1-lookout',name:'The Lookout',exit:'right',hint:'Jump off a wall you cling to · white flowers grow on the walls too',question:'Two walls, and poison on each. Which wall does each stretch belong to?',
   decor:[],map:lookout.rows()},
  {id:'o1-ridge',name:'Watcher’s Ridge',exit:'right',hint:'A crystal gives your dash back in the air',question:'One dash falls short. Where do the next ones come from?',
   decor:[{k:'mast',c:34,r:17}],map:ridge.rows()},
  {id:'o1-cut',name:'Watcher’s Cut',exit:'right',bearing:'GLASS',hint:'A crystal grows back a moment after you take it',question:'One crystal is not enough to cross the cut. Where can you get another?',
   people:[{who:'olan',c:6,r:17,face:1,line:'Clock’s stopped. The cut’s worse. Only the glass in the air holds.'}],
   decor:[{k:'mast',c:36,r:14}],map:[
  "########################################",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#.........................*............#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................G",
  "#..........................o...........G",
  "#..................o...................G",
  "#.....................................cG",
  "#.................................######",
  "#.................................######",
  "#..P..............................######",
  "##########........................######",
  "##########........................######",
  "##########........................######",
  "##########^^^^^^^^^^^^^^^^^^^^^^^^######",
  "########################################"]},
  {id:'o1-cracked',name:'Cracked Road',exit:'right',hint:'Cracked stone gives way a moment after you stand on it',question:'Nothing here holds for long. How long is long enough?',
   decor:[{k:'milestone',c:5,r:17}],map:cracked.rows()},
  {id:'o1-mile',name:'The Hollow Mile',exit:'right',hint:'Cracked stone comes back a while after it falls',question:'The road is cracked the whole way. How long can you stand anywhere?',
   decor:[{k:'milestone',c:3,r:17},{k:'palisade',c:33,r:17}],map:[
  "########################################",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "#......................................G",
  "#......................................G",
  "#......................................G",
  "#.P.....~~~....~~~....~~~...~~~.....c..G",
  "######..........................########",
  "######..........................########",
  "######..........................########",
  "######^^^^^^^^^^^^^^^^^^^^^^^^^^########",
  "########################################"]},
  {id:'o1-muster',name:'Broken Muster',exit:'right',bearing:'IRON',hint:'Climb, then let go and fall to the stake',question:'The muster gate is shut. What would the post on the old wall open?',
   people:[{who:'mara',c:31,r:17,face:-1,quest:'mara',chart:true,line:'Made it. Any bearings for me?',lineDone:'Ash, Glass, Iron. They agree. The road goes through.'}],
   decor:[{k:'palisade',c:21,r:17},{k:'palisade',c:35,r:17}],map:[
  "########################################",
  "#.................GG...................#",
  "#.................GG...................#",
  "#.................GG.................*.#",
  "#.................GG...................#",
  "#.................GG...................#",
  "#.............####GG...................#",
  "#.............####GG...................#",
  "#.............####GG...................#",
  "#.......c.....####GG...................#",
  "#.....=====...####GG...................#",
  "#.............####GG...................#",
  "#.............####GG...................#",
  "#.............####GG...................#",
  "#.............####GG....................",
  "#.............####GG....................",
  "#.............####GG....................",
  "#.P...........####GG....................",
  "######################^^^^^^^^^#########",
  "########################################",
  "########################################",
  "########################################",
  "########################################"]},
  {id:'o1-yard',name:'Muster Yard',exit:'right',hint:'Everything the road has taught, in one breath',question:'Cracked stone, a crystal, the yard wall. In what order, and with what left in hand?',
   decor:[{k:'palisade',c:35,r:9}],map:yard.rows()},
  {id:'o1-gate',name:'The Gatehouse',exit:'right',hint:'Grab carries the lantern; grab again throws it · a plate holds its door open while something rests on it',question:'The gate only stays up while the plate is pressed. What can press it for you?',
   decor:[{k:'gatehouse',c:30,r:17}],map:[
  "########################################",
  "#.............................HH.......#",
  "#.............................HH.......#",
  "#.............................HH.......#",
  "#.............................HH.......#",
  "#.............................HH.......#",
  "#.............................HH.......#",
  "#.............................HH.......#",
  "#.............................HH.......#",
  "#.............................HH.......#",
  "#.............................HH.......#",
  "#.............................HH.......#",
  "#.............................HH.......#",
  "#.............................HH.......#",
  "#.............................HH........",
  "#.............................HH........",
  "#.............................HH........",
  "#..P..l............._.........HH........",
  "########################################",
  "########################################",
  "########################################",
  "########################################",
  "########################################"]},
 ],
 quests:[
  {id:'mara',title:'A Road Without a Name',giver:'Mara',bearings:['ASH','GLASS','IRON'],
   keepsake:{id:'mara-chart',name:'Mara\u2019s Chart',gives:'All three bearings agree, and the tunnel to the woods goes on her map. In the Fractured Outskirts the chart opens Mara\u2019s echo.'}},
  {id:'rowan',title:'A Bell for the Camp',giver:'Rowan',from:'o1-camp',back:{c:36,r:17},
   keepsake:{id:'rowan-bell',name:'Rowan’s Bell',gives:'Rowan hangs it at Camp Echo. In the Fractured Outskirts it still rings: it opens Rowan’s echo.'},
   rooms:[
    {id:'o1-q-yard',name:'The Bell Yard',exit:'right',hint:'A stake opens the tower door',question:'The tower door is shut, and the stake is over the flowers. What still holds up there?',map:towerYard.rows()},
    {id:'o1-q-tower',name:'The Old Bell Tower',exit:'up',hint:'Cracked ledges fall · the bell is at the top; out through the belfry',question:'Cracked ledges on both walls. Which ones will still be there on the way up?',map:tower.rows()},
   ]},
 ],
};
