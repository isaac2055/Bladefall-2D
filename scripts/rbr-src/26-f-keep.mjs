// Room by Room · 26. The Fractured Keep. Source for public/bladefall-rbr-26-f-keep.js (node scripts/rbr-src/gen.mjs 26).
// Hand-edited for the 7.280 Fractured brief (docs/plans/fractured-hard.md, stage II): the Ruined Keep reflected and
// rebuilt around the keystone (the core's lantern: grab carries it, grab throws it, it slows your fall, it holds
// doors from its plates) and the Marksman's fault stone (glyph T, room field `fault`): every shelf, trestle and
// bridge you would have rested on cracks, so each lift, throw and glide has to be made on the move.
import {grid} from './build.mjs';
const PIT=(g,c0,c1)=>g.rect(c0,21,c1,21,'^').rect(c0,22,c1,22,'#');
const R={"n":26,"name":"The Fractured Keep","kit":["dash","strike","parry","portal"],"folk":{"tovin":{"cloak":"#5a5468","trim":"#d6b878","skin":"#c99c7a","cap":true},"veya":{"cloak":"#6e4a52","trim":"#e0c08a","skin":"#d8b08c","hood":true,"flame":true},"idris":{"cloak":"#4a5060","trim":"#b8c0cc","skin":"#c8a888","cap":true,"staff":true},"archivist":{"cloak":"#5c5070","trim":"#bca4db","skin":"#d4bc9c","hood":true}},"blurb":"The Keep stands reflected. Its lantern burns on the wrong side of every door.","outro":"The keystone turns the other way. The gaol bells are ringing backwards.","note":"First pass (7.278, the hourly Climb routine): Ruined Keep’s rooms reflected by scripts/rbr-src/fracture.mjs; edit that, or replace this region by hand. Every room reflected."};

// 1 · Gatehouse Seam — the keystone rests on a cracked shelf over its plate. Bump the shelf from below as you run the
// fault bridge, and the stone drops onto the plate behind you; the gate is open by the time you reach it.
const k1=grid().frame();
k1.rect(34,18,39,22,'#');PIT(k1,10,33);
k1.rect(28,18,31,18,'T').rect(24,18,26,18,'T').rect(21,18,22,22,'#').rect(21,18,22,18,'_').rect(14,18,19,18,'T')
 .rect(19,13,24,13,'T').put(21,12,'l')
 .rect(1,18,9,22,'#').rect(5,1,8,12,'#').rect(6,13,7,17,'H').rect(0,14,0,17,'.')
 .put(36,17,'P');

// 2 · The Long Table — no floor; the stone's glide carries you from trestle to trestle, each cracked and each standing
// over a spiked stake. Every landing is a jump the moment you touch down; every glide is steered short.
const k3=grid().frame();const D3=2;
k3.rect(33,10+D3,39,22,'#').put(35,9+D3,'l').put(37,9+D3,'P');PIT(k3,8,32);
const stake=(g,c,top)=>g.rect(c,top,c+1,top,'^').rect(c,top+1,c+1,20,'#');
stake(k3,27,15+D3);k3.rect(27,13+D3,28,13+D3,'T');
stake(k3,21,17+D3);k3.rect(21,15+D3,22,15+D3,'T');
stake(k3,15,16+D3);k3.rect(15,14+D3,16,14+D3,'T');
stake(k3,10,17+D3);k3.rect(10,15+D3,11,15+D3,'T');
k3.rect(1,14+D3,7,22,'#').rect(6,13+D3,7,13+D3,'_').rect(2,6+D3,3,13+D3,'H').rect(0,10+D3,0,13+D3,'.');

// 3 · Fallen Refectory — the plate is up on the fallen table, higher than a jump with your arms full. Jump off the
// ledge, let go of the stone at the top, dash on to the strip under the table, and leave by the cracked pillar.
const k2=grid().frame();
k2.rect(34,18,39,22,'#').put(35,17,'l').put(37,17,'P');PIT(k2,1,33);
k2.rect(17,14,24,15,'#').rect(17,10,17,13,'#').rect(18,13,19,13,'_').rect(17,18,25,18,'T')
 .rect(10,12,11,16,'T')
 .rect(1,7,4,22,'#').rect(3,1,4,6,'H').rect(0,3,0,6,'.');

