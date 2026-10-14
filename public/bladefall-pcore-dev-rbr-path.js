/* The Pilgrim's sack rides in the cargo sling; the knight meets it at the upper dock. */
(function(root){'use strict';function reset(g){g.cargoDock=g.room.def.cargoDock?{...g.room.def.cargoDock,done:false}:null;if(g.cargoDock)for(const e of g.ents)if(e.type==='gate')e.devKeyed=true;}
function after(g){const d=g.cargoDock;if(!d||d.done||g.p.state==='dead')return;const e=g.ents.find(e=>e.type==='deck');if(e&&Math.abs(e.x-d.c*8)<4&&Math.abs(e.y-d.r*8)<4&&Math.abs(g.p.x-(e.x+e.w/2))<45&&Math.abs(g.p.y-e.y)<40){d.done=true;root.BladefallPrecisionCore.emit(g,'cargo-docked',{x:d.c*8,y:d.r*8});}}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rbr-path',reset,after,afterPlayer:after,gateHold:g=>!!(g.cargoDock&&!g.cargoDock.done)});
})(typeof window!=='undefined'?window:globalThis);
