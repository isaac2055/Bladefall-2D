// Room by Room · 21. The Fractured Outskirts (7.280 rebuild). Source for public/bladefall-rbr-21-f-outskirts.js
// (node scripts/rbr-src/gen.mjs 21). The weaponless return (strike stays locked here): the Outskirts' own pieces
// (climb, crystals, cracked road, the lantern) asked of each other with no rests, and the act's first momentum tech.
// docs/plans/fractured-hard.md, stage I: the SUPER (jump while a ground dash is still running: 260 px/s across with a
// full jump). Measured in this engine: a plain run, jump and dash crosses at most 17 tiles flat (16 two rows up); a
// super crosses 22 flat (21 four rows up, 18 five up). So a 19-tile gap is a super's, with two tiles to spare.
//   super alone (The Ash Verge) → twice, the island between is cracked (The Hollow Mile) → into crystals (Watcher's
//   Ridge) → off a cracked road (The Survey Stone) → off a chimney's cracked lip (The Burnt Lookout) → cracked islands
//   (The Cracked Road) → off a tear's throw (Camp Echo) → tears perch to perch (The Torn Mile) → the lantern (The
//   Gatehouse) → everything (Muster Yard) → the Mile Sentinel: three bells, each reached only by a super off its
//   committed hammer or its shoulders (shorter stands than before: sentinel.hold).
// Echoes (sealed until the base keepsake is held): Mara's chart opens The Unfinished Chart (left from the Survey Stone);
// Rowan's bell opens The Camp That Answered (left from Camp Echo). Each is the hardest room of the region.
import {grid} from './build.mjs';
const shell=()=>grid().frame();
const S=['strike'];

// 1 · The Ash Verge — the super alone: a runway, a 19-tile thorn gap, the far bank.
const ash=shell();
ash.rect(0,18,9,22,'#').rect(10,21,28,21,'^').rect(10,22,28,22,'#').rect(29,18,39,22,'#').rect(28,18,28,20,'<').rect(39,13,39,17,'.').put(3,17,'P');

// 2 · The Hollow Mile — two supers: right to a cracked island four rows up, left to the old wall four rows above that.
const mile=shell();
mile.rect(0,18,6,22,'#').rect(7,21,38,21,'^').rect(7,22,38,22,'#').rect(26,14,30,14,'~').rect(0,10,6,11,'#').rect(1,12,6,12,'v')
 .rect(1,0,5,0,'.').put(3,17,'P');

// 3 · Watcher's Ridge — a super's arc ends at a crystal no plain jump reaches; two dashes up to the ridge.
const ridge=shell();
ridge.rect(0,18,8,22,'#').rect(9,21,38,21,'^').rect(9,22,38,22,'#').rect(35,8,38,22,'#').rect(34,8,34,20,'<')
 .put(28,15,'o').put(32,11,'o').rect(39,3,39,7,'.').put(2,17,'P');

// 4 · The Survey Stone — the super off a cracked road; the far landing cracks too; up the wall and out.
const survey=shell();
survey.rect(0,18,6,22,'#').rect(7,18,12,18,'~').rect(7,19,12,22,'#').rect(13,21,38,21,'^').rect(13,22,38,22,'#')
 .rect(32,17,34,17,'~').rect(36,4,38,20,'#').rect(35,4,35,8,'<').rect(35,13,35,20,'<').put(32,11,'o').rect(39,0,39,3,'.').rect(39,0,39,0,'#').rect(0,13,0,17,'.').put(3,17,'P');

// 5 · The Burnt Lookout — up the chimney (thorns on alternate walls), then a super off its cracked lip.
const lookout=shell();
lookout.rect(0,0,5,22,'#').rect(11,6,15,22,'#').rect(6,21,10,22,'#')
 .rect(6,14,6,18,'>').rect(10,9,10,13,'<').rect(6,7,6,10,'>').rect(10,17,10,19,'<')
 .rect(16,21,34,21,'^').rect(16,22,34,22,'#').rect(35,6,38,22,'#').rect(34,6,34,20,'<').rect(39,2,39,5,'.').put(8,20,'P');

