// Landing Shores integrates Part XVII's tide sequence. (7.280: the momentum rooms s17-launch, s17-buoy and s17-super
// moved to the Fractured Shores, 37, with the rest of the momentum tech; the base road is plain. The Tide Line
// brings back the Void Tyrant's tear: it hangs over the bay where only the high sea reaches it.)
// All at Once branches to a tide-lifted wreck and mast ring; the soldier chooses the quiet porch.
import {grid} from './build.mjs';
const rooms=[
 {
  "id": "s17-slack",
  "name": "Slack Water",
  "hint": "Wait for the sea to cover the thorns",
  "study": true,
  "tide": {
   "c0": 11,
   "c1": 30,
   "low": 20,
   "high": 15,
   "hold": 130,
   "move": 40
  },
  "question": "The reef hangs down to a hand's breadth over the thorns. What does the sea do to thorns?",
  "map": [
   "########################################",
   "########################################",
   "########################################",
   "########################################",
   "########################################",
   "########################################",
   "#...............##########.............#",
   "#...............##########.............#",
   "#...............##########.............#",
   "#...............##########.............#",
   "#...............##########.............#",
   "#...............##########.............#",
   "#...............##########..............",
   "#...............##########..............",
   "#....P..........##########..............",
   "###########.....##########.....#########",
   "###########.....##########.....#########",
   "###########....................#########",
   "###########....................#########",
   "###########^^^^^^^^^^^^^^^^^^^^#########",
   "########################################",
   "########################################",
   "########################################"
  ]
 },
 {
  "id": "s17-wreck",
  "name": "Wreck Lift",
  "hint": "A float rides the water up and down",
  "study": true,
  "tide": {
   "c0": 19,
   "c1": 29,
   "low": 20,
   "high": 13,
   "hold": 60,
   "move": 100
  },
  "question": "The pier is out of reach from the sand and from the sea. What will the sea lift?",
  "map": [
   "########################################",
   "#############...........................",
   "#############...........................",
   "#############.................<#########",
   "##########....................<#########",
   "##########....................<#########",
   "##########....................<#########",
   "##########....................<#########",
   "##########....................<#########",
   "##########....................<#########",
   "##########....................<#########",
   "##########....................<#########",
   "##########...P.......FFFFFFFF.<#########",
   "###################..FFFFFFFF.<#########",
   "###################..FFFFFFFF.<#########",
   "###################..FFFFFFFF.<#########",
   "###################..FFFFFFFF.<#########",
   "###################..FFFFFFFF.<#########",
   "###################..FFFFFFFF.<#########",
   "###################..FFFFFFFF.<#########",
   "########################################",
   "########################################",
   "########################################"
  ]
 },
 {
  "id": "s17-spring",
  "name": "Spring Tide",
  "hint": "A rising float lends its lift to your jump",
  "study": true,
  "tide": {
   "c0": 15,
   "c1": 25,
   "low": 20,
   "high": 14,
   "hold": 40,
   "move": 24
  },
  "question": "Resting at high water, the float leaves you short of the pier. When is it worth more?",
  "map": [
   "########################################",
   "##############..........................",
   "##############..........................",
   "##############>...........<#############",
   "##############>...........<#############",
   "##############>...........<#############",
   "##############>...........<#############",
   "##############>...........<#############",
   "##############>...........<#############",
   "##############>...........<#############",
   "##############>...........<#############",
   "##############>...........<#############",
   "##############>...........<#############",
   "##############>...........<#############",
   "##############>...........<#############",
   "##############>...........<#############",
   "##############>...........<#############",
   "##############>...........<#############",
   "##############>..........P<#############",
   "###############^^^^^FFFFFF<#############",
   "########################################",
   "########################################",
   "########################################"
  ]
 },
 {
  "id": "s17-tern",
  "name": "Tern",
  "hint": "A downward cut bounces off the tern",
  "study": true,
  "tide": {
   "c0": 12,
   "c1": 30,
   "low": 20,
   "high": 13,
   "hold": 90,
   "move": 60
  },
  "foes": [
   {
    "kind": "moth",
    "x": 28,
    "y": 11
   }
  ],
  "question": "The pier is higher than a stroke and a dash can take you from the water. What over the water gives you more?",
  "map": [
   "########################################",
   "###########...........#################.",
   "###########.............................",
   "###########.............................",
   "########.......................<########",
   "########.......................<########",
   "########.......................<########",
   "########.......................<########",
   "########.......................<########",
   "########.......................<########",
   "########.......................<########",
   "########.P.....................<########",
   "############...................<########",
   "############...................<########",
   "############...................<########",
   "############...................<########",
   "############...................<########",
   "############...................<########",
   "############...................<########",
   "############^^^^^^^^^^^^^^^^^^^<########",
   "########################################",
   "########################################",
   "########################################"
  ]
 },
 {
  "id": "s17-mooring",
  "name": "Mooring Ring",
  "hint": "The rising hull lends height to the swing",
  "study": true,
  "tide": {
   "c0": 3,
   "c1": 33,
   "low": 21,
   "high": 13,
   "hold": 50,
   "move": 64
  },
  "question": "The headland is past any leap from the hull. How do you get above the ring, and where do you let go?",
  "map": [
   "########################################",
   "##>.....................................",
   "##>.....................................",
   "##>.....................................",
   "##>...............................<#####",
   "##>...................O...........<#####",
   "##>...............................<#####",
   "##>...............................<#####",
   "##>...............................<#####",
   "##>...............................<#####",
   "##>...............................<#####",
   "##>...............................<#####",
   "##>...............................<#####",
   "##>...............................<#####",
   "##>...............................<#####",
   "##>..P............................<#####",
   "##>FFFFFF.........................<#####",
   "##>FFFFFF.........................<#####",
   "##>FFFFFF.........................<#####",
   "##>FFFFFF.........................<#####",
   "#########^^^^^^^^^^^^^^^^^^^^^^^^^<#####",
   "########################################",
   "########################################"
  ]
 },
 {
  "id": "s17-belled",
  "name": "Belled",
  "hint": "His shield faces the water; choose where you come down",
  "study": true,
  "tide": {
   "c0": 3,
   "c1": 9,
   "low": 20,
   "high": 16,
   "hold": 40,
   "move": 16
  },
  "jailers": [
   {
    "x": 26,
    "y": 8,
    "dir": -1
   }
  ],
  "question": "His shield faces the sea from the very edge of the pier. How do you come down behind him?",
  "map": [
   "########################################",
   "########################################",
   "###....................................#",
   "###....................................#",
   "###....................................#",
   "###..................................G..",
   "###..................................G..",
   "###..................................G..",
   "###..................................G..",
   "###......................<##############",
   "###......................<##############",
   "###......................<##############",
   "###......................<##############",
   "###......................<##############",
   "###......................<##############",
   "###.......^^.............<##############",
   "###.......##.............<##############",
   "###.......##.............<##############",
   "###...P...##.............<##############",
   "###FFFFFFF##.............<##############",
   "############.............<##############",
   "############.............<##############",
   "############.............<##############"
  ]
 },
 {
  "id": "s17-landfall",
  "name": "Landfall",
  "hint": "Keep the lift through the moth and the ring",
  "study": true,
  "tide": {
   "c0": 1,
   "c1": 5,
   "low": 21,
   "high": 17,
   "hold": 30,
   "move": 16
  },
  "foes": [
   {
    "kind": "moth",
    "x": 22,
    "y": 9
   }
  ],
  "question": "From the float to the headland is one flight. What keeps you up each time you would fall?",
  "map": [
   "########################################",
   "#......................................#",
   "#>......................................",
   "#>......................................",
   "#>................................O.....",
   "#>..................................<###",
   "#>..................................<###",
   "#>..................................<###",
   "#>..................................<###",
   "#>..................................<###",
   "#>..................................<###",
   "#>..................................<###",
   "#>..................................<###",
   "#>..................................<###",
   "#...................................<###",
   "#...................................<###",
   "#...................................<###",
   "#.....##............................<###",
   "#.....##............................<###",
   "#..P..##............................<###",
   "#FFFFF##............................<###",
   "########^^^^^^^^^^^^^^^^^^^^^^^^^^^^<###",
   "########################################"
  ]
 }
];
const road=()=>grid().frame().rect(0,18,39,22,'#').rect(39,13,39,17,'.').put(3,17,'P');
const porch=road().rect(21,18,24,18,'^').rect(2,0,6,0,'.');
// The Tide Line (7.280): the tear from the Void Tyrant, over the bay. Its near mouth hangs out of reach of the ledge;
// only the high sea lifts a swimmer to it, and the sea never covers the thorns under the far pier, so the tide alone
// cannot cross. The far pier's face is thorned and too high to climb out of the water.
const tideLine=grid().frame().rect(0,18,6,22,'#').put(3,17,'P').rect(7,21,32,21,'^').rect(33,8,39,22,'#').rect(32,9,32,20,'<').rect(39,3,39,7,'.');
rooms.splice(3,0,{id:'s17-line',name:'The Tide Line',hint:'A tear carries you where the sea cannot · its mouth hangs above the high water',question:'The tear hangs too high to reach from the ledge, and the sea stops short of the pier. When can you reach its mouth?',study:true,tide:{c0:7,c1:22,low:22,high:10,hold:90,move:40},lines:[{a:[17,8],b:[34,7]}],map:tideLine.rows()});
rooms.splice(5,0,{id:'s17-porch',name:'Behind the Sail',hint:'The wreck cabin is an optional climb',question:'Will you fetch the candle tin before crossing the next bay?',map:porch.rows(),side:'up',people:[{who:'organizer',name:'THE ORGANIZER',c:8,r:17,quest:'birthday',line:'Candles! The tin is in the upper wreck cabin. Keep it dry; it’s the only one.',lineDone:'Candles are lit. We’ll bring the cake out here.'},{who:'soldier',name:'THE SOLDIER',c:14,r:17,quest:'birthday',line:'A birthday? Porch would suit me. Don’t make an announcement about it.',lineDone:'That’s a good cake. It’s quiet out here.'}],decor:[{k:'porch-table',c:16,r:17}]});
rooms.push({id:'s17-road',name:'The Colony Road',hint:'Dry footing beyond the last wave',question:'Where do you land before the road climbs?',map:road().rect(12,18,16,18,'^').rect(25,15,29,17,'#').rows()});
const wreck=grid().frame().rect(0,18,9,22,'#').put(3,17,'P').rect(10,21,30,22,'#').rect(10,20,30,20,'^').rect(15,18,20,19,'F').put(25,10,'O').rect(32,9,39,22,'#').rect(31,9,31,20,'<').rect(39,5,39,8,'.');
const cabin=grid().frame().rect(0,10,8,22,'#').put(3,9,'P').put(14,10,'O').put(24,8,'O').rect(31,10,39,22,'#').rect(30,10,30,20,'<').rect(9,21,29,21,'^').rect(9,22,29,22,'#').rect(39,6,39,9,'.').put(33,9,'*');
export default{n:17,name:'The Landing Shores',kit:['dash','strike','parry','portal'],blurb:'The tide covers thorns and lifts the wreckage. Beyond the water, someone is trying to arrange a quiet birthday.',outro:'Dry road reaches the Colony. In the windows ahead, watch lamps turn over the roofs.',folk:{organizer:{cloak:'#ae8b64',trim:'#e3d1a1',skin:'#cbae90',hood:true},soldier:{cloak:'#5b6f74',trim:'#b4c4b5',skin:'#c8ac8c',hood:true}},props:{'porch-table':[[0,-7,14,2,'#a7855b'],[1,-5,2,5,'#78603f'],[11,-5,2,5,'#78603f']],'porch-table@candle-tin':[[0,-7,14,2,'#a7855b'],[1,-5,2,5,'#78603f'],[11,-5,2,5,'#78603f'],[4,-10,7,3,'#e5c7a2'],[5,-13,1,3,'#e8dfb6'],[5,-15,1,2,'#ffcf64'],[9,-13,1,3,'#e8dfb6'],[9,-15,1,2,'#ffcf64']]},rooms,quests:[{id:'birthday',title:'All at Once',giver:'The Organizer',from:'s17-porch',back:{c:5,r:17},keepsake:{id:'candle-tin',name:'The Watertight Tin',gives:'Candles light the porch gathering, and the soldier’s Fractured echo opens.'},rooms:[{id:'s17-q-wreck',name:'The Rising Wreck',hint:'The float lifts you toward the mast ring',question:'When is the wreck high enough to reach the rigging?',study:true,tide:{c0:10,c1:30,low:21,high:14,hold:45,move:65},map:wreck.rows()},{id:'s17-q-cabin',name:'The Upper Cabin',hint:'The rings cross the broken deck',question:'Where can you release and still land beside the tin?',map:cabin.rows()}]}]};
