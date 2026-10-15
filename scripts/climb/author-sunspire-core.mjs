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
 // and a seed to the perch, shoot the far pit across the light, and fall in to rise beyond it.
 ()=>{rect(3,118,5,1,'~');put(5,117,'P');rect(10,120,20,8);rect(10,120,2,1,'~');rect(23,120,4,1,'%');
  opened(25,120);
  rect(12,115,3,1,'~');land(12,115,3);put(11,110,'b');stages.push({x:11*8,y:110*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  rect(16,106,6,1);land(16,106,6);
  light(31,2,121);rect(30,122,2,5);
  rect(32,122,6,1,'%');rect(38,116,14,12);rect(32,123,6,4);
  opened(35,122);passed(35,122);
  save(40,116,7,'The First Door');},
 // 2 · The Thrown Door: from a perch, shoot a door level across the light onto the far wall of the next chamber; open
 // your own on a low pier's face and dash into it. You come out of the far wall flying back west over thorns: land
 // before the light. Then crumbling steps and a seed up over the capped east wall.
 ()=>{rect(52,110,4,6);rect(52,112,1,4,'%');rect(44,107,5,1);land(44,107,5);
  light(56,2,117);rect(56,118,1,9);
  rect(57,120,23,1,'^');rect(57,121,23,6);rect(80,92,1,28);rect(80,91,1,1,'^');rect(80,104,1,6,'%');
  opened(80,106);stages.push({event:'portal-open',x:52*8,y:114*8,eventAt:true,eventRadius:24,portals:[[80,106],[52,113]]});stages.push({event:'portal-pass',x:80*8,y:106*8,eventAt:true,eventRadius:80,portals:[[80,106],[52,113]],maxVx:-120});
  rect(72,112,5,1);land(72,112,5);
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
  save(133,102,7,'The Loop');rect(133,103,7,9);},
 // 4 · The Rising Carrier: a carrier lifts you up the east wall a hand's width from the light; leap to crumbling stone,
 // catch a thorn-capped wall, kick back through a refill and dash over to the save beside the light.
 ()=>{light(132,2,95);
  rect(141,102,4,1,'Z');zips.push({r:102,c:141,z:[0,-20]});stages.push({x:143*8,y:102*8-11,air:true,ground:true,toleranceX:20,toleranceY:4});
  rect(148,80,3,1,'~');land(148,80,3);
  crown(153,58,19);stages.push({x:152*8-2,y:66*8,grip:true,toleranceY:48});
  put(149,60,'o');
  save(142,56,7,'The Rising Carrier');rect(142,57,7,3);},
 // 5 · The Long Fall: open a door on the pale floor east of the light, climb crumbling stones and seeds over the void
 // to a high perch, shoot a door down across the light, and fall the whole height into yours to rise beyond it.
 ()=>{rect(133,60,9,1);rect(140,60,4,1,'%');rect(133,61,9,2);
  stages.push({event:'portal-open',x:142*8,y:60*8,eventAt:true,eventRadius:24});
  rect(151,48,3,1,'~');land(151,48,3);put(147,42,'b');stages.push({x:147*8,y:42*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  rect(151,35,3,1,'~');land(151,35,3);put(147,29,'b');stages.push({x:147*8,y:29*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  rect(143,24,4,1);land(143,24,4);
  rect(116,48,8,4);rect(118,48,4,1,'%');
  stages.push({event:'portal-open',x:120*8,y:48*8,eventAt:true,eventRadius:24,portals:[[141,60],[119,48]]});
  stages.push({event:'portal-pass',x:120*8,y:48*8,eventAt:true,eventRadius:40,portals:[[141,60],[119,48]],maxVy:-300});
  save(106,40,7,'The Long Fall',-1);rect(106,41,7,3);},
 // 6 · The Last Light: the way out lies beyond the light again, and this time the far door is in a roof. Crumbling
 // stone and a seed to the pale platform; open a door in it, throw the other up across the light onto the slab's
 // underside, climb to the perch and fall into yours: you drop out of the roof onto crumbling stone by the gate.
 ()=>{rect(112,31,3,1,'~');land(112,31,3);put(122,31,'b');stages.push({x:122*8,y:31*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  rect(120,26,4,1,'=');rect(124,26,4,1,'%');rect(128,26,2,1,'=');land(127,26,2);
  rect(136,9,21,2);rect(140,10,4,1,'%');
  stages.push({event:'portal-open',x:142*8,y:11*8,eventAt:true,eventRadius:24});
  stages.push({event:'portal-open',x:126*8,y:26*8,eventAt:true,eventRadius:24,portals:[[141,10],[125,26]]});
  put(121,19,'b');stages.push({x:121*8,y:19*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  rect(124,13,5,1);land(124,13,5);
  stages.push({event:'portal-pass',x:142*8,y:11*8,eventAt:true,eventRadius:40,portals:[[141,10],[125,26]],minVy:250});
  rect(136,18,6,1,'~');rect(142,18,15,1);land(136,18,6);
  rect(cols-2,12,2,6,'.');stages.push({x:cols*8,y:18*8-11,exit:true});}
];
const LIMIT=+((typeof process!=='undefined'&&process.env.SECTION_LIMIT)||SECTIONS.length);
base=m.map(r=>r.slice());SECTIONS.slice(0,LIMIT).forEach(f=>{strict=true;f();});
const zipList=zips.sort((a,b)=>a.r-b.r||a.c-b.c).map(q=>q.z);
const room={id:'bank-f115',name:'The Last Light',cols,rows,exit:'right',core:20,coreProgressKey:'core-sunspire',coreProgressRevision:2,coreCheckpoints:checkpoints,crumbleExtraFrames:coreCrumbleGrace(20),movement:'survive-2',aim8:true,dashes:1,study:true,dropThru:true,palette:'sunspire',rbr:20,lock:[],portalMode:'two',beams,zips:zipList,hint:'No one crosses the light; your doors do. A door keeps your speed and turns it: fall into one to rise out of another, dash into a wall to rise from a floor. Crumbling stone gives no grace.',map:m.map(r=>r.join(''))};
writeFileSync('scripts/room-bank/fractured/115-bank-f115.json',JSON.stringify({room,bank:{side:'fractured',batch:29,run:19,collection:'cores',coreIndex:20,format:'superroom',localOnly:true,acceptance:'candidate',needsReview:true,status:'authoring',author:'Claude',difficulty:5,worlds:[20,40],tags:['portal','beam','fling','crumble','seed','carrier'],newMechanics:[],role:'Sunspire Core: pass every wall of light through your own doors',solution:'Place each pair of doors where your speed will be turned the way you need: falls into rises, dashes into rises, loops into launches.',requiredEvents:['portal-pass','core-checkpoint'],requiredEventCounts:{'portal-pass':6,'pogo-loft':5,'zip-start':1,crumble:6,'core-checkpoint':checkpoints.length},coreDescription:'The light cannot be crossed. The door can.',draft:true,humanReview:'Unverified authoring draft; not published.'},tape:[],verification:{stages,partTapes:[]}},null,2)+'\n');
