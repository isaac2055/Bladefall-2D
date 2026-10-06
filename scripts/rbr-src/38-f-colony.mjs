// Room by Room · 38. The Fractured Colony (7.280 rebuild, hand-made over the 7.278 reflection). Source for
// public/bladefall-rbr-38-f-colony.js (node scripts/rbr-src/gen.mjs 38). docs/plans/fractured-hard.md, stage V:
// the Colony's lamps and smoke with everything the act has taught, back to back. Base orientation (exit right).
import {grid} from './build.mjs';
const shell=()=>grid().frame();
// 7.280 (resume 4): a cracking stone over a down-thorn row (a lane's floor over the lane below) left a hole you fell
// through unharmed, onto the lane below: a free rest. The thorn under every cracking stone now points up, so the hole is
// real void, as everywhere else.
const voidUnder=rows=>rows.map((row,r)=>r>0?[...row].map((ch,c)=>ch==='v'&&rows[r-1][c]==='T'?'^':ch).join(''):row);
const r=(id,name,hint,question,m,extra={})=>({id:'fc38-'+id,name,hint,question,map:voidUnder(m.rows()),...extra});
const pit=(m,c0,c1)=>m.rect(c0,21,c1,21,'^').rect(c0,22,c1,22,'#');
// Three lanes, joined by tears at alternate ends: the low lane goes right, a climb up the right wall, the middle lane goes left,
// a climb up the left wall, the high lane goes right to the door. Thorns under every lane and over the lower two.
// Perches: L1 row 20 (stand 19), L2 row 12 (stand 11), L3 row 5 (stand 4).
const lanes=()=>{const m=shell();
 m.rect(1,20,3,21,'#').put(2,19,'P').rect(4,21,34,21,'^').rect(35,20,38,21,'#');
 m.rect(1,12,36,12,'^').rect(1,13,38,13,'v').rect(37,12,38,12,'#').rect(1,12,4,12,'#');
 m.rect(4,5,38,5,'^').rect(4,6,38,6,'v').rect(1,5,3,5,'#').rect(1,6,3,6,'v').rect(39,1,39,4,'.');
 return m;};
// The lanes are joined by tears: up out of the low lane onto the middle lane's ledge, up out of the middle lane onto
// the high lane's ledge (each set down).
const laneLines=[{a:[33,18],b:[38,11],setDown:true},{a:[6,11],b:[3,4],setDown:true}];

// Lamplight: two lamps swing over the yard in turn. Four cracking perches, each just out of reach of the one before
// but one, two of them in banks of smoke; a thorned roof keeps you from going over them.
const lamps=shell().rect(0,19,3,22,'#').put(1,18,'P').rect(36,19,39,22,'#').rect(39,15,39,18,'.');
pit(lamps,4,35);
lamps.rect(1,1,38,5,'#').rect(4,6,35,6,'v').rect(13,6,13,6,'.').rect(27,6,27,6,'.').rect(9,15,10,15,'T').rect(9,16,10,16,'^').rect(16,11,17,11,'T').rect(16,12,17,12,'^')
 .rect(15,7,18,10,'S').rect(23,15,24,15,'T').rect(23,16,24,16,'^').rect(30,11,31,11,'T').rect(30,12,31,12,'^').rect(29,7,32,10,'S');

// Pit Smoke: two tiers under one swinging lamp. Below, cracking stones under banks of smoke, each gap wider than a
// jump; a tear from the last stone lifts you over the thorn ceiling to the upper tier, whose stones crack too. Smoke
// hides you while the lamp passes; only the middle stone of the upper tier, deep in smoke, holds you while you wait.
const smoke=shell().rect(0,19,4,22,'#').rect(1,15,5,18,'S').put(2,18,'P');
pit(smoke,5,34);
smoke.rect(11,19,12,19,'T').rect(11,20,12,20,'^').rect(11,15,12,18,'S').rect(20,19,21,19,'T').rect(20,20,21,20,'^').rect(20,15,21,18,'S')
 .rect(29,19,30,19,'T').rect(29,20,30,20,'^').rect(1,13,34,13,'v')
 .rect(12,10,14,10,'T').rect(12,11,14,11,'^').rect(12,6,14,9,'S').rect(21,10,22,10,'#').rect(21,11,22,11,'^').rect(21,6,22,9,'S')
 .rect(29,9,30,9,'T').rect(29,10,30,10,'^').rect(29,5,30,8,'S').rect(35,9,38,22,'#').rect(35,5,38,8,'S').rect(39,5,39,8,'.');

