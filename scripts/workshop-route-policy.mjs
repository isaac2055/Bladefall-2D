/* Legal keys only after the public room-selection entry. Used to tune, then independently replay. */
export function workshopRoute(index){
 const originalIndex=index;index=({17:16,18:10,19:12,20:13,21:14,22:15})[index]??index;
 let a=G.celeste,r=a.rooms[originalIndex];const base=r.x,t=__BF.tas,tape=[],log=[];let frames=0;
 const x=()=>G.p.x-base,y=()=>G.p.y;
 const snap=label=>log.push({label,x:Math.round(x()),y:Math.round(y()),vx:Math.round(G.p.vx),vy:Math.round(G.p.vy),ground:G.p.onGround,lab:{...a.lab},extra:{...a.workshop},candidate:{...a.candidates,trail:undefined},flight:a.flight?{t:a.flight.t,x:a.flight.x-base,y:a.flight.y}:null,flightReceipts:a.flightReceipts,contacts:a.contacts,lastContact:a.lastContact});
 function step(k={}){if(a.deaths)throw Error('retry');if(frames++>5200)throw Error('timeout');if(frames%20===0)snap('frame'+frames);const before={x:x(),y:y(),vy:G.p.vy};t.stepFrames(1,k);tape.push(k);if(a.deaths)log.push({deathAt:before,k});}
 function go(n,k={}){for(let i=0;i<n;i++)step(k);}
 function until(f,k={},max=220){for(let i=0;i<max&&!f();i++)step(typeof k==='function'?k():k);if(!f())throw Error('condition');}
 const walk=tx=>until(()=>x()>=tx,{right:true});
 const jump=()=>step({right:true,jump:true});
 const dash=(up=false,down=false)=>step({right:true,up,down,dodge:true});
 const hook=()=>{step({hook:true});until(()=>G.p.actHook?.state==='hang');step({});};
 const finish=()=>{until(()=>a.complete,{right:true},350);};
 function jumpTo(tx,ty,allowDash=true){
  const name='workshop-leap',cache=window.__leapCache||(window.__leapCache={}),key=[originalIndex,tx,ty,Math.round(x()),Math.round(y()),a.candidates?.phase||0].join(':');t.saveState(name);let found=null;
  if(cache[key]){const c=a.contacts||0;for(const k of cache[key])t.stepFrames(1,k);if(!a.deaths&&(a.contacts||0)===c&&G.p.onGround&&Math.abs(G.p.floorPlat?.x-base-tx)<6&&(Math.abs(G.p.y-ty)<6||G.p.floorPlat?.ceBallast||G.p.floorPlat?.ceProgramRail))found=cache[key];}
  if(!found)for(const second of [-1,22,28,34,40,46,16]){for(const when of (allowDash?[14,22,30,38,6]:[-1])){for(const aim of (allowDash?['flat','up']:['flat'])){for(const delay of [0,12,24]){
   t.restoreState(name);a=G.celeste;r=a.rooms[originalIndex];G.obstacles=G.obstacles.filter(o=>o.ceRoom===originalIndex||o.ceRoom==null);const keys=[{}];t.stepFrames(1,{});const beforeContacts=a.contacts||0;
   for(let n=0;n<170&&!a.deaths;n++){
    const dx=base+tx-G.p.x,k={right:n>=delay&&dx>5,left:n>=delay&&dx< -5,jump:second<0?n<18:n<second-1||n>=second&&n<second+20,dodge:n===when,up:aim==='up'&&n>=when&&n<when+7};
    t.stepFrames(1,k);keys.push(k);
    if(n>10&&G.p.onGround&&Math.abs(G.p.floorPlat?.x-base-tx)<6&&(Math.abs(G.p.y-ty)<6||G.p.floorPlat?.ceBallast||G.p.floorPlat?.ceProgramRail)){if((a.contacts||0)===beforeContacts)found=keys;break;}
    if(n>15&&G.p.onGround)break;
   }
   if(found)break;
  }if(found)break;}if(found)break;}if(found)break;}
  t.restoreState(name);a=G.celeste;r=a.rooms[originalIndex];if(!found)throw Error('jumpTo '+tx+','+ty);cache[key]=found;for(const k of found)step(k);until(()=>Math.abs(x()-tx)<8,()=>({right:x()<tx,left:x()>tx}),60);snap('perch '+tx);
 }
 try{
  snap('start');
  if(originalIndex===23){
   walk(265);step({attack:true});const lift=G.obstacles.find(o=>o.ceRoom===originalIndex&&o.ceWeight);until(()=>lift.ceT===1,{},120);go(3);jump();go(39,{right:true});jump();until(()=>x()>1580,{right:true,jump:true},160);until(()=>a.anvilHits===1,{right:true,down:true},90);
   until(()=>x()>2020&&y()>505,{right:true},90);dash();until(()=>!!G.p.seamRide,{right:true});until(()=>!G.p.seamRide,{right:true});hook();jump();until(()=>G.p.onGround&&G.p.floorPlat?.ceHoist,()=>({right:x()<3845,left:x()>3855}),220);snap('second lift');
   step({dodge:true});until(()=>G.p.floorPlat?.ceGold);jump();until(()=>x()>4545,{right:true,jump:true});until(()=>a.anvilHits===2,{right:true,down:true},100);snap('second pound');until(()=>y()>540,{right:true},90);jump();until(()=>x()>4780,{right:true,jump:true},90);dash();until(()=>!!G.p.seamRide,{right:true});until(()=>!G.p.seamRide,{right:true});hook();jump();until(()=>x()>6550,{right:true});dash();until(()=>a.workshop.bells>0,{right:true});finish();
  }else if(originalIndex===25){
   walk(290);jumpTo(580,100);jumpTo(350,220,false);jumpTo(730,380);jumpTo(1120,490);
   step({});jump();go(36,{right:true,jump:true});step({});jump();until(()=>x()>1430,{right:true,jump:true});until(()=>y()<315,()=>({right:x()<1444,left:x()>1456}));step({down:true,attack:true});until(()=>a.used.some(k=>k.includes(':pogo')),{down:true},20);
   until(()=>G.p.onGround&&Math.abs(G.p.floorPlat?.x-base-1530)<5,()=>({right:x()<1525,left:x()>1535}),180);
   jumpTo(1810,500);jumpTo(2150,610);step({});jump();go(30,{right:true,jump:true});step({});jump();until(()=>x()>2360,{right:true,jump:true});until(()=>y()<680,{right:x()<2380});dash();until(()=>a.workshop.bells>0,{right:true});until(()=>x()>2660,{right:true});hook();jump();go(18,{right:true,jump:true});dash();finish();
  }else if(originalIndex===26){
   walk(230);step({hook:true});jumpTo(510,80);jumpTo(810,110);step({});step({up:true,hook:true});until(()=>a.candidates.sockets>0,{},80);jumpTo(1020,340);until(()=>y()>339,{},90);jumpTo(1280,470);jumpTo(810,410);step({hook:true});jumpTo(1280,470);jumpTo(1480,610);jumpTo(2010,580);step({});step({up:true,right:true,hook:true});until(()=>a.candidates.sockets===2,{},100);jumpTo(2270,610);until(()=>y()>609,{},100);jumpTo(2530,370);step({});jump();go(30,{right:true,jump:true});step({});jump();until(()=>x()>2700,{right:true,jump:true});hook();jump();until(()=>x()>2940,{right:true});until(()=>y()<490,()=>({right:x()<2940,left:x()>2950}));dash();until(()=>a.workshop.bells>0,{right:true});finish();
  }else if(originalIndex===27){
   walk(290);for(const [px,py]of [[570,80],[970,140],[1390,200],[1800,300],[1650,470],[1390,510],[970,600],[570,690]])jumpTo(px,py);
   step({});step({left:true,jump:true});go(12,{left:true,jump:true});step({left:true,dodge:true});until(()=>!!G.p.seamRide,{left:true});until(()=>!G.p.seamRide,{right:true});step({});jump();until(()=>x()>2450,{right:true,jump:true});until(()=>y()<660,()=>({right:x()<2475,left:x()>2485}));step({down:true,attack:true});until(()=>a.used.some(k=>k.includes(':pogo')),{down:true},20);until(()=>x()>2690,{right:true});hook();jump();go(18,{right:true,jump:true});dash();finish();
  }else if(originalIndex===28){
   walk(290);for(const [px,py]of [[520,80],[870,170],[1260,290],[1580,430],[1960,570],[2270,480],[2610,330]])jumpTo(px,py);
   step({});jump();go(30,{right:true,jump:true});step({});jump();until(()=>x()>2810,{right:true,jump:true});until(()=>y()<305,()=>({right:x()<2835,left:x()>2845}));step({down:true,attack:true});until(()=>a.used.some(k=>k.includes(':pogo')),{down:true},20);until(()=>x()>2960,{right:true});hook();jump();go(18,{right:true,jump:true});dash();finish();
  }else if(originalIndex===29){
   walk(280);step({up:true,right:true,dodge:true});jumpTo(610,90);jumpTo(1000,250);jumpTo(1250,360);step({});step({left:true,dodge:true});until(()=>!G.obstacles.find(o=>o.ceProgramRail&&o.ceRoom===originalIndex).ceMoving);jumpTo(1250,530);jumpTo(1590,510);jumpTo(1930,670);jumpTo(2330,500);
   step({});jump();until(()=>x()>2460,{right:true,jump:true});dash();until(()=>a.workshop.prisms===1,{right:true});until(()=>x()>2820,{right:true});dash();until(()=>a.workshop.prisms===2,{right:true});until(()=>x()>3090,{right:true});hook();jump();go(18,{right:true,jump:true});dash();finish();
  }else if(r.openFlight){
   walk(240);dash();until(()=>!!a.flight,{right:true},240);
   for(let ci=0;ci<r.openPaths.length;ci++){
    if(ci)until(()=>!!a.flight,{right:true},300);
    const zip=r.openZips[ci];
    for(const [tx,ty]of [...r.openPaths[ci],[zip[0]-100,zip[1]]]){
     until(()=>Math.hypot(x()-tx,y()+22-ty)<50,()=>({right:tx-x()>12,left:tx-x()< -12,up:ty-y()-22>12,down:ty-y()-22< -12}),320);snap('steer '+tx);
    }
    dash();until(()=>!!G.p.seamRide,{right:true},80);snap('open zip');until(()=>!G.p.seamRide,{right:true},220);
   }
   finish();
  }else if(originalIndex===24){
   walk(290);jump();go(18,{right:true,jump:true});dash();go(11,{right:true});until(()=>a.anvilHits===1,{right:true,down:true},65);snap('opening rebound');
   until(()=>x()>650&&y()>300,{right:true},90);dash();until(()=>!!G.p.seamRide,{right:true});until(()=>!G.p.seamRide,{right:true});
   until(()=>G.p.onGround&&G.p.floorPlat?.ceWeight,()=>({right:x()<1424,left:x()>1436}));step({attack:true});const lift=G.p.floorPlat;until(()=>lift.ceT===1,{},130);go(3);jump();go(39,{right:true});jump();until(()=>x()>2160,{right:true,jump:true});until(()=>a.anvilHits===2,{right:true,down:true},100);snap('lower rebound');
   until(()=>x()>2800&&y()>510,{right:true},100);dash();until(()=>!!G.p.seamRide,{right:true});until(()=>!G.p.seamRide,{right:true});hook();jump();until(()=>x()>4510,{right:true,jump:true});step({right:true});jump();until(()=>x()>4620&&y()+G.p.h>580&&y()+G.p.h<670,{right:true,jump:true});step({right:true,up:true,attack:true});until(()=>a.used.some(k=>k.includes(':uppercut')),{right:true,up:true},20);
   until(()=>x()>4820,{right:true});dash();until(()=>a.workshop.bells>0,{right:true});until(()=>x()>5150,{right:true});dash();until(()=>a.lab.veins>0,{right:true});finish();
  }else if(originalIndex===20){
   const land=tx=>until(()=>G.p.onGround&&Math.abs(G.p.floorPlat?.x-base-tx)<3,()=>({right:x()<tx-4,left:x()>tx+4,jump:true}),220);
   const leap=tx=>{step({});jump();go(18,{right:true,jump:true});dash();go(22,{right:true,jump:true});step({right:true});jump();land(tx);snap('wake'+tx);};
   walk(240);dash();until(()=>!!G.p.seamRide,{right:true});until(()=>!G.p.seamRide,{right:true});dash(false,true);land(910);snap('wake910');leap(1240);
   step({});jump();go(18,{right:true,jump:true});step({right:true});jump();go(26,{right:true,jump:true});dash();until(()=>a.workshop.bells>0,{right:true});land(1850);snap('wake bell');step({});until(()=>x()>1970&&y()<410,{right:true});dash();land(2180);snap('wake crumble');
   step({});jump();until(()=>x()>2300,{right:true,jump:true});dash();until(()=>a.workshop.vault>0,{right:true});step({});jump();until(()=>x()>2760&&y()>395,{right:true});step({right:true,down:true,attack:true});until(()=>a.used.some(k=>k.includes(':pogo')),{right:true,down:true},20);snap('wake pogo');
   until(()=>x()>2970,{right:true});hook();jump();go(20,{right:true,jump:true});dash();go(22,{right:true,jump:true});step({right:true});jump();finish();
  }else if(originalIndex===19){
   const land=tx=>until(()=>G.p.onGround&&Math.abs((G.p.floorPlat?.ceOriginX??G.p.floorPlat?.x)-base-tx)<5,()=>({right:x()<tx-4,left:x()>tx+4,jump:true}),220);
   walk(285);jump();go(23,{right:true,jump:true});land(430);step({dodge:true});until(()=>G.p.floorPlat?.ceGold);jump();go(21,{right:true,jump:true});dash();go(22,{right:true,jump:true});step({right:true});jump();land(810);snap('works root1');
   step({});jump();go(18,{right:true,jump:true});dash(true);go(22,{right:true,jump:true});step({right:true});jump();land(1100);snap('works hatch');
   step({});step({dodge:true});until(()=>a.candidates.returns>0,{},220);until(()=>G.p.onGround&&G.p.floorPlat?.ceHoist);step({dodge:true});until(()=>G.p.floorPlat?.ceGold);jump();until(()=>x()>1790,{right:true,jump:true});dash(true);land(1950);snap('works root2');
   step({});jump();go(18,{right:true,jump:true});step({right:true});jump();go(26,{right:true,jump:true});dash();until(()=>a.workshop.bells>0,{right:true});land(2550);snap('works upper hoist');
   step({dodge:true});until(()=>G.p.floorPlat?.ceGold);jump();until(()=>x()>3150,{right:true,jump:true});until(()=>a.anvilHits>0,{right:true,down:true},100);snap('works rebound');until(()=>x()>3440&&y()>570,{right:true},110);dash();until(()=>!!G.p.seamRide,{right:true});until(()=>!G.p.seamRide,{right:true});hook();jump();go(20,{right:true,jump:true});dash();finish();
  }else if(originalIndex===21){
   const land=tx=>until(()=>G.p.onGround&&Math.abs(G.p.floorPlat?.x-base-tx)<3,()=>({right:x()<tx-4,left:x()>tx+4}),260);
   walk(285);jumpTo(630,180);step({});step({left:true,down:true,dodge:true});until(()=>a.candidates.rebounds===1,{left:true,down:true},45);snap('aim1');land(860);
   jumpTo(1010,460);step({});step({right:true,down:true,dodge:true});until(()=>a.candidates.rebounds===2,{right:true,down:true},45);snap('aim2');land(780);
   jumpTo(1100,610);jumpTo(1500,590);step({});step({left:true,down:true,dodge:true});until(()=>a.candidates.rebounds===3,{left:true,down:true},45);snap('aim3');land(1780);
   step({});jump();until(()=>x()>1910,{right:true,jump:true});dash();until(()=>a.workshop.prisms===1,{right:true});until(()=>x()>2310,{right:true});dash();until(()=>a.workshop.prisms===2,{right:true});until(()=>x()>2510,{right:true});dash();until(()=>!!G.p.seamRide,{right:true});until(()=>!G.p.seamRide,{right:true});hook();jump();go(15,{right:true,jump:true});dash();finish();
  }else if(originalIndex===17){
   const land=tx=>until(()=>G.p.onGround&&Math.abs(G.p.floorPlat?.x-base-tx)<3,()=>({right:x()<tx-4,left:x()>tx+4,jump:true}),220);
   const leap=(tx,up=false)=>{step({});jump();go(18,{right:true,jump:true});dash(up);go(22,{right:true,jump:true});step({right:true});jump();land(tx);snap('fold'+tx);};
   walk(290);leap(570,true);leap(920,true);
   step({});jump();go(18,{right:true,jump:true});dash();until(()=>x()>1100,{right:true});hook();jump();land(1550);snap('ring fold');
   step({});jump();go(18,{right:true,jump:true});dash();until(()=>x()>1810,{right:true});until(()=>y()<185,()=>({right:x()<1820,left:x()>1838}));step({down:true,attack:true});until(()=>a.used.some(k=>k.includes(':pogo')),{down:true},20);snap('pogo');
   until(()=>x()>1980,{right:true});dash(true);go(15,{right:true});step({right:true});jump();land(2180);snap('pogo fold');
   leap(2510);step({});jump();go(18,{right:true,jump:true});step({right:true});jump();go(26,{right:true,jump:true});dash();until(()=>a.workshop.bells>0,{right:true});land(3150);snap('bell fold');
   step({});jump();go(18,{right:true,jump:true});step({right:true});jump();until(()=>x()>3360&&y()<540,{right:true,jump:true});dash();until(()=>a.lab.veins>0,{right:true},110);finish();
  }else if(r.flightCourse){
   walk(240);dash();until(()=>!!a.flight,{right:true});
   for(const [ci,ch]of r.flightChapters.entries()){
    if(ci)until(()=>!!a.flight,{right:true},300);
    for(const [j,point]of ch.path.entries()){
     if(j===0)continue;const [tx,cy,flag]=point,pod=G.obstacles.find(o=>o.ceRoom===originalIndex&&o.type==='ceAetherSpring'&&Math.abs(o.x-base-tx)<1&&o.y===cy),cell=G.obstacles.find(o=>o.ceRoom===originalIndex&&o.type==='ceGale'&&Math.abs(o.x-base-tx)<1&&o.y===cy);
     until(()=>pod&&!pod.ceProbeDisabled?pod.ceSpent:cell?cell.ceSpent:Math.hypot(x()-tx,y()+22-cy)<(r.flightProbe?.turnLead||30),()=>({right:tx-x()>6,left:tx-x()< -6,up:cy-y()-22>6,down:cy-y()-22< -6,jump:!!r.flightProbe?.brakeNear&&Math.hypot(x()-tx,y()+22-cy)<r.flightProbe.brakeNear}),320);snap('flight'+ci+':'+j);
    }
    until(()=>!a.flight,{right:true},100);snap('expired-before-zip');
    until(()=>x()>ch.exit[0]-180&&y()<ch.exit[1]+25,{right:true},130);dash();until(()=>!!G.p.seamRide,{right:true},60);snap('zip'+ci);
    until(()=>!G.p.seamRide,{right:true},220);
   }
   finish();
  }else if(index===23||index===24){
   const hard=index===24,ax=hard?1910:1880;
   walk(265);step({attack:true});const lift=G.obstacles.find(o=>o.ceRoom===originalIndex&&o.ceWeight);until(()=>lift.ceT===1,{},120);go(3);jump();go(39,{right:true});jump();
   until(()=>x()>ax-300,{right:true,jump:true},160);snap('above anvil');until(()=>a.anvilHits>0,{right:true,down:true},90);snap('rebound');
   until(()=>x()>ax+(hard?175:140)&&y()>(hard?345:505),{right:true},90);dash();until(()=>!!G.p.seamRide,{right:true});until(()=>!G.p.seamRide,{right:true});hook();jump();snap('ring release');
   if(hard){until(()=>x()>2880,{right:true,jump:true});step({right:true});jump();until(()=>x()>2970&&y()+G.p.h>420&&y()+G.p.h<510,{right:true,jump:true});step({right:true,up:true,attack:true});until(()=>G.obstacles.some(o=>o.ceRoom===originalIndex&&o.ceBlade==='uppercut'&&o.ceSpent),{right:true,up:true},14);until(()=>x()>3125,{right:true});dash();until(()=>a.workshop.bells>0,{right:true});until(()=>x()>3540,{right:true});dash();until(()=>a.workshop.vault>0,{right:true});step({});jump();go(8,{right:true,jump:true});dash(true);go(25,{right:true,jump:true});step({right:true});jump();dash();}else{go(14,{right:true,jump:true});dash();}finish();
  }else if(index===0||index===6){
   walk(285);jump();go(23,{right:true,jump:true});until(()=>G.p.onGround&&G.p.floorPlat?.ceShuttle,()=>({right:x()<440,left:x()>450}));snap('board');
   step({dodge:true});go(33);jump();snap('launch');
   until(()=>G.p.onGround&&G.p.floorPlat?.ceDelay>.1,{right:true,jump:true});snap('second');
   until(()=>G.p.floorPlat?.labCharged);jump();snap('second launch');until(()=>x()>1350,{right:true,jump:true});step({right:true});jump();until(()=>x()>1550,{right:true,jump:true});dash();until(()=>a.lab.veins>0,{right:true});if(index===0){jump();dash(true);finish();}else{step({});jump();snap('rail vault');until(()=>x()>1950,{right:true,jump:true});dash();until(()=>a.workshop?.bells===1,{right:true});snap('rail bell');until(()=>G.p.onGround&&G.p.floorPlat?.ceCrumble,()=>({right:x()<2490-8,left:x()>2490+8}));snap('rail rock');step({});jump();go(20,{right:true,jump:true});dash();until(()=>a.workshop?.vault>0,{right:true});step({});jump();go(20,{right:true,jump:true});dash();if(originalIndex===14){until(()=>x()>3185,{right:true});hook();jump();go(20,{right:true,jump:true});dash();}finish();}
  }else if(index===14){
   const land=tx=>until(()=>G.p.onGround&&Math.abs((G.p.floorPlat?.ceOriginX??G.p.floorPlat?.x)-base-tx)<5,()=>({right:x()<tx-4,left:x()>tx+4}));
   walk(285);jump();go(18,{right:true,jump:true});dash(true);until(()=>x()>507,{right:true,jump:true});step({});step({down:true,dodge:true});until(()=>a.candidates.rebounds===1,{down:true});snap('recoil1');land(270);snap('recoil perch1');
   step({});jump();go(18,{right:true,jump:true});dash();go(22,{right:true,jump:true});step({right:true});jump();go(18,{right:true,jump:true});dash(true);until(()=>x()>759,{right:true});step({});until(()=>y()<450&&y()>395,()=>({left:x()>761,right:x()<757}));step({left:true,down:true,dodge:true});until(()=>a.candidates.rebounds===2,{left:true,down:true});snap('recoil2');land(1000);snap('recoil perch2');
   step({});jump();go(18,{right:true,jump:true});dash();go(22,{right:true,jump:true});step({right:true});jump();go(18,{right:true,jump:true});dash();until(()=>x()>1520,{right:true});until(()=>y()<530,()=>({left:x()>1532,right:x()<1524}));step({});step({left:true,up:true,dodge:true});until(()=>a.candidates.rebounds===3,{left:true,up:true});snap('recoil3');land(1710);snap('recoil perch3');
   if(originalIndex===21){step({});jump();go(18,{right:true,jump:true});dash(true);until(()=>a.workshop.prisms===1,{right:true});until(()=>x()>2130,{right:true});dash();until(()=>a.lab.veins>0,{right:true});until(()=>x()>2435,{right:true});dash();until(()=>a.workshop.prisms===2,{right:true});until(()=>x()>2735,{right:true});dash();until(()=>a.workshop.bells>0,{right:true});go(24,{right:true,jump:true});jump();go(10,{right:true,jump:true});dash();finish();}
   else{step({});jump();go(18,{right:true,jump:true});dash();go(22,{right:true,jump:true});step({right:true});jump();go(18,{right:true,jump:true});dash();land(2250);step({});jump();go(18,{right:true,jump:true});dash();go(22,{right:true,jump:true});step({right:true});jump();go(18,{right:true,jump:true});dash();finish();}
  }else if(index===15){
   const seed=()=>G.obstacles.find(o=>o.ceRoom===originalIndex&&o.type==='ceSeed');
   const land=tx=>until(()=>G.p.onGround&&Math.abs((G.p.floorPlat?.ceOriginX??G.p.floorPlat?.x)-base-tx)<5,()=>({right:x()<tx-4,left:x()>tx+4,jump:true}));
   walk(220);step({hook:true});step({right:true});walk(290);jump();go(18,{right:true,jump:true});dash(true);go(22,{right:true,jump:true});step({right:true});jump();land(530);walk(530);step({});step({right:true,hook:true});snap('throw1');
   walk(620);dash(false,true);until(()=>G.p.onGround,{right:true});walk(960);step({});step({jump:true});go(18,{jump:true});step({up:true,dodge:true});go(14,{up:true,jump:true});land(1040);until(()=>seed().ceDock===0);step({hook:true});snap('catch1');step({});jump();go(18,{right:true,jump:true});dash(true);go(22,{right:true,jump:true});step({right:true});jump();land(1350);walk(1350);step({});step({right:true,up:true,hook:true});snap('throw2');
   step({});step({jump:true});go(18,{jump:true});step({up:true,dodge:true});go(12,{up:true,jump:true});step({right:true});jump();land(1480);
   step({});step({jump:true});go(18,{jump:true});step({up:true,dodge:true});go(12,{up:true,jump:true});step({right:true});jump();go(18,{right:true,jump:true});dash();land(1690);until(()=>seed().ceDock===1);step({hook:true});snap('catch2');
   step({});jump();go(18,{right:true,jump:true});dash();go(22,{right:true,jump:true});step({right:true});jump();go(20,{right:true,jump:true});dash();land(2150);until(()=>x()<2128,{left:true});step({});if(originalIndex===22)go(2,{right:true});step({right:true,down:true,hook:true});snap('throw3');
   walk(2300);until(()=>y()<290,{right:true});dash();go(22,{right:true,jump:true});step({right:true});jump();go(18,{right:true,jump:true});dash();land(2540);until(()=>seed().ceDock===2);step({hook:true});snap('catch3');step({});jump();go(18,{right:true,jump:true});dash();go(22,{right:true,jump:true});step({right:true});jump();go(18,{right:true,jump:true});dash();finish();
  }else if(index===16){
   walk(290);
   for(const [tx,ty,phase]of r.folds){
    if(tx===1750||tx===2410){const fallY=tx===1750?450:210;until(()=>y()<fallY,{right:true});step({right:true,dodge:true});go(24,{right:true});step({right:true});step({right:true,jump:true});until(()=>G.p.onGround&&Math.abs(G.p.floorPlat?.x-base-tx)<3,()=>({right:x()<tx-5,left:x()>tx+5,jump:true}),180);snap('fold'+tx);continue;}
    const dx=tx-x(),dir={right:dx>0,left:dx<0},high=ty-y()>90||tx===560;if(originalIndex===17&&[990,1370].includes(tx))go(4,dir);
    step(dir);step({...dir,jump:true});go(18,{...dir,jump:true});step({...dir,dodge:true,up:high});go(22,{...dir,jump:true});
    if(originalIndex===17&&[990,1370].includes(tx))go(3,dir);step(dir);step({...dir,jump:true});
    until(()=>G.p.onGround&&Math.abs(G.p.floorPlat?.x-base-tx)<3,()=>({right:x()<tx-5,left:x()>tx+5,jump:true}),180);snap('fold'+tx);
   }
   if(originalIndex===17){step({});jump();go(18,{right:true,jump:true});step({right:true});jump();go(26,{right:true,jump:true});dash();until(()=>a.workshop.bells>0,{right:true});snap('aftershock bell');until(()=>x()>2900,{right:true});jump();until(()=>x()>3010,{right:true,jump:true});dash();until(()=>a.workshop.vault>0,{right:true});step({});jump();go(8,{right:true,jump:true});dash(true);go(25,{right:true,jump:true});step({right:true});jump();dash();finish();}else{step({});jump();go(18,{right:true,jump:true});dash();finish();}
  }else if(index===13){
   walk(290);
   for(const [tx,ty]of [[580,80],[990,145],[1460,190],[1290,390],[950,455],[600,525]]){
    if(tx===1290){step({});step({jump:true});go(18,{jump:true});step({up:true,dodge:true});go(14,{up:true,jump:true});step({left:true});step({left:true,jump:true});until(()=>G.p.onGround&&Math.abs(G.p.floorPlat?.x-base-tx)<3,()=>({right:x()<tx-5,left:x()>tx+5,jump:true}));snap('wake'+tx);continue;}
    const dx=tx-x(),dir={right:dx>0,left:dx<0},high=ty-y()>85;
    step(dir);step({...dir,jump:true});go(18,{...dir,jump:true});step({...dir,dodge:true,up:high});go(22,{...dir,jump:true});step(dir);step({...dir,jump:true});if(Math.abs(dx)>430){go(20,{...dir,jump:true});step({...dir,dodge:true});}
    until(()=>G.p.onGround&&Math.abs(G.p.floorPlat?.x-base-tx)<3,()=>({right:x()<tx-5,left:x()>tx+5,jump:true}),180);snap('wake'+tx);
   }
   step({});step({left:true,jump:true});go(12,{left:true,jump:true});step({left:true,dodge:true});until(()=>!!G.p.seamRide,{left:true});until(()=>!G.p.seamRide,{right:true});
   if(originalIndex===24){
   walk(290);jump();go(18,{right:true,jump:true});dash();go(11,{right:true});until(()=>a.anvilHits===1,{right:true,down:true},65);snap('opening rebound');
   until(()=>x()>650&&y()>300,{right:true},90);dash();until(()=>!!G.p.seamRide,{right:true});until(()=>!G.p.seamRide,{right:true});
   until(()=>G.p.onGround&&G.p.floorPlat?.ceWeight,()=>({right:x()<1424,left:x()>1436}));step({attack:true});const lift=G.p.floorPlat;until(()=>lift.ceT===1,{},130);go(3);jump();go(39,{right:true});jump();until(()=>x()>2160,{right:true,jump:true});until(()=>a.anvilHits===2,{right:true,down:true},100);snap('lower rebound');
   until(()=>x()>2800&&y()>510,{right:true},100);dash();until(()=>!!G.p.seamRide,{right:true});until(()=>!G.p.seamRide,{right:true});hook();jump();until(()=>x()>4510,{right:true,jump:true});step({right:true});jump();until(()=>x()>4620&&y()+G.p.h>580&&y()+G.p.h<670,{right:true,jump:true});step({right:true,up:true,attack:true});until(()=>a.used.some(k=>k.includes(':uppercut')),{right:true,up:true},20);
   until(()=>x()>4820,{right:true});dash();until(()=>a.workshop.bells>0,{right:true});until(()=>x()>5150,{right:true});dash();until(()=>a.lab.veins>0,{right:true});finish();
  }else if(originalIndex===20){hook();jump();until(()=>x()>2250,{right:true,jump:true});step({right:true});jump();until(()=>x()>2400,{right:true,jump:true});dash();until(()=>a.workshop.vault>0,{right:true});step({});jump();go(20,{right:true,jump:true});dash();finish();}
   else{jump();go(24,{right:true,jump:true});dash();
   until(()=>G.p.onGround,()=>({right:x()<2010,left:x()>2020}));step({});jump();go(6,{right:true,jump:true});step({right:true});dash();go(24,{right:true});dash();until(()=>G.p.onGround,()=>({right:x()<2370,left:x()>2378}));step({});jump();go(18,{right:true,jump:true});dash();finish();}
  }else if(index===12){
   walk(285);jump();go(23,{right:true,jump:true});until(()=>G.p.onGround&&G.p.floorPlat?.ceHoist,()=>({right:x()<432,left:x()>448}));snap('hoist1');
   step({dodge:true});until(()=>G.p.floorPlat?.ceGold);jump();snap('hoist launch');until(()=>x()>795,{right:true,jump:true});step({right:true});jump();go(12,{right:true,jump:true});dash();
   until(()=>G.p.onGround&&G.p.floorPlat?.ceTrap,()=>({right:x()<1074,left:x()>1086,jump:true}));snap('trap');
   step({});step({dodge:true});until(()=>a.candidates.returns>0,{},220);snap('trap drop');
   until(()=>G.p.onGround&&G.p.floorPlat?.ceHoist);step({dodge:true});until(()=>G.p.floorPlat?.ceGold);jump();snap('low launch');
   until(()=>x()>1980,{right:true,jump:true});dash(true);until(()=>G.p.onGround&&G.p.floorPlat?.ceRoot,()=>({right:x()<2200,left:x()>2215}));snap('root1');step({});jump();go(20,{right:true,jump:true});dash(true);go(22,{right:true,jump:true});step({right:true});jump();until(()=>G.p.onGround&&G.p.floorPlat?.ceHoist,()=>({right:x()<2514,left:x()>2526,jump:true}));snap('hoist4');
   step({dodge:true});until(()=>G.p.floorPlat?.ceGold);jump();until(()=>x()>3140,{right:true,jump:true});dash(originalIndex===12);until(()=>G.p.onGround&&G.p.floorPlat?.ceRoot,()=>({right:x()<3294,left:x()>3306}));snap('root2');
   if(originalIndex===19){step({});jump();go(20,{right:true,jump:true});dash();until(()=>x()>3500,{right:true});step({right:true});jump();until(()=>x()>3650,{right:true,jump:true});until(()=>a.anvilHits>0,{right:true,down:true},100);snap('root rebound');until(()=>x()>3890&&y()>400,{right:true});dash();until(()=>!!G.p.seamRide,{right:true});until(()=>!G.p.seamRide,{right:true});hook();jump();go(14,{right:true,jump:true});dash();finish();}
   else{walk(3370);step({});jump();go(20,{right:true,jump:true});dash(true);go(22,{right:true,jump:true});step({right:true});jump();go(15,{right:true,jump:true});dash();finish();}
  }else if(index===1||index===7){
   walk(290);jump();go(8,{right:true,jump:true});dash();until(()=>a.workshop?.vault>0,{right:true});step({});jump();snap('vault1');
   until(()=>x()>1055,{right:true,jump:true});dash();until(()=>a.workshop?.vault>0,{right:true});step({});jump();snap('vault2');if(index===1){go(20,{right:true,jump:true});dash();until(()=>x()>1730,{right:true});hook();jump();go(14,{right:true,jump:true});dash();finish();}else{until(()=>x()>1640,{right:true,jump:true});dash();until(()=>a.workshop?.bells===1,{right:true});snap('down bell');until(()=>x()>1910,{right:true});dash();until(()=>a.workshop?.vault>0,{right:true});step({});jump();snap('last vault');go(20,{right:true,jump:true});dash();until(()=>G.p.onGround,{right:true});step({});jump();go(20,{right:true,jump:true});dash(true);until(()=>x()>2980&&y()+G.p.h>41&&y()+G.p.h<115,{right:true});step({right:true,up:true,attack:true});until(()=>G.obstacles.some(o=>o.ceRoom===originalIndex&&o.ceBlade==='uppercut'&&o.ceSpent),{right:true,up:true},14);until(()=>x()>3085,{right:true});dash();until(()=>a.workshop?.bells===2,{right:true});until(()=>x()>3445,{right:true});dash();until(()=>a.workshop?.vault>0,{right:true});step({});jump();go(20,{right:true,jump:true});dash();finish();}
  }else if(index===2||index===8){
   walk(290);jump();go(19,{right:true,jump:true});dash();
   for(const tx of [520,800,1080,1360]){
    until(()=>G.p.onGround&&G.p.floorPlat?.ceCrumble,()=>({right:x()<tx-5,left:x()>tx+5}));snap('land'+tx);step({});jump();go(12,{right:true,jump:true});dash(tx===520||tx===1080);go(22,{right:true,jump:true});step({right:true});jump();
   }
   if(index===2)finish();else{until(()=>x()>1635&&y()>140&&y()<200,{right:true});step({right:true,down:true,attack:true});until(()=>G.obstacles.some(o=>o.ceRoom===originalIndex&&o.ceBlade&&o.ceSpent),{right:true,down:true},14);snap('fault pogo');until(()=>x()>1785,{right:true});dash();until(()=>a.workshop?.bells===1,{right:true});snap('fault bell');until(()=>G.p.onGround&&G.p.floorPlat?.ceCrumble,()=>({right:x()<2342,left:x()>2358}));snap('fault rock');step({});jump();go(20,{right:true,jump:true});dash();until(()=>a.workshop?.vault>0,{right:true});step({});jump();go(20,{right:true,jump:true});dash();finish();}
  }else if(index===3||index===9){
   if(index===9&&a.workshopCheckpoint){jump();go(10,{right:true,jump:true});dash();until(()=>a.workshop?.vault>0,{right:true});step({});jump();}else{
   walk(290);jump();go(10,{right:true,jump:true});dash();until(()=>a.workshop?.prisms===1,{right:true});snap('prism1');
   until(()=>x()>716,{right:true});dash();until(()=>a.lab.veins>0,{right:true});snap('vein');
   until(()=>x()>1030,{right:true});dash();until(()=>a.workshop?.prisms===2,{right:true});snap('prism2');
   until(()=>x()>1340,{right:true});step({hook:true});until(()=>G.p.actHook?.state==='hang');step({});jump();until(()=>x()>1780,{right:true,jump:true});dash();until(()=>a.workshop?.vault>0,{right:true});step({});jump();}
   snap('polarity vault');if(index===3){go(20,{right:true,jump:true});dash();finish();}else{until(()=>x()>2340,{right:true,jump:true});dash();until(()=>a.workshop?.prisms===3,{right:true});until(()=>x()>2660,{right:true});dash();until(()=>a.lab.veins>=3,{right:true});until(()=>x()>2940,{right:true});dash();until(()=>a.workshop?.prisms===4,{right:true});snap('fourth prism');until(()=>x()>3245,{right:true});dash();until(()=>a.workshop?.bells===1,{right:true});go(24,{right:true,jump:true});jump();go(10,{right:true,jump:true});dash();finish();}
  }else if(index===4||index===10){
   walk(240);dash();until(()=>!!a.flight,{right:true});
   for(const [tx,ty]of r.flightPath)until(()=>x()>tx-10,()=>({right:true,up:ty-y()>12,down:ty-y()< -12}),180);
   step({right:true,up:true});dash();until(()=>!!G.p.seamRide,{right:true});if(index===10){until(()=>!!a.flight,{right:true});for(const [tx,ty]of r.flightPath2)until(()=>x()>tx-10,()=>({right:true,up:ty-y()>12,down:ty-y()< -12,jump:x()>5000&&x()<5330}),180);step({right:true,up:true});dash();until(()=>!!G.p.seamRide,{right:true});until(()=>!!a.flight,{right:true});for(const [tx,ty]of r.flightPath3)until(()=>x()>tx-8,()=>({right:true,up:ty-y()>8,down:ty-y()< -8,jump:true}),180);step({right:true,up:true});dash();until(()=>!!G.p.seamRide,{right:true});if(originalIndex===18){until(()=>!G.p.seamRide,{right:true});hook();jump();until(()=>x()>7800,{right:true,jump:true});step({right:true});jump();until(()=>x()>7960,{right:true,jump:true});dash();until(()=>a.workshop.vault>0,{right:true});step({});jump();go(20,{right:true,jump:true});dash();}}finish();
  }else if(index===5||index===11){
   walk(300);jump();until(()=>x()>409&&y()>=50&&y()<100,{right:true,jump:true});step({right:true,down:true,attack:true});until(()=>G.obstacles.some(o=>o.ceRoom===originalIndex&&o.ceBlade&&o.ceSpent),{right:true,down:true},14);snap('pogo');
   until(()=>x()>535,{right:true});dash();until(()=>a.workshop?.bells===1,{right:true});snap('bell1');
   until(()=>x()>915,{right:true});dash();until(()=>a.workshop?.bells===2,{right:true});snap('bell2');
   until(()=>x()>1180,{right:true});dash();until(()=>a.workshop?.bells===3,{right:true});snap('bell3');
   until(()=>x()>1600,{right:true});dash();until(()=>!!G.p.seamRide,{right:true});if(index===5)finish();else{until(()=>!G.p.seamRide,{right:true});until(()=>G.p.onGround,{right:true});step({});jump();go(20,{right:true,jump:true});dash(true);until(()=>x()>2260&&y()+G.p.h>191&&y()+G.p.h<265,{right:true});step({right:true,up:true,attack:true});until(()=>G.obstacles.some(o=>o.ceRoom===originalIndex&&o.ceBlade==='uppercut'&&o.ceSpent),{right:true,up:true},14);snap('mercy uppercut');until(()=>x()>2365,{right:true});dash();until(()=>a.workshop?.bells===4,{right:true});snap('fourth bell');until(()=>x()>2725,{right:true});dash();until(()=>a.workshop?.vault>0,{right:true});step({});jump();snap('mercy vault');go(20,{right:true,jump:true});dash();finish();}
  }
  snap('finish');return {pass:a.complete&&a.deaths===0,index:originalIndex,frames,log,tape};
 }catch(e){snap(e.message);return {pass:false,index:originalIndex,frames,log,tape};}
}
