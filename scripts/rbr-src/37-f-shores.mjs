// Room by Room · 37. The Fractured Shores (7.280 rebuild, hand-made over the 7.278 reflection). Source for
// public/bladefall-rbr-37-f-shores.js (node scripts/rbr-src/gen.mjs 37). docs/plans/fractured-hard.md, stage V:
// everything back to back.
import {grid} from './build.mjs';
const shell=()=>grid().frame();
// 7.280 (resume 4): a cracking stone over a down-thorn row (a lane's floor over the lane below) left a hole you fell
// through unharmed, onto the lane below: a free rest. The thorn under every cracking stone now points up, so the hole is
// real void, as everywhere else.
const voidUnder=rows=>rows.map((row,r)=>r>0?[...row].map((ch,c)=>ch==='v'&&rows[r-1][c]==='T'?'^':ch).join(''):row);
const r=(id,name,hint,question,m,extra={})=>({id:'fs37-'+id,name,hint,question,map:voidUnder(m.rows()),exit:'left',...extra});
const pit=(m,c0,c1)=>m.rect(c0,21,c1,21,'^').rect(c0,22,c1,22,'#');
// Three lanes (the Colony's lanes, reflected): the low lane goes left, a tear up onto the middle lane's ledge, the
// middle lane goes right, a tear up onto the high lane's ledge, the high lane goes left to the shore.
// Perches: L1 row 20 (stand 19), L2 row 12 (stand 11), L3 row 5 (stand 4).
const lanes=()=>{const m=shell();
 m.rect(36,20,38,21,'#').put(37,19,'P').rect(5,21,35,21,'^').rect(1,20,4,21,'#');
 m.rect(3,12,38,12,'^').rect(1,13,38,13,'v').rect(1,12,2,12,'#').rect(35,12,38,12,'#');
 m.rect(1,5,35,5,'^').rect(1,6,35,6,'v').rect(36,5,38,5,'#').rect(36,6,38,6,'v').rect(0,1,0,4,'.');
 return m;};
const laneLines=[{a:[6,18],b:[1,11],setDown:true},{a:[34,11],b:[36,4],setDown:true}];

// Launch: three floors. Below, a cracking runway, a super onto the float the sea lifts (teeth over its top) and on to a
// cracking ledge; a tear up through the floor and across; up the far wall; a last super along the high road.
const launch=shell().rect(34,20,39,22,'#').put(36,19,'P').rect(24,20,33,20,'T');
pit(launch,1,33);
launch.rect(5,13,38,14,'#').rect(5,12,30,12,'^').rect(8,15,11,15,'v').rect(8,21,11,21,'F').rect(1,19,3,19,'T').rect(1,20,3,20,'^')
 .rect(31,11,38,11,'T').rect(31,12,38,12,'^').rect(16,5,34,5,'T').rect(16,6,34,6,'^').rect(0,1,0,4,'.').rect(0,5,3,8,'#').rect(1,9,3,9,'v');

// Wreck Lift: cracking stones out to the wreck while the sea lifts it; off the rising deck into the tear in the rigging;
// set down on a cracking spar; a super to the far shore. Your shade walks a little behind you the whole way.
const wreck=shell().rect(35,20,39,22,'#').put(37,19,'P');
pit(wreck,1,34);
wreck.rect(32,16,33,16,'T').rect(32,17,33,17,'^').rect(28,12,29,12,'T').rect(28,13,29,13,'^').rect(18,20,25,21,'F').rect(17,7,26,7,'v').rect(14,1,15,12,'#').rect(14,13,15,13,'v').rect(14,7,15,7,'.')
 .rect(8,7,11,7,'T').rect(8,8,11,8,'^').rect(0,1,0,5,'.').rect(0,6,1,22,'#').rect(2,9,4,20,'#').rect(2,8,4,8,'^');

// Spring Tide: under the reef nothing can jump. A cracking tunnel to run with a dash; the bay under the reef crossed
// only low and long (a hyper) while the sea is out; refills up the last shaft to the shore.
const spring=shell().rect(33,20,39,22,'#').put(36,19,'P');
pit(spring,1,32);
spring.rect(21,1,32,16,'#').rect(21,17,32,17,'v').rect(21,20,32,20,'T').rect(9,1,20,15,'#').rect(9,16,20,16,'v')
 .rect(2,20,7,20,'T').rect(8,1,8,15,'#').rect(0,6,1,22,'#').rect(0,1,1,4,'.').put(4,14,'o').put(4,8,'o').rect(33,1,38,16,'#');

