// Draft authoring source. Re-running deliberately clears this draft's route proofs.
import {writeFileSync} from 'node:fs';
import {coreCrumbleGrace} from './core-difficulty.mjs';
const cols=160,rows=132,map=Array.from({length:rows},()=>Array(cols).fill('.'));
function rect(c,r,w,h,ch='#'){for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++){if(!map[y]||x<0||x>=cols)throw Error('Outside room');map[y][x]=ch;}}
const put=(c,r,ch)=>rect(c,r,1,1,ch);
const crown=(c,r,h=8)=>{rect(c,r,3,h);rect(c,r-1,3,1,'^');rect(c,r+h,3,1,'v');};
rect(0,0,cols,1);rect(0,1,1,rows-1);rect(cols-1,1,1,rows-1);rect(1,1,1,rows-3,'>');rect(cols-2,1,1,rows-3,'<');rect(1,rows-2,cols-2,1,'^');rect(0,rows-1,cols,1);
rect(cols-2,5,2,11,'.');
// The first cast: a small departure, two isolated anvils and an unmade landing.
rect(5,126,6,1,'~');put(7,125,'P');put(23,126,'N');put(37,111,'N');rect(48,94,4,1,'U');rect(57,94,7,1);
// A belt throws the knight into a tall capped pier; iron waits beyond its far face.
rect(69,93,7,1,'}');crown(83,79,11);put(90,88,'N');rect(102,72,4,1,'U');put(114,67,'N');rect(127,52,7,1);
// Reverse into the overhead works, strike iron before the low ceiling, then cast a narrow perch.
rect(115,47,6,1,'{');put(104,49,'N');rect(97,30,8,1);rect(97,31,8,1,'v');put(90,39,'b');rect(77,37,4,1,'U');rect(63,39,7,1);
// Descend under the central roof, catch a carrier and reverse its rising stroke.
rect(52,47,5,1,'Z');put(40,44,'N');crown(29,24,11);rect(17,22,7,1);
// A hanging return: make the mould, cross its cap, and bounce above the cast gallery.
put(33,20,'N');rect(46,11,4,1,'U');put(60,17,'N');rect(73,8,7,1);
// Last pour: a seed regulates the low approach to a final anvil and crumble exit.
put(92,12,'b');put(109,18,'N');rect(124,7,4,1,'U');rect(142,12,8,1,'~');
const checkpoints=[
 {c:60,r:93,width:56,facing:1,name:'The First Cast'},
 {c:130,r:51,width:56,facing:-1,name:'The High Furnace'},
 {c:66,r:38,width:56,facing:-1,name:'The Returning Stroke'},
 {c:20,r:21,width:56,facing:1,name:'The Crane Foot'},
 {c:76,r:7,width:56,facing:1,name:'The Casting Crown'}
];
const room={id:'bank-f106',name:'The Iron Answer',cols,rows,exit:'right',core:11,coreProgressKey:'core-foundry',coreProgressRevision:1,coreCheckpoints:checkpoints,crumbleExtraFrames:coreCrumbleGrace(11),movement:'survive-2',aim8:true,dashes:1,study:true,dropThru:true,palette:'foundry',rbr:11,lock:[],zips:[[-7,-13]],hint:'Cut down on iron to rise. Cast your next foothold while airborne, and save the dash for the turn.',map:map.map(r=>r.join(''))};
const stages=[
 {x:184,y:1008,event:'anvil'},{x:296,y:888,event:'anvil'},{x:392,y:752,event:'cast'},{x:480,y:741},
 {x:656,y:687,grip:true},{x:656,y:641,grip:true},{x:672,y:592,air:true,normal:true,toleranceX:8,toleranceY:6},{x:688,y:670,grip:true},
 {x:720,y:704,event:'anvil'},{x:824,y:576,event:'cast'},{x:912,y:536,event:'anvil'},{x:1040,y:405},
 {x:832,y:392,event:'anvil'},{x:720,y:312,event:'pod'},{x:624,y:296,event:'cast',maxY:285},{x:528,y:301},
 {x:424,y:365,lift:[416,376]},{x:320,y:352,event:'anvil'},{x:256,y:220,grip:true},{x:256,y:200,grip:true},{x:240,y:144,air:true,normal:true,toleranceX:8,toleranceY:6},{x:160,y:165},
 {x:264,y:160,event:'anvil'},{x:376,y:88,event:'cast',maxY:77,ground:true},{x:480,y:136,event:'anvil'},{x:608,y:53},
 {x:736,y:96,event:'pod',minX:736,maxY:95},{x:872,y:144,event:'anvil'},{x:1000,y:45},{x:1168,y:85},{x:1280,y:85,exit:true}
];
writeFileSync('scripts/room-bank/fractured/106-bank-f106.json',JSON.stringify({room,bank:{side:'fractured',batch:28,run:18,collection:'cores',coreIndex:11,format:'superroom',localOnly:true,acceptance:'candidate',needsReview:true,status:'authoring',author:'Sol 6.1',difficulty:5,worlds:[11,31],tags:['anvil','mould','belt','crumble','pod','carrier'],newMechanics:[],role:'Foundry Core: a continuous climb through casting works',solution:'Chain downward iron rebounds with airborne casts, controlled seed turns and a returning carrier.',requiredEvents:['anvil','cast','core-checkpoint'],requiredEventCounts:{anvil:9,cast:5,'core-checkpoint':5,'zip-start':1,'crumble-shake':1},coreDescription:'Strike the iron, make the footing, and turn before the next stroke.',draft:true,humanReview:'Unverified authoring draft; not published.'},tape:[],verification:{stages:stages.map(s=>s.event?{...s,eventAt:true}:s),partTapes:[]}},null,2)+'\n');
