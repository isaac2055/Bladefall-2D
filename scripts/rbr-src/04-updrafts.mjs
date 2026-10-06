// Room by Room · 4. The Updrafts. Source for public/bladefall-rbr-04-updrafts.js (node scripts/rbr-src/gen.mjs 04).
// The base game's seven rooms (Rootbreach Lift, Bellows Rest, Kite Terraces, Choir of Drafts, Needlewind Labyrinth,
// Rain-Catcher, Signal Crown) become thirteen screens of a canyon climbed on its own air. Kit: jump, climb, dash, blade.
// The device is the Frostfell module's wind boxes (bladefall-pcore-dev-frost.js; the wind only, no ice or feather),
// plus bellows-pads (springs, core 's'). A strong thermal (UP) lifts a falling knight at about 80 px/s and lets go
// where its streaks end; a weak draft (KITE, SAG) only slows his fall; a crosswind carries him, and his dash, sideways.
//   seen (Rootbreach Lift: the shaft breathes under a grate) → one thermal alone (The Old Shaft) → the pad alone
//   (Bellows Rest) → pad into a thermal (The Draw) → chained: strong then weak (Kite Terraces), the let-go below the
//   shelf (The Kite Lines), three pipes (Choir of Drafts) → with the blade (The Choir Flue) → the crosswind alone
//   (Needlewind Labyrinth), chained (The Needle's Eye) → with cracked gutters (Rain-Catcher), with pods (The Catcher
//   Span) → all of it (Signal Crown, out through the roof).
// People: Talla (kite-mender, Bellows Rest), the Cartographer (on the Choir's high ledge, under his funnel), Edrin
// (Rain-Catcher keeper), Ilyra (windwright, stranded at the far end of the span; Kindling the Sky continues through
// Frostfell, so here she only names the Choir flue). No boss.
// Quest (optional): The Blind Cartographer — a two-room branch up from the Choir's tallest pipe (a dash up from its top):
// the Upper Channel (a fast crosswind with no lift, and the vane, a stake, that opens the channel's gate), then the
// Measuring Funnel (a thermal up a thorned shaft crossed by gusts; the chime at the top; down the old return chute).
// The 'wind' event used by the skip hunts comes from public/bladefall-pcore-dev-rbr-updrafts.js (an event, nothing else).
// Skip hunts (node scripts/rbr-skip.mjs <room> --without <event> --plain), all on the final geometry:
//   introductions: u4-shaft without wind, u4-bellows without spring, u4-needle without wind — no skip found.
//   combinations (advisory): u4-flue, u4-span, u4-crown without pod, u4-draw without spring — no skip found. Fixed on
//   the way: u4-draw was climbed by the post under the pad (its sides are now thorned) and by the left wall (thorned
//   above row 13, the post and draft moved right); u4-crown by the right wall up to the Crown's draft (now thorned).
//   Known: the drafts reward a dash spent inside them (the wind keeps lifting during it), so in u4-lines the finder
//   dashes onto the shelf from mid-draft rather than from its top; both need the dash, which is the room's point.
import {grid} from './build.mjs';

const UP=-240;   // a thermal: lifts a falling knight at about 80 px/s and lets go where its streaks end
const KITE=-150; // a weak draft: a falling knight sinks through it at about 10 px/s
const SAG=-130;  // a weaker one: he sinks at about 30 px/s

// 1 · Rootbreach Lift — the lift is gone; its shaft breathes under a grate. Seen, not needed.
const lift=grid().frame();
lift.rect(0,18,12,22,'#').rect(9,10,12,17,'#').rect(13,10,22,10,'=').rect(23,10,27,22,'#')
 .rect(28,21,31,21,'^').rect(32,8,39,22,'#').rect(39,3,39,7,'.').put(3,17,'P');

// 2 · The Old Shaft — one thermal, alone, and a thorned face nothing else gets up.
const shaft=grid().frame();
shaft.rect(0,18,23,22,'#').rect(24,6,39,22,'#').rect(23,6,23,17,'<').rect(39,1,39,5,'.').put(3,17,'P');

// 3 · Bellows Rest — the bellows-pad (a spring) and the terrace wall over it.
const bellows=grid().frame();
bellows.rect(0,18,39,22,'#').rect(24,9,39,22,'#').rect(23,9,23,17,'<').put(19,17,'s').rect(39,4,39,8,'.').put(3,17,'P');

