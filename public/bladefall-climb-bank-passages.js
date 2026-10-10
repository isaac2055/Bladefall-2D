/* Survive 7.304: explicit checkpoint passages at imported or retired room joins.
   Ordinary continuous seams retain their original physics. These folded joins
   enter the destination at its exact authored checkpoint and can be walked back
   through the pause menu’s Return through passage action. The imports never share simulation state. */
(function(root){
'use strict';
function checkpointLink(world,from,to){
 const direct=world?.checkpointLinks?.find(l=>l.from===from&&l.to===to);
 if(direct)return {...direct,reverse:false};
 const reverse=world?.checkpointLinks?.find(l=>l.to===from&&l.from===to);
 return reverse?{...reverse,reverse:true}:null;
}
function previousLink(world,current){return world?.checkpointLinks?.find(l=>l.to===current)||null;}
function arrive(g){
 // Core.enterRoom already created the complete authored start state (including
 // moving devices and each room's movement profile). Do not inherit the launch
 // speed, dash budget, held cargo, or buttons from the previous challenge.
 g.freeze=0;g.prev={};g.buf={jump:0,dash:0,grab:0,strike:0,parry:0,portal:0};g.exited=false;
 g.dropThru=g.room.def.campaignImport?!!g.room.def.dropThru:true;g.springUp=!g.room.def.campaignImport;
 g.campaignReturnTicks=0;g.events.length=0;
 return g.p;
}
function draw(b,g,world,t=0){
 if(!previousLink(world,g.room.id))return;
 const sp=g.room.spawn,x=sp.x-5,y=sp.y+g.p.h;
 b.save();b.strokeStyle='#6db8d6';b.fillStyle='#172b39';b.lineWidth=1;
 b.fillRect(x-3,y-18,3,18);b.fillRect(x+11,y-18,3,18);b.fillRect(x-3,y-20,17,3);
 b.strokeRect(x-3.5,y-20.5,17,20);b.fillStyle=(t>>4)%2?'#d0ecf5':'#78b6cf';
 b.fillRect(x+2,y-16,2,7);b.fillRect(x+7,y-16,2,7); // pause marks: no movement-input shortcut

 b.restore();
}
root.BladefallClimbBankPassages={checkpointLink,previousLink,arrive,draw};
})(typeof window!=='undefined'?window:globalThis);
