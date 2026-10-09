/* Precision Core — Step relay (room-bank experiment, 7.286).
   stepRelays:[{id:'A',duration:36,platforms:[{c,r,w,h:1,to:[dx,dy]}]}]
   A genuine landing toggles every platform in that group between its two authored positions.
   Riding, walking onto one from an adjacent floor, grabbing its side and dashing into its side do not
   switch it. A fresh landing during travel reverses it. No dash or new input is spent.
   All mutable state lives on the player and entities, so replay snapshots retain it. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore,TILE=8;
const SK=Object.freeze({duration:36,pulse:18});
const relays=g=>g.ents.filter(e=>e.type==='stepRelay');
const feetOn=(p,e)=>p.y+p.h===e.y&&p.x<e.x+e.w&&p.x+p.w>e.x;
function reset(g){
 const defs=g.room.def.stepRelays||[];
 defs.forEach((d,gi)=>(d.platforms||[]).forEach((s,i)=>{
  const duration=Math.max(6,Math.round(d.duration||SK.duration));
  g.ents.push({type:'stepRelay',dev:true,solid:true,id:'sr'+gi+':'+i,group:gi,label:String(d.id||String.fromCharCode(65+gi)),
   x:s.c*TILE,y:s.r*TILE,w:s.w*TILE,h:(s.h||1)*TILE,ox:s.c*TILE,oy:s.r*TILE,
   relayDX:(s.to?.[0]||0)*TILE,relayDY:(s.to?.[1]||0)*TILE,duration,u:0,target:0,pulse:0,triggers:0,remX:0,remY:0});
 }));
 if(defs.length)g.p.stepRelayAirborne=!C().onGroundCheck(g,g.p);
}
function before(g){
 const Core=C(),p=g.p;
 for(const e of relays(g)){
  if(e.pulse>0)e.pulse--;
  if(e.u===e.target)continue;
  e.u=e.u<e.target?Math.min(e.target,e.u+1/e.duration):Math.max(e.target,e.u-1/e.duration);
  if(Math.abs(e.u-e.target)<1e-8)e.u=e.target;
  const k=e.u*e.u*(3-2*e.u),nx=e.ox+e.relayDX*k,ny=e.oy+e.relayDY*k;
  // Core normally refreshes onGround after moving solids. On the first frame after a landing its old
  // value may still be false: recognize exact foot contact while carrying, then restore that old flag
  // so the normal landing/refill logic still sees the transition. Side grabs keep Core's own behavior.
  const oldGround=p.onGround;
  if(feetOn(p,e)&&p.vy>=0)p.onGround=true;
  Core.moveSolid(g,e,nx-(e.x+e.remX),ny-(e.y+e.remY));
  p.onGround=oldGround;
 }
}
function after(g){
 const es=relays(g);if(!es.length)return;
 const p=g.p;if(p.state==='dead'||p.state==='respawn')return;
 const grounded=C().onGroundCheck(g,p);
 if(!grounded){p.stepRelayAirborne=true;return;}
 const landed=p.stepRelayAirborne&&p.vy>=0&&p.state!=='hook'&&p.state!=='ride';
 p.stepRelayAirborne=false;
 if(!landed)return;
 const hit=es.find(e=>feetOn(p,e));if(!hit)return;
 const target=1-hit.target;
 for(const e of es)if(e.group===hit.group){e.target=target;e.pulse=SK.pulse;e.triggers++;}
 C().emit(g,'step-relay',{x:p.x+p.w/2,y:p.y+p.h,group:hit.group,label:hit.label,target});
}
function mirror(g){
 // Gravity's generic body mirror already reflects y, oy and remY; only this private displacement needs work.
 for(const e of relays(g))e.relayDY=-e.relayDY;
 // Inverting while standing is not a landing. Wait for a real airborne phase under the new gravity.
 if(relays(g).length)g.p.stepRelayAirborne=false;
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'step-relay',reset,before,after,mirror});
root.BladefallPrecisionStepRelay=Object.freeze({SK,relays});
})(typeof window!=='undefined'?window:globalThis);
