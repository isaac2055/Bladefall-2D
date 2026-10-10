/* An anvil mounted on a native slide stone. Opt-in per room; normal dash/stone,
   anvil rebound, and Colossus casting/defeat remain owned by their existing systems. */
(function(root){'use strict';const C=()=>root.BladefallPrecisionCore;
function reset(g){g.anvilSleds=[];for(const d of g.room.def.anvilSleds||[]){const s=g.ents.find(e=>e.type==='slide'&&e.x===d.c*8&&e.y===d.r*8);if(!s)continue;const a={type:'anvil',dev:true,solid:true,id:'sled-anvil-'+s.id,x:s.x+(d.offset||0)*8,y:s.y-8,w:8,h:8,timer:0,remX:0,remY:0};g.ents.push(a);g.anvilSleds.push({s,a,offset:(d.offset||0)*8});}}
function follow(g){for(const {s,a,offset}of g.anvilSleds||[]){const dx=s.x+offset-a.x,dy=s.y-8-a.y;if(dx||dy)C().moveSolid(g,a,dx,dy);}}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'superrooms-colossus',reset,before:follow,after:follow});
})(typeof window!=='undefined'?window:globalThis);
