// Room by Room · 8. Frostfell. Source for public/bladefall-rbr-08-frostfell.js (node scripts/rbr-src/gen.mjs 08).
// The base game's banked settlement (Banked Refuge, Working Streets, Workers' Hearth, Thermal Works, Thawed Court,
// Frozen Stair, Exposed Galleries, Muster Crown) as twelve screens, from the mine mouth up to the Muster bell.
// Kit: everything granted so far (dash, blade, parry, portal). No boss.
// The device is the Frostfell module's (bladefall-pcore-dev-frost.js): ice (glyph I: an eighth of the grip, so you keep
// sliding and cannot turn round) and the frost feather (glyph f: one more jump, caught in the air, melted by landing).
// The Updrafts already taught the module's winds, so wind only returns here in combination. In order:
//   ice seen (Banked Refuge: a glazed street that slides you toward a thorn trough) → alone (Working Streets: three
//   floes up the street over thorns, the only footing) → chained (Raised Shelves: floes against thorned walls, each
//   carrying you the wrong way, so you turn in the air) → with cracked stone (Workers' Hearth) → with warm air
//   (Thermal Works: the draft sets you down on a floe you can't wait on)
//   → the feather seen (Thawed Court: it hangs where a jump peaks; the dais is reachable without it) → alone (The
//   Rehearsal: a gallery higher than a jump and a dash) → chained (Frozen Stair: two feathers, one at a time) → with ice
//   (Exposed Galleries: catch the feather off the end of a floe; under the icicles to the last floe, which melts
//   nothing because you no longer hold anything, then the last feather) → with cracked stone and a crystal (The Twenty
//   Landings) → with warm air (Muster Engine: the feather waits at the top of the draft) → synthesis (Muster Crown:
//   floe, draft, feather, cracked stone, out past the bell).
// Hearths (rests): Exposed Galleries and Muster Crown keep your place at a hearth on a dry island (room `hearths`).
// People: Nim lights the braziers ahead of you (Refuge, Working Streets, both times seen leaving right) and settles at
// Workers' Hearth; the neighbour (the side story's Frostfell woman) at her frozen house there; Ilyra in the Thermal
// Works (her Kindling the Sky thread from the Updrafts); a sentinel by the Muster Engine.
// Quest (optional, branch): The Perfect Day, up the chimney from Workers' Hearth. The Dreadful Steps (ice steps, each
// a jump and a dash above the last; the last one cracked: "mind the last one") and The Upper Shelter (the flue's warm
// air up to the coal shelf, which is ice; take the coal as you slide and jump the thorned wall into the coal chute).
// The keepsake (the coal bucket) lights her stove: her house is drawn warm, smoking, the blue cup on the sill
// (f8-cottage@winter-stove), and her line changes.
// The 'ice' event used by the skip hunts comes from public/bladefall-pcore-dev-rbr-frostfell.js (an event, nothing
// else): feet on an ice tile, or hands on an ice face (a cling, wall jump, climb jump or wall bounce off it).
// SKIPS (node scripts/rbr-skip.mjs <room> --without <event> --plain), on the final geometry:
//   introductions: f8-streets without ice, f8-rehearsal without feather — no skip found.
//   combinations (advisory): see ADVISORY below.
import {grid} from './build.mjs';

const UP=-240;   // a thermal: lifts a falling knight and lets go where its streaks end
const ice=(g,c0,c1,r)=>g.rect(c0,r,c1,r,'I');   // a floe: one row of ice

// 1 · Banked Refuge
const refuge=grid().frame();
refuge.rect(0,18,39,22,'#').rect(14,18,27,18,'I').rect(30,18,31,18,'^').rect(33,16,39,17,'#').rect(39,11,39,15,'.').put(3,17,'P');

// 2 · Working Streets
const streets=grid().frame();
streets.rect(0,18,6,22,'#').rect(7,21,33,21,'^').rect(7,22,33,22,'#').rect(1,1,1,15,'>')
 .rect(34,9,39,22,'#').rect(33,9,33,20,'<').rect(39,5,39,8,'.').put(3,17,'P');
ice(streets,10,14,16);ice(streets,18,22,14);ice(streets,26,30,12);

// 3 · Raised Shelves
const shelves=grid().frame();
shelves.rect(6,0,8,22,'#').rect(31,0,33,22,'#').rect(9,1,9,17,'>').rect(30,1,30,20,'<').rect(9,18,16,22,'#').rect(17,21,30,21,'^').rect(17,22,30,22,'#')
 .rect(20,16,29,16,'I').rect(10,13,18,13,'I').rect(20,10,29,10,'I').rect(10,7,18,7,'I').rect(21,0,25,0,'.').put(12,17,'P');

