// Local authoring source. Re-running deliberately clears this draft's route proofs.
import {writeFileSync} from 'node:fs';
import {coreCrumbleGrace} from './core-difficulty.mjs';
const cols=160,rows=144,m=Array.from({length:rows},()=>Array(cols).fill('.'));
function rect(c,r,w,h,ch='#'){for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++){if(!m[y]||x<0||x>=cols)throw Error('Outside room');m[y][x]=ch;}}
const put=(c,r,ch)=>rect(c,r,1,1,ch);
rect(0,0,cols,1);rect(0,1,1,143);rect(159,1,1,143);rect(1,1,1,141,'>');rect(158,1,1,141,'<');rect(1,142,158,1,'^');rect(0,143,cols,1);rect(158,12,2,26,'.');
// Keep the first spring's high point; bring its second launch back to that echo.
rect(5,138,16,1);put(7,137,'P');put(14,137,'s');rect(22,121,5,1,'~');rect(40,117,7,1);
// A spent wall grants height, but the next dash is waiting below and beyond it.
rect(59,103,2,14,'Y');rect(59,102,2,1,'^');rect(59,117,2,1,'v');put(62,112,'o');rect(64,100,7,1);
// Iron has enough force to cross the high court only after the echo adds its height.
rect(74,102,9,1);put(78,101,'N');rect(91,73,7,1);
// The returning seed: store the first loft, then bring the second cut back to it.
put(86,75,'b');rect(80,80,7,1,'~');rect(70,58,7,1);
// Store the high approach and borrow the rising carrier's launch from below it.
rect(60,60,5,1,'Z');rect(76,45,7,1);
// Last exchange, then a single-use landing, a seed and a crumbling run to the door.
rect(87,48,7,1,'~');put(89,47,'s');rect(100,34,5,1,'Y');put(113,31,'b');rect(128,36,10,1,'~');
const checkpoints=[
 {c:43,r:116,width:56,facing:1,name:'The Borrowed Height'},
 {c:67,r:99,width:56,facing:1,name:'The Returned Dash'},
 {c:94,r:72,width:56,facing:-1,name:'The Iron Memory'},
 {c:73,r:57,width:56,facing:-1,name:'The Second Answer'},
 {c:79,r:44,width:56,facing:1,name:'The Rising Memory'}
].map(q=>({...q,clearEcho:true}));
const room={id:'bank-f109',name:'The Place You Left',cols,rows,exit:'right',core:14,coreProgressKey:'core-throne',coreProgressRevision:1,coreCheckpoints:checkpoints,crumbleExtraFrames:coreCrumbleGrace(14),movement:'survive-2',aim8:true,dashes:1,study:true,dropThru:true,palette:'throne',rbr:14,lock:[],echo:true,wake:{delay:140},zips:[[-8,-14]],hint:'Leave an echo high, regain the launch below, then trade while moving upward. Hold jump through seed cuts. Each save releases your echo; your wake keeps following.',map:m.map(r=>r.join(''))};
const stages=[
 {x:116,y:1101,event:'spring'},
 {x:116,y:1037,event:'echo-place',eventRadius:8,maxY:1035},
 {x:116,y:1101,event:'spring',maxVy:-160},
 {x:116,y:1037,event:'echo-swap',maxVy:-130},
 {x:192,y:957},{x:344,y:925},
 {x:464,y:888,grip:true},{x:464,y:832,grip:true,toleranceY:2},
 {x:456,y:797,event:'echo-place',eventRadius:10,maxY:797},
 {x:500,y:900,event:'refill',minDashes:1},
 {x:456,y:797,event:'echo-swap',maxVy:-130,minVx:0,minDashTimer:6},{x:536,y:789},
 {x:628,y:808,event:'anvil'},
 {x:656,y:725,event:'echo-place',eventRadius:10},
 {x:628,y:808,event:'anvil',maxVy:-300},
 {x:656,y:725,event:'echo-swap',maxVy:-240},{x:752,y:573},
 {x:688,y:600,event:'pogo-loft'},
 {x:688,y:509,event:'echo-place',eventRadius:10},
 {x:688,y:600,event:'pogo-loft',maxVy:-195},
 {x:688,y:509,event:'echo-swap',maxVy:-150},{x:584,y:453},
 {x:600,y:405,event:'echo-place',eventRadius:10},
 {x:488,y:469,lift:[480,480]},
 {x:448,y:397,event:'jump',eventAt:false,maxVy:-230},
 {x:600,y:405,event:'echo-swap',maxVy:-230},{x:632,y:349},
 {x:704,y:301,event:'echo-place',eventRadius:10},
 {x:716,y:381,event:'spring',maxVy:-160,minVarJump:10},
 {x:704,y:301,event:'echo-swap',maxVy:-130},
 {x:816,y:261},{x:904,y:248,event:'pogo-loft'},
 {x:1048,y:277},{x:1280,y:277,exit:true}
].map(s=>({...s,...(s.event&&s.eventAt!==false?{eventAt:true}:{} )}));
writeFileSync('scripts/room-bank/fractured/109-bank-f109.json',JSON.stringify({room,bank:{side:'fractured',batch:28,run:18,collection:'cores',coreIndex:14,format:'superroom',localOnly:true,acceptance:'candidate',needsReview:true,status:'authoring',author:'Sol 6.1',difficulty:5,worlds:[14,34],tags:['echo','wake','spring','anvil','pod','carrier'],newMechanics:[],role:'Throne Core: carry launches back to six airborne echoes',solution:'Place high echoes, return for a spring, refill, iron strike, second seed cut or carrier launch, and trade before the wake reaches the old path.',requiredEvents:['echo-place','echo-swap','core-checkpoint'],requiredEventCounts:{'echo-place':6,'echo-swap':6,spring:3,anvil:2,'pogo-loft':3,'zip-start':1,'core-checkpoint':5},coreDescription:'Keep the place, borrow the motion, and leave before your wake returns.',draft:true,humanReview:'Unverified authoring draft; not published.'},tape:[],verification:{stages,partTapes:[]}},null,2)+'\n');
