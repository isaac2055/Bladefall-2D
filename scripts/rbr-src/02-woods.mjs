// Room by Room · 2. Black Woods. Source for public/bladefall-rbr-02-woods.js (node scripts/rbr-src/gen.mjs 02).
// The base region's five rooms (Mothlight Refuge, Oathblade Clearing, Biting Canopy, Mirror Thicket, Rootbound Passage)
// carry through as twelve screens; Pitch A's Mothlight Descent is kept as the first pod room. Kit: jump, climb, dash, and
// the blade from the Oathblade Clearing on (the two rooms before it lock strike). No down-strike is needed anywhere.
// The device, one step at a time:
//   the blade lights a caged stake (Oathblade Clearing) → a pod alone over a short gap (Mothlight Descent)
//   → three pods in a row up a long gap (Briar Run) → pods with a cracked branch under a thorn canopy (Biting Canopy)
//   → a pod and a stake (Elsie's Kitchen) → copies made true by a dash (Thicket's Edge) → the bell alone (Mirror Thicket)
//   → two bells in a row (The Called Name) → a pod and a bell in one cut (Rootbound Passage) → all of it (The Root Door).
// Rooms after the Edge start on a true branch, not rock, so the knight cannot fix the swap count with a dash on the ground.
// People: Mara runs the road ahead (Root Tunnel, then the Root Door); Orra and Pell at the refuge; Hale at the clearing;
// Elsie at her kitchen; Bram and his truth-lamp at the Thicket's Edge.
// Quest (optional): Elsie · A Place for Supper. Up the lantern tree from her kitchen: cut the peg at the fork to free the
// line (The Lantern Tree), then two pods under a thorn bough to the lantern, and down the hollow trunk home.
// KNOWN SKIPS
import {grid} from './build.mjs';

// A room authored with its corridor low, lifted by n rows: the frame row stays, n rows of open sky under it go,
// and solid earth fills the bottom.
const lift=(rows,n)=>[rows[0],...rows.slice(n+1),...Array.from({length:n},()=>'#'.repeat(rows[0].length))];

// 1 · The Root Tunnel — out of Mara's tunnel into the woods. Recap: a dash over thorns and a climb.
const tunnel=grid().frame();
tunnel.rect(0,0,7,9,'#').rect(8,0,11,8,'#').rect(12,0,15,6,'#').rect(0,18,15,22,'#').rect(16,21,24,21,'^').rect(16,22,39,22,'#').rect(25,10,39,22,'#').rect(39,5,39,9,'.').put(3,17,'P');

// 2 · Mothlight Refuge — huts up the great trunk on plank decks; one cracked board on the high walk.
const refuge=grid().frame();
refuge.rect(0,18,39,22,'#').rect(17,7,20,17,'#')
 .rect(9,15,14,15,'=').rect(3,12,8,12,'=').rect(9,9,14,9,'=').rect(15,6,38,6,'=').rect(27,6,30,6,'~').rect(21,12,27,12,'=').rect(39,2,39,5,'.').put(3,17,'P');

// 3 · Oathblade Clearing — the blade; a stake caged in roots; the gate.
const clearing=grid().frame();
clearing.rect(0,18,39,22,'#').rect(20,14,22,14,'G').rect(20,15,20,17,'G').rect(22,15,22,17,'G').put(21,17,'c')
 .rect(39,13,39,17,'G').put(30,10,'b').put(2,17,'P');

// 4 · Mothlight Descent — Pitch A's room: one pod over a short gap, out through the hole in the thorns.
const descent=[
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
  "#......................................#",
  "#......................................#",
  "#....................b.................#",
  "#..P...................................#",
  "##########.............................#",
  "##########.............................#",
  "##########.............................#",
  "##########^^^^^^^^^^^^^^^^^^^^^^^....^^^",
  "#################################....###"];

