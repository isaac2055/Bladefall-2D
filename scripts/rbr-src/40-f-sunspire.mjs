// Room by Room · 40. The Fractured Palace (7.280 rebuild, hand-made over the 7.278 reflection). Source for
// public/bladefall-rbr-40-f-sunspire.js (node scripts/rbr-src/gen.mjs 40). docs/plans/fractured-hard.md, stage V:
// the hardest region in the game. Sunspire's light and portals with everything the act has taught, back to back, and
// the King in Daylight with every device of the act in his light. Exit right.
import {grid} from './build.mjs';
const shell=()=>grid().frame();
// 7.280 (resume 4): a cracking stone over a down-thorn row (a lane's floor over the lane below) left a hole you fell
// through unharmed, onto the lane below: a free rest. The thorn under every cracking stone now points up, so the hole is
// real void, as everywhere else.
const voidUnder=rows=>rows.map((row,r)=>r>0?[...row].map((ch,c)=>ch==='v'&&rows[r-1][c]==='T'?'^':ch).join(''):row);
const r=(id,name,hint,question,m,extra={})=>({id:'fs40-'+id,name,hint,question,map:voidUnder(m.rows()),...extra});
const pit=(m,c0,c1)=>m.rect(c0,21,c1,21,'^').rect(c0,22,c1,22,'#');
const roof=(m,r1)=>m.rect(1,1,38,r1,'#');
// Three lanes, joined by tears at alternate ends (as the Colony's and the Path's): low lane right, climb the right wall, middle
// lane left, climb the left wall, high lane right to the door. Perches: L1 row 20 (stand 19), L2 row 12, L3 row 5.
const lanes=()=>{const m=shell();
 m.rect(1,20,3,21,'#').put(2,19,'P').rect(4,21,34,21,'^').rect(35,20,38,21,'#');
 m.rect(1,12,36,12,'^').rect(1,13,38,13,'v').rect(37,12,38,12,'#').rect(1,12,4,12,'#');
 m.rect(4,5,38,5,'^').rect(4,6,38,6,'v').rect(1,5,3,5,'#').rect(1,6,3,6,'v').rect(39,1,39,4,'.');
 return m;};
// The lanes are joined by tears: up out of the low lane onto the middle lane's ledge, up out of the middle lane onto
// the high lane's ledge (each set down).
const laneLines=[{a:[33,18],b:[38,11],setDown:true},{a:[6,11],b:[3,4],setDown:true}];
const win1=(m,c)=>m.put(c,14,'X');

// Sun Through Stone: three lanes. Louvred windows over cracking stones in the low lane, the engine in the middle,
// cracking stones under a roof of thorns in the high lane (low and long). Your shade the whole way.
const court=lanes();
win1(court,12);win1(court,25);court.rect(8,20,10,20,'T').rect(18,20,20,20,'T').rect(29,20,31,20,'T')
 .rect(26,12,28,12,'A').rect(19,11,21,11,'B').rect(10,12,12,12,'A').put(16,13,'#').put(16,12,'#').put(16,7,'B')
 .rect(14,5,16,5,'T').rect(26,5,27,5,'T').rect(12,1,38,1,'v');

// The Hours: four tears on the dawn clock, each across a thorn curtain, each but the last setting you down on cracking
// stone; your shade rides them a breath behind.
const hours=shell().rect(0,17,4,22,'#').put(2,16,'P').rect(36,8,39,22,'#').rect(39,4,39,7,'.');
pit(hours,5,35);
hours.rect(9,1,9,20,'<').rect(12,14,13,14,'T').rect(12,15,13,15,'^').rect(17,1,17,20,'<').rect(20,11,21,11,'T').rect(20,12,21,12,'^')
 .rect(25,1,25,20,'<').rect(28,13,29,13,'T').rect(28,14,29,14,'^').rect(33,1,33,20,'<');

// Both Ends: fall into your own end and the fixed one throws you along the upper gallery onto cracking stone; through
// the pane left is right, under the light at head height; the tear drops you into the lower gallery, where a second
// light lies a hand over your head: low and long over cracking stones, and the second pane turns you back at the door.
const ends=shell().rect(9,5,9,9,'#').rect(1,20,6,22,'#').put(3,19,'P').rect(7,20,8,20,'%').rect(9,10,9,11,'%').rect(9,12,9,20,'#').rect(1,5,8,5,'#')
 .rect(1,1,38,4,'#').rect(10,13,38,13,'^').rect(10,14,38,14,'v').rect(35,19,39,22,'#').rect(39,16,39,18,'.');
