// Room by Room · 7. The Warden (the Gaol). Source for public/bladefall-rbr-07-gaol.js (node scripts/rbr-src/gen.mjs 07).
// The base game's six rooms (Eastern Crown, Blind Gallery, Hush Engine, Turning Cells, Red Court, Sentence Well) as
// thirteen screens, travelled as the base game travels them: in high in the east, then west and down to the well.
// Kit: everything granted so far (dash, blade, parry, portal). The device is the Gaol module's (bladefall-pcore-dev-gaol.js):
// jailers, which commit to a facing, guard the side they face, turn slowly and hold the gates while they stand, and
// pressure pods, which throw you back the way you dashed and give the dash back. In order:
//   the jailer seen (Eastern Crown: one stands its post in a barred cell over the way out)
//   → alone: get behind it (Blind Gallery: it faces you over thorns; jump it and cut its back before it turns)
//   → the parry that drops its shield (The Gallery Door: in a doorway under a lintel, no way over or round)
//   → the pod alone (Hush Engine: down into it is up; the top floor is out of any jump and dash)
//   → pods chained (The Bellows: the second pod is above where the first throws you)
//   → combined: a pod up to a cell's roof hatch and down behind its jailer (Turning Cells); a portal into a sealed
//     cell's back wall, its stone reached by a pod (The Back Cell); a pod up between two jailers back to back, the
//     quick one first (Two Cells); a pod onto a jailer's own lip and the parry there (Gaol Vigil)
//   → synthesis (Red Court: two pods, the second taken diagonally, in behind the balcony's jailer, then down the
//     stair in front of the other and through the trapdoor)
//   → the Warden, three rooms (The Well Mouth, Sentence Well, The Sentence).
// The Warden is new code, public/bladefall-pcore-dev-rbr-gaol.js (+ -view.js): a tall shielded jailer whose rush is
// committed. Whatever meets the rush head-on gives it back (an armed pod, or the parry); returned, he crashes into
// the wall behind him and only then can the blade wound him. The Well Mouth: bait the rush from the floor, get up out
// of its line onto the gallery, and the pod in the far wall returns it. Sentence Well: no pod and no gallery, so the
// parry. The Sentence: three wounds; he rises facing you each time. In The Sentence (7.277, opt-in fields) he also throws
// you clear with his shield as he rises (shove), throws his key chain at a knight up out of his line (chain), and at his
// first wound calls a jailer down from the roof (call), which hides you from him and holds the gate; his own rush
// flattens it (hop over it so he sees you). He leaves the first two rooms through his
// trapdoor (you follow him down) and kneels in the third. Rooms with him wait for the first input (study).
// People: Vey keeps the Warden's keys by the vigil fire with Enna, who will not look down the well (Gaol Vigil);
// the Service Keeper at his door in Turning Cells.
// Quest (optional, branch): The Service Keeper · Stand Aside, up his service ladder from Turning Cells: The Jammed
// Latch (two pods, the second sends you up and east onto the latch ledge behind its jailer; the latch is a stake and
// the hatch needs both) and The Service Catwalk (a pod up to the catwalk's end, a jailer under the low roof that only
// the parry answers, the drop to the last pod, the second jailer on the alcove's lip, and his parcel on the shelf).
// The keepsake (his lunch) leaves the service door on the latch, with the parcel open on the step (g7-door@keeper-lunch).
// A cut that fells a jailer throws you back like a seed pod and gives the dash back: on a lip, the dash brings you home.
// SKIPS (node scripts/rbr-skip.mjs <room> --without <event> --plain): see the end of this header.
import {grid} from './build.mjs';

// 1 · Eastern Crown — arrival on the crown's tower, high in the east; the gaol goes down and west. A jailer stands its
// post in a barred cell over the way out. Seen, not needed.
const crown=grid().frame();
crown.rect(0,18,39,22,'#').rect(31,7,39,22,'#').rect(26,18,30,18,'^').rect(19,12,25,22,'#')
 .rect(0,7,8,14,'#').rect(1,9,6,11,'.').rect(7,9,7,11,'G').rect(0,15,0,17,'.').put(35,6,'P');