// 6 · The Cracked Road — cracked islands over the thorns; the long one is a super's.
const cracked=shell();
cracked.rect(0,18,3,22,'#').rect(4,21,38,21,'^').rect(4,22,38,22,'#').rect(7,16,8,16,'~').rect(11,13,15,13,'~')
 .rect(35,14,38,14,'~').rect(39,2,39,5,'.').put(2,17,'P');

// 7 · Camp Echo, Empty — Rowan's door. A rising tear to a cracked ledge; a super across the top.
const camp=shell();
camp.rect(0,18,22,22,'#').rect(1,1,1,12,'>').rect(23,21,38,21,'^').rect(23,22,38,22,'#').rect(5,7,13,7,'~').rect(32,7,38,22,'#').rect(31,7,31,20,'<')
 .rect(39,3,39,6,'.').rect(0,13,0,17,'.').put(12,17,'P');

// 8 · The Torn Mile — two tears perch to perch (cracked perches), then a rising tear past the thorned face.
const torn=shell();
torn.rect(0,18,4,22,'#').rect(5,21,38,21,'^').rect(5,22,38,22,'#').rect(13,15,15,15,'~').rect(24,11,26,11,'~').rect(10,7,16,7,'~')
 .rect(36,7,38,22,'#').rect(35,7,35,20,'<').rect(39,3,39,6,'.').put(2,17,'P');

// 9 · The Gatehouse — two survey stakes open the gate: one over the cracked islands, one in the arc of a super back
// across the top. Out across the islands with a super to the cracked tower, back over the top with another, through
// the gate in the west wall: one breath from the first island to the high ledge.
const gate=shell();
gate.rect(0,18,4,22,'#').rect(5,21,38,21,'^').rect(5,22,38,22,'#').rect(9,16,11,16,'~').put(16,13,'c').rect(19,14,22,14,'~')
 .rect(32,8,37,8,'~').put(23,4,'c').rect(0,8,15,9,'#').rect(1,10,15,10,'v').rect(0,4,0,7,'G').put(2,17,'P');

// 10 · Muster Yard — a tear sets you on a cracked perch, a super from it, a crystal and the yard wall: one breath.
const yard=shell();
yard.rect(0,18,3,22,'#').rect(4,21,38,21,'^').rect(4,22,38,22,'#').rect(9,13,13,13,'~').rect(33,12,35,12,'~').put(34,7,'o')
 .rect(36,5,38,22,'#').rect(36,6,36,20,'<').rect(39,1,39,4,'.').put(2,17,'P');

// 11–13 · The Mile Sentinel. Each bell is reached only off the Sentinel's committed body, and only by a super: the
// landing that holds the bell is past any plain jump from it. The stands are shorter than they were (hold).
const hammer=shell();
hammer.rect(0,18,15,22,'#').rect(16,21,35,21,'^').rect(16,22,35,22,'#').rect(36,11,38,22,'#').rect(35,11,35,20,'<')
 .rect(39,6,39,10,'G').put(12,17,'P');
const shoulder=shell();
shoulder.rect(1,12,4,22,'#').rect(5,12,5,20,'>').rect(5,21,38,21,'^').rect(5,22,38,22,'#').rect(24,18,38,22,'#').rect(31,11,38,11,'#')
 .rect(0,7,0,11,'G').put(36,10,'P');
const last=shell();
last.rect(0,18,15,22,'#').rect(16,21,38,21,'^').rect(16,22,38,22,'#').put(30,8,'o').rect(36,8,38,22,'#').rect(35,8,35,20,'<')
 .rect(39,3,39,7,'G').put(12,17,'P');

// Echo rooms. Mara's: a super to a cracked perch, a rising tear, a super back across the top to her chart.
const chart=shell();
chart.rect(0,18,6,22,'#').rect(7,21,38,21,'^').rect(7,22,38,22,'#').rect(1,6,1,17,'>').rect(23,15,28,15,'~').rect(30,7,35,7,'~').rect(36,7,37,7,'~').rect(36,9,37,9,'^').put(17,3,'o')
 .rect(1,4,10,4,'#').rect(1,5,10,5,'v').put(3,3,'*').rect(1,0,5,0,'.').put(2,17,'P');