// 4 · The Draw — a pad on a post over the thorns throws you into the bottom of a draft that runs out through the roof.
const draw=grid().frame();
draw.rect(0,18,8,22,'#').rect(1,1,1,13,'>').rect(9,21,38,21,'^').rect(16,17,16,22,'#').rect(15,17,15,20,'<').rect(17,17,17,20,'>').put(16,16,'s').rect(15,0,18,0,'.').put(3,17,'P');

// 5 · Kite Terraces — a strong draft up, then a weak one that only holds you up, across the thorns to the terrace.
const kites=grid().frame();
kites.rect(0,21,13,22,'#').rect(14,21,33,21,'^').rect(34,7,39,22,'#').rect(33,7,33,20,'<').rect(39,2,39,6,'.').put(3,20,'P');

// 6 · The Kite Lines — the draft lets go below the shelf (keep the dash for it), then a weak draft across.
const lines=grid().frame();
lines.rect(0,18,9,22,'#').rect(10,21,35,21,'^').rect(1,2,1,12,'>').rect(12,6,20,7,'#')
 .rect(36,8,39,22,'#').rect(35,8,35,20,'<').rect(39,3,39,7,'.').put(4,17,'P');

// 7 · Choir of Drafts — three pipes, each taller than the last, with thorned pipe walls between. The tallest runs
// on up to the Cartographer's measuring funnel (the quest door, a dash up from its top).
const choir=grid().frame();
choir.rect(0,18,8,22,'#').rect(9,21,26,21,'^')
 .rect(13,15,13,20,'<').rect(14,15,14,22,'#').rect(15,15,15,20,'>')
 .rect(20,11,20,20,'<').rect(21,11,21,22,'#').rect(22,11,22,20,'>')
 .rect(27,9,39,22,'#').rect(27,9,27,20,'<').rect(23,0,26,0,'.').rect(39,4,39,8,'.').put(3,17,'P');

// 8 · The Choir Flue — the flue lets go short of the ledge; a pod hangs past its top.
const flue=grid().frame();
flue.rect(0,18,8,22,'#').rect(9,21,38,21,'^').rect(22,3,39,22,'#').rect(21,3,21,20,'<').put(15,12,'b').rect(39,0,39,2,'.').put(3,17,'P');

// 9 · Needlewind Labyrinth — a crosswind over a gap twice as wide as any jump and dash.
const needle=grid().frame();
needle.rect(0,16,6,22,'#').rect(7,21,32,21,'^').rect(33,16,39,22,'#').rect(39,11,39,15,'.').put(3,15,'P');

// 10 · The Needle's Eye — three crosswinds that hold you up, two drafts between them; the first wind stops short.
const eye=grid().frame();
eye.rect(0,18,39,22,'#').rect(6,18,33,18,'^').rect(1,11,33,12,'#').rect(6,11,33,11,'^').rect(7,4,38,5,'#').rect(7,4,38,4,'^')
 .rect(39,1,39,3,'.').put(3,17,'P');

// 11 · Rain-Catcher — the gutters crack under you; the tall draft and the overflow wind carry you to the far rim.
const catcher=grid().frame();
catcher.rect(0,14,6,22,'#').rect(7,21,38,21,'^').rect(13,15,15,15,'~').rect(28,6,30,6,'~')
 .rect(37,4,39,22,'#').rect(36,4,36,20,'<').rect(39,0,39,3,'.').put(3,13,'P');

// 12 · The Catcher Span — the pad, a long weak draft and the pods that win the height back.
const span=grid().frame();
span.rect(0,18,8,22,'#').rect(9,21,34,21,'^').put(7,17,'s').put(17,10,'b').put(27,9,'b')
 .rect(35,4,39,22,'#').rect(34,4,34,20,'<').rect(39,1,39,3,'.').put(3,17,'P');

// 13 · Signal Crown — everything: the pad, the draft, the crosswind, the pod, and the Crown's own draft out of the roof.
const crown=grid().frame();
crown.rect(0,18,9,22,'#').rect(10,21,38,21,'^').rect(38,1,38,20,'<').put(9,17,'s').put(30,9,'b').rect(32,0,35,0,'.').put(3,17,'P');

