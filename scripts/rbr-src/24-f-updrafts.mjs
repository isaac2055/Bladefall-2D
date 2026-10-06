// Room by Room · 24. The Fractured Updrafts (7.280 rebuild). Source for public/bladefall-rbr-24-f-updrafts.js
// (node scripts/rbr-src/gen.mjs 24). docs/plans/fractured-hard.md, stage I: the WALLBOUNCE — dash straight up beside a
// wall and jump while the dash runs: 170 px/s away from the wall and a long rising jump (about seven rows; ten off the
// top of a jump). In this engine a climb-jump and an up-dash, or a wall jump and a diagonal dash, beat any wallbounce
// target off ordinary rock, so the canyon's walls here are wind-polished (room field `slick`, this region's device
// public/bladefall-pcore-dev-rbr-f-updrafts.js): solid, drawn with a pale glaze, and no grip at all — no hold, no climb,
// no wall jump. The only push off polished rock is a wallbounce. The canyon's own pieces come back with it: thermals
// (winds), crystals, cracked gutters, pods, and the Lung's breathing columns (breathing), which turn faster here.
import {grid} from './build.mjs';
const shell=()=>grid().frame();
const UP=-240,KITE=-150;

// 1 · Rootbreach in the Storm — the wallbounce alone: the polished canyon wall, and a cracked lip up and out from it,
// past any jump and dash; the ledge beyond is thorned, so off the lip at once.
const lift=shell();
lift.rect(1,1,18,22,'#').rect(19,19,24,22,'#').rect(25,21,38,21,'^').rect(25,22,38,22,'#').rect(26,10,28,10,'~').rect(26,12,28,12,'^').rect(29,10,38,11,'#').rect(29,9,38,9,'^').rect(29,12,38,12,'v')
 .rect(39,3,39,8,'.').put(21,18,'P');

// 2 · The Polished Shaft — two wallbounces, wall to wall: the first one's arc passes a crystal, the second throws you
// back across the shaft and out of its mouth.
const shaft=shell();
shaft.rect(1,1,9,22,'#').rect(19,1,38,22,'#').rect(10,19,12,22,'#').rect(13,21,18,21,'^').rect(13,22,18,22,'#').rect(1,1,9,4,'.').rect(0,1,0,4,'.')
 .rect(1,0,9,0,'#').put(16,8,'o').put(11,18,'P');

// 3 · The Empty Aerie — a wallbounce into a thermal that starts higher than any jump and dash; the crystal at its top,
// a dash to the cracked lip, and off it over the thorned ledge before it falls.
const draw=shell();
draw.rect(1,1,6,22,'#').rect(7,19,10,22,'#').rect(11,21,38,21,'^').rect(11,22,38,22,'#').rect(1,1,38,2,'#').rect(7,3,38,3,'v').rect(16,1,19,3,'.')
 .rect(30,10,38,10,'#').rect(30,9,38,9,'^').rect(30,11,38,11,'v').rect(25,9,29,9,'~').rect(25,11,29,11,'^').rect(39,3,39,8,'.').put(17,8,'o').put(9,18,'P');

// 4 · Kite Terraces, Broken — a thermal up the polished wall, a wallbounce off its top into the high kite wind, a
// cracked terrace, and the last jump and dash to the lookout.
const kites=shell();
kites.rect(1,1,11,22,'#').rect(12,19,17,22,'#').rect(18,21,38,21,'^').rect(18,22,38,22,'#').rect(32,7,35,7,'~').rect(32,9,35,9,'^').rect(36,3,38,22,'#')
 .rect(39,1,39,2,'.').rect(36,1,38,2,'.').put(14,18,'P');

