// Room by Room · 34. The Fractured King (7.280 rebuild, hand-made). Source for public/bladefall-rbr-34-f-throne.js
// (node scripts/rbr-src/gen.mjs 34). docs/plans/fractured-hard.md, stage IV: two shades walk your path (count:2), the
// King's tears blink, the echo trades you onto a tear's speed, and at the seals your own shade is the second body.
import {grid} from './build.mjs';
const shell=()=>grid().frame();
const r=(id,name,hint,question,m,extra={})=>({id:'fk34-'+id,name,hint,question,map:m.rows(),...extra});
// A wall of stone from ceiling to the void with one-tile slits where tears pass (only a ride threads a slit).
const wall=(m,c,...slits)=>{m.rect(c,1,c,20,'#');for(const s of slits)m.put(c,s,'.');return m;};
const pit=(m,c0,c1)=>m.rect(c0,21,c1,21,'^').rect(c0,22,c1,22,'#');
const crown=(marks,extra={})=>({marks:marks.map(([c,r])=>({c,r})),...extra});
// Mouth point of a tear end, and a wall from ceiling to the void (or rows r0..r1) with a one-tile slit exactly where
// tear `l` crosses column c: only the ride threads it, so no section can be skipped.
const P=(c,r)=>[c*8+4,r*8+2.5];
const gate=(m,c,l,r0=1,r1=20)=>{const [ax,ay]=P(...l.a),[bx,by]=P(...l.b),x=c*8+4,y=ay+(by-ay)*(x-ax)/(bx-ax);m.rect(c,r0,c,r1,'#').put(c,Math.floor(y/8),'.');return m;};

// 1 · Two Behind — two shades walk your path. Across, back up over your own road, and on: the last tear blinks, and
// the perch you wait on is only yours until the first shade climbs to it.
const stair=shell().rect(0,18,4,22,'#').rect(14,18,16,18,'T').rect(4,10,6,10,'#').rect(23,5,26,5,'T').rect(33,7,39,22,'#').rect(32,8,32,20,'<').rect(39,2,39,6,'.').put(2,17,'P');
pit(stair,5,32);wall(stair,10,8,12,17);wall(stair,20,5);

// 2 · Your Second Body — two crown marks, one knight. Stand on the first long enough, then three tears over cracking
// perches before your shade reaches it, and hold the second while it stands where you stood.
const M2a={a:[11,10],b:[16,15],setDown:true},M2b={a:[21,9],b:[28,15],setDown:true},M2c={a:[32,9],b:[36,10],setDown:true};
const marks=shell().rect(0,18,8,22,'#').rect(15,16,17,16,'T').rect(27,16,29,16,'T').rect(34,11,39,22,'#').rect(38,1,38,10,'G').rect(39,6,39,10,'.').put(2,17,'P');
pit(marks,9,33);gate(marks,13,M2a);gate(marks,22,M2b);gate(marks,33,M2c);

// 3 · The King's Seam — three tears on his rhythm. Wait on the stone perch, not on the fault; the shades give you
// less than a blink.
const seam=shell().rect(0,18,4,22,'#').rect(12,14,14,14,'#').rect(22,10,24,10,'T').rect(36,10,39,22,'#').rect(35,11,35,20,'<').rect(39,5,39,9,'.').put(2,17,'P');
const S3a={a:[4,15],b:[13,13],setDown:true,period:100,upT:45,phase:0},S3b={a:[15,7],b:[23,9],setDown:true,period:100,upT:45,phase:60},S3c={a:[26,4],b:[37,9],setDown:true,period:100,upT:45,phase:30};
pit(seam,5,35);wall(seam,8,14);gate(seam,18,S3b);gate(seam,30,S3c);

// 4 · The Drowned Gallery — a jump into a rising tear, a foothold that falls when you leave it, a cracking perch, a
// tear along the gallery roof that throws you over the thorns to the far ledge, and two shades behind you.
const gallery=shell().rect(0,18,3,22,'#').rect(11,11,13,11,'Y').rect(17,7,19,7,'T').rect(36,13,39,22,'#').rect(35,14,35,20,'<').rect(39,8,39,12,'.').put(1,17,'P');
pit(gallery,4,35);wall(gallery,7,12);wall(gallery,26,3);

