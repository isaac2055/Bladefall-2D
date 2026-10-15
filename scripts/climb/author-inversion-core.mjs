// Local authoring source. Re-running clears this draft's route proofs.
import {writeFileSync} from 'node:fs';
import {coreCrumbleGrace} from './core-difficulty.mjs';
const cols=160,rows=128,m=Array.from({length:rows},()=>Array(cols).fill('.'));
function rect(c,r,w,h,ch='#'){for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++){if(!m[y]||x<0||x>=cols)throw Error('Outside room');m[y][x]=ch;}}
const put=(c,r,ch)=>rect(c,r,1,1,ch),prism=(c,r)=>rect(c,r,1,3,'Q');
function roof(c,r,w,landing){rect(c,r,w,1);rect(c,r+1,w,1,'v');rect(landing,r+1,5,1,'~');}
rect(0,0,cols,1);rect(0,1,1,127);rect(159,1,1,127);rect(1,1,1,125,'>');rect(158,1,1,125,'<');rect(1,126,158,1,'^');rect(0,127,160,1);rect(158,19,2,13,'.');
// First reversal: catch a narrow cracked ceiling, jump away, turn down over the landing.
rect(5,121,7,1,'~');put(7,120,'P');prism(22,117);roof(18,99,30,29);prism(43,103);rect(50,112,7,1);
// The seed raises the entry. The second ceiling is too high to reach without reversing.
put(64,107,'b');prism(78,104);roof(72,83,37,89);prism(103,89);rect(114,96,7,1);
// Outside the roofline, climb the east tower and turn left into the upper works.
prism(135,89);roof(126,67,27,140);prism(124,71);rect(105,77,12,1);
// Reverse across the room. The inverted cut pushes away from the cracked ceiling.
put(94,71,'b');prism(80,69);roof(48,48,47,65);put(53,54,'b');prism(47,54);rect(30,62,12,1);
// West return: two cracked landings separate the last upright rest from the shaft.
prism(18,55);roof(3,33,32,9);prism(30,39);rect(38,47,5,1,'~');rect(55,44,7,1);
// Crown: one more ceiling catch, an upside-down seed cut and a falling return to the exit.
prism(74,38);roof(68,16,39,86);put(105,22,'b');prism(119,20);rect(127,30,5,1,'~');rect(143,32,5,1,'~');
const checkpoints=[
 {c:53,r:111,width:56,facing:1,name:'The First Righting'},
 {c:117,r:95,width:56,facing:1,name:'The High Underside'},
 {c:108,r:76,width:80,facing:-1,name:'The East Return'},
 {c:33,r:61,width:56,facing:-1,name:'The Opposite Weight'},
 {c:58,r:43,width:56,facing:1,name:'The Last Upright Stone'}
];
const room={id:'bank-f107',name:'The Weight Above',cols,rows,exit:'right',core:12,coreProgressKey:'core-inversion',coreProgressRevision:1,coreCheckpoints:checkpoints,crumbleExtraFrames:coreCrumbleGrace(12),movement:'survive-2',aim8:true,dashes:1,study:true,dropThru:true,palette:'inversion',rbr:12,lock:[],hint:'Hold jump through a seed cut for the high rebound. The cracked ceiling is a brief foothold. Jump away from it, spend the returned dash on the next prism, and find upright stone before the next reversal.',map:m.map(r=>r.join(''))};
const stages=[
 {x:180,y:948,event:'gravity',flipped:true},{x:248,y:808,flipped:true},{x:348,y:836,event:'gravity',flipped:false},{x:424,y:885,flipped:false},
 {x:512,y:856,event:'pogo-loft',flipped:false,minX:512,maxY:848},{x:628,y:844,event:'gravity',flipped:true},{x:728,y:680,flipped:true},{x:828,y:724,event:'gravity',flipped:false,maxY:745},{x:936,y:757,flipped:false},
 {x:1084,y:724,event:'gravity',flipped:true},{x:1136,y:552,flipped:true},{x:996,y:580,event:'gravity',flipped:false,maxY:568,maxX:968},{x:864,y:605,flipped:false},
 {x:752,y:568,event:'pogo-loft',flipped:false},{x:644,y:564,event:'gravity',flipped:true},{x:536,y:400,flipped:true},{x:424,y:432,event:'pogo-loft',flipped:true},{x:380,y:444,event:'gravity',flipped:false},{x:264,y:485,flipped:false},
 {x:148,y:452,event:'gravity',flipped:true},{x:88,y:280,flipped:true},{x:244,y:324,event:'gravity',flipped:false},{x:320,y:365,flipped:false},{x:464,y:341,flipped:false},
 {x:596,y:316,event:'gravity',flipped:true},{x:704,y:144,flipped:true},{x:840,y:176,event:'pogo-loft',flipped:true},{x:956,y:172,event:'gravity',flipped:false},{x:1032,y:229,flipped:false},{x:1160,y:245,flipped:false},{x:1280,y:245,exit:true,flipped:false}
].map(s=>({...s,screen:true,...(s.event?{eventAt:true}:{} )}));
writeFileSync('scripts/room-bank/fractured/107-bank-f107.json',JSON.stringify({room,bank:{side:'fractured',batch:28,run:18,collection:'cores',coreIndex:12,format:'superroom',localOnly:true,acceptance:'candidate',needsReview:true,status:'authoring',author:'Sol 6.1',difficulty:5,worlds:[12,32],tags:['gravity','crumble','pod','ceiling'],newMechanics:[],role:'Inversion Core: a continuous reversal climb around the rooflines',solution:'Dash through paired prisms, catch the cracked undersides, jump away and return upright. Use seeds with gravity facing both ways.',requiredEvents:['gravity','pod','core-checkpoint'],requiredEventCounts:{gravity:12,pod:4,'pogo-loft':4,'core-checkpoint':5,'crumble-shake':10},coreDescription:'Borrow the ceiling for a heartbeat, then turn its weight back toward the floor.',draft:false,humanReview:'Published by Isaac (2026-10-15): solid drafts.'},tape:[],verification:{stages,partTapes:[]}},null,2)+'\n');