// Rowan's: up a thorned pillar on one crystal to its cracked lip, then a super across the roof to the bell.
const bell=shell();
bell.rect(0,18,5,22,'#').rect(6,21,38,21,'^').rect(6,22,38,22,'#').rect(10,6,12,22,'#').rect(9,8,9,15,'<').rect(13,6,13,20,'>')
 .put(6,11,'o').rect(10,5,12,5,'~').rect(23,6,25,6,'~').rect(23,8,25,8,'^').rect(35,5,38,5,'#').rect(35,6,38,6,'v').put(37,4,'*').rect(39,1,39,4,'.').put(2,17,'P');

const rooms=[
 {id:'fo21-ash',name:'The Ash Verge',exit:'right',lock:S,hint:'Dash along the ground, then jump before the dash ends: the jump keeps the dash’s speed (a super)',
  question:'The gap is wider than a jump and a dash together. What if the dash comes first, on the ground?',
  decor:[{k:'milestone',c:5,r:17},{k:'trumpets',c:33,r:17}],map:ash.rows()},
 {id:'fo21-mile',name:'The Hollow Mile',exit:'up',lock:S,hint:'Cracked stone gives you a breath, not a rest · land, turn, and super again',
  question:'Two gaps, each a super long. Where does the second one start?',map:mile.rows()},
 {id:'fo21-ridge',name:'Watcher’s Ridge',exit:'right',lock:S,hint:'A super spends the dash on the ground · the crystal at the end of its arc gives it back',
  question:'The first crystal is past any plain jump. What carries you to it with nothing left to spend?',map:ridge.rows()},
 {id:'fo21-map',name:'The Survey Stone',exit:'right',side:'left',lock:S,hint:'The cracked road starts shaking as you step on it · Mara’s chart opens the lost survey behind you',
  question:'The road under your runway is cracked. How long do you have to start the super?',
  people:[{who:'mara',name:'MARA’S ECHO',c:5,r:17,quest:'mara-echo',line:'Your chart still has a road here. Mine stopped.',lineDone:'There it is. A way through the blank.'}],map:survey.rows()},
 {id:'fo21-lookout',name:'The Burnt Lookout',exit:'right',lock:S,hint:'Thorns grow on alternate walls · the top of the chimney is a runway, just',
  question:'Up the chimney, and off the top with a super. Which wall does each stretch belong to?',map:lookout.rows()},
 {id:'fo21-cracked',name:'The Cracked Road',exit:'right',lock:S,hint:'Every island cracks · the long gap wants a super, the short ones only a jump',
  question:'Nothing here holds for long. Which island do you super from?',map:cracked.rows()},
 {id:'fo21-camp',name:'Camp Echo, Empty',exit:'right',side:'left',lock:S,hint:'Dash into the tear · Rowan’s bell opens the way back through the camp',
  question:'The tear lifts you to a cracked ledge. What do you do before it falls?',
  people:[{who:'rowan',name:'ROWAN’S ECHO',c:17,r:17,quest:'rowan-echo',line:'The bell is behind you. It always was.',lineDone:'Someone answered. I can leave it ringing.'}],
  lines:[{a:[22,17],b:[6,6]}],map:camp.rows()},
 {id:'fo21-torn',name:'The Torn Mile',exit:'right',lock:S,hint:'A tear sets you down on its perch · the perches are cracked · the last one is a runway',
  question:'Three tears, three cracked perches, and a super from the last. How long can you stand on each?',
  lines:[{a:[4,17],b:[14,14],setDown:true},{a:[15,14],b:[25,10],setDown:true},{a:[24,10],b:[11,6],setDown:true}],map:torn.rows()},
 {id:'fo21-gate',name:'The Gatehouse',exit:'left',lock:S,hint:'Every survey stake lit opens the gate · the last one hangs in the arc of a super',
  question:'Two stakes, and only one of them is anywhere you could stand near. How do you pass the other?',map:gate.rows()},
 {id:'fo21-yard',name:'Muster Yard',exit:'right',lock:S,hint:'Everything the road has taught, in one breath',
  question:'A tear, a cracked perch, a super, a crystal. In what order, and with what left in hand?',
  lines:[{a:[3,17],b:[10,12],setDown:true}],map:yard.rows()},
 {id:'fo21-hammer',name:'The Centre Bell',exit:'right',lock:S,study:true,hint:'The committed hammer becomes a foothold · from its top, a super reaches the bell',
  question:'The bell’s ledge is past any plain jump. Where can you stand to start a super that reaches it?',
  sentinel:{mode:'hammer',c:37,r:8,hold:150,range:[28,124]},map:hammer.rows()},
 {id:'fo21-shoulder',name:'The East Bell',exit:'left',lock:S,study:true,hint:'Its rush ends under you · its shoulders rise into a step',
  question:'The rush passes under your ledge. From its shoulders, how far can a super go?',
  sentinel:{mode:'rush',c:2,r:9,hold:150,from:280,to:200},map:shoulder.rows()},
 {id:'fo21-last',name:'The West Bell',exit:'right',lock:S,study:true,hint:'Off the hammer with a super · a crystal at the end of the arc · the chain sweeps the floor',
  question:'The bell hangs high over the far wall. What does the super leave you to climb with?',
  sentinel:{mode:'hammer',c:37,r:4,hold:150,range:[28,124],sweep:true},map:last.rows()},
];
for(const r of rooms)r.question||='Where can you spend the dash and recover it before the next landing?';

