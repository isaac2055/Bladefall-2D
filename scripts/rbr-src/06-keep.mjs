// Room by Room · 6. Ruined Keep. Source for public/bladefall-rbr-06-keep.js (node scripts/rbr-src/gen.mjs 06).
// DRAFT
import {grid} from './build.mjs';
// A room mirrored left to right (thorns turn round with it): the Archivist's stack is entered from its right.
const mirror=rows=>rows.map(r=>[...r].reverse().map(c=>c==='<'?'>':c==='>'?'<':c).join(''));

const PRE=['portal'];   // rooms before Tovin hands over the masons' key: the portal is locked

// 1 · Gatehouse Hearth — the keystone is seen: up in the arch, on its plate, holding the gatehouse door.
const hearth=grid().frame();
hearth.rect(0,18,39,22,'#').rect(15,16,17,17,'#').rect(22,18,25,18,'^')
 .rect(30,1,38,8,'#').rect(32,4,36,6,'.').rect(32,7,36,7,'%').put(34,6,'_').put(34,5,'l')
 .rect(31,9,32,17,'H').rect(39,14,39,17,'.').put(2,17,'P');

// 2 · Fallen Refectory — alone: the plate is up on the fallen table, and you cannot climb with the stone.
const refectory=grid().frame();
refectory.rect(0,18,39,22,'#').rect(16,14,27,17,'#').rect(23,14,24,14,'.').put(23,14,'_').put(24,14,'_')
 .rect(32,1,33,17,'H').rect(39,14,39,17,'.').put(5,17,'l').put(2,17,'P');

// 3 · The Long Table — alone, its other half: carried, the stone slows your fall. The hall's floor is gone.
const table=grid().frame();
table.rect(0,10,7,22,'#').rect(8,21,23,21,'^').rect(8,22,23,22,'#').rect(24,14,39,22,'#').put(33,13,'_')
 .rect(36,1,37,13,'H').rect(39,10,39,13,'.').put(2,9,'l').put(1,9,'P');

// 4 · Weight Hall — chained: glide the keystone over the fallen floor, then throw it up onto the cradle shelf.
const weight=grid().frame();
weight.rect(0,8,6,22,'#').rect(7,21,24,21,'^').rect(7,22,24,22,'#').rect(25,16,39,22,'#')
 .rect(30,12,35,15,'#').rect(35,10,35,11,'#').rect(33,12,34,12,'.').put(33,12,'_').put(34,12,'_')
 .rect(37,1,38,15,'H').rect(39,12,39,15,'.').put(2,7,'l').put(1,7,'P');

// 5 · The Cradle — combined with the causeway's lift: the mason's cradle carries you and the stone up; it stops
// short of the plate's shelf, and only a jump as it stops (its speed kept) and the stone's glide reach the shelf.
const cradle=grid().frame();
cradle.rect(0,18,12,22,'#').rect(13,19,38,22,'.').rect(13,21,27,21,'^').rect(13,22,27,22,'#').rect(13,18,16,18,'Z')
 .rect(28,8,39,22,'#').rect(31,8,33,8,'.').put(31,8,'_').put(32,8,'_').put(33,8,'_')
 .rect(36,1,37,7,'H').rect(39,4,39,7,'.').put(3,17,'l').put(2,17,'P');

// 6 · Mason's Quarter — the grant. Tovin hands over the masons' key. One end is fixed beyond the masons' wall;
// yours goes on the pale stone.
const quarter=grid().frame();
quarter.rect(0,18,39,22,'#').rect(20,1,21,17,'#').rect(11,14,11,15,'#').rect(11,16,11,17,'%').rect(21,15,21,16,'%')
 .rect(28,18,31,18,'^').rect(39,14,39,17,'.').put(2,17,'P');

// 7 · The Cells — one end and the keystone: the plate is in a sealed cell. Open your end in the ceiling, then
// jump into it with the stone in your arms, and walk back out the same way.
const cells=grid().frame();
cells.rect(0,18,39,22,'#').rect(8,11,14,13,'#').rect(10,13,11,13,'%')
 .rect(19,3,32,10,'#').rect(20,4,31,9,'.').rect(19,6,19,7,'%').put(26,9,'_')
 .rect(35,1,36,17,'H').rect(39,14,39,17,'.').put(15,17,'l').put(2,17,'P');

