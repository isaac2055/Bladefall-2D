/* Bladefall — the co-op journey (7.169).
   Two knights on one shared run: the host's world is the truth, the friend's
   actions change it, and both knights must finish before crossing together.
   These are plain script-scope functions over the game's globals (G, NET, meta,
   loadStage, beginRun…) and are only ever called at run time, after index.html's
   main script has defined them. They live here, not in index.html, to keep the
   page inside its release size budget. The network layer itself (NET, netHost,
   netJoin, netOnMessage, netTick, downs and revives) stays in index.html. */
/* ==================== CO-OP JOURNEY (7.169) ====================
   Owner: "Please add co-op back into the game. This way, I can show my friend the game
   without him going crazy by showing him the way + helping him (so actions should be
   shared, only way it is really co-op.)"
   ONE WORLD, TWO KNIGHTS. The host's machine owns the world; both machines build every
   region from the same seed and the same session state (kit, zone state, clears), so the
   shared world stays aligned object for object. A co-op journey is a SESSION, like Level
   Select: it never writes either player's campaign save or Continue.
   - Travel: each knight reaches the exit independently. Controls and cameras remain free.
     The host commits a crossing only after both arrive. Recovery and portals are personal.
   - Actions: the guest's Up interactions that change the world, lever pulls, ground
     pounds, weight on plates, its Echo and crumbling footing all act on the host's world.
   - Abilities earned by either knight are shared (coopBroadcastCaps). */
