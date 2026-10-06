// Room by Room · 33. The Fractured Tyrant (7.280 rebuild, hand-made). Source for public/bladefall-rbr-33-f-citadel.js
// (node scripts/rbr-src/gen.mjs 33). docs/plans/fractured-hard.md, stage IV opens here: the tear's variants.
import {grid} from './build.mjs';
const shell=()=>grid().frame();
const r=(id,name,hint,question,m,extra={})=>({id:'fv33-'+id,name,hint,question,map:m.rows(),...extra});
// A wall of stone from ceiling to the void with one-tile slits where tears pass (a knight is 11 px tall: only a ride
// threads a slit), and the thorned void under everything between two banks.
const wall=(m,c,...slits)=>{m.rect(c,1,c,20,'#');for(const s of slits)m.put(c,s,'.');return m;};
const pit=(m,c0,c1)=>m.rect(c0,21,c1,21,'^').rect(c0,22,c1,22,'#');

// 1 · The Fissure Mouth — three tears over fault perches; the middle mouth wants a jump first.
const mouth=shell().rect(0,18,5,22,'#').rect(33,8,39,22,'#').rect(32,9,32,20,'<').rect(39,4,39,7,'.').rect(12,18,14,18,'T').rect(25,8,28,8,'T').put(2,17,'P');
pit(mouth,6,32);wall(mouth,9,17);wall(mouth,20,9);wall(mouth,30,6);mouth.rect(24,12,29,12,'^').rect(24,13,29,13,'#');

// 2 · The Blinking Seam — a tear that blinks: wait at the bank for it to light; the next is timed off the first.
const blink=shell().rect(0,18,4,22,'#').rect(12,18,14,18,'~').put(17,15,'b').rect(28,5,30,5,'T').rect(34,14,39,22,'#').rect(39,9,39,13,'.').put(2,17,'P');
pit(blink,5,33);wall(blink,8,17);wall(blink,23,6);wall(blink,32,4);blink.rect(27,9,31,9,'^').rect(27,10,31,10,'#');

// 3 · The Spent Seam — every tear spends itself: the spent one behind you lets you dash back across its mouth.
const spent=shell().rect(0,18,3,22,'#').rect(19,18,21,18,'T').rect(6,8,8,8,'T').rect(34,5,39,22,'#').rect(33,6,33,20,'<').rect(39,1,39,4,'.').rect(13,1,13,16,'>').put(1,17,'P');
pit(spent,4,33);wall(spent,12,17,8,3);spent.rect(5,13,10,13,'#').rect(5,12,10,12,'^');

// 4 · The Rising Ledgers — footholds up a shaft, each gone when you kick off it; a tear over the last wall.
const ledgers=shell().rect(0,18,5,22,'#').rect(14,18,16,18,'T').rect(12,12,12,15,'Y').rect(16,9,16,12,'Y').rect(12,7,12,10,'Y').rect(34,7,39,22,'#').rect(33,8,33,20,'<').rect(39,1,39,6,'.').put(2,17,'P');
pit(ledgers,6,33);wall(ledgers,9,17);wall(ledgers,25,6);ledgers.rect(10,1,10,16,'>').rect(24,1,24,20,'<').put(24,6,'.');

// 5 · The Thrown Line — one-way tears with no ground between: out of one, dash into the next.
const thrown=shell().rect(0,18,3,22,'#').rect(39,2,39,8,'.').put(1,17,'P');
pit(thrown,4,38);wall(thrown,6,11);wall(thrown,16,12);wall(thrown,24,12);wall(thrown,32,10);   // (fourth pass) the first mouth is high over the bank: jump first

// 7 · Three on Fault — a chain of three tears whose perches are fault stone, each perch broken in two.
const faults=shell().rect(0,18,3,22,'#').rect(10,14,12,14,'T').rect(16,14,18,14,'T').rect(24,9,26,9,'T').rect(30,9,32,9,'T').rect(37,7,38,7,'T').rect(39,3,39,6,'.').put(1,17,'P');
pit(faults,4,38);wall(faults,6,15);wall(faults,20,11);wall(faults,34,7);faults.rect(22,14,33,14,'#').rect(22,13,33,13,'^').rect(35,12,38,12,'#').rect(35,11,38,11,'^');

