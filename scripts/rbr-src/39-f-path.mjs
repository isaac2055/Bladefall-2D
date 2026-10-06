// Room by Room · 39. The Fractured Path (7.280 rebuild, hand-made over the 7.278 reflection). Source for
// public/bladefall-rbr-39-f-path.js (node scripts/rbr-src/gen.mjs 39). docs/plans/fractured-hard.md, stage V:
// the Path's sunlight, louvres and engine with everything the act has taught, back to back. Exit right.
import {grid} from './build.mjs';
const shell=()=>grid().frame();
// 7.280 (resume 4): a cracking stone over a down-thorn row (a lane's floor over the lane below) left a hole you fell
// through unharmed, onto the lane below: a free rest. The thorn under every cracking stone now points up, so the hole is
// real void, as everywhere else.
const voidUnder=rows=>rows.map((row,r)=>r>0?[...row].map((ch,c)=>ch==='v'&&rows[r-1][c]==='T'?'^':ch).join(''):row);
const r=(id,name,hint,question,m,extra={})=>({id:'fp39-'+id,name,hint,question,map:voidUnder(m.rows()),...extra});
const pit=(m,c0,c1)=>m.rect(c0,21,c1,21,'^').rect(c0,22,c1,22,'#');
const roof=(m,r1)=>m.rect(1,1,38,r1,'#');
// Three lanes, joined by tears at alternate ends (as the Colony's): low lane right, climb the right wall, middle lane left,
// climb the left wall, high lane right to the door. Perches: L1 row 20 (stand 19), L2 row 12 (stand 11), L3 row 5.
const lanes=()=>{const m=shell();
 m.rect(1,20,3,21,'#').put(2,19,'P').rect(4,21,34,21,'^').rect(35,20,38,21,'#');
 m.rect(1,12,36,12,'^').rect(1,13,38,13,'v').rect(37,12,38,12,'#').rect(1,12,4,12,'#');
 m.rect(4,5,38,5,'^').rect(4,6,38,6,'v').rect(1,5,3,5,'#').rect(1,6,3,6,'v').rect(39,1,39,4,'.');
 return m;};
// The lanes are joined by tears: up out of the low lane onto the middle lane's ledge, up out of the middle lane onto
// the high lane's ledge (each set down).
const laneLines=[{a:[33,18],b:[38,11],setDown:true},{a:[6,11],b:[3,4],setDown:true}];
// A window in a lane's roof with its louvre (L1: emitter row 13, louvre row 14; L2: emitter row 6, louvre row 7, and
// rock under it at rows 12-13 so its light stops in its own lane).
const win1=(m,c)=>m.put(c,14,'X');
const win2=(m,c)=>m.put(c,7,'X').put(c,12,'#').put(c,13,'#');

// Sun Window: three lines of sun through three louvres on their own beats, cracking perches between, your shade
// a second behind: you cannot wait a louvre out.
const windows=shell().rect(0,19,5,22,'#').put(2,18,'P').rect(34,19,39,22,'#').rect(39,15,39,18,'.');
roof(windows,8);pit(windows,6,33);
windows.rect(11,10,13,10,'X').rect(21,10,23,10,'X').rect(30,10,32,10,'X').rect(7,17,9,17,'T').rect(7,18,9,18,'^')
 .rect(16,14,18,14,'T').rect(16,15,18,15,'^').rect(25,17,28,17,'T').rect(25,18,28,18,'^');

// Switchback Engine: three lanes of machinery and nothing else to stand on. Every dash turns it over: gold stands
// while cyan is gone and the other way about. A cyan lintel shades the low lane's window only while cyan stands.
const engine=lanes();
engine.rect(8,20,10,20,'A').rect(15,18,17,18,'B').rect(23,20,25,20,'A').rect(30,18,32,18,'B').put(20,14,'B')
 .rect(27,12,29,12,'B').rect(20,11,22,11,'A').rect(12,12,14,12,'B').rect(12,5,14,5,'A').rect(20,5,22,5,'B').rect(28,5,30,5,'A');

// Low Light: three lanes, each under a roof of thorns a hand over your head, so nothing but low long jumps crosses:
// off cracking stone and onto the engine (every low long jump is a dash, so it turns the engine over: count), the
// tears between the lanes, and the glass in the high lane, where left is right to the door. Your shade behind.
const low=lanes();
low.rect(4,15,31,15,'v').rect(9,20,11,20,'T').rect(17,20,19,20,'B').rect(25,20,27,20,'A')
 .rect(8,7,35,7,'v').rect(26,12,28,12,'T').rect(18,12,20,12,'A').rect(10,12,12,12,'T')
 .rect(12,5,14,5,'T').rect(20,5,22,5,'B').rect(30,1,30,4,'|');

