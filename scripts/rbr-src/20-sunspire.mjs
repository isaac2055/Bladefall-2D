// Sunspire integrates the light/portal courses, then resolves the King in Daylight in three checkpointed hours.
// His own routed sunlight opens the side away from the knight. Two blooms per hour; he yields, never vanishes.
import {grid} from './build.mjs';
const rooms=[
 {
  "id": "s20-court",
  "name": "Sun Through Stone",
  "hint": "A beam that reaches an open end comes out of the other, turned",
  "beams": [
   {
    "c": 39,
    "r": 14,
    "dir": "l"
   }
  ],
  "portalMode": "one",
  "portals": [
   {
    "color": "orange",
    "c": 31,
    "r": 5,
    "face": "d"
   }
  ],
  "question": "The light runs overhead into portal stone, and the fixed end hangs in the roof of a sealed room. Where can you stand to open your end in the light’s way?",
  "map": [
   "########################################",
   "########################################",
   "########################################",
   "########################################",
   "########################################",
   "#............................##%%###...#",
   "#............................#.....#...#",
   "#............................#.....#...#",
   "#............................#..c..#...#",
   "#............................#######...#",
   "#......................................#",
   "#......................................#",
   "#......................................#",
   "%......................................#",
   "%......................................#",
   "#......................................#",
   "#......................................#",
   "#.....................................G.",
   "#.....................................G.",
   "#..P..................................G.",
   "########################################",
   "########################################",
   "########################################"
  ]
 },
 {
  "id": "s20-hours",
  "name": "Light It, Then Let Go",
  "hint": "",
  "beams": [
   {
    "c": 39,
    "r": 14,
    "dir": "l"
   }
  ],
  "portalMode": "one",
  "portals": [
   {
    "color": "orange",
    "c": 19,
    "r": 4,
    "face": "d"
   }
  ],
  "question": "Open your end in the light and it pours down across the road into the stone’s pit. Once the stone is lit, how do you get the road back?",
  "map": [
   "########################################",
   "########################################",
   "########################################",
   "########################################",
   "###################%%###################",
   "#......................................#",
   "#......................................#",
   "#......................................#",
   "#......................................#",
   "#......................................#",
   "#......................................#",
   "#......................................#",
   "#......................................#",
   "%......................................#",
   "%......................................#",
   "#......................................#",
   "#......................................#",
   "#.....................................G.",
   "%.....................................G.",
   "%..P..................................G.",
   "####################=###################",
   "####################.###################",
   "####################c###################"
  ]
 },
 {
  "id": "s20-ends",
  "name": "Both Ends",
  "hint": "With two ends of your own, each shot opens the next colour · light passes the moment both are open",
  "beams": [
   {
    "c": 0,
    "r": 12,
    "dir": "r"
   }
  ],
  "portalMode": "two",
  "question": "Only the stone in the pocket faces the slot, and the light pours out of it the moment both ends are open. Where must you be standing when you open the second?",
  "map": [
   "########################################",
   "########################################",
   "########################################",
   "########################################",
   "########################################",
   "#.............##.......................#",
   "#.............##.......................#",
   "#.............##.......................#",
   "#.............##.......................#",
   "#.............##.......................#",
   "#.............##.......................#",
   "#.............%#.......................#",
   "#.............%#.......................#",
   "#......................................#",
   "#.....................................G.",
   "#.....................................G.",
   "#.....................................G.",
   "#..........................##..#########",
   "#..........................%%..#########",
   "#..P.......................%%........c.#",
   "########################################",
   "########################################",
   "########################################"
  ]
 },
 {
  "id": "s20-glass",
  "name": "Glass in the Dark",
  "hint": "",
  "beams": [
   {
    "c": 39,
    "r": 13,
    "dir": "l"
   }
  ],
  "portalMode": "one",
  "portals": [
   {
    "color": "orange",
    "c": 24,
    "r": 4,
    "face": "d"
   }
  ],
  "question": "Open your end in the light and the mirror throws it back along the road at you. What do you do while it is still dark?",
  "map": [
   "########################################",
   "########################################",
   "########################################",
   "########################################",
   "######%%################%%##############",
   "#......................................#",
   "#......................................#",
   "#......................................#",
   "#......................................#",
   "#......................................#",
   "#......................................#",
   "#......................................#",
   "%......................................#",
   "%......................................#",
   "#......................................#",
   "#.....................................G.",
   "#.....................................G.",
   "#.....................................G.",
   "#.............................##########",
   "#..P...................../...........c.#",
   "########################################",
   "########################################",
   "########################################"
  ]
 },
 {
  "id": "s20-shade",
  "name": "Lantern Post",
  "hint": "A thrown lantern goes through a portal like anything else",
  "exit": "down",
  "beams": [
   {
    "c": 0,
    "r": 19,
    "dir": "r"
   }
  ],
  "portalMode": "one",
  "portals": [
   {
    "color": "orange",
    "c": 2,
    "r": 15,
    "face": "d"
   }
  ],
  "question": "The passage is lit from the window at its far end, and the way out is a drop beside the window. How does the shade get there before you do?",
  "map": [
   "########################################",
   "########################################",
   "########################################",
   "########################################",
   "########################################",
   "#......................................#",
   "#......................................#",
   "#......................................#",
   "#......................................#",
   "#......................................#",
   "#......................................#",
   "#......................................#",
   "#..............................l..P....#",
   "###################%%%%%############..##",
   "####################################..##",
   "##%%################################..##",
   "#......................................#",
   "#......................................#",
   "#......................................#",
   "#......................................#",
   "#######..###############################",
   "#######..###############################",
   "#######..###############################"
  ]
 },
 {
  "id": "s20-flume",
  "name": "The Light’s Door",
  "hint": "",
  "beams": [
   {
    "c": 8,
    "r": 4,
    "dir": "d"
   }
  ],
  "shutters": [
   {
    "open": 50,
    "shut": 70,
    "offset": 0
   }
  ],
  "portalMode": "one",
  "portals": [
   {
    "color": "orange",
    "c": 9,
    "r": 10,
    "face": "r"
   }
  ],
  "question": "Fall into your own end and the fixed one throws you over the thorns. The light falls into the same well and leaves by the same door. When is the door yours?",
  "map": [
   "########################################",
   "########################################",
   "########################################",
   "########################################",
   "########################################",
   "#........#.............................#",
   "#......XX#.............................#",
   "#........#.............................#",
   "#........#.............................#",
   "#........#.............................#",
   "#........%.............................#",
   "#...##...%.............................#",
   "#...##...#.............................#",
   "#...##...#.............................#",
   "#...##...#.............................#",
   "#...##...#.............................#",
   "#...##...#.............................#",
   "#...##...#..............................",
   "#...##...#..............................",
   "#.P.##...#^^^^^^^^^^^^^^^^^^............",
   "#######%%###############################",
   "########################################",
   "########################################"
  ]
 },
 {
  "id": "s20-crown",
  "name": "Ring Light",
  "hint": "You can fire a portal while you hang from a ring",
  "beams": [
   {
    "c": 0,
    "r": 19,
    "dir": "r"
   }
  ],
  "portalMode": "one",
  "portals": [
   {
    "color": "orange",
    "c": 4,
    "r": 18,
    "face": "l"
   }
  ],
  "question": "Only the far ring sees the panel on the landing’s roof. When in the swing do you fire, and when do you let go?",
  "map": [
   "########################################",
   "########################################",
   "########################################",
   "##############################c#########",
   "##############################v#########",
   "#..............................#########",
   "#..............................%########",
   "#.............................\\%########",
   "#.............O.........O.............G.",
   "#.....................................G.",
   "#.....................................G.",
   "#.....................................G.",
   "#.............................<#########",
   "#.............................<#########",
   "#.............................<#########",
   "#.............................<#########",
   "#..P..........................<#########",
   "##########....................<#########",
   "#...%#####....................<#########",
   "#...%#####^^^^^^^^^^^^^^^^^^^^^#########",
   "########################################",
   "########################################",
   "########################################"
  ]
 },
 {
  "id": "s20-engine",
  "name": "Noon Engine",
  "hint": "",
  "beams": [
   {
    "c": 0,
    "r": 12,
    "dir": "r"
   }
  ],
  "portalMode": "one",
  "portals": [
   {
    "color": "orange",
    "c": 21,
    "r": 11,
    "face": "r"
   }
  ],
  "question": "The panel is in line only from the cyan island, and cyan machinery stands in the light’s way. What does your next dash do to the island, to the light, and to your line?",
  "map": [
   "########################################",
   "########################################",
   "########################################",
   "########################################",
   "########################################",
   "#...................##.................#",
   "#...................##.................#",
   "#...................##.................#",
   "#...................##.................#",
   "#...................##.................#",
   "#...................##.................#",
   "#...................%%.....A.....#######",
   "#...................%%.....A..........c#",
   "#.................B..............#######",
   "#.....................................G.",
   "#.....................................G.",
   "#.....................................G.",
   "#.............AAA..BBBBBBBBBBBB#########",
   "#..............................#########",
   "#..P......^^^^^^^^^^^^^^^^^^^^^#########",
   "########################################",
   "########################################",
   "########################################"
  ]
 },
 {
  "id": "s20-deliveries",
  "name": "Two Deliveries",
  "hint": "A husk stops the light · a bolt through your portal is yours, and breaks a husk",
  "beams": [
   {
    "c": 39,
    "r": 14,
    "dir": "l"
   }
  ],
  "portalMode": "one",
  "portals": [
   {
    "color": "orange",
    "c": 0,
    "r": 8,
    "face": "r"
   }
  ],
  "foes": [
   {
    "kind": "husk",
    "x": 20,
    "y": 9,
    "w": 1,
    "h": 1
   },
   {
    "kind": "spit",
    "x": 37,
    "y": 19,
    "dir": [
     -1,
     0
    ],
    "every": 120,
    "offset": 60
   }
  ],
  "study": true,
  "question": "A husk plugs the slot, and the glass at its end turns light but not bolts. Your one end can take in the light or a bolt: which goes first?",
  "map": [
   "########################################",
   "########################################",
   "########################################",
   "########################################",
   "########################################",
   "########################################",
   "########################################",
   "########################################",
   "%.######################################",
   "%.............................\\#########",
   "##############################c#########",
   "#.............................#........#",
   "#......................................#",
   "%......................................#",
   "%......................................#",
   "#......................................#",
   "#......................................#",
   "#.....................................G.",
   "%.....................................G.",
   "%...P.................................G.",
   "########################################",
   "########################################",
   "########################################"
  ]
 }
];
const hints=['A beam entering a portal leaves through its twin','A lit seal stays lit after you move the portal','Each end must face the beam it receives','Turn the mirror before letting the sunlight in','A lantern can carry shade through a portal','The shutter decides when the portal belongs to you','A ring puts you beside the high panel','Every dash changes both the island and its shadow','The glass turns sunlight; a returned bolt takes another route'];
rooms.forEach((r,i)=>r.hint=hints[i]);
const road=()=>grid().frame().rect(0,18,39,22,'#').rect(39,13,39,17,'.').put(3,17,'P');
const garden=road().rect(22,18,25,18,'^').rect(2,0,6,0,'.');
rooms.splice(4,0,{id:'s20-garden',name:'The Evening Bench',hint:'The mirror gallery is an optional way into the garden',question:'Will you close the shutters before taking the throne road?',map:garden.rows(),side:'up',people:[{who:'gardener',name:'THE GARDENER',c:8,r:17,quest:'garden',line:'His Majesty wants the three shutters open. The flowers need the dark. The handles are through the gallery.',lineDone:'By the bench. That one hasn’t opened in years. She liked it in the evenings.'}],decor:[{k:'evening-bench',c:12,r:17}]});
const dawn=road().put(3,17,'.').put(30,17,'P').rect(10,14,10,17,'%').rect(9,14,9,17,'#').rect(36,3,36,13,'%').rect(37,3,37,13,'#').rect(38,1,38,17,'G').rect(32,18,33,18,'%');
const morning=road().put(3,17,'.').put(8,17,'P').rect(30,14,30,17,'%').rect(31,14,31,17,'#').rect(3,3,3,13,'%').rect(2,3,2,13,'#').rect(38,1,38,17,'G').rect(6,18,7,18,'%');
const noon=road().put(3,17,'.').put(31,17,'P').rect(18,14,26,17,'#').rect(8,10,8,13,'%').rect(7,10,7,13,'#').rect(36,1,36,10,'%').rect(37,1,37,10,'#').rect(38,1,38,17,'G').rect(31,18,32,18,'%');
for(const [id,name,map,king,port,beam]of[
 ['dawn','The Throne at Dawn',dawn,{c:23,r:17,hour:0,need:3,beat:[150,120,100],wave:1,suns:[{c:0,r:6,dir:'r'},{c:0,r:12,dir:'r'},{c:33,r:0,dir:'d'}]},{color:'orange',c:10,r:16,face:'r'},{c:0,r:6,dir:'r'}],
 ['morning','The Glove of Morning',morning,{c:20,r:17,hour:1,need:3,beat:[150,120,100],wave:1,suns:[{c:36,r:6,dir:'l'},{c:36,r:12,dir:'l'},{c:6,r:0,dir:'d'}]},{color:'orange',c:30,r:16,face:'l'},{c:36,r:6,dir:'l'}],
 ['noon','The Last Noon',noon,{c:22,r:13,hour:2,need:3,beat:[150,120,100],wave:1,suns:[{c:0,r:5,dir:'r'},{c:0,r:2,dir:'r'},{c:32,r:0,dir:'d'}]},{color:'orange',c:8,r:12,face:'r'},{c:0,r:5,dir:'r'}]
])rooms.push({id:'s20-'+id,name,hint:'Route his sunlight onto the side away from you · strike while the gold opens · each bloom moves his sun',question:'Where must the light arrive so that your blade finds the open side?',map:map.rows(),study:true,portalMode:'one',portals:[port],beams:[beam],dayKing:king});
const sea=grid().frame().rect(0,18,8,22,'#').put(3,17,'P').rect(9,22,39,22,'^').rect(39,12,39,21,'.');
rooms.push({id:'s20-sea',name:'The Sea Terrace',hint:'The hydra has come to carry you home · a raised head shades you from the King’s last light',question:'The light falls in shafts and the heads rise and dip in turn. Where on her back are you safe as each shaft crosses?',map:sea.rows(),decks:[{c:10,r:17,w:12,to:[27,0],period:420}],hydraRide:{shafts:[24,29,34],heads:[{at:0,w:3,up:90,down:50,phase:0},{at:4.5,w:3,up:90,down:50,phase:47},{at:9,w:3,up:90,down:50,phase:94}]},people:[{who:'hydra',name:'THE THREE HEADS',voiceUntilDone:true,c:8,r:17,line:'You broke our chains. Your Echo walks your roads backwards. Climb on.'}]});
const lower=road().put(12,14,'c').rect(36,1,36,17,'G').rect(24,18,28,18,'^');
const middle=road().rect(10,14,15,17,'#').rect(19,10,23,10,'#').put(21,9,'c').rect(36,1,36,17,'G').rect(28,18,31,18,'^');
const upper=grid().frame().rect(0,18,8,22,'#').put(3,17,'P').rect(9,21,38,21,'^').rect(9,22,38,22,'#').put(18,10,'O').rect(29,9,39,22,'#').rect(28,9,28,20,'<').put(30,8,'c').put(33,8,'*').rect(36,1,36,8,'G').rect(39,5,39,8,'.');
export default{n:20,name:'Sunspire Palace',kit:['dash','strike','parry','portal'],blurb:'The dials all say a quarter to four. The sun obeys the windows; the windows obey the portals.',outro:'The King lowers his glove, all flowers. The hydra carries you west. Behind you the palace grows small; ahead, the old roads wake in reverse.',folk:{gardener:{cloak:'#8a9777',trim:'#e4dab1',skin:'#c7ad8c',hood:true},hydra:{cloak:'#598b8c',trim:'#b5cebd',skin:'#779e8a',hood:true}},props:{'evening-bench':[[0,-6,16,2,'#b4a184'],[2,-4,2,4,'#8c7859'],[12,-4,2,4,'#8c7859'],[19,-4,1,4,'#657b50']],'evening-bench@night-flower':[[0,-6,16,2,'#b4a184'],[2,-4,2,4,'#8c7859'],[12,-4,2,4,'#8c7859'],[19,-5,1,5,'#657b50'],[17,-8,5,4,'#d7d3ed']]},rooms,quests:[{id:'garden',title:'The Night Garden',giver:'The Gardener',from:'s20-garden',back:{c:5,r:17},keepsake:{id:'night-flower',name:'The Evening Flower',gives:'The garden blooms in shade, and the Gardener’s Fractured echo opens.'},rooms:[{id:'s20-q-lower',name:'The Lower Shutter',hint:'The gold handle closes the garden shutter permanently',question:'Where can you reach the handle without crossing the light?',map:lower.rows(),beams:[{c:20,r:2,dir:'d'}],gardenShade:{c:20,r:4}},{id:'s20-q-middle',name:'The Middle Shutter',hint:'The handle is above the gallery’s shelter',question:'Which foothold puts you beside the second handle?',map:middle.rows(),beams:[{c:26,r:2,dir:'d'}],gardenShade:{c:26,r:4}},{id:'s20-q-upper',name:'The Upper Shutter',hint:'The sling and ring reach the last handle',question:'When can you leave the sling to catch the upper rigging?',map:upper.rows(),decks:[{c:8,r:17,w:4,to:[12,-5],period:220}],beams:[{c:34,r:2,dir:'d'}],gardenShade:{c:34,r:4}}]}]};
