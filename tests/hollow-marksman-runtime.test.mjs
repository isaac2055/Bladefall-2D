import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const read=name=>readFile(new URL('../public/'+name,import.meta.url),'utf8');
const source=await read('index.html');
function block(prefix,body=false){
  const start=source.indexOf(prefix);assert.ok(start>=0,prefix+' exists');
  const brace=source.indexOf('{',start);let depth=0;
  for(let i=brace;i<source.length;i++){
    if(source[i]==='{')depth++;
    else if(source[i]==='}'&&--depth===0)return body?source.slice(brace+1,i):source.slice(start,i+1);
  }
  throw Error('unterminated '+prefix);
}
const fn=name=>block('function '+name+'(');
const moduleNames=['progression','capabilities','portal-progression','portals','blood','echoes','quests','platformer','movement-progression'];
const systems=vm.runInNewContext((await Promise.all(moduleNames.map(name=>read('bladefall-'+name+'.js')))).join('\n')+
  ';({capabilities:BladefallCapabilities,portalProgression:BladefallPortalProgression,portals:BladefallPortals,'+
  'blood:BladefallBlood,echoes:BladefallEchoes,quests:BladefallQuests,platformer:BladefallPlatformer,movement:BladefallMovementProgression})');
const stageStart=source.indexOf('const HOLLOW_MARKSMAN_LEVEL='),stageEnd=source.indexOf('\n/*',stageStart),
  constructors=['Pl','Gr','Wl','Slate','Check','Cry','Lever','LPortal','Anchor','DoorSeal','MarksmanTarget','KeepBeat','Scenery'];
const authored=vm.runInNewContext(constructors.map(fn).join('\n')+'\n'+source.slice(stageStart,stageEnd)+';HOLLOW_MARKSMAN_LEVEL',{
  AmbientFigure:(x,y,kind,o)=>({type:'ambientFigure',x,y,kind,...o}),
  StoryRelic:(x,y,memoryId,o)=>({type:'storyRelic',x,y,memoryId,...o}),
  SealedRecollection:(x,y,id,title,o)=>({type:'storyRelic',x,y,id,title,...o}),
  LoreMarker:(x,y)=>({type:'sign',x,y}),STAGE_LORE:{4:{}},BFDialogueModule:{text:id=>id}
});

function harness(levelSelect=false){
  const boss={type:'archer',boss:true,x:14500,y:0,w:62,h:78,hp:300,maxHp:300,dmg:20,xp:100,
    face:-1,shootT:0,phase:1,shot:{count:3,spread:.12,speed:600,size:5,color:'#e6d28a',shape:'arrow'}},
    owned=systems.capabilities.createState({acquired:['jump','weapon','dash','portal-single']}),
    G={stageIndex:4,ngPlus:0,worldProgressEligible:!levelSelect,levelSelectMode:levelSelect,boss,
      p:{x:13200,y:0,w:28,h:44,vx:0,vy:0,blood:4,maxBlood:5,hp:80,bloodGuard:0,
        invuln:0,dodgeTimer:0,cloakT:0,starT:0,face:1},
      obstacles:JSON.parse(JSON.stringify(authored.objects)),particles:[],projectiles:[],cratePortals:[],
      enemies:[boss],pickups:[],aoes:[],shake:0,time:0,kills:0},
    meta={soundOn:false,capabilities:levelSelect?systems.capabilities.freshState():owned,
      totalKills:0,bossKills:0,gold:0},circuits=new Set(),receipts=[],cleared=[],events=[],notices=[],saved=[];
  if(levelSelect)G.sessionCapabilities=owned;
  const context=vm.createContext({G,meta,GROUND_Y:700,VW:1024,BFCachedPortalProfile:{},V4_LAST_STAGE:9,v4Region:i=>i>=0&&i<=9,
    BFCapabilitiesModule:systems.capabilities,BFPortalProgressionModule:systems.portalProgression,
    BFPortalSystem:systems.portals.createPortalSystem(),BFBloodModule:systems.blood,
    BFWorldModule:{stageId:()=> 'hollow-marksman'},BFPortalProgression:{recordTransit:()=>{}},
    activeCapabilityProgress:()=>G.sessionCapabilities||meta.capabilities,
    hasCapability:id=>systems.capabilities.has(G.sessionCapabilities||meta.capabilities,id),
    persistentCircuitOpen:id=>circuits.has(id),markPersistentCircuitOpen:(id,reason)=>{circuits.add(id);receipts.push({id,reason});},
    clearPlacedPortals:(_,reason)=>{G.cratePortals=[];cleared.push(reason);},
    recordQuestEvent:event=>events.push(event),BFAISystem:{lineOfSight:()=>true},enemyGroundStep:(_,dx)=>dx,
    ngRemixPlayerTransit:()=>{},ngRemixEnemyTransit:()=>{},resolveEchoEvent:()=>{},
    defenseR:()=>0,vitalityKnotCount:()=>0,effMaxHp:()=>100,hasGift:()=>false,
    buzz:()=>{},addText:()=>{},persist:()=>{},hudUpdate:()=>{},toast:s=>notices.push(s),
    coopActive:()=>false,tryPlayerCounter:()=>false,
    syncMovementCapabilities:()=>{},syncPortalCapabilities:()=>{},syncWeaponCapabilities:()=>{},
    capabilityLabel:id=>id,snapOf:p=>JSON.parse(JSON.stringify(p)),saveRunAtStage:(_,snap)=>saved.push(snap)
  });
  vm.runInContext(constructors.map(fn).join('\n')+'\n'+[
    'bossArena','registerCircuits','circuitOpen','doorOpen','lportalOpen','portalProgressionProfile',
    'portalPairs','portalTransit','portalBurst','marksmanArrowCoverHit','resolveMarksmanTarget','beginMarksmanRangefinderBreak',
    'updateMarksmanPortalFight','updateMarksmanShot','updateMarksmanCover','normalizeMarksmanAttemptAfterHydration','updateMarksmanRoadEnemy',
    'bossShoot','railSniperShoot','platTop','getFloor','getEnemyFloor','hurtPlayer','syncBloodMirror',
    'grantPermanentCapability','restoreBlood','markSecondMouthProof','restoreMarksmanVictory'
  ].map(fn).join('\n')+';bossArena(G.boss);registerCircuits();'+
    ';function routeProjectile(pr){const dt=1/60;'+block('{const pex=portalTransit(pr,dt,true);',true)+'}'+
    ';function collideShot(pr){const p=G.p;'+block('      if(p.invuln<=0&&p.dodgeTimer<=0&&p.cloakT<=0&&p.starT<=0&&Math.abs(p.x-pr.x)')+'}',context);
  const advanceStart=source.indexOf('    const projectilePrevX=pr.x,projectilePrevY=pr.y;'),
    advanceEnd=source.indexOf('    // Watch-road hardware listens',advanceStart);
  assert.ok(advanceStart>=0&&advanceEnd>advanceStart);
  vm.runInContext('function advanceArrow(pr,dt){for(const pr of [arguments[0]]){'+
    source.slice(advanceStart,advanceEnd)+'}}',context);
  return{context,G,meta,boss,circuits,receipts,cleared,events,notices,saved};
}

