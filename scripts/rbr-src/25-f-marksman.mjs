// Room by Room · 25. The Fractured Marksman. Source for public/bladefall-rbr-25-f-marksman.js (node scripts/rbr-src/gen.mjs 25).
// Rebuilt by hand for the 7.280 Fractured brief (docs/plans/fractured-hard.md, stage II): harder than Hollow Marksman,
// with fault stone (glyph T, room field `fault`) as the region's new device. The road runs right to left (the
// reflected canyon). In order: fault alone (The Seam), fault chained, then fault with the watch's bows and the parry,
// then the boss on fault perches.
// SKIPS
import {grid} from './build.mjs';

const PIT=(g,c0,c1)=>g.rect(c0,21,c1,21,'^').rect(c0,22,c1,22,'#');

// 1 · The Seam — fault stone alone: a strip that cracks behind you, two perches, a cracked wall, the ledge.
const seam=grid().frame();
seam.rect(34,18,39,22,'#');PIT(seam,1,33);
seam.rect(26,18,33,18,'T')                 // the strip off the camp shelf: run it out
 .rect(19,16,21,16,'T')                    // a perch, two up
 .rect(10,13,12,13,'T')                    // a perch, three up and six across: jump and dash
 .rect(5,5,6,11,'T')                       // the cracked wall: hold it and it goes
 .rect(1,5,3,22,'#').rect(0,1,0,4,'.')     // the far ledge and the way on
 .put(37,17,'P');

// 2 · The Cracked Shaft — fault chained: ledges up a shaft, left and right, every one a jump and a dash from the last.
const shaft=grid().frame();
shaft.rect(33,19,39,22,'#');PIT(shaft,1,32);
shaft.rect(25,16,27,16,'T').rect(18,13,20,13,'T').rect(28,10,30,10,'T').rect(21,7,23,7,'T').rect(11,4,13,4,'T')   // no ledge over another
 .rect(1,5,4,22,'#').rect(5,6,5,20,'>').rect(0,1,0,4,'.')   // the far wall is thorned: only the ledges go up
 .put(36,18,'P');

// 3 · The Bow Line — the watch bow fires along a cracked walkway. The door is sealed high in the far wall; a bolt
// sent up-left from the second strip breaks it, and that strip will not wait for you.
const bowline=grid().frame();
bowline.rect(34,18,39,22,'#');PIT(bowline,3,33);
bowline.rect(0,9,2,22,'#').rect(1,17,2,17,'.')        // the far wall, the bow's slot
 .rect(0,5,0,8,'.')                                    // the doorway (the husk fills its mouth)
 .rect(22,18,33,18,'T').rect(10,18,18,18,'T')
 .put(37,17,'P');

// 4 · Windcut Seams — two bolt lines over a drop no dash crosses, a cracked perch between them and a cracked face at
// the far side: meet each falling bolt in the air and the dash comes back.
const air=grid().frame();
air.rect(35,18,39,22,'#');PIT(air,1,34);
air.rect(1,1,34,3,'#').rect(28,2,28,3,'.').rect(12,2,12,3,'.')
 .rect(20,16,22,16,'T')
 .rect(1,8,2,22,'#').rect(3,7,4,13,'T').rect(0,4,0,7,'.')
 .put(37,17,'P');

// 5 · Mantlet Seams — the slits rain into the pits and the mantlet roof runs the works; the floor between the pits is
// cracked, so there is no waiting under the roof: run with it. Past the last slit, a cracked ledge up to the door.
const works=grid().frame();
works.rect(34,18,39,22,'#').rect(1,1,38,7,'#');PIT(works,5,33);
for(const c of [30,22,14])works.rect(c,5,c,7,'.');
works.rect(31,18,33,18,'T').rect(23,18,29,18,'T').rect(15,18,21,18,'T')     // cracked floor, a slit's pit between each
 .rect(7,14,9,14,'T').rect(0,13,4,22,'#').rect(0,8,0,12,'.')
 .put(36,17,'P');

// 6 · The Brass Release — the gate in the far wall is released by a survey stake at the top of a chimney of thorns
// over the cracked walk; only a bolt goes up it. The bow is in the far wall's foot. The recruit's echo waits by the
// cracked chimney at the near end (side, up: his watchtower).
const release=grid().frame();
release.rect(31,18,39,22,'#');PIT(release,6,30);
release.rect(0,8,5,22,'#').rect(1,17,5,17,'.')                    // the far block, the bow's slot in its foot
 .rect(0,4,0,7,'.').rect(1,4,1,7,'G')                              // the released gate
 .rect(6,18,11,18,'T').rect(14,18,24,18,'T').rect(27,18,30,18,'T')   // the cracked walk, broken twice
 .rect(17,1,23,9,'#').rect(19,3,21,9,'v').rect(19,1,21,2,'.').put(20,2,'c')   // the thorn chimney, its stake
 .rect(31,15,34,17,'#').rect(35,1,36,12,'T').rect(37,0,38,0,'.')    // the near wall (stops the bolt) and the cracked chimney up
 .put(37,17,'P');

