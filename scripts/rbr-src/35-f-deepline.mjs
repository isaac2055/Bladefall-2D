// Room by Room · 35. The Fractured Line (7.280 rebuild, hand-made). Source for public/bladefall-rbr-35-f-deepline.js
// (node scripts/rbr-src/gen.mjs 35). docs/plans/fractured-hard.md, stage IV: carts on fault track (fault.carts: the
// wheels crack it, so a cart can never stop), tears that carry you from one line to the next and set you down on
// cracking perches, momentum off cracking runways, glass on the line, and your shade where a cart would let you rest.
// Nothing on the road is a resting place after the first seat: the line never stops.
import {grid} from './build.mjs';
const shell=()=>grid().frame();
const r=(id,name,hint,question,m,extra={})=>({id:'fd35-'+id,name,hint,question,map:m.rows(),...extra});
// A wall of stone from ceiling to the void with one-tile slits where tears pass (only a ride threads a slit).
const wall=(m,c,...slits)=>{m.rect(c,1,c,20,'#');for(const s of slits)m.put(c,s,'.');return m;};
const pit=(m,c0,c1)=>m.rect(c0,21,c1,21,'^').rect(c0,22,c1,22,'#');
const cart=(m,c,r)=>m.rect(c,r,c+1,r,'C').put(c,r-1,'P');   // a cart with the knight seated in it
const F={carts:true};                                         // fault track the wheels crack
// A tunnel roof three rows over a cart's row (c0..c1): a seated knight fits under it, a jump does not, so you ride
// the cart to the tunnel's mouth before you can leave it, and its roof is thorned.
const tunnel=(m,c0,c1,r)=>m.rect(c0,r-3,c1,r-3,'#').rect(c0,r-4,c1,r-4,'^');   // thorned on top: no walking its roof

// Mouth point of a tear end, and a wall from ceiling to the void (or rows r0..r1) with a one-tile slit exactly where
// tear `l` crosses column c: only the ride threads it, so no section can be skipped.
const P=(c,r)=>[c*8+4,r*8+2.5];
const gate=(m,c,l,r0=1,r1=20)=>{const [ax,ay]=P(...l.a),[bx,by]=P(...l.b),x=c*8+4,y=ay+(by-ay)*(x-ax)/(bx-ax);m.rect(c,r0,c,r1,'#').put(c,Math.floor(y/8),'.');return m;};

// 1 · Cracking Line — the track cracks under the wheels: lean at once and never let go; jump out into a falling
// tear that sets you on a low cracking perch, then two tears each high over the perch before it (jump, dash, ride),
// the last through the slit to the cliff.
const L1a={a:[16,7],b:[22,15],setDown:true},L1b={a:[26,9],b:[31,11],setDown:true},L1c={a:[34,5],b:[37,3],setDown:true};
const thorn=cart(shell(),2,8).rect(1,9,3,9,'-').rect(4,9,14,9,'T').rect(5,8,14,8,'^').rect(21,16,23,16,'T').rect(30,12,32,12,'T')
 .rect(37,4,39,22,'#').rect(39,1,39,3,'.');
pit(thorn,1,36);tunnel(thorn,1,12,8);gate(thorn,19,L1a);gate(thorn,28,L1b);gate(thorn,35,L1c);

// 2 · Two Carts — out of the first cart into a tear, onto a cracking perch, a jump into the next tear that sets you
// down in the second cart (on its own cracking track), and out of that one into the last tear. Your shade rides
// behind you: the second cart is no place to sit.
const L2a={a:[12,5],b:[16,12],setDown:true},L2c={a:[20,6],b:[25,8],setDown:true},L2b={a:[33,5],b:[38,5],setDown:true};
const buffer=cart(shell(),2,6).rect(1,7,3,7,'-').rect(4,7,9,7,'T').rect(5,6,9,6,'^').rect(15,13,17,13,'T').rect(25,9,26,9,'C')
 .rect(25,10,26,10,'-').rect(27,10,35,10,'T').rect(28,9,35,9,'^').rect(37,6,39,22,'#').rect(39,1,39,5,'.');
