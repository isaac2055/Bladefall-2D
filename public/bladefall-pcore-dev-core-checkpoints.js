/* Core save points: opt-in, in one continuous room. Terrain resets after death; the earned anchor survives. */
(function(root){'use strict';const C=()=>root.BladefallPrecisionCore;
function reset(g){const points=g.room.def.coreCheckpoints;if(!points?.length){g.coreRun=null;return;}
 if(g.coreRun?.room!==g.room.id)g.coreRun={room:g.room.id,index:-1};
 const q=points[g.coreRun.index];if(q){g.p.x=q.c*8;g.p.y=q.r*8+8-g.p.h;g.p.facing=q.facing||1;}
}
function after(g){const points=g.room.def.coreCheckpoints,p=g.p;if(!points||p.state==='dead'||p.state==='respawn'||!p.onGround)return;
 for(const [i,q]of points.entries())if(i>g.coreRun.index&&Math.abs(p.y+p.h-(q.r+1)*8)<1&&p.x+p.w>q.c*8-(q.width||40)/2&&p.x<q.c*8+(q.width||40)/2){
  g.coreRun.index=i;if(g.resinWind)g.resinWind.t=0;if(g.rootLash)g.rootLash.t=0;
  C().emit(g,'core-checkpoint',{room:g.room.id,index:i,x:q.c*8+4,y:(q.r+1)*8,part:i+2,name:q.name||'Save point'});
 }
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'core-checkpoints',reset,after});
})(globalThis);
