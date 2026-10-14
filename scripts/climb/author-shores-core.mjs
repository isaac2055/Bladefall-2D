// Local authoring source. Re-running deliberately clears this draft's route proofs.
import {writeFileSync} from 'node:fs';
import {coreCrumbleGrace} from './core-difficulty.mjs';
// The Landing Shores: a rising shore of rock with basins cut into it, each on its own tide (tides:[…]).
// ride: drop to the float at low water, ride it up, leave before the ceiling thorns. swim: cross a thorn field
// only while the sea drowns it. pair: two floats on opposite tides; change floats as they pass.
const plan=[
 [['ride',14,10],['ride',16,11],'save'],
 [['swim',18,8],['ride',16,12],'save'],
 [['pair',22,11],'save'],
 [['ride',16,12],['swim',20,9],'save'],
 [['pair',24,12],['ride',16,11],'save'],
 [['swim',18,9],['ride',18,12],'exit']
];
const LEDGE=6,TOP=10,LIP=3;
let c=LEDGE+2,y=0;const parts=[],tides=[],floats=[],saves=[],stages=[];
const span=[];let minY=0,maxY=0;
for(const sec of plan)for(const step of sec){
 if(step==='save'||step==='exit'){parts.push({type:step,c,y});saves.push([c,y]);c+=LEDGE;continue;}
 const [kind,w,d]=step;const c0=c+1,c1=c+w;            // basin interior
 const rise=kind==='swim'?1:kind==='pair'?5:4;        // next ledge rises this many rows
 parts.push({type:kind,c0,c1,y,d,rise});c=c1+1+LIP;y-=rise;minY=Math.min(minY,y-TOP);maxY=Math.max(maxY,parts.at(-1).y+d+2);
}
const dy=TOP-minY+2,cols=c+LEDGE+4,rows=maxY+dy+4;
const m=Array.from({length:rows},()=>Array(cols).fill('.'));
const rect=(c,r,w,h,ch='#')=>{for(let yy=r;yy<r+h;yy++)for(let x=c;x<c+w;x++){if(!m[yy]||x<0||x>=cols)throw Error('Outside room '+[c,r]);m[yy][x]=ch;}};
const put=(c,r,ch)=>rect(c,r,1,1,ch);
// rock: everything below the walking line is stone, so no sea floods a basin below another
let cur=2,ground=dy;rect(0,0,cols,1);rect(0,0,1,rows);rect(cols-1,0,1,rows);
rect(1,ground,LEDGE+1,rows-ground);put(3,ground-1,'P');rect(1,1,1,ground-1,'>');cur=LEDGE+2;
const S=(k)=>k;let phaseOff=0;
for(const p of parts){
 if(p.type==='save'||p.type==='exit'){const g=p.y+dy;rect(p.c,g,LEDGE,rows-g);if(p.type==='save')stages.push({x:(p.c+3)*8,y:g*8-11});continue;}
 const top=p.y+dy,bot=top+p.d;                           // ledge row of the entry, thorn row at the bottom
 rect(p.c0,bot,p.c1-p.c0+1,rows-bot);rect(p.c0,bot,p.c1-p.c0+1,1,'^');rect(p.c0,bot+1,p.c1-p.c0+1,rows-bot-1);
 const next=top-p.rise;rect(p.c1+1,next,LIP,rows-next);   // the far wall is the next ledge's lip
 rect(p.c0-1,top,1,rows-top);                            // the near wall
 // walls of the well are thorned below the lip, so the well has to be ridden, not climbed
 for(let r=top+2;r<bot;r++){put(p.c0,r,'>');put(p.c1,r,'<');}
 const high=next-1,low=bot+1,ceil=next-4;
 if(p.type==='ride'){
  const fw=4,fc=p.c0+Math.floor((p.c1-p.c0+1-fw)/2);rect(fc,bot-1,fw,1,'F');
  rect(fc-1,ceil,fw+2,1,'v');                            // ceiling thorns over the float's top: leave in time
  tides.push({c0:p.c0+1,c1:p.c1-1,low,high,hold:50,move:80,phase:phaseOff});
  stages.push({x:(fc+2)*8,y:(bot-1)*8-11-40,air:true,ground:true,toleranceY:48},{x:(p.c1+2)*8,y:next*8-11});
 }else if(p.type==='swim'){
  tides.push({c0:p.c0+1,c1:p.c1-1,low,high:next,hold:90,move:70,phase:phaseOff});
  stages.push({x:(p.c0+Math.floor((p.c1-p.c0)/2))*8,y:next*8,air:true,swim:true,toleranceY:24},{x:(p.c1+2)*8,y:next*8-11});
 }else{ // pair: two half-basins, a stone fin between them, floats on opposite tides
  const mid=p.c0+Math.floor((p.c1-p.c0)/2);rect(mid,top+3,1,bot-top-3);for(let r=top+3;r<bot;r++){put(mid-1,r,'.');}
  const fa=p.c0+2,fb=mid+3;rect(fa,bot-1,4,1,'F');rect(fb,bot-1,4,1,'F');
  tides.push({c0:p.c0+1,c1:mid-1,low,high:top-1,hold:40,move:70,phase:phaseOff},{c0:mid+1,c1:p.c1-1,low,high:high,hold:40,move:70,phase:phaseOff+110});
  stages.push({x:(fa+2)*8,y:(bot-1)*8-11-40,air:true,ground:true,toleranceY:48},{x:(fb+2)*8,y:(bot-1)*8-11-40,air:true,ground:true,toleranceY:48},{x:(p.c1+2)*8,y:next*8-11});
 }
 phaseOff=(phaseOff+70)%240;
}
const exitPart=parts.at(-1),ey=exitPart.y+dy;rect(cols-2,ey-6,2,6,'.');stages.push({x:(cols-1)*8,y:ey*8-11,exit:true});
const names=['The First Mooring','The Drowned Field','The Crossing Floats','The Low Water','The Last Turn'];
const checkpoints=saves.slice(0,5).map(([sc,sy],i)=>({c:sc+3,r:sy+dy-1,width:40,facing:1,name:names[i]}));
const room={id:'bank-f112',name:'The Tide Keeps Time',cols,rows,exit:'right',core:17,coreProgressKey:'core-shores',coreProgressRevision:1,coreCheckpoints:checkpoints,crumbleExtraFrames:coreCrumbleGrace(17),movement:'survive-2',aim8:true,dashes:1,study:true,dropThru:true,palette:'shores',rbr:17,lock:[],tides,hint:'Every basin keeps its own tide. Drop to a float at low water and leave it before the thorns above; cross a thorn field only while the sea drowns it.',map:m.map(r=>r.join(''))};
writeFileSync('scripts/room-bank/fractured/112-bank-f112.json',JSON.stringify({room,bank:{side:'fractured',batch:29,run:19,collection:'cores',coreIndex:17,format:'superroom',localOnly:true,acceptance:'candidate',needsReview:true,status:'authoring',author:'Claude',difficulty:5,worlds:[17,37],tags:['tide','float','swim','thorns'],newMechanics:['multi-tide'],role:'Landing Shores Core: every basin keeps its own tide',solution:'Ride each float on its rising sea and leave before the ceiling thorns; swim the drowned thorn fields at high water; change floats as two opposite tides pass.',requiredEvents:['splash','core-checkpoint'],requiredEventCounts:{'core-checkpoint':5},coreDescription:'Every basin keeps its own sea. Leave on the tide, not after it.',draft:true,humanReview:'Unverified authoring draft; not published.'},tape:[],verification:{stages,partTapes:[]}},null,2)+'\n');
