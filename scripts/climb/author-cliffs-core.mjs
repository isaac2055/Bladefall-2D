// Local authoring source. Re-running deliberately clears this draft's route proofs.
import {writeFileSync} from 'node:fs';
import {coreCrumbleGrace} from './core-difficulty.mjs';
// Thunder Cliffs: every dash turns the cliff (gold A stands until you dash, blue B only after). Rings carry you,
// decks ferry you, crumbling ledges give no grace, seeds give the dash back in the air. Sections are built from
// SECTIONS below, each a different beat; SECTION_LIMIT lets authoring prove them one at a time.
const cols=168,rows=144,m=Array.from({length:rows},()=>Array(cols).fill('.'));
function rect(c,r,w,h,ch='#'){for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++){if(!m[y]||x<0||x>=cols)throw Error('Outside room '+[c,r]);m[y][x]=ch;}}
const put=(c,r,ch)=>rect(c,r,1,1,ch);
const crown=(c,r,h,w=2)=>{rect(c,r,w,h);rect(c,r-1,w,1,'^');rect(c,r+h,w,1,'v');};
rect(0,0,cols,1);rect(0,1,1,rows-1);rect(cols-1,1,1,rows-1);rect(1,1,1,rows-3,'>');rect(cols-2,1,1,rows-3,'<');rect(1,rows-2,cols-2,1,'^');rect(0,rows-1,cols,1);
const stages=[],checkpoints=[],decks=[];
const land=(c,r,w,extra={})=>stages.push({x:(c+Math.floor(w/2))*8,y:r*8-11,...extra});
const hook=(c,r,extra={})=>stages.push({x:c*8,y:r*8+8,event:'hook',eventAt:true,eventRadius:40,...extra});
const save=(c,r,w,name,facing=1)=>{rect(c,r,w,1);checkpoints.push({c:c+Math.floor(w/2),r:r-1,width:w*8,facing,name,resetPhase:true});land(c,r,w);};
const SECTIONS=[
 // 1 · The Storm Ledge: off a crumbling start, dash out of the swing to bring the blue ledge in; a long jump-out
 // swing keeps it blue; a seed returns the dash in the air, and that dash turns the cliff gold for the landing.
 ()=>{rect(4,136,6,1,'~');put(6,135,'P');
  put(14,130,'O');rect(24,133,5,1,'B');hook(14,130,{phase:0});land(24,133,5,{phase:1});
  put(32,127,'O');rect(44,130,5,1,'B');hook(32,127,{phase:1});land(44,130,5,{phase:1});
  put(59,122,'b');rect(63,124,4,1,'A');stages.push({x:59*8,y:122*8,event:'pogo-loft',eventAt:true,eventRadius:24,phase:0});land(63,124,4,{phase:0});
  save(76,122,7,'The Storm Ledge');},
 // 2 · The Rolling Deck: a deck climbs out over the void; leave it high for a ring, dash the blue ledge in, cross
 // to crumbling stone with no grace, catch a thorn-capped wall, and kick back to the ring that clears its cap.
 ()=>{decks.push({c:83,r:123,w:4,h:1,to:[18,-10],period:220,phase:0});
  put(106,108,'O');rect(116,111,4,1,'B');hook(106,108,{phase:0,minDashes:1});land(116,111,4,{phase:1});
  rect(128,107,4,1,'~');land(128,107,4);
  crown(140,90,14);stages.push({x:139*8-2,y:96*8,grip:true,toleranceY:40});
  put(132,86,'O');hook(132,86);
  save(146,92,7,'The Rolling Deck',-1);},
 // 3 · The Gold Chimney: under a stone pier into a chimney whose far wall is gold. Climb it by wall jumps alone:
 // any dash takes the gold wall away. At the top a ring throws you back over the pier's thorns onto blue.
 ()=>{rect(154,62,2,27);rect(154,61,2,1,'^');rect(154,89,2,1,'v');rect(162,58,2,33,'A');
  stages.push({x:160*8,y:84*8,grip:true,toleranceY:40,phase:0});
  stages.push({x:157*8,y:72*8,air:true,toleranceY:40,toleranceX:30,phase:0});
  stages.push({x:160*8,y:62*8,grip:true,toleranceY:24,phase:0});
  put(159,60,'o');put(158,55,'O');hook(158,55,{phase:0,minDashes:1});
  rect(146,58,4,1,'B');land(146,58,4,{phase:1});
  put(139,52,'b');stages.push({x:139*8,y:52*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  save(125,55,7,'The Gold Chimney',-1);},
 // 4 · The Burning Bridge: west over the void, where every landing depends on how many dashes you have spent:
 // dash to blue, dash to a seed (gold again), take the dash back and spend it down onto blue, cross crumbling stone
 // with no grace into a hyper that lands on gold, then a ring and one more dash for the last blue ledge.
 ()=>{rect(110,57,4,1,'B');land(110,57,4,{phase:1});
  put(101,51,'b');stages.push({x:101*8,y:51*8,event:'pogo-loft',eventAt:true,eventRadius:24,phase:0});
  rect(90,59,4,1,'B');land(90,59,4,{phase:1});
  rect(78,58,4,1,'~');land(78,58,4);
  rect(63,58,4,1,'A');land(63,58,4,{phase:0});
  put(58,52,'O');hook(58,52,{phase:0,minDashes:1});
  rect(45,55,4,1,'B');land(45,55,4,{phase:1});
  save(30,54,7,'The Burning Bridge',-1);},
 // 5 · The Lift: a deck rises up the west face. Leave it at the top for a ring and dash blue in; then a ring chain,
 // one swing into the next without landing: keep the first, turn the cliff gold out of the second.
 ()=>{decks.push({c:38,r:55,w:4,h:1,to:[0,-20],period:240,phase:0});
  put(47,31,'O');hook(47,31,{phase:0,minDashes:1});
  rect(57,34,4,1,'B');land(57,34,4,{phase:1});
  put(65,28,'O');hook(65,28,{phase:1});
  put(80,24,'O');hook(80,24,{phase:1,minDashes:1});
  rect(90,27,4,1,'A');land(90,27,4,{phase:0});
  save(100,25,7,'The Lift');},
 // 6 · The Last Strike: under the storm's thorn ceiling, crumbling stone into a hyper that lands on blue; spend the
 // dash on a seed, take it back, and dash out of the last ring onto blue before the open east wall.
 ()=>{rect(108,8,58,1,'v');
  rect(114,24,4,1,'~');land(114,24,4);
  rect(129,25,4,1,'B');land(129,25,4,{phase:1});
  put(141,19,'b');stages.push({x:141*8,y:19*8,event:'pogo-loft',eventAt:true,eventRadius:24,phase:0});
  put(149,16,'O');hook(149,16,{phase:0,minDashes:1});
  rect(159,19,4,1,'B');land(159,19,4,{phase:1});
  rect(cols-2,11,2,8,'.');stages.push({x:cols*8,y:18*8-11,exit:true});}
];
const LIMIT=+((typeof process!=='undefined'&&process.env.SECTION_LIMIT)||SECTIONS.length);
SECTIONS.slice(0,LIMIT).forEach(f=>f());
const room={id:'bank-f111',name:'Every Dash Turns the Cliff',cols,rows,exit:'right',core:16,coreProgressKey:'core-cliffs',coreProgressRevision:2,coreCheckpoints:checkpoints,crumbleExtraFrames:coreCrumbleGrace(16),movement:'survive-2',aim8:true,dashes:1,study:true,dropThru:true,palette:'cliffs',rbr:16,lock:[],decks,hint:'Hold grab near a ring to swing. Every dash turns the cliff: gold ledges stand until you dash, blue ones only after. Crumbling ledges give no grace; a seed cut with jump held gives your dash back.',map:m.map(r=>r.join(''))};
writeFileSync('scripts/room-bank/fractured/111-bank-f111.json',JSON.stringify({room,bank:{side:'fractured',batch:29,run:19,collection:'cores',coreIndex:16,format:'superroom',localOnly:true,acceptance:'candidate',needsReview:true,status:'authoring',author:'Claude',difficulty:5,worlds:[16,36],tags:['hook-ring','switchback','deck','crumble','seed','refill','wall'],newMechanics:[],role:'Thunder Cliffs Core: swing, ride and climb while every dash turns the cliff',solution:'Choose each dash for where it leaves the cliff: swing out with or without one, spend it on crumbling ledges, and win it back from seeds.',requiredEvents:['hook','phase','core-checkpoint'],requiredEventCounts:{hook:10,'pogo-loft':4,walljump:6,crumble:4,'core-checkpoint':checkpoints.length},coreDescription:'The storm turns the cliff each time you dash. Count before you let go.',draft:true,humanReview:'Unverified authoring draft; not published.'},tape:[],verification:{stages,partTapes:[]}},null,2)+'\n');
