// Room by Room · 23. The Fractured Causeway (7.280 rebuild). Source for public/bladefall-rbr-23-f-causeway.js
// (node scripts/rbr-src/gen.mjs 23). docs/plans/fractured-hard.md, stage I: the ULTRA — a down-diagonal dash that
// lands keeps going along the ground (×1.2, and the dash comes back at once). The Causeway's lifts throw you when you
// jump as they slam to a stop; the ultra is how you keep that speed when you come down, and the hyper (taught in the
// Woods) is the jump out of it. Tears (the zipline) carry you between the low road and the high one: dash into one in
// flight and it sets you on a cracked perch. Every perch, sill and link here is cracked, with thorns under it.
// The Brute is back, armoured twice over in three courts (crush:2) and stamping after every charge (stamp:'always').
// Room flow: camp (the throw, the ultra) → yard → relay (first tear) → Silas's bench (his echo goes up) → rise →
// counterpoise → chainwalk (the hardest road room) → the well (the one rest) → the last gantry → the Brute.
import {grid} from './build.mjs';
const shell=()=>grid().frame();
const S=[];

// 1 · Chainwake, After the Bell — the lift throws you at a thorned roof; dive under it (a down-diagonal dash into the
// floor) onto the cracked sill, and the dash carries you on along it (an ultra): jump out of it to clear the pit.
const camp=shell();
camp.rect(0,12,8,22,'#').rect(9,12,12,12,'Z').rect(9,21,38,21,'^').rect(9,22,38,22,'#').rect(28,1,38,7,'#').rect(28,0,38,0,'#').rect(28,1,28,7,'<').rect(28,8,38,8,'v')
 .rect(28,12,30,12,'~').rect(39,9,39,12,'.').put(3,11,'P');

// 2 · The Drop Yard — the lift throws you at a low road; land the dive on the cracked sill (an ultra) and jump out of
// it: the hyper carries you over the yard's pit under the roof to the far wall, and up the wall to the high door.
const yard=shell();
yard.rect(0,18,6,22,'#').rect(7,18,10,18,'Z').rect(7,21,38,21,'^').rect(7,22,38,22,'#').rect(25,4,33,14,'#').rect(25,3,33,3,'^').rect(25,4,25,14,'<')
 .rect(33,4,33,14,'>').rect(25,18,27,18,'~').rect(39,5,39,7,'.').put(3,17,'P');

// 3 · The Broken Chainwalk — cracked links under the brake roof: hyper from link to link along the low walk, dash
// into the tear at its end in flight, and it lifts you to a cracked perch at the head of the high walk; back along it
// link to link. No link holds, and the walls at the far end are thorned, so the tear is the only way up.
const chainwalk=shell();
chainwalk.rect(0,18,4,22,'#').rect(5,21,38,21,'^').rect(5,22,38,22,'#').rect(5,10,33,13,'#').rect(5,14,33,14,'v').rect(5,9,33,9,'^')
 .rect(5,1,33,4,'#').rect(5,5,33,5,'v').rect(1,9,4,9,'#').rect(0,6,0,8,'.').rect(14,18,16,18,'~').rect(25,18,27,18,'~')
 .rect(32,9,34,9,'~').rect(21,9,23,9,'~').rect(10,9,12,9,'~').rect(35,9,37,9,'.').rect(38,10,38,20,'<').rect(33,10,33,13,'>').rect(10,10,12,10,'^').rect(21,10,23,10,'^').rect(32,10,32,10,'^').put(2,17,'P');

// 4 · The Counterweight Rise — a lift up the thorned shaft throws you clear of its mouth onto a cracked lip; a super
// off the lip before it falls, down onto a cracked sill in the middle of the void, and a second super off that, with
// the dash it gave back, up and out over the thorned block.
const rise=shell();
rise.rect(0,20,8,22,'#').rect(9,20,12,20,'Z').rect(9,21,38,21,'^').rect(9,22,38,22,'#').rect(1,7,8,12,'#').rect(8,7,8,15,'>').rect(13,7,13,19,'<')
 .rect(14,7,17,7,'~').rect(26,11,28,11,'~').rect(33,7,35,7,'~').rect(34,11,38,22,'#').rect(34,10,38,10,'^').rect(33,11,33,20,'<').rect(38,4,38,9,'<').rect(39,1,39,3,'.').put(3,19,'P');