// 5 · The Silent Choir — three pipes, each a thermal between polished walls, each taller than the last: rise, take
// the crystal at the top, and bounce off the pipe's wall over the next one. The Cartographer's door is the tallest
// pipe's mouth: a dash up out of it (his chime opens it).
const choir=shell();
choir.rect(1,1,4,22,'#').rect(5,19,8,22,'#').rect(9,6,10,22,'#').rect(9,5,10,5,'^').rect(11,21,14,21,'^').rect(11,22,14,22,'#')
 .rect(15,5,16,22,'#').rect(15,4,16,4,'^').rect(17,21,20,21,'^').rect(17,22,20,22,'#').rect(21,7,38,22,'#')
 .rect(39,3,39,6,'.').rect(30,0,32,0,'.').put(12,7,'o').put(18,6,'o').put(6,18,'P');

// 6 · The Choir's Mouth — pods across the mouth (each cut gives the dash back), over the polished post, a crystal
// behind it, and a wallbounce off the post's far face up to the cracked lip; the block beyond is thorned: off at once.
const flue=shell();
flue.rect(1,14,5,22,'#').rect(6,21,38,21,'^').rect(6,22,38,22,'#').put(17,14,'b')
 .rect(20,10,21,22,'#').rect(20,9,21,9,'^').put(22,11,'o').rect(32,8,38,22,'#').rect(29,12,31,22,'#').rect(29,8,31,8,'~').rect(29,11,31,11,'^').rect(32,7,38,7,'^').rect(39,2,39,6,'.').put(3,13,'P');

// 7 · Needlewind in Reverse — the wind blows the way out (left) and carries your dash with it: three crystals in the
// wind between thorned posts, and at the end the polished wall it slams you into. A wallbounce into the wind only
// rises: the wind holds you to the wall all the way up to the mouth.
const needle=shell();
needle.rect(33,19,38,22,'#').rect(1,21,32,21,'^').rect(1,22,32,22,'#').rect(1,4,1,22,'#').rect(0,1,0,3,'.').rect(7,4,12,5,'#').rect(7,6,12,6,'v').rect(7,3,12,3,'^')
 .rect(4,4,6,4,'~').rect(4,7,6,7,'^').put(1,3,'^')
 .rect(23,1,24,8,'#').rect(23,9,24,9,'v').rect(14,15,15,20,'#').rect(14,14,15,14,'^').put(28,13,'o').put(19,12,'o').put(9,13,'o').put(36,18,'P');

// 8 · The Cracked Rain-Catcher — the gutter's cups climb a polished shaft on alternate walls, and every cup cracks
// under you: land, take the wall, bounce across to the next. Four bounces, no rest, out through the high drain.
const catcher=shell();
catcher.rect(1,1,10,22,'#').rect(21,1,38,22,'#').rect(11,19,14,22,'#').rect(15,21,20,21,'^').rect(15,22,20,22,'#')
 .rect(18,16,20,16,'~').rect(11,12,13,12,'~').rect(18,9,20,9,'~').rect(0,4,10,7,'.').put(12,18,'P');

// 9 · The Lung's Upper Turn — a tear across the span throws you into the polished far wall with your dash back; a
// wallbounce off it into the kite wind going home, a cracked perch at its end, and up to the high gate.
const span=shell();
span.rect(1,15,4,22,'#').rect(5,21,29,21,'^').rect(5,22,29,22,'#').rect(30,9,38,22,'#').rect(5,9,8,9,'~').rect(5,11,8,11,'^').rect(0,1,0,4,'.').put(3,14,'P');

// 10 · The Lung's Lower Turn — the canyon breathes faster here: the column lifts, then breathes out and drives you
// down. Wait for the breath, ride it, step off before it turns. (The one rest before the Lung.)
const eye=shell();
eye.rect(1,1,16,22,'#').rect(17,19,23,22,'#').rect(24,21,29,21,'^').rect(24,22,29,22,'#').rect(30,9,38,22,'#').rect(39,5,39,8,'.').put(20,18,'P');

// 11–12 · The Lung. Two breathing columns side by side, out of step, between polished walls: ride one while it
// breathes in, and as it turns, bounce off the wall into the other. The divider between them is too high to drift
// over; only a wallbounce clears it. Then the crown: the breath turns faster still, and three columns.
const lung=shell();
lung.rect(1,1,4,22,'#').rect(15,1,38,22,'#').rect(5,19,8,22,'#').rect(9,7,10,22,'#').rect(9,6,10,6,'^').rect(11,21,14,21,'^').rect(11,22,14,22,'#')
 .rect(5,0,10,0,'.').put(14,6,'o').put(6,18,'P');