// The Beat (7.280 resume 4, rebuilt as three lanes): a window in every lane lets the sun through on its beat. Low: a
// cracking stone, the engine under the first window, the glass (left is right from there), the second window.
// Middle: the engine under a window, a cracking stone. High: through the glass again, the engine, the last stones.
// Every dash turns the engine over, the tears' too, and your shade is behind you: no beat can be waited out.
const beat=lanes();
win1(beat,14);win1(beat,27);win2(beat,24);
beat.rect(8,20,10,20,'T').rect(13,20,15,20,'A').rect(20,14,20,20,'|').rect(25,20,28,20,'B')
 .rect(28,12,30,12,'T').rect(17,12,19,12,'A').rect(10,12,12,12,'T')
 .rect(9,5,11,5,'T').rect(15,1,15,4,'|').rect(19,5,21,5,'B').rect(27,5,29,5,'T');

// Line of Sun: a thorn curtain only the tear crosses, the far mouth under a louvred window; a cracking perch and a
// second louvre on the way to the gate.
const line=shell().rect(0,17,4,22,'#').put(2,16,'P').rect(35,17,39,22,'#').rect(39,13,39,16,'.');
roof(line,6);pit(line,5,34);
line.rect(13,7,13,20,'<').rect(21,8,23,8,'X').rect(17,15,20,15,'T').rect(17,16,20,16,'^').rect(29,8,31,8,'X').rect(26,13,28,13,'T').rect(26,14,28,14,'^');

// Panes: through the glass left is right, and every dash through glass turns the engine over too.
const panes=shell().rect(0,18,4,22,'#').put(2,17,'P').rect(35,18,39,22,'#').rect(39,14,39,17,'.');
roof(panes,6);pit(panes,5,34);
panes.rect(8,15,10,15,'A').rect(13,7,13,20,'|').rect(16,13,18,13,'B').rect(27,7,27,20,'|').rect(30,14,32,14,'T').rect(30,15,32,15,'^');
// 7.280 (resume 4): between the panes a thorn curtain only the tear crosses (entered while left is right), set down on
// a cracking perch before the second pane.
panes.rect(20,7,20,20,'<').rect(22,13,24,13,'T').rect(22,14,24,14,'^');

// The Shade: three lanes, two of your shades behind and a louvred window in each lower lane's roof. Nothing can be
// waited out.
const shade=lanes();
win1(shade,15);win1(shade,27);win2(shade,22);win2(shade,10);
shade.rect(9,20,11,20,'T').rect(20,20,22,20,'T').rect(29,20,31,20,'T').rect(25,12,28,12,'T').rect(13,12,16,12,'T').rect(12,5,14,5,'T').rect(23,5,26,5,'T');

// The Engine Road: three lanes of machinery that turns over with every dash, and the pit is too long for anything but
// dashes. A cyan lintel shades a window only while cyan stands.
const road=lanes();
road.rect(9,20,11,20,'A').rect(17,19,19,19,'B').rect(25,20,27,20,'A').rect(14,14,14,14,'A').rect(30,14,30,14,'B')
 .rect(26,12,28,12,'B').rect(18,12,20,12,'A').rect(9,12,11,12,'B').rect(13,5,15,5,'A').rect(21,5,23,5,'B').rect(29,5,31,5,'A').rect(24,7,24,7,'B').rect(24,12,24,13,'#');

// Glass in the Sun: a fixed glass throws the window's light along the road at head height. Under it a down dash
// landed off the cracking ledge and jumped, then the engine and cracking stones in turn (every dash turns the engine
// over), and a pane before the gate: through it left is right. Your shade behind.
const glass=shell().rect(0,15,4,22,'#').put(2,14,'P').rect(35,19,39,22,'#').rect(39,15,39,18,'.');
roof(glass,4);pit(glass,5,34);
glass.put(10,15,'\\').rect(10,5,10,14,'.').rect(14,19,15,19,'T').rect(14,20,15,20,'^').rect(21,19,22,19,'A').rect(27,19,28,19,'T').rect(27,20,28,20,'^').rect(31,16,31,18,'|');

// The Sun Gate: three lanes, each of the Path's machines in turn: a louvre and a tear over a thorn curtain in the
// low lane, the engine in the middle, a pane and a super in the high lane. Your shade the whole way.
const gate=lanes();
win1(gate,10);gate.rect(16,14,16,20,'<').rect(19,20,21,20,'T').rect(28,20,30,20,'T')
 .rect(27,12,29,12,'B').rect(19,12,21,12,'A').rect(11,12,13,12,'B').rect(13,1,13,4,'|').rect(16,5,21,5,'T').rect(33,5,34,5,'T');

