// Room by Room · 3. Broken Causeway. Source for public/bladefall-rbr-03-causeway.js (node scripts/rbr-src/gen.mjs 03).
// A stopped civic machine: committed mass turns from hazard to terrain to the boss's solution. The base region's five
// rooms (Chainwake Camp, Drop Yard, Chainwalk, Counterweight Rise, Broken Standard) become twelve screens.
// Kit: dash and the blade (from Black Woods). The device is committed mass, in two forms from the core:
//   the counterweight lift (Z, a zip block: it runs while weight is on it, holds, and comes home), and
//   the counterweight (K, a slide stone: strike a face with a dash and it runs away from you until something stops it).
// Order: the lift seen (Camp) → alone: it carries (Drop Yard), it throws as it stops (The Hoist) → a flat throw
//   (Patrol Road) → chained (Chainwalk, The Upper Chain, where one throw is a trap) → the stone alone: send it
//   (Counterweight Rise), drop it (Weigh Well) → combined: the weight on the lift's car is moved and becomes the
//   step (Rise Gantry) → synthesis (The Standard Road) → the Brute: its charge breaks the brace (Broken Standard),
//   then the counterweight dropped on it (The Counterweight). One weight only cracks it (crush:2, 7.277): it heaves
//   out, gets up faster and stamps a shockwave along the floor whenever its charge stops (stamp:true); the second
//   weight hangs over the gate.
// The Brute is a Combat hound with brute:true; bladefall-pcore-dev-rbr-causeway.js makes it big (24×16) and armoured
//   (the blade glances off), so only weight ends it (the Combat actors' crush). The page must load that module.
// No safety walkway under any lift: every lift runs over a real void (an open bottom edge).
// Zip targets (`zips`) are listed in reading order of the Z blocks (top row first, then left to right).
// Quest (optional, branch): Silas · The Clockwork Defector, up the maintenance ladder from the Patrol Road.
// Skip hunts (node scripts/rbr-skip.mjs <room> --without <event> --plain), all "no skip found":
//   c3-drop, c3-hoist, c3-patrol (zip-start); c3-rise, c3-well, c3-gantry (stone-hit). c3-well also holds by
//   construction: the counterweight fills the only shaft down. (Rise and Gantry each had a one-tile stub to dock the
//   stone against; both stubs were climbable and let a plain climb reach the top, so they were removed: the stone
//   now docks against the thorned wall and covers its thorns.) Known, advisory:
//   c3-road: the crystal can be reached from the flat lift's stop without its throw (one more dash does it).
//   Tech: a hyper flies about 30 tiles, so the flat throws (Patrol Road, Standard Road) can be matched by mastery.
import {grid} from './build.mjs';

// 1 · Chainwake Camp — the stopped lift hangs under the arch, out of reach. Jumps only.
const camp=grid().frame();
camp.rect(0,18,39,22,'#').rect(13,16,15,17,'#').rect(21,18,23,18,'^').rect(39,13,39,17,'.').rect(0,14,0,17,'.')
 .rect(25,6,28,6,'Z').put(3,17,'P');

// 2 · Drop Yard — the lift alone, over a real void. The shelf is out of any jump's reach.
const drop=grid().frame();
drop.rect(0,18,9,22,'#').rect(10,19,29,22,'.').rect(18,20,21,20,'Z')
 .rect(30,9,39,22,'#').rect(29,9,29,22,'<').rect(39,5,39,8,'.').rect(0,14,0,17,'.').put(3,17,'P');

// 3 · The Hoist — the lift stops short; jump as it stops and it throws you the rest of the way.
const hoist=grid().frame();
hoist.rect(0,21,6,22,'#').rect(7,19,39,22,'.').rect(14,21,17,21,'Z')
 .rect(20,6,39,22,'#').rect(19,6,19,22,'<').rect(39,2,39,5,'.').rect(0,17,0,20,'.').put(3,20,'P');

