// Room by Room · 22. The Fractured Woods (7.280 rebuild). Source for public/bladefall-rbr-22-f-woods.js
// (node scripts/rbr-src/gen.mjs 22). The refuge is cold, the blade is bound again, and the trees have grown low.
// docs/plans/fractured-hard.md, stage I: the HYPER (dash down-diagonally into the floor, then jump: ×1.25 across,
// ×0.5 up, and the dash comes back during the slide) and the WAVEDASH (the same from the air: land the down-diagonal
// dash, then jump). Measured here: under a solid roof two tiles high a plain run, jump and dash crosses at most 10
// tiles; a hyper crosses 12 and more. Under thorns a held jump dies, a hyper does not.
//   the hyper alone under a low roof (The Burnt Refuge) → from the air (The Root Loop) → the bound blade at the end
//   of a low tunnel (The Bound Oathblade) → hyper into a pod cut (The Biting Canopy) → under the briar, where every
//   dash turns the thicket (The Briar Ceiling) → Elsie's kitchen (her echo goes up the old tree) → bells and branches
//   (Thicket's Broken Edge) → resin on a short wind (The Resin Crown) → a tear and pods up the hollow crown (The
//   Hollow Crown) → the Oath Root: three crowns, each at the end of a low run under its lashes.
// The Oath Root (bladefall-pcore-dev-rbr-f-woods.js, opt-in fields): `lashes` are thorned roots that strike out of the
// ceiling and walls on a fixed clock (dotted outline for the half second before); `rootCrown` is the knot the blade
// must cut; the room's gate stays shut until it is cut.
import {grid} from './build.mjs';
const shell=()=>grid().frame();
const S=['strike'];

// 1 · The Burnt Refuge — the hyper alone: a low roof (solid) over two 12-tile pits, a cracked root between them.
const refuge=shell();
refuge.rect(6,1,38,14,'#').rect(0,18,7,22,'#').rect(8,21,34,21,'^').rect(8,22,34,22,'#').rect(20,18,22,18,'~').rect(35,18,39,22,'#').rect(34,18,34,20,'<')
 .rect(39,15,39,17,'.').put(3,17,'P');

// 2 · The Root Loop — the wavedash: off the high ledge, a down-diagonal dash into the cracked root under the roof,
// and a hyper off it to the second cracked root, and another to the bank.
const loop=shell();
loop.rect(0,10,9,22,'#').rect(12,1,38,14,'#').rect(13,18,15,18,'~').rect(25,18,27,18,'~').rect(10,21,35,21,'^').rect(10,22,35,22,'#')
 .rect(36,18,39,22,'#').rect(35,18,35,20,'<').rect(39,15,39,17,'.').put(3,9,'P');

// 3 · The Bound Oathblade — the counterweight root at the end of a low tunnel; the freed blade up the far wall.
const clearing=shell();
clearing.rect(7,9,30,14,'#').rect(0,18,8,22,'#').rect(9,21,21,21,'^').rect(9,22,21,22,'#').rect(22,18,38,22,'#').rect(21,18,21,20,'<')
 .rect(32,9,37,9,'=').rect(39,3,39,7,'G').put(3,17,'P');

// 4 · The Biting Canopy — two tunnels under the thorn canopy, one above the other. Hyper along the lower one from a
// cracked root, cut the pod where the canopy opens, dash up into the upper one, and hyper back along it from cracked
// root to cracked root to the high way out. Four hypers and a cut, and nowhere that holds between them.
const canopy=shell();
canopy.rect(0,18,4,22,'#').rect(5,21,38,21,'^').rect(5,22,38,22,'#').rect(5,10,34,13,'#').rect(5,14,34,14,'v').rect(5,9,34,9,'^')
 .rect(5,1,34,4,'#').rect(5,5,34,5,'v').rect(1,9,4,9,'#').rect(0,6,0,8,'.').rect(18,18,20,18,'~').rect(30,9,34,9,'~').rect(16,9,18,9,'~')
 .put(34,19,'b').put(2,17,'P');

// 5 · The Briar Ceiling — every dash turns the thicket: the hyper's own dash raises the branch it lands on, a
// wavedash's dash raises the next, and the third branch is false until the third dash. Then the pod where the briar
// opens, and one more dash (the thicket turns again) up to the ledge.
const briar=shell();
briar.rect(5,1,34,13,'#').rect(5,14,34,14,'v').rect(0,18,4,22,'#').rect(5,21,38,21,'^').rect(5,22,38,22,'#')
 .rect(14,18,19,18,'B').rect(21,19,25,19,'A').rect(33,19,35,19,'~').put(38,16,'b').rect(39,5,39,8,'.').put(2,17,'P');