const crown=shell();
crown.rect(1,1,3,22,'#').rect(21,1,38,22,'#').rect(4,19,7,22,'#').rect(8,9,9,22,'#').rect(8,8,9,8,'^').rect(14,8,15,22,'#').rect(14,7,15,7,'^')
 .rect(10,21,13,21,'^').rect(10,22,13,22,'#').rect(16,21,20,21,'^').rect(16,22,20,22,'#').rect(8,0,17,0,'.').put(10,10,'o').put(19,4,'o').put(5,18,'P');

// Echo: The Interval Between (the Cartographer's echo, sealed until his chime is held) — the hardest rooms here.
// 1 · The Unmeasured Channel — wallbounce into a thermal, out of it into a tear, the tear's throw into the polished far
// wall, a wallbounce back to a cracked perch, and a jump and dash onto the lip under the roof. No rest from the
// first jump to the lip.
const channel=shell();
channel.rect(1,19,4,22,'#').rect(5,21,30,21,'^').rect(5,22,30,22,'#').rect(31,1,38,22,'#').rect(19,5,24,5,'~').rect(20,0,23,0,'.').put(9,8,'o').put(2,18,'P');

// 2 · The Last Interval — the Lung's two breaths in a narrow funnel: ride the first, bounce over into the second, take
// its crystal, bounce back across to the cracked cup under the window, and jump and dash out through it, where the
// chime he listened for still hangs.
const funnel=shell();
funnel.rect(1,1,3,22,'#').rect(14,1,38,22,'#').rect(4,19,7,22,'#').rect(8,9,9,22,'#').rect(8,8,9,8,'^').rect(10,21,13,21,'^').rect(10,22,13,22,'#')
 .rect(0,1,3,2,'.').rect(4,7,5,7,'~').put(13,10,'o').put(1,2,'*').put(5,18,'P');

