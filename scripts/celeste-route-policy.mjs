/* Legal-input traversal policies. No player/level state writes in this function. */
export function runCourseRoom(){
 const tas=__BF.tas,a=G.celeste,startRoom=a.room,r=a.rooms[startRoom],base=r.x,tape=[],log=[];
 const x=()=>G.p.x-base,y=()=>G.p.y;
 let steps=0;
 function snap(label){log.push({label,x:Math.round(x()),y:Math.round(y()),vx:Math.round(G.p.vx),vy:Math.round(G.p.vy),used:G.celeste.used.slice()});}
 const deaths=a.deaths;
 function step(keys={}){if(G.celeste.deaths!==deaths)throw Error('retry');if(steps++>1800)throw Error('room time limit');const before={x:Math.round(x()),y:Math.round(y()),fly:G.celeste.flight?.t,seam:!!G.p.seamRide,dash:G.p.dodgeCdT,vy:G.p.vy};tas.stepFrames(1,keys);tape.push(keys);if(G.celeste.deaths!==deaths)log.push({failedInput:keys,before});}
 function go(n,keys={}){for(let j=0;j<n;j++)step(keys);}
 function until(pred,keys={},max=300){for(let j=0;j<max&&!pred();j++)step(typeof keys==='function'?keys():keys);if(!pred())throw Error('condition timeout');}
 function walk(tx){until(()=>x()>=tx,{right:true});}
 function hook(){step({hook:true});until(()=>G.p.actHook?.state==='hang',{},80);step({});}
 function jump(){step({right:true,jump:true});if(G.gravityFlipped&&a.gravityLeaseT>0)step({right:true,flip:true,jump:true});}
 function dash(){step({right:true,dodge:true});}
 function finish(){for(let j=0;j<360&&G.celeste.room===startRoom&&!G.celeste.complete;j++)step({right:true});if(G.celeste.room===startRoom&&!G.celeste.complete)throw Error('exit not reached');}
 function fly(points){for(const [tx,ty]of points){until(()=>x()>tx-10,()=>({right:true,up:ty-y()>15,down:ty-y()< -15}),180);}}
 function launchWeight(secondDelay=39){walk(265);step({attack:true});const lift=G.obstacles.find(o=>o.ceRoom===startRoom&&o.ceWeight);until(()=>lift.ceT===1,{},120);go(3);snap('riding');jump();go(secondDelay,{right:true});jump();}
 function bladeHit(kind,holdJump=false){
  const o=G.obstacles.find(o=>o.ceRoom===startRoom&&o.ceBlade===kind&&!o.ceSpent);
  if(!o)throw Error('missing blade target');
  until(()=>Math.abs(G.p.x-o.x)<o.w/2+8&&(kind==='pogo'?y()>=o.y+5&&y()<=o.y+65:o.y>=y()+G.p.h-8&&o.y<=y()+G.p.h+62),{right:true,jump:holdJump},110);
  step({right:true,attack:true,down:kind==='pogo',up:kind==='uppercut'});
  until(()=>o.ceSpent,{right:true,down:kind==='pogo',up:kind==='uppercut'},14);snap(kind);
 }
 function reboundExit(){go(20,{right:true});dash();go(32,{right:true});jump();go(25,{right:true,jump:true});step({right:true});dash();finish();}
 try{
 snap('entry');
 switch(r.kind){
 case 'dash-lab':{
  walk(275);step({right:true,jump:true});go(5,{right:true,jump:true});step({right:true,up:true,dodge:true});
  until(()=>a.lab.refill&&G.p.dodgeTimer<=0,{right:true});dash();
  until(()=>G.p.onGround&&G.p.floorPlat?.ceShuttle,{right:true});walk(670);step({});step({dodge:true});go(32);jump();
  until(()=>x()>1210,{right:true,jump:true});dash();until(()=>a.lab.veins>0,{right:true,jump:true});step({right:true,up:true,dodge:true});finish();break;
 }
 case 'tear':walk(240);dash();finish();break;
 case 'ring':walk(230);hook();hook();jump();go(12,{right:true,jump:true});hook();jump();go(12,{right:true,jump:true});dash();finish();break;
 case 'weight':launchWeight(24);until(()=>G.p.onGround,{right:true,jump:true},180);snap('landed');jump();go(22,{right:true,jump:true});dash();go(20,{right:true});jump();go(18,{right:true,jump:true});dash();finish();break;
 case 'anvil':walk(460);go(15);step({jump:true});go(12,{jump:true});until(()=>a.used.includes(r.i+':anvil'),{down:true},45);reboundExit();break;
 case 'pogo':walk(300);jump();bladeHit('pogo',true);go(16,{right:true});dash();bladeHit('pogo');go(16,{right:true});dash();bladeHit('pogo');go(16,{right:true});dash();finish();break;
 case 'uppercut':walk(280);bladeHit('uppercut');go(16,{right:true});dash();bladeHit('uppercut');go(16,{right:true});dash();bladeHit('uppercut');go(16,{right:true});dash();finish();break;
 case 'pogo-tear':if(a.stage===42)go(40);walk(300);jump();bladeHit('pogo',true);go(16,{right:true});dash();bladeHit('uppercut');go(26,{right:true});dash();until(()=>!!G.p.seamRide,{right:true},70);finish();break;
 case 'uppercut-ring':walk(280);bladeHit('uppercut');go(16,{right:true});dash();bladeHit('pogo');go(10,{right:true});hook();jump();go(a.stage===42?1:10,{right:true,jump:true});hook();jump();go(12,{right:true,jump:true});dash();finish();break;
 case 'gale':case 'gale-tear':walk(235);jump();until(()=>!!G.celeste.flight,{right:true,jump:true},35);fly(r.flightPath);if(r.kind==='gale-tear'){dash();until(()=>!!G.p.seamRide,{right:true},70);finish();}else{dash();go(20,{right:true});jump();go(25,{right:true,jump:true});dash();finish();}break;
 case 'gravity':walk(265);step({right:true,flip:true});walk(1100);step({right:true,flip:true});dash();finish();break;
 case 'portal':walk(240);dash();go(13,{right:true});step({});jump();go(16,{right:true,jump:true});step({right:true});jump();go(10,{right:true,jump:true});dash();finish();break;
 case 'tear-ring':walk(240);dash();until(()=>!!G.p.seamRide,{right:true},30);until(()=>!G.p.seamRide,{right:true},80);hook();jump();go(a.stage===42?1:10,{right:true,jump:true});hook();jump();go(12,{right:true,jump:true});dash();finish();break;
 case 'weight-anvil':case 'relay':launchWeight();until(()=>x()>(r.liftTarget-base-(r.kind==='relay'?250:(a.stage===42?370:330))),{right:true,jump:true},160);snap('above anvil');until(()=>a.used.includes(r.i+':anvil'),{down:true,right:true},70);snap('rebound');
  if(r.kind==='weight-anvil'){go(10,{right:true});dash();go(30,{right:true});jump();go(20,{right:true,jump:true});dash();finish();}
  else{until(()=>x()>1885&&y()>310,{right:true},90);dash();until(()=>!!G.p.seamRide,{right:true},40);until(()=>!G.p.seamRide,{right:true},60);hook();jump();go(14,{right:true,jump:true});dash();finish();}break;
 case 'gravity-ring':walk(265);step({right:true,flip:true});walk(925);step({right:true,flip:true});hook();jump();go(a.stage===42?1:10,{right:true,jump:true});hook();jump();go(12,{right:true,jump:true});dash();finish();break;
 case 'inversion-relay':walk(240);dash();until(()=>!!G.p.seamRide,{right:true},30);until(()=>!G.p.seamRide,{right:true},90);
  {let lastFlip=-99;until(()=>x()>1230,()=>{
   const steering=(225-y())*5+G.p.vy*1.8;
   let desired=steering>220?true:steering< -220?false:G.gravityFlipped;
   if(x()>790&&!a.used.includes(r.i+':gravity-up'))desired=true;
   if(x()>1130)desired=false;
   const flip=desired!==G.gravityFlipped&&steps-lastFlip>=12;
   if(flip)lastFlip=steps;
   return {right:true,flip};
  },400);}
  if(G.gravityFlipped)step({right:true,flip:true});hook();jump();go(14,{right:true,jump:true});dash();finish();break;
 case 'portal-gale':walk(240);dash();until(()=>!!a.flight,{right:true},90);fly(r.flightPath);dash();go(20,{right:true});jump();go(25,{right:true,jump:true});dash();finish();break;
 }
 return {pass:true,stage:a.stage,room:startRoom,kind:r.kind,steps,tape,log};
 }catch(e){snap(e.message);return {pass:false,stage:a.stage,room:startRoom,kind:r.kind,steps,tape,log};}
}
