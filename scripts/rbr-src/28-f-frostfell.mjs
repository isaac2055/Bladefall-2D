// Room by Room · 28. The Fractured Frostfell. Source for public/bladefall-rbr-28-f-frostfell.js (node scripts/rbr-src/gen.mjs 28).
// Hand-edited for the 7.280 Fractured brief (docs/plans/fractured-hard.md, stage II): Frostfell's rooms reflected and
// rebuilt around the shade (room field `shade`) and fault stone (glyph T, room field `fault`). On ice, where you cannot
// stop or turn, your own shade walks your path a second behind you, so there is no waiting and no going back; the
// cracked fault stone of the Marksman's canyon comes back as the only footing that is not ice.
import {grid} from './build.mjs';
const PIT=(g,c0,c1)=>g.rect(c0,21,c1,21,'^').rect(c0,22,c1,22,'#');
const R={"n":28,"name":"The Fractured Frostfell","kit":["dash","strike","parry","portal"],"folk":{"neighbour":{"cloak":"#6a6070","trim":"#c6dce1","skin":"#dcbca4","hood":true},"ilyra":{"cloak":"#4f6f8a","trim":"#9fe0ff","skin":"#c99a76","hood":true,"staff":true}},"props":{"f8-mine":[[0,-14,12,14,"#1a1e26"],[-1,-15,14,2,"#5a4632"],[-1,-14,2,14,"#5a4632"],[11,-14,2,14,"#5a4632"],[0,-17,12,2,"#e8f2fa"]],"f8-house":[[0,-12,16,12,"#3e3a40"],[-1,-15,18,3,"#5a4a44"],[-1,-16,18,1,"#e8f2fa"],[3,-8,4,4,"#3a5a70"],[10,-7,4,7,"#2a2226"],[14,-20,2,8,"#b87a4a"]],"f8-cottage":[[0,-12,15,12,"#3a3e48"],[-1,-15,17,3,"#4a5262"],[-1,-16,17,2,"#e8f2fa"],[3,-8,4,4,"#4a6a80"],[9,-7,4,7,"#2a2630"],[0,-13,15,1,"#9fc4dc"],[1,-12,1,3,"#cfe4f2"],[6,-12,1,2,"#cfe4f2"],[12,-12,1,3,"#cfe4f2"]],"f8-cottage@winter-stove":[[0,-12,15,12,"#4a3c38"],[-1,-15,17,3,"#5a4a44"],[-1,-16,17,1,"#e8f2fa"],[3,-8,4,4,"#ffcf7a"],[9,-7,4,7,"#2a2226"],[12,-21,2,6,"#3a3432"],[11,-25,2,2,"#8a8a90"],[13,-28,2,2,"#6a6a70"],[3,-4,4,1,"#6a5240"],[4,-6,2,2,"#4a7ad0"]],"f8-brazier":[[2,-7,4,2,"#5c6470"],[3,-5,2,5,"#5c6470"],[1,-8,6,1,"#8a94a2"]],"f8-flue":[[0,-3,8,3,"#6a4a32"],[1,-4,6,1,"#b87a4a"],[3,-10,2,6,"#b87a4a"]],"f8-pipes":[[0,-2,24,2,"#b87a4a"],[22,-12,2,10,"#b87a4a"],[0,-6,2,4,"#b87a4a"],[8,-4,3,2,"#8a5a3a"]],"f8-memory":[[0,-3,10,3,"#6a7a8a"],[3,-13,4,7,"#a8c4dc"],[4,-16,2,3,"#cfe4f2"],[1,-12,2,1,"#a8c4dc"],[7,-11,2,1,"#a8c4dc"],[3,-6,1,3,"#a8c4dc"],[6,-6,1,3,"#a8c4dc"]],"f8-icicles":[[0,-8,20,1,"#cfe4f2"],[1,-7,1,2,"#bfe4ff"],[5,-7,1,3,"#bfe4ff"],[9,-7,1,4,"#bfe4ff"],[13,-7,1,5,"#bfe4ff"],[17,-7,1,2,"#bfe4ff"]],"f8-icicles-long":[[0,-8,36,1,"#cfe4f2"],[1,-7,1,2,"#bfe4ff"],[5,-7,1,3,"#bfe4ff"],[9,-7,1,4,"#bfe4ff"],[13,-7,1,5,"#bfe4ff"],[17,-7,1,2,"#bfe4ff"],[21,-7,1,3,"#bfe4ff"],[25,-7,1,4,"#bfe4ff"],[29,-7,1,5,"#bfe4ff"],[33,-7,1,2,"#bfe4ff"]],"f8-engine":[[0,-20,2,20,"#5c6470"],[16,-20,2,20,"#5c6470"],[0,-21,18,2,"#8a94a2"],[4,-17,10,10,"#6a7480"],[7,-14,4,4,"#3a4048"],[3,-13,1,2,"#8a94a2"],[14,-13,1,2,"#8a94a2"],[8,-18,2,1,"#8a94a2"],[8,-7,2,1,"#8a94a2"],[5,-5,8,1,"#cfe4f2"]],"f8-bell":[[0,0,1,6,"#5c6470"],[-4,6,9,1,"#8a94a2"],[-3,7,7,6,"#b89a5a"],[-4,13,9,1,"#8a7040"],[0,14,1,1,"#5a4a32"]],"f8-coal":[[0,-3,10,3,"#1e1e22"],[2,-5,6,2,"#2a2a30"],[11,-6,5,6,"#8a7a5a"],[12,-7,3,1,"#6a5a40"]],"f8-chair":[[0,-5,8,1,"#7a6044"],[0,-11,1,11,"#5a4632"],[7,-4,1,4,"#5a4632"],[1,-4,1,4,"#5a4632"],[1,-10,1,5,"#8a3a3a"]]},"palettes":{"frost":{"sky0":"#0d141c","sky1":"#18263a","far":"#223449","rock":"#4a5a6e","rockD":"#2c3848","edge":"#a8c4dc","moss":"#cfe4f2","accent":"#bfe4ff"}},"blurb":"Frostfell turned over. The wind blows the way it used to come back.","outro":"The last shelter is warm on the wrong side. The court above is glass.","note":"First pass (7.278, the hourly Climb routine): Frostfell’s rooms reflected by scripts/rbr-src/fracture.mjs; edit that, or replace this region by hand. Every room reflected."};