// 5 · The Relay Gantry — the lift throws you past a tear's mouth; dash into it in flight and it sets you down on a
// cracked perch; off the perch onto the second lift before it falls, and the second lift runs you into the brake
// thorns unless you jump as it slams to a stop.
const relay=shell();
relay.rect(0,18,5,22,'#').rect(6,18,9,18,'Z').rect(6,21,38,21,'^').rect(6,22,38,22,'#').rect(25,8,27,8,'~').rect(31,6,34,6,'Z')
 .rect(37,7,38,22,'#').rect(36,7,36,20,'<').rect(38,4,38,4,'<').rect(36,5,38,5,'v').rect(39,1,39,3,'.').put(2,17,'P');

// 6 · The Forty-First Pace — Silas's bench. The road: the lift throws you over the yard; dive under the gantry's lip
// onto the cracked sill and hyper out of it, then dive again under the brake housing to the low door. His key opens the old maintenance shaft above the bench.
const silas=shell();
silas.rect(0,14,6,22,'#').rect(5,1,5,9,'#').rect(7,14,10,14,'Z').rect(7,21,38,21,'^').rect(7,22,38,22,'#')
 .rect(26,4,38,13,'#').rect(26,3,38,3,'^').rect(26,4,26,13,'<').rect(26,17,28,17,'~').rect(34,14,38,15,'#').rect(34,14,34,15,'<').rect(34,16,38,16,'v')
 .rect(34,20,36,20,'~').rect(39,17,39,18,'.').rect(1,0,4,0,'.').put(4,13,'P');

// 6b · The Counterpoise — the lift throws you back the way you came: dive under the bar onto the cracked sill, hyper
// out, dash into the tear in flight; it lifts you to a cracked lip under the brake roof, and two hypers carry you along
// under the brake, cracked shelf to cracked shelf, to the far door. Nowhere to stand between the lift and the door.
const poise=shell();
poise.rect(33,16,39,22,'#').rect(1,21,32,21,'^').rect(1,22,32,22,'#').rect(29,16,32,16,'Z').rect(14,13,20,13,'#').rect(14,12,20,12,'^').rect(14,14,20,14,'v')
 .rect(18,18,20,18,'~').rect(1,6,1,20,'>').rect(30,4,33,4,'~').rect(18,4,20,4,'~').rect(4,1,30,1,'v').rect(38,1,38,15,'<')
 .rect(29,10,37,10,'#').rect(29,9,37,9,'^').rect(29,11,37,11,'v').rect(1,4,7,5,'#').rect(0,1,0,3,'.').put(37,15,'P');

// 7 · The Unlit Well — the one breath before the courts: down the dry well on its old steps, past the lantern
// nobody lit. (The region's rest room, by the brief: placed before the Brute.)
const well=shell();
well.rect(0,6,9,22,'#').rect(10,10,15,22,'#').rect(16,14,21,22,'#').rect(22,18,38,22,'#').rect(39,15,39,17,'.').put(4,5,'P');

// 8 · The Last Gantry — the whole causeway in one breath: the lift's throw, a dive onto the cracked sill and a hyper
// out of it, a dash into the tear in flight, which lifts you to the cracked lip at the top, and a super back across
// the top to the crystal and the way up. Nowhere to stand between the first lift and the top.
const gantry=shell();
gantry.rect(0,18,5,22,'#').rect(6,18,9,18,'Z').rect(6,21,38,21,'^').rect(6,22,38,22,'#').rect(24,8,33,14,'#').rect(24,8,24,14,'<').rect(24,7,33,7,'^')
 .rect(24,18,26,18,'~').rect(38,8,38,20,'<').rect(33,8,33,14,'>').rect(29,4,32,4,'~')
 .rect(1,4,18,4,'#').rect(1,5,18,5,'v').rect(11,0,14,0,'.').put(22,3,'o').put(2,17,'P');

// 9 · The Broken Standard — the Brute wakes, and stamps after every charge from the first (stamp:'always'): jump the
// charge, then the shockwave, and let the brace across the road take the blow you cannot.
const brace=shell();
brace.rect(0,18,39,22,'#').rect(1,9,7,9,'#').rect(39,14,39,17,'.').rect(0,5,0,8,'.').put(3,8,'P');
const braceCombat={waitForMove:true,enemies:[{kind:'hound',brute:true,stamp:'always',x:24,y:128,face:1}],receivers:[],doors:[{x:240,y:8,w:16,h:136,brittle:true}]};