// 5 · The Borrowed Body — the echo holds the low mark; a one-way tear takes you into the sealed gallery and its high
// mark. Trade back to the echo, and out: the blinking tear, two cracking perches and two tears to the gate.
const E5u={a:[13,11],b:[19,6],oneWay:true},E5a={a:[8,17],b:[17,17],setDown:true,period:90,upT:40,phase:70},E5b={a:[21,11],b:[28,15],setDown:true},E5c={a:[32,9],b:[36,10],setDown:true};
const echo=shell().rect(0,18,11,22,'#').rect(14,7,24,7,'#').rect(14,1,14,6,'#').rect(24,1,24,6,'#').rect(15,1,23,1,'v').rect(16,18,18,18,'T').rect(27,16,29,16,'T')
 .rect(34,11,39,22,'#').rect(38,1,38,10,'G').rect(39,6,39,10,'.').put(2,17,'P');
pit(echo,12,33);echo.put(18,7,'.');gate(echo,22,E5b,8,20);gate(echo,33,E5c);

// 6 · The Right Hand — his openings are shorter and he takes four wounds; his places are two islands over the
// thorns, and the King's seam between them is the only way across.
const hand=shell().rect(0,18,9,22,'#').rect(30,18,39,22,'#').rect(35,1,35,17,'G').rect(39,13,39,17,'.').put(3,17,'P');
pit(hand,10,29);

// 7 · The Long Drowning — two shades, spent footholds up and back over your own road, a tear through the wall to a
// cracking perch.
const wake=shell().rect(0,18,5,22,'#').rect(11,15,13,15,'Y').rect(17,11,17,14,'Y').rect(4,6,9,6,'#').rect(27,6,30,6,'T').rect(34,14,39,22,'#').rect(33,15,33,20,'<').rect(39,9,39,13,'.').put(2,17,'P');
pit(wake,6,33);wall(wake,21,5);wake.rect(25,12,31,12,'^').rect(25,13,31,13,'#');

// 8 · The Drowning Stair — up a shaft: footholds that fall when you leave them, then a falling tear through the
// wall to a cracking perch, a jump into a rising tear to a high cracking perch over thorns, and the last tear
// through the slit to the landing. Two shades climb a second behind.
const C8a={a:[13,7],b:[23,13],setDown:true},C8b={a:[26,7],b:[30,3],setDown:true},C8c={a:[32,3],b:[36,8],setDown:true};
const climb=shell().rect(0,18,6,22,'#').rect(10,15,12,15,'Y').rect(15,11,15,13,'Y').rect(10,7,12,7,'Y').rect(22,14,24,14,'T').rect(29,4,31,4,'T')
 .rect(28,10,32,10,'^').rect(28,11,32,11,'#').rect(34,9,39,22,'#').rect(39,4,39,8,'.').put(3,17,'P');
pit(climb,7,33);gate(climb,20,C8a);gate(climb,33,C8c);

// 9 · The Last Landing — the bellkeeper's echo; the chimney is the way to the tower. The road: three tears through
// three walls, each one high over a cracking perch: jump, dash, ride, and go again before the perch drops.
const B9a={a:[13,10],b:[18,15],setDown:true},B9b={a:[23,9],b:[30,15],setDown:true},B9c={a:[34,9],b:[37,11],setDown:true};
const bell=shell().rect(0,18,11,22,'#').rect(17,16,19,16,'T').rect(29,16,31,16,'T').rect(36,12,39,22,'#').rect(39,7,39,11,'.').rect(2,0,6,0,'.').put(9,17,'P');
pit(bell,12,35);gate(bell,15,B9a);gate(bell,24,B9b);gate(bell,35,B9c);

// 10 · The Audience Hall — the echo holds the low mark; the high mark is up a cracking perch, a spent foothold, the
// blinking tear down to a second cracking perch and a jump into the last tear, and your shade is coming up behind.
const H10a={a:[21,7],b:[26,12],setDown:true,period:90,upT:45,phase:0},H10b={a:[28,6],b:[32,7],setDown:true};
const hall=shell().rect(0,18,9,22,'#').rect(13,14,15,14,'T').rect(18,7,18,11,'Y').rect(25,13,27,13,'T').rect(31,8,35,8,'#').rect(34,18,39,22,'#').rect(37,1,37,17,'G').rect(39,13,39,17,'.').put(2,17,'P');
pit(hall,10,33);gate(hall,24,H10a);gate(hall,30,H10b);