test('one successful rangefinder break atomically replaces the perch with moving cover and a weapon duel',()=>{
  const h=harness(),lens=h.G.obstacles.find(o=>o.marksmanTarget==='rangefinder'),
    perch=h.G.obstacles.find(o=>o.marksmanPerch),covers=h.G.obstacles.filter(o=>o.marksmanRailCover);
  assert.equal(h.boss.marksmanState,'warded');assert.ok(covers.every(o=>o.gone));
  assert.equal(h.context.beginMarksmanRangefinderBreak(h.boss,lens),true);
  assert.equal(h.boss.active,true);assert.equal(h.boss.marksmanState,'transform');
  assert.equal(lens.broken,true);assert.equal(perch.gone,true);assert.equal(h.boss.ignoreRaisedPlatforms,true);
  assert.ok(covers.every(o=>!o.gone&&o.move&&o.x===o.x0&&o.y===o.y0));
  assert.deepEqual(h.cleared,['rangefinder-break']);
  assert.equal(h.context.beginMarksmanRangefinderBreak(h.boss,lens),false,'the same break cannot replay');
  assert.equal(h.cleared.length,1);
  h.context.updateMarksmanPortalFight(h.boss,h.G.p,2,90);
  assert.equal(h.boss.marksmanState,'hunt');assert.equal(h.boss.portalGate,null);
  assert.equal(h.boss.hp,h.boss.maxHp,'the puzzle changes the encounter without a hidden health skip');
  assert.equal(h.context.getEnemyFloor(h.boss,1000).y,0,'the duelist lands at arena ground through raised cover');
});

test('retry hydration preserves the road release but restores a fresh warded boss mechanism',()=>{
  const h=harness(),lens=h.G.obstacles.find(o=>o.marksmanTarget==='rangefinder'),
    perch=h.G.obstacles.find(o=>o.marksmanPerch),covers=h.G.obstacles.filter(o=>o.marksmanRailCover),
    road=h.G.obstacles.find(o=>o.marksmanTarget==='road-release');
  Object.assign(lens,{timer:1e9,broken:true});perch.gone=true;
  for(const cover of covers)Object.assign(cover,{gone:false,fallT:.2,move:cover.railMove,x:cover.x+80,y:cover.y+100});
  road.timer=1e9;h.circuits.add('mantlet-release');
  h.context.normalizeMarksmanAttemptAfterHydration();
  assert.equal(lens.timer,0);assert.equal(lens.broken,false);assert.equal(perch.gone,false);
  assert.ok(covers.every(o=>o.gone&&o.move===null&&o.fallT===null&&o.x===o.x0&&o.y===o.y0));
  assert.equal(h.boss.marksmanState,'warded');assert.equal(h.boss.portalGate,'rangefinderBreak');
  assert.equal(h.context.circuitOpen('mantlet-release'),true);assert.equal(road.timer,1e9);
});

test('authored watch arrows and boss arrows each cause one Blood wound with a contact guard',()=>{
  for(const bossShot of [false,true]){
    const h=harness();
    if(bossShot)h.context.bossShoot(h.boss,h.G.p);
    else h.context.railSniperShoot({type:'gargoyle',x:6730,y:340,h:44,watchSniper:true,
      railAimX:7200,railAimY:22,dmg:200,shot:{speed:560,size:5,color:'#e6d28a',shape:'arrow'}});
    const pr=h.G.projectiles[0];Object.assign(pr,{x:h.G.p.x,y:h.G.p.y+h.G.p.h/2});
    h.context.collideShot(pr);
    assert.equal(h.G.p.blood,3);assert.equal(h.G.p.hp,60);assert.equal(pr.life,0);
    assert.ok(h.G.p.invuln>0);assert.equal(h.G.p.x,13200,'direct shots never rewind the room');
    h.context.collideShot({...pr,life:2});assert.equal(h.G.p.blood,3,'overlapping arrows cannot double charge a wound');
  }
});