// 6 · The Paradox Vigil — the figure's echo waits on the bank; the chimney behind is the echo's door. The road: a
// blinking tear to a fault perch, a pod cut to the high mouth, a falling tear to the far bank.
const vigil=shell().rect(0,18,11,22,'#').rect(18,18,20,18,'T').put(23,14,'b').rect(33,13,35,13,'T').rect(38,6,39,22,'#').rect(39,1,39,5,'.').rect(3,0,6,0,'.').rect(7,1,7,8,'#').put(3,17,'P');
pit(vigil,12,36);wall(vigil,15,17);wall(vigil,29,8);wall(vigil,36,6);vigil.rect(32,17,35,17,'^').rect(32,18,35,18,'#');

// 8 · The Broken Ledger — a jump into a rising tear, a pod cut in the air for the height of the next mouth, a falling
// tear to a cracking perch, and a jump into the last rising tear that hops you over the lip.
const broken=shell().rect(0,18,4,22,'#').put(14,11,'b').rect(27,13,29,13,'T').rect(35,5,39,22,'#').rect(34,6,34,20,'<').rect(39,1,39,4,'.').put(2,17,'P');
pit(broken,5,34);wall(broken,9,10);wall(broken,24,8);wall(broken,33,5);   // (fourth pass) the first and last mouths are high: jump first

// 9 · The Crown Stair — run the fault runway and jump off a running dash (no plain jump and dash crosses its 16
// tiles); the far island crumbles; a tear up to a cracking perch, and a tear through the slit to the ward's door.
const high=shell().rect(0,18,3,22,'#').rect(4,18,11,18,'T').rect(28,18,30,18,'~').rect(22,9,24,9,'T').rect(36,4,39,22,'#').rect(35,5,35,20,'<').rect(39,1,39,3,'.').put(1,17,'P');
pit(high,4,35);high.rect(28,1,28,10,'#').put(28,11,'v').put(28,4,'.');

// 10–12 · The wards. Harder than the Void Tyrant's: more returns, the lane and the band walk after each, his mask
// rakes at you, and the floor on his side is fault stone. The twist: no ledgers; he opens his own seams on a
// rhythm, blinking tears from the floor to fault perches at the band's height: ride one, fire, fall.
function ward(perches){
 const m=shell().rect(0,18,17,22,'#').rect(18,18,35,18,'T').rect(36,18,39,22,'#').rect(1,2,1,17,'%').rect(36,1,36,17,'G').rect(39,13,39,17,'.').put(3,17,'P');
 pit(m,18,35);for(const [c,r] of perches)m.rect(c,r,c+2,r,'T');return m;
}
const bossRoom=(id,name,hint,perches,lines,tyrant)=>r(id,name,hint,'Which seam takes you to the band, and when is it open?',ward(perches),{study:true,portalMode:'two',fault:{},lines,tyrant});

// Echo · Behind the Lights (sealed until the figure's warm glass is held). The region's hardest two rooms.
// The Second Contact — the echo holds the plate under a fault perch while you cross the held door and ride on.
const qrelease=shell().rect(0,18,4,22,'#').rect(11,18,13,18,'T').put(12,17,'_').rect(20,1,21,20,'H').rect(23,15,25,15,'T').rect(32,10,34,10,'T').rect(38,3,39,22,'#').rect(39,1,39,2,'.').put(2,17,'P');
pit(qrelease,5,37);wall(qrelease,8,17);wall(qrelease,28,8);wall(qrelease,36,4);   // (fourth pass) the blinking mouth is high over the perchqrelease.rect(30,14,34,14,'^').rect(30,15,34,15,'#');
// Behind the Lights — a spent tear, a foothold kicked away, a spent tear, a blinking tear, to the warm glass.
const qlight=shell().rect(0,18,3,22,'#').rect(11,14,13,14,'T').rect(17,8,17,11,'Y').rect(27,4,29,4,'T').rect(33,8,38,8,'#').rect(33,9,38,22,'#').rect(32,9,32,20,'<').put(35,7,'*').rect(39,3,39,7,'.').put(1,17,'P');
pit(qlight,4,31);wall(qlight,7,12);wall(qlight,23,3);   // (fourth pass) the first mouth is high over the bankqlight.rect(9,18,15,18,'^').rect(9,19,15,20,'#').rect(26,8,30,8,'^').rect(26,9,30,9,'#');