// Quest · The Blind Cartographer. The channel: a draft, a fast crosswind with no lift, the vane (a stake) in it.
const channel=grid().frame();
channel.rect(0,18,6,22,'#').rect(7,21,34,21,'^').put(20,8,'c').rect(35,7,39,22,'#').rect(34,7,34,20,'<').rect(39,3,39,6,'G').put(3,17,'P');
// The funnel: one draft up a thorned shaft, gusts across it, the chime at the top; down the old return chute.
const funnel=grid().frame();
funnel.rect(0,18,26,22,'#').rect(12,3,12,15,'#').rect(11,3,11,15,'<').rect(13,3,13,15,'>').rect(19,5,19,17,'<')
 .rect(20,4,26,21,'#').rect(30,4,38,22,'#').rect(27,22,29,22,'.').put(23,2,'*').put(3,17,'P');

export default {
 n:4,name:'The Updrafts',kit:['dash','strike'],
 folk:{
  talla:{cloak:'#e2dac6',trim:'#c83c3c',skin:'#9a6a4a',cap:true},
  edrin:{cloak:'#5a6a76',trim:'#7c8e9a',skin:'#c8a07a',hood:true},
  ilyra:{cloak:'#4f6f8a',trim:'#9fe0ff',skin:'#c99a76',hood:true,staff:true},
  cartographer:{cloak:'#3a4a5e',trim:'#9fe0ff',skin:'#d6b494',cap:true,staff:true},
 },
 props:{
  vent:[[0,-2,8,2,'#4a4038'],[1,-3,1,1,'#6a5e52'],[3,-3,1,1,'#6a5e52'],[5,-3,1,1,'#6a5e52']],
  bellows:[[0,-6,11,6,'#6a4a32'],[1,-7,9,1,'#8a6a46'],[11,-4,3,2,'#4a3a2a'],[2,-4,7,1,'#4a3424']],
  windsock:[[3,-22,1,22,'#5a4a3a'],[4,-22,6,3,'#c85a3a'],[10,-21,3,2,'#e8d0b0']],
  kite:[[2,-16,1,16,'#5a4a3a'],[0,-23,6,7,'#d8c27a'],[2,-21,2,3,'#b04a3a']],
  desk:[[0,-6,14,1,'#7a5a3a'],[1,-5,1,5,'#5a4030'],[12,-5,1,5,'#5a4030'],[2,-8,7,2,'#e8e0c8'],[10,-9,1,3,'#2a2a3a'],[3,-9,4,1,'#9fe0ff']],
  chimes:[[0,-26,1,26,'#6a5a40'],[0,-26,13,1,'#6a5a40'],[3,-25,1,8,'#c9d6e0'],[6,-25,1,10,'#c9d6e0'],[9,-25,1,7,'#c9d6e0'],[12,-25,1,9,'#c9d6e0']],
  funnel:[[0,-14,12,2,'#9a8a6a'],[2,-12,8,2,'#8a7a5a'],[5,-10,2,10,'#6a5a40']],
  sail:[[3,-30,2,30,'#5a4a3a'],[5,-30,9,10,'#e8dcc0'],[5,-20,6,5,'#c8bca0']],
  gutter:[[0,-3,16,1,'#8a8a90'],[0,-2,1,2,'#6a6a70'],[15,-2,1,2,'#6a6a70']],
  cage:[[0,-10,13,1,'#6a5a40'],[0,-10,1,10,'#6a5a40'],[12,-10,1,10,'#6a5a40'],[0,-1,13,1,'#6a5a40'],[4,-9,1,8,'#4a3e30'],[8,-9,1,8,'#4a3e30'],[3,-14,1,4,'#4a3e30'],[9,-13,1,3,'#4a3e30']],
  windwheel:[[5,-24,2,24,'#5a4a3a'],[0,-30,12,2,'#d9a84a'],[5,-35,2,12,'#d9a84a']],
 },
 blurb:'A canyon of thermals and wind machinery, from the dead lift to the Signal Crown. The air does the lifting; you choose where it lets go.',
 outro:'The Updrafts, floor to Crown, on borrowed air.',
 note:'The device is the Frostfell wind (winds:[…]); see the header of scripts/rbr-src/04-updrafts.mjs.',
 rooms:[
  {id:'u4-lift',name:'Rootbreach Lift',exit:'right',hint:'A grate holds you from above and lets you up from below',question:'The lift is gone and its shaft is breathing. What still holds you over it?',
   winds:[{c:13,r:11,w:10,h:11,dx:0,dy:UP}],decor:[{k:'windsock',c:25,r:9},{k:'cage',c:16,r:21},{k:'trumpets',c:5,r:17}],map:lift.rows()},
  {id:'u4-shaft',name:'The Old Shaft',exit:'right',hint:'Warm air lifts you while you are in it, and lets go where its streaks end',question:'The ledge is higher than anything you can do. What is rising out of the vent?',
   winds:[{c:18,r:3,w:4,h:15,dx:0,dy:UP}],decor:[{k:'vent',c:18,r:17},{k:'vent',c:20,r:17}],map:shaft.rows()},
  {id:'u4-bellows',name:'Bellows Rest',exit:'right',hint:'A bellows-pad throws you higher than a jump, and gives your dash back',question:'The terrace is too high to jump and dash to. What would throw you higher?',
   people:[{who:'talla',c:7,r:17,face:1,line:'Mind the pad. It throws harder than it looks, and it doesn’t care which way you’re facing.'}],
   decor:[{k:'bellows',c:11,r:17},{k:'kite',c:3,r:17}],map:bellows.rows()},
  {id:'u4-draw',name:'The Draw',exit:'up',hint:'A draft takes whatever reaches it, however it got there',question:'The draft starts higher than any jump and dash. What gets you up into it?',
   winds:[{c:15,r:0,w:4,h:6,dx:0,dy:UP}],decor:[{k:'bellows',c:4,r:17},{k:'windsock',c:7,r:17}],map:draw.rows()},
  {id:'u4-kites',name:'Kite Terraces',exit:'right',hint:'A weak draft cannot lift you, but it holds you up',question:'The terrace is past the thorns and higher than the floor. Which draft gets you up, and which one gets you across?',
   winds:[{c:10,r:4,w:4,h:17,dx:0,dy:UP},{c:14,r:4,w:19,h:6,dx:0,dy:KITE}],decor:[{k:'vent',c:10,r:20},{k:'vent',c:12,r:20},{k:'kite',c:36,r:6}],map:kites.rows()},
  {id:'u4-lines',name:'The Kite Lines',exit:'right',hint:'A draft gives nothing back: the dash you kept is the one you have when it lets go',question:'The draft lets you go short of the shelf. What did you keep for that moment?',
   winds:[{c:5,r:10,w:4,h:8,dx:0,dy:UP},{c:21,r:4,w:14,h:5,dx:0,dy:KITE}],decor:[{k:'vent',c:5,r:17},{k:'vent',c:7,r:17},{k:'kite',c:16,r:5}],map:lines.rows()},
  {id:'u4-choir',name:'Choir of Drafts',exit:'right',side:'up',hint:'Thorns line the pipes: drift over a pipe wall only from above its top',question:'Each pipe lets go at a different height. From which top can you clear the next wall?',
   people:[{who:'cartographer',c:31,r:8,face:-1,quest:'cartographer',line:'One reading from the upper channel. Two, if the pressure changes. The funnel’s above the tall pipe; mind the old chimes on your way.',lineDone:'That interval shouldn’t occur with this spacing. No, don’t change it. Help me move the desk outside, would you? I’d like to listen.'}],
   winds:[{c:9,r:8,w:4,h:13,dx:0,dy:UP},{c:16,r:4,w:4,h:17,dx:0,dy:UP},{c:23,r:2,w:4,h:19,dx:0,dy:UP}],decor:[{k:'desk',c:33,r:8},{k:'chimes',c:28,r:8}],map:choir.rows()},
  {id:'u4-flue',name:'The Choir Flue',exit:'right',hint:'Cut down on a pod to bounce, and your dash comes back',question:'The flue lets go well short of the ledge. What else will throw you up?',
   winds:[{c:9,r:10,w:4,h:11,dx:0,dy:UP}],map:flue.rows()},
  {id:'u4-needle',name:'Needlewind Labyrinth',exit:'right',hint:'A crosswind carries you, and your dash, the way it blows',question:'The far ledge is twice as far as any jump and dash. What is blowing your way?',
   winds:[{c:7,r:8,w:26,h:13,dx:150,dy:0}],decor:[{k:'windsock',c:2,r:15}],map:needle.rows()},
  {id:'u4-eye',name:'The Needle’s Eye',exit:'right',hint:'A crosswind with lift holds you up while it carries you',question:'The first wind stops short of the draft. What carries you the last of the way?',
   winds:[{c:6,r:13,w:24,h:5,dx:150,dy:KITE},{c:34,r:6,w:4,h:12,dx:0,dy:UP},{c:6,r:6,w:28,h:5,dx:-150,dy:KITE},{c:1,r:1,w:4,h:10,dx:0,dy:UP},{c:5,r:1,w:34,h:3,dx:150,dy:KITE}],decor:[{k:'windsock',c:2,r:17},{k:'windsock',c:36,r:17}],map:eye.rows()},
  {id:'u4-catcher',name:'Rain-Catcher',exit:'right',hint:'Cracked gutters fall a moment after you stand on them',question:'Every cup in the gutter cracks. Where do you stand long enough to catch the next wind?',
   people:[{who:'edrin',c:4,r:13,face:1,line:'Each gutter spills into the next one down, see? The cups crack if you stand about. Don’t stand about.'}],
   winds:[{c:23,r:5,w:4,h:16,dx:0,dy:UP},{c:31,r:1,w:5,h:4,dx:150,dy:KITE}],decor:[{k:'gutter',c:1,r:13},{k:'trumpets',c:2,r:13}],map:catcher.rows()},
  {id:'u4-span',name:'The Catcher Span',exit:'right',hint:'A weak draft only slows your fall; a pod wins the height back',question:'The span is long and the draft sinks you the whole way. Where do you win the height back?',
   people:[{who:'ilyra',c:37,r:3,face:-1,line:'You came across on the drafts? Good. The flues are drawing again. If anyone brings a banked flame up from Frostfell, send them to the Choir.'}],
   winds:[{c:9,r:8,w:25,h:10,dx:0,dy:SAG}],map:span.rows()},
  {id:'u4-crown',name:'Signal Crown',exit:'up',hint:'Everything the canyon has taught, in one flight',question:'The pad, the draft, the crosswind, a pod and the Crown’s own draft. Where does each one hand you to the next?',
   winds:[{c:12,r:1,w:4,h:6,dx:0,dy:UP},{c:16,r:1,w:12,h:4,dx:150,dy:KITE},{c:32,r:0,w:4,h:5,dx:0,dy:UP}],decor:[{k:'sail',c:1,r:17},{k:'windwheel',c:5,r:17}],map:crown.rows()},
 ],
 quests:[
  {id:'cartographer',title:'The Blind Cartographer',giver:'The Cartographer',from:'u4-choir',back:{c:37,r:8},
   keepsake:{id:'cartographer-chime',name:'The Cartographer’s Chime',gives:'The chimes sound over the Choir again, and the Cartographer moves his desk outside to listen. In the Fractured Updrafts it opens the Cartographer’s echo.'},
   rooms:[
    {id:'u4-q-channel',name:'The Upper Channel',exit:'right',hint:'A crosswind with no lift carries you fast and drops you just as fast · the vane opens the channel',question:'The channel’s wind has no lift in it. Where does it drop you, and is the vane on the way?',
     winds:[{c:7,r:2,w:4,h:19,dx:0,dy:UP},{c:11,r:2,w:19,h:5,dx:180,dy:0},{c:30,r:6,w:4,h:15,dx:0,dy:UP}],map:channel.rows()},
    {id:'u4-q-funnel',name:'The Measuring Funnel',exit:'down',hint:'Gusts cross the funnel: lean into them before they reach you',question:'Each gust pushes you toward a thorned wall. Which side of the draft do you ride it on?',
     decor:[{k:'chimes',c:4,r:17},{k:'funnel',c:15,r:1}],winds:[{c:14,r:3,w:5,h:15,dx:0,dy:UP},{c:14,r:11,w:5,h:2,dx:150,dy:0},{c:14,r:6,w:5,h:2,dx:-150,dy:0}],map:funnel.rows()},
   ]},
 ],
};