// 10–12 · The counterweight courts. Three crushes now, one court each, and it stamps after every charge (stamp:'always'):
// bait the charge under the weight, drop it, and jump the shockwave while it heaves itself out.
const west=shell();
west.rect(0,18,39,22,'#').rect(1,9,4,10,'K').rect(32,9,35,10,'K').rect(39,14,39,17,'.').put(6,17,'P');
const westCombat={waitForMove:true,enemies:[{kind:'hound',brute:true,crush:2,stamp:'always',x:200,y:128,face:-1,ward:'brute'}],receivers:[],doors:[{x:296,y:8,w:8,h:136,ward:'brute'}]};

// The east court runs the other way (the west court, reflected).
const east=shell();
east.rect(0,18,39,22,'#').rect(35,9,38,10,'K').rect(4,9,7,10,'K').rect(0,14,0,17,'.').put(33,17,'P');
const eastCombat={waitForMove:true,enemies:[{kind:'hound',brute:true,crush:2,stamp:'always',x:96,y:128,face:1,ward:'brute'}],receivers:[],doors:[{x:16,y:8,w:8,h:136,ward:'brute'}]};

// The last count: a stop post in the middle of the court. The first weight hangs over the post, the second over the
// gate; it gets up quicker after the first and stamps every time.
const middle=shell();
middle.rect(0,18,39,22,'#').rect(16,16,16,17,'#').rect(17,9,20,10,'K').rect(33,9,36,10,'K').rect(39,14,39,17,'.').put(22,17,'P');
const middleCombat={waitForMove:true,enemies:[{kind:'hound',brute:true,crush:2,stamp:'always',x:240,y:128,face:-1,ward:'brute'}],receivers:[],doors:[{x:296,y:8,w:8,h:136,ward:'brute'}]};

// Silas's echo (sealed until his winding key is held): the old maintenance shaft and the governor. The hardest rooms
// of the region: every landing cracks or moves.
const ladder=shell();
ladder.rect(0,20,6,22,'#').rect(7,21,37,21,'^').rect(7,22,37,22,'#').rect(1,11,1,19,'>').rect(38,1,38,21,'<').rect(7,20,10,20,'Z')
 .rect(1,8,30,9,'#').rect(1,7,30,7,'^').rect(1,10,21,10,'v').rect(22,10,30,14,'#').rect(22,10,22,14,'<').rect(22,15,30,15,'v')
 .rect(30,8,30,14,'>').rect(25,19,27,19,'~').rect(30,6,32,6,'~').rect(18,6,20,6,'~').rect(5,6,7,6,'~')
 .rect(9,1,28,2,'#').rect(9,3,28,3,'v').rect(1,1,1,6,'>').rect(5,0,7,0,'.').put(3,19,'P');
const gov=shell();
gov.rect(0,16,6,22,'#').rect(7,21,38,21,'^').rect(7,22,38,22,'#').rect(7,16,10,16,'Z').rect(19,13,25,13,'#').rect(19,12,25,12,'^').rect(19,14,25,14,'v')
 .rect(19,18,21,18,'~').rect(6,4,8,4,'~').put(16,2,'o').rect(21,4,23,4,'~').rect(38,6,38,20,'<')
 .rect(29,4,31,4,'~').rect(29,6,31,6,'^').rect(35,4,38,5,'#').rect(39,1,39,3,'.').put(37,3,'*').put(2,15,'P');