test('road and rangefinder receivers accept only their own live arrow after an actual portal hop',()=>{
  for(const kind of ['road-release','rangefinder']){
    const h=harness(),target=h.G.obstacles.find(o=>o.marksmanTarget===kind),
      arrow={owner:'enemy',sourceType:kind==='road-release'?'watchSniper':'archer',shape:'arrow',
        watchShot:kind==='road-release',markedRangeShot:kind==='rangefinder',reflected:true,portalHops:1,life:4};
    for(const override of [{reflected:false},{portalHops:0},
      {sourceType:'grunt'},{watchShot:false,markedRangeShot:false}]){
      assert.equal(h.context.resolveMarksmanTarget(target,{...arrow,...override}),false,JSON.stringify(override));
      assert.equal(target.timer,0,'rejected arrows never latch or partially solve hardware');
      assert.equal(h.boss.rangefinderBroken,false);
    }
    const other=kind==='road-release'
      ?{...arrow,watchShot:false,markedRangeShot:true,sourceType:'archer'}
      :{...arrow,watchShot:true,markedRangeShot:false,sourceType:'watchSniper'};
    assert.equal(h.context.resolveMarksmanTarget(target,other),false,'the two mechanisms cannot accept each other’s ammunition');
    assert.equal(h.context.resolveMarksmanTarget(target,arrow),true);assert.equal(arrow.life,0);
    assert.ok(target.timer>0);
    const receipts=h.receipts.length,cleared=h.cleared.length;
    assert.equal(h.context.resolveMarksmanTarget(target,{...arrow,life:4}),false);
    assert.equal(h.receipts.length,receipts);assert.equal(h.cleared.length,cleared);
  }
  const h=harness(),lens=h.G.obstacles.find(o=>o.marksmanTarget==='rangefinder');h.boss.dead=true;
  assert.equal(h.context.resolveMarksmanTarget(lens,{owner:'enemy',sourceType:'archer',shape:'arrow',
    markedRangeShot:true,reflected:true,portalHops:1,life:3}),false,'a late projectile cannot revive a defeated encounter');
});

test('a single owned mouth redirects real watch ammunition through its authored release anchor',()=>{
  const h=harness(true),slate=h.G.obstacles.find(o=>o.marksmanLinkedSlate==='arrow-intake'),
    target=h.G.obstacles.find(o=>o.marksmanTarget==='road-release'),
    outlet=h.G.obstacles.find(o=>o.marksmanAnchor==='arrow-release');
  Object.assign(h.G.p,{x:slate.x,y:slate.y});
  h.G.cratePortals=[{x:slate.x,y:slate.y,nx:0,ny:1}];
  assert.equal(h.context.portalProgressionProfile().maxPlayerMouths,1);
  assert.equal(h.context.portalPairs().some(pair=>pair.kind==='personal'),false);
  const pr={owner:'enemy',sourceType:'watchSniper',watchShot:true,shape:'arrow',
    x:slate.x,y:slate.y+20,vx:100,vy:-450,size:5,life:4,hitSet:[]};
  h.context.routeProjectile(pr);
  assert.equal(pr.portalHops,1);assert.equal(pr.reflected,true);
  assert.equal(pr._portalExit,outlet);assert.ok(pr.vx>0);assert.equal(pr.vy,0);
  assert.equal(pr.y,target.targetY,'the authored outlet actually points along the release hardware');
  assert.ok(pr.x<target.x,'the outlet leaves a forward flight path');
  pr.x=target.x;
  assert.equal(h.context.resolveMarksmanTarget(target,pr),true);
  assert.equal(h.context.circuitOpen('mantlet-release'),true);
  assert.equal(h.context.portalProgressionProfile().ownsPair,false,'solving the road never grants the boss reward early');
});

test('road windup and committed movement keep the warned direction even after sight is lost',()=>{
  for(const role of ['watch-runner','mantlet-guard']){
    const h=harness(),target={x:1200,y:0,vx:0,h:44},
      e={x:1000,y:0,face:1,marksmanRole:role,watchHomeX:1000,watchCooldown:0,
        watchState:'hold',shieldFace:1,turnDelay:.85,watchTurnT:.85,noticeRange:980};
    h.context.updateMarksmanRoadEnemy(e,target,.01,100);
    assert.equal(e.watchState,'windup');assert.equal(e.watchCommitDir,1);
    const warningX=e.x;target.x=0;h.context.BFAISystem.lineOfSight=()=>false;e.watchAlertT=0;
    h.context.updateMarksmanRoadEnemy(e,target,.1,100);
    assert.equal(e.x,warningX,'windup holds still');assert.equal(e.face,1);
    h.context.updateMarksmanRoadEnemy(e,target,1,100);assert.equal(e.watchState,'commit');
    const committedX=e.x;h.context.updateMarksmanRoadEnemy(e,target,.05,100);
    assert.ok(e.x>committedX,'moving behind cannot redirect the warned strike');assert.equal(e.face,1);
    h.context.updateMarksmanRoadEnemy(e,target,1,100);assert.equal(e.watchState,'recover');
    const recoveryX=e.x;h.context.updateMarksmanRoadEnemy(e,target,.1,100);
    assert.equal(e.x,recoveryX);assert.equal(e.lunge,0);assert.equal(e.face,1);
  }
});

test('watch snipers hold their marked point and facing until release before changing perch',()=>{
  const h=harness(),target={x:7200,y:0,vx:0,h:44},
    e={type:'gargoyle',marksmanRole:'watch-sniper',watchSniper:true,x:6730,y:340,h:44,face:1,
      dmg:20,watchCooldown:0,noticeRange:1200,watchPerches:[[6730,340],[6500,455]],
      shot:{speed:560,size:5,color:'#e6d28a',shape:'arrow'}};
  h.context.updateMarksmanRoadEnemy(e,target,.01,100);
  const tx=e.railAimX,ty=e.railAimY;target.x=6300;target.y=300;
  h.context.updateMarksmanRoadEnemy(e,target,.1,100);
  assert.equal(e.face,1);assert.equal(e.railAimX,tx);assert.equal(e.railAimY,ty);
  h.context.updateMarksmanRoadEnemy(e,target,1,100);
  const pr=h.G.projectiles[0];assert.ok(pr&&pr.watchShot);
  assert.ok(Math.abs(pr.vy/pr.vx-(ty-pr.y)/(tx-pr.x))<1e-9,'the arrow flies along the committed sightline');
  assert.ok(e.watchMoveT>0,'relocation follows the release');
});