// Echo · The Cargo Sling: the sling carries the sack up to the dock, but a thorn curtain stands across its road: step
// off onto the cracking perch, swing over the curtain from the ring, and be on the cracking stone by the dock when the
// sack arrives. Your shade follows.
const qsling=shell().rect(36,1,36,9,'G').rect(31,10,38,22,'#').rect(39,6,39,9,'.').rect(30,10,30,20,'<').put(19,9,'O').put(3,17,'P').rect(1,18,8,22,'#');
pit(qsling,9,29);
qsling.rect(13,13,15,13,'T').rect(13,14,15,14,'^').rect(24,6,26,6,'T').rect(24,7,26,7,'^').rect(21,7,21,16,'<');
// Echo · The Summit Bench: three lanes of engine and glass. Every dash turns the engine over, the tears' too; through
// the low lane's glass left is right until the high lane's glass; cracking stones to the bench. Your shade behind.
const qbench=lanes();
qbench.rect(9,20,11,20,'A').rect(17,20,19,20,'B').rect(25,20,27,20,'T').rect(30,14,30,20,'|')
 .rect(26,12,28,12,'B').rect(18,12,20,12,'A').rect(10,12,12,12,'B')
 .rect(14,1,14,4,'|').rect(18,5,20,5,'T').rect(26,5,28,5,'T').rect(33,5,38,5,'#').put(36,4,'*')
 // 7.280 (resume 4): thorn curtains in the low and high lanes, crossed only by tears, and two shades: the echo stays
 // the Path's hardest.
 .rect(22,14,22,20,'<').rect(23,1,23,4,'<');