pit(ends,10,34);
ends.rect(13,12,15,12,'T').rect(25,5,25,12,'|').rect(29,12,31,12,'T').rect(12,20,15,20,'T').rect(20,19,21,19,'T').rect(20,20,21,20,'^')
 .rect(27,19,28,19,'T').rect(27,20,28,20,'^').rect(31,16,31,20,'|').rect(7,21,9,21,'#');

// Glass in the Dark: three lanes and three panes. Through the low lane's pane left is right; the middle lane's pane
// turns it back; the high lane's pane turns it again under a roof of thorns. A louvred window, cracking stones, your
// shade behind.
const glass=lanes();
win1(glass,22);glass.rect(9,20,11,20,'T').rect(14,14,14,20,'|').rect(18,20,20,20,'T').rect(26,20,28,20,'T')
 .rect(28,12,30,12,'T').rect(21,7,21,11,'|').rect(13,12,15,12,'T').rect(14,1,14,4,'|').rect(18,5,20,5,'T').rect(28,5,29,5,'T').rect(16,1,38,1,'v');

// Shade Post: three lanes and two of your shades: a tear over a thorn curtain (they ride it too), the engine under
// a louvred window, a pane and a low long jump.
const shade=lanes();
shade.rect(11,14,11,20,'<').rect(14,20,16,20,'T').rect(26,20,28,20,'T').rect(27,12,29,12,'B').rect(19,12,21,12,'A').rect(10,12,12,12,'B').rect(15,7,15,7,'X').rect(15,12,15,13,'#')
 .rect(11,1,11,4,'|').rect(15,5,17,5,'T').rect(26,5,28,5,'T').rect(18,1,38,1,'v');

// The Light's Door: the louvre decides when the well's portal belongs to you. Fall in, be thrown over the thorns, land
// on cracking stone, and on: a tear over the curtain and a super to the door.
const flume=shell().rect(9,5,9,9,'#').rect(1,20,6,22,'#').put(2,19,'P').rect(7,20,8,20,'%').rect(9,10,9,11,'%').rect(9,12,9,20,'#').rect(4,11,5,19,'#')
 .rect(7,6,8,6,'X').rect(1,1,38,3,'#').rect(1,4,7,4,'#').rect(35,17,39,22,'#').rect(39,13,39,16,'.');
pit(flume,10,34);
flume.rect(21,15,23,15,'T').rect(21,16,23,16,'^').rect(26,1,26,20,'<').rect(29,14,31,14,'T').rect(29,15,31,15,'^').rect(33,4,33,20,'<').rect(35,10,38,16,'#').rect(39,6,39,9,'.').rect(39,13,39,16,'#');

// Ring Light: three lanes. Low: two rings over the thorns with a window between them on its beat, a cracking spar.
// Middle: cracking stones under a louvred window, a ring. High: a ring under the thorn roof and cracking stones to the
// door. Your shade close behind.
const crown=lanes();
win1(crown,17);crown.put(11,16,'O').put(24,16,'O').rect(28,20,30,20,'T')
 .rect(27,12,29,12,'T').put(20,7,'X').put(20,12,'#').put(20,13,'#').put(14,8,'O').rect(8,12,9,12,'T')
 .put(16,2,'O').rect(22,5,24,5,'T').rect(30,5,31,5,'T').rect(12,1,38,1,'v').rect(26,13,30,13,'^').rect(7,13,10,13,'^');

// Noon Engine: three lanes. The engine in the low lane with a lintel over its window; cracking stones under a
// louvred window in the middle; the engine again under a roof of thorns at the top (low and long, and every low long
// jump is a dash that turns it over).
const engine=lanes();
engine.rect(8,20,10,20,'A').rect(15,18,17,18,'B').rect(23,20,25,20,'A').put(20,14,'B')
 .rect(26,12,28,12,'T').put(21,7,'X').rect(21,12,21,13,'#').rect(13,12,16,12,'T')
 .rect(12,5,14,5,'B').rect(22,5,24,5,'A').rect(16,1,38,1,'v');

// Two Deliveries: three lanes, every way of keeping speed the act has taught. Low: a super off cracking stone over a
// gap no hop crosses, then low and long under the teeth. Middle: a down dash landed and jumped from the air. High: low
// and long under the roof, twice, off cracking stone. Your shade the whole way.
const deliveries=lanes();
deliveries.rect(4,20,9,20,'T').rect(21,20,23,20,'T').rect(24,15,34,15,'v')
 .rect(28,12,30,12,'T').rect(16,12,18,12,'T').rect(9,12,10,12,'T')
 .rect(13,5,15,5,'T').rect(24,5,26,5,'T').rect(8,1,38,1,'v');

