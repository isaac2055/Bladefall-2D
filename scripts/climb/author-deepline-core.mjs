// Local authoring source. Re-running deliberately clears this draft's route proofs.
import {writeFileSync} from 'node:fs';
import {coreCrumbleGrace} from './core-difficulty.mjs';
const cols=192,rows=160,m=Array.from({length:rows},()=>Array(cols).fill('.'));
function rect(c,r,w,h,ch='#'){for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++){if(!m[y]||x<0||x>=cols)throw Error('Outside room');m[y][x]=ch;}}
const put=(c,r,ch)=>rect(c,r,1,1,ch);
rect(0,0,cols,1);rect(0,1,1,159);rect(191,1,1,159);rect(1,1,1,157,'>');rect(190,1,1,157,'<');rect(1,158,190,1,'^');rect(0,159,cols,1);rect(190,44,2,14,'.');
// A boosted high line ends far short of the first landing: carry the cart's speed out.
rect(5,152,26,1,'-');rect(8,151,3,1,'C');put(9,150,'P');rect(12,152,5,1,')');put(23,151,'k');rect(39,147,8,1,')');rect(72,146,5,1,'~');rect(85,145,8,1);
// Leave the next high line for a seed above the gap; its return opens the east shelf.
rect(101,145,22,1,'-');rect(103,144,3,1,'C');rect(107,145,5,1,')');put(115,144,'k');put(110,143,'o');rect(131,140,9,1,')');put(153,133,'b');rect(177,129,8,1);
// Reverse the lean, then leave the leftbound cart for the high seed and a falling ledge.
rect(155,131,24,1,'-');rect(174,130,3,1,'C');rect(166,131,5,1,'(');put(160,130,'k');rect(135,126,9,1,'(');put(121,119,'b');rect(107,113,5,1,'~');rect(91,113,8,1);
// A rising carrier delivers the miner to the anvil; its strike clears the upper shaft.
rect(81,116,5,1,'Z');rect(53,96,12,1);put(58,95,'N');rect(34,84,7,1,'~');rect(19,84,8,1);
// The next loaded leap must find the seed, then the spring on a crumbling sleeper.
rect(26,86,25,1,'-');rect(28,85,3,1,'C');put(32,84,'o');rect(32,86,5,1,')');put(42,85,'k');rect(59,81,9,1,')');put(80,74,'b');rect(92,70,8,1,'~');put(95,69,'s');rect(109,58,8,1);
// One last switch, a high seed and a crumbling departure to the exit.
rect(122,60,23,1,'-');rect(124,59,3,1,'C');put(131,58,'o');rect(128,60,5,1,')');put(136,59,'k');rect(153,55,9,1,')');put(176,48,'b');rect(184,50,5,1,'~');
const checkpoints=[
 {c:88,r:144,width:64,facing:1,name:'The First Trestle'},
 {c:180,r:128,width:64,facing:-1,name:'The East Signal'},
 {c:94,r:112,width:64,facing:-1,name:'The Return Line'},
 {c:22,r:83,width:64,facing:1,name:'The Upper Shaft'},
 {c:112,r:57,width:64,facing:1,name:'The Last Service'}
];
const room={id:'bank-f110',name:'No Track Beyond',cols,rows,exit:'right',core:15,coreProgressKey:'core-deepline',coreProgressRevision:1,coreCheckpoints:checkpoints,crumbleExtraFrames:coreCrumbleGrace(15),movement:'survive-2',aim8:true,dashes:1,study:true,dropThru:true,palette:'deepline',rbr:15,lock:[],zips:[[-16,-18]],hint:'Lean through the brass switches. Jump out with the cart’s speed before the rail ends, then keep jump held through the high seed cuts. The cart does not refill your dash.',map:m.map(r=>r.join(''))};
const stages=[
 {x:188,y:1208,event:'switch-high'},{x:336,y:1157,cart:true},{x:592,y:1157},{x:704,y:1149},
 {x:840,y:1141,cart:true},{x:924,y:1152,event:'switch-high'},{x:1080,y:1101,cart:true},{x:1224,y:1064,event:'pogo-loft'},{x:1440,y:1021},
 {x:1408,y:1029,cart:true},{x:1284,y:1040,event:'switch-high'},{x:1112,y:989,cart:true},{x:968,y:952,event:'pogo-loft'},{x:872,y:893},{x:752,y:893},
 {x:656,y:917,lift:[648,928]},{x:472,y:749},{x:468,y:760,event:'anvil'},{x:296,y:661},{x:176,y:661},
 {x:240,y:669,cart:true},{x:340,y:680,event:'switch-high'},{x:496,y:629,cart:true},{x:640,y:592,event:'pogo-loft'},{x:764,y:552,event:'spring'},{x:896,y:453},
 {x:1008,y:461,cart:true},{x:1092,y:472,event:'switch-high'},{x:1256,y:421,cart:true},{x:1408,y:384,event:'pogo-loft'},{x:1488,y:389},{x:1536,y:389,exit:true}
].map(s=>({...s,...(s.event?{eventAt:true}:{} )}));
writeFileSync('scripts/room-bank/fractured/110-bank-f110.json',JSON.stringify({room,bank:{side:'fractured',batch:28,run:18,collection:'cores',coreIndex:15,format:'superroom',localOnly:true,acceptance:'candidate',needsReview:true,status:'authoring',author:'Sol 6.1',difficulty:5,worlds:[15,35],tags:['cart','boost','switch','pod','carrier','anvil','crumble'],newMechanics:[],role:'Deep Line Core: leave the high line with its speed',solution:'Ride boosted switches into long airborne departures, reverse the return line, ride the shaft carrier and strike the anvil, then link the last seed catches.',requiredEvents:['switch-high','boost','core-checkpoint'],requiredEventCounts:{'switch-high':5,boost:5,'pogo-loft':4,anvil:1,'zip-start':1,'core-checkpoint':5},coreDescription:'The rails end before the route does. Take their speed with you.',draft:false,humanReview:'Published by Isaac (2026-10-15): solid drafts.'},tape:[],verification:{stages,partTapes:[]}},null,2)+'\n');