test('the warded Marksman visibly draws, commits to the marked centre, and fires one bankable arrow',()=>{
  const h=harness(),target={x:13200,y:0,h:44},tx=target.x,ty=target.y+target.h/2;
  h.context.updateMarksmanShot(h.boss,target,.01,true);
  assert.equal(h.G.projectiles.length,0,'the initial draw is not an immediate hit');
  target.x=14800;target.y=340;
  h.context.updateMarksmanShot(h.boss,target,.1,true);assert.equal(h.G.projectiles.length,0);
  h.context.updateMarksmanShot(h.boss,target,1,true);
  assert.equal(h.G.projectiles.length,1);
  const pr=h.G.projectiles[0];assert.equal(pr.markedRangeShot,true);assert.ok(pr.life>=6);
  const flight=Math.max(.25,Math.abs(tx-pr.x)/h.boss.shot.speed);
  assert.ok(Math.abs(pr.y+pr.vy*flight-ty)<1e-7,'the released arrow keeps the announced target height');
  assert.ok(pr.vx<0,'the bow cannot turn around after its draw');
  assert.equal(h.boss.shot.count,3);assert.equal(h.boss.shot.spread,.12,'temporary one-arrow fire preserves the duel configuration');
});

test('the grounded duel holds its firing position and leaves a punish window after the volley',()=>{
  const h=harness(),lens=h.G.obstacles.find(o=>o.marksmanTarget==='rangefinder');
  h.context.beginMarksmanRangefinderBreak(h.boss,lens);
  h.context.updateMarksmanPortalFight(h.boss,h.G.p,2,90);
  Object.assign(h.boss,{y:0,vy:0,shootT:0,marksmanLeapCd:0});
  h.context.updateMarksmanPortalFight(h.boss,h.G.p,.01,90);
  const x=h.boss.x;
  h.G.p.x=x+300;h.G.p.y=200;
  h.context.updateMarksmanPortalFight(h.boss,h.G.p,.1,90);
  assert.equal(h.boss.x,x);assert.equal(h.boss.vy,0);assert.equal(h.G.projectiles.length,0);
  h.context.updateMarksmanPortalFight(h.boss,h.G.p,.7,90);
  assert.equal(h.G.projectiles.length,3);assert.equal(h.boss.x,x);
  assert.ok(h.boss.marksmanRecoverT>=.6,'the release leaves time to close for a blade hit');
  h.context.updateMarksmanPortalFight(h.boss,h.G.p,.35,90);
  assert.equal(h.boss.x,x);assert.equal(h.boss.vy,0);assert.equal(h.boss.lunge,0);
  assert.equal(h.G.projectiles.length,3,'recovery cannot emit a second volley');
});

test('each cover tier visibly loosens before falling and the later tier remains available',()=>{
  const h=harness(),lens=h.G.obstacles.find(o=>o.marksmanTarget==='rangefinder');
  h.context.beginMarksmanRangefinderBreak(h.boss,lens);
  const first=h.G.obstacles.find(o=>o.marksmanCoverTier===1),second=h.G.obstacles.find(o=>o.marksmanCoverTier===2);
  h.boss.hp=h.boss.maxHp*.59;h.context.updateMarksmanCover(h.boss,.1);
  assert.equal(first.gone,false);assert.equal(first.move,null);assert.ok(first.fallT>0);
  assert.equal(second.gone,false);assert.ok(second.move);
  h.context.updateMarksmanCover(h.boss,.35);assert.equal(first.gone,false);
  h.context.updateMarksmanCover(h.boss,.36);assert.equal(first.gone,true);assert.equal(second.gone,false);
  h.boss.hp=h.boss.maxHp*.29;h.context.updateMarksmanCover(h.boss,.1);
  assert.equal(second.gone,false);assert.ok(second.fallT>0);
  h.context.updateMarksmanCover(h.boss,.71);assert.equal(second.gone,true);
});