// 1 · Glazed Street — the shade on ice: floes over the drop, and nothing to stand on that does not carry you on.
const refuge=grid().frame();
refuge.rect(34,18,39,22,'#');PIT(refuge,1,33);
refuge.rect(27,16,30,16,'I').rect(19,14,22,14,'I').rect(11,16,14,16,'I')
 .rect(1,13,5,22,'#').rect(0,9,0,12,'.').put(36,17,'P');

// 2 · Working Streets — three ice steps up the street, each too far from the next-but-one to skip, and the top step
// is fault stone: it will not wait while you line up the ledge.
const streets=grid().frame();
streets.rect(33,18,39,22,'#').rect(38,1,38,15,'<');PIT(streets,7,32);
streets.rect(1,5,2,22,'#').rect(3,5,3,20,'>').rect(0,1,0,4,'.')
 .rect(27,15,29,15,'I').rect(20,12,22,12,'I').rect(13,9,15,9,'I').rect(7,6,10,6,'T')
 .put(36,17,'P');

// 3 · Raised Shelves — ice shelves up a thorned shaft, each a jump and a dash above the last and the other way; the top
// one cracks.
const shelves=grid().frame();
shelves.rect(1,1,8,22,'#').rect(31,1,38,22,'#').rect(9,1,9,20,'>').rect(30,1,30,20,'<');
shelves.rect(10,21,22,21,'^').rect(23,18,30,22,'#').rect(14,0,18,0,'.')
 .rect(14,14,17,14,'I').rect(22,10,25,10,'I').rect(13,6,16,6,'T')
 .put(27,17,'P');

