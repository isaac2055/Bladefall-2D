/* The Mile Sentinel has no blade solution. Ride its committed hammer or stunned shoulders into the bell.
   Opt-in fields on room.sentinel (7.280; without them it plays exactly as before):
   - hold: frames the committed hammer / risen shoulders stay before the Sentinel takes them back (default 170).
     Riding counts only while they stand: once they are taken back, the bell needs a new ride.
   - range:[x0,x1]: where the hammer may aim (px, the knight's centre is clamped into it; default [28,260]).
   - floor: the row the hammer lands on (default 18).
   - from, to: where the rush starts and stops (px, default 288 → 160); y: the rush's top (default 100).
   - period: frames from one attack to the next (default 240). */
(function(root){'use strict';const C=()=>root.BladefallPrecisionCore;
function reset(g){const d=g.room.def.sentinel;g.sentinel=d?{...d,t:0,done:false,ridden:false,target:80}:null;if(!d)return;
 const s=g.sentinel;s.hold=d.hold??170;s.range=d.range||[28,260];s.land=(d.floor??18)*8-40;s.from=d.from??288;s.to=d.to??160;s.ry=d.y??100;s.period=d.period??240;
 const e={type:'sentinelStep',dev:true,solid:false,id:'sentinel-step',x:d.mode==='rush'?s.from:68,y:d.mode==='rush'?s.ry:-48,w:28,h:40,remX:0,remY:0};g.ents.push(e);s.body=e;for(const q of g.ents)if(q.type==='gate')q.devKeyed=true;
}
function before(g){const s=g.sentinel;if(!s||s.done||!g.awake)return;const Core=C(),e=s.body;s.t++;const t=s.t%s.period,end=30+s.hold;
 if(s.mode==='hammer'){
  if(t<30)s.target=Math.max(s.range[0],Math.min(s.range[1],g.p.x+4));
  if(t===30){e.x=Math.round(s.target-14);e.y=-48;e.solid=true;s.ridden=false;}
  if(t>=30&&t<60&&e.y<s.land){const dy=Math.min(7,s.land-e.y);if(Core.overlap(g.p.x,g.p.y,g.p.w,g.p.h,e.x,e.y+dy,e.w,e.h))Core.kill(g,g.p,'sentinel-hammer');Core.moveSolid(g,e,0,dy);}
  if(t===end){e.solid=false;e.y=-48;s.ridden=false;}
 }else{
  const dir=s.to<s.from?-1:1;
  if(t===30){e.x=s.from;e.y=s.ry;e.h=40;e.solid=true;s.ridden=false;}
  if(t>=30&&t<100&&(dir<0?e.x>s.to:e.x<s.to)){const dx=dir*Math.min(5,Math.abs(e.x-s.to));if(Core.overlap(g.p.x,g.p.y,g.p.w,g.p.h,e.x+dx,e.y,e.w,e.h))Core.kill(g,g.p,'sentinel-rush');Core.moveSolid(g,e,dx,0);}
  if(e.x===s.to&&e.y===s.ry&&t<end){Core.moveSolid(g,e,0,-12);e.h=52;Core.emit(g,'sentinel-stun',{x:e.x+14,y:e.y});}
  if(t===end){e.solid=false;e.x=s.from;e.y=s.ry;e.h=40;s.ridden=false;}
 }
}
function after(g){const s=g.sentinel,p=g.p;if(!s||s.done||p.state==='dead'||p.state==='respawn')return;const e=s.body,Core=C();
 if(e.solid&&p.onGround&&p.y+p.h===e.y&&p.x+p.w>e.x&&p.x<e.x+e.w){if(!s.ridden)Core.emit(g,'sentinel-ride',{x:p.x+4,y:p.y});s.ridden=true;}
 if(s.ridden&&Core.overlap(p.x,p.y,p.w,p.h,s.c*8-2,s.r*8-2,12,12)){s.done=true;Core.emit(g,'sentinel-bell',{x:s.c*8+4,y:s.r*8});}
 const t=s.t%s.period;if(s.sweep&&t>=140&&t<150&&Core.overlap(p.x,p.y,p.w,p.h,80,134,180,10))Core.kill(g,p,'sentinel-chain');
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rbr-f-outskirts',reset,before,after,gateHold:g=>!!(g.sentinel&&!g.sentinel.done)});
})(typeof window!=='undefined'?window:globalThis);
