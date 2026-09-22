/* Bladefall — the co-op journey (7.169).
   Two knights on one shared run: the host's world is the truth, the friend's
   actions change it, and whichever knight reaches an exit takes both through.
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
   - Travel: whichever knight reaches an exit, the host takes both through; the guest
     lands beside the host (coopBroadcastStage / coopEnterStage).
   - Actions: the guest's Up interactions that change the world, lever pulls, ground
     pounds, weight on plates, its Echo and crumbling footing all act on the host's world.
   - Abilities earned by either knight are shared (coopBroadcastCaps). */
function coopSessionPacket(){
  if(!G)return null;
  return{caps:[...((G.sessionCapabilities||meta.capabilities||{}).acquired||[])],
    zone:G.sessionZoneState||BFZoneStateModule.createState(),cleared:[...(G.sessionClearedZones||[])],
    deepLineReturn:!!G.deepLineReturn};
}
function applyCoopSession(sess){
  if(!G||!sess)return;
  G.coopSession=true;G.levelSelectMode=true;G.worldProgressEligible=false;G.leaderboardEligible=false;
  const acquired=Array.isArray(sess.caps)?sess.caps.map(String):['jump'];
  G.sessionCapabilities=BFCapabilitiesModule.createState({acquired,history:acquired.map(id=>({id,source:'co-op-session'}))});
  G.sessionZoneState=BFZoneStateModule.createState(JSON.parse(JSON.stringify(sess.zone||{})));
  G.sessionClearedZones=Array.isArray(sess.cleared)?sess.cleared.map(String):[];
  G.deepLineReturn=!!sess.deepLineReturn;
  if(G.p){syncMovementCapabilities(G.p);syncWeaponCapabilities(G.p);ensureTwoWeaponArsenal(G.p);}
}
function coopBroadcastStage(reason,endpoint){
  if(!coopActive()||!NET.isHost()||!G||!G.p)return false;
  if(NET.stageSeed==null)NET.stageSeed=G.stageSeed!=null?G.stageSeed:BFSimulationModule.createSeed();
  netSend({t:'coopStage',reason:reason||'seam',i:G.stageIndex,endpoint:endpoint||null,seed:NET.stageSeed,
    ng:G.ngPlus||0,x:Math.round(G.p.x),y:Math.round(G.p.y),face:G.p.face||1,session:coopSessionPacket()});
  return true;
}
function coopEnterStage(m){
  if(!NET.isGuest())return;
  NET.stageSeed=m.seed;
  /* A resume for the region you are already playing is a handshake that crossed the start
     (the friend's hello answered after the host pressed Start). Reloading would throw away
     the region, and placing you beside where the host stood when it sent that would drag
     both knights back to the entrance. Keep the session current and play on. */
  if(m.reason==='resume'&&G&&G.coopSession&&G.stageIndex===m.i&&mode==='play'&&G.p&&!G.p.dead){
    applyCoopSession(m.session);return;
  }
  if(!G||m.reason==='start'||m.reason==='resume'&&(!G||!G.coopSession)){
    beginRun(m.ng||0,null,{hp:1,dmg:1},{startStage:m.i,levelSelect:true,coop:true,coopSession:m.session});
  }else{
    applyCoopSession(m.session);
    const snap=snapOf(G.p);
    G.zonePersistenceManifest=null;               // the host's state is the truth; don't capture over it
    G._pendingZoneEndpoint=m.endpoint||undefined;
    loadStage(m.i);delete G._pendingZoneEndpoint;
    if(snap)restorePlayer(snap);
  }
  const p=G.p,side=(m.face||1)>0?-1:1;
  p.x=Math.max(30,Math.min((G.levelLength||m.x+100)-30,m.x+side*44));p.y=m.y||0;p.vx=0;p.vy=0;
  p.face=m.face||1;p.onGround=false;p.floorPlat=null;p.ckX=p.x;p.ckY=p.y;p.ckSet=true;
  p.dead=false;p.downed=false;p.invuln=1.2;restoreBlood(p,Infinity);
  if(NET.ghost){Object.assign(NET.ghost,{x:m.x,y:m.y||0,tx:m.x,ty:m.y||0,stage:m.i,downed:false,dead:false,synced:true});
    if(NET.remoteBuffer)NET.remoteBuffer.clear();}
  mode='play';showOverlay(false);showGameUI(true);hudUpdate();
  try{syncLevelMusic(true);}catch(_e){}
}
function coopBroadcastCaps(){
  if(!coopActive()||!G||!G.coopSession)return;
  netSend({t:'caps',a:[...((G.sessionCapabilities||{}).acquired||[])]});
}
function coopMergeCaps(list){
  if(!G||!G.coopSession||!Array.isArray(list))return;
  const mine=(G.sessionCapabilities||{}).acquired||[],union=[...new Set([...mine,...list.map(String)])];
  if(union.length===mine.length)return;
  G.sessionCapabilities=BFCapabilitiesModule.createState({acquired:union,history:union.map(id=>({id,source:'co-op-partner'}))});
  syncMovementCapabilities(G.p);syncPortalCapabilities();syncWeaponCapabilities(G.p);ensureTwoWeaponArsenal(G.p);hudUpdate();
  const got=union.filter(id=>!mine.includes(id)).map(capabilityLabel).join(', ');
  if(got)toast('<b style="color:#d8b7ff">SHARED ABILITY · '+escText(got.toUpperCase())+'</b><br>Your partner earned it; you carry it too.');
}
function coopSendSeamIntent(m){
  if(!G)return;
  if((G._coopSeamIntentAt||-9)>G.time-1.2)return;
  G._coopSeamIntentAt=G.time;
  netSend({t:'seamIntent',...m});
  if(!G._coopSeamToastAt||G.time-G._coopSeamToastAt>6){G._coopSeamToastAt=G.time;toast('Taking you both through…');}
}
/* Which Up targets change the SHARED world (and so must run on the host). Talking,
   reading and a relic you find for yourself stay on your own screen. */
