import {script} from '../plan-kit.mjs';
// Frostfell (after scripts/frostfell-route.mjs): the warden's gate, the thermal circuit (a portal on the wall
// at 5500 carries the thermal to its receiver), the frost memory (double jump), then the finale's nineteen
// landings up to the summit. Its way on is the summit, not a seam.
// Thaw rafts move and ice spikes cycle, so a jump may need to wait a beat as well as aim.
export default {finish:14400,finishNote:'Frostfell’s summit · its road on opens from the White Court',steps:[
  script('opening',`go(2240,2000,i=>({attack:i%30===0,counter:i%45===0}));press({interact:true});wait(1);go(4420,2000,i=>({attack:i%30===0,counter:i%45===0}));wait(180);go(5180);wait(40);return {x:G.p.x};`),
  script('thermal',`let placed=false;for(let i=0;i<600&&!G.p.dead;i++){const t=G.p.onWall&&G.p.wallObj?.x===5500&&G.p.y>=60&&G.p.y<=125;tas.stepFrames(1,{right:true,jump:i%45<22,portal:t});if(t&&G.cratePortals.length){placed=true;break;}}
   wait(360);return placed&&circuitOpen('frost-thermal')?{x:G.p.x}:false;`),
  script('memory',`press({left:true},18);wait(3);for(let i=0;i<1000&&G.p.x<7240&&!G.p.dead;i++)tas.stepFrames(1,{right:true,jump:G.p.x<5650&&i%45<24});
   press({left:true},10);wait(35);press({interact:true});wait(1);return hasCapability('double-jump')?{x:G.p.x}:false;`),
  script('finale',`for(let i=0;i<700&&G.p.x<8835;i++)tas.stepFrames(1,{right:true});wait(30);
   const targets=G.obstacles.filter(o=>Number.isInteger(o.frostFinaleLanding)).sort((a,b)=>a.frostFinaleLanding-b.frostFinaleLanding);
   let previous={x:8840,w:320,y:0},n=0;
   for(const target of targets){tas.saveState('ff-from');let solved=false;
    search:for(const pause of [0,25,50,75,100,130])for(const inset of [20,40,5,65])for(const second of [22,18,26,30,34]){
     tas.restoreState('ff-from');if(pause)wait(pause);const blood=G.p.blood,edge=previous.x+previous.w/2-inset;
     for(let i=0;i<180&&G.p.onGround&&Math.abs(G.p.x-edge)>7;i++)tas.stepFrames(1,{right:G.p.x<edge,left:G.p.x>edge+8});
     for(let i=0;i<120;i++){const aim=target.frostFinaleLanding===19?14100:target.x-(target.w>200?55:10);
      tas.stepFrames(1,{...steer(aim),jump:i<14||(i>=second&&i<second+24)});
      if(G.p.dead||G.p.blood<blood||G.p.y<previous.y-400)break;
      if(i>10&&G.p.onGround&&Math.abs(G.p.y-target.y)<.1&&Math.abs(G.p.x-target.x)<target.w/2){solved=true;break search;}}}
    if(!solved){tas.restoreState('ff-from');return {failedAt:target.frostFinaleLanding,landed:n};}previous=target;n++;}
   for(let i=0;i<250&&G.p.x<14400;i++)tas.stepFrames(1,{right:true});wait(10);return {landed:n,x:G.p.x,y:G.p.y};`),
 ]};