// 4 · Workers' Hearth
const hearth=grid().frame();
hearth.rect(0,18,12,22,'#').rect(13,21,33,21,'^').rect(13,22,33,22,'#').rect(0,8,12,9,'#').rect(1,0,1,7,'#').rect(4,0,4,7,'#').rect(2,0,3,9,'.')
 .rect(21,13,23,13,'~').rect(34,8,39,22,'#').rect(33,8,33,20,'<').rect(39,4,39,7,'.').put(9,17,'P');
ice(hearth,16,18,16);ice(hearth,27,29,10);

// 5 · Thermal Works
const works=grid().frame();
works.rect(0,18,7,22,'#').rect(8,21,38,21,'^').rect(8,22,38,22,'#').rect(1,1,1,15,'>')
 .rect(33,5,39,22,'#').rect(32,5,32,20,'<').rect(39,1,39,4,'.').put(3,17,'P');
ice(works,16,19,10);

// 6 · Thawed Court
const court=grid().frame();
court.rect(0,18,39,22,'#').rect(26,13,39,17,'#').rect(39,8,39,12,'.').put(20,13,'f').put(3,17,'P');

// 7 · The Rehearsal
const rehearsal=grid().frame();
rehearsal.rect(0,18,39,22,'#').rect(27,8,39,10,'#').rect(27,11,28,17,'#').rect(26,8,26,17,'<').rect(39,4,39,7,'.').rect(1,1,1,15,'>').put(22,13,'f').put(3,17,'P');

// 8 · Frozen Stair
const stair=grid().frame();
stair.rect(0,18,6,22,'#').rect(7,21,38,21,'^').rect(7,22,38,22,'#').rect(1,1,1,15,'>')
 .rect(22,5,39,8,'#').rect(22,9,24,22,'#').rect(21,5,21,20,'<').rect(39,1,39,4,'.').put(11,13,'f').put(15,10,'f').put(3,17,'P');

// 9 · Exposed Galleries
const galleries=grid().frame();
galleries.rect(0,18,5,22,'#').rect(6,21,38,21,'^').rect(6,22,38,22,'#').rect(1,1,1,15,'>')
 .rect(20,11,23,22,'#').rect(19,12,19,20,'<').rect(24,12,24,20,'>')
 .rect(26,1,29,8,'I').rect(26,9,29,9,'v').rect(25,1,25,8,'<').rect(30,1,30,8,'>')
 .rect(34,5,39,22,'#').rect(33,5,33,20,'<').rect(39,1,39,4,'.').put(16,12,'f').put(31,9,'f').put(3,17,'P');
ice(galleries,9,14,16);ice(galleries,27,31,15);

// 10 · The Twenty Landings
const landings=grid().frame();
landings.rect(0,18,5,22,'#').rect(6,21,38,21,'^').rect(6,22,38,22,'#').rect(1,1,1,15,'>')
 .rect(12,9,14,9,'~').put(22,8,'o').rect(34,4,39,22,'#').rect(33,4,33,20,'<').rect(39,0,39,3,'.').put(8,13,'f').put(3,17,'P');
ice(landings,29,30,9);

// 11 · Muster Engine
const engine=grid().frame();
engine.rect(0,18,8,22,'#').rect(9,21,38,21,'^').rect(9,22,38,22,'#').rect(1,1,1,15,'>')
 .rect(24,3,39,6,'#').rect(24,7,26,22,'#').rect(23,3,23,20,'<').rect(39,0,39,2,'.').put(13,7,'f').put(3,17,'P');

// 12 · Muster Crown
const crown=grid().frame();
crown.rect(0,18,5,22,'#').rect(6,21,37,21,'^').rect(6,22,37,22,'#').rect(1,1,1,15,'>')
 .rect(21,9,25,22,'#').rect(20,10,20,20,'<').rect(26,10,26,20,'>').rect(29,6,31,6,'~')
 .rect(38,1,38,20,'<').rect(33,0,37,0,'.').put(18,4,'f').put(3,17,'P');
ice(crown,8,12,15);

// Quest · The Perfect Day. The steps: ice steps two tiles wide up a thorned stairwell; the last one is cracked.
const steps=grid().frame();
steps.rect(6,0,8,22,'#').rect(31,0,33,22,'#').rect(9,1,9,18,'>').rect(30,1,30,20,'<').rect(9,19,14,22,'#').rect(15,21,29,21,'^').rect(15,22,29,22,'#')
 .rect(10,1,16,1,'v').rect(21,1,29,1,'v').rect(18,5,19,5,'~').rect(17,0,20,0,'.').put(11,18,'P');