test('victory grants the pair and direct Far Thread without a bag or Echo slot, while preview keeps campaign progress isolated',()=>{
  for(const levelSelect of [false,true]){
    const h=harness(levelSelect);
    h.meta.echoes=systems.echoes.createState({owned:['fault-bell','road-knot','chain-vow'],
      equipped:['fault-bell','road-knot','chain-vow'],capacityKnots:['gaol-knot','rime-knot']});
    const beforeCapabilities=JSON.stringify(h.meta.capabilities),beforeEchoes=JSON.stringify(h.meta.echoes),
      equipped=Array.from(h.meta.echoes.equipped);
    h.meta.inventory={items:Array.from({length:24},(_,i)=>({id:'bag-'+i}))};
    const inventory=JSON.stringify(h.meta.inventory),briefings=[];
    Object.assign(h.context,{BFEchoesModule:systems.echoes,BFEchoes:{record:()=>{}},BFRuntime:{events:{emit:()=>{}}},
      ngRemixEnemyDeath:()=>{},skinPerk:(_,fallback)=>fallback,addGold:amount=>{h.meta.gold+=amount;},
      BFEcology:{recordKill:()=>{}},syncGiftUnlocks:()=>{},grantAuthoredAdvancement:()=>{},
      showMarksmanDefeatBriefing:()=>briefings.push(true),coopPackPickup:pk=>pk,
      document:{getElementById:()=>({classList:{remove:()=>{}}})},
      weaponAttackEligibility:()=>({allowed:true}),effAtkSpeed:()=>1,hasWeaponTechnique:()=>false,
      weaponPassiveMod:(_,__,fallback)=>fallback,effPower:()=>1,BFWeaponProgressionModule:{attackEvent:()=>null}});
    vm.runInContext(['fieldPassiveEchoIds','passiveEchoActive','passiveEchoReceipts','echoState','farThreadActive','hasEcho','syncEchoRuntimeMods','grantEchoReward',
      'restoreUpdraftsReturnGear','restoreKeepMachinery','restoreSolvedBacktrackDoors','killEnemy','doAttack'].map(fn).join('\n'),h.context);
    assert.equal(h.context.circuitOpen('marksman-clearance'),false);
    assert.equal(h.context.hasEcho('far-thread'),false);
    h.context.killEnemy(h.boss);
    assert.equal(h.boss.dead,true);assert.equal(h.context.circuitOpen('marksman-clearance'),true);
    assert.equal(h.G.secondMouthProved,true,'victory opens the road before the optional pair exercise');
    assert.equal(h.context.portalProgressionProfile().maxPlayerMouths,2);assert.equal(h.G.portal,null);
    assert.deepEqual(Array.from(h.context.activeCapabilityProgress().acquired),['jump','weapon','dash','portal-single','portal-pair']);
    assert.equal(h.G.p.blood,5);assert.equal(h.context.hasEcho('far-thread'),true);assert.equal(h.G.p.mods.pierce,true);
    assert.deepEqual(Array.from(h.meta.echoes.equipped),levelSelect?equipped:[]);assert.equal(JSON.stringify(h.meta.inventory),inventory);
    assert.equal(h.G.pickups.length,0,'victory never drops an unnecessary key or item');
    assert.equal(briefings.length,1);assert.equal(h.notices.length,0,'the compact defeat card owns the ability feedback');
    const after=JSON.stringify(h.meta.echoes);h.context.killEnemy(h.boss);
    assert.equal(JSON.stringify(h.meta.echoes),after);assert.equal(briefings.length,1);
    if(levelSelect){
      assert.equal(JSON.stringify(h.meta.capabilities),beforeCapabilities);
      assert.equal(JSON.stringify(h.meta.echoes),beforeEchoes);assert.equal(h.meta.portalPairProved,undefined);
    }else assert.equal(h.meta.echoes.owned.includes('far-thread'),true);

    h.G.p.weapon={cls:'ranged',cd:.4,dmg:10,kb:80,bound:true,
      proj:{speed:600,size:4,range:900,pierce:0,shape:'arrow'}};
    h.context.doAttack(h.G.p,1);assert.equal(h.G.projectiles.at(-1).pierce,1,'the actual shot receives the passive bonus');
    h.meta.echoes=systems.echoes.createState({...h.meta.echoes,owned:[...h.meta.echoes.owned,'far-thread'],
      equipped:['fault-bell','road-knot','far-thread']});
    h.context.syncEchoRuntimeMods();h.context.doAttack(h.G.p,1);
    assert.equal(h.G.projectiles.at(-1).pierce,1,'equipped and passive Far Thread cannot add two pierces');
  }
});

test('gallery drop height powers a reachable launch, with single-jump approach, caught misses, and an east return',()=>{
  const h=harness(),objects=h.G.obstacles,slate=objects.find(o=>o.marksmanLinkedSlate==='gallery-drop'),
    perch=objects.find(o=>o.galleryDropPerch),outlet=objects.find(o=>o.galleryLaunch),
    landing=objects.find(o=>o.galleryLaunchLanding),face=objects.find(o=>o.galleryLandingFace),
    tuning=systems.movement.TUNING,gravity=Number(source.match(/p\.vy\+=(\d+)\*dt\*gravDir\*gMul/)[1]);
  const flight=speed=>{
    const actor={x:slate.x,y:slate.y,w:28,h:44,vx:0,vy:speed};
    const result=systems.portals.attemptTransit(actor,[{a:{x:slate.x,y:slate.y,nx:0,ny:1},b:outlet,oneWay:true}],{kind:'player'});
    assert.equal(result.transited,true);
    const dt=1/120;
    while(actor.y>landing.y){
      actor.vx=systems.platformer.horizontalVelocity({current:actor.vx,target:tuning.runSpeed,input:1,grounded:false,dt}).velocity;
      actor.x+=actor.vx*dt;actor.vy+=gravity*dt;actor.y-=actor.vy*dt;
    }
    return actor;
  };
  const earned=flight(Math.sqrt(2*gravity*(perch.y-slate.y-30))),
    shortcut=flight(tuning.runSpeed*tuning.dashSpeedMultiplier);
  assert.ok(earned.x>landing.x-landing.w/2+14&&earned.x<landing.x+landing.w/2-14,
    'the high drop lands inside the actual platform with real portal launch and air drag');
  assert.ok(shortcut.x+14<face.x-face.w/2,'a level Dash intake falls short of the retaining face');
  const riseLimit=tuning.jumpVelocity*tuning.jumpVelocity/(2*gravity)-4;
  for(const flag of ['galleryDropStep','galleryReturnStep']){
    const steps=objects.filter(o=>o[flag]).sort((a,b)=>a.y-b.y);
    let previous={x:steps[0].x,y:0,w:steps[0].w};
    for(const step of steps){
      assert.ok(step.y-previous.y<=riseLimit,flag+' stays within one jump');
      assert.ok(Math.abs(step.x-previous.x)-(step.w+previous.w)/2<tuning.runSpeed*tuning.jumpVelocity/gravity,
        flag+' has an overlapping jump window');previous=step;
    }
    if(flag==='galleryReturnStep')assert.ok(landing.y-previous.y<=riseLimit&&
      previous.x-previous.w/2<=landing.x+landing.w/2,'the east stair returns to the landing without later abilities');
  }
  for(const x of [slate.x,outlet.x,shortcut.x])assert.equal(h.context.getFloor(x,0).y,0,'misses have a continuous recovery floor');
  assert.ok(objects.some(o=>o.type==='check'&&Math.abs(o.x-slate.x)<180&&o.y===0));
  assert.ok(objects.some(o=>o.returnHook==='wall-jump'&&o.type==='storyRelic'),'the Keep return reward remains authored');
  assert.equal(h.context.getFloor(40,0).y,0);assert.equal(h.context.getFloor(authored.len-40,0).y,0);
});