const meta={"n":39,"name":"The Fractured Path","kit":["dash","strike","parry","portal"],"folk":{"pilgrim":{"cloak":"#b0a285","trim":"#e0cea2","skin":"#c8aa87","hood":true}},"props":{"pilgrim-sack":[[0,-9,7,9,"#8e7955"],[2,-11,3,3,"#b7a171"]],"pilgrim-sack@humility-medal":[[0,-7,11,2,"#a38660"],[1,-5,2,5,"#746044"],[9,-5,2,5,"#746044"],[3,-9,6,2,"#d1b371"],[4,-13,5,4,"#777d78"]]},"blurb":"The Path to the Palace, walked the other way.","outro":"The last mirror. Sunspire is ahead, its shutters closed."};
const pilgrim={"id":"fp39-pilgrim","name":"The Lower Rest","hint":"The cargo sling reaches the optional summit bench","question":"Will you take the sack up the side climb?","map":["##.....#################################","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#......................................#","#.......................................","#.......................................","#.......................................","#.......................................","#..P....................................","####################^^^^^###############","########################################","########################################","########################################","########################################"],"side":"up","people":[{"who":"pilgrim","name":"THE PILGRIM’S ECHO","c":8,"r":17,"quest":"pilgrim-echo","line":"I left the medals somewhere. Not all of them.","lineDone":"Send the sack up. Don’t open it. Fine, open it."}],"decor":[{"k":"pilgrim-sack","c":11,"r":17}]};
const rooms=[
 r('windows','Sun Window','Closed louvres stop the sun · the stones crack · your shade will not let you wait a louvre out','Three louvres on three beats and a shade a second behind you. When must you leave the step?',windows,
  {study:true,fault:{spread:4},shade:{delay:60},beams:[{c:12,r:9,dir:'d'},{c:22,r:9,dir:'d'},{c:31,r:9,dir:'d'}],shutters:[{open:60,shut:60,offset:0},{open:60,shut:60,offset:40},{open:60,shut:60,offset:80}]}),
 r('engine','Switchback Engine','Every dash turns the machinery over · gold stands while cyan is gone · the lintel shades the window','Each dash takes away the stone you are standing on. Where must the next one be?',engine,
  {study:true,shade:{delay:60},beams:[{c:20,r:13,dir:'d'}],lines:laneLines}),
 r('low','Low Light','Thorn roofs over every lane: only low long jumps cross · every dash turns the engine · glass swaps you','Under a roof you cannot jump into, which stone will be standing when you land, three lanes running?',low,
  {study:true,fault:{spread:4},mirror:{},shade:{delay:45},lines:laneLines}),
 pilgrim,
 r('beat','The Beat','A window in every lane opens on its beat · every dash turns the engine · the glass swaps you','A window in every lane, each on its own beat. Which is shut as you pass, and which stone stands?',beat,
  {study:true,fault:{spread:4},mirror:{},shade:{delay:45},beams:[{c:24,r:6,dir:'d'},{c:14,r:13,dir:'d'},{c:27,r:13,dir:'d'}],shutters:[{open:50,shut:70,offset:0},{open:50,shut:70,offset:20},{open:50,shut:70,offset:60}],lines:laneLines}),
 r('line','Line of Sun','Only the tear crosses the curtain · the louvres decide when the far mouth is safe','The tear sets you down under a window. When is the window shut?',line,
  {study:true,fault:{spread:4},beams:[{c:22,r:7,dir:'d'},{c:30,r:7,dir:'d'}],shutters:[{open:50,shut:70,offset:0},{open:50,shut:70,offset:60}],lines:[{a:[6,15],b:[18,14],setDown:true}]}),
 r('panes','Panes','Through the glass left is right · every dash turns the engine · only the tear crosses the curtain','Two panes, two engines and one dash each time. Which way do you press, and which stone will be there?',panes,
  {study:true,fault:{spread:4},mirror:{},shade:{delay:45},lines:[{a:[18,12],b:[23,12],setDown:true}]}),
 r('shade','The Shade','Two of your shades behind, three louvres ahead · nothing can be waited out','Your shades are behind you and the louvres are ahead. Where must you be when each one shuts?',shade,
  {study:true,fault:{spread:4},shade:{delay:60,count:2,gap:35},beams:[{c:15,r:13,dir:'d'},{c:27,r:13,dir:'d'},{c:22,r:6,dir:'d'},{c:10,r:6,dir:'d'}],shutters:[{open:50,shut:60,offset:0},{open:50,shut:60,offset:30},{open:50,shut:60,offset:60},{open:50,shut:60,offset:90}],lines:laneLines}),
 r('road','The Engine Road','Every dash turns the engine · a low long jump is a dash too · keep count','Every dash turns the engine and the pit is too long for anything but dashes. Which dash shades which window?',road,
  {study:true,shade:{delay:45},beams:[{c:14,r:13,dir:'d'},{c:30,r:13,dir:'d'},{c:24,r:6,dir:'d'}],lines:laneLines}),
 r('glass','Glass in the Sun','The light runs at head height: a down dash landed and jumped · the engine turns · the pane swaps you','The light lies along the road at head height. How do you cross without rising into it, and which stone stands?',glass,
  {study:true,fault:{spread:4},mirror:{},shade:{delay:45},beams:[{c:10,r:5,dir:'d'}]}),
 r('gate','The Sun Gate','A louvre, the engine, a tear and a super, each once','Each of the Path’s machines once. In what order do they want you?',gate,
  {study:true,fault:{spread:4},mirror:{},shade:{delay:45},beams:[{c:10,r:13,dir:'d'}],shutters:[{open:50,shut:70,offset:0}],lines:[...laneLines,{a:[12,19],b:[20,19],setDown:true}]}),
];
const quests=[{...{"id":"pilgrim-echo","title":"Travelling Lighter","giver":"The pilgrim’s echo","from":"fp39-pilgrim","back":{"c":5,"r":17},"keepsake":{"id":"pilgrim-remembered","name":"The Pilgrim, remembered","gives":"The Pilgrim kept one medal, the useful one. Shown at the end."},"needs":"humility-medal"},rooms:[
 r('q-sling','The Cargo Sling','The sling carries the sack past a curtain you cannot ride through · swing over · meet it at the dock','How will you reach the dock while the load rises, with your shade behind you?',qsling,
  {study:true,fault:{spread:4},shade:{delay:60},decks:[{c:9,r:17,w:4,to:[16,-8],period:300}],cargoDock:{c:25,r:9}}),
 r('q-bench','The Summit Bench','Every dash turns the engine, a tear too · left is right from glass to glass · two shades behind','Every dash turns the engine and the glass turns you round. Which stone stands, and which way is forward?',qbench,
  {study:true,fault:{spread:4},mirror:{},shade:{delay:45,count:2,gap:30},lines:[...laneLines,{a:[19,19],b:[26,19],setDown:true},{a:[20,4],b:[27,4],setDown:true}],
   decor:[{"k":"pilgrim-sack","c":34,"r":4}],people:[{"who":"pilgrim","name":"THE PILGRIM’S ECHO","c":35,"r":4,"quest":"pilgrim-echo","line":"One medal. It holds the pot steady.","lineDone":"That is the right weight to carry."}]})
]}];
export default {...meta,note:'7.280: rebuilt for the Fractured ramp (stage V).',rooms,quests};