const rooms=[
 {id:'fu24-lift',name:'Rootbreach in the Storm',exit:'right',hint:'Polished rock gives no grip · dash straight up beside it, then jump while the dash runs: it throws you up and away (a wallbounce) · the lip is cracked and the ledge beyond is thorned: off it with a super',
  question:'The ledge is higher than any jump and dash, and the wall will not hold you. What can it still give you?',
  slick:[[18,1,18,21],[29,10,29,11]],map:lift.rows()},
 {id:'fu24-shaft',name:'The Polished Shaft',exit:'left',hint:'The crystal hangs in the first bounce’s arc · the second wall throws you back the other way',
  question:'Two polished walls and one crystal. Where must the first bounce reach for the second to be possible?',
  slick:[[9,5,9,21],[19,1,19,21]],map:shaft.rows()},
 {id:'fu24-draw',name:'The Empty Aerie',exit:'right',hint:'Wallbounce off the top of a jump and it carries you higher · the draft takes whatever reaches it · the lip past it is cracked: super off it',
  question:'The draft starts higher than any jump and dash. How high can the wall throw you, and from where?',
  slick:[[6,3,6,21],[30,10,30,10]],winds:[{c:16,r:1,w:4,h:9,dx:0,dy:UP}],decor:[{k:'bellows',c:7,r:18}],map:draw.rows()},
 {id:'fu24-kites',name:'Kite Terraces, Broken',exit:'right',hint:'The thermal carries you up the polished wall · bounce off the top of it into the kite wind · the terrace is cracked',
  question:'The kite wind blows high and far from the wall. What throws you out to it, and what is left when it lets go?',
  slick:[[11,1,11,18],[36,3,36,20]],winds:[{c:12,r:11,w:3,h:6,dx:0,dy:UP},{c:17,r:1,w:15,h:3,dx:150,dy:KITE}],
  decor:[{k:'vent',c:12,r:18},{k:'kite',c:34,r:6}],map:kites.rows()},
 {id:'fu24-choir',name:'The Silent Choir',exit:'right',side:'up',hint:'Each pipe lifts you to its crystal · bounce off its wall over the next · his chime opens the way up',
  question:'Three pipes, each taller than the last. From which wall does each bounce start?',
  slick:[[4,1,4,18],[9,6,10,21],[15,5,16,21],[21,7,21,21]],
  winds:[{c:5,r:10,w:4,h:7,dx:0,dy:UP},{c:11,r:7,w:4,h:13,dx:0,dy:UP},{c:17,r:6,w:4,h:14,dx:0,dy:UP}],
  people:[{who:'cartographer',name:'THE CARTOGRAPHER’S ECHO',c:28,r:6,quest:'cartographer-echo',line:'The same interval. I hear it even when the air goes quiet.',lineDone:'There. Above the pipes. That was the part I missed.'}],
  decor:[{k:'desk',c:34,r:6},{k:'chimes',c:27,r:6}],map:choir.rows()},
 {id:'fu24-flue',name:'The Choir’s Mouth',exit:'right',hint:'Cut down on a pod to bounce, and your dash comes back · the post is polished on both faces · the lip at the top is cracked',
  question:'Two pods, a post, a crystal behind it. Which dash carries you over, and which wall throws you up?',
  slick:[[20,10,21,21],[32,8,32,10],[29,12,29,21]],map:flue.rows()},
 {id:'fu24-needle',name:'Needlewind in Reverse',exit:'left',hint:'The wind carries you and your dash the way it blows · the polished wall throws you back out of it',
  question:'The wind slams you into the far wall well below the ledge. What does that wall still give you?',
  slick:[[1,5,1,20],[7,4,7,5]],winds:[{c:2,r:7,w:31,h:9,dx:-150,dy:0}],decor:[{k:'windsock',c:35,r:18}],map:needle.rows()},
 {id:'fu24-catcher',name:'The Cracked Rain-Catcher',exit:'left',hint:'Every cup cracks a moment after you land · the wall beside it throws you to the next one',
  question:'Four cups on alternate walls, none of them holds. How quickly can you take the wall?',
  slick:[[10,1,10,3],[10,8,10,21],[21,1,21,21]],decor:[{k:'gutter',c:11,r:18}],map:catcher.rows()},
 {id:'fu24-span',name:'The Lung’s Upper Turn',exit:'left',hint:'The tear gives your dash back where it lets go · the far wall is polished · the kite wind blows home',
  question:'The tear throws you at a wall you cannot hold. What do you have, and where does it send you?',
  lines:[{a:[5,14],b:[25,14]}],slick:[[30,9,30,21],[0,5,0,21]],winds:[{c:9,r:6,w:15,h:4,dx:-150,dy:KITE}],decor:[{k:'kite',c:34,r:8}],map:span.rows()},
 {id:'fu24-eye',name:'The Lung’s Lower Turn',exit:'right',study:true,hint:'Pale air lifts · rose air drives you down · amber rails warn of the turn, and here it turns fast',
  question:'The column breathes out before you can reach its top from a slow start. When do you step in?',
  winds:[{c:24,r:6,w:5,h:12,dx:0,dy:UP}],breathing:{period:150,inhale:80,offsets:[110]},decor:[{k:'vent',c:25,r:20},{k:'windsock',c:34,r:8}],map:eye.rows()},
 {id:'fu24-lung',name:'The Lung',exit:'up',study:true,hint:'The two columns breathe out of step · as one turns, the polished wall throws you into the other',
  question:'The divider is too high to drift over. Which wall throws you across, and when?',
  slick:[[4,1,4,21],[9,7,10,21],[15,1,15,21]],winds:[{c:5,r:12,w:4,h:6,dx:0,dy:UP},{c:11,r:7,w:4,h:11,dx:0,dy:UP}],
  breathing:{period:120,inhale:70,offsets:[0,60]},decor:[{k:'vent',c:6,r:18}],map:lung.rows()},
 {id:'fu24-crown',name:'The Lung’s Crown',exit:'up',study:true,hint:'Three columns breathe one after another, faster · follow the breath across, a wall at a time',
  question:'Each column breathes in just as the one before it turns. Can you keep up with it?',
  slick:[[3,1,3,21],[8,9,9,21],[14,8,15,21],[21,1,21,21]],winds:[{c:4,r:13,w:4,h:5,dx:0,dy:UP},{c:10,r:11,w:4,h:9,dx:0,dy:UP},{c:16,r:6,w:5,h:14,dx:0,dy:UP}],
  breathing:{period:90,inhale:50,offsets:[0,30,70]},decor:[{k:'vent',c:5,r:18}],map:crown.rows()},
];
for(const r of rooms)r.question||='Where can you spend the dash and recover it before the next landing?';
const quests=[{id:'cartographer-echo',title:'The Interval Between',giver:'The Cartographer’s echo',from:'fu24-choir',back:{c:33,r:6},needs:'cartographer-chime',
 keepsake:{id:'cartographer-remembered',name:'The Cartographer, remembered',gives:'He moved his desk outside to listen to what his maps left out. Shown at the end.'},rooms:[
 {id:'fu24-q-channel',name:'The Unmeasured Channel',exit:'up',hint:'Wall, draft, tear, wall: each hands you to the next · the perch under the window is cracked',
  question:'Five pieces and no rest between them. What does each one leave you holding for the next?',
  slick:[[0,1,0,21],[31,1,31,21]],winds:[{c:8,r:10,w:3,h:4,dx:0,dy:UP},{c:28,r:9,w:3,h:5,dx:0,dy:UP}],lines:[{a:[12,8],b:[24,8]}],map:channel.rows()},
 {id:'fu24-q-funnel',name:'The Last Interval',exit:'left',study:true,hint:'Two breaths out of step, then a cracked cup under the window · every wall here is polished',
  question:'Breath, wall, breath, wall, cup, window. Which part of the interval did he stop listening to?',
  slick:[[3,3,3,21],[8,9,9,21],[14,1,14,21]],winds:[{c:4,r:13,w:4,h:5,dx:0,dy:UP},{c:10,r:11,w:4,h:9,dx:0,dy:UP}],
  breathing:{period:110,inhale:60,offsets:[0,55]},decor:[{k:'vent',c:5,r:18}],
  people:[{who:'cartographer',name:'THE CARTOGRAPHER’S ECHO',c:3,r:2,quest:'cartographer-echo',line:'It was never silence. I had stopped listening.',lineDone:'Leave the window open.'}],map:funnel.rows()},
]}];
const META={
 "n": 24,
 "name": "The Fractured Updrafts",
 "kit": [
  "dash",
  "strike",
  "parry",
  "portal"
 ],
 "folk": {
  "talla": {
   "cloak": "#e2dac6",
   "trim": "#c83c3c",
   "skin": "#9a6a4a",
   "cap": true
  },
  "edrin": {
   "cloak": "#5a6a76",
   "trim": "#7c8e9a",
   "skin": "#c8a07a",
   "hood": true
  },
  "ilyra": {
   "cloak": "#4f6f8a",
   "trim": "#9fe0ff",
   "skin": "#c99a76",
   "hood": true,
   "staff": true
  },
  "cartographer": {
   "cloak": "#3a4a5e",
   "trim": "#9fe0ff",
   "skin": "#d6b494",
   "cap": true,
   "staff": true
  }
 },
 "props": {
  "vent": [
   [
    0,
    -2,
    8,
    2,
    "#4a4038"
   ],
   [
    1,
    -3,
    1,
    1,
    "#6a5e52"
   ],
   [
    3,
    -3,
    1,
    1,
    "#6a5e52"
   ],
   [
    5,
    -3,
    1,
    1,
    "#6a5e52"
   ]
  ],
  "bellows": [
   [
    0,
    -6,
    11,
    6,
    "#6a4a32"
   ],
   [
    1,
    -7,
    9,
    1,
    "#8a6a46"
   ],
   [
    11,
    -4,
    3,
    2,
    "#4a3a2a"
   ],
   [
    2,
    -4,
    7,
    1,
    "#4a3424"
   ]
  ],
  "windsock": [
   [
    3,
    -22,
    1,
    22,
    "#5a4a3a"
   ],
   [
    4,
    -22,
    6,
    3,
    "#c85a3a"
   ],
   [
    10,
    -21,
    3,
    2,
    "#e8d0b0"
   ]
  ],
  "kite": [
   [
    2,
    -16,
    1,
    16,
    "#5a4a3a"
   ],
   [
    0,
    -23,
    6,
    7,
    "#d8c27a"
   ],
   [
    2,
    -21,
    2,
    3,
    "#b04a3a"
   ]
  ],
  "desk": [
   [
    0,
    -6,
    14,
    1,
    "#7a5a3a"
   ],
   [
    1,
    -5,
    1,
    5,
    "#5a4030"
   ],
   [
    12,
    -5,
    1,
    5,
    "#5a4030"
   ],
   [
    2,
    -8,
    7,
    2,
    "#e8e0c8"
   ],
   [
    10,
    -9,
    1,
    3,
    "#2a2a3a"
   ],
   [
    3,
    -9,
    4,
    1,
    "#9fe0ff"
   ]
  ],
  "chimes": [
   [
    0,
    -26,
    1,
    26,
    "#6a5a40"
   ],
   [
    0,
    -26,
    13,
    1,
    "#6a5a40"
   ],
   [
    3,
    -25,
    1,
    8,
    "#c9d6e0"
   ],
   [
    6,
    -25,
    1,
    10,
    "#c9d6e0"
   ],
   [
    9,
    -25,
    1,
    7,
    "#c9d6e0"
   ],
   [
    12,
    -25,
    1,
    9,
    "#c9d6e0"
   ]
  ],
  "funnel": [
   [
    0,
    -14,
    12,
    2,
    "#9a8a6a"
   ],
   [
    2,
    -12,
    8,
    2,
    "#8a7a5a"
   ],
   [
    5,
    -10,
    2,
    10,
    "#6a5a40"
   ]
  ],
  "sail": [
   [
    3,
    -30,
    2,
    30,
    "#5a4a3a"
   ],
   [
    5,
    -30,
    9,
    10,
    "#e8dcc0"
   ],
   [
    5,
    -20,
    6,
    5,
    "#c8bca0"
   ]
  ],
  "gutter": [
   [
    0,
    -3,
    16,
    1,
    "#8a8a90"
   ],
   [
    0,
    -2,
    1,
    2,
    "#6a6a70"
   ],
   [
    15,
    -2,
    1,
    2,
    "#6a6a70"
   ]
  ],
  "cage": [
   [
    0,
    -10,
    13,
    1,
    "#6a5a40"
   ],
   [
    0,
    -10,
    1,
    10,
    "#6a5a40"
   ],
   [
    12,
    -10,
    1,
    10,
    "#6a5a40"
   ],
   [
    0,
    -1,
    13,
    1,
    "#6a5a40"
   ],
   [
    4,
    -9,
    1,
    8,
    "#4a3e30"
   ],
   [
    8,
    -9,
    1,
    8,
    "#4a3e30"
   ],
   [
    3,
    -14,
    1,
    4,
    "#4a3e30"
   ],
   [
    9,
    -13,
    1,
    3,
    "#4a3e30"
   ]
  ],
  "windwheel": [
   [
    5,
    -24,
    2,
    24,
    "#5a4a3a"
   ],
   [
    0,
    -30,
    12,
    2,
    "#d9a84a"
   ],
   [
    5,
    -35,
    2,
    12,
    "#d9a84a"
   ]
  ]
 },
 "blurb": "The aerie is empty. The canyons inhale, then breathe you down. Their warning reaches from the grate to the highest ledge.",
 "outro": "The Signal Crown is empty, but the wind has carried you beyond it. The watch lights ahead are still searching.",
 "note": "The device is the Frostfell wind (winds:[…]); see the header of scripts/rbr-src/04-updrafts.mjs.",

};
export default {...META,rooms,quests};
