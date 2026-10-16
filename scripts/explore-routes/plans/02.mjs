import {script} from '../plan-kit.mjs';
// Chainwake / the Drop Yard: the door at 5360 opens when Oren's causeway repair is done. Strike the yard catch
// (Up, on the 130 step at 3420), stand on the plate at 4050 until the swinging hoist is over it so the mass
// drops onto the plate (then step clear), clear the grunt by the rise and strike the rise catch (4930, 105).
// The Counterweight Rise: ride the freight lift (8520→8790) and jump from it while it is lit (charged); the
// launch carries the knight across the void to the landing at 9020–9210, 300 up.
export default {steps:[
 script('yard catch',`go(3100);wait(5);
  for(let i=0;i<60;i++){tas.stepFrames(1,{right:G.p.x<3200,jump:i<14});if(i>30&&G.p.onGround)break;}
  go(3250);for(let i=0;i<70;i++){tas.stepFrames(1,{...steer(3400),jump:i<16});if(i>30&&G.p.onGround)break;}
  go(3420,60);wait(3);press({interact:true,up:true});wait(6);
  return G.obstacles.find(o=>o.repairCatch==='causeway-catch-yard').struck?{x:G.p.x}:false;`),
 script('hoist',`go(3700,400);wait(2);tas.saveState('hoist');
  for(let w=0;w<300;w+=10){tas.restoreState('hoist');wait(w);const trap=G.obstacles.find(o=>o.type==='trap'&&o.targetCircuit==='drop-yard');
   for(let t=0;t<400&&trap.state==='idle';t++)tas.stepFrames(1,steer(4050));
   for(let i=0;i<45;i++)tas.stepFrames(1,{right:true});
   for(let i=0;i<120&&!circuitOpen('drop-yard');i++)tas.stepFrames(1,{});
   if(circuitOpen('drop-yard')&&!G.p.dead)return {x:G.p.x,wait:w};}
  return false;`),
 script('rise catch',`go(4500,400);fight();go(4600,200);wait(3);
  for(let i=0;i<70;i++){tas.stepFrames(1,{...steer(4700),jump:i<14});if(i>20&&G.p.onGround)break;}
  go(4745,60);for(let i=0;i<70;i++){tas.stepFrames(1,{...steer(4900),jump:i<16});if(i>20&&G.p.onGround)break;}
  go(4930,60);wait(3);press({interact:true,up:true});wait(6);
  return G.causewayRepair?.completed?{x:G.p.x}:false;`),
 {reach:[8250,0],xr:60,yr:10},
 script('freight',`fight();go(8300,200);for(let i=0;i<60;i++){tas.stepFrames(1,{...steer(8400),jump:i<12});if(i>20&&G.p.onGround)break;}
  go(8440,100);tas.saveState('freight');let c;
  const onC=()=>G.p.onGround&&Math.abs(G.p.y-c.y)<6&&Math.abs(G.p.x-c.x)<c.w/2;
  for(const lead of [0,2,4,6,8,10,12,14])for(const hold of [true,false]){tas.restoreState('freight');
   c=G.obstacles.find(o=>o.earlyCarrier&&o.homeX===8520);   // a restore rebuilds the objects
   for(let i=0;i<200&&!(Math.abs(c.x-c.homeX)<1&&Math.abs(c.y-c.homeY)<1);i++)tas.stepFrames(1,{});
   for(let i=0;i<40&&!onC();i++)tas.stepFrames(1,steer(c.x));
   for(let i=0;i<120&&!c.charged&&onC();i++)tas.stepFrames(1,steer(c.x+20));
   wait(lead);
   for(let i=0;i<120;i++){tas.stepFrames(1,{right:hold||i>8,jump:i<16});if(i>10&&G.p.onGround)break;}
   if(G.p.onGround&&G.p.y>=299&&G.p.x>9000&&!G.p.dead)return {x:G.p.x,lead,hold};}
  return false;`),
]};