function coopHostRunsInteraction(o){
  return !!(o&&(o.courtAction||o.frostMineDoor||o.frostMusterEngine||o.frostDamperLever||o.frostSeam||
    o.frostReturn||o.frostReturnExit||o.keepWallJump||o.keepVaultKey||o.sentinelVigil||o.recallReserve||
    o.shipPart||o.throneBoat||o.rainShortcut||o.rainShortcutReturn||o.repairCatch||o.keepDropRelease||
    o.aeriePackRelease||o.choirDamper||o.windCollector));
}
function coopSendUpIntent(o){
  if(!G||!o)return;
  const i=G.obstacles.indexOf(o);if(i<0)return;
  netSend({t:'upIntent',i,type:o.type||null,x:Math.round(o.x||0)});
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
function coopHostUpIntent(m){
  if(!NET.isHost()||!G||mode!=='play')return;
  const o=G.obstacles[m.i],g=NET.ghost;
  if(!o||!g||g.stage!==G.stageIndex||(m.type&&o.type!==m.type)||Math.abs((o.x||0)-(m.x||0))>2)return;
  if(Math.abs(g.x-o.x)>200||Math.abs((g.y||0)-(o.y||0))>220)return;
  coopAsGhost(()=>{
    if(o.shipPart)return interactShipPart(o);
    if(o.throneBoat)return interactThroneBoat(o);
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
  if(!NET.isHost()||!G||G.physicalSeamCrossing||mode!=='play')return;
  const g=NET.ghost;if(!g||g.stage!==G.stageIndex)return;
  if(m.branch){if(beginPhysicalBranchTransition(m.connector,m.zone,null))toast('Your partner leads the way.');return;}
  const p=G.p,save={x:p.x,y:p.y,face:p.face};
  Object.assign(p,{x:g.x,y:g.y,face:g.face||p.face});
  let spec=null;try{spec=physicalSeamSpec();}finally{Object.assign(p,save);}
  if(!spec||!spec.cross||spec.connector!==m.connector)return;
  if(spec.requires&&!hasCapability(spec.requires))return;
  if(spec.requiresWorld&&!worldRequirementOpen(spec.requiresWorld))return;
  toast('Your partner leads the way.');
  updatePhysicalWorldSeams(spec);   // the host's own crossing path, fed the partner's exit
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
      cleared:[...((meta.world&&meta.world.cleared)||[])],deepLineReturn:!!meta.run.deepLineReturn};
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
    const locked=!dev&&i<14&&i>reach;
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
