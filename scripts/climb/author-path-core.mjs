// Local authoring source. Re-running deliberately clears this draft's route proofs.
import {writeFileSync} from 'node:fs';
import {coreCrumbleGrace} from './core-difficulty.mjs';
// The Path to the Palace: one sunlit tower with thorned walls. Sun-windows throw burning beams across the climb;
// louvres (X) shut them on a beat; a mirror throws a falling beam across the tower until you strike it aside.
// Each section climbs five ledges; the first ledge of each is a stone save.
const SECTIONS=6,SH=20,W=30;   // section height, tower width (walls at 0/1 and W-2/W-1)
const rows=SECTIONS*SH+12,cols=W,m=Array.from({length:rows},()=>Array(cols).fill('.'));
const rect=(c,r,w,h,ch='#')=>{for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++){if(!m[y]||x<0||x>=cols)throw Error('Outside room '+[c,r]);m[y][x]=ch;}};
const put=(c,r,ch)=>rect(c,r,1,1,ch);
rect(0,0,cols,1);rect(0,0,1,rows);rect(cols-1,0,1,rows);rect(1,1,1,rows-3,'>');rect(cols-2,1,1,rows-3,'<');rect(1,rows-2,cols-2,1,'^');rect(0,rows-1,cols,1);
const beams=[],shutters=[],stages=[],saves=[];
const beat=[[50,40,0],[40,50,30],[45,35,60],[35,45,20],[40,40,70],[30,40,10],[45,30,40],[35,35,55],[30,30,15],[40,30,65],[30,35,25],[35,30,5]];
let bi=0;
const shutteredBeam=(row,fromLeft)=>{const c=fromLeft?1:cols-2,x=fromLeft?2:cols-3;beams.push({c,r:row,dir:fromLeft?'r':'l'});put(x,row,'X');const [o,s,off]=beat[bi++%beat.length];shutters.push({open:o,shut:s,offset:off});};
for(let s=0;s<SECTIONS;s++){
 const B=rows-6-s*SH,mirrorRight=s%2===0;
 const L=mirrorRight?[[3,B,7],[13,B-4,5],[22,B-8,5],[12,B-12,5],[3,B-16,5]]:[[cols-10,B,7],[cols-18,B-4,5],[cols-27,B-8,5],[cols-17,B-12,5],[cols-8,B-16,5]];
 for(const [c,r,w]of L)rect(c,r,w,1,s&&c===L[0][0]&&r===B?'#':'#');
 if(s===0)put(L[0][0]+2,B-1,'P');else saves.push({c:L[0][0]+3,r:B-1,width:40,facing:mirrorRight?1:-1,name:['','The Second Window','The Louvre Stair','The Bright Turn','The Hour Gallery','The Last Window'][s]});
 // beams: shuttered crossings between ledges, and a mirror that throws the falling beam across until struck
 shutteredBeam(B-2,!mirrorRight);shutteredBeam(B-6,mirrorRight);
 const mc=mirrorRight?cols-3:2,mr=B-11;put(mc,mr,mirrorRight?'/':'\\');beams.push({c:mc,r:B-SH+1,dir:'d'});
 shutteredBeam(B-14,!mirrorRight);
 for(const [i,[c,r,w]]of L.entries()){if(i===0&&s>0)stages.push({x:(c+3)*8,y:r*8-11});else if(i>0)stages.push({x:(c+Math.floor(w/2))*8,y:r*8-11});
  if(i===2)stages.push({x:mc*8+4,y:mr*8+4,event:'mirror',eventAt:true,eventRadius:12});}
}
// the way out: one more ledge under a gap in the roof
const ex=cols-17;rect(ex,6,5,1);rect(ex,0,5,1,'.');stages.push({x:(ex+2)*8,y:6*8-11},{x:(ex+2)*8,y:-8,exit:true});
const room={id:'bank-f114',name:'The Hours of the Sun',cols,rows,exit:'up',core:19,coreProgressKey:'core-path',coreProgressRevision:1,coreCheckpoints:saves,crumbleExtraFrames:coreCrumbleGrace(19),movement:'survive-2',aim8:true,dashes:1,study:true,dropThru:true,palette:'palace',rbr:19,lock:[],beams,shutters,hint:'The sun burns. Cross a beam while its louvre is shut. A mirror throws the falling light across the tower: strike it to turn the beam into the wall.',map:m.map(r=>r.join(''))};
writeFileSync('scripts/room-bank/fractured/114-bank-f114.json',JSON.stringify({room,bank:{side:'fractured',batch:29,run:19,collection:'cores',coreIndex:19,format:'superroom',localOnly:true,acceptance:'candidate',needsReview:true,status:'authoring',author:'Claude',difficulty:5,worlds:[19,39],tags:['beam','shutter','mirror','thorns'],newMechanics:[],role:'Path Core: climb the sunlit tower between the beams',solution:'Climb the ledges, crossing each beam row while its louvre is shut; strike each section’s mirror so the falling beam turns into the wall instead of across the tower.',requiredEvents:['mirror','core-checkpoint'],requiredEventCounts:{mirror:6,'core-checkpoint':5},coreDescription:'The sun keeps its hours. Climb between them.',draft:true,humanReview:'Unverified authoring draft; not published.'},tape:[],verification:{stages,partTapes:[]}},null,2)+'\n');
