// Room by Room · 32. The Fractured Inversion (7.280, hand-made; replaces fracture.mjs's reflection of 12). Source for
// public/bladefall-rbr-32-f-inversion.js (node scripts/rbr-src/gen.mjs 32). Brief: docs/plans/fractured-hard.md (stage III).
// The Inversion with both axes turned. The region's device is still the gravity prism (bladefall-pcore-dev-gravity.js,
// glyph Q: a dash through it turns gravity over); beside it the court's mirror glass (29, glyph |: a dash through it
// swaps left and right). Two room shapes: a band (a thorned pit under the floor slabs and a thorned pit over the roof
// slabs, so whichever way you fall there is nothing to land on but the slab you aimed at) and a serpentine (three
// passes over the same width: the low floor left, the middle slab's underside right, the high roof left). Nothing
// here is a rest: the slabs are fault stone, your shade follows you, the tear crosses what a flip cannot. In order:
//   the prism, cracked (The Fall Up: up onto a cracking roof, down onto a cracking floor, up, down)
//   → three passes (Both Ways: one pane in the low band, crossed going and coming; your shade behind)
//   → everything cracks (The Cracked Roof: fault stone end to end on the floor and the high roof)
//   → teeth both ways (The Turned Teeth: floor and roof teeth, the glass on the roof)
//   → the weave (Prism to Prism: flips taken in the air, crystals between them)
//   → with the tear (The Hanging Tear: a tear along the roof, ridden upside down)
//   → the Middle Landing (the neighbours' echo; the chimney's wall is the side way up)
//   → with the shade (Divided Ground: left along the floor, back along the roof, out up a thorned chimney)
//   → glass between floors (Glass Between Floors: two panes crossed twice, one in the high roof)
//   → the gauntlet (Polarity Gauntlet: four flips over short slabs, the glass with the third)
//   → the fissure (The Void Fissure: a cracking floor, and the tear across the high roof's fissure)
//   → the threshold (The Quiet Threshold, not quiet: all of it on three passes, your shade behind)
// Echo: Whose Floor (q.needs the base keepsake neighbours-cup), up the Middle Landing's chimney: The Courtyard Shelf
// and The Stranded Service, the region's hardest rooms (serpentines).
import {grid} from './build.mjs';
import base from './12-inversion.mjs';
const shell=()=>grid().frame();
const room=(id,name,hint,question,m,extra={})=>({id:'fi32-'+id,name,exit:'left',hint,question,map:m.rows(),...extra});
const F={fuse:10,spread:5};
// A band: thorns along the bottom of the pit under the floor slabs (row 21) and along the top of the pit over the
// roof slabs (row 1). Floor slabs lie on row 15 (you stand on row 14); roof slabs hang on row 7 (flipped, you stand
// on row 8), so a flip is a fall of seven tiles. The start block is on the right; the way out is at the left, on the
// floor (rows 13–14, so only a knight standing the right way up leaves by it) or on the roof. Floor prisms stand on
// rows 12–14, roof prisms hang on rows 8–10.
const band=(out='floor')=>{
 const m=shell().rect(1,21,38,21,'^').rect(1,1,38,1,'v').rect(34,15,39,22,'#').put(36,14,'P');
 if(out==='floor')m.rect(0,15,3,22,'#').rect(0,13,0,14,'.');
 else m.rect(0,0,3,7,'#').rect(0,8,0,10,'.');
 return m;
};
const up=(m,c)=>m.rect(c,12,c,14,'Q'),down=(m,c)=>m.rect(c,8,c,10,'Q');
// A serpentine: three passes over the same width. The low floor (rows 20–21) runs left from the start; a prism laid
// flat over its left end turns you up onto the underside of the middle slab (row 11), which runs right; walk off its
// right end and you fall up onto the high roof (rows 1–2; its right end, where you land, is cracked stone), which
// runs left to the way out at the top. Gaps in the
// low floor have thorns at their foot (row 21), gaps in the high roof have thorns at their head (row 1); teeth on the
// low floor stand on row 19, teeth under the middle slab hang on row 12, teeth under the high roof hang on row 3.
// A pane on rows 12–19 is crossed twice (going left on the floor, coming back right under the slab).
const serp=()=>shell().rect(1,1,38,2,'#').rect(33,1,38,1,'v').rect(33,2,38,2,'T').rect(1,11,33,11,'#').rect(1,20,38,21,'#').rect(2,16,6,16,'Q').rect(0,3,0,5,'.').put(36,19,'P');
const lowGap=(m,c0,c1)=>m.rect(c0,20,c1,20,'.').rect(c0,21,c1,21,'^');
const highGap=(m,c0,c1)=>m.rect(c0,2,c1,2,'.').rect(c0,1,c1,1,'v');