// 6 · Elsie's Cold Kitchen — her echo waits; the road: a wavedash into the low cut, a pod past it, up to the bank.
const kitchen=shell();
kitchen.rect(0,18,14,22,'#').rect(15,21,38,21,'^').rect(15,22,38,22,'#').rect(17,9,30,14,'#').rect(17,18,19,18,'~')
 .put(32,18,'b').rect(36,15,38,22,'#').rect(36,14,38,14,'^').rect(36,13,38,13,'~').rect(35,13,35,20,'<').rect(39,9,39,12,'.').rect(2,0,5,0,'.').rect(6,3,7,14,'#').put(3,17,'P');

// 7 · Thicket's Broken Edge — a wavedash onto the branch the dash raises, a hyper off it, and a late dash that raises the
// far bank: three flips of the thicket, all in the air.
const edge=shell();
edge.rect(0,18,5,22,'#').rect(6,21,38,21,'^').rect(6,22,38,22,'#').rect(1,1,1,15,'>').rect(11,1,38,14,'#')
 .rect(8,19,11,19,'B').rect(25,18,28,18,'A').rect(34,18,36,18,'B').rect(39,15,39,17,'.').put(2,17,'P');

// 8 · The Resin Crown — resin branches on a short wind, out of step under the thorned roof: each holds for one beat
// and goes soft the next. A hyper onto each as it hardens and off it before it softens, a pod where the roof opens,
// and up through the gap before the beat turns again.
const wind=shell();
wind.rect(0,18,6,22,'#').rect(7,21,38,21,'^').rect(7,22,38,22,'#').rect(7,1,35,13,'#').rect(7,14,35,14,'v').rect(39,4,39,8,'.').put(37,19,'b').put(2,17,'P');

// 9 · The Hollow Crown — up the hollow trunk: a rising tear, a pod, a hyper along the top.
const tower=shell();
tower.rect(0,18,6,22,'#').rect(7,21,38,21,'^').rect(7,22,38,22,'#').rect(12,10,16,10,'~').rect(12,12,16,12,'^').put(20,7,'b')
 .rect(21,1,38,1,'#').rect(21,5,23,5,'~').rect(21,7,23,7,'^').rect(37,5,38,5,'#').rect(39,2,39,4,'.').put(3,17,'P');

// 10–12 · The Oath Root. Each crown sits at the end of a low run; the lashes strike above it on their clock.
const oath1=shell();
oath1.rect(7,1,38,13,'#').rect(7,14,38,14,'v').rect(0,18,6,22,'#').rect(7,21,32,21,'^').rect(7,22,32,22,'#').rect(19,18,21,18,'~').rect(33,18,38,22,'#').rect(32,18,32,20,'<').rect(39,15,39,17,'G').put(3,17,'P');
const oath2=shell();
oath2.rect(0,18,4,22,'#').rect(5,21,38,21,'^').rect(5,22,38,22,'#').rect(5,10,34,13,'#').rect(5,14,34,14,'v').rect(5,9,34,9,'^')
 .rect(5,1,34,4,'#').rect(5,5,34,5,'v').rect(1,9,4,9,'#').rect(0,6,0,8,'G').rect(18,18,20,18,'~').rect(30,9,34,9,'~').rect(16,9,18,9,'~')
 .put(34,19,'b').put(2,17,'P');
const oath3=shell();
oath3.rect(5,10,18,14,'#').rect(5,9,18,9,'^').rect(0,18,4,22,'#').rect(5,21,38,21,'^').rect(5,22,38,22,'#').rect(19,18,21,22,'#')
 .rect(33,9,38,22,'#').rect(32,9,32,20,'<').rect(39,4,39,8,'G').put(2,17,'P');

// Elsie's echo: up the old tree (the hardest rooms of the region).
const bowl=shell();
bowl.rect(0,18,5,22,'#').rect(6,21,38,21,'^').rect(6,22,38,22,'#').rect(7,9,18,14,'#').rect(7,8,18,8,'^').rect(19,18,21,18,'~')
 .put(31,16,'b').rect(33,13,38,13,'B').rect(39,4,39,7,'.').put(2,17,'P');
const lantern=shell();
lantern.rect(0,10,6,22,'#').rect(1,1,9,4,'#').rect(7,21,38,21,'^').rect(7,22,38,22,'#').rect(10,7,30,14,'#').rect(10,6,30,6,'^').rect(10,18,13,18,'B').rect(25,18,29,18,'A')
 .put(34,16,'b').rect(32,11,38,11,'B').rect(28,5,30,5,'~').rect(19,5,21,5,'~').rect(10,5,12,5,'#').put(11,4,'*').rect(10,0,13,0,'.').put(2,9,'P');

