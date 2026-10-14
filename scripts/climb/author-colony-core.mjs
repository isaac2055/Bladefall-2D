// Local authoring source. Re-running deliberately clears this draft's route proofs.
import {writeFileSync} from 'node:fs';
import {coreCrumbleGrace} from './core-difficulty.mjs';
// The Colony: watch lamps sweep; six frames in a cone and you are seen. Smoke hides you; rock and solid machinery
// block the light; a lamp cannot see straight down its own wall. Crumbling floors give no grace and no place to
// wait, so every crossing is timed. Sections are written one beat at a time and proved in order.
const cols=160,rows=124,m=Array.from({length:rows},()=>Array(cols).fill('.'));
let strict=false,base=null;
function rect(c,r,w,h,ch='#'){for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++){if(!m[y]||x<0||x>=cols)throw Error('Outside room '+[c,r]);if(strict&&base[y][x]==='.'&&m[y][x]!=='.'&&m[y][x]!==ch)throw Error('Overlap at '+[x,y]+': '+m[y][x]+' under '+ch);m[y][x]=ch;}}
const put=(c,r,ch)=>rect(c,r,1,1,ch);
const cut=(c,r,w,h)=>{for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++)m[y][x]='.';};
rect(0,0,cols,1);rect(0,1,1,rows-1);rect(cols-1,1,1,rows-1);rect(1,1,1,rows-3,'>');rect(cols-2,1,1,rows-3,'<');rect(1,rows-2,cols-2,1,'^');rect(0,rows-1,cols,1);
const stages=[],checkpoints=[],lights=[],zips=[];
const land=(c,r,w,extra={})=>stages.push({x:(c+Math.floor(w/2))*8,y:r*8-11,...extra});
const save=(c,r,w,name,facing=1)=>{rect(c,r,w,1);checkpoints.push({c:c+Math.floor(w/2),r:r-1,width:w*8,facing,name});land(c,r,w);};
const lamp=(c,r,dir,sweep,period,phase,range=104,width=16)=>{lights.push({c,r,dir,sweep,period,phase,range,width});};
const smoke=(c,r,w,h)=>rect(c,r,w,h,'S');
const SECTIONS=[
 // 1 · The Lamp Gallery: a low gallery under four sweeping lamps. Crumbling floors over thorn pits leave nowhere to
 // wait; a seed lofts you to a smoke-hung ledge; then smoke pockets and crumbling stones under the last two lamps.
 ()=>{rect(2,100,86,1);for(const c of [24,38,55,70])put(c,100,'#');
  rect(3,114,10,1);put(5,113,'P');
  rect(13,116,5,1,'^');rect(18,114,4,1,'~');land(18,114,4);rect(22,116,5,1,'^');rect(27,113,4,1,'~');land(27,113,4);
  put(36,109,'b');stages.push({x:36*8,y:109*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  rect(40,106,6,1);smoke(40,103,6,3);land(40,106,6);
  rect(47,114,13,1);smoke(52,111,3,3);land(53,114,1);
  rect(61,114,4,1,'~');land(61,114,4);rect(65,116,4,1,'^');rect(69,114,4,1,'~');land(69,114,4);
  lamp(24,101,90,40,140,0);lamp(38,101,90,50,170,40);lamp(55,101,90,45,150,90);lamp(70,101,90,50,130,20);
  save(76,114,7,'The Lamp Gallery');},
 // 2 · The Watch Shaft: three lamps on the east wall sweep the shaft. Climb the west wall through its smoke and cross
 // the lit stretches between passes, or cling under a lamp on its own wall; refills hang between.
 ()=>{rect(83,114,17,1);rect(88,74,1,36);rect(100,68,1,46);
  lamp(99,106,180,35,150,0,108);lamp(99,94,180,35,150,50,108);lamp(99,82,180,35,150,100,108);lamp(89,100,0,30,170,70,100);lamp(89,88,0,30,170,140,100);
  const steps=[[93,108],[96,102],[89,96],[96,90],[89,84],[96,78]];
  for(const [c,r]of steps){rect(c,r,3,1);smoke(c,r-3,3,3);land(c,r,3);}
  rect(88,70,1,4,'.');save(78,74,7,'The Watch Shaft',-1);},
 // 3 · The Carrier Run: west under a lamp-hung roof. Board the carrier between sweeps, ride its stroke under the
 // lamps and leap from its end; crumbling stone, a seed under the last lamp, and the save.
 ()=>{rect(2,99,86,1,'^');rect(2,60,86,1);
  rect(68,75,4,1,'Z');zips.push({r:75,c:68,z:[-36,0]});stages.push({x:70*8,y:75*8-11,air:true,ground:true,toleranceX:20,toleranceY:4});
  stages.push({x:34*8,y:75*8-11,air:true,toleranceX:60,toleranceY:30});
  rect(20,73,4,1,'~');land(20,73,4);
  put(15,69,'b');stages.push({x:15*8,y:69*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  lamp(76,61,90,40,160,0);lamp(58,61,90,50,140,30);lamp(42,61,90,50,140,100);lamp(26,61,90,45,150,60);lamp(12,61,90,40,130,10);
  save(3,65,7,'The Carrier Run',-1);},
 // 4 · The Up-Lit Chimney: through a hole in the roof into a chimney lit from its foot and swept by two wall lamps;
 // wall-jump between smoke patches on alternate walls, take the refill, and leave at the top.
 ()=>{rect(3,66,7,3);rect(11,26,1,32);rect(18,26,1,35);cut(12,60,6,1);rect(12,66,6,1);
  lamp(14,64,270,22,120,0,110);lamp(12,44,0,40,150,40,96);lamp(17,34,180,40,150,110,96);
  smoke(16,54,2,6);smoke(12,40,2,6);smoke(16,28,2,5);put(14,46,'o');
  stages.push({x:16*8,y:56*8,grip:true,toleranceY:40});
  stages.push({x:12*8,y:42*8,grip:true,toleranceY:40});
  stages.push({x:16*8,y:30*8,grip:true,toleranceY:40});
  cut(18,22,1,4);save(19,26,7,'The Up-Lit Chimney');},
 // 5 · Crossfire: east along the top between ceiling lamps and lamps that look up from the thorn floor. Crumbling
 // stone, a seed onto a smoke-capped pillar, a carrier that lifts you into the light, and a leap to smoke.
 ()=>{rect(19,5,96,1);rect(26,35,89,1,'^');rect(26,36,89,1);rect(19,27,7,9);
  rect(30,25,3,1,'~');land(30,25,3);
  put(38,20,'b');stages.push({x:38*8,y:20*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  rect(44,24,3,11);smoke(44,21,3,3);land(44,24,3);
  rect(52,26,4,1,'Z');zips.push({r:26,c:52,z:[0,-10]});stages.push({x:54*8,y:26*8-11,air:true,ground:true,toleranceX:20,toleranceY:4});
  rect(62,16,4,1);smoke(62,13,4,3);land(62,16,4);
  rect(72,18,3,1,'~');land(72,18,3);
  put(80,13,'b');stages.push({x:80*8,y:13*8,event:'pogo-loft',eventAt:true,eventRadius:24});put(86,12,'o');
  rect(90,16,3,1,'~');smoke(90,13,3,3);land(90,16,3);
  rect(97,20,4,1);smoke(97,17,4,3);land(97,20,4);
  lamp(36,6,90,45,150,0,112);lamp(58,6,90,50,140,60,112);lamp(94,6,90,45,150,90,112);
  lamp(48,34,270,25,120,30,112);lamp(86,34,270,25,110,70,112);
  save(106,24,7,'Crossfire');rect(106,25,7,10);},
 // 6 · The Falling Watch: down the east side past lamps on both walls. Crumbling stones and a smoke pocket, a
 // carrier that plunges you, a seed that breaks the fall, a refill, a smoke ledge and the last crumbling stone.
 ()=>{rect(116,30,1,80);rect(152,40,1,48);
  rect(120,34,3,1,'~');land(120,34,3);
  rect(133,44,3,1,'~');smoke(133,41,3,3);land(133,44,3);
  rect(122,54,4,1,'Z');zips.push({r:54,c:122,z:[0,18]});stages.push({x:124*8,y:54*8-11,air:true,ground:true,toleranceX:20,toleranceY:4});
  rect(132,74,3,1,'~');land(132,74,3);
  put(141,82,'b');stages.push({x:141*8,y:82*8,event:'pogo-loft',eventAt:true,eventRadius:24});put(146,84,'o');
  rect(153,92,4,1);smoke(153,89,4,3);land(153,92,4);
  rect(145,102,3,1,'~');land(145,102,3);
  lamp(151,50,180,30,140,0,120);lamp(117,64,0,30,150,60,120);lamp(151,70,180,30,130,100,120);lamp(117,94,0,30,140,30,120);
  rect(cols-2,96,2,8,'.');stages.push({x:cols*8,y:103*8-11,exit:true});}
];
const LIMIT=+((typeof process!=='undefined'&&process.env.SECTION_LIMIT)||SECTIONS.length);
base=m.map(r=>r.slice());SECTIONS.slice(0,LIMIT).forEach((f,i)=>{strict=true;f();});
// carriers take their strokes in map order (rows, then columns)
const zipList=zips.sort((a,b)=>a.r-b.r||a.c-b.c).map(q=>q.z);
const room={id:'bank-f113',name:'Between the Lamps',cols,rows,exit:'right',core:18,coreProgressKey:'core-colony',coreProgressRevision:2,coreCheckpoints:checkpoints,crumbleExtraFrames:coreCrumbleGrace(18),movement:'survive-2',aim8:true,dashes:1,study:true,dropThru:true,palette:'colony',rbr:18,lock:[],lights,zips:zipList,hint:'Six frames in a lamp’s cone and the colony sees you. Smoke hides you; rock and machinery block the light; a lamp cannot see down its own wall. Crumbling floors give no grace.',map:m.map(r=>r.join(''))};
writeFileSync('scripts/room-bank/fractured/113-bank-f113.json',JSON.stringify({room,bank:{side:'fractured',batch:29,run:19,collection:'cores',coreIndex:18,format:'superroom',localOnly:true,acceptance:'candidate',needsReview:true,status:'authoring',author:'Claude',difficulty:5,worlds:[18,38],tags:['watch-light','smoke','crumble','seed','refill','carrier','wall'],newMechanics:[],role:'Colony Core: climb through the colony unseen',solution:'Read every sweep, wait only in smoke or under a lamp’s own wall, and spend crumbling floors between passes.',requiredEvents:['core-checkpoint'],requiredEventCounts:{'pogo-loft':4,'zip-start':3,crumble:8,'core-checkpoint':checkpoints.length},coreDescription:'The colony keeps its lamps lit. Move when they look away.',draft:true,humanReview:'Unverified authoring draft; not published.'},tape:[],verification:{stages,partTapes:[]}},null,2)+'\n');
