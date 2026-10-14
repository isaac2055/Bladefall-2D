/* Opt-in Warden support: a native wound loosens one physical hinged floor.
   A visible countdown then drops that same floor into its wall pose. The knight
   may cut the hub first. Native Warden rushes, falls, wounds and victory remain
   authoritative; no player repositioning or completion counters are introduced. */
(function(root){'use strict';
const C=()=>root.BladefallPrecisionCore;
function reset(g){const d=g.room.def.wardenFloor;g.wardenFloor=d?{...d,state:'held',left:d.fuse||80}:null;}
function settle(g){
 const s=g.wardenFloor,w=g.warden;if(!s||!w||!(g.players||[g.p]).some(p=>p.state!=='dead'&&p.state!=='respawn'))return;
 const a=g.ents.find(e=>e.type==='hingeArm'&&e.label===s.hinge);if(!a)return;
 if(a.dir!=='right'){s.state='released';return;}
 if(s.state==='held'&&w.wounds>0){s.state='cracking';C().emit(g,'warden-support-crack',{x:a.pivotX+4,y:a.pivotY+4});}
 if(s.state!=='cracking'||--s.left>0)return;
 const H=root.BladefallPrecisionHinge,b=H.pose(a,'down');
 if(H.obstruction(g,a,b))return; // An occupied destination waits visibly; it never crushes the knight.
 Object.assign(a,b);a.dir=a.state='down';a.turns++;a.pulse=16;a.jam=0;a.jamReason=null;s.state='released';
 for(const p of g.players||[g.p])if(p.onGround&&!C().onGroundCheck(g,p))p.onGround=false;
 C().emit(g,'hinge-turn',{x:a.pivotX+4,y:a.pivotY+4,label:a.label,from:'right',dir:'down',cause:'warden-support'});
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'superrooms-fractured9',reset,after:g=>{if(!g.players)settle(g);},afterPlayers:settle});
})(typeof window!=='undefined'?window:globalThis);
