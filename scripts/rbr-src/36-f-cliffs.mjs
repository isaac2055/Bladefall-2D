// Room by Room · 36. The Fractured Cliffs (7.280 rework, hand-edited from the fracture.mjs reflection: do not regenerate).
// Source for public/bladefall-rbr-36-f-cliffs.js (node scripts/rbr-src/gen.mjs 36). docs/plans/fractured-hard.md,
// stage IV: mirror panes with hook rings (dash through glass and your left and right swap, so the swing pumps the
// other way), tears between the cliffs, and the Hydra's three chains in their base orientation, harder.
import {grid} from './build.mjs';
const R={
 "n": 36,
 "name": "The Fractured Cliffs",
 "kit": [
  "dash",
  "strike",
  "parry",
  "portal"
 ],
 "folk": {
  "sailor": {
   "cloak": "#546e7c",
   "trim": "#d9c49a",
   "skin": "#c9a883",
   "hood": true
  },
  "apprentice": {
   "cloak": "#8a6951",
   "trim": "#c5ac82",
   "skin": "#d4b293",
   "hood": true
  }
 },
 "props": {
  "shared-rope": [
   [
    0,
    -8,
    22,
    1,
    "#b29769"
   ]
  ],
  "shared-rope@split-charm": [
   [
    0,
    -8,
    22,
    1,
    "#b29769"
   ],
   [
    -13,
    -8,
    2,
    3,
    "#d8bb6b"
   ],
   [
    19,
    -8,
    2,
    3,
    "#d8bb6b"
   ]
  ]
 },
 "blurb": "Thunder Cliffs, reflected in the storm.",
 "outro": "The decks swing back. The shore below is already flooding.",
 "note": "First pass (7.278, the hourly Climb routine): Thunder Cliffs’s rooms reflected by scripts/rbr-src/fracture.mjs; edit that, or replace this region by hand. Every room reflected.",
 "rooms": [
  {
   "id": "ft36-chain",
   "name": "First Chain",
   "hint": "Hold grab near a ring in the air · up hauls in · jump releases",
   "study": true,
   "question": "The ledge is higher than a jump and a dash. What can you hang from on the way up?",
   "map": [
    "########################################",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    ".......................................#",
    ".......................................#",
    ".......................................#",
    "#################>...O.................#",
    "#################>.....................#",
    "#################>.....................#",
    "#################>.....................#",
    "#################>.....................#",
    "#################>.....................#",
    "#################>.....................#",
    "#################>.....................#",
    "#################>..................P..#",
    "#################>.......###############",
    "#################>.......###############",
    "#################>.......###############"
   ],
   "exit": "left"
  },
  {
   "id": "ft36-release",
   "name": "Let Go",
   "hint": "Let go on the upswing to keep the chain’s speed",
   "study": true,
   "question": "The far ledge is higher than where you start. What does the swing give you if you let go on the way up?",
   "map": [
    "########################################",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    ".......................................#",
    ".......................................#",
    ".......................................#",
    "#################...................P..#",
    "################>..............#########",
    "################>..............<########",
    "################>..............<########",
    "################>..............<########",
    "################>..............<########",
    "################>.......O......<########",
    "################>..............<########",
    "################>..............<########",
    "################>..............<########",
    "################>..............<########",
    "################>..............<########",
    "################>..............<########",
    "################>..............<########",
    "################>..............<########",
    "################>..............<########"
   ],
   "exit": "left"
  },
  {
   "id": "ft36-deck",
   "name": "Deck",
   "hint": "Moving timber carries you while your feet stay planted",
   "study": true,
   "decks": [
    {
     "c": 18,
     "r": 20,
     "w": 5,
     "to": [
      0,
      -11
     ],
     "period": 300,
     "phase": 150
    }
   ],
   "question": "No jump reaches the ledge, and its face is thorned. What will carry you up?",
   "map": [
    "########################################",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    ".......................................#",
    ".......................................#",
    ".......................................#",
    "##################.....................#",
    "#################>.....................#",
    "#################>.....................#",
    "#################>.....................#",
    "#################>.....................#",
    "#################>.....................#",
    "#################>.....................#",
    "#################>.....................#",
    "#################>.....................#",
    "#################>.....................#",
    "#################>..................P..#",
    "#################>.....#################",
    "#################>.....#################",
    "#################>.....#################"
   ],
   "exit": "left"
  },
  {
   "id": "ft36-run",
   "name": "Running Start",
   "hint": "Jump from the deck while it is moving",
   "study": true,
   "decks": [
    {
     "c": 32,
     "r": 14,
     "w": 3,
     "to": [
      -9,
      0
     ],
     "period": 90
    }
   ],
   "question": "From the end of the track the far ledge is out of reach. When is the deck worth more?",
   "map": [
    "########################################",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    ".......................................#",
    ".......................................#",
    ".......................................#",
    "#############>.........................#",
    "#############>.........................#",
    "#############>.........................#",
    "#############>...................P.....#",
    "#############>.....................#####",
    "#############>.....................#####",
    "#############>.....................#####",
    "#############>.....................#####",
    "#############>.....................#####",
    "#############>.....................#####",
    "#############>.....................#####",
    "#############>.....................#####",
    "#############>.....................#####"
   ],
   "exit": "left"
  },
  {
   "id": "ft36-ladder",
   "name": "Chain Ladder",
   "hint": "Hold grab as you leave one ring to catch the next",
   "exit": "up",
   "question": "The shaft is taller than any jump, and its walls are thorned. How do you climb it?",
   "map": [
    "#############>............<#############",
    "#############>............<#############",
    "#############>............<#############",
    "#############>......O.....<#############",
    "#############>............<#############",
    "#############>............<#############",
    "#############>............<#############",
    "#############>............<#############",
    "#############>...O........<#############",
    "#############>............<#############",
    "#############>............<#############",
    "#############>............<#############",
    "#############>............<#############",
    "#############>......O.....<#############",
    "#############>............<#############",
    "#############>............<#############",
    "#############>............<#############",
    "#############>............<#############",
    "#############>............<#############",
    "#############>.........P..<#############",
    "########################################",
    "########################################",
    "########################################"
   ]
  },
  {
   "id": "ft36-sailors",
   "name": "The Shared Line",
   "hint": "The loose rigging is an optional climb",
   "question": "Will you climb for the charm before taking the cliff path?",
   "map": [
    "#################################.....##",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    ".......................................#",
    ".......................................#",
    ".......................................#",
    ".......................................#",
    "....................................P..#",
    "#################^^^^^##################",
    "########################################",
    "########################################",
    "########################################",
    "########################################"
   ],
   "side": "up",
   "people": [
    {
     "who": "sailor",
     "name": "THE SAILORS’ ECHO",
     "c": 31,
     "r": 17,
     "quest": "sailors-echo",
     "line": "We each kept a half. We never once let go.",
     "lineDone": "The rigging again. Keep an eye out."
    }
   ],
   "decor": [
    {
     "k": "shared-rope",
     "c": 29,
     "r": 17
    }
   ],
   "exit": "left"
  },
  {
   "id": "ft36-deck-ring",
   "name": "Deck to Ring",
   "hint": "The deck gives the chain its starting speed",
   "decks": [
    {
     "c": 30,
     "r": 14,
     "w": 3,
     "to": [
      -12,
      0
     ],
     "period": 200
    }
   ],
   "question": "The ring is out of reach from the cliff, and from the deck at rest it swings you nowhere. What does the deck lend the chain?",
   "map": [
    "########################################",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    ".......................................#",
    ".......................................#",
    ".......................................#",
    "########>..............................#",
    "########>.......O......................#",
    "########>..............................#",
    "########>..............................#",
    "########>..............................#",
    "########>..............................#",
    "########>......................P.......#",
    "########>........................#######",
    "########>........................<######",
    "########>........................<######",
    "########>........................<######",
    "########>........................<######",
    "########>........................<######",
    "########>........................<######",
    "########>........................<######",
    "########>........................<######"
   ],
   "exit": "left"
  },
  {
   "id": "ft36-moth",
   "name": "Moth Between",
   "hint": "A downward blade cut bounces off a moth",
   "foes": [
    {
     "kind": "moth",
     "x": 13,
     "y": 9,
     "path": [
      0,
      2
     ],
     "period": 120
    }
   ],
   "question": "A fling and a dash fall short of the far cliff. What else in the air can you push off?",
   "map": [
    "########################################",
    "#........................###############",
    ".........................###############",
    ".........................###############",
    ".........................###############",
    "########>................###############",
    "########>..............................#",
    "########>...........................P..#",
    "########>......................#########",
    "########>......................<########",
    "########>......................<########",
    "########>......................<########",
    "########>......................<########",
    "########>......................<########",
    "########>...............O......<########",
    "########>......................<########",
    "########>......................<########",
    "########>......................<########",
    "########>......................<########",
    "########>......................<########",
    "########>......................<########",
    "########>......................<########",
    "########>......................<########"
   ],
   "exit": "left"
  },
  {
   "id": "ft36-long",
   "name": "Long Chain",
   "hint": "Down pays out the chain; up hauls it in",
   "question": "The tally stone hangs below the bottom of the swing. How long is the chain?",
   "map": [
    "########################################",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    ".G.....................................#",
    ".G.....................................#",
    ".G..................................P..#",
    "####################....O......#########",
    "###################>...........<########",
    "###################>...........<########",
    "###################>...........<########",
    "###################>...........<########",
    "###################>...........<########",
    "###################>...........<########",
    "###################>...........<########",
    "###################>...........<########",
    "###################>...........<########",
    "###################>....c......<########",
    "###################>...........<########",
    "###################>...........<########"
   ],
   "exit": "left"
  },
  {
   "id": "ft36-return",
   "study": true,
   "name": "Returned Fire",
   "hint": "Hold a direction when you parry to aim the return",
   "foes": [
    {
     "kind": "spit",
     "x": 18,
     "y": 13,
     "dir": [
      1,
      0
     ],
     "every": 100,
     "speed": 110
    }
   ],
   "question": "The tally stone is out of every reach. What can you send up there?",
   "map": [
    "########################################",
    "#......................................#",
    "#.......................c..............#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    ".G.....................................#",
    ".G.....................................#",
    ".G.....................................#",
    "##################..................P..#",
    "#################>.....O.......#########",
    "#################>.............<########",
    "#################>.............<########",
    "#################>.............<########",
    "#################>.............<########",
    "#################>.............<########",
    "#################>.............<########",
    "#################>.............<########",
    "#################>.............<########",
    "#################>.............<########",
    "#################>.............<########"
   ],
   "exit": "left"
  },
  {
   "id": "ft36-staple",
   "name": "The Staple",
   "hint": "The chain, moth and dash each lend a different lift",
   "decks": [
    {
     "c": 30,
     "r": 14,
     "w": 3,
     "to": [
      -12,
      0
     ],
     "period": 200
    }
   ],
   "foes": [
    {
     "kind": "moth",
     "x": 7,
     "y": 6,
     "path": [
      0,
      1
     ],
     "period": 120
    }
   ],
   "question": "The ledge is higher than any swing throws you. What is right in the air after the chain?",
   "map": [
    "########################################",
    ".......................................#",
    ".......................................#",
    "###>...................................#",
    "###>...................................#",
    "###>...................................#",
    "###>...................................#",
    "###>...................................#",
    "###>...................................#",
    "###>.............O.....................#",
    "###>...................................#",
    "###>...................................#",
    "###>...................................#",
    "###>...........................P.......#",
    "###>.............................#######",
    "###>.............................<######",
    "###>.............................<######",
    "###>.............................<######",
    "###>.............................<######",
    "###>.............................<######",
    "###>.............................<######",
    "###>.............................<######",
    "###>.............................<######"
   ],
   "exit": "left"
  },
  {
   "id": "ft36-lip",
   "name": "The Lip",
   "hint": "A shield protects the front; the landing chooses your side",
   "jailers": [
    {
     "x": 15,
     "y": 7,
     "dir": 1
    }
   ],
   "question": "The warder at the lip faces the drop and there is no room in front of him. Where do you land?",
   "map": [
    "########################################",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    ".G.....................................#",
    ".G.....................................#",
    ".G..................................P..#",
    "################>..............#########",
    "################>..............<########",
    "################>..............<########",
    "################>..............<########",
    "################>..............<########",
    "################>.......O......<########",
    "################>..............<########",
    "################>..............<########",
    "################>..............<########",
    "################>..............<########",
    "################>..............<########",
    "################>..............<########",
    "################>..............<########",
    "################>..............<########",
    "################>..............<########"
   ],
   "exit": "left"
  },
  {
   "id": "ft36-bite",
   "name": "The First Chain",
   "hint": "A hooked ascent earns one downward cut on the strained lock",
   "question": "When can you leave the collar above its lock?",
   "map": [
    "########################################",
    "#..G...................................#",
    "#..G...................................#",
    "#..G...................................#",
    "...G...................................#",
    "...G...................................#",
    "...G...................................#",
    "...G............O......................#",
    "########>..............................#",
    "########>..............................#",
    "########>..............................#",
    "########>..................O...........#",
    "########>..............................#",
    "########>..............................#",
    "########>..............................#",
    "########>..............................#",
    "########>..............................#",
    "########>...........................P..#",
    "########>......................#########",
    "########>......................#########",
    "########>......................#########",
    "########^^^^^^^^^^^^^^^^^^^^^^^#########",
    "########################################"
   ],
   "study": true,
   "chainHydra": {
    "phase": 0,
    "c": 5,
    "r": 7
   },
   "exit": "left"
  },
  {
   "id": "ft36-tide-head",
   "name": "The Tidal Chain",
   "hint": "A hooked ascent earns one downward cut on the strained lock",
   "question": "When can you leave the collar above its lock?",
   "map": [
    "########################################",
    "#..G...................................#",
    "#..G...................................#",
    "#..G...................................#",
    "...G...................................#",
    "...G...................................#",
    "...G...................................#",
    "...G...........O.......................#",
    "########>..............................#",
    "########>..............................#",
    "########>..............................#",
    "########>................O.............#",
    "########>..............................#",
    "########>..............................#",
    "########>..............................#",
    "########>..............................#",
    "########>..............................#",
    "########>...........................P..#",
    "########>......................#########",
    "########>......................#########",
    "########>......................#########",
    "########^^^^^^^^^^^^^^^^^^^^^^^#########",
    "########################################"
   ],
   "study": true,
   "chainHydra": {
    "phase": 1,
    "c": 5,
    "r": 7
   },
   "decks": [
    {
     "c": 27,
     "r": 17,
     "w": 4,
     "to": [
      -8,
      -5
     ],
     "period": 220
    }
   ],
   "exit": "left"
  },
  {
   "id": "ft36-storm",
   "name": "The Storm Chain",
   "hint": "A hooked ascent earns one downward cut on the strained lock",
   "question": "When can you leave the collar above its lock?",
   "map": [
    "########################################",
    "#..G...................................#",
    "#..G...................................#",
    "#..G...................................#",
    "...G...................................#",
    "...G...................................#",
    "...G...................................#",
    "...G..............O....................#",
    "########>..............................#",
    "########>..............................#",
    "########>..............................#",
    "########>..............................#",
    "########>...................O..........#",
    "########>..............................#",
    "########>..............................#",
    "########>..............................#",
    "########>..............................#",
    "########>...........................P..#",
    "########>......................#########",
    "########>......................#########",
    "########>......................#########",
    "########^^^^^^^^^^^^^^^^^^^^^^^#########",
    "########################################"
   ],
   "study": true,
   "chainHydra": {
    "phase": 2,
    "c": 5,
    "r": 7
   },
   "exit": "left"
  },
  {
   "id": "ft36-tide",
   "name": "The Tide Below",
   "hint": "A last foothold before the water",
   "question": "Where can you land before the tide takes over?",
   "map": [
    "########################################",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    "#......................................#",
    ".......................................#",
    ".......................................#",
    ".......................................#",
    "............#####......................#",
    "............#####...................P..#",
    "########################^^^^^###########",
    "########################################",
    "########################################",
    "########################################",
    "########################################"
   ],
   "exit": "left"
  }
 ],
 "quests": [
  {
   "id": "sailors-echo",
   "title": "Two Halves",
   "giver": "The sailors’ echo",
   "from": "ft36-sailors",
   "back": {
    "c": 34,
    "r": 17
   },
   "keepsake": {
    "id": "sailors-remembered",
    "name": "The Sailors, remembered",
    "gives": "Two sailors kept two halves of one charm, and the ship held. Shown at the end."
   },
   "rooms": [
    {
     "id": "ft36-q-rigging",
     "name": "The Loose Rigging",
     "hint": "Each ring takes the motion you bring to it",
     "question": "Where do you release so that the next ring catches the fall?",
     "map": [
      "########################################",
      "#......................................#",
      "#......................................#",
      "#......................................#",
      ".......................................#",
      ".......................................#",
      ".......................................#",
      "................O......................#",
      "########>..............................#",
      "########>..............................#",
      "########>..............................#",
      "########>..................O...........#",
      "########>..............................#",
      "########>..............................#",
      "########>..............................#",
      "########>..............................#",
      "########>..............................#",
      "########>...........................P..#",
      "########>......................#########",
      "########>......................#########",
      "########>......................#########",
      "########^^^^^^^^^^^^^^^^^^^^^^^#########",
      "########################################"
     ],
     "exit": "left"
    },
    {
     "id": "ft36-q-charm",
     "name": "Brass in the Rope",
     "hint": "Pay out the chain to reach below the swing",
     "question": "How long must the chain be to reach the charm?",
     "map": [
      "########################################",
      "#......................................#",
      "#......................................#",
      "#......................................#",
      "#......................................#",
      "#......................................#",
      "...............O.......................#",
      ".......................................#",
      ".........................O..........P..#",
      "...............................#########",
      "#######>......*................#########",
      "#######>.......................#########",
      "#######>.......................#########",
      "#######>.......................#########",
      "#######>.......................#########",
      "#######>.......................#########",
      "#######>.......................#########",
      "#######>.......................#########",
      "#######>.......................#########",
      "#######>.......................#########",
      "#######>.......................#########",
      "#######^^^^^^^^^^^^^^^^^^^^^^^^#########",
      "########################################"
     ],
     "exit": "left",
     "people": [
      {
       "who": "sailor",
       "name": "THE SAILORS’ ECHO",
       "c": 14,
       "r": 11,
       "quest": "sailors-echo",
       "line": "Still the rope. It was always the rope.",
       "lineDone": "But we kept the charm."
      }
     ]
    }
   ],
   "needs": "split-charm"
  }
 ]
};
const shell=()=>grid().frame();
const byId=id=>R.rooms.findIndex(x=>x.id===id);
const put=(id,room)=>{const i=byId(id);if(i<0)throw new Error('no room '+id);R.rooms[i]=room;};
// The Hydra's three chains, in the base orientation (the head and its spit are drawn on the right). Harder than the
// Thunder Cliffs fight (itself three cuts each): the head spits far more often and faster (the Tidal head spits too),
// and the twist is your own shade on the rings behind you: no waiting on a ledge, no swinging back through your path.
const HINT={bite:'Three hooked cuts free this collar · two shades swing behind you, and its spit comes fast',
 'tide-head':'Each cut drags the collar across the chasm · your shade follows the chain a moment behind you',
 storm:'Three cuts across the chasm, under its fastest spit · your shade is right behind you'};