const rooms=[
 {id:'fc23-camp',name:'Chainwake, After the Bell',exit:'right',hint:'Jump as the lift slams to a stop and it throws you · a down-diagonal dash that lands keeps going (an ultra) · jump out of it over the pit',
  question:'The lift throws you straight at the roof, and the sill under it is cracked. How do you get under it without losing the speed?',
  decor:[{k:'tent',c:1,r:11},{k:'watchfire',c:5,r:11}],map:camp.rows(),zips:[[8,0]]},
 {id:'fc23-yard',name:'The Drop Yard',exit:'right',hint:'Land the down-diagonal dash and it keeps going along the floor (an ultra) · jump out of it and it is a hyper · catch the far wall and climb to the door',
  question:'The sill under the roof is cracked and the yard beyond is wide. What do you land with, and what do you leave with?',map:yard.rows(),zips:[[7,0]]},
 {id:'fc23-relay',name:'The Relay Gantry',exit:'right',hint:'Dash into a tear while the lift’s throw still carries you · it sets you down on a cracked perch · onto the next lift, and jump off it over the brake thorns',
  question:'The tear’s mouth is in the air. When is it in reach, and how long does the perch it sets you on hold?',
  lines:[{a:[21,13],b:[26,6],setDown:true}],map:relay.rows(),zips:[[4,0],[4,0]]},
 {id:'fc23-silas',name:'The Forty-First Pace',exit:'right',side:'up',hint:'Silas’s winding key opens the abandoned maintenance shaft · the road: a throw, a dive, a hyper, a dive under the brake housing',
  question:'Will you follow the step beyond his old turning point?',
  people:[{who:'silas',name:'SILAS’S ECHO',c:5,r:13,quest:'silas-echo',line:'Forty paces. I remember the forty-first better.',lineDone:'I chose that step. That part still belongs to me.'}],
  decor:[{k:'bench',c:1,r:13}],map:silas.rows(),zips:[[6,0]]},
 {id:'fc23-rise',name:'The Counterweight Rise',exit:'right',hint:'A lift going up throws you up · the lip at the top is cracked, so the super starts as you land · the sill in the void is cracked too',
  question:'The lift throws you out of the shaft. How long do you have on the lip, and where does the second super start?',map:rise.rows(),zips:[[0,-9]]},
 {id:'fc23-counterpoise',name:'The Counterpoise',exit:'left',hint:'Throw, dive under the bar, hyper · dash into the tear in flight · two hypers under the brake, cracked shelf to cracked shelf',
  question:'The same causeway, the other way, and the brake roof over the top. Where does each hyper start?',
  lines:[{a:[5,17],b:[33,2],setDown:true}],map:poise.rows(),zips:[[-5,0]]},
 {id:'fc23-chainwalk',name:'The Broken Chainwalk',exit:'left',hint:'Cracked links under the brake roof: hyper link to link · dash into the tear in flight · it sets you on a cracked perch: back along the high walk',
  question:'Out along the low walk, up the tear, back along the high walk, and no link that holds. Where does each hyper start?',
  lines:[{a:[37,18],b:[34,7],setDown:true}],map:chainwalk.rows()},
 {id:'fc23-well',name:'The Unlit Well',exit:'right',hint:'A breath before the courts · the Brute sleeps under the next standard',
  question:'Nothing moves here. What will you need when something does?',decor:[{k:'cw-crate',c:30,r:17},{k:'cw-chain-long',c:34,r:17}],map:well.rows()},
 {id:'fc23-gantry',name:'The Last Gantry',exit:'up',hint:'Throw, dive, hyper · dash into the tear in flight · the lip it sets you on is cracked: super off it before it falls',
  question:'Eight moves and nowhere to stand between them. Which one do you rehearse first?',
  lines:[{a:[36,17],b:[32,2],setDown:true}],map:gantry.rows(),zips:[[7,0]]},
 {id:'fc23-standard',name:'The Broken Standard',exit:'right',hint:'The Iron Echo can break what your blade cannot · every charge ends in a stamp along the floor',
  question:'Where will its committed charge end, and where will you be when the floor shakes?',
  decor:[{k:'cw-standard',c:10,r:17},{k:'cw-crate',c:35,r:17}],map:brace.rows(),combat:braceCombat},
 {id:'fc23-west',name:'The West Counterweight',exit:'right',study:true,hint:'Two weights, two crushes · after the first it gets up faster, and every charge ends in a stamp',
  question:'The first weight only cracks it. Where must the armour stop before the second falls?',
  decor:[{k:'cw-chain-long',c:1,r:8},{k:'cw-chain-long',c:4,r:8},{k:'cw-chain-long',c:32,r:8},{k:'cw-chain-long',c:35,r:8}],map:west.rows(),combat:westCombat},
 {id:'fc23-east',name:'The East Counterweight',exit:'left',study:true,hint:'The second court runs the other way · two weights again, and it is quicker after the first',
  question:'Can you put the weight between its charge and the floor twice?',
  decor:[{k:'cw-chain-long',c:38,r:8},{k:'cw-chain-long',c:35,r:8},{k:'cw-chain-long',c:7,r:8},{k:'cw-chain-long',c:4,r:8}],map:east.rows(),combat:eastCombat},
 {id:'fc23-middle',name:'The Last Count',exit:'right',study:true,hint:'The post in the court stops a charge under the first weight · the gate stops the second',
  question:'Which side of the post leaves the armour beneath the weight, and which weight is the last?',
  decor:[{k:'cw-chain-long',c:17,r:8},{k:'cw-chain-long',c:20,r:8},{k:'cw-chain-long',c:33,r:8},{k:'cw-chain-long',c:36,r:8},{k:'cw-standard',c:9,r:17}],map:middle.rows(),combat:middleCombat},
];
for(const r of rooms)r.question||='Where can you spend the dash and recover it before the next landing?';

