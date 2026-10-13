import {writeFileSync} from 'node:fs';
const cols=160,rows=100,m=Array.from({length:rows},()=>Array(cols).fill('.'));
const rect=(c,r,w,h,ch='#')=>{for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++)m[y][x]=ch;};
rect(0,0,160,1);rect(0,1,1,98);rect(159,1,1,98);rect(1,98,158,1,'^');rect(0,99,160,1);rect(1,1,1,97,'>');rect(158,16,1,82,'<');rect(159,5,1,10,'.');
const shelf=(c,r,w=4,ch='~')=>{rect(c,r,w,1,ch);rect(c,r+1,1,3,'<');rect(c+w-1,r+1,1,3,'>');};
rect(2,90,7,2);m[89][4]='P';rect(9,90,4,1,'Z');
shelf(47,89);shelf(75,84);shelf(100,89);shelf(128,85);shelf(146,63,8,'#');
shelf(120,58);shelf(94,60);rect(72,58,4,1,'Z');shelf(31,48);shelf(9,30,8,'#');
shelf(40,27);rect(67,23,4,1,'Z');shelf(105,17);shelf(131,21);shelf(150,10,9,'#');
// The two long load-bearing ribs share the outward and return space, with thorned roofs and undersides.
rect(2,70,133,2);rect(2,69,133,1,'^');rect(2,72,133,1,'v');rect(134,70,1,2,'>');
rect(26,36,132,2);rect(26,35,132,1,'^');rect(26,38,132,1,'v');rect(25,36,1,2,'<');
// Brake housings over selected transfers force low launches and controlled dives.
for(const [c,r,w]of [[28,81,24],[62,76,23],[89,80,19],[112,49,23],[79,51,17],[23,16,23],[94,9,20]]){rect(c,r,w,2);rect(c,r+2,w,1,'v');rect(c,r-1,w,1,'^');}
m[14][145]='o';
const room={id:'bank-f98',name:'The Last Counterweight',cols,rows,map:m.map(r=>r.join('')),exit:'right',core:3,coreProgressKey:'core-causeway',coreProgressRevision:1,coreCheckpoints:[{c:149,r:62,width:64,facing:-1,name:'The East Anchorage'},{c:12,r:29,width:64,facing:1,name:'The Return Pier'}],crumbleExtraFrames:60,movement:'survive-2',aim8:true,dashes:1,study:true,dropThru:true,palette:'causeway',lock:['parry','portal'],zips:[[17,-4],[-14,-6],[14,0]],lines:[{a:[147,78],b:[149,61],setDown:true,oneWay:true},{a:[11,45],b:[12,28],setDown:true,oneWay:true}],hint:'Keep the lift’s throw. Dive under the brakes, launch off the cracked shelves, and catch the tears in flight.'};
const stages=[{x:392,y:701},{x:608,y:661},{x:808,y:701},{x:1032,y:669},{x:1192,y:493},{x:968,y:453},{x:760,y:469},{x:588,y:453},{x:256,y:373},{x:96,y:229},{x:328,y:205},{x:548,y:173},{x:848,y:125},{x:1056,y:157},{x:1160,y:109,refill:true},{x:1216,y:69},{x:1281,y:69,exit:true}];
writeFileSync('scripts/room-bank/fractured/98-bank-f98.json',JSON.stringify({room,bank:{side:'fractured',batch:25,run:15,collection:'cores',coreIndex:3,format:'superroom',localOnly:false,acceptance:'candidate',needsReview:true,status:'authoring',author:'Sol 6.1',difficulty:5,worlds:[3,23],tags:['lift-momentum','ultra','hyper','zipline','crumble','brake-roof'],newMechanics:[],role:'Causeway Core: one continuous three-leg counterweight crossing',solution:'Ride each hoist into a committed launch, land low under the brake housings, chain fast crumble departures, and intercept the tears to return above the same ribs.',requiredEvents:['zip-start','zip-in','core-checkpoint'],requiredEventCounts:{'core-checkpoint':2},coreDescription:'Launch from the counterweights and carry the speed through the broken gantries. One room, three demanding legs.',draft:false,humanReview:'Awaiting player review.'},tape:[],verification:{stages,partTapes:[]}},null,2)+'\n');