// 8 · Split Belfry — both ends are yours. The bell floor is out of reach; the only way up is to come down
// out of the roof over it.
const belfry=grid().frame();
belfry.rect(0,18,39,22,'#').rect(8,18,9,18,'%').rect(26,7,38,8,'#').rect(38,9,38,17,'<').rect(27,0,34,0,'%')
 .rect(39,3,39,6,'.').put(2,17,'P');

// 9 · The Bell Loft — both ends and the keystone: the bell's counterweight plate is up on the loft. You can climb
// to it; the stone cannot. Open a way for it through the roof over the plate.
const loft=grid().frame();
loft.rect(0,18,39,22,'#').rect(12,18,13,18,'%').rect(27,7,38,8,'#').rect(27,9,27,17,'#').rect(31,7,32,7,'.').put(31,7,'_').put(32,7,'_')
 .rect(29,0,34,0,'%').rect(36,1,37,6,'H').rect(39,3,39,6,'.').put(8,17,'l').put(2,17,'P');

// 10 · Clinging Archive — both ends and a fall: the way on is up a column with thorns all round it. A floor end
// remembers how far you fell, and out of a floor you rise as fast as you went in. The Archivist's quest goes up
// the left wall (side 'up').
const archive=grid().frame();
archive.rect(0,18,39,22,'#').rect(1,15,3,15,'#').rect(5,12,7,12,'#').rect(1,9,3,9,'#').rect(5,6,7,6,'#').rect(1,3,3,3,'#').rect(0,1,0,2,'.')
 .rect(18,8,21,17,'#').rect(22,9,22,17,'>').rect(16,18,17,18,'%')
 .rect(25,11,26,17,'#').rect(25,11,26,11,'%').rect(24,12,24,17,'<').rect(27,12,27,17,'>')
 .rect(23,18,24,18,'^').rect(28,18,38,18,'^').rect(38,1,38,17,'<').rect(24,0,27,0,'.').put(2,17,'P');

// 11 · The Upper Stacks — both ends, the fall and the keystone: the stone is up on the stacks, its plate up on
// the far gallery. Out of a floor you rise as fast as you fell in, stone and all; carried, it lets you down gently.
const stacks=grid().frame();
stacks.rect(0,18,39,22,'#').rect(6,8,8,17,'#').rect(2,18,3,18,'%')
 .rect(15,14,16,17,'#').rect(15,14,16,14,'%').rect(14,15,14,17,'<').rect(17,15,17,17,'>')
 .rect(18,18,38,18,'^').rect(22,6,38,7,'#').rect(27,6,28,6,'.').put(27,6,'_').put(28,6,'_')
 .rect(34,1,35,5,'H').rect(39,2,39,5,'.').put(7,7,'l').put(4,17,'P');

// 12 · The Broken Arch — the synthesis. The keystone's dock is sealed in the crown of the great arch, and only a
// shot passes the slit into it. A ward line stops shots across the chasm, so the stone must cross first (glide),
// then both ends go in from the far side, and the stone is carried through the pair to its dock.
const arch=grid().frame();
arch.rect(0,6,7,22,'#').rect(8,21,18,21,'^').rect(8,22,18,22,'#').rect(19,15,39,22,'#')
 .rect(12,1,12,20,'!').rect(25,6,26,14,'#').rect(22,15,23,15,'%')
 .rect(29,1,38,7,'#').rect(31,3,35,5,'.').rect(29,5,30,5,'.').rect(36,4,36,5,'%').put(33,5,'_')
 .rect(37,8,38,14,'H').rect(39,11,39,14,'.').put(5,5,'l').put(2,5,'P');

// The Archivist's Burden (quest rooms). 1 · The Fallen Stack: the first volume's book box lies at the bottom of the
// stack that fell into the cellar, among thorns. Nobody can go down there; an end opened under the box takes it.
const stack=grid().frame();
stack.rect(0,12,11,22,'#').rect(20,12,39,22,'#').rect(12,13,12,20,'>').rect(19,13,19,20,'<')
 .rect(12,21,19,22,'#').rect(13,21,18,21,'^').rect(15,21,16,21,'%').rect(14,12,17,12,'=').put(15,20,'l')
 .rect(29,0,30,0,'%').put(29,11,'_').put(30,11,'_').rect(35,1,36,11,'H').rect(39,8,39,11,'.').put(2,11,'P');   // drawn left to right, played mirrored

