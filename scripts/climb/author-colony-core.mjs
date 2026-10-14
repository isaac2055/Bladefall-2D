// Local authoring source. Re-running deliberately clears this draft's route proofs.
import {writeFileSync} from 'node:fs';
import {coreCrumbleGrace} from './core-difficulty.mjs';
// The Colony: stacked lamp-lit galleries. Ceiling lamps sweep the floor; six frames in a cone and you are seen.
// Smoke hides you; rock and gates block the light. Each gallery ends in a stair shaft up to the next.
// segment: [kind, length]  kind: f floor, s floor under a smoke pocket, g thorn gap; lamps: [offset, sweep, period, phase]
const plan=[
 {seg:[['f',7],['s',4],['f',8],['g',3],['f',6],['s',4],['f',9],['g',4],['f',8]],lamps:[[13,40,170,0],[31,45,190,60],[46,40,160,110]]},
 {seg:[['f',7],['g',4],['s',3],['f',10],['g',4],['f',5],['s',4],['f',8],['g',5],['f',6]],lamps:[[10,45,150,30],[27,50,180,0],[42,45,140,90]]},
 {seg:[['f',7],['s',3],['g',5],['f',7],['s',3],['g',5],['f',9],['g',4],['f',8]],lamps:[[12,50,140,0],[25,50,140,70],[40,45,160,20]]},
 {seg:[['f',7],['g',3],['f',4],['g',3],['s',4],['f',11],['g',5],['s',3],['f',9]],lamps:[[9,40,120,40],[24,55,170,0],[38,50,150,100]]},
 {seg:[['f',7],['s',3],['f',12],['g',5],['f',4],['g',4],['s',4],['f',10]],lamps:[[11,45,130,0],[22,55,150,50],[36,50,130,90],[44,40,170,10]]},
 {seg:[['f',7],['g',4],['s',3],['f',9],['g',5],['s',3],['f',8],['g',4],['f',6]],lamps:[[10,50,120,20],[25,55,140,80],[39,50,120,0]]}
];
const H=9,MARGIN=3,HOLE=3;
const len=plan.map(p=>p.seg.reduce((n,[,l])=>n+l,0));const L=Math.max(...len)+8;
const cols=L+MARGIN*2+2,rows=plan.length*(H+1)+6,WL=MARGIN+1,WR=cols-MARGIN-2;
const m=Array.from({length:rows},()=>Array(cols).fill('.'));
const rect=(c,r,w,h,ch='#')=>{for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++){if(!m[y]||x<0||x>=cols)throw Error('Outside room '+[c,r]);m[y][x]=ch;}};
const put=(c,r,ch)=>rect(c,r,1,1,ch);
rect(0,0,cols,rows,'#');
const lights=[],stages=[],saves=[];
for(const [i,p]of plan.entries()){
 const dir=i%2?-1:1,floor=rows-3-i*(H+1),ceil=floor-H;           // floor row is stone; the gallery is the H-1 rows above
 const x0=dir>0?WL:WR,far=dir>0?WR:WL,at=k=>x0+dir*k;
 rect(WL,ceil+1,WR-WL+1,H-1,'.');                                  // carve the gallery wall to wall
 let k=i?5:0;                                                     // galleries above begin past the stair hole
 for(const [kind,l]of p.seg){
  for(let j=0;j<l;j++){const c=at(k+j);
   if(kind==='g'){put(c,floor,'.');put(c,floor+1,'^');}
   if(kind==='s')for(let r=floor-3;r<floor;r++)put(c,r,'S');}
  k+=l;}
 if(i<plan.length-1){
  // the stair: a hole through the ceiling against the far wall, two steps up to it
  const hole=dir>0?far-HOLE+1:far;rect(hole,ceil-1,HOLE,2,'.');
  rect(far-dir*4-(dir>0?1:0),floor-4,2,1);rect(far-(dir>0?1:0),floor-7,2,1);
 }else rect(dir>0?WR+1:0,floor-4,MARGIN+1,4,'.');
 for(const [off,sweep,period,phase]of p.lamps){const c=at(off+(i?5:0));put(c,ceil,'#');lights.push({c,r:ceil+1,dir:90,sweep,period,phase,range:96,width:16});}
 if(i)saves.push({c:at(4),r:floor-1,width:40,facing:dir,name:['','The Smoke Rooms','The Long Watch','The Brood Hall','The Lamp Loft','The Last Gallery'][i]});
 const stageList=[];k=i?5:0;for(const [kind,l]of p.seg){k+=l;if(kind==='f')stageList.push({x:at(k-2)*8,y:floor*8-11});}
 if(i)stages.push({x:at(4)*8,y:floor*8-11});
 stages.push(...stageList);
 if(i<plan.length-1){const far=dir>0?WR:WL;stages.push({x:(far-dir*8)*8,y:floor*8-11},{x:(far-dir*4)*8,y:(floor-4)*8-11},{x:far*8-(dir>0?8:0),y:(floor-7)*8-11});}
 if(i===plan.length-1)stages.push({x:(dir>0?cols:-1)*8,y:floor*8-11,exit:true});
}
put(WL+2,rows-4,'P');
const checkpoints=saves;   // a save at the start of galleries 2–6
const room={id:'bank-f113',name:'Between the Lamps',cols,rows,exit:plan.length%2?'right':'left',core:18,coreProgressKey:'core-colony',coreProgressRevision:1,coreCheckpoints:checkpoints,crumbleExtraFrames:coreCrumbleGrace(18),movement:'survive-2',aim8:true,dashes:1,study:true,dropThru:true,palette:'colony',rbr:18,lock:[],lights,hint:'Six frames in a lamp’s cone and the colony sees you. Smoke hides you; a dash crosses a cone before it can. Watch the sweep, then go.',map:m.map(r=>r.join(''))};
writeFileSync('scripts/room-bank/fractured/113-bank-f113.json',JSON.stringify({room,bank:{side:'fractured',batch:29,run:19,collection:'cores',coreIndex:18,format:'superroom',localOnly:true,acceptance:'candidate',needsReview:true,status:'authoring',author:'Claude',difficulty:5,worlds:[18,38],tags:['watch-light','smoke','thorns'],newMechanics:[],role:'Colony Core: cross six lamp-lit galleries unseen',solution:'Read each lamp’s sweep, wait in smoke, and cross the open floor and thorn gaps between passes; dash through a cone when a pass cannot be waited out.',requiredEvents:['core-checkpoint'],requiredEventCounts:{'core-checkpoint':5},coreDescription:'The colony keeps its lamps lit. Move when they look away.',draft:true,humanReview:'Unverified authoring draft; not published.'},tape:[],verification:{stages,partTapes:[]}},null,2)+'\n');