pit(buffer,1,36);tunnel(buffer,1,7,6);tunnel(buffer,27,31,9);gate(buffer,14,L2a);gate(buffer,22,L2c);gate(buffer,36,L2b);

// 3 · Back Up — the strip that throws you forward is behind you: lean back onto it and it flings the cart over the
// cracking bridge faster than any lean. Jump before the buffer stops it: the flight is long, and the only way past
// the first wall is the tear in it, met in the air. Then two more tears, each high over a cracking perch.
const L3a={a:[21,7],b:[24,15],setDown:true},L3b={a:[28,9],b:[32,13],setDown:true},L3c={a:[35,7],b:[38,8],setDown:true};
const backup=cart(shell(),9,10).rect(1,11,2,11,'-').put(3,11,')').rect(4,11,11,11,'-').rect(12,11,16,11,'T').rect(12,10,16,10,'^')
 .rect(17,10,17,11,'#').rect(23,16,25,16,'T').rect(31,14,33,14,'T').rect(37,9,39,22,'#').rect(39,4,39,8,'.');
pit(backup,1,36);tunnel(backup,4,14,10);gate(backup,22,L3a);gate(backup,29,L3b);gate(backup,36,L3c);

// 4 · High Line — lean through the brass post to hop to the high line; the low line runs into thorns. The high line
// cracks, and its end is a blinking tear back over your head to a cracking perch; one more tear past the hanging
// wall to a second cracking perch, and a jump from it to the cliff.
const L4a={a:[30,12],b:[24,4],setDown:true,period:100,upT:55,phase:0},L4b={a:[27,2],b:[34,5],setDown:true};
const high=cart(shell(),2,18).rect(1,19,30,19,'-').rect(4,18,30,18,'^').put(10,19,'k').rect(31,13,31,19,'<').rect(14,14,28,14,'T')
 .rect(23,5,25,5,'T').rect(33,6,35,6,'T').rect(38,3,39,22,'#').rect(37,4,37,20,'<').rect(33,12,33,20,'<').rect(39,1,39,2,'.');
pit(high,1,37);tunnel(high,1,8,18);gate(high,32,L4b,1,11);high.rect(21,8,26,8,'^').rect(21,9,26,9,'#').rect(33,10,36,10,'^').rect(33,11,36,11,'#');

// 5 · The Condemned Siding — the miner's echo; the chimney is the way to the bell below. The road: a short cart on
// cracking track, a jump out into the first tear, then two tears each high over a cracking perch to the platform.
const L5a={a:[20,14],b:[24,17],setDown:true},L5b={a:[28,11],b:[32,14],setDown:true},L5c={a:[35,8],b:[38,11],setDown:true};
const siding=shell().rect(0,18,9,22,'#').rect(2,0,6,0,'.').rect(10,18,11,18,'C').rect(10,19,11,19,'-').rect(12,19,17,19,'T').rect(13,18,17,18,'^')
 .rect(23,18,25,18,'T').rect(31,15,33,15,'T').rect(37,12,39,22,'#').rect(39,7,39,11,'.').put(5,17,'P');
pit(siding,10,36);tunnel(siding,12,15,18);gate(siding,22,L5a);gate(siding,29,L5b);gate(siding,36,L5c);

// 6 · The Cut Fork — two posts and three lines: lean through both. The low and middle lines end in thorns; the top
// line cracks under you to its buffer, a blinking tear back along the roof, a cracking perch, and a tear through
// the slit in the hanging wall.
const L6a={a:[31,7],b:[12,4],setDown:true,oneWay:true,period:110,upT:60,phase:0},L6c={a:[15,4],b:[17,7],setDown:true},L6b={a:[21,2],b:[37,3],setDown:true};
const fork=cart(shell(),2,18).rect(1,19,33,19,'-').rect(4,18,33,18,'^').put(9,19,'k').rect(13,14,26,14,'T').put(20,14,'k').rect(27,10,27,14,'<')
 .rect(24,9,32,9,'T').rect(34,13,34,19,'<').rect(11,5,13,5,'T').rect(35,4,39,22,'#').rect(39,1,39,3,'.');