// 5 · Briar Run — three pods up a long gap to the high bank.
const briar=grid().frame();
briar.rect(0,18,4,22,'#').rect(5,21,31,21,'^').rect(5,22,31,22,'#').rect(32,5,39,22,'#').rect(31,5,31,20,'<').rect(39,1,39,4,'.')
 .rect(1,1,1,15,'>').put(10,11,'b').put(17,6,'b').put(25,4,'b').put(2,17,'P');

// 6 · Biting Canopy — a thorn roof, cracked branches, pods in the roof.
const canopy=grid().frame();
canopy.rect(0,18,6,22,'#').rect(7,21,38,21,'^').rect(7,22,38,22,'#').rect(1,1,1,15,'>').rect(38,1,38,20,'<').rect(2,1,33,1,'v')
 .rect(18,7,19,7,'~').put(11,11,'b').put(29,5,'b').rect(34,0,37,0,'.').put(3,17,'P');

// 7 · Elsie's Kitchen — her ledge, the lantern tree up the left (the quest), the ravine east.
const kitchen=grid().frame();
kitchen.rect(0,18,14,22,'#').rect(15,21,32,21,'^').rect(15,22,32,22,'#').rect(33,18,39,22,'#').rect(31,18,32,20,'<').rect(39,13,39,17,'G')
 .rect(1,0,4,0,'.').rect(5,4,6,14,'#').put(23,7,'c').put(27,12,'b').put(3,17,'P');

// 8 · Thicket's Edge — Bram's lamp. Every dash swaps the true branches and the copies.
const edge=grid().frame();
edge.rect(0,18,8,22,'#').rect(9,21,31,21,'^').rect(9,22,31,22,'#').rect(32,12,39,22,'#').rect(31,13,31,20,'<').rect(39,8,39,11,'.')
 .rect(1,1,1,15,'>').rect(16,15,19,15,'B').rect(24,13,27,13,'A').put(3,17,'P');

// 9 · Mirror Thicket — the bell. A dash and a bell both swap the thicket.
const mirror=grid().frame();
mirror.rect(1,18,6,18,'A').rect(1,21,25,21,'^').rect(0,22,25,22,'#').rect(26,13,39,22,'#').rect(24,14,25,20,'<').rect(39,9,39,12,'.')
 .rect(1,1,1,15,'>').put(10,14,'x').rect(17,17,19,17,'A').put(3,17,'P');

// 10 · The Called Name — true, then true, then true: the thicket does not alternate, so two bells undo two dashes.
const called=grid().frame();
called.rect(0,7,39,8,'#').rect(1,9,29,9,'v').rect(30,9,39,13,'#').rect(1,18,4,18,'A').rect(1,21,38,21,'^').rect(0,22,38,22,'#')
 .rect(7,17,9,17,'A').rect(18,16,20,16,'A').put(17,16,'<').rect(30,16,39,16,'A').put(29,16,'<').rect(39,14,39,15,'.').rect(38,17,38,20,'<')
 .put(18,12,'x').put(29,12,'x').put(2,17,'P');

// 11 · Rootbound Passage — pods give the dash back; every dash swaps the thicket; a bell takes a swap back.
const rootbound=grid().frame();
rootbound.rect(0,7,39,8,'#').rect(1,9,31,9,'v').rect(32,9,39,13,'#').rect(1,18,2,18,'A').rect(1,21,38,21,'^').rect(0,22,38,22,'#').rect(1,10,1,15,'>')
 .rect(9,17,14,17,'B').put(21,13,'b').put(21,12,'x').rect(32,16,39,16,'A').put(31,16,'<').rect(39,14,39,15,'.').rect(38,17,38,20,'<').put(1,17,'P');