// 11–12 · The seals. Harder than the Abyss King's: shorter holds would be easier, so the holds stay; the King
// throws more often, the floor between the marks is thorns, and the second body is your own shade.
const throne=shell().rect(0,18,10,22,'#').rect(19,14,21,14,'T').rect(25,15,30,22,'#').rect(31,18,39,22,'#').rect(38,1,38,17,'G').rect(39,13,39,17,'.').put(2,17,'P');
pit(throne,11,24);wall(throne,15,15);
const last=shell().rect(0,18,9,22,'#').rect(14,7,17,7,'#').rect(25,14,28,22,'#').rect(31,18,39,22,'#').rect(38,1,38,17,'G').rect(39,13,39,17,'.').put(2,17,'P');
pit(last,10,30);

// Echo · Three Short, Two Long (sealed until the All-Clear Clapper is held). The region's hardest two rooms.
// The Signal Tower — spent footholds up the tower and back over your own climb, a tear through the wall, two shades.
// (Fourth pass: past the wall the tower goes on — a tear straight down to a cracking perch, then a jump into the tear
// through the last wall's slit to the landing.)
const QTa={a:[7,4],b:[25,3],setDown:true},QTb={a:[28,3],b:[28,12],setDown:true},QTc={a:[30,4],b:[36,3],setDown:true};
const qtower=shell().rect(0,18,5,22,'#').rect(9,14,11,14,'Y').rect(15,9,15,12,'Y').rect(3,5,7,5,'Y').rect(24,4,26,4,'T').rect(27,13,29,13,'T').rect(32,4,39,22,'#').rect(39,1,39,3,'.').put(2,17,'P');
pit(qtower,6,31);wall(qtower,19,3);gate(qtower,31,QTc);
// The All-Clear — strike the pattern on two bells across the thorns while the shade walks behind you.
// (Fourth pass: four walls, four tears, each high over the perch before it; the bell perches are fault stone that
// holds for three strikes and no more.)
const QSa={a:[9,11],b:[13,14],setDown:true},QSb={a:[17,8],b:[22,13],setDown:true},QSc={a:[26,7],b:[31,12],setDown:true},QSd={a:[34,6],b:[36,8],setDown:true};
const qsignal=shell().rect(0,18,6,22,'#').rect(12,15,14,15,'T').rect(21,14,23,14,'T').rect(30,13,32,13,'T').rect(36,9,39,22,'#').rect(37,1,37,8,'G').rect(39,4,39,8,'.').put(38,8,'*').put(2,17,'P');
pit(qsignal,7,35);gate(qsignal,11,QSa);gate(qsignal,19,QSb);gate(qsignal,28,QSc);gate(qsignal,35,QSd);