ice(steps,19,20,15);ice(steps,12,13,10);
// The upper shelter: the stove's flue lifts you up the shaft to the coal shelf (ice); the coal chute goes down.
const shelter=grid().frame();
shelter.rect(0,18,11,22,'#').rect(1,1,1,15,'>').rect(12,5,13,22,'#').rect(12,4,13,4,'^').rect(14,5,14,20,'>')
 .rect(19,5,20,22,'#').rect(18,5,18,20,'<').rect(15,22,17,22,'.').rect(22,21,38,21,'^').rect(21,5,21,20,'>').rect(38,1,38,20,'<').rect(11,7,11,16,'<').put(10,5,'*').put(8,17,'P');
ice(shelter,6,11,6);

// Props: rectangles [dx,dy,w,h,colour] from the tile's left edge and the floor line under it (dy up is negative).
const WOOD='#5a4632',WOODL='#7a6044',SNOW='#e8f2fa',IRON='#5c6470',IRONL='#8a94a2',COPPER='#b87a4a';
const icicles=n=>{const r=[[0,-8,n*4,1,'#cfe4f2']];for(let i=0;i<n;i++)r.push([i*4+1,-7,1,2+(i*5)%4,'#bfe4ff']);return r;};
const props={
 // The mine mouth the knight comes up out of: timbers and a dark adit.
 'f8-mine':[[0,-14,12,14,'#1a1e26'],[-1,-15,14,2,WOOD],[-1,-14,2,14,WOOD],[11,-14,2,14,WOOD],[0,-17,12,2,SNOW]],
 // A settlement house: snow on the roof, cold window, a copper pipe.
 'f8-house':[[0,-12,16,12,'#3e3a40'],[-1,-15,18,3,'#5a4a44'],[-1,-16,18,1,SNOW],[3,-8,4,4,'#3a5a70'],[10,-7,4,7,'#2a2226'],[14,-20,2,8,COPPER]],
 // The neighbour's frozen house; once the stove is lit, a warm window, smoke and the blue cup on the sill.
 'f8-cottage':[[0,-12,15,12,'#3a3e48'],[-1,-15,17,3,'#4a5262'],[-1,-16,17,2,SNOW],[3,-8,4,4,'#4a6a80'],[9,-7,4,7,'#2a2630'],[0,-13,15,1,'#9fc4dc'],[1,-12,1,3,'#cfe4f2'],[6,-12,1,2,'#cfe4f2'],[12,-12,1,3,'#cfe4f2']],
 'f8-cottage@winter-stove':[[0,-12,15,12,'#4a3c38'],[-1,-15,17,3,'#5a4a44'],[-1,-16,17,1,SNOW],[3,-8,4,4,'#ffcf7a'],[9,-7,4,7,'#2a2226'],[12,-21,2,6,'#3a3432'],[11,-25,2,2,'#8a8a90'],[13,-28,2,2,'#6a6a70'],[3,-4,4,1,'#6a5240'],[4,-6,2,2,'#4a7ad0']],
 // An unlit brazier (Nim lights them as he goes).
 'f8-brazier':[[2,-7,4,2,IRON],[3,-5,2,5,IRON],[1,-8,6,1,IRONL]],
 // Copper pipes and a flue vent that the works' warm air comes out of.
 'f8-flue':[[0,-3,8,3,'#6a4a32'],[1,-4,6,1,COPPER],[3,-10,2,6,COPPER]],
 'f8-pipes':[[0,-2,24,2,COPPER],[22,-12,2,10,COPPER],[0,-6,2,4,COPPER],[8,-4,3,2,'#8a5a3a']],
 // The memory in the court: a frozen figure mid-leap, on a plinth.
 'f8-memory':[[0,-3,10,3,'#6a7a8a'],[3,-13,4,7,'#a8c4dc'],[4,-16,2,3,'#cfe4f2'],[1,-12,2,1,'#a8c4dc'],[7,-11,2,1,'#a8c4dc'],[3,-6,1,3,'#a8c4dc'],[6,-6,1,3,'#a8c4dc']],
 'f8-icicles':icicles(5),'f8-icicles-long':icicles(9),
 // The Muster Engine: a frozen gear and its bell frame.
 'f8-engine':[[0,-20,2,20,IRON],[16,-20,2,20,IRON],[0,-21,18,2,IRONL],[4,-17,10,10,'#6a7480'],[7,-14,4,4,'#3a4048'],[3,-13,1,2,IRONL],[14,-13,1,2,IRONL],[8,-18,2,1,IRONL],[8,-7,2,1,IRONL],[5,-5,8,1,'#cfe4f2']],
 'f8-bell':[[0,0,1,6,IRON],[-4,6,9,1,IRONL],[-3,7,7,6,'#b89a5a'],[-4,13,9,1,'#8a7040'],[0,14,1,1,'#5a4a32']],
 // The upper shelter: the coal heap and the old sack.
 'f8-coal':[[0,-3,10,3,'#1e1e22'],[2,-5,6,2,'#2a2a30'],[11,-6,5,6,'#8a7a5a'],[12,-7,3,1,'#6a5a40']],
 'f8-chair':[[0,-5,8,1,WOODL],[0,-11,1,11,WOOD],[7,-4,1,4,WOOD],[1,-4,1,4,WOOD],[1,-10,1,5,'#8a3a3a']],
};

