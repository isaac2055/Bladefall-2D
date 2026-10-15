// Local authoring source. Re-running deliberately clears this draft's route proofs.
import {writeFileSync} from 'node:fs';
import {coreCrumbleGrace} from './core-difficulty.mjs';
// The Path to the Palace: sun-windows throw burning beams; louvres (X) shut them on a beat; mirrors turn them and a
// strike swaps a mirror's slant. Crumbling stone gives no grace, so a crossing is timed from the stone before it.
// Sections are written one beat at a time and proved in order.
const cols=160,rows=128,m=Array.from({length:rows},()=>Array(cols).fill('.'));
let strict=false,base=null;
function rect(c,r,w,h,ch='#'){for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++){if(!m[y]||x<0||x>=cols)throw Error('Outside room '+[c,r]);if(strict&&base[y][x]==='.'&&m[y][x]!=='.'&&m[y][x]!==ch)throw Error('Overlap at '+[x,y]+': '+m[y][x]+' under '+ch);m[y][x]=ch;}}
const put=(c,r,ch)=>rect(c,r,1,1,ch);
const cut=(c,r,w,h)=>{for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++)m[y][x]='.';};
const crown=(c,r,h,w=2)=>{rect(c,r,w,h);rect(c,r-1,w,1,'^');rect(c,r+h,w,1,'v');};
rect(0,0,cols,1);rect(0,1,1,rows-1);rect(cols-1,1,1,rows-1);rect(1,1,1,rows-3,'>');rect(cols-2,1,1,rows-3,'<');rect(1,rows-2,cols-2,1,'^');rect(0,rows-1,cols,1);
const stages=[],checkpoints=[],beams=[],shutters=[],zips=[];
const land=(c,r,w,extra={})=>stages.push({x:(c+Math.floor(w/2))*8,y:r*8-11,...extra});
const save=(c,r,w,name,facing=1)=>{rect(c,r,w,1);checkpoints.push({c:c+Math.floor(w/2),r:r-1,width:w*8,facing,name});land(c,r,w);};
// a window with a louvre just beyond it: shutters are numbered in map order, so record (row, col) and sort at the end
const louvre=(c,r,dir,beat,len=1)=>{beams.push({c,r,dir});const [dx,dy]={r:[1,0],l:[-1,0],u:[0,-1],d:[0,1]}[dir];const xc=c+dx,xr=r+dy;rect(xc,xr,dx?1:len,dy?1:len,'X');shutters.push({r:xr,c:xc,beat});};
const SECTIONS=[
 // 1 · Morning Louvres: windows in a low roof burn straight down through louvres onto a path of crumbling stones
 // and thorn gaps. You cannot wait on crumbling stone, so each crossing is timed from the stone before it.
 ()=>{rect(2,97,62,1);rect(3,112,6,1);put(5,111,'P');
  louvre(16,97,'d',[40,36,0]);louvre(26,97,'d',[36,40,30]);louvre(36,97,'d',[40,32,60]);louvre(47,97,'d',[34,38,15]);
  rect(12,112,2,1,'~');land(12,112,2);rect(15,108,10,1,'v');rect(15,115,15,1,'^');
  put(31,107,'b');stages.push({x:31*8,y:107*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  rect(40,110,3,1,'~');land(40,110,3);rect(51,109,5,1);land(51,109,5);
  save(60,106,7,'Morning Louvres');rect(60,107,7,3);},
 // 2 · The Mirror Stair: north up a stair of ledges. At each level a beam falls along the wall and a mirror throws
 // it across your way: leave the crumbling approach, strike in the air, and reverse toward the next ledge. Crumbling stones
 // and a louvred crossing between.
 ()=>{rect(70,108,4,1);land(70,108,4);
  // first mirror: the beam falls down column 79 and is thrown west across row 101 until struck
  beams.push({c:79,r:72,dir:'d'});put(79,101,'/');rect(80,72,1,40);
  rect(72,105,3,1,'~');land(72,105,3);stages.push({x:79*8+4,y:101*8+4,event:'mirror',eventAt:true,eventRadius:12});
  rect(68,98,3,1,'~');land(68,98,3);
  // second mirror on the west wall: beam down column 62, thrown east across row 92
  beams.push({c:62,r:72,dir:'d'});put(62,92,'\\');rect(61,72,1,30);
  rect(65,97,3,1,'~');land(65,97,3);stages.push({x:62*8+4,y:92*8+4,event:'mirror',eventAt:true,eventRadius:12});
  rect(70,89,3,1,'~');land(70,89,3);
  rect(75,84,4,1);land(75,84,4);
  save(64,80,7,'The Mirror Stair',-1);},
 // 3 · The Wall of Noon: up a narrow chimney between the west wall and a thorn-capped pier. Louvred beams cross it
 // at three heights from alternating sides; wall-jump through each while it is shut, take the refill, and leave
 // over the west wall.
 ()=>{rect(61,46,1,26);crown(69,47,25);
  louvre(61,67,'r',[36,38,0]);louvre(69,58,'l',[34,40,40]);louvre(61,50,'r',[32,36,70]);put(65,62,'o');
  stages.push({x:62*8,y:70*8,grip:true,toleranceY:40});
  stages.push({x:68*8-8,y:62*8,grip:true,toleranceY:40});
  stages.push({x:62*8,y:54*8,grip:true,toleranceY:40});
  stages.push({x:62*8,y:48*8,grip:true,toleranceY:40});
  save(53,45,7,'The Wall of Noon',-1);},
 // 4 · The Carrier Hour: west on a carrier under a roof of louvred windows. Board it so its stroke passes each beam
 // while it is shut; leap from its end onto crumbling stone, cut a seed, and reach the save.
 ()=>{rect(2,30,51,1);rect(2,53,51,1,'^');rect(2,54,51,1);
  rect(44,47,4,1,'Z');zips.push({r:47,c:44,z:[-28,0]});stages.push({x:46*8,y:47*8-11,air:true,ground:true,toleranceX:20,toleranceY:4});
  louvre(38,30,'d',[40,30,0]);louvre(29,30,'d',[30,40,35]);louvre(21,30,'d',[36,34,10]);
  stages.push({x:18*8,y:47*8-11,air:true,toleranceX:60,toleranceY:30});
  rect(8,45,3,1,'~');land(8,45,3);
  put(12,39,'b');stages.push({x:12*8,y:39*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  save(3,36,7,'The Carrier Hour',-1);rect(3,37,4,16);},
 // 5 · The Sundial: up a capped wall, then east through six louvred beams set close over a thorn floor, with no
 // floor between them, only seeds: each cut is timed to the louvre ahead. A refill halfway.
 ()=>{cut(8,30,3,1);crown(12,19,10);rect(2,3,70,1);rect(14,29,52,1,'^');
  put(9,21,'o');stages.push({x:11*8,y:24*8,grip:true,toleranceY:48});
  for(const [i,c]of [18,25,32,39,46].entries())louvre(c,3,'d',[[34,40,0],[30,40,25],[36,32,50],[30,36,10],[34,34,60]][i]);
  for(const [c,r]of [[21,18],[28,16],[35,18],[42,15],[49,17]]){put(c,r,'b');stages.push({x:c*8,y:r*8,event:'pogo-loft',eventAt:true,eventRadius:24});}
  put(38,11,'o');
  save(55,19,7,'The Sundial');rect(55,20,7,9);},
 // 6 · The Last Window: east across the open court. Crumbling stones under a louvred beam, a carrier under two more
 // louvres and a leap from its end onto crumbling stone, a seed, and a last louvred beam across the way out.
 ()=>{rect(72,3,60,1);
  rect(66,21,3,1,'~');land(66,21,3);louvre(73,3,'d',[34,36,0]);rect(72,26,3,1);rect(78,20,3,1,'~');land(78,20,3);
  rect(85,22,4,1,'Z');zips.push({r:22,c:85,z:[22,0]});stages.push({x:87*8,y:22*8-11,air:true,ground:true,toleranceX:20,toleranceY:4});
  louvre(94,3,'d',[30,40,20]);louvre(101,3,'d',[34,36,50]);
  stages.push({x:110*8,y:22*8-11,air:true,toleranceX:50,toleranceY:30});
  rect(113,27,3,1,'~');land(113,27,3);
  put(120,21,'b');stages.push({x:120*8,y:21*8,event:'pogo-loft',eventAt:true,eventRadius:24});
  rect(126,25,4,1);land(126,25,4);
  louvre(cols-2,40,'l',[30,36,10]);rect(136,44,3,1,'~');land(136,44,3);rect(146,47,4,1,'~');land(146,47,4);
  rect(cols-2,42,2,8,'.');stages.push({x:cols*8,y:49*8-11,exit:true});}
];
const LIMIT=+((typeof process!=='undefined'&&process.env.SECTION_LIMIT)||SECTIONS.length);
base=m.map(r=>r.slice());SECTIONS.slice(0,LIMIT).forEach(f=>{strict=true;f();});
const shutterList=shutters.sort((a,b)=>a.r-b.r||a.c-b.c).map(q=>({open:q.beat[0],shut:q.beat[1],offset:q.beat[2]}));
const zipList=zips.sort((a,b)=>a.r-b.r||a.c-b.c).map(q=>q.z);
const room={id:'bank-f114',name:'The Hours of the Sun',cols,rows,exit:'right',core:19,coreProgressKey:'core-path',coreProgressRevision:3,coreCheckpoints:checkpoints,crumbleExtraFrames:coreCrumbleGrace(19),movement:'survive-2',aim8:true,dashes:1,study:true,dropThru:true,palette:'palace',rbr:19,lock:[],beams,shutters:shutterList,zips:zipList,hint:'The sun burns. Cross a beam while its louvre is shut; strike a mirror to turn its light. Crumbling stone gives no grace.',map:m.map(r=>r.join(''))};
writeFileSync('scripts/room-bank/fractured/114-bank-f114.json',JSON.stringify({room,bank:{side:'fractured',batch:29,run:19,collection:'cores',coreIndex:19,format:'superroom',localOnly:true,acceptance:'candidate',needsReview:true,status:'authoring',author:'Claude; revised by Sol 6.1',difficulty:5,worlds:[19,39],tags:['wavedash','beam','shutter','mirror','crumble','seed','carrier','wall'],newMechanics:[],role:'Path Core: cross the palace road between the sun’s hours',solution:'Land an airborne wavedash on the narrow crumble, cross both louvres with the dash restored, then loft from the seed. Leave each crumbling mirror approach, strike in the air and reverse into the next jump. Preserve the later timed wall, carrier and seed chain.',requiredEvents:['mirror','core-checkpoint'],requiredEventCounts:{mirror:2,'pogo-loft':5,'zip-start':2,crumble:8,walljump:4,'core-checkpoint':checkpoints.length},coreDescription:'The sun keeps its hours. Climb between them.',draft:false,humanReview:'Published by Isaac (2026-10-15): solid drafts.'},tape:[],verification:{stages,partTapes:[]}},null,2)+'\n');