const rooms=[
 {id:'fw22-refuge',name:'The Burnt Refuge',exit:'right',lock:S,hint:'Dash down-diagonally into the floor, then jump: low and long, under the roof (a hyper) · the root between the pits is cracked: again',
  question:'The roof stops any jump. What carries you across without rising, twice?',decor:[{k:'hut',c:2,r:17}],map:refuge.rows()},
 {id:'fw22-root-loop',name:'The Root Loop',exit:'right',lock:S,hint:'From the air, the same: land the down-diagonal dash on the root and jump at once (a wavedash) · then hyper root to root',
  question:'The root under the roof is cracked. Where does your dash have to end?',map:loop.rows()},
 {id:'fw22-clearing',name:'The Bound Oathblade',exit:'right',study:true,hint:'Stand on the counterweight root at the end of the low run · then hold up at the freed blade',
  question:'The root that frees the blade is past the low run. How do you reach it, and then the blade?',
  oathRoot:{c:24,r:18,bladeC:34,bladeR:8},map:clearing.rows()},
 {id:'fw22-canopy',name:'The Biting Canopy',exit:'left',hint:'A held jump meets the thorns · hyper from cracked root to cracked root · cut the pod where the canopy opens',
  question:'Out along the low tunnel and back along the high one, and no root that holds. Where does each hyper start?',map:canopy.rows()},
 {id:'fw22-briar',name:'The Briar Ceiling',exit:'right',hint:'Every dash turns the thicket · the hyper’s dash too · the third branch waits for the third dash',
  question:'Your dash raises the branch you are aiming for, and drops the one you stand on. Where can a hyper start?',map:briar.rows()},
 {id:'fw22-kitchen',name:'Elsie’s Cold Kitchen',exit:'right',side:'up',hint:'Your old lantern opens the tree above the kitchen · the root in the cut is cracked',
  question:'No runway under the roof. Where does your dash land?',
  people:[{who:'elsie',name:'ELSIE’S ECHO',c:11,r:17,quest:'elsie-echo',line:'I left a bowl out. Habit, I suppose.',lineDone:'Still warm. Don’t ask me how.'}],
  decor:[{k:'table',c:8,r:17},{k:'stove',c:13,r:17}],map:kitchen.rows()},
 {id:'fw22-edge',name:'Thicket’s Broken Edge',exit:'right',study:true,hint:'Every dash turns the thicket · the middle branch waits for a late dash · a root lashes it',
  question:'Which branch is true when you land, which dash turned it, and how long before the lash?',
  lashes:[{c0:24,r0:15,c1:29,r1:17,period:90,on:45,phase:0}],map:edge.rows()},
 {id:'fw22-wind',name:'The Resin Crown',exit:'right',study:true,hint:'Amber edges hold against the wind · dotted edges warn of the turn · the wind turns fast here',
  question:'Each branch holds for one beat of the wind, and the next one hardens as it softens. Can you keep the beat to the gap?',
  resinWind:{period:60,branches:[{c:17,r:18,w:3,phase:1},{c:31,r:18,w:4,phase:0}]},map:wind.rows()},
 {id:'fw22-tower',name:'The Hollow Crown',exit:'right',hint:'The tear lifts you into the trunk · the pod gives the dash back · the gallery under the roof is a hyper long',
  question:'Up on the tear, a cut, then low along the roof. Which comes first?',lines:[{a:[6,17],b:[16,9]}],map:tower.rows()},
 {id:'fw22-oath1',name:'The Oath Root',exit:'right',study:true,hint:'Two lashes, out of step · the dotted outline strikes next · the root between is cracked',
  question:'The run under the roof is a hyper long, and the lash lies at the end of it. When do you set off?',
  rootCrown:{c:35,r:16},lashes:[{c0:9,r0:15,c1:17,r1:17,period:96,on:48,phase:0},{c0:31,r0:15,c1:38,r1:17,period:96,on:40,phase:48}],map:oath1.rows()},
 {id:'fw22-oath2',name:'The Oath Root, Waking',exit:'left',study:true,hint:'Out low, back high · a lash in each run · cut the crown as you pass',
  question:'One lash rests while the other strikes. Where are you when each comes down?',
  rootCrown:{c:5,r:7},lashes:[{c0:8,r0:15,c1:15,r1:17,period:90,on:45,phase:60},{c0:20,r0:6,c1:27,r1:8,period:90,on:45,phase:20}],map:oath2.rows()},
 {id:'fw22-oath3',name:'The Oath Root’s Crown',exit:'right',study:true,hint:'The crown is high on the wall · resin on the short wind · the lash strikes the far floor',
  question:'The resin holds, the lash strikes, the crown waits on the wall. In what order?',
  rootCrown:{c:30,r:6},lashes:[{c0:23,r0:12,c1:31,r1:17,period:96,on:48,phase:24},{c0:19,r0:15,c1:21,r1:17,period:96,on:40,phase:72}],
  resinWind:{period:48,branches:[{c:24,r:14,w:3,phase:0},{c:27,r:10,w:3,phase:1}]},map:oath3.rows()},
];
for(const r of rooms)r.question||='Where can you spend the dash and recover it before the next landing?';