// 6 · Thawed Court — two quills over the drop: the first lifts you to a floe a jump cannot reach, the second off it.
const court=grid().frame();
court.rect(33,18,39,22,'#');PIT(court,1,32);
court.put(29,14,'f').rect(19,12,23,12,'I').put(14,9,'f').rect(17,16,24,16,'^').rect(17,17,24,20,'#')
 .rect(1,13,3,22,'#').rect(0,9,0,12,'.').put(36,17,'P');

// 7 · The Rehearsal — the gallery is higher than a jump and a dash: a quill, a cracked perch, a quill.
const reh=grid().frame();
reh.rect(38,1,38,15,'<').rect(33,18,39,22,'#');PIT(reh,14,32);
reh.rect(1,8,12,22,'#').rect(13,8,13,20,'>').rect(0,4,0,7,'.')
 .put(28,13,'f').rect(21,11,23,11,'T').put(17,6,'f')
 .put(36,17,'P');

// 8 · Frozen Stair — up and back: a quill, an ice step, a quill, a cracked landing, then the long way over the wall.
const stair=grid().frame();
stair.rect(38,1,38,15,'<').rect(33,18,39,22,'#');PIT(stair,19,32);
stair.rect(1,5,17,22,'#').rect(18,5,18,20,'>').rect(0,1,0,4,'.')
 .put(29,13,'f').rect(25,10,26,10,'I').put(23,7,'f').rect(27,4,29,4,'T')
 .put(36,17,'P');

// 4 · Workers' Hearth — a floe, a cracked stone, a crystal in the air, and the ledge over the thorned face. The
// neighbour's echo waits by the hearth; her stair is the shaft on the right (side, up).
const hearth=grid().frame();
hearth.rect(1,8,5,22,'#').rect(6,8,6,20,'>').rect(7,21,26,21,'^').rect(27,18,39,22,'#').rect(0,4,0,7,'.')
 .rect(27,8,35,9,'#').rect(35,1,35,7,'#').rect(38,1,38,9,'#').rect(36,0,37,0,'.')
 .rect(21,16,22,16,'I').rect(15,13,17,13,'T').put(10,9,'o')
 .put(30,17,'P');

// 5 · Thermal Works — the drafts are short: jump inside the warm air to keep the height, and the floe between them
// will not hold you while you line up the next.
const works=grid().frame();
works.rect(38,1,38,15,'<').rect(32,18,39,22,'#');PIT(works,8,31);
works.rect(1,6,6,22,'#').rect(7,6,7,20,'>').rect(0,2,0,5,'.')
 .rect(19,10,22,10,'I')
 .put(36,17,'P');

// The neighbour's stair, remembered (echo). Three ice steps up a thorned shaft, each a jump and a dash above the last
// and the other way, icicles under the roof, and two shades climbing behind you.
const qsteps=grid().frame();
qsteps.rect(1,1,8,22,'#').rect(31,1,38,22,'#').rect(9,2,9,20,'>').rect(30,2,30,20,'<')
 .rect(15,1,29,1,'v').rect(10,0,13,0,'.')
 .rect(10,21,22,21,'^').rect(23,18,29,22,'#')
 .rect(14,13,15,13,'I').rect(24,8,25,8,'I').rect(14,4,15,4,'T')
 .put(9,1,'#').put(9,21,'#').put(30,1,'#').put(30,21,'#').put(27,17,'P');