// Buoy: three buoys too far apart for a jump and a dash. Land each one in a diagonal dash and jump as it returns
// (low and long), riding the swell; the shade is close behind, so no buoy can be waited on.
const buoy=shell().rect(36,16,39,22,'#').put(37,15,'P');
pit(buoy,1,35);
buoy.rect(18,19,19,19,'F').rect(1,19,2,19,'F').rect(0,1,0,3,'.').rect(6,1,35,9,'#').rect(6,10,35,10,'v').put(3,9,'o').put(3,4,'o');

// Spring Super: low and long off the ledge onto a cracking stone, under the thorn curtain to the float; the float the sea lifts lends its rise to a super; up on a cracking ledge, the glass; through it left is
// right, and the second float lends its rise to a super the other way round.
const sup=shell().rect(35,19,39,22,'#').put(37,18,'P');
pit(sup,1,34);
sup.rect(28,18,30,18,'T').rect(28,19,30,19,'^').rect(24,8,24,15,'>').rect(17,17,20,17,'F').rect(17,12,20,12,'v').rect(11,10,15,10,'T').rect(11,11,15,11,'^').rect(10,1,10,20,'|').rect(6,14,9,14,'T').rect(6,15,9,15,'^')
 .rect(5,1,5,20,'|').rect(1,10,4,10,'T').rect(1,11,4,11,'^').rect(0,1,0,9,'.').rect(16,1,34,6,'#').rect(16,7,34,7,'v');

// Belled (7.280 resume 4, rebuilt as three lanes): two warders on two piers in the low lane, shields to the sea. Come
// down behind each before he turns (the stone behind him cracks); the cut throws you on to the next, and on to the tear.
// The middle lane's glass: past it left is right, all the way up the tear and along the high lane, where a third warder
// keeps the gate. Your shade a little behind.
const belled=lanes();
belled.rect(25,19,30,20,'#').rect(25,19,26,19,'T').rect(13,19,18,20,'#').rect(17,19,18,19,'T')
 .rect(9,12,11,12,'T').rect(17,7,17,11,'|').rect(22,12,24,12,'T').rect(29,12,30,12,'T')
 .rect(27,5,29,5,'T').rect(17,5,19,5,'T').rect(1,5,13,5,'#').rect(9,5,10,5,'T').rect(4,1,4,4,'G');
// Landfall: a float to a super, a moth to cut for the lift, a ring to swing from, a cracking perch, and a tear up to the
// headland, with your shade a little behind the whole way.
const landfall=shell().rect(35,20,39,22,'#').put(37,19,'P');
pit(landfall,1,34);
landfall.rect(28,21,32,21,'F').rect(27,15,33,15,'v').put(15,11,'O').rect(8,13,11,13,'T').rect(8,14,11,14,'^').rect(0,1,0,2,'.').rect(1,3,4,3,'#')
 .rect(17,1,34,7,'#').rect(17,8,34,8,'v');
// 7.280 (resume 4): the tear no longer lands you at the headland. It sets you on a cracking perch above a thorn shelf;
// through the pane left is right, a cracking stone, then the headland.
landfall.rect(1,8,12,8,'^').rect(13,8,15,8,'T').put(16,8,'^').rect(9,1,9,7,'|').rect(5,6,6,6,'T');

// The Colony Road: a hyper under the low teeth to a cracking perch; onto the float the sea lifts into the teeth; up to
// a cracking ledge under the shore's thorns; a tear out from under them, set down on a cracking spar; the last super
// back along the top to dry land. The shade the whole way.
const road=shell().rect(34,18,39,22,'#').put(36,17,'P');
pit(road,1,33);
road.rect(21,14,33,14,'v').rect(19,18,22,18,'T').rect(19,19,22,19,'^').rect(10,21,13,21,'F').rect(8,11,15,11,'v')
 .rect(2,9,5,9,'T').rect(2,10,5,10,'^').rect(1,4,8,4,'#').rect(1,5,11,5,'v').rect(0,1,0,3,'.')
 .rect(20,4,23,4,'T').rect(20,5,23,5,'^').rect(26,1,38,8,'#').rect(26,9,33,9,'v').rect(1,11,1,20,'>');
// Under the Spray: a super off the ledge onto a cracking stone under a ceiling of thorns (no jump there), low and long
// to the tear, the only way through the ceiling, which lifts you to a cracking spar under the cliff's teeth, then low
// and long twice along the cliff to the shore. Your shade close behind.
const tern=shell().rect(34,17,39,22,'#').put(36,16,'P');
pit(tern,1,33);
tern.rect(21,14,23,14,'T').rect(21,15,23,15,'^').rect(8,10,38,10,'v').rect(6,1,38,1,'#').rect(6,2,38,2,'v')
 .rect(24,7,26,7,'T').rect(24,8,26,8,'^').rect(14,7,15,7,'T').rect(14,8,15,8,'^').rect(0,7,6,22,'#').rect(7,7,7,20,'>').rect(0,1,0,6,'.').rect(1,1,5,1,'#');