// 1 · The Fall Up — the prism, cracked: up onto a cracking roof (a tooth on it), down onto a cracking floor under a
// gate hung from the roof (only the floor passes it), up onto a third slab, and down to the way out.
const fall=band('floor');
up(fall,32);fall.rect(24,7,30,7,'T').put(27,8,'v');down(fall,22);fall.rect(16,15,21,15,'T').rect(19,2,19,11,'#').put(19,12,'v');up(fall,14);fall.rect(6,7,11,7,'T').put(9,8,'v');down(fall,4);

// 2 · Both Ways — a serpentine with one pane in the low band: going left along the floor it turns your hands, coming
// back right under the middle slab, flipped, it turns them back; the high roof's own pane turns them again for the
// way out. Two gaps and a tooth on the floor, three teeth under the slab, three gaps in the high roof.
const line=serp();
lowGap(line,28,30);lowGap(line,17,19);line.put(11,19,'^').rect(23,12,23,19,'|').put(10,12,'v').put(17,12,'v').put(29,12,'v');
highGap(line,29,32);highGap(line,20,23);highGap(line,12,14);line.rect(7,3,7,10,'|');

// 3 · The Cracked Roof — a serpentine where everything you land on cracks: the low floor and the high roof are
// fault stone end to end (the crack runs behind you almost as fast as you run), with gaps in both; the middle slab
// holds, but its teeth hang close together.
const rev=serp();
rev.rect(7,20,33,20,'T').rect(7,21,33,21,'^');lowGap(rev,26,28);lowGap(rev,15,17);rev.put(9,12,'v').put(14,12,'v').put(20,12,'v').put(26,12,'v');
rev.rect(4,2,32,2,'T').rect(4,1,32,1,'v');highGap(rev,24,26);highGap(rev,13,15);

// 4 · The Turned Teeth — teeth on the floor, teeth on the roof, and the glass between the roof's teeth: up off
// the floor, along the roof with your hands turned, and out along the roof.
const lip=band('roof');
lip.rect(24,15,31,15,'T').put(28,14,'^');up(lip,22);lip.rect(4,7,20,7,'T').put(17,8,'v').rect(13,2,13,20,'|').put(9,8,'v');

// 5 · Prism to Prism — flips taken in the air: up, a crystal, down before the roof, a floor of teeth, up (a gate
// standing on the pit lets only the roof pass), a crystal, down before the roof again.
const alt=band('floor');
up(alt,32);alt.put(28,10,'o').rect(24,9,24,11,'Q').rect(14,15,21,15,'T').put(19,14,'^').put(16,14,'^');up(alt,12);alt.put(9,9,'o').rect(7,11,7,20,'#').put(7,10,'^').rect(5,8,5,10,'Q');

// 6 · The Hanging Tear — up off a floor of teeth onto the roof, and the roof ends over the pit: the tear along it is
// ridden upside down and sets you on the far slab, where a prism takes you down to the way out.
const landing=band('floor');
landing.rect(26,15,31,15,'T').put(29,14,'^');up(landing,24);landing.rect(17,7,22,7,'T').rect(5,7,9,7,'T');down(landing,3);

// 7 · The Middle Landing — up, along a roof split by a pane with a tooth either side of it, down, along a floor split
// by a gap and a tooth, up to the way out on the roof, your hands turned since the pane. The neighbours' echo sits by the start; over it the chimney, whose wall is the side way up into the echo.
const court=band('roof');
court.rect(35,0,38,1,'.');up(court,31);court.rect(20,7,29,7,'T').put(27,8,'v').put(21,8,'v').rect(24,2,24,12,'|');down(court,18);court.rect(8,15,16,15,'T').rect(11,15,12,15,'.').put(15,14,'^');up(court,6);

// 8 · Divided Ground — left along the floor, back right along the roof, and your shade walks a second behind:
// the floor and the roof are the only way to pass it. The way out is a thorn-walled chimney through the roof: fall
// up it straight.
const divide=band('floor');
divide.rect(0,13,0,14,'#').rect(11,15,31,15,'#').put(28,14,'^').put(23,14,'^').put(18,14,'^').put(13,14,'^');up(divide,9);
divide.rect(5,7,28,7,'#').rect(5,6,19,6,'^').rect(27,6,28,6,'^').put(14,8,'v').put(17,8,'v').rect(21,0,25,7,'.').rect(20,2,20,6,'#').rect(26,2,26,6,'#').rect(21,2,21,6,'>').rect(25,2,25,6,'<');

