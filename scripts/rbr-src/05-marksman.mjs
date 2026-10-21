// Room by Room · 5. Hollow Marksman. Source for public/bladefall-rbr-05-marksman.js (node scripts/rbr-src/gen.mjs 05).
// The base game's Marksman Road (Shotfall Camp, Watching Road, Mantlet Works, Windcut Gallery, Deadeye Court) as twelve
// screens: nine on the road, three for the boss. Kit: dash, blade and the parry, which this region grants. Mara got to
// the watch first; at the top of Shotfall Camp she says how ("meet it, and it goes home"), and the camp itself still
// locks the parry. The device is the returned shot: the foes' bolts (bladefall-pcore-foes.js) and the Combat
// watchman, coils and doors (bladefall-pcore-combat.js), with Thunder Cliffs' moving decks as mantlets. In order:
//   seen (Shotfall Camp: a bow fires along the road on a beat; jump it, or let stone take it)
//   → alone (Shotfall Watch: one bow and a coil at its slot; meet the bolt and it goes back the way it came)
//   → aimed (The Watching Road: from the right spot, a bolt sent up-right breaks the husk in the high door)
//   → fells a foe (The Watchpost: a watchman on a thorned tower takes two of his own arrows)
//   → cover and timing (Mantlet Works: walk under a moving mantlet roof through the slits; the last slit's coil
//     only when the roof has gone)
//   → a returned bolt is a second dash (Windcut Drop: one, which also breaks the far door; Windcut Gallery: two)
//   → with an earlier thing (The Brass Release: an Outskirts survey stake at the top of a thorn chimney, lit by a bolt)
//   → synthesis (Deadeye Approach: a slit and its mantlet, a coil for the far door, a line to climb on)
//   → the Hollow Marksman, three rooms (Deadeye Court, The Court Tiers, The Last Perch).
// The boss is new code: public/bladefall-pcore-dev-rbr-marksman.js (+ -view.js). He aims at the knight, looses marked
// arrows that are ordinary foe bolts (so the shared parry answers them and stone and mantlets stop them), leaps to his
// next perch when one of his own finds him, and leaves or falls. Deadeye Court: his lens wards him until one of his
// arrows is turned into it. The Court Tiers: three perches and a mantlet riding across his lines. The Last Perch:
// nothing crosses the drop but his arrows, met in the air.
// Quests (optional): Daro · The Open Watch (a bearing: his token on Windcut Gallery's high shelf, one more parry up; he
// waits at the far gate in Deadeye Approach) and the Recruit · Borrowed Courage (a two-room branch up the ruined
// watchtower from The Brass Release; his helmet on the beam at the top).
// SKIPS
import {grid} from './build.mjs';

const PRE=['parry','portal'];   // rooms before the grant: the parry is locked

// 1 · Shotfall Camp — the watch bow is seen: it fires along the road on a beat. No parry yet.
const camp=grid().frame();
camp.rect(0,18,39,22,'#').rect(33,9,39,17,'#').rect(39,4,39,8,'.')
 .rect(33,17,36,17,'.')                                  // the bow's slot, too deep for a blade
 .rect(16,16,17,17,'#').rect(24,16,25,17,'#')           // stone shelters
 .rect(19,18,22,18,'^').rect(27,18,30,18,'^')
 .put(3,17,'P');

// 2 · Shotfall Watch — one bow, one coil at its slot, one door. Meet the bolt and it goes home.
const watch=grid().frame();
watch.rect(0,18,39,22,'#').rect(33,1,39,17,'#')
 .rect(33,11,39,14,'.')                                  // the doorway, behind the coil door
 .rect(33,17,37,17,'.')                                  // the bow's slot
 .put(3,17,'P');

// 3 · The Watching Road — the door is high in the wall, sealed with a husk; the bow fires along the floor.
const road=grid().frame();
road.rect(0,18,39,22,'#').rect(32,1,39,17,'#')
 .rect(32,6,39,9,'.')                                    // the high doorway (the husk fills its mouth)
 .rect(32,17,36,17,'.')                                  // the bow's slot
 .rect(26,18,31,18,'^')
 .put(3,17,'P');


// 4 · The Watchpost — a watchman on a thorned tower aims where you stand; two of his own fell him and open the gate in
// the tower's foot.
const post=grid().frame();
post.rect(0,18,39,22,'#').rect(9,15,10,17,'#').rect(19,15,20,17,'#').rect(13,18,16,18,'^').rect(23,18,27,18,'^')
 .rect(31,8,33,13,'#').rect(30,8,30,13,'<').rect(34,8,34,13,'>').rect(39,14,39,17,'.').put(3,17,'P');