// 4 · Weight Hall — glide to a cracked perch over stakes, throw the stone across from the top of the next jump, dash
// after it, and take it off the far shelf before your own landing's crack reaches it; glide it down to its plate.
const k4=grid().frame();
k4.rect(33,15,39,22,'#').put(35,14,'l').put(37,14,'P');PIT(k4,7,32);
k4.rect(23,17,25,17,'T').rect(22,19,26,19,'^').rect(22,20,26,20,'#').rect(9,17,14,17,'^').rect(9,18,14,20,'#')
 .rect(9,15,14,15,'T').rect(8,13,8,15,'#')
 .rect(1,18,6,22,'#').rect(5,17,6,17,'_').rect(1,10,2,17,'H').rect(0,14,0,17,'.');

// 5 · The Cradle — the cradle rises into a thorned vault: leave it on the way up and its speed is yours. Glide to the
// staked perch, throw the stone up onto the plate shelf from the top of the jump, and dash down under it to the door.
const k5=grid().frame();
k5.rect(34,18,39,22,'#').put(35,17,'l').put(37,17,'P');PIT(k5,1,33);
k5.rect(28,18,33,18,'T').rect(27,20,33,20,'^').rect(27,21,33,21,'#')
 .rect(22,18,25,18,'Z').rect(21,7,26,7,'v')
 .rect(11,15,13,15,'T').rect(11,17,13,17,'^').rect(11,18,13,19,'#')
 .rect(5,11,9,12,'#').rect(4,8,4,12,'#').rect(5,10,9,10,'_')
 .rect(1,16,8,22,'#').rect(2,9,2,15,'H').rect(0,12,0,15,'.');

// 6 · Mason's Quarter — the masons' door is open low on the far face of their wall; yours goes on the pale stone up
// the near face, fired from a strip that cracks under you. Their side is a drop with two cracked perches.
const k6=grid().frame();
k6.rect(18,1,19,17,'#').rect(18,15,18,16,'%').rect(19,12,19,13,'%');PIT(k6,1,33);
k6.rect(34,18,39,22,'#').rect(22,18,33,18,'T').rect(18,18,21,22,'#')
 .rect(12,18,14,18,'T').rect(6,15,8,15,'T').rect(1,12,3,22,'#').rect(0,8,0,11,'.')
 .put(36,17,'P');

// 7 · The Cells — the stone climbs ahead of you, twice. Throw it onto the cracked step, dash up after it and take it
// before the step falls; jump and throw it onto the plate shelf; over the cell wall and out across the cracked walk.
const k7=grid().frame();
k7.rect(30,18,39,22,'#').put(34,17,'l').put(36,17,'P');PIT(k7,1,29);
k7.rect(22,17,28,20,'#').rect(22,16,28,16,'^')
 .rect(23,14,27,14,'T').rect(22,11,22,14,'#').put(22,10,'T')
 .rect(30,10,35,11,'#').rect(36,6,36,11,'#').rect(34,9,35,9,'_')
 .rect(14,10,20,10,'T').rect(12,13,20,13,'^').rect(12,14,20,15,'#')
 .rect(1,10,4,22,'#').rect(2,3,3,9,'H').rect(0,6,0,9,'.');

// 9 · The Torn Stacks — the plate is down on a cracked reading shelf; the door is high across the hall. Throw the
// stone down from the top of the jump, dash into the tear, and from the cracked perch it sets you on, into the next.
const k8=grid().frame();
k8.rect(33,16,39,22,'#').put(35,15,'l').put(37,15,'P');PIT(k8,1,32);
k8.rect(18,19,22,19,'T').rect(18,20,22,20,'#').rect(17,17,17,20,'#').put(17,16,'T').rect(18,18,22,18,'_').rect(7,8,7,20,'>')
 .rect(11,16,13,16,'T')
 .rect(1,7,6,22,'#').rect(6,8,6,9,'.').put(5,8,'.').rect(2,1,2,6,'H').rect(0,3,0,6,'.');   // the notch the second tear passes