// 4 · The Patrol Road — a flat lift throws you the way it was going. Silas walks the patrol walk; the
// maintenance ladder (the chimney at the left) goes up to his governor (the quest).
const patrol=grid().frame();
patrol.rect(0,14,11,22,'#').rect(12,15,38,22,'.').rect(13,14,16,14,'Z')
 .rect(1,0,4,13,'.').rect(5,1,5,9,'#').rect(39,9,39,17,'.').rect(38,18,38,21,'<').rect(12,22,37,22,'.')
 .put(8,13,'P');

// 5 · Chainwalk — two lifts: the first carries you to the second, the second to the top.
const chainwalk=grid().frame();
chainwalk.rect(0,20,5,22,'#').rect(6,19,35,22,'.').rect(8,20,11,20,'Z').rect(18,11,21,11,'Z')
 .rect(30,5,39,22,'#').rect(29,5,29,22,'<').rect(39,1,39,4,'.').rect(0,16,0,19,'.').put(2,19,'P');

// 6 · The Upper Chain — three lifts. The middle one throws you into the pillar if you leave it as it stops.
const upper=grid().frame();
upper.rect(0,20,4,22,'#').rect(5,19,38,22,'.').rect(6,20,9,20,'Z').rect(12,9,15,9,'Z').rect(29,14,32,14,'Z')
 .rect(35,4,39,22,'#').rect(34,5,34,22,'<').rect(39,1,39,3,'.').rect(0,16,0,19,'.').put(2,19,'P');

// 7 · Counterweight Rise — the stone alone: send it to the wall that has no foothold.
const rise=grid().frame();
rise.rect(0,18,39,22,'#').rect(1,13,9,13,'#').rect(8,11,9,12,'K')
 .rect(31,5,39,22,'#').rect(30,5,30,17,'<').rect(39,1,39,4,'.').rect(0,14,0,17,'.').put(3,17,'P');

// 8 · The Weigh Well — the counterweight plugs the well. Dash down on it and it drops; it is the floor below.
const well=grid(40,23,'#');
well.rect(1,2,38,7,'.').rect(0,4,0,7,'.').rect(12,8,14,20,'.').rect(1,13,38,20,'.').rect(1,21,17,21,'^').rect(39,16,39,20,'.')
 .rect(12,9,14,10,'K').put(4,7,'P');

// 9 · Rise Gantry — the counterweight hangs on the lift's car. Send it off, and it docks where you need a step.
const gantry=grid().frame();
gantry.rect(0,18,6,22,'#').rect(7,19,30,22,'.').rect(9,18,12,18,'Z').rect(9,16,12,17,'K')
 .rect(31,9,39,22,'#').rect(30,9,30,22,'<').rect(39,5,39,8,'.').rect(0,14,0,17,'.').put(3,17,'P');

// 10 · The Standard Road — everything: drop the plug, ride the flat lift and leave it as it stops, take the crystal.
const road=grid(40,23,'#');
road.rect(1,2,20,6,'.').rect(0,3,0,6,'.').rect(9,7,11,10,'.').rect(9,8,11,9,'K')
 .rect(1,11,38,19,'.').rect(22,1,38,10,'.').rect(1,20,12,20,'^').rect(12,20,34,22,'.').rect(12,19,15,19,'Z')
 .rect(36,12,39,22,'#').rect(39,7,39,11,'.').put(34,11,'o').put(4,6,'P');

// 11 · Broken Standard — the Brute wakes. The brace across the road is too strong for you, not for it.
const brace=grid().frame();
brace.rect(0,18,39,22,'#').rect(1,9,7,9,'#').rect(16,12,24,12,'=').rect(39,14,39,17,'.').rect(0,5,0,8,'.').put(3,8,'P');
const braceCombat={waitForMove:true,enemies:[{kind:'hound',brute:true,x:24,y:128,face:1}],receivers:[],doors:[{x:240,y:8,w:16,h:136,brittle:true}]};

