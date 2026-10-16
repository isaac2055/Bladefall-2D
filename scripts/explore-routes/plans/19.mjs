import {script} from '../plan-kit.mjs';
// The Path to the Palace: the Hydra Overlook (5600-6900) is crossed on the Chainhook. From the lip, hook the three
// mast rings o1 (5850,1000), o2 (6250,1050), o3 (6650,1000); jump out of the last hang and dash to the far lip.
// The Sun Gate (9600) opens when its windlass (9250) is slammed (down in the air) three times; slamming from
// x~9214 stays out of the Sunguard's reach (he holds 9370), so he never swings.
const HOOK=`const hookTo=(id)=>{press({hook:true});for(let i=0;i<60;i++){tas.stepFrames(1,{});if(G.p.actHook&&G.p.actHook.state==='hang'&&G.p.actHook.ring.actId===id)return true;}return false;};`;
export default {steps:[{reach:[5560,770],xr:40,yr:10},
  script('overlook',HOOK+`go(5580,600);wait(3);
   for(const id of ['ring-o1','ring-o2','ring-o3'])if(!hookTo(id))return false;
   for(let i=0;i<120&&!(G.p.onGround&&G.p.x>6900)&&!G.p.dead;i++)tas.stepFrames(1,{right:true,jump:i<14,dodge:i===16});
   return G.p.onGround&&G.p.x>6900&&Math.abs(G.p.y-770)<2?{x:G.p.x}:false;`),
  {reach:[9150,770],xr:40,yr:10},
  script('sun-gate',`const A=G.actTwo,X=9214;go(X,600);
   for(let n=0;n<10&&!A.gateOpen&&!G.p.dead;n++){const lift=A.gateLift;
    for(let i=0;i<120&&!(G.p.onGround&&Math.abs(G.p.x-X)<6&&A.windlassT<=0&&!(G.p.slamCd>0));i++)tas.stepFrames(1,G.p.onGround?{right:G.p.x<X-5,left:G.p.x>X+5}:{});
    for(let i=0;i<90&&A.gateLift===lift&&!G.p.dead;i++){tas.stepFrames(1,{jump:i<12,down:i>12&&G.p.vy>0&&!G.p.onGround});if(i>14&&G.p.onGround)break;}}
   wait(30);return A.gateOpen?{x:G.p.x,hp:G.p.hp}:false;`),
 ]};