export default {
 n:22,name:'The Fractured Woods',kit:['dash','strike','parry','portal'],
 blurb:'The refuge is cold. The blade is bound again. The trees have grown low enough to bite, and the Oath Root wakes at the end of them.',
 outro:'The Oath Root lets go of the crown. Behind you, Elsie’s window holds its small light against the wind.',
 folk:{orra:{cloak:'#5a4a5e',trim:'#c9b48a',skin:'#d4b096',hood:true},pell:{cloak:'#6a5a3a',trim:'#d8a040',skin:'#c99a78',cap:true},hale:{cloak:'#4a5248',trim:'#9aa08a',skin:'#c8a080',helm:true},bram:{cloak:'#56683f',trim:'#e0d0a0',skin:'#e0bc98',cap:true,flame:true},elsie:{cloak:'#7a5040',trim:'#deb985',skin:'#dcb090',hood:true}},
 props:{cradle:[[-6,-3,20,3,'#4a3a28'],[-3,-5,14,2,'#5a4632'],[0,-7,8,2,'#6a5238'],[3,-7,2,4,'#1a1410'],[-5,-6,2,3,'#5a4632'],[11,-6,2,3,'#5a4632']],fern:[[0,-3,1,3,'#3e6a3a'],[2,-5,1,5,'#4a7a40'],[4,-4,1,4,'#3e6a3a'],[1,-6,1,2,'#5f9a50'],[3,-7,1,3,'#5f9a50'],[5,-5,1,2,'#5f9a50']],hut:[[0,-11,15,11,'#4b3b2b'],[-2,-14,19,3,'#6a5232'],[0,-15,15,1,'#7a6040'],[5,-7,4,7,'#22180f'],[11,-8,2,2,'#ffcf7a']],table:[[0,-5,12,1,'#7a5a3a'],[1,-4,1,4,'#5a4028'],[10,-4,1,4,'#5a4028'],[2,-7,3,2,'#d8c8a8'],[7,-7,3,2,'#d8c8a8'],[3,-8,1,1,'#f0e8d8']],stove:[[0,-9,7,9,'#3a3432'],[1,-6,5,3,'#ff9a4a'],[2,-5,3,1,'#ffd27a'],[2,-14,2,5,'#3a3432']],step:[[0,-2,8,2,'#6a5238'],[5,-2,3,1,'#22180f'],[6,-1,2,1,'#22180f']],roots:[[1,0,1,6,'#5a4632'],[3,0,1,10,'#4a3a28'],[5,0,1,4,'#5a4632'],[6,0,1,7,'#4a3a28']],marker:[[3,-12,2,12,'#5a4632'],[0,-12,8,4,'#7a6448'],[1,-11,6,1,'#2a2018'],[1,-9,4,1,'#2a2018']]},
 rooms,
 quests:[{id:'elsie-echo',title:'A Bowl Kept Warm',giver:'Elsie’s echo',from:'fw22-kitchen',back:{c:6,r:17},needs:'elsie-lantern',
  keepsake:{id:'elsie-remembered',name:'Elsie, remembered',gives:'She kept a place at the table even when the refuge went dark. Shown at the end.'},rooms:[
  {id:'fw22-q-bowl',name:'The Empty Bowl',exit:'right',study:true,hint:'Two roots bite on a clock · two hypers and a cut · the branch is false until your next dash',
   question:'The branch past the pod is false until something turns it. Which dash, and from where?',
   lashes:[{c0:7,r0:15,c1:18,r1:17,period:100,on:60,phase:0},{c0:33,r0:11,c1:38,r1:12,period:100,on:50,phase:35}],map:bowl.rows()},
  {id:'fw22-q-lantern',name:'The Lantern That Waited',exit:'up',hint:'A wavedash under the roof, a pod, the high branch the dash itself turns · over the thorned crown root to root to her table',
   question:'The table is across the thorned crown of the tree, and only two cracked roots between. Where does each hyper start?',
   lashes:[{c0:32,r0:9,c1:38,r1:10,period:96,on:40,phase:8}],
   people:[{who:'elsie',name:'ELSIE’S ECHO',c:12,r:4,quest:'elsie-echo',line:'I knew you’d find the table.',lineDone:'You never did like eating alone.'}],map:lantern.rows()},
 ]}],
};
