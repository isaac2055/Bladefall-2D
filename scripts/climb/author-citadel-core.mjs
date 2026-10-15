// Local authoring source. Re-running deliberately clears this draft's route proofs.
import {writeFileSync} from 'node:fs';
import {coreCrumbleGrace} from './core-difficulty.mjs';
const cols=144,rows=144,m=Array.from({length:rows},()=>Array(cols).fill('.'));
function rect(c,r,w,h,ch='#'){for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++){if(!m[y]||x<0||x>=cols)throw Error('Outside room');m[y][x]=ch;}}
const put=(c,r,ch)=>rect(c,r,1,1,ch);
function spent(c,r,h=12,dir=1){rect(c,r,2,h,'Y');rect(c,r-1,2,1,'^');rect(c,r+h,2,1,'v');put(dir>0?c+2:c-1,r+1,'o');}
rect(0,0,cols,1);rect(0,1,1,143);rect(143,1,1,143);rect(1,1,1,141,'>');rect(142,1,1,141,'<');rect(1,142,142,1,'^');rect(0,143,cols,1);rect(142,8,2,11,'.');
// Each refill lies beyond a wall: spend the grip, then pass through its vanished body.
rect(5,137,7,1,'~');put(7,136,'P');spent(22,124);spent(34,116);spent(46,108);rect(56,110,7,1);
// Two taller faces feed a carrier that raises the route into the east court.
spent(69,96,14);spent(82,88,14);rect(93,88,5,1,'Z');rect(108,77,7,1);
// The return spends the opposite faces; no pillar remains for a second catch.
spent(98,64,13,-1);spent(86,56,13,-1);spent(74,48,13,-1);rect(60,51,7,1);
// One last pale face leads to the surviving stone and a portal shot made while hanging.
spent(49,40,14,-1);rect(36,27,3,16);rect(36,26,3,1,'^');rect(36,43,3,1,'v');rect(38,29,1,2,'%');rect(30,16,9,1,'%');rect(30,15,9,1,'^');rect(22,23,8,1);
// The crown passes back through two disappearing walls, leaving both behind.
spent(40,10,13);spent(53,6,14);rect(64,14,7,1);
// Two single-use floors and a seed lead into a crumbling final departure.
rect(77,18,5,1,'Y');rect(94,14,5,1,'Y');put(105,10,'b');rect(115,16,6,1,'~');
const checkpoints=[
 {c:59,r:109,width:56,facing:1,name:'The First Absence'},
 {c:111,r:76,width:56,facing:-1,name:'The East Court'},
 {c:63,r:50,width:56,facing:-1,name:'The Empty Return'},
 {c:25,r:22,width:64,facing:1,name:'The Surviving Stone'},
 {c:67,r:13,width:56,facing:1,name:'The Last Firm Step'}
];
const room={id:'bank-f108',name:'What the Wall Leaves',cols,rows,exit:'right',core:13,coreProgressKey:'core-citadel',coreProgressRevision:1,coreCheckpoints:checkpoints,crumbleExtraFrames:coreCrumbleGrace(13),movement:'survive-2',aim8:true,dashes:1,study:true,dropThru:true,palette:'citadel',rbr:13,lock:[],portalMode:'two',zips:[[8,-10]],hint:'Hold the pale face, jump, then pass through the space it leaves. The refill is beyond the wall; the thorned cap stays behind.',map:m.map(r=>r.join(''))};
const stages=[
 {x:168,y:1040,grip:true},{x:168,y:1024,grip:true},{x:196,y:1004,event:'refill'},
 {x:264,y:984,grip:true},{x:264,y:960,grip:true},{x:292,y:940,event:'refill'},
 {x:360,y:920,grip:true},{x:360,y:896,grip:true},{x:388,y:876,event:'refill'},{x:472,y:869},
 {x:544,y:832,grip:true},{x:544,y:800,grip:true},{x:572,y:780,event:'refill'},
 {x:648,y:776,grip:true},{x:648,y:736,grip:true},{x:676,y:716,event:'refill'},
 {x:752,y:693,lift:[744,704]},{x:888,y:605},
 {x:800,y:576,grip:true},{x:800,y:544,grip:true},{x:780,y:524,event:'refill'},
 {x:704,y:512,grip:true},{x:704,y:480,grip:true},{x:684,y:460,event:'refill'},
 {x:608,y:448,grip:true},{x:608,y:416,grip:true},{x:588,y:396,event:'refill'},{x:504,y:397},
 {x:408,y:384,grip:true},{x:408,y:352,grip:true},{x:388,y:332,event:'refill',maxY:340},
 {x:312,y:300,grip:true},{x:312,y:252,grip:true},{x:312,y:252,portalOpen:true},{x:280,y:142,portalPass:true},{x:200,y:173},
 {x:312,y:144,grip:true},{x:312,y:112,grip:true},{x:340,y:92,event:'refill'},
 {x:416,y:112,grip:true},{x:416,y:80,grip:true},{x:444,y:60,event:'refill'},{x:536,y:101},
 {x:632,y:133},{x:768,y:101},{x:840,y:80,event:'pogo-loft'},{x:944,y:117},{x:1152,y:117,exit:true}
].map(s=>({...s,...(s.event?{eventAt:true}:{} )}));
writeFileSync('scripts/room-bank/fractured/108-bank-f108.json',JSON.stringify({room,bank:{side:'fractured',batch:28,run:18,collection:'cores',coreIndex:13,format:'superroom',localOnly:true,acceptance:'candidate',needsReview:true,status:'authoring',author:'Sol 6.1',difficulty:5,worlds:[13,33],tags:['spent-foothold','wall-grab','refill','portal','carrier','crumble'],newMechanics:[],role:'Citadel Core: climb through the space left by spent walls',solution:'Spend thorn-capped grips to expose the refill beyond them, reverse the ascent, then turn the hanging portal and leave along single-use floors.',requiredEvents:['foothold-spent','grab','core-checkpoint'],requiredEventCounts:{'foothold-spent':13,grab:11,refill:11,'portal-pass':1,'zip-start':1,'core-checkpoint':5,'crumble-shake':2},coreDescription:'The wall holds once. Its absence is your next passage.',draft:false,humanReview:'Published by Isaac (2026-10-15): solid drafts.'},tape:[],verification:{stages,partTapes:[]}},null,2)+'\n');