// 2 · Blind Gallery — one jailer, alone, facing the way you come, over thorns. Its back is to the gate.
const gallery=grid().frame();
gallery.rect(0,18,39,22,'#').rect(17,13,39,22,'#').rect(11,18,16,18,'^').rect(3,1,3,17,'G').rect(0,14,0,17,'.').put(36,12,'P');

// 3 · The Gallery Door — a jailer in the doorway under a thick lintel, the cell hall behind it. No way over, no way round.
const door=grid().frame();
door.rect(0,18,39,22,'#').rect(17,1,20,14,'#').rect(4,1,4,17,'G').rect(0,14,0,17,'.').put(35,17,'P');

// 4 · Hush Engine — the pressure pod alone. The top floor is out of any jump and dash, and its face is thorned.
const engine=grid().frame();
engine.rect(0,18,39,22,'#').rect(0,8,12,22,'#').rect(13,9,13,17,'>').rect(38,1,38,15,'<').put(16,14,'R').rect(0,4,0,7,'.').put(35,17,'P');

// 5 · The Bellows — two pods, one over the other. Each gives the dash back; the second is above where the first throws you.
const bellows=grid().frame();
bellows.rect(0,18,39,22,'#').rect(1,4,8,4,'#').rect(0,1,0,3,'.').rect(1,5,1,17,'>')
 .put(17,15,'R').put(15,10,'R').put(34,17,'P');

// 6 · Turning Cells — a jailer guards the cell door from inside; the cell is sealed in front. Its roof has a hatch
// behind it, and the roof is higher than a jump and a dash. The Keeper's service ladder goes up the east wall (the quest).
const cells=grid().frame();
cells.rect(0,18,39,22,'#').rect(0,9,15,14,'#').rect(15,15,15,17,'#').rect(16,9,16,17,'>').rect(6,9,7,14,'.')
 .rect(2,15,2,17,'G').rect(0,15,0,17,'.').put(18,14,'R').rect(34,0,37,0,'.').rect(33,9,38,9,'=').put(36,17,'P');

// 7 · The Back Cell — the cell has no door at all, only a portal held open in its back wall. Yours goes where you
// can walk into it.
const back=grid().frame();
back.rect(0,18,39,22,'#').rect(0,11,14,13,'#').rect(13,14,14,17,'#').rect(0,15,0,16,'%').rect(9,18,11,18,'G').rect(9,19,11,22,'.')
 .rect(24,1,25,17,'#').rect(25,6,25,7,'%').rect(26,8,26,17,'<').put(28,14,'R').put(34,17,'P');

// 8 · Two Cells — two jailers back to back on the cell gallery, a hatch between them and a pod under the hatch.
// Between them you are behind both, and one turns much sooner.
const pair=grid().frame();
pair.rect(0,18,39,22,'#').rect(12,9,25,11,'#').rect(17,9,20,11,'.').rect(11,9,11,11,'<').rect(26,9,26,11,'>').rect(12,12,16,12,'v').rect(21,12,25,12,'v')
 .rect(1,9,6,17,'#').rect(7,10,7,17,'>').rect(1,5,1,8,'G').rect(0,5,0,8,'.').put(18,15,'R').put(34,17,'P');

// 9 · Gaol Vigil — Vey keeps the keys by the vigil fire, Enna looks at the wall. Beyond them a jailer on the landing:
// the pod lifts you onto its very lip, face to face, with nothing under you.
const vigil=grid().frame();
vigil.rect(0,18,39,22,'#').rect(0,9,12,22,'#').rect(13,10,13,17,'>').rect(12,9,12,9,'#').rect(0,5,0,8,'.').put(15,14,'R').put(36,17,'P');