// A Glance: three lanes, each crossed by narrow fixed looks from lamps in its roof; a look crossed slower than a dash
// is a look held too long. The stones crack and your shade walks behind you.
const glance=lanes();
glance.rect(10,20,12,20,'T').rect(22,20,24,20,'T').put(17,14,'.').put(29,14,'.')
 .rect(25,12,27,12,'T').rect(13,12,15,12,'T').put(20,7,'.').put(9,7,'.')
 .rect(14,5,16,5,'T').rect(25,5,27,5,'T');

// Lines Out: two thorn curtains only a tear crosses, under a swinging lamp. A cracking perch between the rides, a
// mouth in mid-air for the second, and a super off the cracking landing.
const line=shell().rect(0,16,3,22,'#').put(1,15,'P').rect(36,12,39,22,'#').rect(39,8,39,11,'.');
pit(line,4,35);
line.rect(7,13,9,13,'T').rect(7,14,9,14,'^').rect(14,1,14,20,'<').rect(18,8,20,8,'T').rect(18,9,20,9,'^')
 .rect(27,1,27,20,'<').rect(30,15,33,15,'T').rect(30,16,33,16,'^').put(20,1,'.');

// Faster Than a Hop: three lanes, a cracking runway in each and a gap a hop will not cross; the lamps leave each
// lane dark for a breath. Jump late in the ground dash and keep its speed.
const speed=lanes();
speed.rect(4,20,9,20,'T').rect(21,20,25,20,'T').rect(24,12,28,12,'T').rect(8,12,12,12,'T').rect(10,5,15,5,'T').rect(27,5,29,5,'T').put(20,14,'.').put(18,7,'.');

// Low Road: under a roof too low for a jump, four thorn beds only a low long jump crosses, off cracking stones; two
// panes, so the third and fourth are crossed with left and right swapped and swapped back; the lamp looks along the
// road from behind and your shade is behind that.
const low=shell().rect(0,17,4,22,'#').put(2,16,'P').rect(36,17,39,22,'#').rect(39,13,39,16,'.');
pit(low,5,35);
low.rect(1,1,38,12,'#').rect(1,13,38,13,'v').rect(1,14,1,16,'.').rect(12,17,13,17,'T').rect(12,18,13,18,'^').rect(21,17,22,17,'T').rect(21,18,22,18,'^')
 .rect(26,14,26,16,'|').rect(30,17,31,17,'T').rect(30,18,31,18,'^').rect(34,14,34,16,'|');

// Glass: the far lamp watches the yard through two panes. Through the first, left is right; dash through the second
// and it turns back; cracking perches between.
const glass=shell().rect(0,18,4,22,'#').put(2,17,'P').rect(35,18,39,22,'#').rect(39,14,39,17,'.');
pit(glass,5,34);
glass.rect(8,15,10,15,'T').rect(8,16,10,16,'^').rect(13,1,13,20,'|').rect(17,12,19,12,'T').rect(17,13,19,13,'^')
 .rect(23,15,25,15,'T').rect(23,16,25,16,'^').rect(28,1,28,20,'|').rect(31,14,33,14,'T').rect(31,15,33,15,'^').put(20,1,'.');

// Let Go (7.280 resume 4, rebuilt as three lanes): the ring hidden in smoke over the low lane, the landing in the open
// and cracking, then the next stone under the lamp. Middle: cracking stones under a sweeping lamp. High: cracking stones far
// apart under the last lamp, low and long to the yard. Your shade behind.
// (Kept below the echo rooms: the mother's echo stays the region's hardest.)
const release=lanes();
release.rect(8,14,13,19,'S').put(11,16,'O').rect(17,20,19,20,'T').rect(26,20,28,20,'T')
 .rect(30,12,32,12,'T').rect(21,12,23,12,'T').rect(13,12,14,12,'T').rect(8,12,9,12,'T')
 .rect(10,5,12,5,'T').rect(23,5,25,5,'T').rect(30,5,32,5,'T')
 .rect(10,14,12,14,'#');   // rock over the ring (not under any stone): no hooking it through the middle lane's floor

