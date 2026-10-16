import {script} from '../plan-kit.mjs';
// The Landing Shores, all on the Chainhook and the shore's own clocks:
//  - the tidal gut (1400-2380): hook gut-a (1680,450) from the strand's lip, then gut-b (2130,470), jump and dash
//    to the far lip;
//  - the stranded hull (3150-3500, deck 600): hook hull-a (3020,470) from the strand, then hull-b (3230,690);
//  - the tide flats (3950-7350; the clock starts at x 3770): run the low-water sand to the refuge's foot, hook the
//    refuge ring (5660,380) onto its dry deck (250), wait for high water and hop the two floats (6110, 6470) up to
//    the King's jetty (6640, 300);
//  - the King's landing: the three Belled must be beaten before the sun arch (8350) opens;
//  - the Bell Cliff: past 8700 the bell gate (10000) shuts until the hoist's cap is slammed: hook the bell rig ring
//    (9260,570) and come down (down in the air) on the cleat (9260,470);
//  - the cliff ring (10480,560) and the lip ring (10800,800) up onto the headland (720);
//  - the Colony Gate: the overseer Sunguard (12000) must fall. His shield faces west, so jump him and strike his
//    back (the first blow cracks his bell, which sends the Belled off), then lift the bar (12374) with Up.
const HOOK=`const A=G.actTwo;const hookTo=(id)=>{press({hook:true});for(let i=0;i<60;i++){tas.stepFrames(1,{});if(G.p.actHook&&G.p.actHook.state==='hang'&&G.p.actHook.ring.actId===id)return true;}return false;};`;
export default {steps:[
  script('gut',HOOK+`go(1390,600);wait(3);if(!hookTo('ring-gut-a')||!hookTo('ring-gut-b'))return false;
   for(let i=0;i<120&&!(G.p.onGround&&G.p.x>2380)&&!G.p.dead;i++)tas.stepFrames(1,{right:true,jump:i<14,dodge:i===16});
   return G.p.onGround&&G.p.x>2380?{x:G.p.x}:false;`),
  script('hull',HOOK+`go(3000,600);wait(3);if(!hookTo('ring-hull-a')||!hookTo('ring-hull-b'))return false;
   for(let i=0;i<120&&!G.p.onGround&&!G.p.dead;i++)tas.stepFrames(1,{right:true,jump:i<14});
   return G.p.onGround&&Math.abs(G.p.y-600)<2?{x:G.p.x}:false;`),
  script('flats',HOOK+`go(5490,2000);if(G.p.dead||!hookTo('ring-refuge'))return false;
   for(let i=0;i<150&&!G.p.onGround;i++)wait(1);
   if(Math.abs(G.p.y-250)>2)return false;
   go(5800,200);for(let i=0;i<1800&&A.water<168;i++)wait(1);
   const hop=(edge,x1,x2,y)=>{for(let i=0;i<120&&G.p.onGround&&Math.abs(G.p.x-edge)>6;i++)tas.stepFrames(1,{right:G.p.x<edge,left:G.p.x>edge});
    for(let i=0;i<150&&!(G.p.onGround&&G.p.x>x1&&G.p.x<x2&&Math.abs(G.p.y-y)<12&&i>5)&&!G.p.dead;i++){const inp=steer((x1+x2)/2);inp.jump=i<12||(i>=24&&i<36);tas.stepFrames(1,inp);}
    return G.p.onGround&&G.p.x>x1&&G.p.x<x2&&Math.abs(G.p.y-y)<12;};
   const f=G.obstacles.filter(o=>o.actFloat);
   if(!hop(5815,6020,6200,f[0].y)||!hop(6205,6380,6560,f[1].y)||!hop(6565,6680,6800,300))return false;
   return {x:G.p.x,y:G.p.y,hp:G.p.hp};`),
  {reach:[7300,300],xr:40,yr:10},
  script('landing',HOOK+`const L=A.enc.landing;go(7300,300);
   for(let i=0;i<3000&&!G.p.dead&&L.st!=='done';i++){const al=L.foes.filter(e=>!e.dead&&e.st!=='flee');if(!al.length){wait(1);continue;}
    const e=al.reduce((a,b)=>Math.abs(b.x-G.p.x)<Math.abs(a.x-G.p.x)?b:a),dx=e.x-G.p.x,inp={};
    if(Math.abs(dx)>60){inp.right=dx>0;inp.left=dx<0;}else{if(Math.sign(dx)!==G.p.face){inp.right=dx>0;inp.left=dx<0;}inp.attack=i%8===0;}
    tas.stepFrames(1,inp);}
   wait(20);return L.st==='done'?{x:G.p.x,hp:G.p.hp}:false;`),
  script('bell-cliff',HOOK+`const C=A.enc.cliff;go(8760,800);wait(2);if(C.st!=='live')return false;
   go(9230,600);wait(2);if(!hookTo('ring-bell-rig'))return false;
   for(let i=0;i<40&&C.st!=='done';i++)tas.stepFrames(1,{down:true});
   wait(30);return C.st==='done'?{x:G.p.x,y:G.p.y}:false;`),
  script('headland',HOOK+`for(let i=0;i<60&&!G.p.onGround;i++)wait(1);go(10400,900);wait(2);
   if(!hookTo('ring-cliff')||!hookTo('ring-lip'))return false;
   for(let i=0;i<150&&!G.p.onGround;i++)tas.stepFrames(1,{right:true});
   return G.p.onGround&&Math.abs(G.p.y-720)<2?{x:G.p.x}:false;`),
  {reach:[11200,720],xr:40,yr:10},
  script('colony-gate',HOOK+`const S=A.enc.gate,o=S.overseer;go(11200,300);let j=0,dir=0;
   for(let i=0;i<3000&&!G.p.dead&&!o.dead;i++){
    const dx=o.x-G.p.x,behind=(Math.sign(G.p.x-o.x)||1)===-o.shieldFace,inp={};
    if(j>0){j++;inp.jump=j<13;const past=Math.sign(G.p.x-o.x)===dir&&Math.abs(dx)>16;
     if(!past){inp.right=dir>0;inp.left=dir<0;}else{inp.right=dx>0&&G.p.face<0;inp.left=dx<0&&G.p.face>0;if(behind&&Math.abs(dx)<60)inp.attack=i%6===0;}
     if(j>8&&G.p.onGround)j=0;}
    else if(behind){if(Math.abs(dx)>44){inp.right=dx>0;inp.left=dx<0;}else{if(Math.sign(dx)!==G.p.face){inp.right=dx>0;inp.left=dx<0;}inp.attack=i%6===0;}}
    else{if(Math.abs(dx)>150||G.p.onGround){inp.right=dx>0;inp.left=dx<0;}if(Math.abs(dx)<75&&G.p.onGround){j=1;dir=Math.sign(dx);inp.jump=true;}}
    tas.stepFrames(1,inp);}
   wait(10);if(S.st!=='done')return false;
   go(12360,600);wait(2);for(let k=0;k<5&&!A.gateOpen;k++){press({up:true,interact:true});wait(8);}
   return A.gateOpen?{x:G.p.x,hp:G.p.hp}:false;`),
 ]};