function coopSessionPacket(){
  if(!G)return null;
  return{stage:G.stageIndex,caps:[...((G.sessionCapabilities||meta.capabilities||{}).acquired||[])],
    zone:G.sessionZoneState||BFZoneStateModule.createState(),cleared:[...(G.sessionClearedZones||[])],
    deepLineReturn:!!G.deepLineReturn,sideStories:BladefallSideStories.normalize(G.sessionSideStories),sideStoryRevision:G.sideStoryRevision||0,sideStoryGuestRewards:Object.values(G._sideStoryGuestReceipts||{}),precision:BladefallCeleste.coopSnapshot()};
}
function applyCoopSession(sess,preserve=false){
  if(!G||!sess)return;
  G.coopSession=true;G.levelSelectMode=true;G.worldProgressEligible=false;G.leaderboardEligible=false;
  const acquired=[...new Set([...(preserve?(G.sessionCapabilities?.acquired||[]):[]),...(Array.isArray(sess.caps)?sess.caps.map(String):['jump'])])];
  if(sess.stage===G.stageIndex&&[21,22].includes(G.stageIndex)){const allowed=G.stageIndex===21?['jump']:['jump','weapon'];for(let i=acquired.length-1;i>=0;i--)if(!allowed.includes(acquired[i]))acquired.splice(i,1);}
  G.sessionCapabilities=BFCapabilitiesModule.createState({acquired,history:acquired.map(id=>({id,source:'co-op-session'}))});
  G.sessionZoneState=BFZoneStateModule.createState(JSON.parse(JSON.stringify(sess.zone||{})));
  G.sessionClearedZones=Array.isArray(sess.cleared)?sess.cleared.map(String):[];
  G.deepLineReturn=!!sess.deepLineReturn;
  G.sessionSideStories=BladefallSideStories.normalize(sess.sideStories);G.sideStoryRevision=sess.sideStoryRevision||0;
  G._sideStoryAuthoritative=G.sessionSideStories;G._sideStoryPending=[];
  if(G.sideStoryScene)BladefallSideStoryWorld.apply();
  BladefallSideStoryWorld.receiveRewards(sess.sideStoryGuestRewards);
  if(G.p){syncMovementCapabilities(G.p);syncWeaponCapabilities(G.p);ensureTwoWeaponArsenal(G.p);}
}
function coopBroadcastStage(reason,endpoint){
  if(!coopActive()||!NET.isHost()||!G||!G.p)return false;
  if(NET.stageSeed==null)NET.stageSeed=G.stageSeed!=null?G.stageSeed:BFSimulationModule.createSeed();
  netSend({t:'coopStage',reason:reason||'seam',i:G.stageIndex,endpoint:endpoint||null,seed:NET.stageSeed,
    guestCheckpoint:reason==='resume'?G.coopGuestCheckpoint:null,ng:G.ngPlus||0,x:Math.round(G.p.x),y:Math.round(G.p.y),face:G.p.face||1,session:coopSessionPacket()});
  return true;
}
function coopEnterStage(m){
  if(!NET.isGuest())return;
  NET.stageSeed=m.seed;let freshArrival=null;
  /* A resume for the region you are already playing is a handshake that crossed the start
     (the friend's hello answered after the host pressed Start). Reloading would throw away
     the region, and placing you beside where the host stood when it sent that would drag
     both knights back to the entrance. Keep the session current and play on. */
  if(m.reason==='resume'&&G&&G.coopSession&&G.stageIndex===m.i&&(mode==='play'||mode==='conversation')&&G.p&&!G.p.dead){
    applyCoopSession(m.session,true);if(m.session?.precision)BladefallCeleste.coopReceive({t:'precisionState',state:m.session.precision});return;
  }
  if(!G||m.reason==='start'||m.reason==='resume'&&(!G||!G.coopSession)){
    beginRun(m.ng||0,null,{hp:1,dmg:1},{startStage:m.i,levelSelect:true,coop:true,coopSession:m.session});freshArrival={x:G.p.x,y:G.p.y};
  }else{
    applyCoopSession(m.session,true);
    const snap=snapOf(G.p);
    G.zonePersistenceManifest=null;               // the host's state is the truth; don't capture over it
    G._pendingZoneEndpoint=m.endpoint||undefined;
    loadStage(m.i);delete G._pendingZoneEndpoint;freshArrival={x:G.p.x,y:G.p.y};
    if(snap)restorePlayer(snap);
  }
  const p=G.p,side=(m.face||1)>0?-1:1;
  const own=m.reason==='resume'?(m.guestCheckpoint?.stage===m.i?m.guestCheckpoint:freshArrival):null;
  p.x=Math.max(30,Math.min((G.levelLength||m.x+100)-30,m.x+(([41,42,44].includes(m.i))?0:side*44)));p.y=m.y||0;p.vx=0;p.vy=0;
  if(own){p.x=own.x;p.y=own.y;}
  p.face=m.face||1;p.onGround=false;p.floorPlat=null;p.ckX=p.x;p.ckY=p.y;p.ckSet=true;
  p.dead=false;p.downed=false;p.invuln=1.2;restoreBlood(p,Infinity);
  if(NET.ghost){Object.assign(NET.ghost,{x:m.x,y:m.y||0,tx:m.x,ty:m.y||0,stage:m.i,downed:false,dead:false,synced:true});
    if(NET.remoteBuffer)NET.remoteBuffer.clear();}
  mode='play';showOverlay(false);showGameUI(true);hudUpdate();
  if(m.session?.precision)BladefallCeleste.coopReceive({t:'precisionState',state:m.session.precision});
  try{syncLevelMusic(true);}catch(_e){}
}
function coopBroadcastCaps(){
  if(!coopActive()||!G||!G.coopSession)return;
  netSend({t:'caps',a:[...((G.sessionCapabilities||{}).acquired||[])]});
}
function coopMergeCaps(list){
  if(!G||!G.coopSession||!Array.isArray(list))return;
  if([21,22].includes(G.stageIndex)){const allowed=G.stageIndex===21?['jump']:['jump','weapon'];list=list.filter(id=>allowed.includes(id));}
  const mine=(G.sessionCapabilities||{}).acquired||[],union=[...new Set([...mine,...list.map(String)])];
  if(union.length===mine.length)return;
  G.sessionCapabilities=BFCapabilitiesModule.createState({acquired:union,history:union.map(id=>({id,source:'co-op-partner'}))});
  syncMovementCapabilities(G.p);syncPortalCapabilities();syncWeaponCapabilities(G.p);ensureTwoWeaponArsenal(G.p);hudUpdate();
  const got=union.filter(id=>!mine.includes(id)).map(capabilityLabel).join(', ');
  if(got)toast('<b style="color:#d8b7ff">SHARED ABILITY · '+escText(got.toUpperCase())+'</b><br>Your partner earned it; you carry it too.');
}
// Reaching an exit registers readiness without pausing, tethering or moving either knight.
function coopExitPresent(row,body){return !!(row&&body&&!body.dead&&!body.downed&&Math.abs(body.x-row.x)<200&&Math.abs((body.y||0)-row.y)<240);}
function coopExitKey(row){return row&&[row.stage,row.kind,row.connector,row.zone].join(':');}
function coopExitRequest(kind,spec,sourceObject){
 if(!G.coopSession||!coopActive()||G._coopExitCommit)return true;
 const row={stage:G.stageIndex,seed:G.stageSeed,kind,connector:spec.connector,zone:spec.zone,spec,
  object:sourceObject?G.obstacles.indexOf(sourceObject):-1,x:G.p.x,y:G.p.y};
 const old=G.coopExitLocal;
 G.coopExitLocal=row;
 if(!old||coopExitKey(old)!==coopExitKey(row)||Date.now()-(G.coopExitSentAt||0)>300){
  G.coopExitSentAt=Date.now();netSend({t:'seamIntent',...row});
  if(!old)toast('Reach this exit together. You can keep moving while your partner catches up.');
 }
 if(NET.isGuest())return false;
 return coopExitBothReady();
}
function coopExitBothReady(){
 const a=G.coopExitLocal,b=G.coopExitRemote,g=NET.ghost;
 return !!(a&&b&&g?.stage===G.stageIndex&&coopExitKey(a)===coopExitKey(b)&&
  !G.p.dead&&!G.p.downed&&!g.dead&&!g.downed&&Math.abs(a.x-b.x)<240&&Math.abs(a.y-b.y)<260);
}
function coopTryPendingExit(){
 if(!G||!NET.isHost()||G.physicalSeamCrossing||!coopExitBothReady())return;
 const row=G.coopExitLocal;G._coopExitCommit=true;
 try{
  if(row.kind==='branch')beginPhysicalBranchTransition(row.connector,row.zone,G.obstacles[row.object]);
  else if(row.kind==='ship'){launchTheShip();}
  else if(row.kind==='ending'){netSend({t:'coopFinish',stage:G.stageIndex,key:row.connector});G.coopEndAction?.();G.coopExitLocal=null;G.coopExitRemote=null;}
  else if(row.kind==='portal')coopMaybePrepareStage();
  else updatePhysicalWorldSeams(row.spec);
 }finally{G._coopExitCommit=false;}
}
function coopSendSeamIntent(m){return coopExitRequest(m.branch?'branch':'seam',m);}
/* Which Up targets change the SHARED world (and so must run on the host). Talking,
   reading and a relic you find for yourself stay on your own screen. */