const rooms=[
 r('stair','Two Behind','Two shades walk your path · never wait where you have been','The last tear blinks. How long can you wait on the perch before the first shade climbs to it?',stair,
  {shade:{delay:50,count:2,gap:30},fault:{},lines:[{a:[4,17],b:[15,17],setDown:true},{a:[16,17],b:[6,9],setDown:true},{a:[7,9],b:[24,4],period:120,upT:55,phase:60}]}),
 r('marks','Your Second Body','A crown mark counts your shade · stand, cross, hold','How long must you stand on the first mark, and how long until your shade reaches it?',marks,
  {shade:{delay:180},fault:{},crown:crown([[4,17],[36,10]],{shade:true,hold:30}),lines:[M2a,M2b,M2c]}),
 r('seam','The King’s Seam','His tears open on a rhythm · the shades give you less than a blink','Which perch can you wait on, and for how long?',seam,
  {shade:{delay:45,count:2,gap:30},fault:{},lines:[S3a,S3b,S3c]}),
 r('gallery','The Drowned Gallery','A foothold falls when you leave it · two shades ride every tear behind you','Where does the roof tear throw you, and how far?',gallery,
  {shade:{delay:50,count:2,gap:30},fault:{},lines:[{a:[4,14],b:[11,10]},{a:[22,3],b:[31,3]}]}),
 r('echo','The Borrowed Body','The echo holds a mark · the high tear runs one way','Who holds the low mark while you ride to the high one, and how do you get back down?',echo,
  {echo:true,fault:{},crown:crown([[6,17],[22,6]],{echoOnly:true,hold:20}),lines:[E5u,E5a,E5b,E5c]}),
 r('hand','The Right Hand','His openings are shorter and he takes four wounds · the seam blinks between his places','Where will he arrive, and can you be there when his ward opens?',hand,
  {study:true,hand:{places:[{c:6,r:17},{c:33,r:17}],open:20,hits:4},lines:[{a:[9,17],b:[30,17],period:90,upT:50,phase:0}]}),
 r('wake','The Long Drowning','Footholds fall when you leave them · two shades on your road','The way on is back over your own road. Is it still clear?',wake,
  {shade:{delay:55,count:2,gap:30},fault:{},lines:[{a:[9,5],b:[28,5],setDown:true}]}),
 r('climb','The Drowning Stair','The shades climb behind you · the footholds are gone when they arrive','Where can you pause, and for how long?',climb,
  {shade:{delay:60,count:2,gap:35},fault:{fuse:10},lines:[C8a,C8b,C8c]}),
 r('bellkeeper','The Last Landing','The bell tower is optional; the throne lies ahead','Will you climb for the all-clear before entering the throne?',bell,
  {side:'up',fault:{},lines:[B9a,B9b,B9c],
   people:[{who:'bellkeeper',c:5,r:17,quest:'alarm-echo',line:'The bell rang one last time after you left. I still count it.',lineDone:'Three short, two long. Then nothing.',name:'THE BELLKEEPER’S ECHO'}],decor:[{k:'quiet-bell',c:8,r:17}]}),
 r('hall','The Audience Hall','The echo holds the low mark · the foothold falls when you leave it','Which mark should the echo hold, and when must you leave the foothold for the tear?',hall,
  {echo:true,shade:{delay:70},fault:{},crown:crown([[5,17],[33,7]],{echoOnly:true,hold:20}),lines:[H10a,H10b]}),
 r('throne','The First Seal','Your shade is your second body · his eyes burn before he throws','Where must you stand, and for how long, so that your shade holds the first mark?',throne,
  {study:true,shade:{delay:110},fault:{},crown:crown([[6,17],[27,14]],{shade:true,hold:45,king:true,bolts:{every:70,first:50,speed:130}}),lines:[{a:[10,17],b:[20,13],setDown:true},{a:[21,13],b:[25,14],setDown:true}]}),
 r('last','The Last Seal','The crown turns after the first seal · the second pair is the high perch and the mark you started on','Which way down from the perch, and how long can you stand on the first mark again?',last,
  {study:true,shade:{delay:120,count:2,gap:40},crown:crown([[5,17],[26,13]],{shade:true,hold:30,king:true,phases:[[[15,6],[5,17]]],bolts:{every:90,first:150,speed:130}}),
   lines:[{a:[9,17],b:[25,13],setDown:true},{a:[28,13],b:[17,6],setDown:true,period:100,upT:50,phase:0}]}),
];
const quests=[{id:'alarm-echo',title:'Three Short, Two Long',giver:'The bellkeeper’s echo',from:'fk34-bellkeeper',back:{c:5,r:17},
 keepsake:{id:'alarm-remembered',name:'The Bellkeeper, remembered',gives:'The Bellkeeper heard the last alarm end, and went home. Shown at the end.'},needs:'all-clear',rooms:[
 r('q-tower','The Signal Tower','The footholds hold only once · two shades climb behind you','Which foothold must still be there when you need it, and which do you kick away?',qtower,
  {shade:{delay:55,count:2,gap:30},fault:{},lines:[QTa,QTb,QTc]}),
 r('q-signal','The All-Clear','Small bell short, great bell long · the shade walks where you struck','Three short, two long: which way round can you strike them without meeting your shade?',qsignal,
  {shade:{delay:52},fault:{fuse:48},alarm:{bells:[{c:14,r:13,note:'short'},{c:23,r:12,note:'long'}],pattern:['short','short','short','long','long']},
   lines:[QSa,QSb,QSc,QSd],
   people:[{who:'bellkeeper',name:'THE BELLKEEPER’S ECHO',c:38,r:8,quest:'alarm-echo',line:'Quiet. The posts are empty.',lineDone:'They all went home. I can too.'}]})
]}];
export default {n:34,name:'The Fractured King',kit:['dash','strike','parry','portal'],
 folk:{bellkeeper:{cloak:'#70516c',trim:'#dfc995',skin:'#cdb095',hood:true}},
 props:{'quiet-bell':[[2,-14,2,14,'#6b5a4a'],[2,-14,12,2,'#6b5a4a'],[9,-12,5,7,'#bd9960']],'quiet-bell@all-clear':[[2,-14,2,14,'#6b5a4a'],[2,-14,12,2,'#6b5a4a'],[9,-12,5,7,'#bd9960'],[10,-11,3,4,'#6c8c82']]},
 blurb:'The King’s hall, in the mirror of its own echo. Your shadow walks it twice.',outro:'The alarm is quiet. The line below the throne is running.',
 note:'7.280 rebuild (hand-made): two shades, blinking tears, echo trades and seals your own shade holds.',rooms,quests};