test('Daro recurs out of view and accepts an already found token in one deliberate conversation, rewarding once',()=>{
  for(const levelSelect of [false,true]){
    const h=harness(levelSelect),daro=h.G.obstacles.find(o=>o.questActor==='daro'),
      token=h.G.obstacles.find(o=>o.memoryId==='watch-command-token'),annotations=[];
    h.meta.quests=systems.quests.createProgress();h.meta.story={memoriesRead:['watch-command-token']};
    if(levelSelect)h.G.sessionQuests=systems.quests.createProgress();
    const campaign=JSON.stringify(h.meta.quests);
    Object.assign(h.context,{BFQuestsModule:systems.quests,recordStoryResident:()=>{},nearbyQuestContact:()=>daro,
      addGold:amount=>{h.meta.gold+=amount;},grantEchoReward:()=>{},escText:s=>s,
      showOutskirtsAnnotation:(_,html,options)=>annotations.push({html,options})});
    vm.runInContext(['updateMarksmanKeeper','questStageId','activeQuestProgress','questProgressionContext',
      'recordQuestEvent','questRow','talkQuestContact'].map(fn).join('\n'),h.context);
    h.G.cam=5000;h.context.updateMarksmanKeeper();assert.equal(daro.x,720,'he stays before the mechanism is solved');
    h.circuits.add('mantlet-release');h.G.cam=200;h.context.updateMarksmanKeeper();assert.equal(daro.x,720);
    h.G.cam=11500;h.context.updateMarksmanKeeper();assert.equal(daro.x,720,'he cannot appear within the camera');
    h.G.cam=5000;h.context.updateMarksmanKeeper();assert.equal(daro.atFarBank,true);
    const farX=daro.x;h.G.cam=farX;h.context.updateMarksmanKeeper();assert.equal(daro.x,farX);
    if(levelSelect){
      h.context.talkQuestContact();assert.equal(h.context.questRow('the-open-watch').completed,false,
        'campaign memory cannot finish a preview quest');token.read=true;
    }
    h.context.talkQuestContact();assert.equal(h.context.questRow('the-open-watch').completed,true);
    assert.equal(h.meta.gold,levelSelect?0:180);assert.equal(annotations.at(-1).options.manual,true);
    h.context.talkQuestContact();assert.equal(h.meta.gold,levelSelect?0:180);assert.equal(h.notices.length,0);
    if(levelSelect)assert.equal(JSON.stringify(h.meta.quests),campaign);
  }
});

test('network snapshots carry the committed Marksman tells and cover warning without assigning unrelated fields',()=>{
  const h=harness(),cover=h.G.obstacles.find(o=>o.marksmanRailCover),index=h.G.obstacles.indexOf(cover);
  Object.assign(h.boss,{marksmanAimT:.4,marksmanAimMax:.8,marksmanAimX:13000,marksmanAimY:22,
    marksmanAimMarked:true,marksmanRecoverT:0});Object.assign(cover,{gone:false,fallT:.37});
  Object.assign(h.context,{NET:{isGuest:()=>true,ghost:null},freshPlayer:()=>({}),netPackProjectiles:()=>[],netPackAoes:()=>[],
    netPackTravelers:()=>[],netPackQuestItems:()=>[],netPackRemixFields:()=>[],netPackPlayer:()=>null,
    netApplyTravelers:()=>{},netApplyQuestItems:()=>{},netApplyRemixFields:()=>{},
    netApplyProjectiles:()=>{},netApplyAoes:()=>{}});
  const tellFields=source.slice(source.indexOf('const MARKSMAN_TELL_FIELDS='),source.indexOf('function netPackMarksmanTell')),
    dynamicTypes=source.slice(source.indexOf('const NET_DYNAMIC_TYPES='),source.indexOf('function netPackDynamicWorld'));
  vm.runInContext(tellFields+dynamicTypes+['netPackMarksmanTell','netApplyMarksmanTell','netPackDynamicWorld',
    'netApplyDynamicWorld','netPackWorldSnapshot','netApplyWorldSnapshot'].map(fn).join('\n'),h.context);
  const packet=JSON.parse(JSON.stringify(h.context.netPackWorldSnapshot()));
  packet.enemies[0][18].hp=0;packet.enemies[0][18].dead=true;
  h.boss.marksmanAimT=0;h.boss.marksmanAimX=0;cover.fallT=null;
  h.context.netApplyWorldSnapshot(packet,1);
  assert.equal(h.boss.marksmanAimT,.4);assert.equal(h.boss.marksmanAimX,13000);
  assert.equal(h.boss.hp,300);assert.equal(h.boss.dead,false,'extra tell fields cannot override canonical combat state');
  assert.equal(cover.fallT,.37);assert.equal(cover.gone,false);
  packet.enemies[0]=packet.enemies[0].slice(0,18);
  packet.obstacles.find(row=>row[0]===index).length=19;
  assert.doesNotThrow(()=>h.context.netApplyWorldSnapshot(packet,2));
  assert.equal(cover.fallT,null,'legacy rows contain no premature fall warning');
  const unrelated={type:'grunt',hp:20};h.context.netApplyMarksmanTell(unrelated,{marksmanAimT:1,hp:0});
  assert.equal(unrelated.marksmanAimT,undefined);assert.equal(unrelated.hp,20);
});