// 10 · Deadeye Court — the Marksman on his tower, his lens warding him. The camp shelf is cover (his lines break on its
// wall), and everything out in the court is fault stone over thorns: step out to meet an arrow, then move.
const court=grid().frame();
court.rect(31,12,39,22,'#').rect(34,12,38,14,'.');PIT(court,10,30);       // the camp shelf behind its parapet
court.rect(0,18,9,22,'#').rect(6,7,8,13,'#').rect(5,7,5,13,'<').rect(9,7,9,13,'>').rect(6,14,8,17,'G').rect(7,0,8,0,'.').rect(0,14,0,17,'.')
 .rect(19,4,20,4,'#')
 .rect(25,12,27,12,'T').rect(13,9,15,9,'T').rect(18,14,20,14,'T')
 .put(37,14,'P');

// 9 · Deadeye Approach — everything the road has taught, in one breath: a cracked runway under a line of bolts, a
// cracked perch, the second line met in the air, and the tear the court's watch left open over the last of the drop.
const approach=grid().frame();
approach.rect(33,18,39,22,'#');PIT(approach,1,32);
approach.rect(1,1,32,3,'#').rect(28,2,28,3,'.').rect(14,2,14,3,'.')
 .rect(24,18,32,18,'T').rect(17,15,19,15,'T')
 .rect(1,8,5,22,'#').rect(0,4,0,7,'.')
 .put(36,17,'P');

// 11 · The Court Tiers — he hunts from three perches; the court's tiers are cracked stone over thorns, and they come
// back two seconds after they fall. From his perch over the camp only the tiers are in his line.
const tiers=grid().frame();
tiers.rect(32,18,39,22,'#');PIT(tiers,8,31);
tiers.rect(0,18,7,22,'#').rect(1,14,1,17,'G').rect(0,14,0,17,'.')   // the far floor and the gate he keeps shut
 .rect(2,6,6,6,'#').rect(20,3,20,3,'#').rect(33,7,38,7,'#').rect(5,0,7,0,'.')   // his three perches (his first over the camp)
 .rect(24,15,26,15,'T')                                        // the first tier: in the line of his perch over the camp
 .rect(15,18,23,18,'T')                                        // the court floor, cracked
 .rect(8,14,10,14,'T')                                         // the second tier: in the line of the high perch
 .rect(12,12,14,12,'T')                                        // the third: in the line of his last
 .put(36,17,'P');

// 12 · The Last Perch — over the court's drop; his arrows are your only second dash, and the two stepping stones
// crack. He falls with the last.
const perch=grid().frame();
perch.rect(33,18,39,22,'#');PIT(perch,1,32);perch.rect(32,13,32,22,'#').rect(32,12,32,12,'^');   // the camp parapet: from behind it, he cannot see you
perch.rect(8,6,8,6,'#').rect(20,4,20,4,'#')                    // his two perches: low on the left, high in the middle
 .rect(1,4,4,5,'#').rect(1,1,1,3,'G').rect(0,1,0,3,'.')   // the gate he keeps, up on the far wall
 .rect(24,15,26,15,'T')                                        // the first stepping stone off the parapet
 .rect(16,15,18,15,'T')                                        // in the line of his low perch
 .rect(10,12,12,12,'T')                                        // in the line of his high one
 .rect(1,12,5,12,'T')                                          // under the far wall: the low perch's other line
 .put(37,17,'P');

// The recruit's watchtower, remembered (echo rooms). The stair: thorns up both walls, cracked ledges, and the only
// second dashes in the shaft are the bows' bolts, one across and one down.
const qstair=grid().frame();
qstair.rect(1,1,5,22,'#').rect(34,1,38,22,'#').rect(6,1,6,20,'>').rect(33,1,33,20,'<').rect(6,21,33,22,'#')
 .rect(34,12,37,12,'.').rect(7,1,32,2,'#').rect(7,3,32,3,'v').rect(24,1,24,3,'.')
 .rect(13,20,32,20,'^')                                            // the fallen floors: thorns, all but the stair foot
 .rect(15,17,17,17,'T').rect(22,14,24,14,'T').rect(28,10,30,10,'T').rect(21,7,23,7,'T').rect(14,5,16,5,'T')
 .rect(14,0,17,3,'.')
 .put(10,20,'P');