// 10 · The Broken Arch — everything the keep has taught, in one stretch: bump the stone off its cracked shelf, take it
// along the cracking strip, glide to the staked trestle, throw it up onto the plate shelf from the top of the jump,
// ride the tear to the cracked perch it opened the way from, and jump and dash to the door.
const k9=grid().frame();
k9.rect(34,18,39,22,'#').put(37,17,'P');PIT(k9,6,33);
k9.rect(31,14,34,14,'T').put(32,13,'l')
 .rect(23,18,33,18,'T').rect(22,20,33,20,'^').rect(22,21,33,21,'#')
 .rect(15,18,16,18,'T').rect(15,20,16,20,'^').rect(15,21,16,21,'#')
 .rect(6,14,11,15,'#').rect(5,11,5,15,'#').put(5,10,'T').rect(6,13,11,13,'_')
 .rect(13,8,15,8,'T').rect(12,15,14,15,'^').rect(12,16,14,17,'#')
 .rect(1,6,3,22,'#').rect(4,9,4,20,'>').rect(2,1,2,5,'H').rect(0,2,0,5,'.');

// The Archivist's rain shelf, remembered (echo). Up three cracked perches to the pale stone high in the rain screen's
// near face, through the masons' door on its far face, and down by two more cracked perches to the shelf where the
// fourth volume lies. No stone to carry: only the crack under every foothold.
const qrain=grid().frame();
qrain.rect(33,18,39,22,'#');PIT(qrain,1,32);
qrain.rect(21,1,23,17,'#').rect(20,1,20,17,'<').rect(24,1,24,17,'>').rect(21,18,23,22,'#')
 .rect(24,3,24,7,'#').rect(20,9,20,12,'#').rect(24,5,24,6,'%').rect(20,10,20,11,'%')
 .rect(28,17,30,17,'T').rect(34,11,36,11,'T').rect(25,7,27,7,'T')
 .rect(14,14,15,14,'T').rect(8,9,9,9,'T')
 .rect(1,13,4,22,'#').put(2,12,'*').rect(0,9,0,12,'.')
 .put(36,17,'P');

const rooms=[
 {id:'fk26-hearth',name:'Gatehouse Seam',exit:'left',study:true,fault:{},lock:['portal'],hint:'A plate holds its door open while weight rests on it · cracked stone falls where you touch it',
  question:'The keystone rests on a cracked shelf over its plate, and the bridge under you will not wait. When do you touch the shelf?',
  decor:[{k:'hearth',c:37,r:17},{k:'clock',c:3,r:17}],map:k1.rows()},
 {id:'fk26-table',name:'The Long Table',exit:'left',study:true,fault:{},lock:['portal'],hint:'Carried, the keystone slows your fall · a trestle cracks the moment you touch it · every one stands on a stake',
  question:'The floor of the hall is gone and every trestle stands over a stake. How far will each glide carry you, and how short must you steer it?',
  decor:[],map:k3.rows()},
 {id:'fk26-refectory',name:'Fallen Refectory',exit:'left',study:true,fault:{},lock:['portal'],hint:'Grab again throws the keystone from over your head · arms full, the fallen table is out of reach',
  question:'The plate is up on the fallen table, higher than you can jump with the stone. When do you let it go, and how do you follow?',
  decor:[],map:k2.rows()},
 {id:'fk26-weight',name:'Weight Hall',exit:'left',study:true,fault:{},lock:['portal'],hint:'Thrown, the keystone goes where you cannot carry it · a stone on cracked stone falls when your crack reaches it',
  question:'The far shelf is past the perch, and it cracks under you as it will under the stone. What goes across first, and how long do you have when you land beside it?',
  decor:[],map:k4.rows()},
 {id:'fk26-cradle',name:'The Cradle',exit:'left',study:true,fault:{},lock:['portal'],hint:'A lift runs only while you stand on it · jump while it moves and you keep its speed · this one rises into thorns',
  question:'The cradle climbs into a thorned vault. When do you leave it, and where does its speed carry you and the stone?',
  decor:[],zips:[[0,-10]],map:k5.rows()},
 {id:'fk26-quarter',name:'Mason’s Quarter',exit:'left',study:true,fault:{},portalMode:'one',portals:[{color:'orange',c:18,r:15,face:'l'}],hint:'The portal key fires the way you aim · it opens only on pale stone',
  question:'The masons’ door is already open on the far side of their wall. Where does yours go, and where do you fire it from?',
  decor:[],map:k6.rows()},
 {id:'fk26-cells',name:'The Cells',exit:'left',study:true,fault:{},lock:['portal'],hint:'The keystone climbs ahead of you · catch it before its step falls · nobody climbs with their arms full',
  question:'The plate is two cell steps up. Which step does the stone reach first, and what do you do the moment you land beside it?',
  decor:[],map:k7.rows()},
 {...{"id":"fk26-archive","name":"Clinging Archive","exit":"up","side":"right","hint":"A floor end remembers how far you fell · out of a floor, you rise as fast as you fell in","question":"The way on is up a column with thorns all round it. How far must you fall to rise that high?","portalMode":"two","people":[{"who":"archivist","c":33,"r":17,"face":-1,"quest":"archivist-echo","line":"There was a fourth volume. It agreed with all three, so I left it.","lineDone":"You found it. Read me the last line.","name":"THE ARCHIVIST’S ECHO"}],"decor":[]},
  map:[
   "############....########################",
   "#>......................................",
   "#>......................................",
   "#>..................................####",
   "#>.....................................#",
   "#>.....................................#",
   "#>..............................###....#",
   "#>.....................................#",
   "#>................####.................#",
   "#>...............<####..............####",
   "#>...............<####.................#",
   "#>...........%%..<####.................#",
   "#>..........<##>.<####..........###....#",
   "#>..........<##>.<####.................#",
   "#>..........<##>.<####.................#",
   "#>..........<##>.<####..............####",
   "#>..........<##>.<####.................#",
   "#>..........<##>.<####...............P.#",
   "#^^^^^^^^^^^###^^#####%%################",
   "########################################",
   "########################################",
   "########################################",
   "########################################"]},
 {id:'fk26-stacks',name:'The Torn Stacks',exit:'left',study:true,fault:{},lock:['portal'],lines:[{a:[30,13],b:[12,15],setDown:true},{a:[10,15],b:[4,6]}],hint:'Dash into a tear and it carries you · the keystone cannot ride one · thrown, it can open the door the tear leads to',
  question:'The plate is down on a cracked shelf and the door is high across the hall. What do you throw before you dash, and which tear do you take from the perch?',
  decor:[],map:k8.rows()},
 {id:'fk26-arch',name:'The Broken Arch',exit:'left',study:true,fault:{},lock:['portal'],lines:[{a:[17,13],b:[14,7],setDown:true}],hint:'Everything the keep has taught, in one stretch · nothing here holds you twice',
  question:'The stone is up on a cracked shelf, the plate is up on the far wall, and the door is higher still. Where are your hands at each one?',
  decor:[],map:k9.rows()}
];