test('the real boss arrow reaches the exposed intake, is stopped by the sheltered roof, and has a clear return to the lens',()=>{
  for(const sheltered of [false,true]){
    const h=harness(),slate=h.G.obstacles.find(o=>sheltered?o.marksmanIntakeDecoy:o.marksmanIntake),
      roof=h.G.obstacles.find(o=>o.marksmanDecoyCover),lens=h.G.obstacles.find(o=>o.marksmanTarget==='rangefinder');
    h.boss.shot.count=1;h.context.bossShoot(h.boss,{x:slate.x,y:slate.y,h:44});
    const pr=h.G.projectiles[0],startX=pr.x,startY=pr.y,
      flight=(slate.x-pr.x)/pr.vx;
    pr.x+=pr.vx*flight;pr.y+=pr.vy*flight;
    assert.ok(flight>0);assert.equal(h.context.marksmanArrowCoverHit(pr,startX,startY),sheltered);
    if(sheltered){
      assert.equal(pr.life,0);assert.ok(roof.flash>0,'the decoy’s visible roof takes the arrow');
    }else{
      assert.ok(pr.life>0);assert.equal(roof.flash,undefined);
      h.G.p.x=slate.x;h.G.cratePortals=[{x:slate.x,y:slate.y,nx:0,ny:1}];
      pr.markedRangeShot=true;h.context.routeProjectile(pr);
      assert.equal(pr.portalHops,1);assert.equal(pr.reflected,true);
      const exitX=pr.x,exitY=pr.y;
      assert.equal(pr.y,lens.targetY);pr.x=lens.x;
      assert.equal(h.context.marksmanArrowCoverHit(pr,exitX,exitY),false,'the intended return line is not blocked');
      assert.equal(h.context.resolveMarksmanTarget(lens,pr),true);
    }
  }
});

test('swept arrows strike named cover across a frame, respect moved and gone cover, and hit the nearest face first',()=>{
  const h=harness(),arrow=()=>({sourceType:'watchSniper',owner:'enemy',x:200,y:50,size:5,life:4});
  for(const flag of ['watchMantlet','marksmanRailCover','marksmanShutter','watchTowerWall','marksmanArrowCover']){
    const cover={type:'wall',x:100,y:80,w:20,h:60,[flag]:1};h.G.obstacles=[cover];
    const pr=arrow();assert.equal(h.context.marksmanArrowCoverHit(pr,0,50),true,flag);
    assert.equal(pr.life,0);assert.equal(pr.x,85,'a fast arrow stops at the actual expanded leading face');
    cover.x=300;assert.equal(h.context.marksmanArrowCoverHit(arrow(),0,50),false,'collision follows moved geometry');
    cover.x=100;cover.gone=true;assert.equal(h.context.marksmanArrowCoverHit(arrow(),0,50),false,'destroyed cover cannot block');
  }
  h.G.obstacles=[{type:'wall',x:160,y:80,w:20,h:60,watchMantlet:1},
    {type:'wall',x:80,y:80,w:20,h:60,watchMantlet:1}];
  const forward=arrow();h.context.marksmanArrowCoverHit(forward,0,50);assert.equal(forward.x,65);
  const reflected={...arrow(),x:0,reflected:true};h.context.marksmanArrowCoverHit(reflected,200,50);assert.equal(reflected.x,175);
  assert.equal(h.context.marksmanArrowCoverHit({...arrow(),sourceType:'sorcerer'},0,50),false,'the change stays scoped to watch arrows');
  h.G.stageIndex=3;assert.equal(h.context.marksmanArrowCoverHit(arrow(),0,50),false);
});

test('the actual projectile update checks both mouth neighborhoods without sweeping the empty space between them',()=>{
  const h=harness(),slate=h.G.obstacles.find(o=>o.marksmanLinkedSlate==='arrow-intake'),
    outlet=h.G.obstacles.find(o=>o.marksmanAnchor==='arrow-release');
  h.G.p.x=slate.x;h.G.cratePortals=[{x:slate.x,y:slate.y,nx:0,ny:1}];
  const distant={type:'wall',x:(slate.x+outlet.x)/2,y:180,w:40,h:160,watchMantlet:1};
  h.G.obstacles=[distant];
  const pr={sourceType:'watchSniper',owner:'enemy',watchShot:true,x:slate.x,y:slate.y+28,
    vx:0,vy:-450,size:5,life:4,hitSet:[]};
  h.context.advanceArrow(pr,1/60);
  assert.equal(pr.portalHops,1);assert.ok(pr.life>0,'an intermediate wall cannot block teleportation');
  assert.equal(distant.flash,undefined);
  const lip={type:'wall',x:outlet.x+36,y:outlet.y+30,w:28,h:60,marksmanArrowCover:1};
  h.G.obstacles.push(lip);
  const blocked={sourceType:'watchSniper',owner:'enemy',watchShot:true,x:slate.x,y:slate.y+28,
    vx:0,vy:-450,size:5,life:4,hitSet:[]};
  h.context.advanceArrow(blocked,1/60);
  assert.equal(blocked.portalHops,1);assert.equal(blocked.life,0,'cover at the real exit still intercepts the arrow');
  assert.ok(lip.flash>0);
});