function coopHostRunsInteraction(o){
  return !!(o&&((o.courtAction==='wheel')||o.frostMusterEngine||o.frostDamperLever||o.keepWallJump||o.keepVaultKey||o.sentinelVigil||o.recallReserve||
    o.shipPart||o.repairCatch||o.keepDropRelease||
    o.aeriePackRelease||o.choirDamper||o.windCollector));
}
function coopSendUpIntent(o,strike=false){
  if(!G||!o)return;
  const i=G.obstacles.indexOf(o);if(i<0)return;
  netSend({t:'upIntent',i,type:o.type||null,x:Math.round(o.x||0),strike});
}
/* Run an action AS the partner: the host's knight stands where the guest stands for the
   length of the call, so every distance check and effect happens at the guest's side.
   Anything the action shows is forwarded; if it moved the actor, the guest is moved. */
function coopAsGhost(fn){
  const p=G&&G.p,g=NET.ghost;if(!p||!g)return false;
  const saved={x:p.x,y:p.y,vx:p.vx,vy:p.vy,face:p.face,onGround:p.onGround,floorPlat:p.floorPlat,ckX:p.ckX,ckY:p.ckY,ckSet:p.ckSet};
  const start={x:g.x,y:g.y};
  Object.assign(p,{x:g.x,y:g.y,face:g.face||p.face});
  NET.noteCapture=[];let moved=null,result=false;
  try{result=fn();}
  finally{
    if(Math.abs(p.x-start.x)>2||Math.abs(p.y-start.y)>2)moved={x:Math.round(p.x),y:Math.round(p.y)};
    Object.assign(p,saved);
    const notes=NET.noteCapture||[];NET.noteCapture=null;
    for(const n of notes.slice(-3))netSend({t:'note',...n});
    if(moved)netSend({t:'teleport',...moved});
  }
  return result;
}
function coopSendDeviceIntent(o,action,pr){
  if(!o||!pr||pr.life<=0)return false;
  netSend({t:'upIntent',i:G.obstacles.indexOf(o),type:o.type,x:Math.round(o.x||0),action,
    projectile:{owner:'player',shape:pr.shape,sourceType:pr.sourceType,watchShot:!!pr.watchShot,
      reflected:!!pr.reflected,portalHops:pr.portalHops||0,markedRangeShot:!!pr.markedRangeShot,vx:pr.vx}});
  pr.life=0;return true;
}
function coopHostUpIntent(m){
  if(!NET.isHost()||!G||(mode!=='play'&&mode!=='conversation'))return;
  const o=G.obstacles[m.i],g=NET.ghost;
  if(!o||!g||g.stage!==G.stageIndex||(m.type&&o.type!==m.type)||Math.abs((o.x||0)-(m.x||0))>2)return;
  if(!m.action&&!m.strike&&(Math.abs(g.x-o.x)>200||Math.abs((g.y||0)-(o.y||0))>220))return;
  const devices={strikeBruteWakeLever,strikeBruteDropRelease,resolveMarksmanTarget};
  if(m.action){if(Object.prototype.hasOwnProperty.call(devices,m.action)&&m.projectile)devices[m.action](o,{...m.projectile,life:1});return;}
  coopAsGhost(()=>{
    if(o.type==='lever'){pullLever(o);return true;}
    if(o.shipPart)return interactShipPart(o);
    if(o.throneBoat)return false; // Boarding requires each player's own presence and consent.
    if(o.recallReserve)return interactRecallReserve(o);
    return beginOutskirtsInteraction(o);
  });
  coopSendZoneSync();
}
function coopSendZoneSync(){
  if(!coopActive()||!NET.isHost()||!G||!G.coopSession)return;
  netSend({t:'zoneSync',zone:G.sessionZoneState||null,caps:[...((G.sessionCapabilities||{}).acquired||[])]});
}
function coopHostSeamIntent(m){
 if(!G||!G.coopSession||m.stage!==G.stageIndex||!['seam','branch','ship','portal','ending'].includes(m.kind))return;
 // Reliable completion can arrive before the next interpolated body snapshot.
 const g=NET.ghost;if(!g||m.seed!==G.stageSeed||!Number.isFinite(m.x)||!Number.isFinite(m.y))return;
 G.coopExitRemote=m;
 if(NET.isHost())coopTryPendingExit();
}
/* A partner standing on a crumbling ledge wears it out on the host too. */
function coopGhostFooting(){
  if(!coopActive()||!NET.isHost()||!G)return;
  const g=NET.ghost;if(!g||!g.onGround||g.stage!==G.stageIndex||g.flipped)return;
  for(const o of G.obstacles){
    if(o.type!=='plat'||!o.crumble||o.crT||o.gone)continue;
    if(Math.abs(g.x-o.x)<o.w/2+10&&Math.abs((g.y||0)-(o.y||0))<10){
      o.crDur=o.railCollapse?(o.collapseDelay||1.25):(o.ngFast?0.3:0.45);o.crT=o.crDur;
    }
  }
}
/* The journey's own recovery state (checkpoints, deaths): a copy of the save's, taken on
   first use, so nothing a co-op journey touches reaches either player's Continue. */