const rooms=[
 r('mouth','The Fissure Mouth','The perch cracks as you land · go at once','Where will each tear leave you, and how long will it hold?',mouth,
  {fault:{},lines:[{a:[5,17],b:[13,17],setDown:true},{a:[16,11],b:[25,7]},{a:[26,5],b:[35,7],setDown:true}]}),
 r('blink','The Blinking Seam','A shut tear is a dotted scar · wait at the bank for it to light','When will the second tear be open, if you leave now?',blink,
  {fault:{},lines:[{a:[4,17],b:[13,17],setDown:true,period:100,upT:50,phase:60},{a:[20,8],b:[28,4],period:100,upT:60,phase:17},{a:[31,2],b:[36,13],setDown:true}]}),
 r('spent','The Spent Seam','A tear you have ridden is spent · it will not take you back','Which way can you dash once the tear behind you is gone?',spent,
  {fault:{},lines:[{a:[3,17],b:[20,17],setDown:true,once:true},{a:[16,10],b:[7,7],setDown:true,once:true},{a:[8,4],b:[31,2],once:true}]}),
 r('ledgers','The Rising Ledgers','A foothold falls when you leave it · kicking off its side counts','Which ledge must still be there for the last kick?',ledgers,
  {fault:{},lines:[{a:[5,17],b:[15,17],setDown:true},{a:[13,6],b:[33,6]}]}),
 r('thrown','The Thrown Line','One-way tears · out of one, dash straight into the next','Where will the throw carry you, and where is the next mouth?',thrown,
  {lines:[{a:[5,11],b:[11,14],oneWay:true},{a:[13,15],b:[19,9],oneWay:true},{a:[21,10],b:[27,15],oneWay:true},{a:[29,13],b:[36,6],oneWay:true}]}),
 r('faults','Three on Fault','Every perch is fault stone · the crack follows you along it','Can you reach each mouth before the crack reaches you?',faults,
  {fault:{},lines:[{a:[3,17],b:[10,13],setDown:true},{a:[18,13],b:[24,8],setDown:true},{a:[32,8],b:[37,6],setDown:true}]}),

 r('vigil','The Paradox Vigil','The chimney leads to the figure’s other window','Will you take the road, or the chimney behind the echo?',vigil,
  {side:'up',fault:{},lines:[{a:[11,17],b:[19,17],setDown:true},{a:[27,7],b:[34,12],setDown:true},{a:[35,7],b:[38,5],setDown:true}],
   people:[{who:'figure',c:9,r:17,quest:'figure-echo',leaveDone:'right',line:'I went toward the lights. I wanted to see what was behind them.',lineDone:'Come and look. It’s not what I feared.',name:'THE FIGURE’S ECHO'}],decor:[{k:'citadel-window',c:5,r:17}]}),
 r('broken','The Broken Ledger','A rising tear hops you over its lip · a cut on a pod buys the height','Which mouth does the pod put in reach, and which wants a jump first?',broken,
  {fault:{},lines:[{a:[6,11],b:[12,9]},{a:[18,3],b:[28,12],setDown:true},{a:[32,6],b:[37,3],setDown:true}]}),
 r('high','The Crown Stair','Run the cracking road and jump off a running dash','How far does a jump carry when it leaves a dash?',high,
  {fault:{},lines:[{a:[29,17],b:[24,8],setDown:true},{a:[24,5],b:[36,3],setDown:true}]}),

 bossRoom('low','The Lower Ward','Three returns · ride his seam to the band, fire, and fall before the perch does',[[3,13],[3,9],[3,5]],
  [{a:[10,17],b:[5,12],setDown:true,period:120,upT:80,phase:83},{a:[13,17],b:[5,8],setDown:true,period:120,upT:80,phase:105},{a:[16,17],b:[5,4],setDown:true,period:120,upT:80,phase:41}],
  {shotRow:14,weakRow:11,hits:3,lanes:[14,16,12],bands:[11,7,4],every:110}),
 bossRoom('middle','The Middle Ward','Three returns · when his eyes flare his mask throws at you: cut it',[[3,13],[3,9],[3,5]],
  [{a:[10,17],b:[5,12],setDown:true,period:100,upT:60,phase:50},{a:[13,17],b:[5,8],setDown:true,period:100,upT:60,phase:43},{a:[16,17],b:[5,4],setDown:true,period:100,upT:60,phase:44}],
  {shotRow:16,weakRow:7,hits:3,lanes:[16,11,14],bands:[7,3,11],every:110,rake:{every:140,first:100,speed:130}}),
 bossRoom('crown','The Crown Does Not Fall','Four returns · his seams blink faster, and his mask throws more often',[[3,13],[3,9],[3,5]],
  [{a:[10,17],b:[5,12],setDown:true,period:90,upT:50,phase:72},{a:[13,17],b:[5,8],setDown:true,period:90,upT:50,phase:25},{a:[16,17],b:[5,4],setDown:true,period:90,upT:50,phase:44}],
  {shotRow:14,weakRow:3,hits:4,final:true,lanes:[14,7,3,16],bands:[3,16,11,7],every:100,rake:{every:120,first:90,speed:140}}),
];
const quests=[{id:'figure-echo',title:'Behind the Lights',giver:'The figure’s echo',from:'fv33-vigil',back:{c:5,r:17},
 keepsake:{id:'figure-remembered',name:'The Figure, remembered',gives:'The figure found other windows, and waved at every one. Shown at the end.'},needs:'figure-glass',rooms:[
 r('q-release','The Second Contact','Here, the portal key leaves an echo · an echo holds a plate, even on cracking stone','How can the contact stay pressed after the perch under it falls?',qrelease,
  {echo:true,fault:{},lines:[{a:[4,17],b:[12,17],setDown:true,once:true},{a:[27,8],b:[32,9],setDown:true,period:90,upT:50,phase:10},{a:[34,6],b:[38,2]}]}),
 r('q-light','Behind the Lights','Nothing here comes back until you retry','Which of the four do you spend first, and which way will it throw you?',qlight,
  {fault:{},lines:[{a:[4,11],b:[11,13],setDown:true,once:true},{a:[14,4],b:[28,3],setDown:true,once:true},{a:[30,3],b:[35,7],setDown:true}],
   people:[{who:'figure',name:'THE FIGURE’S ECHO',c:37,r:7,quest:'figure-echo',line:'Only more windows. More people waving.',lineDone:'I’ll wave back, this time.'}]})
]}];
export default {n:33,name:'The Fractured Tyrant',kit:['dash','strike','parry','portal'],
 folk:{figure:{cloak:'#65607e',trim:'#b9d7ee',skin:'#c4bed1',hood:true}},
 props:{'citadel-window':[[0,-22,10,22,'#373048'],[1,-21,8,20,'#8b9bad']],'citadel-window@figure-glass':[[0,-22,2,22,'#373048'],[8,-22,2,22,'#373048'],[2,-22,6,2,'#373048'],[3,-5,4,5,'#e5c98d']]},
 blurb:'The Tyrant’s seams, torn open on the other side: they blink, they spend themselves, and the stone they land on cracks.',
 outro:'The window faces the other way. The throne below is listening.',
 note:'7.280 rebuild (hand-made): the tear\'s variants (blinking, spent, one-way) over fault stone, and wards where he opens his own seams.',rooms,quests};