pit(fork,1,34);tunnel(fork,1,7,18);gate(fork,33,L6b,1,12);fork.rect(16,8,18,8,'T').rect(10,6,14,6,'^').rect(10,7,14,7,'#');

// 7 · The Blinking Line — the cart cannot stop on cracking track, and the tear at its end blinks: lean or coast so
// you reach the end while it is lit. Its far mouth is a cracking perch; the second tear blinks the other way.
const L7a={a:[22,11],b:[27,15],setDown:true,period:120,upT:40,phase:34},L7b={a:[31,9],b:[34,12],setDown:true,period:120,upT:40,phase:115},L7c={a:[35,6],b:[38,8],setDown:true};
const blink=cart(shell(),2,12).rect(1,13,3,13,'-').rect(4,13,20,13,'T').rect(5,12,20,12,'^').rect(26,16,28,16,'T').rect(33,13,35,13,'T')
 .rect(37,9,39,22,'#').rect(39,4,39,8,'.');
pit(blink,1,36);tunnel(blink,1,18,12);gate(blink,24,L7a);gate(blink,32,L7b);gate(blink,36,L7c);

// 8 · The Boat — out of the cart, cut the pod for height: the first tear is too high for a jump and a dash. It
// sets you on a high cracking perch over thorns; dash into the tear that drops through the wall, then two tears,
// each high over the cracking perch before it.
const L8a={a:[14,5],b:[18,4],setDown:true},L8b={a:[21,4],b:[25,15],setDown:true},L8c={a:[29,9],b:[33,12],setDown:true},L8d={a:[36,6],b:[38,8],setDown:true};
const boat=cart(shell(),2,15).rect(1,16,3,16,'-').rect(4,16,8,16,'T').rect(5,15,8,15,'^').put(12,12,'b').rect(17,5,19,5,'T').rect(16,8,20,8,'^').rect(16,9,20,9,'#')
 .rect(24,16,26,16,'T').rect(32,13,34,13,'T').rect(37,9,39,22,'#').rect(39,4,39,8,'.');
pit(boat,1,36);tunnel(boat,1,6,15);gate(boat,15,L8a);gate(boat,22,L8b);gate(boat,30,L8c);gate(boat,37,L8d,1,8);

// 9 · The Low Roof — onto the cracking runway, then a dash down into it and a jump while that dash still runs (a
// hyper): far and low under the roof's teeth, over the pit, onto a cracking strip (stone: the dash comes back).
// No jump clears the teeth and no dash alone crosses the pit. Then two tears, each high over a cracking perch,
// and a jump to the ledge, with your shade a moment behind.
const L9a={a:[25,12],b:[29,15],setDown:true},L9b={a:[32,9],b:[36,12],setDown:true};
const roof=shell().rect(0,18,3,22,'#').put(1,17,'P').rect(4,18,9,18,'T').rect(18,19,22,19,'T').rect(28,16,30,16,'T').rect(35,13,37,13,'T')
 .rect(7,11,20,11,'^').rect(7,12,20,12,'#').rect(7,13,20,13,'v').rect(38,10,39,22,'#').rect(39,5,39,9,'.');
pit(roof,4,37);gate(roof,26,L9a);gate(roof,33,L9b);

// 10 · Shade on the Line — the cart runs right under the high perch; a tear back along the line to it, a tear through
// the wall to a cracking perch, and a tear through the last slit. Your shade rides every tear a moment after you.
const L10a={a:[25,17],b:[6,9],setDown:true,oneWay:true},L10b={a:[10,3],b:[31,14],setDown:true},L10c={a:[34,8],b:[38,11],setDown:true};
const shadeline=cart(shell(),2,18).rect(1,19,3,19,'-').rect(4,19,23,19,'T').rect(5,18,23,18,'^').rect(4,10,7,10,'T').rect(30,15,32,15,'T')
 .rect(36,12,39,22,'#').rect(39,7,39,11,'.');
pit(shadeline,1,35);tunnel(shadeline,1,21,18);gate(shadeline,27,L10b);gate(shadeline,35,L10c);