// The King in Daylight, three hours. As the base fight (route his sunlight onto the far side, strike while the gold
// opens, each bloom moves his sun), with shorter openings, the sun-wave from the first bloom and the act's devices in
// his light: cracking floor at dawn, the glass at morning, your shade at noon.
const dawn=shell().rect(1,18,38,22,'#').rect(32,18,33,18,'%').rect(36,3,36,13,'%').rect(37,3,37,13,'#').rect(38,1,38,17,'G').rect(39,13,39,17,'.')
 .rect(9,14,9,17,'#').rect(10,14,10,17,'%').put(30,17,'P').rect(14,18,19,18,'T').rect(14,19,19,19,'^').rect(25,18,28,18,'T').rect(25,19,28,19,'^');
const morning=shell().rect(1,18,38,22,'#').rect(6,18,7,18,'%').rect(2,3,2,13,'#').rect(3,3,3,13,'%').rect(38,1,38,17,'G').rect(39,13,39,17,'.')
 .rect(30,14,30,17,'%').rect(31,14,31,17,'#').put(7,17,'P').rect(14,1,14,5,'|').rect(14,7,14,11,'|').rect(14,13,14,17,'|')
 // 7.280 (resume 4): the ground either side of the glass cracks too (morning keeps dawn's fault floor): no standing to aim.
 .rect(9,18,13,18,'T').rect(9,19,13,19,'^').rect(15,18,19,18,'T').rect(15,19,19,19,'^');
const noon=shell().rect(1,18,38,22,'#').rect(31,18,32,18,'%').rect(36,1,36,10,'%').rect(37,1,37,10,'#').rect(38,1,38,17,'G').rect(39,13,39,17,'.')
 .rect(7,10,7,13,'#').rect(8,10,8,13,'%').rect(18,14,26,17,'#').put(31,17,'P');
// The Sea Terrace: the hydra carries you home under the King's last light.
const sea=shell().rect(1,18,8,22,'#').put(3,17,'P').rect(39,12,39,21,'.');
pit(sea,9,39);

// Echo · The Lower Shutter: three lanes and a gold handle over the thorns in each, under windows on their beats; the
// stones crack and your shade follows. The last handle shuts the light out and opens the gate.
const qlower=lanes();
win1(qlower,24);qlower.rect(9,20,11,20,'T').put(16,17,'c').rect(20,20,21,20,'T').rect(28,20,30,20,'T')
 .rect(27,12,29,12,'T').put(17,7,'X').put(17,12,'#').put(17,13,'#').put(22,9,'c').rect(10,12,12,12,'T')
 .rect(12,5,14,5,'T').put(19,2,'c').rect(25,5,27,5,'T').rect(36,1,36,4,'G').rect(9,13,13,13,'^').rect(26,13,30,13,'^');
// Echo · The Upper Shutter: three lanes. Through the low lane's glass left is right, a handle and the tear while
// swapped; the middle lane's glass turns it back; the last handle over the thorns opens the gate to the flower.
const qupper=lanes();
qupper.rect(9,20,11,20,'T').rect(14,14,14,20,'|').rect(17,20,19,20,'T').put(25,17,'c').rect(25,20,27,20,'T')
 .rect(26,12,28,12,'T').rect(20,7,20,11,'|').rect(12,12,14,12,'T')
 // 7.280 (resume 4): a thorn curtain in the low and the middle lane, each crossed only by a tear, and two shades:
 // the echo stays the Palace's hardest.
 .rect(22,14,22,20,'<').rect(23,7,23,11,'>').rect(21,12,22,12,'T')
 .rect(12,5,14,5,'T').put(21,2,'c').rect(25,5,27,5,'T').rect(31,1,31,4,'G').rect(33,5,38,5,'#').put(36,4,'*');