for(const [slug,name,phase,ring,lock,extra,more] of [
 ['bite','The First Chain',0,[12,11,23,7],[34,7],{shade:{delay:140,count:2,gap:40}},{need:3,spit:{every:70,first:50,speed:140}}],
 ['tide-head','The Tidal Chain',1,[14,11,24,7],[34,7],{decks:[{c:9,r:17,w:4,to:[8,-5],period:220}],shade:{delay:70}},{need:3,locks:[[34,7],[6,17],[34,7]],spit:{every:75,first:50,speed:140}}],
 ['storm','The Storm Chain',2,[11,12,21,7],[34,7],{shade:{delay:55}},{need:3,locks:[[34,7],[6,17],[34,7]],spit:{every:70,first:60,speed:140}}]
]){
 const m=shell().rect(0,18,8,22,'#').put(3,17,'P').rect(9,21,38,21,'^').rect(9,22,38,22,'#').put(ring[0],ring[1],'O').put(ring[2],ring[3],'O').rect(32,8,39,22,'#').rect(31,8,31,20,'<').rect(39,4,39,7,'.').rect(36,1,36,7,'G');
 put('ft36-'+slug,{id:'ft36-'+slug,name,hint:HINT[slug],question:'When can you leave the collar above its lock, and where will its spit be?',map:m.rows(),study:true,chainHydra:{phase,c:lock[0],r:lock[1],...more},...extra});
}
// (7.280) Mirror panes with hook rings. Glass is a wall unless you dash through it, and coming through, left and right
// swap: the swing pumps the other way, the dash aims the other way, and walking out means pressing back.
const wall=(m,c,...slits)=>{m.rect(c,1,c,20,'#');for(const s of slits)m.put(c,s,'.');return m;};
const pit=(m,c0,c1)=>m.rect(c0,21,c1,21,'^').rect(c0,22,c1,22,'#');
const rm=(id,name,hint,question,m,extra={})=>({id:'ft36-'+id,name,hint,question,map:m.rows(),...extra});
// Mouth point of a tear end, and a wall with a one-tile slit where tear `l` crosses column c (only the ride threads it).
const P=(c,r)=>[c*8+4,r*8+2.5];
const gate=(m,c,l,r0=1,r1=20)=>{const [ax,ay]=P(...l.a),[bx,by]=P(...l.b),x=c*8+4,y=ay+(by-ay)*(x-ax)/(bx-ax);m.rect(c,r0,c,r1,'#').put(c,Math.floor(y/8),'.');return m;};
// Glass Chain — jump, dash through the glass, catch the ring with your hands swapped, let go onto the cracking
// perch, and aim the last tear up-left to go up-right.
// (fourth pass) The ring flings you at the first wall: drop onto the cracking stone below the slit (the ring kept
// no dash for you; stone gives it back), dash up into the tear through the slit, and from the far perch a tear high
// over it: jump, dash, ride through the second wall to the ledge.
const C1a={a:[24,11],b:[28,12],setDown:true},C1b={a:[31,6],b:[36,4],setDown:true};
const glass=shell().rect(0,18,6,22,'#').put(3,17,'P').rect(9,1,9,20,'|').put(17,9,'O').rect(27,13,29,13,'T').rect(35,5,39,22,'#').rect(34,6,34,20,'<').rect(39,1,39,4,'.');
pit(glass,7,34);gate(glass,25,C1a);gate(glass,33,C1b);glass.rect(22,14,24,14,'T');
put('ft36-chain',rm('chain','Glass Chain','Dash through glass and left and right swap · the ring still catches','Once you are through the glass, which way do you press to swing on, and to aim the tear?',glass,
 {mirror:{},fault:{},lines:[C1a,C1b]}));