// 10 · Red Court — everything the Gaol has taught: two pods up to the court balcony, in behind its jailer, then down
// the stair in front of the second one, and the trapdoor to the well.
const court=grid().frame();
court.rect(0,18,39,22,'#').rect(1,18,30,18,'^').rect(12,8,22,9,'#').rect(23,8,23,9,'>').rect(6,12,11,13,'#').rect(1,14,6,15,'#')
 .rect(3,14,5,14,'G').rect(3,15,5,22,'.').put(30,14,'R').put(32,10,'R').put(36,17,'P');

// The Keeper's errand (quest rooms). The service shaft: a pod over the landing, a second pod that sends you up and
// east, and the latch ledge, where a jailer stands with its back to you. The latch is a stake; the hatch over it opens
// when the latch is thrown and the jailer has fallen.
const shaft=grid().frame();
shaft.rect(0,20,39,22,'#').rect(1,20,24,20,'^').rect(1,1,1,19,'>').rect(38,7,38,19,'<').rect(25,6,38,6,'=')
 .put(27,16,'R').put(24,11,'R').put(37,5,'c').rect(35,0,37,0,'G').put(29,19,'P');
// The service catwalk: up by the pod to the catwalk's end, a jailer under the low roof, then the drop and the last pod
// up to the alcove, where the second jailer stands on the shelf's lip. The parcel is on the shelf.
const catwalk=grid().frame();
catwalk.rect(0,20,39,22,'#').rect(1,20,30,20,'^').rect(8,11,28,11,'#').rect(8,8,24,8,'#').rect(1,6,5,6,'#')
 .put(30,16,'R').put(7,14,'R').put(1,5,'*').rect(0,2,0,5,'.').put(35,19,'P');

// 11 · The Well Mouth — the Warden on his trapdoor, a pod in the far wall at the height of his charge, and a gallery
// over his line. Bait the rush, get out of its line, and the pod gives it back.
const mouth=grid().frame();
mouth.rect(0,18,39,22,'#').rect(1,18,3,18,'G').rect(1,19,3,22,'.').rect(29,15,36,15,'=').rect(38,16,38,17,'R').put(33,14,'P');

// 12 · Sentence Well — no pod and no gallery: only the parry gives his rush back.
const well=grid().frame();
well.rect(0,18,39,22,'#').rect(36,18,38,18,'G').rect(36,19,38,22,'.').put(2,17,'P');

// 13 · The Sentence — three wounds; the pod first, then whatever meets him.
const sentence=grid().frame();
sentence.rect(0,18,39,22,'#').rect(1,13,1,17,'G').rect(0,13,0,17,'.').rect(28,15,35,15,'=').rect(6,15,12,15,'=').rect(38,16,38,17,'R').put(36,17,'P');