// Two Shadows: the lamp ahead, your shade behind. Smoke on the cracking stones; no stone can be waited on.
const twin=shell().rect(1,1,38,4,'#').rect(4,5,34,5,'v').put(18,5,'.').rect(0,17,4,22,'#').put(2,16,'P').rect(35,15,39,22,'#').rect(39,11,39,14,'.');
pit(twin,5,34);
twin.rect(8,14,11,14,'T').rect(8,15,11,15,'^').rect(8,11,11,13,'S').rect(15,10,17,10,'T').rect(15,11,17,11,'^')
 .rect(21,13,24,13,'T').rect(21,14,24,14,'^').rect(21,10,24,12,'S').rect(28,9,30,9,'T').rect(28,10,30,10,'^');

// The Watch: three lanes under one lamp's look each; banks of smoke at the turns. Low and long under the thorns in
// the first, a super in the second, a tear into the last bank.
const watch=lanes();
watch.rect(35,15,38,19,'S').rect(1,7,4,11,'S').rect(1,1,5,4,'S').rect(12,20,14,20,'T').rect(24,20,26,20,'T').rect(4,15,34,15,'v')
 .rect(27,12,31,12,'T').rect(14,12,16,12,'T').rect(12,5,14,5,'T').rect(30,1,30,4,'<').put(19,15,'.').put(17,7,'.');

// Beyond the Watch: three lanes and your shade the whole way: a tear over a thorn curtain, a pane, a super off a
// cracking runway, low and long under the last roof.
const road=lanes();
road.rect(12,14,12,19,'<').rect(15,20,17,20,'T').rect(26,14,26,20,'|').rect(28,20,30,20,'T')
 .rect(26,12,30,12,'T').rect(10,12,13,12,'T').rect(10,1,10,4,'|').rect(14,5,16,5,'T').rect(25,5,27,5,'T').rect(17,1,38,2,'v').put(19,15,'.');

// Echo · The Old Awning: three lanes of awnings, smoke under each and every stone cracking, a lamp sweeping each lane,
// and two of your shades behind. Nothing holds and nothing can be waited out.
const qroofs=lanes();
qroofs.rect(9,20,11,20,'T').rect(9,16,11,19,'S').rect(19,20,21,20,'T').rect(27,20,29,20,'T').rect(27,16,29,19,'S').put(20,14,'.')
 .rect(26,12,28,12,'T').rect(26,8,28,11,'S').rect(17,12,18,12,'T').rect(9,12,11,12,'T').rect(9,8,11,11,'S').put(18,7,'.')
 .rect(12,5,14,5,'T').rect(12,1,14,4,'S').rect(21,5,22,5,'T').rect(29,5,31,5,'T').rect(29,1,31,4,'S');
// Echo · The Former Shelter: three lanes. Through the low lane's glass left is right, and the tear while swapped; the
// middle lane's glass turns it back; cracking stones under the lamp to the cup and the mother's echo.
const qcup=lanes();
qcup.rect(9,20,11,20,'T').rect(14,14,14,20,'|').rect(19,20,21,20,'T').rect(27,20,29,20,'T').put(24,14,'.')
 .rect(26,12,28,12,'T').rect(20,7,20,11,'|').rect(13,12,15,12,'T')
 .rect(12,5,14,5,'T').rect(23,5,25,5,'T').rect(33,5,38,5,'#').put(36,4,'*').put(19,1,'.')
 // 7.280 (resume 4): a thorn curtain in the low and the high lane, each crossed only by a tear (the low one while
 // swapped), and two shades: the echo stays the Colony's hardest.
 .rect(25,14,25,20,'<').rect(29,1,29,4,'<');