// Two Panes — through the first pane to a ring, onto a cracking perch, through the second pane (which turns you
// back) to a second ring, and out onto the far ledge.
// (fourth pass) Let go of the second ring onto a last cracking perch (your dash back), and the ledge is behind a wall:
// jump, dash and ride through its slit.
const R2L={a:[35,8],b:[38,10],setDown:true};
const panes=shell().rect(0,18,5,22,'#').put(2,17,'P').rect(8,1,8,20,'|').put(14,9,'O').rect(18,13,20,13,'T').rect(23,1,23,20,'|').put(28,8,'O').rect(33,15,35,15,'T').rect(37,11,39,22,'#').rect(39,6,39,10,'.');
pit(panes,6,36);gate(panes,36,R2L);
put('ft36-release',rm('release','Two Panes','Every pane costs your dash · the second one turns you back','Where do you get your dash back between the two panes, and which way is forward on each ring?',panes,
 {mirror:{},fault:{},lines:[R2L]}));
// The Glass Seam — through the glass (swapped), onto a cracking perch, then a tear that rides through the second pane
// and turns you back, out onto a ring and a last dash to the ledge.
// (fourth pass) From the ring, a dash down into a tear through a new wall's slit to a cracking perch, and a jump-dash
// tear through the last wall to the ledge.
const R3b={a:[30,10],b:[33,14],setDown:true},R3c={a:[36,8],b:[38,10],setDown:true};
const seamg=shell().rect(0,18,5,22,'#').put(2,17,'P').rect(8,1,8,20,'|').rect(13,14,15,14,'T').rect(21,1,21,20,'|').put(29,8,'O').rect(32,15,34,15,'T').rect(37,11,39,22,'#').rect(39,6,39,10,'.');
pit(seamg,6,36);gate(seamg,31,R3b);gate(seamg,37,R3c,1,10);
put('ft36-run',rm('run','The Glass Seam','A tear rides through glass and turns you back, as a dash would','You ride through the second pane. Which way is forward when you come out?',seamg,
 {mirror:{},fault:{},lines:[{a:[17,8],b:[25,9]},R3b,R3c]}));