// 5 · Mantlet Works — slits rain over the pits and a mantlet roof runs the works: walk under it. The last slit is slow,
// with a coil at its mouth that opens the door, and the roof parks over it at the end of its track.
const works=grid().frame();
works.rect(0,18,39,22,'#').rect(1,1,38,7,'#');
for(const c of [12,19,26]){works.rect(c,5,c,7,'.').rect(c-2,18,c+2,22,'.');}   // pits: the sheets fall out of the world
works.rect(33,5,33,7,'.').rect(39,14,39,17,'.').put(3,17,'P');

// 6 · Windcut Drop — one bolt line over the pit; the far landing is sealed with a husk.
const drop=grid().frame();
drop.rect(0,18,6,22,'#').rect(7,21,24,21,'^').rect(7,22,24,22,'#').rect(1,1,24,4,'#').rect(19,3,19,4,'.')
 .rect(24,15,39,22,'#').rect(24,16,24,20,'<').rect(25,1,39,10,'#').rect(39,11,39,14,'.').put(2,17,'P');

// 7 · Windcut Gallery — two bolt lines over a long drop; each is a dash in the air. Daro's token on the high shelf.
const gallery=grid().frame();
gallery.rect(0,18,4,22,'#').rect(5,21,31,21,'^').rect(5,22,31,22,'#').rect(1,1,32,4,'#').rect(17,3,17,4,'.').rect(25,3,25,4,'.')
 .rect(32,15,39,22,'#').rect(32,16,32,20,'<').rect(33,1,39,10,'#').rect(39,11,39,14,'.')
 .rect(26,8,28,8,'#').put(27,7,'*').put(2,17,'P');

// 8 · The Brass Release — the gate on the far block is released by a survey stake (the Outskirts' stakes) at the top of
// a chimney of thorns: no hand or blade reaches it, but a bolt passes thorns. Stand under it and send the bow's bolt
// up. The Recruit waits by the watchtower stair (side, up, at the far left).
const release=grid().frame();
release.rect(0,18,8,22,'#').rect(9,21,30,21,'^').rect(9,22,30,22,'#').rect(31,18,39,22,'#').rect(11,16,28,16,'=')
 .rect(35,8,39,17,'#').rect(35,17,38,17,'.').rect(39,4,39,7,'.').rect(38,4,38,7,'G')
 .rect(1,0,2,0,'.').rect(3,1,4,12,'#')
 .rect(3,1,7,8,'#').rect(10,1,12,8,'#').rect(8,3,9,8,'v').put(8,2,'c').put(2,17,'P');

// 10 · Deadeye Court — the Marksman on his tower, warded by the lens on the far wall. The court gate is the tower's foot.
// His arrows come in pairs (volley:2): send the first into the lens and the second straight back.
const court=grid().frame();
court.rect(0,18,39,22,'#').rect(31,7,33,13,'#').rect(30,7,30,13,'<').rect(34,7,34,13,'>').rect(31,14,33,17,'G').rect(31,0,32,0,'.')
 .rect(1,4,2,7,'#').rect(39,14,39,17,'.').put(3,17,'P');

// 9 · Deadeye Approach — everything the road has taught: a slit and its mantlet, a coil for the far door, a line to climb on.
const approach=grid().frame();
approach.rect(0,18,13,22,'#').rect(1,1,13,5,'#').rect(9,3,9,5,'.').rect(7,18,11,22,'.')
 .rect(14,21,33,21,'^').rect(14,22,33,22,'#').rect(15,16,22,16,'=')
 .rect(34,8,39,22,'#').rect(33,8,33,20,'<').rect(34,17,38,17,'.').rect(34,1,39,3,'#').rect(39,4,39,7,'.')
 .rect(28,1,33,3,'#').rect(29,2,29,3,'.').put(2,17,'P');

// 11 · The Court Tiers — he hunts from three perches; a mantlet rides up and down over the court. From each new perch his
// first draw is a rain (rain:{on:'leap'}): the band under you is marked red through his draw; leave it, or be under stone.
const tiers=grid().frame();
tiers.rect(0,18,39,22,'#').rect(8,18,12,18,'^').rect(20,18,24,18,'^').rect(13,15,19,17,'#').rect(25,12,31,17,'#')
 .rect(34,5,38,5,'#').rect(1,7,6,7,'#').rect(18,3,20,3,'#').rect(19,0,21,0,'.')
 .rect(38,14,38,17,'G').rect(39,14,39,17,'.').put(3,17,'P');

