/* Opt-in shared state for the second Fractured superroom set. Native bosses still own
   their attacks, wounds and victory. This device only changes their arena after
   the physical interaction described on the room's superFractured field. */
(function(root){'use strict';const C=()=>root.BladefallPrecisionCore;
function reset(g){const d=g.room.def.superFractured;g.superFractured=d?{d,stage:0}:null;}
function settle(g){const a=g.superFractured;if(!a||g.p.state==='dead'||g.p.state==='respawn')return;const Core=C(),d=a.d;
 if(d.kind==='frost'&&!a.stage){const q=d.sluice,p=g.p;if(p.strikeTimer>0&&!p.strikeHit.has('super-sluice')&&Core.overlap(...Core.strikeBox(p),q.c*8-2,q.r*8-2,12,12)){p.strikeHit.add('super-sluice');const i=q.pool[1]*g.room.cols+q.pool[0],pool=g.water?.pools[g.water.body[i]];if(pool){root.BladefallPrecisionWater.thaw(g,pool);for(const k of pool.cells){g.water.cells[k]=0;g.water.body[k]=-1;}pool.cells=[];a.stage=1;Core.emit(g,'sluice-drain',{x:q.c*8+4,y:q.r*8+4});}}}
 if(d.kind==='marksman'&&g.mk){const q=d.stations[a.stage];if(q&&g.mk.hits>a.stage&&g.p.onGround&&Math.abs(g.p.y+g.p.h-q.r*8)<2&&g.p.x+g.p.w>q.c*8&&g.p.x<(q.c+q.w)*8){const e=g.ents.find(e=>e.type==='deck');if(e){e.ox=e.x;e.oy=e.y;e.dx=q.to[0]*8-e.x;e.dy=q.to[1]*8-e.y;e.clock=0;e.phase=0;e.period=480;a.stage++;Core.emit(g,'carrier-reroute',{x:q.c*8,y:q.r*8,stage:a.stage});}}}
 if(d.kind==='sentinel'&&g.sentinel?.done&&a.stage===0){
  const s=g.sentinel,e=s.body,q=d.shelf;
  if(g.players?.some(p=>p.state!=='dead'&&p.state!=='respawn'&&Core.overlap(p.x,p.y,p.w,p.h,q.c*8,q.r*8,q.w*8,8)))return;
  g.ents.push({id:'old-hammer-rest',type:'superRest',dev:true,solid:true,x:q.c*8,y:q.r*8,w:q.w*8,h:8,remX:0,remY:0});
  a.stage=1;Object.assign(s,d.second,{done:false,ridden:false,t:0});s.land=d.second.floor*8-40;e.solid=false;e.y=-48;
  Core.emit(g,'sentinel-relocate',{x:s.c*8,y:s.r*8});
 }
}
function after(g){if(!g.players)settle(g);}
function afterPlayers(g){const p=g.p,a=g.coopActor;try{for(const [i,k]of g.players.entries()){g.p=k;g.coopActor=i;settle(g);}}finally{g.p=p;g.coopActor=a;}}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'superrooms-fractured',reset,after,afterPlayers});
})(typeof window!=='undefined'?window:globalThis);