// 11 · Glass on the Line — out of the cart, dash through the glass: left and right swap. (7.280 fourth pass: the
// second cart is gone — a cart's lean read the glass differently on the page than in the route search — and in its
// place cracking stone.) Jump and dash, swapped, into the tear through the wall's slit to a cracking perch, up the
// one-way tear to the high perch, dash through the second glass to turn back, and a last tear to the platform.
const L11z={a:[23,9],b:[30,14],setDown:true},L11a={a:[30,6],b:[27,4],setDown:true,oneWay:true},L11b={a:[36,5],b:[38,7],setDown:true};
const glass=cart(shell(),2,12).rect(1,13,3,13,'-').rect(4,13,11,13,'T').rect(5,12,11,12,'^').rect(15,1,15,20,'|')
 .rect(18,16,20,16,'T').rect(29,15,31,15,'T').rect(26,5,28,5,'T').rect(32,1,32,4,'|').put(32,5,'^').rect(32,6,32,20,'#')
 .rect(33,11,35,11,'T').rect(37,8,39,22,'#').rect(39,3,39,7,'.');
pit(glass,1,36);tunnel(glass,1,9,12);gate(glass,25,L11z,6,20);gate(glass,37,L11b,1,7);glass.rect(26,8,28,8,'^').rect(26,9,28,9,'#');

// Echo · The Ledger Line (sealed until the Miner's Number is held). The region's hardest two rooms.
// The Drive Cradle — bring the cart over the cracking bridge to rest in the cradle; it drives the hoist on its own,
// but your shade walks your path a moment behind, so you cannot wait: go round the loop until the cage is up. (7.280
// fourth pass: the loop is all in the air — up one tear, a dash into the second across, a dash into the third
// down while it still throws you — twice round, with the shade under a second behind.)
const qhoist=shell().rect(0,19,39,22,'#').rect(1,18,8,18,'-').rect(9,18,16,18,'T').rect(9,19,16,20,'.').rect(17,18,25,18,'-').put(26,17,'#').rect(26,18,39,18,'#').rect(2,17,3,17,'C').put(2,16,'P').rect(36,1,36,17,'G').rect(39,13,39,17,'.');
pit(qhoist,9,16);
// A Name Put Back — the Miner waits at the ledger on the far side of the line's last cuts (7.280 fourth pass: the
// escort became the act's hardest crossing). Four tears, each high over the cracking perch before it, the third one
// blinking, and two shades a moment behind: nowhere to stop between the bank and the ledger.
const QLa={a:[8,11],b:[12,14],setDown:true},QLb={a:[16,8],b:[20,11],setDown:true},QLc={a:[24,5],b:[28,8],setDown:true,period:90,upT:45,phase:0},QLd={a:[32,2],b:[37,6],setDown:true};
const qledger=shell().rect(0,18,5,22,'#').rect(11,15,13,15,'T').rect(19,12,21,12,'T').rect(27,9,29,9,'T').rect(36,7,39,22,'#').rect(39,2,39,6,'.').put(38,6,'*').put(2,17,'P');
pit(qledger,6,35);gate(qledger,9,QLa);gate(qledger,17,QLb);gate(qledger,25,QLc);gate(qledger,33,QLd);qledger.rect(26,13,30,13,'^').rect(26,14,30,14,'#');