// 12 · The Last Perch — over the court's drop; his arrows are your only second dash. He looses them in pairs (volley:2):
// meet the first, and the second is still coming. Three hits; for the last he crosses to a perch level with the shelf,
// and it is a straight duel across the room. He falls with the last.
const perch=grid().frame();
perch.rect(0,18,6,22,'#').rect(7,21,38,21,'^').rect(7,22,38,22,'#').rect(18,14,20,15,'#')
 .rect(30,8,33,9,'#').rect(35,4,38,5,'#').rect(38,1,38,3,'G').rect(39,1,39,3,'.').put(2,17,'P')
 .rect(9,5,11,5,'#');   // 7.277: his third perch, across the room level with the shelf: the last duel is a straight line

// The Recruit's watchtower (quest rooms). The stair: the floors have fallen in, both walls are thorned and the old
// planks have thorns under them; the only second dashes in the shaft are the bolts of its bows, one across, one down.
const qstair=grid().frame();
qstair.rect(1,1,5,22,'#').rect(34,1,38,22,'#').rect(6,21,33,22,'#').rect(7,0,12,0,'.').rect(14,1,33,2,'#').rect(13,1,13,2,'<').rect(14,3,17,3,'v').rect(19,3,32,3,'v').rect(18,1,18,2,'.')
 .rect(6,1,6,20,'>').rect(33,1,33,20,'<')
 .rect(6,18,12,18,'#').rect(27,11,32,11,'=').rect(27,12,32,12,'v').rect(7,5,12,5,'=').rect(7,6,12,6,'v')
 .rect(33,13,37,13,'.')
 .put(10,20,'P');
// The top of the tower: the helmet sealed in the old woven screen on the beam, a watchman on the far parapet; stone
// steps up over the flowers. The window on the left leads back down.
const qtop=grid().frame();
qtop.rect(0,18,39,22,'#').rect(10,18,30,18,'^').rect(15,7,19,7,'#').put(17,6,'*').rect(33,9,38,17,'#').rect(32,9,32,17,'<')
 .rect(9,14,10,14,'#').rect(12,11,13,11,'#').rect(0,11,0,15,'.').rect(0,16,2,17,'#').put(4,17,'P');

