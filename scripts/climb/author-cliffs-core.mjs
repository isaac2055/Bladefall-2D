// Local authoring source. Re-running deliberately clears this draft's route proofs.
import {writeFileSync} from 'node:fs';
import {coreCrumbleGrace} from './core-difficulty.mjs';
// Every dash turns the cliff: gold (A) stands until you dash, blue (B) only after. Each ring is a plain jump from the
// ledge before it. A turn swing ends in a dash (the cliff turns), a keep swing in a jump (it stays, and carries
// further), a back swing dashes behind the ring and climbs a shaft. Saves are stone and turn the cliff back.
// [kind, landing width]; turn: ring +4/6 up, land +10, rise 3. keep: land +14, rise 2. back: land -8 behind, rise 6.
const plan=[
 [['turn',5],['turn',5],['keep',7]],                     // along the floor of the cliffs
 [['back',5],['back',5],['back',5],['keep',7]],          // up the east shaft
 [['turn',5],['keep',5],['turn',5],['keep',7]],          // back across the middle
 [['back',5],['back',5],['back',5],['keep',7]],          // up the west shaft
 [['turn',5],['turn',5],['keep',7]],                     // across the crown
 [['turn',5],['back',5]]                                  // the way out
];
const beats=[],saveIdx=[];let c=0,w=8,r=0,dir=1,phase=0,lo=0,hi=8;
const DIRS=[1,1,-1,-1,1,1];
for(const [si,sec]of plan.entries()){dir=DIRS[si];for(const [bi,[kind,lw]]of sec.entries()){
 const edge=dir>0?c+w-1:c,rc=edge+dir*4,rr=r-6;
 const save=bi===sec.length-1&&si<plan.length-1;
 const before=phase;if(kind!=='keep')phase^=1;
 const ch=save?'#':phase?'B':'A';
 let lc,lr;
 if(kind==='back'){const near=rc-dir*8;lc=dir>0?near-(lw-1):near;lr=r-5;dir=-dir;}
 else{const off=kind==='turn'?10:14,near=rc+dir*off;lc=dir>0?near:near-(lw-1);lr=r-(kind==='turn'?3:2);}
 beats.push([[rc,rr],[lc,lr,lw,ch],{before,after:save?undefined:phase}]);if(save)phase=0;if(save)saveIdx.push(beats.length-1);
 c=lc;w=lw;r=lr;lo=Math.min(lo,lc,rc);hi=Math.max(hi,lc+lw,rc+1);}
}
const minR=Math.min(...beats.map(b=>b[0][1]));
const dx=5-lo,dy=12-minR,cols=hi+dx+6,rows=-minR+30;
for(const b of beats){b[0][0]+=dx;b[0][1]+=dy;b[1][0]+=dx;b[1][1]+=dy;}
const m=Array.from({length:rows},()=>Array(cols).fill('.'));
function rect(c,r,w,h,ch='#'){for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++){if(!m[y]||x<0||x>=cols)throw Error('Outside room '+[c,r]);if(strict&&m[y][x]!=='.'&&ch!=='.')throw Error('Overlap at '+[x,y]);m[y][x]=ch;}}
let strict=false;const put=(c,r,ch)=>rect(c,r,1,1,ch);
rect(0,0,cols,1);rect(0,1,1,rows-1);rect(cols-1,1,1,rows-1);rect(1,1,1,rows-3,'>');rect(cols-2,1,1,rows-3,'<');rect(1,rows-2,cols-2,1,'^');rect(0,rows-1,cols,1);
strict=true;const start=[dx,dy];rect(start[0],start[1],8,1);put(start[0]+2,start[1]-1,'P');
for(const [[rc,rr],[lc,lr,lw,ch]]of beats){put(rc,rr,'O');rect(lc,lr,lw,1,ch);}
const last=beats.at(-1)[1],exitCol=last[0]+Math.floor(last[2]/2);
for(let y=last[1]-7,k=0;y>1;y-=7,k++)put(exitCol+(k%2?2:-2),y,'O');
rect(exitCol-4,0,9,1,'.');
const saves=saveIdx.map(i=>beats[i][1]);
const names=['The First Fork','The Back Wall','The Long Turn','The Gallery','The Crown Ledge'];
const checkpoints=saves.map(([c,r,w],i)=>({c:c+Math.floor(w/2),r:r-1,width:48,facing:i%2?1:-1,name:names[i],resetPhase:true}));
const room={id:'bank-f111',name:'Every Dash Turns the Cliff',cols,rows,exit:'up',core:16,coreProgressKey:'core-cliffs',coreProgressRevision:1,coreCheckpoints:checkpoints,crumbleExtraFrames:coreCrumbleGrace(16),movement:'survive-2',aim8:true,dashes:1,study:true,dropThru:true,palette:'cliffs',rbr:16,lock:[],hint:'Hold grab near a ring to swing. Every dash turns the cliff: gold ledges stand until you dash, blue ones only after. Dash out of the swing to bring a blue ledge in; jump out to keep a gold one.',map:m.map(r=>r.join(''))};
const stages=[];
for(const [[rc,rr],[c,r,w],ph]of beats){stages.push({x:rc*8,y:rr*8+8,event:'hook',eventAt:true,eventRadius:40,phase:ph.before});stages.push({x:(c+Math.floor(w/2))*8,y:r*8-11,phase:ph.after});}
stages.push({x:exitCol*8,y:-8,exit:true});
writeFileSync('scripts/room-bank/fractured/111-bank-f111.json',JSON.stringify({room,bank:{side:'fractured',batch:29,run:19,collection:'cores',coreIndex:16,format:'superroom',localOnly:true,acceptance:'candidate',needsReview:true,status:'authoring',author:'Claude',difficulty:5,worlds:[16,36],tags:['hook-ring','switchback','spikes'],newMechanics:[],role:'Thunder Cliffs Core: swing, then choose whether the cliff turns',solution:'Swing from each ring; dash out to bring a blue ledge in, jump out to keep a gold one. Saves turn the cliff back.',requiredEvents:['hook','phase','core-checkpoint'],requiredEventCounts:{hook:20,phase:14,'core-checkpoint':5},coreDescription:'The storm turns the cliff each time you dash. Count before you let go.',draft:true,humanReview:'Unverified authoring draft; not published.'},tape:[],verification:{stages,partTapes:[]}},null,2)+'\n');