// The upper shelter, remembered (echo). A short flue to an ice shelf with the coal at its end, over the thorned pillar
// to one cracked perch, then a switchback down the cold side: past the thorned bar on the pillar side, left along the
// low corridor by two cracked perches, down past the second bar to the hatch in the thorned floor. Two shades, close.
const qshelter=grid().frame();
qshelter.rect(1,1,1,20,'>').rect(38,1,38,15,'<').rect(28,18,39,22,'#')
 .rect(2,21,27,21,'^').rect(2,22,27,22,'#').rect(3,21,5,22,'.')
 .rect(25,5,27,20,'#').rect(25,4,27,4,'^').rect(24,5,24,20,'<').rect(28,5,28,15,'>')
 .rect(30,6,32,6,'I').put(31,5,'*')
 .rect(20,9,22,9,'T')
 .rect(2,12,17,12,'#').rect(2,11,17,11,'^')
 .rect(8,17,23,17,'#').rect(8,16,23,16,'^')
 .rect(19,15,20,15,'T').rect(12,15,13,15,'T')
 .put(1,21,'#').rect(28,17,29,17,'^').put(29,12,'^').put(29,13,'#').put(30,17,'P');

const rooms=[
 {id:'ff28-refuge',name:'Glazed Street',exit:'left',study:true,shade:{delay:60},hint:'Your shade walks where you walked, a second behind · on ice nothing stands still',
  question:'Three floes over the drop, and your own shade a second behind. Where does each floe carry you before you jump?',
  decor:[{k:'f8-mine',c:39,r:17},{k:'hearth',c:36,r:17},{k:'f8-house',c:3,r:12}],map:refuge.rows()},
 {id:'ff28-streets',name:'Working Streets',exit:'left',study:true,shade:{delay:60},fault:{},hint:'Ice keeps your speed after you let go · the top step cracks behind you',
  question:'Three ice steps and a cracked one, each a jump above the last. How long do you have on each before it carries you off?',
  decor:[{k:'hearth',c:3,r:8}],map:streets.rows()},
 {id:'ff28-shelves',name:'Raised Shelves',exit:'up',study:true,shade:{delay:60},fault:{},hint:'Each shelf carries you toward the thorns · turn in the air, and don’t come back down',
  question:'Each shelf is a jump and a dash above the last, the other way, and your shade climbs behind you. Which way do you jump as you land?',
  decor:[{k:'f8-icicles-long',c:29,r:1},{k:'f8-icicles',c:17,r:1}],map:shelves.rows()},
 {id:'ff28-hearth',name:'Workers’ Hearth',exit:'left',side:'up',study:true,shade:{delay:60},fault:{},hint:'Cracked stone holds you for a moment; ice never does · a crystal gives the dash back in the air',
  question:'A floe, a cracked stone and a crystal over the drop. Where does each one hand you on?',
  people:[{who:'neighbour',c:33,r:17,face:-1,quest:'winter-echo',line:'The stove went cold the day after. I kept the cup on the sill anyway.',lineDone:'You climbed it. The last step too.',name:'THE NEIGHBOUR’S ECHO'}],
  decor:[{k:'hearth',c:35,r:17},{k:'f8-cottage',c:29,r:17}],map:hearth.rows()},
 {id:'ff28-works',name:'Thermal Works',exit:'left',study:true,shade:{delay:60},hint:'Warm air lifts you while you are in it · a jump spent inside it keeps its height on top of the ride',
  question:'Neither draft reaches high enough on its own, and the floe between them will not wait. When do you jump?',
  decor:[{k:'f8-pipes',c:38,r:17},{k:'f8-icicles',c:11,r:1}],
  winds:[{c:26,r:13,w:3,h:8,dx:0,dy:-240},{c:13,r:11,w:3,h:10,dx:0,dy:-240}],map:works.rows()},
 {id:'ff28-court',name:'Thawed Court',exit:'left',study:true,shade:{delay:40},hint:'Touch a frost feather in the air to carry one more jump · it melts when you land',
  question:'A quill on the way up, a floe no jump reaches, another quill off it. When do you spend each?',
  decor:[{k:'f8-memory',c:37,r:17},{k:'f8-house',c:2,r:12}],map:court.rows()},
 {id:'ff28-rehearsal',name:'The Rehearsal',exit:'left',study:true,shade:{delay:60},fault:{},hint:'Press jump again in the air to spend the feather · cracked stone will not wait for the next',
  question:'The gallery is higher than a jump and a dash. What do you pick up on the way, and where do you spend it?',
  decor:[{k:'f8-icicles',c:27,r:1},{k:'hearth',c:6,r:7}],map:reh.rows()},
 {id:'ff28-stair',name:'Frozen Stair',exit:'left',study:true,shade:{delay:60},fault:{},hint:'You carry one feather at a time: spend it, and the next one will take you',
  question:'The stair turns back on itself and the landing cracks. When do you spend the first quill, and where does the second leave you?',
  decor:[{k:'f8-house',c:9,r:4}],map:stair.rows()},
 {...{"id":"ff28-galleries","shade":{"delay":30},"study":true,"fault":{},"name":"Exposed Galleries","exit":"left","hint":"Landing melts the feather, even on ice you can’t stand on · a hearth keeps your place","question":"The icicles hang between the dry gallery and the last feather. Which way round do you go, and what do you still hold when you get there?","hearths":[{"c":36,"r":17},{"c":18,"r":10}]},
  map:[
   "########################################",
   ".........<IIII>.......................<#",
   ".........<IIII>.......................<#",
   ".........<IIII>.......................<#",
   ".........<IIII>.......................<#",
   "######>..<IIII>.......................<#",
   "######>..<IIII>.......................<#",
   "######>..<IIII>.......................<#",
   "######>..<IIII>.......................<#",
   "######>.f.vvvv........................<#",
   "######>...............................<#",
   "######>.........####..................<#",
   "######>........<####>..f..............<#",
   "######>........<####>.................<#",
   "######>........<####>.................<#",
   "######>.IIIII..<####>.................<#",
   "######>........<####>....IIIIII........#",
   "######>........<####>...............P..#",
   "######>........<####>.............######",
   "######>........<####>.............######",
   "######>........<####>.............######",
   "######^^^^^^^^^^####^^^^^^^^^^^^^^######",
   "########################################"]},
 {...{"id":"ff28-landings","shade":{"delay":60},"study":true,"fault":{},"name":"The Twenty Landings","exit":"left","hint":"Cracked stone gives the dash back before it falls · a crystal gives it back in the air","question":"A feather, a cracked landing, a crystal and a sliver of ice. What do you spend at each one?"},
  map:[
   ".#######################################",
   "......................................<#",
   "......................................<#",
   "......................................<#",
   "######>...............................<#",
   "######>...............................<#",
   "######>...............................<#",
   "######>...............................<#",
   "######>..........o....................<#",
   "######>..II..............TTT..........<#",
   "######>...............................<#",
   "######>...............................<#",
   "######>...............................<#",
   "######>........................f......<#",
   "######>...............................<#",
   "######>...............................<#",
   "######>................................#",
   "######>.............................P..#",
   "######>...........................######",
   "######>...........................######",
   "######>...........................######",
   "######^^^^^^^^^^^^^^^^^^^^^^^^^^^^######",
   "########################################"]},
 {...{"id":"ff28-engine","shade":{"delay":50},"study":true,"fault":{},"name":"Muster Engine","exit":"left","hint":"A jump spent inside warm air keeps all its height on top of the ride","question":"The draft lets you go well short of the gallery. What is waiting at the top of it?","decor":[{"k":"f8-engine","c":11,"r":2},{"k":"f8-flue","c":36,"r":17}],"winds":[{"c":24,"r":8,"w":4,"h":13,"dx":0,"dy":-240}]},
  map:[
   ".#######################################",
   "......................................<#",
   "......................................<#",
   "################>.....................<#",
   "################>.....................<#",
   "################>.....................<#",
   "################>.....................<#",
   "#............###>.........f...........<#",
   "#............###>.....................<#",
   "#............###>.....................<#",
   "#............###>.....................<#",
   "#............###>.....................<#",
   "#............###>.....................<#",
   "#............###>.....................<#",
   "#............###>.....................<#",
   "#............###>.....................<#",
   "#............###>......................#",
   "#............###>...................P..#",
   "#............###>..............#########",
   "#............###>..............#########",
   "#............###>..............#########",
   "#^^^^^^^^^^^^###^^^^^^^^^^^^^^^#########",
   "########################################"]},
 {...{"id":"ff28-crown","shade":{"delay":36,"count":2,"gap":30},"study":true,"fault":{},"name":"Muster Crown","exit":"up","hint":"Everything the mountain has taught, in one climb","question":"Ice, a draft, a feather and cracked stone. What must you still hold when each one hands you on?","hearths":[{"c":36,"r":17},{"c":16,"r":8}],"decor":[{"k":"f8-bell","c":4,"r":1}],"winds":[{"c":23,"r":4,"w":4,"h":11,"dx":0,"dy":-240}]},
  map:[
   "##.....#################################",
   "#>....................................<#",
   "#>....................................<#",
   "#>....................................<#",
   "#>...................f................<#",
   "#>....................................<#",
   "#>......TTT...........................<#",
   "#>....................................<#",
   "#>....................................<#",
   "#>.....^^^^^..#####...................<#",
   "#>.....#####.<#####>..................<#",
   "#>...........<#####>..................<#",
   "#>...........<#####>..................<#",
   "#>...........<#####>..................<#",
   "#>...........<#####>..................<#",
   "#>...........<#####>.......IIIII......<#",
   "#>...........<#####>...................#",
   "#>...........<#####>................P..#",
   "#>...........<#####>..^^^^^^^^^^^^######",
   "#>...........<#####>..##################",
   "#>...........<#####>..##################",
   "#.^^^^^^^^^^^^#####^^^^^^^^^^^^^^^######",
   "########################################"]}
];