function coopRecoveryState(){
  if(!G.coopRecovery)G.coopRecovery=JSON.parse(JSON.stringify(meta.recovery));
  return G.coopRecovery;
}
function coopQuitJourney(){
  if(!coopActive()||!G||!G.coopSession||G._coopQuitSent)return;
  G._coopQuitSent=true;netSend({t:'coopQuit'});
}

/* --- Co-op menu: starting a shared journey ----------------------- */
function coopStartRun(kind,stage){
  if(!coopActive()||!NET.isHost())return false;
  let i=0,session=null,spot=null;
  if(kind==='continue'&&meta.run&&STAGES[meta.run.stageIndex]){
    i=meta.run.stageIndex;
    // The host's own journey, as a copy: its kit, its world, its clears. Nothing is
    // written back, so the real save is exactly as it was when you come home.
    session={caps:[...((meta.capabilities||{}).acquired||['jump'])],
      zone:BFZoneStateModule.createState(JSON.parse(JSON.stringify(meta.zoneState||{}))),
      cleared:[...((meta.world&&meta.world.cleared)||[])],deepLineReturn:!!meta.run.deepLineReturn,sideStories:BladefallSideStories.normalize(meta.sideStories)};
    const rp=runRecoveryPoint(meta.run);if(rp)spot=rp.position;
  }else if(kind==='select')i=Math.max(0,Math.min(STAGES.length-1,Math.floor(Number(stage)||0)));
  NET.stageSeed=BFSimulationModule.createSeed();
  beginRun(0,null,{hp:1,dmg:1},{startStage:i,levelSelect:true,coop:true,coopSession:session});
  if(spot&&G&&G.p){Object.assign(G.p,{x:spot.x,y:spot.y,vx:0,vy:0,ckX:spot.x,ckY:spot.y,ckSet:true});}
  coopBroadcastStage('start');
  return true;
}
function openCoopRegionPicker(){
  if(!coopActive()||!NET.isHost()){openCoop();return;}
  const dev=!!meta.devUnlocked,reach=dev?15:Math.max(0,Number(meta.reach&&meta.reach[0])||Number(meta.bestStage)||0);
  const rows=STAGES.map((st,i)=>{
    if(!st||st.cut)return '';
    if(i===15&&!(meta.secretCleared||dev||reach>=13))return '';
    const locked=i<41&&!dev&&((i<14&&i>reach)||(i>=16&&(!meta.actTwoReached||i>Math.max(16,reach))));
    return `<button class="bigbtn ghost coopRegionBtn" data-stage="${i}" ${locked?'disabled style="opacity:.35"':''}
      style="margin:4px 0;padding:9px 12px;font-size:14px;text-align:left;">${String(i+1).padStart(2,'0')} · ${escText(st.name)}${locked?' · not reached':''}</button>`;
  }).join('');
  showOvHTML(`<div class="card"><h2 class="ovh">Choose a Region</h2>
    <p class="ovsub">You both begin here with everything a journey to it would hold.</p>
    <div style="max-height:52vh;overflow:auto;">${rows}</div>
    <button class="bigbtn ghost" id="coopRegionBack">Back</button></div>`);
  for(const b of document.querySelectorAll('.coopRegionBtn'))if(!b.disabled)b.onclick=()=>coopStartRun('select',Number(b.dataset.stage));
  const back=document.getElementById('coopRegionBack');if(back)back.onclick=openCoop;
}

function coopFinishTogether(key,finish){
 if(!G?.coopSession||!coopActive()||G._coopExitCommit||NET.stageAdvancing)return true;
 G.coopEndAction=finish;
 if(coopExitRequest('ending',{connector:key,zone:String(G.stageIndex)})){coopTryPendingExit();}
 return false;
}
function coopPersonalRecovery(){
 if(!G?.p)return;const p=G.p;
 p.x=p.ckSet?p.ckX:(p.safeX||120);p.y=p.ckSet?(p.ckY||0):0;
 Object.assign(p,{vx:0,vy:0,floorPlat:null,onGround:false,actHook:null,seamRide:null,slamming:false,dodgeTimer:0,jumpBuf:0,dashBuf:0});
 G.coopExitLocal=null;G.gravityFlipped=false;coopRevive(p,true);restoreBlood(p,Infinity);clearPlacedPortals(false);
}
