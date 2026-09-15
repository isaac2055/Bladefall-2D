// Shared input policy for the probe and focused fight tests. Runs in the page.
// Initial position/loadout are fixtures; all subsequent actions use TAS inputs.
export function runWhiteCourtFight(invulnerable=false,weapon=null,missFinish=false,approach='right',liveStart=false){
 const tas=window.__BF.tas,damage=[],recent=[],returns=[],seenReturns=new WeakSet(),inputs=[];
 const step=(n,input)=>{if(liveStart)for(let i=0;i<n;i++)inputs.push({...input});return tas.stepFrames(n,input);};
 let side=approach==='left'?-1:1,entryX=13960+side*(approach==='left'?300:525);
 if(liveStart&&(weapon||invulnerable))throw new Error('Live start cannot change loadout or grant invulnerability');
 if(weapon&&!Object.hasOwn(ARCH,weapon))throw new Error('Unknown weapon: '+weapon);
 if(weapon)G.p.weapon=tasDeterministicCall(()=>makeWeapon(weapon,'common'));
 const originalHurt=hurtPlayer;
 hurtPlayer=function(...args){
  const p=G.p,before=p.blood,where={time:G.time,x:p.x,y:p.y,bossX:G.boss?.x,ward:G.boss?.courtBreaks,args,source:new Error().stack.split('\n').slice(2,4)};
  const result=originalHurt.apply(this,args);
  if(p.blood<before)damage.push({...where,before,after:p.blood});
  return result;
 };
 if(!liveStart)Object.assign(G.p,{x:13960,y:0,vx:0,vy:0,onGround:true,floorPlat:null,invuln:invulnerable?600:0});
 step(2,{});step(1,{portal:true});step(1,{});
 if(invulnerable)step(153,{right:side>0,left:side<0});
 else for(let i=0;i<240&&Math.abs(G.p.x-entryX)>8;i++){
  const dx=entryX-G.p.x,bx=G.boss.x-G.p.x;
  step(1,{right:dx>0,left:dx<0,dodge:Math.sign(dx)===Math.sign(bx)&&Math.abs(bx)<65&&G.p.dodgeCdT<=0});
 }
 if(approach==='left'){
  // Let the pursuing caster reach the space between the mouths before linking
  // them; otherwise his low shot enters the receiver-side mouth first.
  for(let i=0;i<600&&G.boss.x>13920&&!G.p.dead;i++){
   const p=G.p,b=G.boss;
   step(1,{left:b.courtCastWind>0||p.x>13660,right:b.courtCastWind<=0&&p.x<13640});
  }
 }
 step(20,{});
 step(1,{portal:true});step(1,{});
 const mouths=G.cratePortals.map(o=>({x:o.x,y:o.y,nx:o.nx,ny:o.ny})),events=[];
 let lureX=approach==='left'?mouths[1].x-45:liveStart?mouths[1].x+45:entryX,changedSide=false;
 let jumpHold=0;
 let wasWind=false,hopped=false,priorBreak=0,finalWardTime=null,finalExposureExpired=false;
 for(let i=0;i<7200&&!G.p.dead&&!G.boss.dead&&G.p.x>13000;i++){
  const b=G.boss;
  // The divided-current phase asks for a new approach side. Rebuild the pair
  // during its earned opening using the existing portal button and movement.
  if(b.courtBreaks===1&&!changedSide){
   while(G.hitstop>0)step(1,{});
   step(1,{portal:true});step(1,{});
   for(const target of [liveStart&&Math.sin((G.time+10)*.65)>0?14140:13780,14870]){
    for(let j=0;j<360;j++){
     const dx=target-G.p.x,bx=b.x-G.p.x;
     if(Math.abs(dx)<15&&Math.abs(G.p.vx)<5&&G.p.onGround)break;
     step(1,{right:dx>8,left:dx<-8,dodge:Math.abs(dx)>80&&Math.sign(dx)===Math.sign(bx)&&Math.abs(bx)<65&&G.p.dodgeCdT<=0});
    }
    events.push({setupTarget:target,x:G.p.x,y:G.p.y,ground:G.p.onGround,vx:G.p.vx,mouths:G.cratePortals.length});
    step(1,{portal:true});step(1,{});
   }
   if(G.cratePortals.length!==2)throw new Error('Side-change policy failed to place its pair '+JSON.stringify(events));
   side=1;entryX=14485;lureX=G.cratePortals[1].x+45;changedSide=true;
   events.push({i,changedSide:true,player:G.p.x,mouths:G.cratePortals.map(o=>({x:o.x,y:o.y,nx:o.nx,ny:o.ny}))});
  }
  // Commit the shot at the first mouth, then leave the marked position.
  const wind=b.courtCastWind>0;
  let input={};
  if(wind)input={right:side>0,left:side<0};
  else if(G.p.x<(approach==='right'&&!changedSide&&!liveStart?14475:lureX-5))input={right:true};
  else if(G.p.x>(approach==='right'&&!changedSide&&!liveStart?14485:lureX+5))input={left:true};
  if(wind&&!wasWind)events.push({i,aim:b.courtAimX,boss:b.x,player:G.p.x});
  if(b.courtBreaks===3){input={attack:(!missFinish||(finalWardTime!==null&&G.time-finalWardTime>10))&&i%30===0,portal:G.cratePortals.length===2};if(G.p.x<b.x-75)input.right=true;else if(G.p.x>b.x+75)input.left=true;}
  if(liveStart&&b.courtBreaks===3){
   input.portal=G.cratePortals.length===2&&G.hitstop<=0&&i%2===0;
   if(Math.abs(G.p.x-b.x)<90&&G.p.face!==Math.sign(b.x-G.p.x)){
    input.right=b.x>G.p.x;input.left=b.x<G.p.x;
   }
  }
  if(!invulnerable&&G.p.onGround&&G.aoes.some(a=>a.courtAttack&&a.dmg>0&&!a.hit&&a.t<.5&&Math.abs(a.x-G.p.x)<a.r+35))jumpHold=30;
  if(G.p.onGround&&G.p.y<0)jumpHold=30;
  if(jumpHold>0){input.jump=true;jumpHold--;}
  if(!invulnerable){
   const direction=input.right?1:input.left?-1:0,dx=b.x-G.p.x;
   if(b.courtBreaks<3&&direction&&Math.sign(dx)===direction&&Math.abs(dx)<65&&G.p.dodgeCdT<=0)input.dodge=true;
  }
  if(liveStart&&G.aoes.some(a=>a.courtAttack&&a.dmg>0&&!a.hit&&a.t<.65&&Math.abs(a.x-G.p.x)<a.r+35)){
   // The east shelf blocks a vertical dodge until its outer edge is cleared.
   if(G.p.x>14700&&G.p.x<14945){input.right=true;delete input.left;input.jump=false;jumpHold=0;}
   else if(G.p.onGround){input.jump=true;jumpHold=30;}
  }
  wasWind=wind;step(1,input);
  recent.push({x:G.p.x,y:G.p.y,vy:G.p.vy,blood:G.p.blood,input});if(recent.length>30)recent.shift();
  if(b.courtBreaks===3){if(finalWardTime===null)finalWardTime=G.time;finalExposureExpired ||= b.exposeT<=0;}
  if(b.courtBreaks!==priorBreak){priorBreak=b.courtBreaks;events.push({i,ward:priorBreak,hp:b.hp,player:G.p.x,boss:b.x});}
  for(const p of G.projectiles)if(p.stolenSpell&&p.portalHops>0&&!seenReturns.has(p)){seenReturns.add(p);returns.push({time:G.time,ward:b.courtBreaks,x:p.x,y:p.y,vx:p.vx,vy:p.vy});}
  for(const p of G.projectiles)if(p.stolenSpell&&p.portalHops>0&&!hopped){hopped=true;events.push({i,hop:{x:p.x,y:p.y,vx:p.vx,vy:p.vy}});}
 }
 hurtPlayer=originalHurt;
 return {inputs:liveStart?inputs:undefined,maxWard:Math.max(0,...events.map(e=>e.ward||0)),liveStart,approach,changedSide,recent,returns,missFinish,finalExposureExpired,damage,mouths,events,hopped,breaks:G.boss.courtBreaks,hp:G.boss.hp,bossDead:G.boss.dead,attunement:hasCapability('attunement'),weapon:G.p.weapon&&G.p.weapon.name,elapsed:G.time,blood:G.p.blood,testMode:!!meta.testMode,invulnerable,attemptLost:G.p.x<13000,player:[G.p.x,G.p.y],dead:G.p.dead};
}