// 2 · The Gallery: the second volume is up the gallery's chimney, past the floor that fell. Cracked boards and a
// crystal over the thorns, then a chimney banded with thorns: hold the clean stone, jump to the other wall.
const gallery=grid().frame();
gallery.rect(0,18,8,22,'#').rect(9,18,32,18,'^').rect(9,19,32,22,'#').rect(33,18,39,22,'#')
 .rect(27,16,29,16,'~').rect(20,14,22,14,'~').put(15,12,'o')
 .rect(1,1,1,17,'>').rect(1,14,1,15,'.').rect(1,8,1,9,'.').rect(1,2,1,3,'.')
 .rect(8,1,8,12,'#').rect(7,1,7,12,'<').rect(9,1,9,12,'>').rect(7,10,7,11,'.').rect(7,4,7,5,'.')
 .rect(2,0,6,0,'.').put(37,17,'P');

// 3 · The Rain Shelf: the third volume is on the rain shelf behind the courtyard's rain screen. The masons left
// one end of a doorway on the far side; ride the cradle up to the pale stone and open yours before it goes home.
const rain=grid().frame();
rain.rect(0,18,6,22,'#').rect(7,19,38,22,'#').rect(11,18,22,18,'^').rect(7,18,10,18,'Z')
 .rect(16,1,17,17,'#').rect(15,1,15,17,'<').rect(18,1,18,11,'>').rect(15,7,15,8,'.').rect(16,7,16,8,'%')
 .rect(18,3,18,4,'.').rect(17,3,17,4,'%').rect(19,12,38,18,'#').rect(39,8,39,11,'.').put(33,11,'*').put(2,17,'P');