// 12 · The Counterweight — bait the charge under the weight, then drop it. One weight only cracks its armour (crush:2):
// it heaves out from under the stone, gets up faster, and every charge that ends against something solid ends in a
// stamp (stamp:true), a shockwave along the floor that you jump. The second weight hangs over the gate, one tile off
// it, so the gate can be climbed past it: bait the charge into the gate and drop the second weight. The gate opens
// when the Brute is down.
const cw=grid().frame();
cw.rect(0,18,39,22,'#').rect(1,9,4,10,'K').rect(32,9,35,10,'K').rect(39,14,39,17,'.').put(6,17,'P');
const cwCombat={waitForMove:true,enemies:[{kind:'hound',brute:true,crush:2,stamp:true,x:200,y:128,face:-1,ward:'brute'}],receivers:[],doors:[{x:296,y:8,w:8,h:136,ward:'brute'}]};

// Silas's governor (quest rooms). The maintenance ladder: thorned walls, two lifts, and the brake — a stone
// wedged in the hatch — that only a dash from below will shift.
const ladder=grid().frame();
ladder.rect(0,20,6,22,'#').rect(7,19,37,22,'.').rect(1,2,1,19,'>').rect(38,1,38,21,'<').rect(9,20,12,20,'Z').rect(12,4,15,4,'Z')
 .rect(28,5,35,5,'#').rect(30,0,33,0,'.').rect(30,1,33,2,'K').put(3,19,'P');
// The governor: one long flat lift, a crystal, and the gear on the high shelf.
const gov=grid().frame();
gov.rect(0,16,6,22,'#').rect(7,17,38,22,'.').rect(7,16,10,16,'Z').put(31,6,'o')
 .rect(33,4,38,5,'#').rect(39,1,39,3,'.').put(36,3,'*').put(2,15,'P');

// Props: rectangles [dx,dy,w,h,colour] from the tile's left edge and the floor line under it (dy up is negative).
const links=n=>{const r=[];for(let i=0;i<n;i++){r.push([3,-6-i*6,2,5,'#7d7466']);r.push([3,-6-i*6,1,1,'#b0a48e']);}return r;};
const props={
 'cw-chain':links(5),'cw-chain-long':links(12),
 'cw-winch':[[0,-12,1,12,'#4a3a2c'],[11,-12,1,12,'#4a3a2c'],[0,-13,12,1,'#6a5a48'],[2,-10,8,6,'#6e5236'],[2,-8,8,1,'#c8a060'],[5,-15,2,3,'#c8a060'],[1,-1,10,1,'#3a2e24']],
 'cw-stretcher':[[0,-3,15,1,'#8a6a40'],[1,-2,1,2,'#5a4632'],[13,-2,1,2,'#5a4632'],[2,-5,11,2,'#c8c0a8'],[3,-6,3,1,'#c8c0a8']],
 'cw-standard':[[3,-34,2,34,'#5a4a3a'],[5,-33,9,7,'#7a2a2a'],[5,-26,6,3,'#5a1e1e'],[12,-26,2,2,'#5a1e1e'],[1,-35,6,1,'#c8a060']],
 'cw-crate':[[0,-8,8,8,'#6a5032'],[0,-8,8,1,'#8a6a42'],[1,-5,6,1,'#4a3622'],[3,-8,1,8,'#4a3622']],
 'cw-gear':[[2,-14,12,12,'#6a5a3a'],[4,-16,8,16,'#6a5a3a'],[0,-12,16,8,'#6a5a3a'],[5,-11,6,6,'#2e281e'],[7,-9,2,2,'#c8a060'],[3,-13,10,1,'#9a8458']],
};