// 12 · The Root Door — everything at once, and the tunnel to the Causeway.
const door=grid().frame();
door.rect(1,18,2,18,'A').rect(1,21,38,21,'^').rect(0,22,38,22,'#').rect(16,1,17,11,'#').rect(16,12,17,12,'v').rect(15,1,15,11,'<').rect(18,1,18,11,'>')
 .put(7,14,'b').put(7,13,'x').rect(20,17,25,17,'B').put(23,9,'o').put(27,6,'x').rect(30,8,35,8,'A').put(29,8,'<').rect(36,8,39,8,'#').rect(39,4,39,7,'.').rect(38,9,38,20,'<').put(1,17,'P');

// Elsie's lantern tree (quest rooms).
const fork=grid().frame();
fork.rect(0,18,5,22,'#').rect(6,21,38,21,'^').rect(6,22,38,22,'#').rect(18,8,20,22,'#').rect(17,8,17,14,'<').rect(21,8,21,20,'>')
 .rect(30,13,38,22,'#').rect(29,14,29,20,'<').rect(32,0,35,0,'.').rect(32,1,35,1,'G')
 .rect(38,1,38,12,'<').put(13,9,'b').put(34,12,'c').put(32,7,'b').put(2,17,'P');
const bough=grid().frame();
bough.rect(0,9,39,11,'#').rect(4,12,32,12,'v').rect(0,16,3,22,'#').rect(4,19,32,19,'^').rect(4,20,32,22,'#').rect(37,12,39,22,'#').rect(36,12,36,21,'<').rect(33,20,33,21,'>').rect(33,22,35,22,'.').rect(36,22,36,22,'#')
 .put(12,13,'b').put(23,13,'b').put(33,16,'*').put(2,15,'P');