const region={n:21,name:'The Fractured Outskirts',kit:['dash','strike','parry','portal'],
 blurb:'The road is still here. The Muster is still waiting. The Sentinel has no wound a blade could open, and the road has learned to move faster than you.',
 outro:'Three bells answer across the empty Muster. The Sentinel lowers its hammer. The woods remember the way ahead.',
 folk:{rowan:{cloak:'#6b6a52',trim:'#b8c5a0',skin:'#cfa98a',cap:true}},
 rooms,quests:[
  {id:'mara-echo',title:'A Line Through the Blank',giver:'Mara’s echo',from:'fo21-map',back:{c:5,r:17},needs:'mara-chart',
   keepsake:{id:'mara-remembered',name:'Mara, remembered',gives:'She kept drawing a road for someone who might return. Shown at the end.'},rooms:[
   {id:'fo21-q-chart',name:'The Unfinished Chart',exit:'up',lock:S,hint:'A super, a tear, a super back: the blank has no floor',
    question:'Two supers in opposite directions, and only cracked stone between. Where does each start?',
    lines:[{a:[28,14],b:[37,6]}],
    people:[{who:'mara',name:'MARA’S ECHO',c:5,r:3,quest:'mara-echo',line:'I drew the way out. Keep the part that still leads somewhere.',lineDone:'The blank has an edge now.'}],map:chart.rows()}]},
  {id:'rowan-echo',title:'Someone Answered',giver:'Rowan’s echo',from:'fo21-camp',back:{c:12,r:17},needs:'rowan-bell',
   keepsake:{id:'rowan-remembered',name:'Rowan, remembered',gives:'He rang the bell until someone answered. Shown at the end.'},rooms:[
   {id:'fo21-q-bell',name:'The Camp That Answered',exit:'right',lock:S,hint:'Thorns up the pillar · one crystal · the lip is cracked · so is the stone halfway to the bell',
    question:'Up the pillar on one crystal, off a cracked lip with a super, and once more off a cracked stone. Where does the dash come back?',
    people:[{who:'rowan',name:'ROWAN’S ECHO',c:36,r:4,quest:'rowan-echo',line:'I heard it. That was enough.',lineDone:'You heard it too.'}],map:bell.rows()}]},
 ]};
export default region;