const quests=[
 {...{"id":"winter-echo","title":"The Blue Cup","giver":"The neighbour’s echo","from":"ff28-hearth","back":{"c":34,"r":17},"keepsake":{"id":"winter-remembered","name":"The neighbour, remembered","gives":"Her blue cup stayed on the sill, and someone always stopped for it. Shown at the end."},"needs":"winter-stove"},rooms:[
  {id:'ff28-q-steps',name:'The Dreadful Steps',exit:'up',study:true,shade:{delay:50,count:2,gap:30},fault:{},hint:'Every step is a jump and a dash above the last · two shades climb behind you · the last step cracks',
   question:'Three steps up the shaft, each the other way and none made for standing. Where is your dash when you leave each one?',
   decor:[{k:'f8-icicles',c:20,r:2}],map:qsteps.rows()},
  {id:'ff28-q-shelter',name:'The Upper Shelter',exit:'down',study:true,shade:{delay:26,count:2,gap:24},fault:{},hint:'The flue lifts you, not far · the coal shelf is ice · two shades close behind you',
   question:'The coal is at the end of an ice shelf above a short flue, and the hatch is far below past two thorned bars. Which way does each cracked perch send you, with two shades this close?',
   decor:[{k:'f8-flue',c:37,r:17},{k:'f8-coal',c:32,r:5},{k:'f8-chair',c:32,r:17}],winds:[{c:34,r:9,w:3,h:9,dx:0,dy:-240}],
   people:[{who:'neighbour',name:'THE NEIGHBOUR’S ECHO',c:30,r:5,quest:'winter-echo',line:'That’s the warmth I remember. Not the coal.',lineDone:'Sit a minute. Then go on.'}],map:qshelter.rows()}]}
];

export default {...R,rooms,quests};