R.rooms.splice(byId('ft36-deck'),1);
R.rooms.splice(byId('ft36-tide'),1);
// (7.280, third pass) The reflected rooms rebuilt in the region's own words: glass, rings, cracking perches and tears,
// each room several decisions long with nowhere to rest. A wall with a one-tile slit where a tear crosses it: only the
// ride threads it, so no section can be skipped.
// Glass Ladder — up the thorned shaft: ring, a dash up through the glass floor across it (your hands swap), and two
// rings above it swung the other way, out of the top.
const ladder=grid().rect(0,0,12,22,'#').rect(27,0,39,22,'#').rect(13,0,13,19,'>').rect(26,0,26,19,'<').rect(13,20,26,22,'#')
 .put(22,19,'P').put(18,13,'O').rect(14,10,25,10,'|').put(17,5,'O').put(22,1,'O');
put('ft36-ladder',rm('ladder','Glass Ladder','A dash up through the glass floor swaps your hands · the rings above swing the other way','Which ring do you leave with a dash, and which way pumps the ring above the glass?',ladder,
 {exit:'up',mirror:{}}));
// The Shared Line — the sailors' echo on the bank; the rigging up the left (two rings to the hatch) is the way to the
// charm. The road: a ring over the thorns, a dash through the glass onto a cracking perch, a tear through the slit.
// (fourth pass) The tear now sets you on a second cracking perch, and the ledge is behind one more wall: jump and dash
// (your hands still swapped) into the tear through its slit.
const L5={a:[30,12],b:[34,15],setDown:true},L5b={a:[36,9],b:[38,11],setDown:true};
const sailors=shell().rect(0,18,9,22,'#').put(3,17,'P').rect(2,0,6,0,'.').put(4,11,'O').put(5,4,'O').put(15,10,'O').rect(23,1,23,20,'|')
 .rect(26,14,28,14,'T').rect(33,16,35,16,'T').rect(37,12,39,22,'#').rect(39,7,39,11,'.');
