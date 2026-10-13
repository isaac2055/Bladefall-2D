import {writeFileSync} from 'node:fs';
const cols=136,rows=120,m=Array.from({length:rows},()=>Array(cols).fill('.'));
const rect=(c,r,w,h,ch='#')=>{for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++)m[y][x]=ch;};
const shelf=(c,r,w=5,ch='~')=>rect(c,r,w,1,ch);
rect(0,0,cols,1);rect(0,1,1,rows-1);rect(cols-1,1,1,rows-1);rect(1,118,134,1,'^');rect(0,119,cols,1);rect(1,1,1,117,'>');rect(134,15,1,103,'<');rect(135,4,1,11,'.');
shelf(3,115,9,'#');m[114][6]='P';
shelf(32,92);m[87][43]='b';shelf(70,73);shelf(83,69,5,'B');shelf(119,56,10,'#');
m[15][54]='o';m[34][117]='o';m[36][104]='o';shelf(82,38,5,'A');m[32][65]='b';shelf(29,19,10,'#');
m[10][72]='o';m[7][80]='o';shelf(58,13,5,'B');shelf(84,10,5,'A');m[6][96]='o';shelf(106,14,5,'A');shelf(124,14,11,'#');
const winds=[{c:15,r:91,w:6,h:25,dx:0,dy:-260},{c:54,r:71,w:6,h:26,dx:0,dy:-260},{c:96,r:53,w:6,h:25,dx:0,dy:-260},{c:114,r:32,w:6,h:24,dx:0,dy:-260},{c:50,r:16,w:6,h:25,dx:0,dy:-260},{c:39,r:3,w:6,h:20,dx:0,dy:-260}];
// Thorned baffles require leaving each rising column through its mouth.
for(const w of winds){rect(w.c-2,w.r+5,1,w.h-5);rect(w.c-1,w.r+5,1,w.h-5,'>');rect(w.c+w.w,w.r+5,1,w.h-5,'<');rect(w.c+w.w+1,w.r+5,1,w.h-5);}
for(let r=49;r<56;r++)for(const c of [112,113,120,121])m[r][c]='.';
winds.push({c:102,r:51,w:17,h:7,dx:130,dy:-100},{c:87,r:32,w:25,h:8,dx:-130,dy:-120});
// Shared roof/floor ribs make the three routes occupy one connected tower.
rect(23,61,69,2);rect(23,60,69,1,'^');rect(23,63,69,1,'v');
rect(62,23,68,2);rect(62,22,68,1,'^');rect(62,25,68,1,'v');
const room={id:'bank-f99',name:'The Borrowed Sky',cols,rows,map:m.map(r=>r.join('')),exit:'right',core:4,coreProgressKey:'core-updrafts',coreProgressRevision:1,coreCheckpoints:[{c:123,r:55,width:80,facing:-1,name:'The Turning Bellows'},{c:33,r:18,width:80,facing:1,name:'The Crown Breath'}],crumbleExtraFrames:60,movement:'survive-2',aim8:true,dashes:1,study:true,dropThru:true,palette:'updrafts',lock:['parry','portal'],rbr:true,winds,hint:'Catch the column, leave through its mouth, and spend the dash that lights your next landing.'};
const stages=[{x:144,y:734,air:true},{x:268,y:725},{x:352,y:676,air:true},{x:456,y:582,air:true},{x:568,y:573},{x:672,y:541},{x:792,y:440,air:true},{x:984,y:437},{x:936,y:268,air:true},{x:672,y:293},{x:528,y:240,air:true},{x:420,y:132,air:true},{x:268,y:141},{x:336,y:38,air:true},{x:472,y:93},{x:680,y:69},{x:856,y:101},{x:1020,y:101},{x:1087,y:101,exit:true}];
writeFileSync('scripts/room-bank/fractured/99-bank-f99.json',JSON.stringify({room,bank:{side:'fractured',batch:26,run:16,collection:'cores',coreIndex:4,format:'superroom',localOnly:false,acceptance:'candidate',needsReview:true,status:'authoring',author:'Sol 6.1',difficulty:5,worlds:[4,24],tags:['wind','phase','pod','crumble','wall-grab'],newMechanics:[],role:'Updraft Core: a single connected bellows tower',solution:'Keep rising through the bellows and cut across their mouths, rebound from seeds, and alternate the light platforms on each dash.',requiredEvents:['wind','phase','pod','core-checkpoint'],requiredEventCounts:{wind:4,phase:3,pod:1,'core-checkpoint':2},coreDescription:'Thread the bellows, seed rebounds and shifting light landings in one continuous tower.',draft:true,humanReview:'Awaiting native route proof and player review.'},tape:[],verification:{stages,partTapes:[]}},null,2)+'\n');
