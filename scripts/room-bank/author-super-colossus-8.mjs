import {readFileSync,writeFileSync} from 'node:fs';
const file=new URL('./base/bank-b65.json',import.meta.url),cols=84,rows=36;
const m=Array.from({length:rows},()=>Array(cols).fill('.'));
const fill=(c,r,w,h,k='#')=>{for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++)m[y][x]=k;};
fill(0,0,cols,1);fill(0,35,cols,1);fill(0,0,1,rows);fill(83,0,1,rows);
// The work floor and its sheltered return trench share the full lower bay.
fill(1,29,67,1);fill(1,30,64,5,'.');fill(0,30,1,5,'G');
fill(68,29,15,1,'^');fill(79,29,4,1,'.');
fill(1,34,82,1,'{');
fill(6,28,1,1,'P');fill(24,26,1,1,'U');
// First iron column is the anvil stop; its upper sides cannot be climbed.
fill(23,3,1,20,'<');fill(25,3,1,18,'>');
fill(43,24,3,2,'K');fill(44,26,1,1,'U');
// The anvil reaches the suspended gallery. It is one-way, so falls recover below.
fill(38,12,18,1,'=');fill(58,11,1,1,'U');
fill(61,6,18,1);fill(60,7,1,22,'<');
fill(73,13,10,1,'=');fill(74,21,9,1,'=');
// A few mould footholds extend the casting return; the last is over the old starting bay.
fill(65,23,3,1,'=');
let old={};try{old=JSON.parse(readFileSync(file));}catch{}
const room={id:'bank-b65',name:'Cast Your Escape',palette:'foundry',cols,rows,study:true,dashes:1,lock:['parry','portal'],rbr:11,dropThru:true,exit:'left',map:m.map(r=>r.join('')),anvilSleds:[{c:43,r:24,offset:1}],colossus:{rail:2,x:24,bays:[24,58,44],need:3,speed:150,gather:90,pour:70,rest:50,jam:75,first:150,body:'right',leave:'down',hunt:{every:3,lock:35,speed:110}},hint:'Cold iron stops the pour—and the anvil sled. The place the sled leaves behind is another mould.',question:'Can the iron that blocks your way become the stop that lets you reach the next casting bay?'};
const bank={side:'base',batch:17,run:8,collection:'superrooms',format:'superroom',acceptance:'candidate',status:'draft',author:'Codex',difficulty:4,worlds:[11],tags:['colossus','anvil','slide-stone','casting','return-route'],newMechanics:['anvil-sled'],approvedIngredients:['bank-b49','bank-b50'],role:'Turn a boss-made barrier into an anvil stop, then reclaim the vacated casting bay.',interconnection:'The first pour makes the shared anvil stop. Moving the anvil uncovers the third mould and places the rebound beneath the second gallery. The final return runs underneath the original casting work floor.',novelty:'One boss-made pillar first blocks the court, then parks a movable anvil; moving that anvil exposes a later boss target.',nearestExisting:'B49 changes shared floors and B50 makes a portal into a cargo stop. Here native Colossus casting makes the stop itself, and a native anvil rides a dash-moved stone.',solution:'Cast the low western mould and let the Colossus build its iron column. Cross underneath to the sled and dash it left into the new column. Cast the mould the sled vacated, then pogo its anvil onto the suspended gallery and cast the high eastern mould. Once all three pours have been refused, drop into the broad return trench and leave beneath the first pillar.',endingForgiveness:'The final gate opens onto a continuous sheltered lower trench. There is no final launch or pixel-perfect strike.',humanReview:'Awaiting human ratings.',requiredEvents:['cast','colossus-refuse','stone-hit','stone-stop','anvil','colossus-down','gate-open'],requiredEventCounts:{'colossus-refuse':3}};
writeFileSync(file,JSON.stringify({room,bank,tape:old.tape||[]},null,2)+'\n');
console.log('Saved B65 draft');