pit(sailors,10,36);gate(sailors,32,L5);gate(sailors,37,L5b,1,11);
put('ft36-sailors',rm('sailors','The Shared Line','The loose rigging is an optional climb · the road is through the glass','Will you climb for the charm before taking the cliff path?',sailors,
 {side:'up',mirror:{},fault:{},shade:{delay:45},lines:[L5,L5b],people:[{who:'sailor',name:'THE SAILORS’ ECHO',c:7,r:17,quest:'sailors-echo',line:'We each kept a half. We never once let go.',lineDone:'The rigging again. Keep an eye out.'}],decor:[{k:'shared-rope',c:5,r:17}]}));
// Deck to Ring — the deck lends the first ring its speed; through the glass to the second ring swung swapped, onto a
// cracking perch, and a tear through the slit.
// (fourth pass) The last tear is high over the perch now (jump, dash, ride), the ledge higher, and your shade swings
// behind you from your first move.
const L6={a:[33,6],b:[37,9],setDown:true};
const deckring=shell().rect(0,18,5,22,'#').put(2,17,'P').put(19,10,'O').rect(23,1,23,20,'|').put(28,7,'O').rect(29,13,31,13,'T')
 .rect(36,10,39,22,'#').rect(39,5,39,9,'.');
pit(deckring,6,35);gate(deckring,35,L6);
put('ft36-deck-ring',rm('deck-ring','Deck to Ring','The deck gives the chain its starting speed · the glass swaps the swing','The first ring is out of reach from the bank. What does the deck lend it, and which way do you pump the second?',deckring,
 {mirror:{},fault:{},shade:{delay:50},decks:[{c:7,r:18,w:3,to:[7,0],period:160}],lines:[L6]}));