const meta={"n":38,"name":"The Fractured Colony","kit":["dash","strike","parry","portal"],"folk":{"mother":{"cloak":"#927760","trim":"#d7c4a4","skin":"#c7a689","hood":true},"sable":{"cloak":"#526f6c","trim":"#acc3a9","skin":"#b5977b","hood":true}},"props":{"family-cot":[[0,-4,14,3,"#8c7057"],[1,-1,2,1,"#554333"],[11,-1,2,1,"#554333"],[1,-6,11,2,"#abb2a0"]],"family-cot@sealed-cup":[[0,-4,14,3,"#8c7057"],[1,-1,2,1,"#554333"],[11,-1,2,1,"#554333"],[1,-6,11,2,"#abb2a0"],[15,-4,4,4,"#c8bb91"]]},"blurb":"The Colony under its smoke, seen in a broken window.","outro":"The watch lights turn away. The road to the palace is bright."};
const family={"id":"fc38-family","name":"A Quiet Question","hint":"The old shelter is down the left-hand passage","question":"Will you bring the family’s own cup before crossing the watch yard?","map":["########################################","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","........................................","........................................","........................................","........................................","............P...........................","########################^^^^^###########","########################################","########################################","########################################","########################################"],"side":"left","people":[{"who":"mother","name":"THE MOTHER’S ECHO","c":17,"r":17,"quest":"mother-echo","line":"The cup is still beside the bed. I asked my questions first.","lineDone":"The old shelter. You know where it’s been."}],"decor":[{"k":"family-cot","c":14,"r":17}]};
const rooms=[
 r('lamps','Lamplight','Two lamps swing over the yard in turn · none of the stones will hold you · smoke hides the high ones','Two lamps, four stones that will not hold you. Which stone is dark next?',lamps,
  {study:true,fault:{spread:4},lights:[{c:13,r:6,dir:90,sweep:60,period:160,range:200,width:12},{c:27,r:6,dir:90,sweep:60,period:160,phase:80,range:200,width:12}]}),
 r('smoke','Pit Smoke','Any part of you in smoke hides all of you · the stones crack · the tear lifts you over the thorns','Every bank of smoke stands on cracking stone. When is the next gap dark, and when is the tear?',smoke,
  {study:true,fault:{spread:4},lights:[{c:20,r:2,dir:90,sweep:60,period:200,range:240,width:14}],lines:[{a:[31,18],b:[13,9],setDown:true}]}),
 r('glance','A Glance','Each lamp looks straight down: dash through its look · the stones crack · your shade behind','Four looks, three lanes and no step back. Which do you jump and which do you dash?',glance,
  {study:true,fault:{spread:4},shade:{delay:60},lights:[{c:17,r:14,dir:90,sweep:0,width:9,range:60},{c:29,r:14,dir:90,sweep:0,width:9,range:60},{c:20,r:7,dir:90,sweep:0,width:9,range:45},{c:9,r:7,dir:90,sweep:0,width:9,range:45}],lines:laneLines}),
 r('line','Lines Out','Only a tear crosses a thorn curtain · the lamp still sees you on the line','Two curtains, two tears and a lamp that swings over both. When do you get on?',line,
  {study:true,fault:{spread:4},lines:[{a:[10,12],b:[19,7],setDown:true},{a:[23,5],b:[32,13]}],lights:[{c:20,r:1,dir:90,sweep:60,period:180,range:220,width:12}]}),
 family,
 r('speed','Faster Than a Hop','Jump late in a ground dash and keep its speed · the lamp leaves the pit dark for a breath · shade behind','Each lane is dark for a breath, and each gap is wider than a hop and a dash. What crosses it in one?',speed,
  {study:true,fault:{spread:4},shade:{delay:45},lights:[{c:20,r:14,dir:90,sweep:70,period:150,range:80,width:14},{c:18,r:7,dir:90,sweep:70,period:150,phase:75,range:60,width:14}],lines:laneLines}),
 r('low','Low Road','Dash down into the floor and jump: low and long · the panes swap you and swap you back · the lamp looks','Under a roof too low for a jump, what carries you over four beds of thorns before the lamp looks back, and which way is forward between the panes?',low,
  {study:true,fault:{spread:4},mirror:{},shade:{delay:45},lights:[{c:1,r:15,dir:0,sweep:30,period:150,range:330,width:6}]}),
 r('glass','Glass','Left is right between the panes · the lamp is watching · your shade is close behind','Between the two panes, which way do you press, and how long can you take?',glass,
  {study:true,fault:{spread:4},mirror:{},shade:{delay:40},lights:[{c:20,r:1,dir:90,sweep:60,period:200,range:220,width:12}]}),
 r('release','Let Go','The swing is hidden in the smoke, the landing is not, and it cracks · a lamp in every lane','The swing is hidden, the landing is not. When do you let go, and when is each lane dark?',release,
  {study:true,fault:{spread:4},shade:{delay:50},lines:laneLines,lights:[{c:16,r:14,dir:90,sweep:60,period:150,range:80,width:14},{c:22,r:7,dir:90,sweep:60,period:150,phase:75,range:60,width:14},{c:16,r:1,dir:90,sweep:60,period:150,phase:40,range:60,width:14}]}),
 r('shade','Two Shadows','The lamp ahead, your shade behind · smoke on the stones hides you, but nothing holds you','Your shade is a breath behind you and the lamp swings ahead. Which stone is dark next?',twin,
  {study:true,fault:{spread:4},shade:{delay:50},lights:[{c:18,r:5,dir:90,sweep:60,period:170,range:220,width:12}]}),
 r('watch','The Watch','From smoke to smoke between the looks · low and long, a super, a tear over the curtain · shade behind','The lamp looks away once. Which three moves carry you from smoke to smoke before it looks back?',watch,
  {study:true,fault:{spread:4},shade:{delay:45},lines:[...laneLines,{a:[16,4],b:[33,3]}],lights:[{c:19,r:15,dir:90,sweep:70,period:160,range:60,width:16},{c:17,r:7,dir:90,sweep:70,period:160,phase:80,range:50,width:16}]}),
 r('road','Beyond the Watch','A tear, a super, a pane, a low long jump · your shade the whole way','From the curtain to the palace road, where can you stop?',road,
  {study:true,fault:{spread:4},mirror:{},shade:{delay:45},lines:[...laneLines,{a:[8,19],b:[16,19],setDown:true}],lights:[{c:19,r:15,dir:90,sweep:65,period:170,range:60,width:14}]}),
];
const quests=[{...{"id":"mother-echo","title":"Mine First","giver":"The mother’s echo","from":"fc38-family","back":{"c":12,"r":17},"keepsake":{"id":"mother-remembered","name":"The Mother, remembered","gives":"The cup stayed beside the bed, and the questions got answers. Shown at the end."},"needs":"sealed-cup"},rooms:[
 r('q-roofs','The Old Awning','Smoke hides you under the awnings · every stone cracks · two shades follow · a lamp in every lane','Two shades behind you and a lamp in every lane. Which awning is dark next?',qroofs,
  {study:true,fault:{spread:4},shade:{delay:45,count:2,gap:30},lights:[{c:20,r:14,dir:90,sweep:70,period:150,range:80,width:14},{c:18,r:7,dir:90,sweep:70,period:150,phase:75,range:60,width:14},{c:20,r:1,dir:90,sweep:60,period:150,phase:40,range:60,width:14}],lines:laneLines}),
 r('q-cup','The Former Shelter','Through the glass left is right · tears over the curtains · the second glass turns it back · two shades','Through the glass, which way do you press for the tear, and which for the cup?',qcup,
  {study:true,fault:{spread:4},mirror:{},shade:{delay:45,count:2,gap:30},lines:[...laneLines,{a:[22,19],b:[28,19],setDown:true},{a:[26,4],b:[33,4],setDown:true}],lights:[{c:24,r:14,dir:90,sweep:60,period:160,range:80,width:12},{c:19,r:1,dir:90,sweep:60,period:180,range:60,width:12}],
   people:[{"who":"mother","name":"THE MOTHER’S ECHO","c":35,"r":4,"quest":"mother-echo","line":"Only a little, to start. Then more.","lineDone":"She is asleep. We spoke quietly."}]})
]}];
export default {...meta,note:'7.280: rebuilt for the Fractured ramp (stage V).',rooms,quests};