export default {
 n:8,name:'Frostfell',kit:['dash','strike','parry','portal'],
 folk:{
  neighbour:{cloak:'#6a6070',trim:'#c6dce1',skin:'#dcbca4',hood:true},
  ilyra:{cloak:'#4f6f8a',trim:'#9fe0ff',skin:'#c99a76',hood:true,staff:true},
 },
 props,
 palettes:{frost:{sky0:'#0d141c',sky1:'#18263a',far:'#223449',rock:'#4a5a6e',rockD:'#2c3848',edge:'#a8c4dc',moss:'#cfe4f2',accent:'#bfe4ff'}},
 blurb:'The banked settlement under the Muster Crown, from the mine mouth to the frozen engine. Ice keeps whatever speed you give it; the frost feather is one more jump, caught in the air.',
 outro:'Frostfell, mine mouth to Crown, without once standing still.',
 note:'The device is the Frostfell module’s ice and frost feather; see the header of scripts/rbr-src/08-frostfell.mjs.',
 rooms:[
  {id:'f8-refuge',name:'Banked Refuge',exit:'right',hint:'Ice keeps whatever speed you bring onto it',question:'The street is glazed from wall to wall. What happens when you let go?',
   people:[{who:'nim',c:10,r:17,face:1,leave:'right',line:'Up through the mine? Then you’re colder than you look. Warm your hands. I’m off to light the braziers before the street freezes solid.'}],
   decor:[{k:'f8-mine',c:0,r:17},{k:'hearth',c:7,r:17},{k:'f8-house',c:34,r:15}],map:refuge.rows()},
  {id:'f8-streets',name:'Working Streets',exit:'right',hint:'Ice keeps your speed after you let go: the edge comes sooner than you think',question:'Every step up the street is ice. How long do you have on each one?',
   people:[{who:'nim',c:36,r:8,face:-1,leave:'right',line:'That’s one lit. The fire takes the slip out of the stone near it, and nowhere else, mind.'}],
   decor:[{k:'hearth',c:34,r:8}],map:streets.rows()},
  {id:'f8-shelves',name:'Raised Shelves',exit:'up',hint:'You can’t turn round on ice: turn in the air',question:'Each shelf carries you toward the thorns. Which way do you jump as you land?',
   decor:[{k:'f8-icicles-long',c:10,r:1},{k:'f8-icicles',c:22,r:1}],map:shelves.rows()},
  {id:'f8-hearth',name:'Workers’ Hearth',exit:'right',side:'up',hint:'Cracked stone holds you still for a moment; ice never does',question:'A floe, a cracked stone, a floe. Where can you stop long enough to aim?',
   people:[{who:'nim',c:2,r:17,face:1,line:'This one’s mine. I’ll keep it going all night. The works are out past the floes, if you’re set on them.'},
    {who:'neighbour',c:12,r:17,face:-1,quest:'winter',line:'Coal’s in the upper shelter. Sack’s split, so use the bucket. I can’t manage the steps anymore. They’re up the chimney there. Mind the last one.',lineDone:'Room’s warmer. Floor’s still wet. Sit down, would you? You’ve been on your feet all day.'}],
   decor:[{k:'hearth',c:4,r:17},{k:'f8-cottage',c:6,r:17}],map:hearth.rows()},
  {id:'f8-works',name:'Thermal Works',exit:'right',hint:'Warm air lifts you while you are in it · ice won’t wait while you line up the next draft',question:'The draft sets you down on ice you can’t stand on. When do you leave for the next one?',
   people:[{who:'ilyra',c:5,r:17,face:1,line:'Nim’s fire in the works’ draft. That’s what the Choir’s been missing. When it’s warm I’ll carry a coal of it down myself.'}],
   decor:[{k:'f8-pipes',c:1,r:17},{k:'f8-icicles',c:28,r:1}],winds:[{c:10,r:7,w:4,h:14,dx:0,dy:UP},{c:23,r:3,w:4,h:15,dx:0,dy:UP}],map:works.rows()},
  {id:'f8-court',name:'Thawed Court',exit:'right',hint:'Touch a frost feather in the air to carry one more jump · it melts when you land',question:'A pale quill hangs over the court. What does it carry for you?',
   decor:[{k:'f8-memory',c:9,r:17},{k:'hearth',c:4,r:17},{k:'f8-house',c:31,r:12}],map:court.rows()},
  {id:'f8-rehearsal',name:'The Rehearsal',exit:'right',hint:'Press jump again in the air to spend the feather · it melts the moment you land',question:'The gallery is higher than a jump and a dash. What can you pick up on the way?',
   decor:[{k:'f8-icicles',c:12,r:1},{k:'hearth',c:31,r:7},{k:'f8-icicles-long',c:29,r:11}],map:rehearsal.rows()},
  {id:'f8-stair',name:'Frozen Stair',exit:'right',hint:'You carry one feather at a time: spend it, and the next one will take you',question:'Two feathers climb the stair. When do you spend the first?',
   decor:[{k:'f8-icicles-long',c:26,r:9},{k:'f8-house',c:30,r:4}],map:stair.rows()},
  {id:'f8-galleries',name:'Exposed Galleries',exit:'right',hint:'Landing melts the feather, even on ice you can’t stand on · a hearth keeps your place',question:'The icicles hang between the dry gallery and the last feather. Which way round do you go, and what do you still hold when you get there?',
   hearths:[{c:3,r:17},{c:21,r:10}],map:galleries.rows()},
  {id:'f8-landings',name:'The Twenty Landings',exit:'right',hint:'Cracked stone gives the dash back before it falls · a crystal gives it back in the air',question:'A feather, a cracked landing, a crystal and a sliver of ice. What do you spend at each one?',
   map:landings.rows()},
  {id:'f8-engine',name:'Muster Engine',exit:'right',hint:'A jump spent inside warm air keeps all its height on top of the ride',question:'The draft lets you go well short of the gallery. What is waiting at the top of it?',
   people:[{who:'sentinel',c:35,r:2,face:-1,line:'Engine’s been frozen since the last muster. Ring the bell at the crown and every post on the mountain hears it.'}],
   decor:[{k:'f8-engine',c:28,r:2},{k:'f8-flue',c:3,r:17}],winds:[{c:12,r:8,w:4,h:13,dx:0,dy:UP}],map:engine.rows()},
  {id:'f8-crown',name:'Muster Crown',exit:'up',hint:'Everything the mountain has taught, in one climb',question:'Ice, a draft, a feather and cracked stone. What must you still hold when each one hands you on?',
   hearths:[{c:3,r:17},{c:23,r:8}],decor:[{k:'f8-bell',c:35,r:1}],winds:[{c:13,r:4,w:4,h:11,dx:0,dy:UP}],map:crown.rows()},
 ],
 quests:[
  {id:'winter',title:'The Perfect Day',giver:'The neighbour',from:'f8-hearth',back:{c:5,r:17},
   keepsake:{id:'winter-stove',name:'The Coal Bucket',gives:'Her stove is lit, the frozen room thaws, and the blue cup waits on the sill outside. In the Fractured Frostfell it opens her echo.'},
   rooms:[
    {id:'f8-q-steps',name:'The Dreadful Steps',exit:'up',hint:'Every step is a jump and a dash higher than the last · the last step is cracked',question:'Three steps, none of them made for standing. Which one won’t be there twice?',
     decor:[{k:'f8-icicles',c:22,r:2}],map:steps.rows()},
    {id:'f8-q-shelter',name:'The Upper Shelter',exit:'down',hint:'The flue’s warm air lifts you · the coal shelf is ice, so leave it the moment you have the coal',question:'The coal is at the end of a shelf you can’t stop on. When do you jump for the chute?',
     decor:[{k:'f8-flue',c:2,r:17},{k:'f8-coal',c:7,r:5},{k:'f8-chair',c:6,r:17}],winds:[{c:2,r:2,w:3,h:16,dx:0,dy:UP}],map:shelter.rows()},
   ]},
 ],
};