const quests=[
 {...{"id":"archivist-echo","title":"The Fourth Volume","giver":"The archivist’s echo","from":"fk26-archive","back":{"c":37,"r":2},"keepsake":{"id":"archivist-remembered","name":"The Archivist, remembered","gives":"He wrote a fourth book that agreed with the other three. Shown at the end."},"needs":"archivist-volumes"},rooms:[
  {...{"id":"fk26-q-gallery","fault":{},"study":true,"name":"The Gallery","exit":"up","hint":"Cracked boards give way · jump off a wall you cling to · thorns band both walls","question":"The gallery floor has fallen and the chimney is banded with thorns. Where on each wall can you hold, and where must you already be on the other?","portalMode":"two","decor":[]},
   map:[
    "#################################.....##",
    "#.............................<#>.....<#",
    "#.............................<#>......#",
    "#.............................<#>......#",
    "#.............................<#......<#",
    "#.............................<#......<#",
    "#.............................<#>.....<#",
    "#.............................<#>.....<#",
    "#.............................<#>......#",
    "#.............................<#>......#",
    "#.............................<#......<#",
    "#.............................<#......<#",
    "#.......................o.....<#>.....<#",
    "#.....................................<#",
    "#................TTT...................#",
    "#......................................#",
    "#.........TTT.........................<#",
    "#.P...................................<#",
    "#######^^^^^^^^^^^^^^^^^^^^^^^^#########",
    "########################################",
    "########################################",
    "########################################",
    "########################################"]},
  {id:'fk26-q-rain',name:'The Rain Shelf',exit:'left',study:true,fault:{},portalMode:'one',portals:[{color:'orange',c:20,r:10,face:'l'}],hint:'The masons’ door is open on the far face · yours goes on the pale stone high on the near one · every perch cracks',
   question:'The rain screen is thorned from floor to roof. Which perch do you fire from, and where does the masons’ door drop you?',
   decor:[],people:[{who:'archivist',name:'THE ARCHIVIST’S ECHO',c:4,r:12,quest:'archivist-echo',line:'It says the gate was only ever a door.',lineDone:'I will sit with that one for a while.'}],map:qrain.rows()}]}
];

export default {...R,rooms,quests};