// Glass Between (the moth room, re-made: the moth was never needed, so it is gone) — a ring, a dash through the glass
// onto a cracking perch with your hands swapped, and one dash through the second pane straight into the tear.
// (fourth pass) Let go of the ring into a tear through a new wall's slit, onto cracking stone (your dash back), and
// only then the two panes.
const L7a={a:[16,13],b:[21,12],setDown:true},L7={a:[33,12],b:[37,12],setDown:true};
const moth=shell().rect(0,18,5,22,'#').put(2,17,'P').put(11,9,'O').rect(20,13,22,13,'T').rect(25,1,25,20,'|').rect(29,14,31,14,'T').rect(32,1,32,20,'|')
 .rect(36,13,39,22,'#').rect(39,8,39,12,'.');
pit(moth,6,35);gate(moth,18,L7a);gate(moth,35,L7);
put('ft36-moth',rm('moth','Glass Between','Every pane swaps your hands · the last dash goes through glass and into the tear','Which way is forward on the perch, and which way after the second pane?',moth,
 {mirror:{},fault:{},lines:[L7a,L7]}));
// Long Chain — jump to the ring (keep your dash), pay the chain out to the tally stone below the swing (it opens the
// gate), haul in, let go and dash through the glass, swing the far ring swapped, and the perch's tear to the gate.
// (fourth pass) The perch's tear is high over it now: jump first, then the dash, with your hands swapped.
const L8={a:[32,10],b:[35,10],setDown:true};
const long=shell().rect(0,18,6,22,'#').put(3,17,'P').put(11,10,'O').put(11,19,'c').rect(18,1,18,20,'|').put(24,8,'O').rect(28,16,30,16,'T')
 .rect(34,15,39,22,'#').rect(37,10,37,14,'G').rect(39,10,39,14,'.');