// 9 · Glass Between Floors — a serpentine with two panes in the low band (each crossed going left on the floor and
// again coming back right under the slab) and one in the high roof: every pass turns your hands twice or once, and
// your shade walks all three passes a second behind (the floors hold; it is the shade that will not let you stop).
const glass=serp();
glass.rect(1,21,33,21,'^').rect(1,1,32,1,'v').rect(33,2,38,2,'#');lowGap(glass,30,32);glass.rect(26,12,26,19,'|').put(20,19,'^').rect(13,12,13,19,'|');lowGap(glass,7,9);
glass.put(9,12,'v').put(19,12,'v').put(31,12,'v');highGap(glass,28,31);glass.rect(20,3,20,10,'|');highGap(glass,9,12);

// 10 · Polarity Gauntlet — four flips over short slabs and three gates: two standing on the pit that only the roof
// passes over, one hung from the roof that only the floor passes under, and a pane with the third prism.
const lock=band('floor');
up(lock,33);lock.rect(28,11,28,20,'#').put(28,10,'^').rect(25,7,31,7,'T');down(lock,23);lock.rect(15,15,21,15,'T').rect(18,2,18,11,'#').put(18,12,'v');
up(lock,13);lock.rect(12,2,12,20,'|').rect(5,7,11,7,'T').rect(9,11,9,20,'#').put(9,10,'^');down(lock,4);

// 11 · The Void Fissure — a serpentine: the low floor is fault stone over its thorns, the middle slab has teeth, and
// the high roof is split by the fissure, which only the tear crosses, upside down.
const fissure=serp();
fissure.rect(1,20,32,20,'T').rect(1,21,32,21,'^').rect(10,11,33,11,'T').rect(1,2,9,2,'T').rect(1,1,9,1,'v').rect(30,2,32,2,'T').rect(30,1,32,1,'v');lowGap(fissure,24,26);lowGap(fissure,13,14);fissure.put(10,12,'v').put(18,12,'v').put(26,12,'v');
highGap(fissure,10,29);

// 12 · The Quiet Threshold — not quiet: a serpentine with all of it. Fault floor and the low pane, teeth under the
// slab, the high roof split by a gap no jump crosses (a crystal hangs over it), the high pane, and your shade behind.
const threshold=serp();
threshold.rect(9,20,33,20,'T').rect(9,21,33,21,'^');lowGap(threshold,27,29);threshold.rect(21,12,21,19,'|');lowGap(threshold,13,15);
threshold.put(9,12,'v').put(15,12,'v').put(28,12,'v');highGap(threshold,22,30);threshold.put(26,6,'o').rect(16,3,16,10,'|');highGap(threshold,8,11);

// Echo · Whose Floor (the neighbours' echo; sealed until the base keepsake, the Chipped Cup, is held). Up the
// Middle Landing's chimney. The region's two hardest rooms.
// The Courtyard Shelf — a serpentine, and your shade walks all of it a second behind you: two low panes, teeth on
// every pass, a wide high gap with a crystal over it.
const shelf=serp();
lowGap(shelf,30,32);shelf.rect(27,12,27,19,'|').put(22,19,'^');lowGap(shelf,15,17);shelf.rect(11,12,11,19,'|').put(7,19,'^');
shelf.put(8,12,'v').put(16,12,'v').put(22,12,'v').put(31,12,'v');highGap(shelf,25,32);shelf.put(28,6,'o');highGap(shelf,15,18);shelf.put(10,3,'v').rect(6,3,6,10,'|');
// The Stranded Service — a serpentine: the tea service hangs under the middle slab, over a fault floor; take it
// on the way back, flipped and swapped, and the tear takes you over the high roof's fissure. Your shade walks all
// of it a second behind, the tear too, so do not wait on the far mouth.
const service=serp();
service.rect(8,20,33,20,'T').rect(8,21,33,21,'^');lowGap(service,27,29);service.rect(24,12,24,19,'|');lowGap(service,14,16);service.put(9,19,'^');
service.put(11,12,'v').put(19,12,'v').put(29,12,'v').put(15,12,'*');highGap(service,11,27);service.rect(8,3,8,10,'|');