const meta={"n":40,"name":"The Fractured Palace","kit":["dash","strike","parry","portal"],"folk":{"gardener":{"cloak":"#8a9777","trim":"#e4dab1","skin":"#c7ad8c","hood":true},"hydra":{"cloak":"#598b8c","trim":"#b5cebd","skin":"#779e8a","hood":true}},"props":{"evening-bench":[[0,-6,16,2,"#b4a184"],[2,-4,2,4,"#8c7859"],[12,-4,2,4,"#8c7859"],[19,-4,1,4,"#657b50"]],"evening-bench@night-flower":[[0,-6,16,2,"#b4a184"],[2,-4,2,4,"#8c7859"],[12,-4,2,4,"#8c7859"],[19,-5,1,5,"#657b50"],[17,-8,5,4,"#d7d3ed"]]},"blurb":"Sunspire in the mirror: the light comes through the other windows.","outro":"The garden blooms in shade. The fracture ends here, or begins."};
const garden={"id":"fs40-garden","name":"The Evening Bench","hint":"The mirror gallery is an optional way into the garden","question":"Will you close the shutters before taking the throne road?","map":["##.....#################################","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#.......................................","#.......................................","#.......................................","#.......................................","#..P....................................","######################^^^^##############","########################################","########################################","########################################","########################################"],"side":"up","people":[{"who":"gardener","name":"THE GARDENER’S ECHO","c":8,"r":17,"quest":"garden-echo","line":"The shutters stay closed now. The garden decided.","lineDone":"Through the gallery. Mind the light."}],"decor":[{"k":"evening-bench","c":12,"r":17}]};
const king=(id,name,map,dk,port,beam,extra={})=>r(id,name,'Route his light to the far side · the gold opens once it has warmed · stand by him and the glove answers',
 'Where must the light arrive so that your blade finds the open side?',map,{study:true,portalMode:'one',portals:[port],beams:[beam],dayKing:dk,...extra});