export default {
 n:5,name:'Hollow Marksman',kit:['dash','strike','parry'],
 props:{
  mantlet:[[0,-13,9,11,'#6b4e2e'],[2,-13,1,11,'#4a3520'],[5,-13,1,11,'#4a3520'],[0,-13,9,1,'#c09a60'],[1,-2,1,2,'#3a2a1a'],[7,-2,1,2,'#3a2a1a']],
  target:[[3,-6,2,6,'#5a4a3a'],[1,-13,6,7,'#d8cfb4'],[2,-12,4,5,'#b44a3a'],[3,-11,2,3,'#d8cfb4'],[3,-10,2,1,'#b44a3a']],
 },
 folk:{
  daro:{cloak:'#786b51',trim:'#c8a050',skin:'#c9a07a',cap:true},
  recruit:{cloak:'#5c6a4a',trim:'#d8b875',skin:'#e0bc96',cap:true,spear:true},
 },
 blurb:'The canyon road under the watch, from Shotfall Camp to Deadeye Court. The parry: meet a bolt and it goes back the way you send it.',
 outro:'Marksman Road, end to end, under the watch.',
 note:'See the header of scripts/rbr-src/05-marksman.mjs.',
 rooms:[
  {id:'m5-camp',name:'Shotfall Camp',exit:'right',lock:PRE,study:true,hint:'A bow swells before it shoots · stone stops a bolt',
   question:'The watch bow fires along the road on a beat. Where are you when it shoots?',
   foes:[{kind:'spit',x:36,y:17,dir:[-1,0],every:70,offset:50}],
   people:[{who:'daro',c:10,r:17,face:1,quest:'daro',leave:'right',line:'The old watch token’s got my mark on it. I left it up above the gallery, and I’d like it back. I’ll be at the far gate, out of the line of fire.'},
    {who:'mara',c:36,r:8,face:-1,leave:'right',line:'You again. The watch has shot at me all morning. Meet the bolt. Don’t duck it.'}],
   decor:[{k:'tent',c:2,r:17},{k:'watchfire',c:6,r:17},{k:'trumpets',c:13,r:17}],map:camp.rows()},
  {id:'m5-watch',name:'Shotfall Watch',exit:'right',study:true,hint:'F parries · a bolt you meet in time goes back the way it came',
   question:'The bolt passes the brass coil on its way out. What changes on its way back?',
   foes:[{kind:'spit',x:37,y:17,dir:[-1,0],every:110,offset:40}],
   combat:{waitForMove:true,enemies:[],receivers:[{id:'watch',x:252,y:134}],doors:[{x:264,y:88,w:8,h:32,coils:['watch']}]},
   decor:[{k:'palisade',c:4,r:17},{k:'mast',c:12,r:17},{k:'target',c:20,r:17}],map:watch.rows()},
  {id:'m5-road',name:'The Watching Road',exit:'right',study:true,hint:'Hold a direction as you parry and the bolt flies that way · only a thrown thing breaks a husk',
   question:'The door is high in the wall and the bolt runs along the floor. Where do you stand to send it up there?',
   foes:[{kind:'spit',x:36,y:17,dir:[-1,0],every:120,offset:50},{kind:'husk',x:32,y:6,w:1,h:4}],
   decor:[{k:'milestone',c:6,r:17},{k:'mantlet',c:12,r:17}],map:road.rows()},
  {id:'m5-post',name:'The Watchpost',exit:'right',study:true,hint:'A watchman aims where you stand and shoots what he can see · his own arrows fell him',
   question:'The watchman on the pillar is out of reach. What of his can reach him?',
   combat:{waitForMove:true,enemies:[{kind:'sentry',x:254,y:48,ward:'post',delay:40}],receivers:[],doors:[{x:248,y:112,w:24,h:32,ward:'post'}]},
   decor:[{k:'palisade',c:5,r:17},{k:'mantlet',c:36,r:17}],map:post.rows()},
  {id:'m5-works',name:'Mantlet Works',exit:'right',study:true,hint:'A mantlet takes the bolts that would take you',
   question:'The roof keeps the slits off you, and it parks over the one slit you need. When do you leave it?',
   foes:[{kind:'spit',x:12,y:5,dir:[0,1],every:5,speed:160},{kind:'spit',x:19,y:5,dir:[0,1],every:5,speed:160},{kind:'spit',x:26,y:5,dir:[0,1],every:5,speed:160},
    {kind:'spit',x:33,y:5,dir:[0,1],every:50,speed:120}],
   decks:[{c:7,r:11,w:4,h:1,to:[24,0],period:480}],
   combat:{waitForMove:true,enemies:[],receivers:[{id:'works',x:263,y:64}],doors:[{x:304,y:112,w:8,h:32,coils:['works']}]},
   decor:[],map:works.rows()},
  {id:'m5-drop',name:'Windcut Drop',exit:'right',study:true,hint:'A parry gives your dash back, in the air too',
   question:'The pit is wider than one dash and the far door is sealed. What does one bolt do for you?',
   foes:[{kind:'spit',x:19,y:3,dir:[0,1],every:30,speed:120},{kind:'husk',x:25,y:11,w:2,h:4}],
   decor:[],map:drop.rows()},
  {id:'m5-gallery',name:'Windcut Gallery',exit:'right',study:true,bearing:'TOKEN',hint:'Every bolt you meet in the air is another dash',
   question:'Two lines of bolts over a drop no dash crosses. How many dashes is that?',
   foes:[{kind:'spit',x:17,y:3,dir:[0,1],every:30,speed:120},{kind:'spit',x:25,y:3,dir:[0,1],every:30,speed:120,offset:15}],
   decor:[],map:gallery.rows()},
  {id:'m5-release',name:'The Brass Release',exit:'right',side:'up',study:true,hint:'Thorns stop you, not a bolt · a stake lit opens the gate',
   question:'The stake is at the top of a chimney of thorns. What can go up it for you?',
   foes:[{kind:'spit',x:38,y:17,dir:[-1,0],every:110,offset:30}],
   people:[{who:'recruit',c:5,r:17,face:1,quest:'recruit',line:'I can make the crossing. I can. My helmet’s up the tower, that’s all.',lineDone:'That’s my uncle’s. Right. The bridge.'}],
   decor:[],map:release.rows()},
  {id:'m5-approach',name:'Deadeye Approach',exit:'right',study:true,hint:'Everything the road has taught, in one breath',
   question:'A slit, a coil and a line of bolts: in what order, and where do you stand for each?',
   foes:[{kind:'spit',x:9,y:3,dir:[0,1],every:5,speed:160},{kind:'spit',x:38,y:17,dir:[-1,0],every:100,offset:20},{kind:'spit',x:29,y:2,dir:[0,1],every:30,speed:120}],
   decks:[{c:5,r:12,w:4,h:1,to:[7,0],period:220}],
   combat:{waitForMove:true,enemies:[],receivers:[{id:'approach',x:175,y:55}],doors:[{x:304,y:32,w:8,h:32,coils:['approach']}]},
   people:[{who:'daro',c:34,r:7,face:-1,quest:'daro',chart:true,line:'Out of the line of fire, for once. Did you find my token?',lineDone:'That’s my mark. Cut it before any of them wore masks. It goes back on my post, where it belongs.'},
    {who:'mara',c:36,r:7,face:-1,line:'He’s in the court. I’m not going in. I’ve been shot at enough for one morning.'}],
   decor:[],map:approach.rows()},
  {id:'m5-court',name:'Deadeye Court',exit:'right',study:true,hint:'His lens turns your returns aside · break the lens with one of his own arrows · they come in pairs',
   question:'His arrows come straight at you, and straight back they glance off the lens. Where else can one go?',
   marksman:{perches:[{c:31,r:6}],hits:1,leave:'up',ward:'lens',every:110,tell:36,first:60,volley:2,gap:18},
   combat:{waitForMove:true,enemies:[],receivers:[{id:'lens',x:24,y:40}],doors:[]},
   decor:[],map:court.rows()},
  {id:'m5-tiers',name:'The Court Tiers',exit:'right',study:true,hint:'He leaps to a new perch each time one of his own finds him · from each new perch he looses a rain where you stand',
   question:'He changes perch after every hit. Where do you stand to see each one, and when is the mantlet out of the way?',
   marksman:{perches:[{c:34,r:4},{c:6,r:6},{c:20,r:2}],hits:3,leave:'up',every:120,tell:36,first:60,rain:{on:'leap',w:5,n:5}},
   decks:[{c:21,r:5,w:2,h:3,to:[0,4],period:240}],
   decor:[],map:tiers.rows()},
  {id:'m5-perch',name:'The Last Perch',exit:'right',study:true,hint:'Meet his arrow in the air and your dash comes back · his arrows come in pairs',
   question:'Nothing but his arrows crosses this drop. Where must you be when he looses?',
   marksman:{perches:[{c:31,r:7},{c:35,r:3},{c:10,r:4}],hits:3,leave:'fall',every:100,tell:32,first:50,volley:2,gap:18},
   decor:[],map:perch.rows()},
 ],
 quests:[
  {id:'daro',title:'The Open Watch',giver:'Daro',bearings:['TOKEN'],
   keepsake:{id:'daro-token',name:'Daro’s Token',gives:'Daro sets his token back on his post at the far gate. In the Fractured Marksman it opens Daro’s echo.'}},
  {id:'recruit',title:'Borrowed Courage',giver:'The Recruit',from:'m5-release',back:{c:3,r:17},
   keepsake:{id:'recruit-helmet',name:'The Recruit’s Helmet',gives:'He wears his uncle’s helmet at the bridge and stops ducking. In the Fractured Marksman it opens the Recruit’s echo.'},
   rooms:[
    {id:'m5-q-stair',name:'The Watchtower Stair',exit:'up',study:true,hint:'Thorns up both walls and under the planks · every bolt you meet in the air is a dash',
     question:'The floors have fallen in and the walls are thorned. What carries you from one ledge to the next?',
     foes:[{kind:'spit',x:37,y:13,dir:[-1,0],every:50,offset:10},{kind:'spit',x:18,y:1,dir:[0,1],every:36,speed:120}],
     map:qstair.rows()},
    {id:'m5-q-top',name:'The Ruined Watchtower',exit:'left',study:true,hint:'A returned shot breaks a husk · the watchman shoots what he can see',
     question:'The helmet is sealed in the old screen on the beam. Whose arrow opens it?',
     foes:[{kind:'husk',x:16,y:4,w:3,h:3}],
     combat:{waitForMove:true,enemies:[{kind:'sentry',x:264,y:56,delay:30}],receivers:[],doors:[]},
     map:qtop.rows()},
   ]},
 ],
};