export default {
 n:6,name:'Ruined Keep',kit:['dash','strike','parry','portal'],
 folk:{
  tovin:{cloak:'#5a5468',trim:'#d6b878',skin:'#c99c7a',cap:true},
  veya:{cloak:'#6e4a52',trim:'#e0c08a',skin:'#d8b08c',hood:true,flame:true},
  idris:{cloak:'#4a5060',trim:'#b8c0cc',skin:'#c8a888',cap:true,staff:true},
  archivist:{cloak:'#5c5070',trim:'#bca4db',skin:'#d4bc9c',hood:true},
 },
 blurb:'A ruined keep that once served people. Its doors are held by weight, its keystone is light in the hand and heavy on a plate, and its masons cut their walls to be opened.',
 outro:'The keep, end to end. The keystone is back in its arch.',
 note:'The keystone (the core lantern) on plates that hold doors, then the portal key. See the header of scripts/rbr-src/06-keep.mjs.',
 rooms:[
  {id:'k6-hearth',name:'Gatehouse Hearth',exit:'right',lock:PRE,hint:'A plate holds its door open while weight rests on it',question:'The gatehouse door stands open. What up in the arch is holding it?',
   people:[{who:'veya',c:8,r:17,face:1,line:'Sit by the fire a minute. The clock says three forty-one. It has said that since before my time.'},
    {who:'tovin',c:21,r:17,face:-1,leave:'right',line:'See the stone up in the arch? Its weight holds the gate. Every door in this keep works that way, and most of them have lost their stones.'}],
   decor:[{k:'hearth',c:5,r:17},{k:'clock',c:12,r:17}],map:hearth.rows()},
  {id:'k6-refectory',name:'Fallen Refectory',exit:'right',lock:PRE,hint:'Grab carries the keystone; grab again throws it · nobody climbs with their arms full',question:'The plate is up on the fallen table, and you cannot climb with the stone in your arms. How does it get up there?',
   decor:[],map:refectory.rows()},
  {id:'k6-table',name:'The Long Table',exit:'right',lock:PRE,hint:'Carried, the keystone slows your fall',question:'The floor of the hall is gone, and no jump or dash reaches the far end. What could hold you up?',
   decor:[],map:table.rows()},
  {id:'k6-weight',name:'Weight Hall',exit:'right',lock:PRE,hint:'Carried, the keystone slows your fall · thrown, it goes where you cannot climb',question:'The plate is up on the shelf across the fallen floor. What does the stone do for you first, and what do you do for it after?',
   decor:[],map:weight.rows()},
  {id:'k6-cradle',name:'The Cradle',exit:'right',lock:PRE,hint:'A lift runs only while you stand on it · jump as it stops and you keep its speed',question:'The cradle stops short of the shelf, and the stone cannot be thrown that high. How do you both get up there?',
   decor:[],map:cradle.rows(),zips:[[0,-9]]},
  {id:'k6-quarter',name:'Mason’s Quarter',exit:'right',hint:'The portal key fires the way you aim · it opens only on pale stone',question:'The masons’ wall goes from floor to roof, and their door is already open on the far side. Where does yours go?',
   portalMode:'one',portals:[{color:'orange',c:21,r:15,face:'r'}],
   people:[{who:'tovin',c:5,r:17,face:-1,line:'The masons cut their walls to be opened. Here, take the key. Point it at the pale stone and the stone remembers it was a door.'}],
   decor:[],map:quarter.rows()},
  {id:'k6-cells',name:'The Cells',exit:'right',hint:'No firing with the keystone in your arms · an end works both ways',question:'The plate is in a cell with no door. How do you and the stone get in, and how do you get back out?',
   portalMode:'one',portals:[{color:'orange',c:19,r:6,face:'r'}],
   decor:[],map:cells.rows()},
  {id:'k6-belfry',name:'Split Belfry',exit:'right',hint:'With both ends yours, each shot opens the other colour · what falls in comes out falling',question:'The bell floor is high over your head, with pale stone in the roof above it. How do you get up by falling?',
   portalMode:'two',
   people:[{who:'idris',c:31,r:6,face:-1,line:'Idris. I sweep the belfry. If you are dropping in, mind the boards; I have only just done them.'}],
   decor:[],map:belfry.rows()},
  {id:'k6-loft',name:'The Bell Loft',exit:'right',hint:'The keystone goes through an end like anything else, and comes out the way the other end faces',question:'The bell’s counterweight plate is up on the loft. You can climb there; how does the stone?',
   portalMode:'two',
   people:[{who:'idris',c:20,r:17,face:1,line:'The bell has not rung since its weight went. I sweep under it anyway. Habit.'}],
   decor:[],map:loft.rows()},
  {id:'k6-archive',name:'Clinging Archive',exit:'up',side:'left',hint:'A floor end remembers how far you fell · out of a floor, you rise as fast as you fell in',question:'The way on is up a column with thorns all round it. How far must you fall to rise that high?',
   portalMode:'two',
   people:[{who:'archivist',c:6,r:17,face:1,quest:'archivist',line:'Three volumes are missing from these shelves. The upper gallery came down with them in it. If you can reach them, bring them here, and mind the bindings.',
    lineDone:'All three disagree about the gate. I am going to sit outside with them a while. That is as far as I have decided.'}],
   decor:[],map:archive.rows()},
  {id:'k6-stacks',name:'The Upper Stacks',exit:'right',hint:'Out of a floor you rise as fast as you fell in, stone and all · no firing with the stone in your arms',question:'The stone is up on the stacks and its plate is up on the gallery, and nothing between them holds. How do you carry it across without ever climbing?',
   portalMode:'two',
   decor:[],map:stacks.rows()},
  {id:'k6-arch',name:'The Broken Arch',exit:'right',hint:'Everything the keep has taught, in one stretch · a ward line stops portal shots',question:'The keystone’s dock is sealed in the crown of the arch, behind a slit only a shot can pass. What crosses first, and what goes through the slit?',
   portalMode:'two',
   decor:[],map:arch.rows()},
 ],
 quests:[
  {id:'archivist',title:'The Archivist’s Burden',giver:'The Archivist',from:'k6-archive',back:{c:2,r:2},
   keepsake:{id:'archivist-volumes',name:'The Three Volumes',gives:'The Archivist takes his three disagreeing volumes out of the archive and reads them on the bench in the air. In the Fractured Keep they open the Archivist’s echo.'},
   rooms:[
    {id:'k6-q-stack',name:'The Fallen Stack',exit:'left',crate:true,hint:'An end opened under something takes it · the basket holds the door while the box is in it',question:'The book box lies among thorns at the bottom of the fallen stack. How does it come up without you going down?',
     portalMode:'two',decor:[],map:mirror(stack.rows())},
    {id:'k6-q-gallery',name:'The Gallery',exit:'up',hint:'Cracked boards give way · jump off a wall you cling to · thorns band both walls',question:'The gallery floor has fallen and the chimney is banded with thorns. Where on each wall can you hold, and where must you already be on the other?',
     portalMode:'two',decor:[],map:gallery.rows()},
    {id:'k6-q-rain',name:'The Rain Shelf',exit:'right',hint:'The cradle waits at the top for a breath, then goes home · an end works both ways',question:'The rain screen is thorned from floor to roof, and the masons’ door on the far side is already open. Where do you open yours, and from where?',
     portalMode:'one',portals:[{color:'orange',c:17,r:3,face:'r'}],decor:[],map:rain.rows(),zips:[[0,-9]]},
   ]},
 ],
};