// The top of the tower: the helmet sealed in the old screen on the beam, a watchman on the far parapet; cracked steps
// over the thorns. The window on the right leads back down.
const qtop=grid().frame();
qtop.rect(0,18,39,22,'#').rect(7,18,32,18,'^').rect(1,9,6,17,'#').rect(7,9,7,17,'>')
 .rect(20,7,24,7,'#').put(22,6,'*')
 .rect(28,14,29,14,'T').rect(24,11,25,11,'T').rect(14,13,16,13,'T').rect(10,10,11,10,'T')
 .rect(39,11,39,15,'.').rect(37,16,39,17,'#')
 .put(35,17,'P');

export default {
 n:25,name:'The Fractured Marksman',kit:['dash','strike','parry'],
 folk:{
  daro:{cloak:'#786b51',trim:'#c8a050',skin:'#c9a07a',cap:true},
  recruit:{cloak:'#5c6a4a',trim:'#d8b875',skin:'#e0bc96',cap:true,spear:true},
 },
 props:{
  mantlet:[[0,-13,9,11,'#6b4e2e'],[2,-13,1,11,'#4a3520'],[5,-13,1,11,'#4a3520'],[0,-13,9,1,'#c09a60'],[1,-2,1,2,'#3a2a1a'],[7,-2,1,2,'#3a2a1a']],
  target:[[3,-6,2,6,'#5a4a3a'],[1,-13,6,7,'#d8cfb4'],[2,-12,4,5,'#b44a3a'],[3,-11,2,3,'#d8cfb4'],[3,-10,2,1,'#b44a3a']],
 },
 blurb:'The watch is empty. The archers are still at their posts, facing the other way. The canyon road has cracked along its seams.',
 outro:'The last perch is behind you. The bridge you crossed is in front of you again.',
 note:'Rebuilt for the 7.280 Fractured brief: fault stone, the bows, the parry. See the header of scripts/rbr-src/25-f-marksman.mjs.',
 rooms:[
  {id:'fm25-seam',name:'The Seam',exit:'left',study:true,fault:{},hint:'Cracked stone falls where you touched it · then the crack runs along it',
   question:'Every stone here cracks when you touch it. Where is the next one, before you land on this?',map:seam.rows()},
  {id:'fm25-shaft',name:'The Cracked Shaft',exit:'left',study:true,fault:{},hint:'Each ledge cracks when you land · leave it before it goes',
   question:'Five ledges up the shaft, and none of them will hold you twice. Which way is the next one?',map:shaft.rows()},
  {id:'fm25-bowline',name:'The Bow Line',exit:'left',study:true,fault:{},hint:'A bow swells before it shoots · hold up and away as you parry and the bolt flies that way',
   question:'The door is sealed high in the far wall, and the only place to send a bolt from is cracked. When do you step onto it?',
   foes:[{kind:'spit',x:1,y:17,dir:[1,0],every:60,offset:20},{kind:'husk',x:1,y:5,w:2,h:4}],map:bowline.rows()},
  {id:'fm25-air',name:'Windcut Seams',exit:'left',study:true,fault:{},hint:'Every bolt you meet in the air is another dash · the perch and the face both crack',
   question:'Two lines of bolts over a drop no dash crosses. Where in each line do you meet one?',
   foes:[{kind:'spit',x:28,y:2,dir:[0,1],every:30,speed:120},{kind:'spit',x:12,y:2,dir:[0,1],every:30,speed:120,offset:15}],map:air.rows()},
  {id:'fm25-works',name:'Mantlet Seams',exit:'left',study:true,fault:{},hint:'A mantlet takes the bolts that would take you · nothing between the pits will wait',
   question:'The roof keeps the slits off you, and the floor under it cracks. When do you leave the camp stone?',
   foes:[{kind:'spit',x:30,y:5,dir:[0,1],every:5,speed:160},{kind:'spit',x:22,y:5,dir:[0,1],every:5,speed:160},{kind:'spit',x:14,y:5,dir:[0,1],every:5,speed:160}],
   decks:[{c:31,r:11,w:4,h:1,to:[-24,0],period:400}],map:works.rows()},
  {id:'fm25-release',name:'The Brass Release',exit:'left',side:'up',study:true,fault:{},hint:'Thorns stop you, not a bolt · a stake lit opens the gate',
   question:'The stake is at the top of a chimney of thorns, over a walk that will not hold you. When do you stand under it?',
   foes:[{kind:'spit',x:1,y:17,dir:[1,0],every:70,offset:13}],
   people:[{who:'recruit',c:33,r:14,face:-1,quest:'recruit-echo',line:'I made the crossing. I keep making it, to be sure I did.',lineDone:'You came up behind me. I didn’t duck.',name:'THE RECRUIT’S ECHO'}],
   map:release.rows()},
  {id:'fm25-approach',name:'Deadeye Approach',exit:'left',study:true,fault:{},hint:'Everything the road has taught, in one breath · a tear carries you where no dash goes',
   question:'A line of bolts over a cracked runway, a cracked perch, a second line, and a tear. When do you go through each line?',
   foes:[{kind:'spit',x:28,y:2,dir:[0,1],every:30,speed:120},{kind:'spit',x:14,y:2,dir:[0,1],every:30,speed:120,offset:10}],
   lines:[{a:[11,12],b:[6,7],setDown:true}],map:approach.rows()},
  {id:'fm25-court',name:'Deadeye Court',exit:'left',study:true,fault:{},hint:'His lens turns your returns aside · the shelf wall takes his arrows, and yours',
   question:'Behind the wall he cannot hit you, and you cannot hit him. Where do you step out to, and where after that?',
   marksman:{perches:[{c:7,r:6},{c:19,r:3}],hits:2,leave:'up',ward:'lens',every:90,tell:30,first:40,volley:2,gap:16,rain:{on:'leap',w:5,n:5}},
   combat:{waitForMove:true,enemies:[],receivers:[{id:'lens',x:258,y:38}],doors:[]},map:court.rows()},
  {id:'fm25-tiers',name:'The Court Tiers',exit:'left',study:true,fault:{fuse:58,spread:4,rest:90},hint:'He leaps to a new perch each time one of his own finds him · a tier in his line holds you a moment, then cracks',
   question:'Three perches for him, three cracked tiers for you. Which tier sees his next perch, and is it standing yet?',
   marksman:{perches:[{c:33,r:6},{c:20,r:2},{c:6,r:5}],hits:3,leave:'up',every:100,tell:20,first:50,speed:220,volley:2,gap:12,rain:{on:'leap',w:5,n:5}},map:tiers.rows()},
  {id:'fm25-perch',name:'The Last Perch',exit:'left',study:true,fault:{fuse:62,spread:4,rest:90},hint:'His arrows come in pairs · a stone in his line holds you just long enough to answer, then cracks',
   question:'Cracked stones over the drop, and only one solid ledge, by his gate. Which stone is in his line, and when do you land on it?',
   marksman:{perches:[{c:8,r:5},{c:20,r:3}],hits:3,leave:'fall',every:110,tell:18,first:30,speed:220,volley:2,gap:12},map:perch.rows()},
 ],
 quests:[
  {id:'recruit-echo',title:'The Crossing Twice',giver:'The recruit’s echo',from:'fm25-release',back:{c:37,r:17},needs:'recruit-helmet',
   keepsake:{id:'recruit-remembered',name:'The Recruit, remembered',gives:'He crossed the bridge with his head up, every time after. Shown at the end.'},
   rooms:[
    {id:'fm25-q-stair',name:'The Watchtower Stair',exit:'up',study:true,fault:{},hint:'Thorns up both walls · every ledge cracks · every bolt you meet in the air is a dash',
     question:'The floors have fallen in, the walls are thorned and the ledges crack. What carries you from one to the next?',
     foes:[{kind:'spit',x:37,y:12,dir:[-1,0],every:45,offset:10},{kind:'spit',x:24,y:1,dir:[0,1],every:36,speed:120}],
     map:qstair.rows()},
    {id:'fm25-q-top',name:'The Ruined Watchtower',exit:'right',study:true,fault:{},hint:'A returned shot breaks a husk · the watchman shoots what he can see · the steps crack',
     question:'The helmet is sealed in the old screen on the beam, over thorns and cracked steps. Whose arrow opens it, and from where?',
     foes:[{kind:'husk',x:21,y:4,w:3,h:3}],
     combat:{waitForMove:true,enemies:[{kind:'sentry',x:18,y:56,delay:20}],receivers:[],doors:[]},
     people:[{who:'recruit',name:'THE RECRUIT’S ECHO',c:24,r:6,quest:'recruit-echo',line:'The helmet was never what held me up.',lineDone:'I can put it down now. The bridge will still be there.'}],
     map:qtop.rows()},
   ]},
 ],
};