// Slack Water: three lanes. Low: the sea lifts two floats toward the thorns and covers the thorns only while it is up.
// Middle: two rings over the bay, a cracking perch between. High: cracking stones to the shore, a super off the last.
const slack=lanes();
slack.rect(22,21,25,21,'F').rect(12,21,15,21,'F').put(13,8,'O').rect(19,12,21,12,'T').put(27,8,'O')
 .rect(26,5,28,5,'T').rect(14,5,19,5,'T').rect(12,7,14,7,'#').rect(26,7,28,7,'#');   // rock over each ring (not under any stone): no hooking through the floor

// Echo · The Rising Wreck: three lanes, two of your shades behind. Low: the sea lifts the wrecks toward the teeth and
// covers the thorns only while it is up, a cracking spar between. Middle: two rings, a cracking perch between, and the
// glass: through it left is right, all the way up the tear. High: through the glass again, cracking stones to the
// cabin roof.
const qwreck=lanes();
qwreck.rect(26,21,29,21,'F').rect(17,20,19,20,'T').rect(10,21,13,21,'F')
 .put(11,8,'O').rect(17,12,18,12,'T').put(25,8,'O').rect(29,7,29,11,'|')
 .rect(27,5,28,5,'T').rect(22,1,22,4,'|').rect(13,5,15,5,'T');
// Echo · The Upper Cabin: three lanes under low beams. Low: low and long under the beam over cracking stones, through
// the glass, and the tear while left is right. Middle: rings over the bay while swapped, and through the glass back.
// High: cracking stones to the tin and the soldier's echo.
const qcabin=lanes();
qcabin.rect(8,15,34,15,'v').rect(26,20,28,20,'T').rect(17,20,19,20,'T').rect(12,16,12,20,'|')
 .put(12,8,'O').rect(19,12,20,12,'T').put(26,8,'O').rect(30,7,30,11,'|')
 .rect(26,5,28,5,'T').rect(15,5,17,5,'T').rect(1,5,4,5,'#').put(2,4,'*').rect(11,7,13,7,'#').rect(25,7,27,7,'#');   // rock over each ring: no hooking through the floor