const META={
 "n": 23,
 "name": "The Fractured Causeway",
 "kit": [
  "dash",
  "strike",
  "parry",
  "portal"
 ],
 "folk": {
  "oren": {
   "cloak": "#5b4a3a",
   "trim": "#c8883a",
   "skin": "#cfa07e",
   "cap": true
  },
  "sable": {
   "cloak": "#3e4a52",
   "trim": "#d8d2c0",
   "skin": "#b98d6c",
   "hood": true,
   "staff": true
  },
  "silas": {
   "cloak": "#6a5038",
   "trim": "#d59a68",
   "skin": "#c9b9a0",
   "helm": true
  }
 },
 "props": {
  "cw-chain": [
   [
    3,
    -6,
    2,
    5,
    "#7d7466"
   ],
   [
    3,
    -6,
    1,
    1,
    "#b0a48e"
   ],
   [
    3,
    -12,
    2,
    5,
    "#7d7466"
   ],
   [
    3,
    -12,
    1,
    1,
    "#b0a48e"
   ],
   [
    3,
    -18,
    2,
    5,
    "#7d7466"
   ],
   [
    3,
    -18,
    1,
    1,
    "#b0a48e"
   ],
   [
    3,
    -24,
    2,
    5,
    "#7d7466"
   ],
   [
    3,
    -24,
    1,
    1,
    "#b0a48e"
   ],
   [
    3,
    -30,
    2,
    5,
    "#7d7466"
   ],
   [
    3,
    -30,
    1,
    1,
    "#b0a48e"
   ]
  ],
  "cw-chain-long": [
   [
    3,
    -6,
    2,
    5,
    "#7d7466"
   ],
   [
    3,
    -6,
    1,
    1,
    "#b0a48e"
   ],
   [
    3,
    -12,
    2,
    5,
    "#7d7466"
   ],
   [
    3,
    -12,
    1,
    1,
    "#b0a48e"
   ],
   [
    3,
    -18,
    2,
    5,
    "#7d7466"
   ],
   [
    3,
    -18,
    1,
    1,
    "#b0a48e"
   ],
   [
    3,
    -24,
    2,
    5,
    "#7d7466"
   ],
   [
    3,
    -24,
    1,
    1,
    "#b0a48e"
   ],
   [
    3,
    -30,
    2,
    5,
    "#7d7466"
   ],
   [
    3,
    -30,
    1,
    1,
    "#b0a48e"
   ],
   [
    3,
    -36,
    2,
    5,
    "#7d7466"
   ],
   [
    3,
    -36,
    1,
    1,
    "#b0a48e"
   ],
   [
    3,
    -42,
    2,
    5,
    "#7d7466"
   ],
   [
    3,
    -42,
    1,
    1,
    "#b0a48e"
   ],
   [
    3,
    -48,
    2,
    5,
    "#7d7466"
   ],
   [
    3,
    -48,
    1,
    1,
    "#b0a48e"
   ],
   [
    3,
    -54,
    2,
    5,
    "#7d7466"
   ],
   [
    3,
    -54,
    1,
    1,
    "#b0a48e"
   ],
   [
    3,
    -60,
    2,
    5,
    "#7d7466"
   ],
   [
    3,
    -60,
    1,
    1,
    "#b0a48e"
   ],
   [
    3,
    -66,
    2,
    5,
    "#7d7466"
   ],
   [
    3,
    -66,
    1,
    1,
    "#b0a48e"
   ],
   [
    3,
    -72,
    2,
    5,
    "#7d7466"
   ],
   [
    3,
    -72,
    1,
    1,
    "#b0a48e"
   ]
  ],
  "cw-winch": [
   [
    0,
    -12,
    1,
    12,
    "#4a3a2c"
   ],
   [
    11,
    -12,
    1,
    12,
    "#4a3a2c"
   ],
   [
    0,
    -13,
    12,
    1,
    "#6a5a48"
   ],
   [
    2,
    -10,
    8,
    6,
    "#6e5236"
   ],
   [
    2,
    -8,
    8,
    1,
    "#c8a060"
   ],
   [
    5,
    -15,
    2,
    3,
    "#c8a060"
   ],
   [
    1,
    -1,
    10,
    1,
    "#3a2e24"
   ]
  ],
  "cw-stretcher": [
   [
    0,
    -3,
    15,
    1,
    "#8a6a40"
   ],
   [
    1,
    -2,
    1,
    2,
    "#5a4632"
   ],
   [
    13,
    -2,
    1,
    2,
    "#5a4632"
   ],
   [
    2,
    -5,
    11,
    2,
    "#c8c0a8"
   ],
   [
    3,
    -6,
    3,
    1,
    "#c8c0a8"
   ]
  ],
  "cw-standard": [
   [
    3,
    -34,
    2,
    34,
    "#5a4a3a"
   ],
   [
    5,
    -33,
    9,
    7,
    "#7a2a2a"
   ],
   [
    5,
    -26,
    6,
    3,
    "#5a1e1e"
   ],
   [
    12,
    -26,
    2,
    2,
    "#5a1e1e"
   ],
   [
    1,
    -35,
    6,
    1,
    "#c8a060"
   ]
  ],
  "cw-crate": [
   [
    0,
    -8,
    8,
    8,
    "#6a5032"
   ],
   [
    0,
    -8,
    8,
    1,
    "#8a6a42"
   ],
   [
    1,
    -5,
    6,
    1,
    "#4a3622"
   ],
   [
    3,
    -8,
    1,
    8,
    "#4a3622"
   ]
  ],
  "cw-gear": [
   [
    2,
    -14,
    12,
    12,
    "#6a5a3a"
   ],
   [
    4,
    -16,
    8,
    16,
    "#6a5a3a"
   ],
   [
    0,
    -12,
    16,
    8,
    "#6a5a3a"
   ],
   [
    5,
    -11,
    6,
    6,
    "#2e281e"
   ],
   [
    7,
    -9,
    2,
    2,
    "#c8a060"
   ],
   [
    3,
    -13,
    10,
    1,
    "#9a8458"
   ]
  ]
 },
 "blurb": "The hoists work again. The armour beneath the standard has forgotten the person who wore it. Weight remembers what the blade cannot do.",
 "outro": "Three counterweights lie across three silent courts. The Iron Echo has stopped trying. The wind beyond the causeway blows uphill.",

};
const quests=[{id:'silas-echo',title:'The Forty-First Pace',giver:'Silas’s echo',from:'fc23-silas',back:{c:3,r:13},needs:'silas-key',
 keepsake:{id:'silas-remembered',name:'Silas, remembered',gives:'His first freely chosen step outlasted the machine that counted the others. Shown at the end.'},rooms:[
 {id:'fc23-q-ladder',name:'The Quiet Maintenance Shaft',exit:'up',hint:'The lift’s throw, a dive onto the cracked sill and a hyper out · dash into the tear in flight · two hypers under the brake, cracked sill to cracked sill · up and out',
  question:'Eleven moves, and every sill in the shaft is cracked. Where does each one start?',
  lines:[{a:[35,15],b:[32,4],setDown:true}],
  map:ladder.rows(),zips:[[6,0]]},
 {id:'fc23-q-governor',name:'A Gear That No Longer Turns',exit:'right',hint:'Throw, dive under the bar, hyper · the tear carries you once, to the far corner · super off its cracked lip · the crystal pays back a dash · two more cracked shelves',
  question:'The gear sits at the far end of the top of the room, three cracked shelves away. How many dashes is that, and which one does the crystal pay for?',
  lines:[{a:[34,17],b:[8,2],setDown:true,once:true}],
  people:[{who:'silas',name:'SILAS’S ECHO',c:38,r:3,quest:'silas-echo',line:'There was a bench beyond the turning point. I never knew.',lineDone:'I sat there because I wanted to.'}],
  decor:[{k:'cw-gear',c:35,r:3}],map:gov.rows(),zips:[[5,0]]},
 ]}];
export default {...META,rooms,quests};