pit(long,7,34);gate(long,33,L8);
put('ft36-long',rm('long','Long Chain','Down pays out the chain; up hauls it in · the stone below opens the gate','The tally stone hangs below the bottom of the swing. How long is the chain, and which way is up the far side of the glass?',long,
 {mirror:{},fault:{},lines:[L8]}));
// The Staple — the ring, a dash through the glass into the rising tear, and a jump off its cracking perch each lend
// a different lift (and the last one is made with your hands swapped); the ledge is higher than any of them alone.
// (fourth pass) The perch is lower now and the ledge out of reach of a jump and a dash from it: a second tear, entered
// with your hands swapped, climbs to the ledge.
const L9a={a:[21,11],b:[29,12],setDown:true},L9b={a:[32,7],b:[35,3],setDown:true};
const staple=shell().rect(0,18,5,22,'#').put(2,17,'P').put(14,9,'O').rect(19,1,19,20,'|').rect(28,13,30,13,'T').rect(34,4,39,22,'#').rect(33,5,33,20,'<').rect(39,1,39,3,'.');
pit(staple,6,33);gate(staple,25,L9a);staple.put(33,5,'.');
put('ft36-staple',rm('staple','The Staple','The ring, the tear and the perch each lend a different lift · the glass swaps the last','The ledge is higher than any swing throws you. Which way do you jump from the perch with your hands swapped?',staple,
 {mirror:{},fault:{},lines:[L9a,L9b]}));
