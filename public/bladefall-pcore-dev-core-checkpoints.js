/* Core save points: opt-in, in one continuous room. Terrain resets after death; the earned anchor survives. */
(function(root){'use strict';const C=()=>root.BladefallPrecisionCore;
function reset(g){const points=g.room.def.coreCheckpoints;if(!points?.length){g.coreRun=null;return;}
 if(g.coreRun?.room!==g.room.id)g.coreRun={room:g.room.id,index:-1};
 const q=points[g.coreRun.index];if(q){g.p.x=q.c*8;g.p.y=q.r*8+8-g.p.h;g.p.facing=q.facing||1;}
}
function after(g){const points=g.room.def.coreCheckpoints,p=g.p;if(!points||g.flipped||p.state==='dead'||p.state==='respawn'||!p.onGround)return;
 for(const [i,q]of points.entries())if(i>g.coreRun.index&&Math.abs(p.y+p.h-(q.r+1)*8)<1&&p.x+p.w>q.c*8-(q.width||40)/2&&p.x<q.c*8+(q.width||40)/2){
  g.coreRun.index=i;g.workshopHearth=null;
  if(q.clearEcho){const owners=g.players||[g],echoes=new Set(owners.map(owner=>owner.echo).filter(Boolean));g.ents=g.ents.filter(e=>!echoes.has(e));for(const owner of owners)owner.echo=null;}
  if(q.resetClocks!==false){if(g.resinWind)g.resinWind.t=0;if(g.rootLash)g.rootLash.t=0;}
  C().emit(g,'core-checkpoint',{room:g.room.id,index:i,x:q.c*8+4,y:(q.r+1)*8,part:i+2,name:q.name||'Save point'});
 }
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'core-checkpoints',reset,after,afterPlayer:after});
// Isolated workshop previews do not run the campaign view's hearth tracker.
function hearthReset(g){
 if(!g.workshop&&!g.players)return;
 const saved=g.workshopHearth,q=saved?.room===g.room.id&&g.room.def.hearths?.[saved.index];
 if(q){g.p.x=q.c*8;g.p.y=q.r*8+8-g.p.h;}
}
function hearthAfter(g){
 if(!g.workshop&&!g.players)return;
 const points=g.room.def.hearths;if(!points?.length)return;
 if(g.workshopHearth?.room!==g.room.id)g.workshopHearth={room:g.room.id,index:-1};
 const players=g.players||[g.p];
 for(const [i,h]of points.entries())if(i>g.workshopHearth.index){
  const player=players.findIndex(p=>p.state==='normal'&&Math.abs(p.x+4-(h.c*8+4))<12&&p.y+11<=h.r*8+10&&p.y+11>=h.r*8-32);
  if(player>=0){g.workshopHearth.index=i;C().emit(g,'hearth-checkpoint',{index:i,x:h.c*8,y:h.r*8,...(g.players?{player}:{})});}
 }
}
root.BladefallPrecisionDevices.push({name:'workshop-hearths',reset:hearthReset,after:g=>{if(!g.players)hearthAfter(g);},afterPlayers:hearthAfter});
})(globalThis);