// Props: rectangles [dx,dy,w,h,colour] from the tile's left edge and the floor line under it (dy up is negative).
const IRON='#6a6e78',IRONL='#9aa0aa',STONE='#55565e',STONEL='#7a7c86';
const chain=n=>{const r=[];for(let i=0;i<n;i++){r.push([3,-6-i*6,2,5,'#5c5f68']);r.push([3,-6-i*6,1,1,IRONL]);}return r;};
const props={
 // A barred cell front, three tiles high.
 'g7-bars':[[0,-24,14,1,IRONL],[0,-1,14,1,IRONL],[1,-23,1,22,IRON],[4,-23,1,22,IRON],[7,-23,1,22,IRON],[10,-23,1,22,IRON],[13,-23,1,22,IRON]],
 'g7-chain':chain(4),'g7-chain-long':chain(9),
 // The Faceless Relief: carved prisoners look toward the gate; the carved jailer looks away.
 'g7-relief':[[0,-16,20,16,STONE],[0,-16,20,1,STONEL],[1,-15,18,14,'#4a4b52'],
  [3,-11,2,2,STONEL],[3,-9,2,5,STONEL],[4,-11,1,1,'#2a2b30'],[7,-11,2,2,STONEL],[7,-9,2,5,STONEL],[8,-11,1,1,'#2a2b30'],
  [11,-11,2,2,STONEL],[11,-9,2,5,STONEL],[12,-11,1,1,'#2a2b30'],[15,-12,3,3,'#8d929c'],[15,-9,3,6,'#8d929c'],[15,-11,1,1,'#2a2b30']],
 // The engine: a bellows on its frame, and a flywheel.
 'g7-bellows':[[0,-2,16,2,'#3a2e24'],[1,-10,14,8,'#6e4f22'],[1,-10,14,1,'#b0843e'],[3,-9,1,6,'#4a3418'],[7,-9,1,6,'#4a3418'],[11,-9,1,6,'#4a3418'],[14,-12,2,4,'#3a2e24']],
 'g7-wheel':[[2,-16,12,12,'#4a4038'],[4,-18,8,16,'#4a4038'],[0,-14,16,8,'#4a4038'],[5,-13,6,6,'#2a2420'],[7,-11,2,2,'#b0843e'],[7,-17,2,14,'#5a5048'],[1,-11,14,2,'#5a5048']],
 // The service door, bolted, and the Keeper's shelf. With his lunch back the door stands on the latch and the
 // parcel is open on the step.
 'g7-door':[[0,-22,11,22,'#2e2a26'],[0,-22,11,1,'#6a6258'],[1,-21,9,21,'#4a443e'],[3,-18,5,1,'#3a3530'],[3,-10,5,1,'#3a3530'],[8,-12,3,1,IRONL],[9,-13,1,3,IRON]],
 'g7-door@keeper-lunch':[[0,-22,11,22,'#2e2a26'],[0,-22,11,1,'#6a6258'],[1,-21,4,21,'#4a443e'],[5,-21,5,21,'#121316'],[12,-3,6,3,'#b08a5a'],[12,-3,6,1,'#d0aa78'],[14,-3,1,3,'#7a5a3a'],[19,-3,2,3,'#d8d2c0']],
 'g7-shelf':[[0,-12,10,1,'#5a4632'],[1,-11,1,3,'#3a2e22'],[8,-11,1,3,'#3a2e22'],[2,-15,2,3,'#d8d2c0'],[5,-14,3,2,'#8a6a40']],
 // Vey's standard, furled and leaning; the gaol's keys on their hook.
 'g7-standard':[[2,-26,1,26,'#5a4a3a'],[3,-25,4,12,'#7a1f2e'],[3,-14,3,2,'#4a0f1c'],[1,-27,3,1,'#e8c87a']],
 'g7-keys':[[3,-16,1,4,IRON],[1,-12,5,1,'#d6b25a'],[1,-8,5,1,'#d6b25a'],[1,-12,1,4,'#d6b25a'],[5,-12,1,4,'#d6b25a'],[6,-10,3,1,'#d6b25a'],[8,-10,1,2,'#d6b25a']],
 // The mine road to Frostfell: a timber frame over the court's west gate, and the rails running in.
 'g7-mine':[[16,-42,2,42,'#5a4632'],[0,-44,19,3,'#6e5838'],[0,-41,18,1,'#3a2e22'],[19,-2,10,1,'#8a8e98'],[19,-4,10,1,'#5a4632'],[21,-5,1,3,'#5a4632'],[26,-5,1,3,'#5a4632']],
};

