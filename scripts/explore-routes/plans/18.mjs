import {script} from '../plan-kit.mjs';
// The Colony: the yard gate (7600) hangs on the dry well's counterweight. Hook the pier ring (6440,300) and the
// deck ring (6560,560) up onto the King's conduit (y 440), jump the Sunguard who walks it and slam (down in the
// air) on the tap at 7150; the water sinks the bucket and lifts the gate. In the yard the road gate (10300) opens
// when the ringer on the bell tower (9800, top 380) is silenced: hook the tower ring (9830,470) from the ground,
// which hangs you behind his shield, and strike him.
const HOOK=`const hookTo=(id)=>{press({hook:true});for(let i=0;i<60;i++){tas.stepFrames(1,{});if(G.p.actHook&&G.p.actHook.state==='hang'&&G.p.actHook.ring.actId===id)return true;}return false;};`;
export default {steps:[{reach:[6380,0],xr:30,yr:10},
  script('tap',HOOK+`go(6380,4000);wait(6);if(!hookTo('ring-pier')||!hookTo('ring-deck'))return false;
   for(let tries=0;tries<4&&!G.actTwo.tapOpen&&!G.p.dead;tries++){let j=0;
    for(let i=0;i<300&&!G.p.dead&&!G.actTwo.tapOpen;i++){const inp=steer(7150);
     if(G.p.onGround&&G.p.y>=439&&j===0)j=1;
     if(j>0){j++;inp.jump=j<16||(j>26&&j<40);}
     if(!G.p.onGround&&Math.abs(7150-G.p.x)<25&&G.p.vy>0&&G.p.y>450)inp.down=true;
     tas.stepFrames(1,inp);if(j>5&&G.p.onGround)j=0;}}
   for(let i=0;i<300&&!G.obstacles.some(o=>o.actBars==='yard-gate'&&o.gone);i++)wait(1);return G.actTwo.tapOpen&&G.obstacles.some(o=>o.actBars==='yard-gate'&&o.gone)?{x:G.p.x,y:G.p.y}:false;`),
  script('ringer',HOOK+`const Y=G.actTwo.enc.yard;
   for(let i=0;i<1500&&G.p.x<9826&&!G.p.dead;i++){const inp={right:true},near=G.enemies.some(e=>!e.dead&&e.actFoe==='belled'&&e.x>G.p.x&&e.x-G.p.x<200);
    if(near&&(G.p.onGround||(G.p.vy>-50&&G.p.jumps<2)))inp.jump=true;tas.stepFrames(1,inp);}
   go(9830,200);wait(2);if(!hookTo('ring-tower'))return false;
   for(let i=0;i<120&&!Y.silenced&&!G.p.dead;i++)tas.stepFrames(1,{left:i<2,attack:i%12===2});
   wait(20);return Y.silenced&&G.obstacles.some(o=>o.actBars==='road-gate'&&o.gone)?{x:G.p.x,hp:G.p.hp}:false;`),
 ]};