const meta={"n":37,"name":"The Fractured Shores","kit":["dash","strike","parry","portal"],"folk":{"organizer":{"cloak":"#ae8b64","trim":"#e3d1a1","skin":"#cbae90","hood":true},"soldier":{"cloak":"#5b6f74","trim":"#b4c4b5","skin":"#c8ac8c","hood":true}},"props":{"porch-table":[[0,-7,14,2,"#a7855b"],[1,-5,2,5,"#78603f"],[11,-5,2,5,"#78603f"]],"porch-table@candle-tin":[[0,-7,14,2,"#a7855b"],[1,-5,2,5,"#78603f"],[11,-5,2,5,"#78603f"],[4,-10,7,3,"#e5c7a2"],[5,-13,1,3,"#e8dfb6"],[5,-15,1,2,"#ffcf64"],[9,-13,1,3,"#e8dfb6"],[9,-15,1,2,"#ffcf64"]]},"blurb":"The Landing Shores, the tide coming in from the other side.","outro":"The last float. The colony’s lights are sweeping."};
const rooms=[
 r('slack','Slack Water','The sea lifts the floats and covers the thorns while up · rings over the bay · your shade behind','Three lanes of bay. When is the sea up, which ring next, and which stone still holds?',slack,
  {study:true,fault:{spread:4},shade:{delay:50},tide:{c0:5,c1:35,low:22,high:15,hold:60,move:50},lines:laneLines}),
 r('wreck','Wreck Lift','The wreck rides the tide up to the rigging · your shade is right behind you','When will the deck be high enough, if you can never wait?',wreck,
  {study:true,fault:{spread:4},shade:{delay:50},tide:{c0:16,c1:27,low:22,high:11,hold:40,move:60},lines:[{a:[21,9],b:[10,6],setDown:true}]}),
 r('launch','Launch','Run the cracking stone and jump late in the dash · the float keeps rising','How far can a jump carry if it leaves a dash, twice?',launch,
  {study:true,fault:{spread:4},tide:{c0:7,c1:12,low:22,high:17,hold:50,move:50},lines:[{a:[2,11],b:[31,10]}]}),
 r('spring','Spring Tide','Under the reef there is no room to jump · cross the bay low and long while the sea is out','How do you cross a bay you cannot jump, before the sea comes back?',spring,
  {study:true,fault:{spread:4},tide:{c0:9,c1:20,low:22,high:17,hold:60,move:24}}),
 r('tern','Under the Spray','Super onto the stone under the thorns · only the tear goes up · the spar cracks · shade behind','No jump under the ceiling, no jump under the cliff. How do you cross the bay low, and what lifts you?',tern,
  {study:true,fault:{spread:4},shade:{delay:45},lines:[{a:[15,13],b:[24,6],setDown:true}]}),
 {"id":"fs37-porch","name":"Behind the Sail","fault":{"spread":5},"hint":"The wreck cabin is an optional climb · the porch stones crack","question":"Will you fetch the candle tin before crossing the next bay?","map":["#################################.....##", "#......................................#", "#......................................#", "#......................................#", "#......................................#", "#......................................#", "#......................................#", "#......................................#", "#......................................#", "#......................................#", "#......................................#", "#......................................#", "#............TTT.......................#", ".............^^^.......................#", ".......................................#", "......TTT............TTT...............#", "......^^^............^^^...............#", "....................................P..#", "####........................############", "####........................############", "####........................############", "####^^^^^^^^^^^^^^^^^^^^^^^^############", "########################################"],"side":"up","people":[{"who":"organizer","name":"THE SOLDIER’S ECHO","c":31,"r":17,"quest":"birthday-echo","line":"They lit every candle. Nobody made an announcement.","lineDone":"Up in the wreck. Keep it dry."}],"decor":[{"k":"porch-table","c":28,"r":17}],"exit":"left"},
 r('buoy','Buoy','Dash down onto a buoy and jump as the dash comes back · the shade will not let you wait','Each buoy is too far for a jump and a dash. How do you leave one fast, with your dash back?',buoy,
  {study:true,shade:{delay:45},tide:{c0:1,c1:35,low:22,high:11,hold:40,move:40}}),
 r('super','Spring Super','Low and long under the curtain · the rising float lends a super its rise · panes swap left and right','Between the two panes, which way do you press to dash on?',sup,
  {study:true,fault:{spread:4},mirror:{},shade:{delay:45},tide:{c0:16,c1:21,low:22,high:14,hold:40,move:40}}),
 r('belled','Belled','Come down behind each warder before he turns · past the glass left is right · the third keeps the gate','Each warder faces the sea, and the stone behind him will not hold you long. Where do you come down?',belled,
  {study:true,fault:{fuse:20,spread:4},shade:{delay:45},mirror:{},jailers:[{x:29,y:18,dir:1,turn:36},{x:14,y:18,dir:-1,turn:0},{x:12,y:4,dir:1,turn:30}],lines:laneLines}),
 r('landfall','Landfall','Keep the lift through the moth and the ring · the tear sets you on cracking stone · the pane swaps you','From the float to the headland is one flight. What keeps you up each time you would fall?',landfall,
  {study:true,fault:{spread:4},shade:{delay:50},tide:{c0:27,c1:33,low:22,high:17,hold:30,move:30},foes:[{kind:'moth',x:22,y:12,period:120,path:[0,3]}],mirror:{},lines:[{a:[9,12],b:[14,7],setDown:true}]}),
 r('road','The Colony Road','Low and long under the teeth · the float rises into them · the tear, the last super · shade behind','From the shore to the high road, where can you stop?',road,
  {study:true,fault:{spread:4},shade:{delay:40},tide:{c0:8,c1:16,low:22,high:12,hold:50,move:60},lines:[{a:[5,8],b:[21,3],setDown:true}]})
];
const quests=[{...{"id":"birthday-echo","title":"Quiet on the Porch","giver":"The soldier’s echo","from":"fs37-porch","back":{"c":34,"r":17},"keepsake":{"id":"birthday-remembered","name":"The Organizer, remembered","gives":"The soldier had his birthday on the porch, and nobody made a fuss. Shown at the end."},"needs":"candle-tin"},rooms:[
 r('q-wreck','The Rising Wreck','The sea lifts the wrecks toward the teeth · rings over the bay · the glass swaps you · two shades','Two of your shades are behind you. When is the sea up, which ring next, and which way is forward through the glass?',qwreck,
  {study:true,fault:{spread:4},mirror:{},shade:{delay:45,count:2,gap:30},tide:{c0:5,c1:35,low:22,high:15,hold:50,move:50},lines:laneLines}),
 r('q-cabin','The Upper Cabin','Low under the beam · past the glass left is right for the tear and rings · the next glass turns it back','Through the glass, which way do you press for the tear, the rings and the tin?',qcabin,
  {study:true,fault:{spread:4},mirror:{},shade:{delay:45},lines:[{a:[10,18],b:[1,11],setDown:true},laneLines[1]],people:[{who:'organizer',name:'THE SOLDIER’S ECHO',c:3,r:4,quest:'birthday-echo',line:'That was a good cake.',lineDone:'It is quiet out here. I like it quiet.'}]})
]}];
export default {...meta,note:'7.280: rebuilt for the Fractured ramp (stage V).',rooms,quests};
