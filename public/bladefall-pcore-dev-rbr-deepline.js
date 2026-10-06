/* The Bell Below: a loaded cart drives a cage continuously upward; the rescued miner walks to the ledger. */
(function(root){'use strict';const C=()=>root.BladefallPrecisionCore;
function reset(g){const d=g.room.def;g.rescueHoist=d.rescueHoist?{...d.rescueHoist,t:0,done:false}:null;g.rescueEscort=d.rescueEscort?{...d.rescueEscort,x:d.rescueEscort.from*8,y:144,done:false}:null;
 if(g.rescueHoist||g.rescueEscort)for(const e of g.ents)if(e.type==='gate')e.devKeyed=true;
}
function after(g){const h=g.rescueHoist,e=g.rescueEscort,p=g.p;if(p.state==='dead'||p.state==='respawn')return;
 if(h&&!h.done){const cart=g.ents.find(e=>e.type==='cart'&&!e.gone&&Math.abs(e.x+e.w/2-h.cradle*8)<12&&Math.abs(e.y-136)<2&&Math.abs(e.vx)<8);
  h.driven=!!cart;if(cart)h.t=Math.min(h.hold,h.t+1);if(h.t===h.hold){h.done=true;C().emit(g,'miner-raised',{x:h.cage*8,y:136});}}
 if(e&&!e.done&&Math.abs(p.x-e.x)<48&&Math.abs(p.y+11-e.y)<16){e.x=Math.min(e.to*8,e.x+24/60);if(e.x===e.to*8){e.done=true;C().emit(g,'miner-ledger',{x:e.x,y:e.y-8});}}
}
function gateHold(g){return !!(g.rescueHoist&&!g.rescueHoist.done||g.rescueEscort&&!g.rescueEscort.done);}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rbr-deepline',reset,after,gateHold});
})(typeof window!=='undefined'?window:globalThis);