export default {
 n:7,name:'The Warden',kit:['dash','strike','parry','portal'],
 folk:{
  keeper:{cloak:'#4a4f5c',trim:'#acb3c2',skin:'#cfa98a',cap:true},
  enna:{cloak:'#5e4a58',trim:'#d8b7df',skin:'#d6b494',hood:true},
 },
 props,
 blurb:'The Gaol, from the eastern crown down to the Sentence Well. Jailers commit to the way they face; the engine’s pods give back more than you put in; the Warden’s rush is his own undoing.',
 outro:'The Gaol, crown to well. The Warden kneels by his trapdoor with his shield on the floor, and the mine road to Frostfell is open.',
 note:'Jailers and pressure pods (bladefall-pcore-dev-gaol.js); the Warden needs bladefall-pcore-dev-rbr-gaol.js. See the header of scripts/rbr-src/07-gaol.mjs.',
 rooms:[
  {id:'g7-crown',name:'Eastern Crown',exit:'left',hint:'A jailer holds the gaol’s gates shut while it stands',question:'The gaol is below the crown. Where does the drop off the tower land you?',
   jailers:[{x:2,y:11,dir:1}],decor:[{k:'g7-relief',c:21,r:11},{k:'g7-chain',c:14,r:3},{k:'g7-chain-long',c:28,r:6}],map:crown.rows()},
  {id:'g7-gallery',name:'Blind Gallery',exit:'left',hint:'A jailer’s shield covers the way it faces · its back is bare',question:'The jailer faces you over thorns. Where is it not looking?',
   jailers:[{x:10,y:17,dir:1}],decor:[{k:'g7-relief',c:28,r:12},{k:'g7-chain-long',c:7,r:6},{k:'g7-chain',c:22,r:3},{k:'g7-chain',c:33,r:3}],map:gallery.rows()},
  {id:'g7-door',name:'The Gallery Door',exit:'left',hint:'Parry a jailer’s thrust and its shield comes down',question:'No way over it and no way round. When does the shield come down?',
   jailers:[{x:19,y:17,dir:1}],decor:[{k:'g7-bars',c:7,r:17},{k:'g7-bars',c:12,r:17},{k:'g7-chain-long',c:10,r:6},{k:'g7-chain',c:28,r:3}],map:door.rows()},
  {id:'g7-engine',name:'Hush Engine',exit:'left',hint:'Dash into a pressure pod and it throws you back the way you came, with your dash',question:'The top floor is out of reach of any jump and dash. What gives back more than you put in?',
   decor:[{k:'g7-wheel',c:27,r:17},{k:'g7-bellows',c:31,r:17},{k:'g7-chain-long',c:22,r:6}],map:engine.rows()},
  {id:'g7-bellows',name:'The Bellows',exit:'left',hint:'A pod gives your dash back · the next pod is above where the last one throws you',question:'One pod is not enough for the top. Where does the first one put you?',
   decor:[{k:'g7-bellows',c:24,r:17},{k:'g7-wheel',c:31,r:17},{k:'g7-chain',c:20,r:3},{k:'g7-chain-long',c:30,r:6}],map:bellows.rows()},
  {id:'g7-cells',name:'Turning Cells',exit:'left',side:'up',hint:'A jailer turns to face you a moment after you get behind it',question:'The cell is sealed in front. Where is its other way in, and how do you get up to it?',
   jailers:[{x:12,y:17,dir:1}],
   people:[{who:'keeper',c:31,r:17,face:-1,quest:'keeper',line:'Service door. No work order. And someone’s moved my lunch up the catwalk.',
    lineDone:'Nobody said which side of the door I eat on. Leave it on the latch.'}],
   decor:[{k:'g7-door',c:33,r:17},{k:'g7-shelf',c:35,r:8},{k:'g7-chain',c:24,r:3}],map:cells.rows()},
  {id:'g7-back',name:'The Back Cell',exit:'down',portalMode:'one',portals:[{color:'orange',c:0,r:15,face:'r'}],hint:'What goes into one portal comes out of the other, the way it was going',question:'The cell has no door, only a portal open in its back wall. Where does the other end go?',
   jailers:[{x:6,y:17,dir:1}],decor:[{k:'g7-chain-long',c:32,r:6},{k:'g7-chain',c:7,r:3}],map:back.rows()},
  {id:'g7-pair',name:'Two Cells',exit:'left',hint:'Between two jailers you are behind both · each ring fills at its own pace',question:'The pod puts you between them. Which back do you take first?',
   jailers:[{x:14,y:8,dir:-1,turn:90},{x:23,y:8,dir:1,turn:36}],decor:[{k:'g7-chain-long',c:30,r:6},{k:'g7-chain',c:9,r:3}],map:pair.rows()},
  {id:'g7-vigil',name:'Gaol Vigil',exit:'left',hint:'A pod can set you down on a jailer’s own lip · the parry still opens it',question:'The pod lifts you onto the landing’s lip, face to face with its jailer. What gets you past it?',
   jailers:[{x:10,y:8,dir:1}],
   people:[{who:'vey',c:31,r:17,face:-1,line:'You. I carried a standard once. Now I carry his keys.'},
    {who:'enna',c:26,r:17,face:1,line:'Don’t look down the well. He never looks at us.'}],
   decor:[{k:'hearth',c:28,r:17},{k:'g7-keys',c:33,r:17},{k:'g7-standard',c:34,r:17},{k:'g7-chain-long',c:20,r:6}],map:vigil.rows()},
  {id:'g7-court',name:'Red Court',exit:'down',hint:'Everything the Gaol has taught, in one court',question:'Two pods, a jailer and the stair down. In what order, and facing which way?',
   jailers:[{x:21,y:7,dir:1},{x:2,y:13,dir:1}],decor:[{k:'g7-chain-long',c:26,r:6},{k:'g7-chain',c:16,r:3}],map:court.rows()},
  {id:'g7-mouth',name:'The Well Mouth',exit:'down',study:true,hint:'The Warden rushes whatever stands in his line · what meets his rush head-on gives it back',
   question:'He charges whatever stands in front of him. What is at the end of his line?',
   warden:{x:2,y:17,dir:1,hp:1,leave:'down'},decor:[{k:'g7-chain-long',c:12,r:6},{k:'g7-chain-long',c:22,r:6}],map:mouth.rows()},
  {id:'g7-well',name:'Sentence Well',exit:'down',study:true,hint:'A parry gives his rush back as surely as a pod',
   question:'No pod, no gallery. What else can meet him head-on?',
   warden:{x:37,y:17,dir:-1,hp:1,leave:'down'},decor:[{k:'g7-chain-long',c:10,r:6},{k:'g7-chain-long',c:28,r:6},{k:'g7-chain',c:19,r:3}],map:well.rows()},
  {id:'g7-sentence',name:'The Sentence',exit:'left',study:true,hint:'Crashed, his guard is down · he rises facing you and throws you off · up out of his line, his chain finds you',
   question:'Three wounds; he throws you clear as he rises, and calls his jailer down. What meets the next rush, and what clears the jailer?',
   warden:{x:3,y:17,dir:1,hp:3,leave:'kneel',chain:{every:70},shove:true,call:{at:1,x:9,dir:1}},decor:[{k:'g7-mine',c:0,r:17},{k:'g7-chain-long',c:20,r:6},{k:'g7-chain',c:31,r:3}],map:sentence.rows()},
 ],
 quests:[
  {id:'keeper',title:'Stand Aside',giver:'The Service Keeper',from:'g7-cells',back:{c:35,r:8},
   keepsake:{id:'keeper-lunch',name:'The Keeper’s Lunch',gives:'The Keeper eats on the service step with the door on the latch. In the Fractured Warden it opens the Keeper’s echo.'},
   rooms:[
    {id:'g7-q-shaft',name:'The Jammed Latch',exit:'up',hint:'The latch is a stake · the hatch opens when the latch is thrown and its jailer has fallen',
     question:'Two pods and a ledge with a jailer on it. Which way does the second pod send you, and onto which side of it?',
     jailers:[{x:32,y:5,dir:1}],decor:[{k:'g7-chain-long',c:12,r:6},{k:'g7-wheel',c:30,r:19}],map:shaft.rows()},
    {id:'g7-q-catwalk',name:'The Service Catwalk',exit:'left',hint:'Under the low roof there is no way over · the parcel is on the alcove shelf',
     question:'A jailer under the catwalk roof and another on the alcove’s lip. Where do you meet each of them?',
     jailers:[{x:21,y:10,dir:1},{x:3,y:5,dir:1}],decor:[{k:'g7-chain',c:32,r:3}],map:catwalk.rows()},
   ]},
 ],
};
