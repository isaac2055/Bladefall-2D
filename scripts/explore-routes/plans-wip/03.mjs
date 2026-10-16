import {script} from '../plan-kit.mjs';
// Updrafts: commission the Aerie Pack (strike the mooring brake on the sanctum, take the harness), light the Choir
// (strike the cinder vessel, then the high damper; the heat reaches Gate I in 3.2 s).
export default {steps:[{reach:[3150,340],xr:40,yr:4},
  script('aerie-pack',`const rel=G.obstacles.find(o=>o.aeriePackRelease),pk=G.pickups.find(p=>p.jetpack);
   for(let i=0;i<60&&!(rel.timer>0);i++)tas.stepFrames(1,{...steer(3150),attack:i%20===0});
   for(let i=0;i<120&&!G.p.hasJetpack;i++)tas.stepFrames(1,{...steer(pk.x),pickup:i%10===5});
   return G.p.hasJetpack&&circuitOpen('aerie-pack-owned')?{x:G.p.x}:false;`),
  {reach:[7240,80],xr:40,yr:4},
  script('cinder',`const v=G.obstacles.find(o=>o.cinderVessel);
   for(let i=0;i<60&&!(v.timer>0);i++)tas.stepFrames(1,{...steer(7240),attack:i%20===0});
   return circuitOpen('choir-kindled')?{x:G.p.x}:false;`),
 ]};