export default {
 n:2,name:'Black Woods',kit:['dash','strike'],
 folk:{
  orra:{cloak:'#5a4a5e',trim:'#c9b48a',skin:'#d4b096',hood:true},
  pell:{cloak:'#6a5a3a',trim:'#d8a040',skin:'#c99a78',cap:true},
  hale:{cloak:'#4a5248',trim:'#9aa08a',skin:'#c8a080',helm:true},
  bram:{cloak:'#56683f',trim:'#e0d0a0',skin:'#e0bc98',cap:true,flame:true},
  elsie:{cloak:'#7a5040',trim:'#deb985',skin:'#dcb090',hood:true},
 },
 props:{
  cradle:[[-6,-3,20,3,'#4a3a28'],[-3,-5,14,2,'#5a4632'],[0,-7,8,2,'#6a5238'],[3,-7,2,4,'#1a1410'],[-5,-6,2,3,'#5a4632'],[11,-6,2,3,'#5a4632']],
  fern:[[0,-3,1,3,'#3e6a3a'],[2,-5,1,5,'#4a7a40'],[4,-4,1,4,'#3e6a3a'],[1,-6,1,2,'#5f9a50'],[3,-7,1,3,'#5f9a50'],[5,-5,1,2,'#5f9a50']],
  hut:[[0,-11,15,11,'#4b3b2b'],[-2,-14,19,3,'#6a5232'],[0,-15,15,1,'#7a6040'],[5,-7,4,7,'#22180f'],[11,-8,2,2,'#ffcf7a']],
  table:[[0,-5,12,1,'#7a5a3a'],[1,-4,1,4,'#5a4028'],[10,-4,1,4,'#5a4028'],[2,-7,3,2,'#d8c8a8'],[7,-7,3,2,'#d8c8a8'],[3,-8,1,1,'#f0e8d8']],
  stove:[[0,-9,7,9,'#3a3432'],[1,-6,5,3,'#ff9a4a'],[2,-5,3,1,'#ffd27a'],[2,-14,2,5,'#3a3432']],
  step:[[0,-2,8,2,'#6a5238'],[5,-2,3,1,'#22180f'],[6,-1,2,1,'#22180f']],
  roots:[[1,0,1,6,'#5a4632'],[3,0,1,10,'#4a3a28'],[5,0,1,4,'#5a4632'],[6,0,1,7,'#4a3a28']],
  marker:[[3,-12,2,12,'#5a4632'],[0,-12,8,4,'#7a6448'],[1,-11,6,1,'#2a2018'],[1,-9,4,1,'#2a2018']],
 },
 palettes:{
  thicket:{sky0:'#080c12',sky1:'#111824',far:'#18222e',rock:'#2c3640',rockD:'#1a2128',edge:'#8fa6b8',moss:'#5f7f8a',accent:'#cfe0f0'},
 },
 blurb:'The moth-lit refuge, the Oathblade, and the thicket where half the branches are copies. The blade cuts pods for your dash, and bells for the truth.',
 outro:'Black Woods, refuge to root door, with the blade in hand.',
 note:'The Oathblade is this region’s grant; see the header of scripts/rbr-src/02-woods.mjs.',
 rooms:[
  {id:'w2-tunnel',name:'The Root Tunnel',exit:'right',lock:['strike','parry','portal'],
   hint:'Hold grab against a wall to climb it',question:'The bank is higher than any jump. What still carries you up?',
   people:[{who:'mara',c:9,r:17,face:1,leave:'right',line:'You again. The tunnel comes up right here. Refuge is ahead.'}],
   decor:[{k:'roots',c:4,r:9},{k:'roots',c:11,r:9},{k:'lantern',c:13,r:17},{k:'fern',c:31,r:9},{k:'fern',c:35,r:9}],map:tunnel.rows()},
  {id:'w2-refuge',name:'Mothlight Refuge',exit:'right',lock:['strike','parry','portal'],palette:'mothlight',
   hint:'Jump up through a plank from below · a cracked board gives way',question:'The refuge is built up the trunk. Which boards carry you to the high walk?',
   people:[{who:'orra',c:6,r:17,face:1,line:'Stopped again. Don’t ask me the time.'},
    {who:'pell',c:25,r:11,face:-1,line:'Not resin crew, are you? A cut pod kicks. Get a blade.'}],
   decor:[{k:'clock',c:9,r:17},{k:'hut',c:11,r:17},{k:'lantern',c:23,r:17},{k:'hut',c:22,r:11},{k:'lantern',c:5,r:11},{k:'lantern',c:36,r:5}],map:refuge.rows()},
  {id:'w2-clearing',name:'Oathblade Clearing',exit:'right',
   hint:'Strike with the blade · a cut lights a stake the hand can’t reach',question:'The stake is caged in roots. What reaches farther than your hand?',
   people:[{who:'hale',c:9,r:17,face:-1,line:'Sword was in those roots. Cost me a shoulder. Take it.'}],
   decor:[{k:'cradle',c:5,r:17},{k:'fern',c:14,r:17},{k:'fern',c:27,r:17},{k:'fern',c:34,r:17}],map:clearing.rows()},
  {id:'w2-descent',name:'Mothlight Descent',exit:'down',palette:'mothlight',
   hint:'Strike a moth pod and it throws you away from the cut · a struck pod gives your dash back',question:'The thorns are wider than a dash. What in the air can you push off?',
   decor:[{k:'lantern',c:6,r:17}],map:descent},
  {id:'w2-briar',name:'Briar Run',exit:'right',
   hint:'Each pod you cut is one more dash',question:'Three pods climb toward the bank. How much higher does each one carry you?',
   decor:[{k:'fern',c:2,r:17},{k:'fern',c:34,r:4}],map:briar.rows()},
  {id:'w2-canopy',name:'Biting Canopy',exit:'up',
   hint:'A cracked branch holds a moment · a cut pod gives the dash back where nothing holds',question:'The way up is through the canopy. Where do you stand, and where do you only pass?',
   decor:[{k:'fern',c:4,r:17}],map:canopy.rows()},
  {id:'w2-kitchen',name:'Elsie’s Kitchen',exit:'right',side:'up',
   hint:'A cut lights a stake in passing · the gate opens when it is lit',question:'The gate wants the stake lit, and the stake hangs over the thorns. What gets you up to it?',
   people:[{who:'elsie',c:11,r:17,face:-1,quest:'refuge',line:'Mind the step. Elsie. My lantern’s stuck up in the branches. Fetch it?',
    lineDone:'Lamp’s lit. Two bowls. Sit.'}],
   decor:[{k:'table',c:8,r:17},{k:'stove',c:13,r:17},{k:'step',c:14,r:17},{k:'fern',c:35,r:17},{k:'lantern',c:5,r:3},{k:'elsielamp',c:8,r:17}],map:kitchen.rows()},
  {id:'w2-edge',name:'Thicket’s Edge',exit:'right',palette:'thicket',
   hint:'Every dash swaps the true branches and the copies',question:'The copies turn true when you dash. Where will the next dash put a floor?',
   people:[{who:'bram',c:6,r:17,face:1,line:'Easy, easy… Bram. Light goes through a branch? It isn’t there.'}],
   decor:[{k:'fern',c:2,r:17},{k:'fern',c:35,r:11}],map:edge.rows()},
  {id:'w2-mirror',name:'Mirror Thicket',exit:'right',palette:'thicket',
   hint:'A struck bell swaps the thicket too, and costs no dash',question:'The far branch is true now. How do you keep it true after the dash that gets you there?',
   decor:[{k:'fern',c:3,r:17},{k:'fern',c:36,r:13}],map:mirror.rows()},
  {id:'w2-called',name:'The Called Name',exit:'right',palette:'thicket',
   hint:'A bell undoes the swap your dash makes',question:'True, then true again. Where does the swap your dash makes have to be undone?',
   decor:[{k:'fern',c:6,r:2},{k:'fern',c:17,r:2},{k:'fern',c:29,r:2}],map:lift(called.rows(),4)},
  {id:'w2-rootbound',name:'Rootbound Passage',exit:'right',palette:'thicket',
   hint:'One cut can catch a pod and a bell together',question:'Two dashes to cross, and the far floor wants an odd number of swaps. Where does the extra one come from?',
   decor:[{k:'roots',c:34,r:9},{k:'roots',c:37,r:9},{k:'fern',c:4,r:2},{k:'fern',c:14,r:2},{k:'fern',c:25,r:2}],map:lift(rootbound.rows(),4)},
  {id:'w2-door',name:'The Root Door',exit:'right',palette:'thicket',
   hint:'Every dash swaps the thicket, a crystal’s and a pod’s as well',question:'The root door is high, and true. How many swaps lie between you and it?',
   people:[{who:'mara',c:37,r:7,face:-1,leave:'right',line:'There you are. The roots run on under the causeway, and nobody’s charted them. Mind your head.'}],
   decor:[{k:'marker',c:38,r:7}],map:door.rows()},
 ],
 quests:[
  {id:'refuge',title:'A Place for Supper',giver:'Elsie',from:'w2-kitchen',back:{c:9,r:17},
   keepsake:{id:'elsie-lantern',name:'Elsie’s Lantern',gives:'Elsie hangs it over her table and sets out a second bowl. In the Fractured Woods it opens Elsie’s echo.'},
   rooms:[
    {id:'w2-q-fork',name:'The Lantern Tree',exit:'up',
     hint:'The peg at the fork holds the line · cut it and the way up opens',question:'The way up is tied shut from the fork. How do you climb a trunk that bites?',map:fork.rows()},
    {id:'w2-q-bough',name:'The Lantern Bough',exit:'down',
     hint:'The lantern hangs at the end of the bough · the hollow trunk drops you home',question:'Two pods under the bough, and thorns above and below. Which way does each cut have to throw you?',decor:[{k:'fern',c:5,r:4},{k:'fern',c:18,r:4},{k:'fern',c:30,r:4}],map:lift(bough.rows(),4).map((row,r)=>r>18?row.slice(0,33)+'...'+row.slice(36):row)},
   ]},
 ],
};
