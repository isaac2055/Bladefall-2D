// Local authoring source. Re-running deliberately clears this draft's route proofs.
import {writeFileSync} from 'node:fs';
import {coreCrumbleGrace} from './core-difficulty.mjs';
// Sunspire Palace: chambers walled by falling sunlight. No one crosses the light; the door does. Open one end on
// the pale stone (%) of your chamber and one beyond the light, then fall into yours from as high as you can: you
// leave the far floor as fast as you fell, and the far chamber's floor is higher each time.
const CH=7,CW=20,STEP=4;           // chambers, chamber width, floor rise per chamber
const rows=CH*STEP+40,cols=CH*(CW+1)+3;
const m=Array.from({length:rows},()=>Array(cols).fill('.'));
const rect=(c,r,w,h,ch='#')=>{for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++){if(!m[y]||x<0||x>=cols)throw Error('Outside room '+[c,r]);m[y][x]=ch;}};
const put=(c,r,ch)=>rect(c,r,1,1,ch);
rect(0,0,cols,1);rect(0,0,1,rows);rect(cols-1,0,1,rows);rect(0,rows-1,cols,1);
const beams=[],stages=[],saves=[];
for(let k=0;k<CH;k++){
 const a=1+k*(CW+1),F=rows-8-k*STEP;                  // chamber columns a..a+CW-1, main floor row F
 const pit=F+6;                                       // the arrival pit: portal stone at its bottom, six rows below the floor
 rect(a,F,CW,rows-1-F);                               // the chamber's rock
 if(k>0){rect(a,F,6,pit-F,'.');rect(a,pit,6,1,'%');}   // arrival pit at the light's foot
 if(k<CH-1){
  rect(a+CW-5,F,4,1,'%');                             // the departure stone in the floor, near the light
  rect(a+CW-10,F-8,5,1);                              // a perch: fall from here into your portal
  beams.push({c:a+CW,r:1,dir:'d'});rect(a+CW,F+1,1,rows-2-F);   // the wall of light, down to the rock
 }
 if(k===0)put(a+3,F-1,'P');
 if(k>0&&k<CH-1)saves.push({c:a+10,r:F-1,width:(CW-2)*8,facing:1,name:['','The First Door','The Bright Hall','The Turning Stair','The Sun Court','The Last Door'][k]});
 // stages: arrive (portal-pass + land beside the pit), then for the next door: perch, both ends, pass
 if(k>0){stages.push({event:'portal-pass',x:(a+3)*8,y:pit*8,eventAt:true,eventRadius:30},{x:(a+9)*8,y:F*8-11});}
 if(k<CH-1){stages.push({event:'portal-open',x:(a+CW-3)*8,y:F*8,eventAt:true,eventRadius:24},{x:(a+CW-8)*8,y:(F-8)*8-11},{event:'portal-open',x:(a+CW+4)*8,y:(F-STEP+6)*8,eventAt:true,eventRadius:24});}
}
// the way out: the last chamber's far wall opens
const lastF=rows-8-(CH-1)*STEP;rect(cols-1,lastF-4,1,4,'.');stages.push({x:cols*8,y:lastF*8-11,exit:true});
const room={id:'bank-f115',name:'The Last Light',cols,rows,exit:'right',core:20,coreProgressKey:'core-sunspire',coreProgressRevision:1,coreCheckpoints:saves,crumbleExtraFrames:coreCrumbleGrace(20),movement:'survive-2',aim8:true,dashes:1,study:true,dropThru:true,palette:'sunspire',rbr:20,lock:[],portalMode:'two',beams,hint:'No one crosses the light. Open a door on the pale stone of your chamber and one beyond the light, then fall into yours from high: you leave the far floor as fast as you fell.',map:m.map(r=>r.join(''))};
writeFileSync('scripts/room-bank/fractured/115-bank-f115.json',JSON.stringify({room,bank:{side:'fractured',batch:29,run:19,collection:'cores',coreIndex:20,format:'superroom',localOnly:true,acceptance:'candidate',needsReview:true,status:'authoring',author:'Claude',difficulty:5,worlds:[20,40],tags:['portal','beam','fling'],newMechanics:[],role:'Sunspire Core: pass every wall of light through your own door',solution:'In each chamber open one end on the departure stone and one in the arrival pit beyond the light, climb the perch and fall into your end: the fall becomes the rise out of the far pit, onto the higher floor.',requiredEvents:['portal-pass','core-checkpoint'],requiredEventCounts:{'portal-pass':6,'core-checkpoint':5},coreDescription:'The light cannot be crossed. The door can.',draft:true,humanReview:'Unverified authoring draft; not published.'},tape:[],verification:{stages,partTapes:[]}},null,2)+'\n');
