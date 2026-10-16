import {script} from '../plan-kit.mjs';
// Black Woods: the Oathblade is root-bound until its counterweight drops (stand on the top oath step), and the
// pits from 4480 on are crossed by up-striking the resin blades, which takes the blade.
export default {steps:[{reach:[3425,205],xr:40,yr:30},
  script('oathblade',`for(let i=0;i<240&&!(G.p.onGround&&Math.abs(G.p.x-3640)<20&&Math.abs(G.p.y-40)<2);i++)tas.stepFrames(1,steer(3640));
   wait(4);press({pickup:true});wait(30);return hasCapability('weapon')?{x:G.p.x,y:G.p.y}:false;`)]};