export default {
 n:3,name:'Broken Causeway',kit:['dash','strike'],
 folk:{
  oren:{cloak:'#5b4a3a',trim:'#c8883a',skin:'#cfa07e',cap:true},
  sable:{cloak:'#3e4a52',trim:'#d8d2c0',skin:'#b98d6c',hood:true,staff:true},
  silas:{cloak:'#6a5038',trim:'#d59a68',skin:'#c9b9a0',helm:true},
 },
 props,
 blurb:'A stopped civic machine east of the woods. Its lifts run only with weight on them, its counterweights go wherever you send them, and something heavy sleeps under the broken standard.',
 outro:'The causeway, end to end. The weight that hung over the road is lying on the Brute.',
 note:'Committed mass: counterweight lifts (zip blocks) and counterweights (slide stones); the Brute needs bladefall-pcore-dev-rbr-causeway.js. See the header of scripts/rbr-src/03-causeway.mjs.',
 rooms:[
  {id:'c3-camp',name:'Chainwake Camp',exit:'right',hint:'A lift runs only while weight is on it, then it comes home',question:'The causeway’s lifts hang still. What would set one moving?',
   people:[{who:'sable',c:8,r:17,face:1,line:'Not one of the yard’s, are you? Nothing up there’s moved in a month.'},
    {who:'oren',c:31,r:17,face:-1,leave:'right',line:'Hear that? Nothing. The Drop Yard lift is free. Stand on it.'}],
   decor:[{k:'tent',c:1,r:17},{k:'watchfire',c:5,r:17},{k:'cw-stretcher',c:9,r:17},{k:'cw-crate',c:16,r:17},{k:'cw-chain-long',c:25,r:5},{k:'cw-chain-long',c:28,r:5},{k:'cw-winch',c:33,r:17}],
   map:camp.rows(),zips:[[0,-2]]},
  {id:'c3-drop',name:'Drop Yard',exit:'right',hint:'Stand on a lift and it carries you to the end of its line',question:'The far shelf is out of any jump’s reach. What will carry you there?',
   people:[{who:'oren',c:6,r:17,face:1,line:'She comes back down on her own. Ride her up.'}],
   decor:[{k:'cw-winch',c:1,r:17},{k:'cw-chain-long',c:18,r:19},{k:'cw-chain-long',c:21,r:19},{k:'cw-crate',c:34,r:8}],
   map:drop.rows(),zips:[[0,-11]]},
  {id:'c3-hoist',name:'The Hoist',exit:'right',hint:'Jump as a lift stops and you keep its speed',question:'The lift stops well short of the shelf. When do you leave it?',
   decor:[{k:'cw-chain-long',c:14,r:20},{k:'cw-chain-long',c:17,r:20},{k:'cw-winch',c:26,r:5}],
   map:hoist.rows(),zips:[[0,-6]]},
  {id:'c3-patrol',name:'The Patrol Road',exit:'right',side:'up',hint:'A lift throws you the way it was going',question:'The road ends in open air. How far does a flat lift throw you?',
   people:[{who:'silas',c:11,r:13,face:-1,quest:'defector',line:'…thirty-nine, forty. Can’t stop. Break the gear up the ladder?',
    lineDone:'Forty-one. Then I sat. My choice.'}],
   decor:[{k:'bench',c:6,r:13},{k:'cw-chain',c:2,r:13}],
   map:patrol.rows(),zips:[[6,0]]},
  {id:'c3-chain',name:'Chainwalk',exit:'right',hint:'A lift holds at the top for a breath, then goes home',question:'Two lifts, one above the other. How does the first one get you onto the second?',
   decor:[{k:'cw-chain-long',c:8,r:19},{k:'cw-chain-long',c:11,r:19},{k:'cw-chain',c:18,r:10},{k:'cw-chain',c:21,r:10}],
   map:chainwalk.rows(),zips:[[0,-6],[0,-7]]},
  {id:'c3-upper',name:'The Upper Chain',exit:'right',hint:'Wait a beat after a lift stops and it lets you go without a throw',question:'Three lifts, and one of them throws you at the thorns. Which of them do you leave gently?',
   decor:[{k:'cw-chain-long',c:6,r:19},{k:'cw-chain-long',c:9,r:19},{k:'cw-chain',c:29,r:13},{k:'cw-chain',c:32,r:13}],
   map:upper.rows(),zips:[[8,0],[0,-10],[0,-7]]},
  {id:'c3-rise',name:'Counterweight Rise',exit:'right',hint:'Dash into a stone and it runs that way until something stops it',question:'The wall has no foothold. What can you send there to be one?',
   decor:[{k:'cw-crate',c:4,r:12},{k:'cw-standard',c:22,r:17}],
   map:rise.rows()},
  {id:'c3-well',name:'The Weigh Well',exit:'right',hint:'A stone goes the way you strike it, down as well as across',question:'The counterweight stops up the well. Which face of it do you strike?',
   decor:[{k:'cw-winch',c:6,r:7},{k:'cw-crate',c:30,r:20}],
   map:well.rows()},
  {id:'c3-gantry',name:'Rise Gantry',exit:'right',hint:'A stone stays where it stops, so choose the wall before you push',question:'The counterweight sits on the lift’s car. Where should it end up?',
   decor:[{k:'cw-chain-long',c:9,r:15},{k:'cw-chain-long',c:12,r:15},{k:'cw-crate',c:36,r:8}],
   map:gantry.rows(),zips:[[0,-9]]},
  {id:'c3-road',name:'The Standard Road',exit:'right',hint:'Everything the causeway has taught, in one stretch',question:'A plug, a flat lift and a crystal. In what order, and with what still in hand?',
   decor:[{k:'cw-standard',c:16,r:6},{k:'cw-winch',c:37,r:11}],
   map:road.rows(),zips:[[6,0]]},
  {id:'c3-brace',name:'Broken Standard',exit:'right',hint:'The Brute commits to a charge and stops only when something stops it',question:'The brace across the road won’t give for you. What would break it?',
   decor:[{k:'cw-standard',c:10,r:17},{k:'cw-crate',c:35,r:17}],
   map:brace.rows(),combat:braceCombat},
  {id:'c3-counterweight',name:'The Counterweight',exit:'right',hint:'The blade glances off its armour; weight does not · cracked, it stamps the floor when its charge stops',question:'One weight only cracks it. What else hangs over the yard, and what will bring it there?',
   decor:[{k:'cw-chain-long',c:1,r:8},{k:'cw-chain-long',c:4,r:8},{k:'cw-chain-long',c:32,r:8},{k:'cw-chain-long',c:35,r:8},{k:'cw-standard',c:20,r:17}],
   map:cw.rows(),combat:cwCombat},
 ],
 quests:[
  {id:'defector',title:'The Clockwork Defector',giver:'Silas',from:'c3-patrol',back:{c:7,r:13},
   keepsake:{id:'silas-key',name:'Silas’s Winding Key',gives:'The key in Silas’s back stops turning, and he sits on the patrol walk’s bench because he chose to. In the Fractured Causeway it opens Silas’s echo.'},
   rooms:[
    {id:'c3-q-ladder',name:'The Maintenance Ladder',exit:'up',hint:'Thorns line the shaft · the brake is a stone, and a stone struck from below goes up',question:'The hatch is jammed shut. Which lift puts you under it, and which one throws you into the thorns?',
     decor:[{k:'cw-chain-long',c:9,r:19},{k:'cw-chain-long',c:12,r:19},{k:'cw-crate',c:33,r:4}],
     map:ladder.rows(),zips:[[10,0],[0,-8]]},
    {id:'c3-q-governor',name:'The Governor',exit:'right',hint:'A crystal pays back a dash you have already spent',question:'The gear sits on the high shelf. How many dashes does the climb take, and where is the second one?',
     decor:[{k:'cw-gear',c:34,r:3},{k:'cw-chain',c:7,r:15},{k:'cw-chain',c:10,r:15}],
     map:gov.rows(),zips:[[12,0]]},
   ]},
 ],
};
