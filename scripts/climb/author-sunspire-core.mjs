// Local authoring source. Re-running deliberately clears this draft's route proofs.
import {writeFileSync} from 'node:fs';
import {coreCrumbleGrace} from './core-difficulty.mjs';
// Sunspire Palace: walls of falling sunlight that no one crosses; only your own two doors (portals on pale stone %)
// carry you through, keeping your speed and turning it. Fall into a floor door to rise out of another; dash into a
// wall door to rise out of a floor; loop between floor and ceiling to gather speed. Crumbling stone gives no grace.
const cols=168,rows=128,m=Array.from({length:rows},()=>Array(cols).fill('.'));
let strict=false,base=null;
function rect(c,r,w,h,ch='#'){for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++){if(!m[y]||x<0||x>=cols)throw Error('Outside room '+[c,r]);if(strict&&base[y][x]==='.'&&m[y][x]!=='.'&&m[y][x]!==ch&&m[y][x]!=='#')throw Error('Overlap at '+[x,y]+': '+m[y][x]+' under '+ch);m[y][x]=ch;}}
const put=(c,r,ch)=>rect(c,r,1,1,ch);
const cut=(c,r,w,h)=>{for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++)m[y][x]='.';};
rect(0,0,cols,1);rect(0,1,1,rows-1);rect(cols-1,1,1,rows-1);rect(1,1,1,rows-3,'>');rect(cols-2,1,1,rows-3,'<');rect(1,rows-2,cols-2,1,'^');rect(0,rows-1,cols,1);
const stages=[],checkpoints=[],beams=[],zips=[];
const land=(c,r,w,extra={})=>stages.push({x:(c+Math.floor(w/2))*8,y:r*8-11,...extra});
const save=(c,r,w,name,facing=1)=>{rect(c,r,w,1);checkpoints.push({c:c+Math.floor(w/2),r:r-1,width:w*8,facing,name});land(c,r,w);};
const opened=(c,r)=>stages.push({event:'portal-open',x:c*8,y:r*8,eventAt:true,eventRadius:24});
const passed=(c,r)=>stages.push({event:'portal-pass',x:c*8,y:r*8,eventAt:true,eventRadius:30});
// a wall of light: a window at the roof throws sun straight down to the rock at `foot`
const light=(c,top,foot)=>{beams.push({c,r:top,dir:'d'});rect(c,foot,1,1);};
const crown=(c,r,h,w=2)=>{rect(c,r,w,h);rect(c,r-1,w,1,'^');rect(c,r+h,w,1,'v');};
const SECTIONS=[
 // 1 · The First Door: crumbling stone into the first chamber; open a door on the pale floor, climb crumbling stone
 // and a seed to the perch. Brake off the perch to aim across the light, then carry the fall into the door.
 // Steer the launch out from under the low thorn ceiling, and dash diagonally over the capped exit wall.
 ()=>{rect(3,118,5,1,'~');put(5,117,'P');rect(10,120,20,8);rect(10,120,2,1,'~');rect(23,120,4,1,'%');
  opened(25,120);
  rect(12,115,3,1,'~');land(12,115,3);put(11,110,'b');stages.push({x:11*8,y:110*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  rect(16,106,6,1);land(16,106,6);
  light(31,2,121);rect(30,122,2,5);
  rect(32,122,2,1,'^');rect(36,122,2,1,'^');rect(34,122,2,1,'%');rect(40,117,7,11);rect(32,123,6,4);
  rect(32,113,4,1,'v');put(38,112,'^');rect(38,113,1,15);
  opened(35,122);stages.push({event:'portal-pass',x:35*8,y:122*8,eventAt:true,eventRadius:30,maxVy:-300});
  save(40,116,7,'The First Door');},
 // 2 · The Thrown Door: from a perch, shoot a door level across the light onto the far wall of the next chamber; open
 // your own on a low pier's face. The low crumble approach is intended to carry a wavedash through the door,
 // retaining a dash to correct over the capped barrier on the westbound flight. The longer return requires the saved dash.
 // Then crumbling steps and a seed up over the capped east wall.
 ()=>{rect(52,110,4,6);rect(52,113,1,2,'%');rect(44,107,5,1);land(44,107,5);
  light(56,2,117);rect(56,118,1,9);
  rect(57,120,23,1,'^');rect(57,121,23,6);rect(80,92,1,28);rect(80,91,1,1,'^');rect(80,105,1,2,'%');
  rect(49,115,2,1,'~');rect(47,111,5,1);
  opened(80,106);stages.push({event:'portal-open',x:52*8,y:114*8,eventAt:true,eventRadius:24,portals:[[80,106],[52,113]]});stages.push({event:'portal-pass',x:80*8,y:106*8,eventAt:true,eventRadius:80,portals:[[80,106],[52,113]],maxVx:-250,minDashes:1});
  rect(64,108,1,12);put(64,107,'^');rect(61,107,3,1,'~');land(61,107,3);
  rect(64,103,3,1,'~');land(64,103,3);rect(70,98,3,1,'~');land(70,98,3);
  put(77,89,'b');stages.push({x:77*8,y:89*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  save(83,94,7,'The Thrown Door');rect(83,95,7,32);},
 // 3 · The Loop: a door in the floor under a door in the roof slab: fall through and through, gathering speed, then
 // re-aim one door, mid-loop, onto the pale floor beyond the light; the next pass throws you up to the high ledge.
 ()=>{rect(90,116,32,11);rect(98,116,4,1,'%');rect(92,82,18,2);rect(98,83,4,1,'%');rect(91,104,3,1,'~');land(91,104,3);
  land(95,116,3);opened(100,84);stages.push({event:'portal-open',x:100*8,y:116*8,eventAt:true,eventRadius:24,portals:[[100,83],[100,116]]});
  stages.push({event:'portal-pass',x:100*8,y:116*8,eventAt:true,eventRadius:40,portals:[[100,83],[100,116]]});
  rect(121,84,3,1);light(122,85,117);rect(122,118,1,9);
  rect(123,112,34,15);rect(126,112,4,1,'%');
  stages.push({event:'portal-open',x:128*8,y:112*8,eventAt:true,eventRadius:24,portals:[[128,112],[100,116]]});
  save(133,102,7,'The Loop');rect(133,103,7,9);rect(132,104,1,8,'<');},
 // 4 · The Rising Carrier: a carrier lifts you up the east wall a hand's width from the light; leap to crumbling stone,
 // leave before its ceiling, catch the capped wall, then travel west beneath the save.
 // Catch the refill, cut the seed near the light, and return east above the save platform.
 ()=>{light(132,2,95);
  rect(141,102,4,1,'Z');zips.push({r:102,c:141,z:[0,-20]});stages.push({x:143*8,y:102*8-11,air:true,ground:true,toleranceX:20,toleranceY:4});
  rect(141,81,4,1,'v');rect(148,80,3,1,'~');land(148,80,3);
  crown(153,58,19);stages.push({x:152*8-2,y:66*8,grip:true,toleranceY:48});
  put(141,69,'o');stages.push({x:141*8,y:69*8,refill:true});
  put(138,64,'b');stages.push({x:138*8,y:64*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  save(142,56,7,'The Rising Carrier');rect(142,57,7,3);},
 // 5 · The Long Fall: open a door on the pale floor east of the light, climb crumbling stones and seeds over the void
 // to a high perch, shoot the right face of a far wall across the light, then fall into yours.
 // The launch goes east toward the light: reverse immediately, rise over the capped wall, and land west of it.
 ()=>{rect(140,60,4,1,'%');rect(140,61,4,2);
  stages.push({event:'portal-open',x:142*8,y:60*8,eventAt:true,eventRadius:24});
  rect(151,48,3,1,'~');land(151,48,3);put(147,42,'b');stages.push({x:147*8,y:42*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  rect(151,35,3,1,'~');land(151,35,3);put(139,29,'b');stages.push({x:139*8,y:29*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  rect(136,24,3,1);land(136,24,3);
  rect(117,39,1,13);put(117,38,'^');rect(117,40,1,2,'%');
  stages.push({event:'portal-open',x:118*8,y:41*8,eventAt:true,eventRadius:24,portals:[[141,60],[117,40]]});
  stages.push({event:'portal-pass',x:118*8,y:41*8,eventAt:true,eventRadius:40,portals:[[141,60],[117,40]],minVx:300});
  save(106,40,9,'The Long Fall',-1);rect(106,41,9,3);},
 // 6 · The Last Light: the way out lies beyond the light again, and this time the far door is in a roof. Crumbling
 // stone and a seed to the pale platform; open a door in it, throw the other up across the light onto the slab's
 // underside, climb to the perch and fall into yours: catch a seed during the fast roof drop,
 // then chain east to the last seed beneath a low ceiling and above thorns. There is no landing by the gate.
 ()=>{rect(112,31,3,1,'~');land(112,31,3);put(122,31,'b');stages.push({x:122*8,y:31*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  rect(120,26,4,1,'=');rect(124,26,4,1,'%');rect(128,26,2,1,'=');land(127,26,2);
  rect(136,9,21,2);rect(140,10,4,1,'%');
  stages.push({event:'portal-open',x:142*8,y:11*8,eventAt:true,eventRadius:24});
  stages.push({event:'portal-open',x:126*8,y:26*8,eventAt:true,eventRadius:24,portals:[[141,10],[125,26]]});
  put(121,19,'b');stages.push({x:121*8,y:19*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  rect(124,13,5,1);land(124,13,5);
  stages.push({event:'portal-pass',x:142*8,y:11*8,eventAt:true,eventRadius:40,portals:[[141,10],[125,26]],minVy:250});
  rect(140,23,27,1,'^');rect(149,11,18,1,'v');
  put(142,20,'b');stages.push({x:142*8,y:20*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  put(155,18,'b');stages.push({x:155*8,y:18*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  rect(cols-2,12,2,6,'.');stages.push({x:cols*8,y:18*8-11,exit:true});}
];
const LIMIT=+((typeof process!=='undefined'&&process.env.SECTION_LIMIT)||SECTIONS.length);
base=m.map(r=>r.slice());SECTIONS.slice(0,LIMIT).forEach(f=>{strict=true;f();});
const zipList=zips.sort((a,b)=>a.r-b.r||a.c-b.c).map(q=>q.z);
const room={id:'bank-f115',name:'The Last Light',cols,rows,exit:'right',core:20,coreProgressKey:'core-sunspire',coreProgressRevision:3,coreCheckpoints:checkpoints,crumbleExtraFrames:coreCrumbleGrace(20),movement:'survive-2',aim8:true,dashes:1,study:true,dropThru:true,palette:'sunspire',rbr:20,lock:[],portalMode:'two',beams,zips:zipList,hint:'Your doors keep and turn your speed. Wave through the wall door with a dash in reserve. Leave the carrier before its ceiling. Turn the horizontal launch away from the light, then catch both seeds beyond the last roof door.',map:m.map(r=>r.join(''))};
writeFileSync('scripts/room-bank/fractured/115-bank-f115.json',JSON.stringify({room,bank:{side:'fractured',batch:29,run:19,collection:'cores',coreIndex:20,format:'superroom',localOnly:true,acceptance:'candidate',needsReview:true,status:'authoring',author:'Claude; revised by Sol 6.1',difficulty:5,worlds:[20,40],tags:['portal','beam','wavedash','fling','crumble','seed','carrier'],newMechanics:[],role:'Sunspire Core: pass every wall of light through your own doors',solution:'Brake into a high fall for the first door; wave through the wall door with a dash retained; re-aim the loop in flight; leave the carrier before its ceiling, cut the westward seed return; reverse the horizontal fall launch before the light; catch both seeds after the final roof drop.',requiredEvents:['portal-pass','core-checkpoint'],requiredEventCounts:{'portal-pass':6,'pogo-loft':9,hyper:1,refill:1,'zip-start':1,crumble:6,'core-checkpoint':checkpoints.length},coreDescription:'The light cannot be crossed. The door can.',draft:false,humanReview:'Published by Isaac (2026-10-15): solid drafts.'},tape:[],verification:{stages,partTapes:[]}},null,2)+'\n');