test('earned-pair restoration suppresses the old encounter and hazards without awarding another victory',()=>{
  for(const levelSelect of [false,true]){
    const h=harness(levelSelect),lens=h.G.obstacles.find(o=>o.marksmanTarget==='rangefinder');
    vm.runInContext(['restoreUpdraftsReturnGear','restoreSolvedBacktrackDoors'].map(fn).join('\n'),h.context);
    assert.equal(h.context.restoreMarksmanVictory(),false);assert.equal(h.boss.dead,undefined);
    assert.equal(lens.timer,0);assert.equal(h.boss.portalGate,'rangefinderBreak');
    h.context.grantPermanentCapability('portal-pair','deadeye-rangefinder',{quiet:true});
    const campaign=JSON.stringify(h.meta),blood=h.G.p.blood;
    Object.assign(h.boss,{active:true,marksmanAimT:.5,marksmanRecoverT:.7});
    for(const o of h.G.obstacles)if(o.marksmanRailCover){o.gone=false;o.move=o.railMove;}
    h.G.projectiles=[{sourceType:'archer',life:3},{sourceType:'watchSniper',life:3},{owner:'player',life:3}];
    h.G.aoes=[{type:'arrowRain',t:1},{type:'other',t:1}];
    Object.assign(h.context,{killEnemy:()=>{throw Error('restoration is not a kill');},
      grantEchoReward:()=>{throw Error('restoration is not a new reward');}});
    h.context.restoreSolvedBacktrackDoors();
    assert.equal(h.boss.dead,true);assert.equal(h.boss.hp,0);assert.equal(h.boss.active,false);
    assert.equal(h.boss.portalGate,null);assert.equal(h.boss.marksmanAimT,0);assert.equal(h.boss.marksmanRecoverT,0);
    assert.equal(lens.broken,true);assert.ok(lens.timer>0);
    assert.ok(h.G.obstacles.filter(o=>o.marksmanPerch||o.marksmanRailCover).every(o=>o.gone&&o.move===null));
    assert.deepEqual(Array.from(h.G.projectiles,p=>p.sourceType||p.owner),['watchSniper','player']);
    assert.deepEqual(Array.from(h.G.aoes,a=>a.type),['other']);
    assert.equal(h.context.circuitOpen('marksman-clearance'),true);assert.equal(h.context.circuitOpen('mantlet-release'),true);
    assert.equal(h.G.p.blood,blood);assert.equal(JSON.stringify(h.meta),campaign);
    h.context.restoreSolvedBacktrackDoors();assert.equal(JSON.stringify(h.meta),campaign,'repeated restoration remains reward-free');
  }
  for(const override of [{ngPlus:1},{bossRush:{}},{stageIndex:5}]){
    const h=harness();h.context.grantPermanentCapability('portal-pair','deadeye-rangefinder',{quiet:true});
    Object.assign(h.G,override);assert.equal(h.context.restoreMarksmanVictory(),false);
    assert.equal(h.boss.dead,undefined);assert.equal(h.boss.portalGate,'rangefinderBreak');
  }
});

// The hunt phase is only mobile if the shot cooldown outlasts the recovery: the
// reposition/leap code sits AFTER an early return taken whenever the boss is
// aiming or recovering, so an over-short cooldown makes it unreachable and the
// duelist stands still for the whole fight. Drive real frames, not one big dt.
test('the unwarded hunter repositions and leaps between volleys instead of rooting in place',()=>{
  const dt=1/60;
  for(const [label,hpFrac] of [['full',1],['half',.5],['low',.2]]){
    const h=harness(),e=h.boss,c=h.context;
    c.beginMarksmanRangefinderBreak(e,h.G.obstacles.find(o=>o.marksmanTarget==='rangefinder'));
    e.speed=60;e.maxHp=460;e.hp=460*hpFrac;
    const eff=e.speed*1.04;
    let leaps=0,volleys=0,minX=Infinity,maxX=-Infinity,peak=0,hunting=false;
    for(let i=0;i<60*30;i++){
      if(e.shootT>0)e.shootT-=dt;
      const cd=e.marksmanLeapCd;
      c.updateMarksmanPortalFight(e,h.G.p,dt,eff);
      const oldY=e.y;e.vy+=1400*dt;e.y-=e.vy*dt;                       // the real enemy gravity step
      const floor=c.getEnemyFloor(e,oldY);if(e.y<=floor.y&&e.vy>0){e.y=floor.y;e.vy=0;}
      if(e.marksmanState==='hunt'&&e.marksmanTransformT<=0)hunting=true;
      if(hunting){minX=Math.min(minX,e.x);maxX=Math.max(maxX,e.x);peak=Math.max(peak,e.y);}
      if(e.marksmanLeapCd>cd)leaps++;                                   // cooldown re-armed == a real leap
      if(h.G.projectiles.length>volleys)volleys=h.G.projectiles.length;
    }
    assert.ok(leaps>=8,label+' HP hunter leaps repeatedly, got '+leaps);
    assert.ok(maxX-minX>600,label+' HP hunter covers real ground, got '+Math.round(maxX-minX)+'px');
    assert.ok(peak>120,label+' HP hunter actually leaves the floor, peaked at '+Math.round(peak));
    assert.ok(volleys>=5,label+' HP hunter keeps firing while mobile, got '+volleys+' volleys');
    assert.ok(e.x>=e.marksmanArenaL&&e.x<=e.marksmanArenaR,label+' HP hunter stays inside its arena');
  }
});

test('the warded perch phase stays pinned so the portal puzzle is unchanged',()=>{
  const dt=1/60,h=harness(),e=h.boss,c=h.context;
  for(let i=0;i<60*10;i++){if(e.shootT>0)e.shootT-=dt;c.updateMarksmanPortalFight(e,h.G.p,dt,62.4);}
  assert.equal(e.marksmanState,'warded');
  assert.equal(e.x,e.marksmanPerchX);assert.equal(e.y,e.marksmanPerchY);
  assert.ok(h.G.projectiles.length>0,'the warded perch still fires its marked shots');
});