const rooms=[
 r('thorn','Cracking Line','The wheels crack the track · lean at once and never let go','The track breaks behind the cart. Where does each tear leave you, and how long does the perch hold?',thorn,
  {fault:F,lines:[L1a,L1b,L1c]}),
 r('buffer','Two Carts','Jump from a moving cart to keep its speed · your shade rides behind you','The second cart sits on cracking track, and your shade is coming. How long can you sit in it?',buffer,
  {fault:F,shade:{delay:44},lines:[L2a,L2c,L2b]}),
 r('backup','Back Up','Arrow strips throw the cart · jump before the buffer stops it','The strip that throws you forward is behind you. Which way do you lean first, and when do you jump?',backup,
  {fault:F,lines:[L3a,L3b,L3c]}),
 r('high','High Line','Lean through a brass post to take the high line · it cracks, and its tear blinks','The low line runs into thorns. When do you jump from the high one, and is the tear lit?',high,
  {fault:F,lines:[L4a,L4b]}),
 r('siding','The Condemned Siding','The bell below is off the main line','Will you follow the sound before taking the through line?',siding,
  {side:'up',fault:F,lines:[L5a,L5b,L5c],
   people:[{who:'miner',name:'THE MINER’S ECHO',nameDone:'THE MINER',voiceUntilDone:true,c:7,r:17,quest:'miner-echo',line:'My name is in the ledger. I keep reading it, to be sure.',lineDone:'Down the siding. You know the way now.'}],decor:[{k:'shaft-bell',c:3,r:17}]}),
 r('fork','The Cut Fork','Your lean chooses the line at each post · the top line cracks to a blinking tear','Two posts and three lines. Which line goes anywhere, and where does its tear take you?',fork,
  {fault:F,lines:[L6a,L6c,L6b]}),
 r('blink','The Blinking Line','A cart on cracking track cannot stop · both tears blink','Lean or coast: when will you reach the end, and will the second tear be lit when you land?',blink,
  {fault:F,lines:[L7a,L7b,L7c]}),
 r('boat','The Boat','A seed pod gives height · a jump from a running dash goes farthest','Where does the height come from, and where the distance?',boat,
  {fault:F,lines:[L8a,L8b,L8c,L8d]}),
 r('roof','The Low Roof','Dash down onto the runway and jump while the dash still runs · far and low','The roof’s teeth are too low for a jump. How do you cross under them?',roof,
  {fault:F,shade:{delay:50},lines:[L9a,L9b]}),
 r('shadeline','Shade on the Line','Your shade rides every tear after you · never wait at a far mouth','When you land, how long until your shade comes out of the same tear?',shadeline,
  {fault:F,shade:{delay:45},lines:[L10a,L10b,L10c]}),
 r('glass','Glass on the Line','A dash through glass swaps left and right · every aim on the far side is reversed','On the far side of the glass, which way do you press to jump and dash forward?',glass,
  {fault:F,mirror:{},shade:{delay:44},lines:[L11z,L11a,L11b]}),
];
const quests=[{id:'miner-echo',title:'The Ledger Line',giver:'The miner’s echo',from:'fd35-siding',back:{c:5,r:17},
 keepsake:{id:'miner-remembered',name:'The Miner, remembered',gives:'The Miner walked out of the Deep Line on his own legs. Shown at the end.'},needs:'miners-number',rooms:[
 r('q-hoist','The Drive Cradle','The cart drives the hoist while it rests in the cradle · your shade will not let you wait','The cage needs time and you cannot stand still. Where can you go round while it rises?',qhoist,
  {fault:F,shade:{delay:45},rescueHoist:{cradle:24,cage:30,hold:240},lines:[{a:[33,17],b:[31,8]},{a:[28,8],b:[21,8]},{a:[18,8],b:[18,17],setDown:true}]}),
 r('q-ledger','A Name Put Back','Two shades walk your path behind you · the Miner waits at the ledger','Four cuts to the ledger, and two of you behind. Where can you stop?',qledger,
  {shade:{delay:45,count:2,gap:30},fault:F,lines:[QLa,QLb,QLc,QLd],
   people:[{who:'miner',name:'THE MINER’S ECHO',c:37,r:6,quest:'miner-echo',line:'There. In ink, not chalk.',lineDone:'I’ll walk out on the main line this time.'}]})
]}];
export default {n:35,name:'The Fractured Line',kit:['dash','strike','parry','portal'],
 folk:{miner:{cloak:'#6e604d',trim:'#d3b184',skin:'#c6a98d',hood:true}},
 props:{'shaft-bell':[[2,-17,2,17,'#73573e'],[2,-17,12,2,'#73573e'],[9,-14,5,6,'#bc9859']]},
 blurb:'The Deep Line, cracked: the track breaks under the wheels, the tears carry you between the lines, and nothing holds you long.',
 outro:'The last platform. The cliffs above are loud with thunder.',
 note:'7.280 rebuild (hand-made): carts on fault track (fault.carts), tears between the lines, glass and your shade on the line.',rooms,quests};