R.rooms.splice(byId('ft36-return'),1);
R.rooms.splice(byId('ft36-lip'),1);
// Echo · Two Halves (sealed until the Shared Charm is held), rebuilt in glass. The region's hardest non-boss rooms.
// The Loose Rigging (7.280 fourth pass, rebuilt as the region's hardest crossing) — one ring off the bank, let go onto
// cracking stone, then three tears through three walls, each high over the perch before it: the first wall's slit is
// glass (the ride swaps your hands), the last one is glass too (it swaps them back), and two shades swing behind you.
const Lq1={a:[17,8],b:[22,11],setDown:true},Lq1b={a:[25,5],b:[30,8],setDown:true},Lq1c={a:[33,2],b:[37,6],setDown:true};
const rigq=shell().rect(0,18,5,22,'#').put(2,17,'P').put(9,13,'O').rect(13,15,15,15,'T').rect(21,12,23,12,'T').rect(29,9,31,9,'T').rect(28,12,32,12,'^').rect(28,13,32,13,'#')
 .rect(36,7,39,22,'#').rect(39,2,39,6,'.');
pit(rigq,6,35);gate(rigq,18,Lq1);gate(rigq,26,Lq1b);gate(rigq,34,Lq1c);rigq.put(18,8,'|').put(34,3,'|');
// Brass in the Rope — through the glass, pay the chain out to the charm below the swing, pump it back up with your
// hands swapped, and let go onto the cracking perch.
// (third pass) the second ring is gone (never needed); a cracking perch, a blinking tear through the slit to a
// second cracking perch, and a jump up to the sailors' ledge.
// (fourth pass) The blinking tear is high over the perch now (jump, dash, ride), and the sailors' ledge is behind a
// last wall: a dash up into its tear. Two shades swing behind you, so the charm has to be quick.
const Lq2={a:[32,4],b:[36,8],setDown:true,period:90,upT:45,phase:0},Lq3={a:[36,3],b:[38,3],setDown:true};
const charmq=shell().rect(0,18,5,22,'#').put(2,17,'P').rect(8,1,8,20,'|').put(15,7,'O').put(15,14,'*').rect(28,11,30,11,'T').rect(35,9,36,9,'T').rect(37,4,39,22,'#').rect(39,1,39,3,'.');
pit(charmq,6,36);gate(charmq,34,Lq2);gate(charmq,37,Lq3,1,3);charmq.rect(35,12,36,12,'^').rect(35,13,36,13,'#');
{const q=R.quests[0];
 q.back={c:5,r:17};   // (third pass) the rebuilt Shared Line starts on the left bank, by the sailors
 q.rooms[0]=rm('q-rigging','The Loose Rigging','One ring, three tears · the glass slits swap your hands and swap them back · two shades swing behind you','Through the first glass slit your hands are swapped. Which way do you jump and dash for the second tear?',rigq,{mirror:{},fault:{},shade:{delay:45,count:2,gap:30},lines:[Lq1,Lq1b,Lq1c]});
 q.rooms[1]=rm('q-charm','Brass in the Rope','Pay out the chain to reach below the swing · your hands are swapped on the far side of the glass','How long must the chain be to reach the charm, and which way pumps it back up?',charmq,
  {mirror:{},fault:{},shade:{delay:45,count:2,gap:30},lines:[Lq2,Lq3],people:[{who:'sailor',name:'THE SAILORS’ ECHO',c:38,r:3,quest:'sailors-echo',line:'Still the rope. It was always the rope.',lineDone:'But we kept the charm.'}]});}
export default R;