export default {
 n:32,name:'The Fractured Inversion',kit:['dash','strike','parry','portal'],
 folk:base.folk,props:base.props,
 blurb:'The Inversion with both axes turned. The prisms still turn the ceiling into the road; between them the court’s glass turns left into right, and nothing you stand on waits.',
 outro:'You are the right way up, or the other right way. The citadel waits.',
 note:'Hand-made for the Fractured ramp (docs/plans/fractured-hard.md). Gravity prisms (bladefall-pcore-dev-gravity.js), mirror panes (bladefall-pcore-dev-mirror.js), fault stone, the shade, tears.',
 rooms:[
  room('fall','The Fall Up','A prism turns gravity over · cracked stone will not wait, on the roof or the floor','Up onto the roof, down onto the floor, up again, and nothing holds. Where is the next prism before you land?',fall,{fault:F}),
  room('line','Both Ways','The pane in the low band turns your hands going left, and turns them back coming right, upside down','Left along the floor, back right under the slab with gravity turned, left again along the high roof. Which way is left on each pass?',line,{fault:F,mirror:{},shade:{delay:50}}),
  room('reversal','The Cracked Roof','The low floor and the high roof are cracked stone end to end · the crack runs nearly as fast as you · your shade behind','Left along a floor that falls behind you, right under four teeth with your shade a second back, left along a roof that falls behind you. Where do you stop? Nowhere.',rev,{fault:{fuse:12,spread:6},shade:{delay:50}}),
  room('lip','The Turned Teeth','Teeth point at your feet on the roof too · the glass turns your hands mid-run','Up off the floor, and the roof’s teeth on both sides of the glass. Which way is a jump, and which way is left?',lip,{fault:F,mirror:{}}),
  room('alternating','Prism to Prism','A crystal gives the dash back in the air · a prism turns you before you land','You flip, and the prism back is between you and the roof. When do you dash?',alt,{fault:F}),
  room('landing','The Hanging Tear','A tear carries you upside down too · it sets you on the far slab','The roof ends over the pit. What carries you to the far slab, and which way do you fall from it?',landing,{fault:F,lines:[{a:[16,8],b:[8,8],setDown:true}]}),
  room('court','The Middle Landing','The chimney over the start climbs to the neighbours’ echo · the road crosses the glass upside down','Take the road, upside down through the glass, or climb the chimney’s wall to the echo?',court,
   {fault:F,mirror:{},side:'up',people:[{who:'neighbour',c:37,r:14,face:-1,quest:'neighbours-echo',line:'We never agreed which way was down. We had tea anyway.',lineDone:'Bring the second cup. Either table.',name:'THE NEIGHBOURS’ ECHO'}],decor:[{k:'tea-table',c:34,r:14}]}),
  {...room('divide','Divided Ground','Your shade walks your path a second behind · the floor and the roof pass each other','Left along the floor, back along the roof, and your shade behind you all the way. Where do you turn?',divide,{shade:{delay:50}}),exit:'up'},
  room('glass','Glass Between Floors','Two panes in the low band, crossed going and coming · one in the high roof · your shade behind','Every pane turns your hands, you cross the low ones twice, and your shade walks all three passes behind you. Which way is left at each gap?',glass,{mirror:{},shade:{delay:50}}),
  room('lock','Polarity Gauntlet','Four flips, short slabs, and the glass with the third prism','Never the same way twice. Where is the next slab, and which way is it?',lock,{fault:F,mirror:{}}),
  room('fissure','The Void Fissure','The low floor cracks under you · only the tear crosses the fissure in the high roof','The fissure is too wide for any jump. Where does the tear begin, upside down?',fissure,{fault:F,lines:[{a:[30,3],b:[9,3],setDown:true}]}),
  room('threshold','The Quiet Threshold','Not quiet: cracked floor, both panes, the crystal over the gap, and your shade behind','Everything the Inversion has, on three passes. Where is the crystal, and which way is left when you reach it?',threshold,{fault:F,mirror:{},shade:{delay:50}}),
 ],
 quests:[
  {id:'neighbours-echo',title:'Whose Floor',giver:'The neighbours’ echo',from:'fi32-court',back:{c:36,r:14},needs:'neighbours-cup',
   keepsake:{id:'neighbours-remembered',name:'The Neighbours, remembered',gives:'Two neighbours shared tea on a table that faced both ways. Shown at the end.'},
   rooms:[
    room('q-shelf','The Courtyard Shelf','Your shade follows you on all three passes · the crystal hangs over the high gap','Two panes, teeth on every pass, the crystal over the gap, and your shade a second behind. Which way is left, and which way is down, at each one?',shelf,{fault:F,mirror:{},shade:{delay:50}}),
    room('q-service','The Stranded Service','The tea service hangs under the middle slab · take it on the way back · your shade rides the tear behind you','The service is under the slab, past the glass, and the tear waits at the fissure. Can you take it without stopping?',service,
     {fault:F,mirror:{},shade:{delay:50},lines:[{a:[28,3],b:[10,3],setDown:true}],people:[{who:'neighbour',name:'THE NEIGHBOURS’ ECHO',c:3,r:4,ceiling:true,quest:'neighbours-echo',line:'One sugar. She noticed.',lineDone:'Her down, my down. The tea stays in the cup.'}]}),
   ]},
 ],
};