const rooms=[
 r('court','Sun Through Stone','Windows on their beats · every dash turns the engine · low and long under the thorns · shade behind','Three lanes and a shade behind you. Which window is shut, which stone stands, and how low can you fly?',court,
  {study:true,fault:{spread:4},shade:{delay:45},beams:[{c:12,r:13,dir:'d'},{c:25,r:13,dir:'d'},{c:16,r:6,dir:'d'}],
   shutters:[{open:50,shut:60,offset:0},{open:50,shut:60,offset:40}],lines:laneLines}),
 r('hours','The Hours','Four tears on the dawn clock, each over a thorn curtain, onto cracking stone · your shade rides them too','The tears open in turn, each a little after the last. Go at once and they meet you; wait, and which is still open?',hours,
  {study:true,fault:{spread:4},shade:{delay:45},lines:[{a:[6,15],b:[12,13],setDown:true,period:120,upT:80},{a:[15,12],b:[20,10],setDown:true,period:120,upT:80,phase:100},{a:[23,9],b:[28,12],setDown:true,period:120,upT:80,phase:75},{a:[31,10],b:[37,7],period:120,upT:80,phase:50}]}),
 r('ends','Both Ends','Fall into your end and the fixed one throws you on · panes swap you · the tear drops you · low and long','The fixed end throws you as fast as you fell. Where do you open yours, which way is forward after the glass, and how low must you fly?',ends,
  {study:true,fault:{spread:4},mirror:{},portalMode:'one',portals:[{color:'orange',c:9,r:10,face:'r'}],beams:[{c:26,r:9,dir:'r'},{c:26,r:15,dir:'r'}],lines:[{a:[34,11],b:[13,19],setDown:true}]}),
 r('glass','Glass in the Dark','Each pane swaps left and right · the window opens on a beat · low and long under the last roof','Three panes in three lanes. Which way is forward in each, and when is the window shut?',glass,
  {study:true,fault:{spread:4},mirror:{},shade:{delay:45},beams:[{c:22,r:13,dir:'d'}],shutters:[{open:50,shut:70,offset:0}],lines:laneLines}),
 garden,
 r('shade','Shade Post','Two shades behind you ride the tear too · every dash turns the engine · the window on its beat','Your shades take the same tear one breath after you. Where do you land, and where do you go?',shade,
  {study:true,fault:{spread:4},mirror:{},shade:{delay:45,count:2,gap:30},beams:[{c:15,r:6,dir:'d'}],shutters:[{open:50,shut:70,offset:0}],lines:[...laneLines,{a:[7,19],b:[15,19],setDown:true}]}),
 r('flume','The Light’s Door','The louvre decides when the portal is yours · thrown over the thorns · two tears over two curtains','The light falls into the same well and leaves by the same door. When is the door yours, and what then?',flume,
  {study:true,fault:{spread:4},shade:{delay:45},portalMode:'one',portals:[{color:'orange',c:9,r:10,face:'r'}],beams:[{c:8,r:4,dir:'d'}],shutters:[{open:50,shut:70,offset:0}],lines:[{a:[24,14],b:[30,13],setDown:true},{a:[32,12],b:[36,9],setDown:true}]}),
 r('crown','Ring Light','Rings over the thorns, a window between them on a beat · cracking stones under the louvres · shade behind','When in the swing do you let go so the window is shut as you pass, in each lane?',crown,
  {study:true,fault:{spread:4},shade:{delay:45},beams:[{c:17,r:13,dir:'d'},{c:20,r:6,dir:'d'}],shutters:[{open:50,shut:60,offset:0},{open:50,shut:60,offset:30}],lines:laneLines}),
 r('engine','Noon Engine','Every dash turns the engine, a low long jump too · the lintel shades the window while cyan stands','Every dash turns the engine. Count them: which stone will be there when you land?',engine,
  {study:true,fault:{spread:4},shade:{delay:60},beams:[{c:20,r:13,dir:'d'},{c:21,r:6,dir:'d'}],shutters:[{open:50,shut:60,offset:0}],lines:laneLines}),
 r('deliveries','Two Deliveries','Low and long off cracking stone in every lane, again and again · the tears between · shade behind','Three lanes of cracking stone and nowhere to stop. Where does each low long jump begin?',deliveries,
  {study:true,fault:{spread:4},shade:{delay:60},lines:laneLines}),
 king('dawn','The Throne at Dawn',dawn,{c:23,r:17,hour:0,need:4,beat:[130,110,90,80],wave:0,guard:24,shrug:true,ripen:30,suns:[{c:0,r:6,dir:'r'},{c:0,r:12,dir:'r'},{c:33,r:0,dir:'d'},{c:0,r:9,dir:'r'}]},{color:'orange',c:10,r:16,face:'r'},{c:0,r:6,dir:'r'},{fault:{fuse:20,spread:5}}),
 king('morning','The Glove of Morning',morning,{c:20,r:17,hour:1,need:3,beat:[130,110,90],wave:0,guard:24,shrug:true,ripen:30,suns:[{c:36,r:6,dir:'l'},{c:36,r:12,dir:'l'},{c:6,r:0,dir:'d'}]},{color:'orange',c:30,r:16,face:'l'},{c:36,r:6,dir:'l'},{mirror:{},fault:{fuse:20,spread:5,rest:60}}),
 king('noon','The Last Noon',noon,{c:22,r:13,hour:2,need:3,beat:[130,110,90],wave:0,guard:24,shrug:true,ripen:30,suns:[{c:0,r:5,dir:'r'},{c:0,r:2,dir:'r'},{c:32,r:0,dir:'d'}]},{color:'orange',c:8,r:12,face:'r'},{c:0,r:5,dir:'r'},{shade:{delay:90}}),
 r('sea','The Sea Terrace','The hydra carries you home · a raised head shades you from the King’s last light · they move faster now','The light falls in four shafts and the heads rise and dip in turn. Where on her back are you safe as each shaft crosses?',sea,
  {decks:[{c:10,r:17,w:12,to:[27,0],period:400}],hydraRide:{shafts:[20,25,30,35],heads:[{at:0,w:3,up:70,down:45,phase:0},{at:4.5,w:3,up:70,down:45,phase:60},{at:9,w:3,up:70,down:45,phase:90}]},
   people:[{who:'hydra',name:'THE THREE HEADS',voiceUntilDone:true,c:8,r:17,line:'You broke our chains twice now. Climb on. The light is harder here; we will hold our heads over you as long as we can.'}]}),
];
const quests=[{...{"id":"garden-echo","title":"The Evening Flower","giver":"The gardener’s echo","from":"fs40-garden","back":{"c":5,"r":17},"keepsake":{"id":"garden-remembered","name":"The Gardener, remembered","gives":"The garden bloomed in shade every evening after. Shown at the end."},"needs":"night-flower"},rooms:[
 r('q-lower','The Lower Shutter','A gold handle over the thorns in every lane · windows on their beats · the last one shuts the light out','A handle in every lane, over the thorns, under the windows. When do you go for each, and how do you get away?',qlower,
  {study:true,fault:{spread:4},shade:{delay:45},beams:[{c:24,r:13,dir:'d'},{c:17,r:6,dir:'d'}],shutters:[{open:50,shut:60,offset:0},{open:50,shut:60,offset:40}],gardenShade:{c:24,r:14},lines:laneLines}),
 r('q-upper','The Upper Shutter','Through the glass left is right · a handle and the tear while swapped · the last handle opens the gate','Through the glass, which way to each handle, and which way home?',qupper,
  {study:true,fault:{spread:4},mirror:{},shade:{delay:45,count:2,gap:30},lines:[...laneLines,{a:[19,19],b:[26,19],setDown:true},{a:[26,11],b:[21,11],setDown:true}],
   people:[{"who":"gardener","name":"THE GARDENER’S ECHO","c":35,"r":4,"quest":"garden-echo","line":"Look, by the bench. Every evening, now.","lineDone":"She liked it in the evenings. So do I."}]})
]}];
export default {...meta,note:'7.280: rebuilt for the Fractured ramp (stage V).',rooms,quests};
