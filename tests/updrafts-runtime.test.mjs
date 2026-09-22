import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const read=name=>readFile(new URL('../public/'+name,import.meta.url),'utf8');
const source=await read('index.html');
function functionSource(name){
  const start=source.indexOf('function '+name+'(');assert.ok(start>=0,name+' exists');
  const brace=source.indexOf('{',start);let depth=0;
  for(let i=brace;i<source.length;i++){
    if(source[i]==='{')depth++;
    else if(source[i]==='}'&&--depth===0)return source.slice(start,i+1);
  }
  throw Error('unterminated '+name);
}
function between(from,to){
  const a=source.indexOf(from),b=source.indexOf(to,a+from.length);
  assert.ok(a>=0&&b>a,'production block exists: '+from);return source.slice(a,b);
}
const moduleNames=['progression','capabilities','movement-progression','zones','recovery','zone-state','blood','reactions','interactions','environment','echoes'];
const modules=await Promise.all(moduleNames.map(name=>read('bladefall-'+name+'.js')));
const systems=vm.runInNewContext(modules.join('\n')+
  ';({capabilities:BladefallCapabilities,movement:BladefallMovementProgression,recovery:BladefallRecovery,zones:BladefallZoneState,'+
  'blood:BladefallBlood,interactions:BladefallInteractions,environment:BladefallEnvironment,echoes:BladefallEchoes})');
const stage=between('const UPDRAFTS_LEVEL=','/* ================================================================\n   HOLLOW MARKSMAN');
const constructors=['Pl','Gr','Wl','Slate','SlateWall','Cry','Lever','Plate','Check','Fluid','DoorSeal','AirflowReceiver','WindTunnel'];
const makeObject=type=>(x,y,kind,options)=>({type,x,y,kind,...options});
const authored=vm.runInNewContext(constructors.map(functionSource).join('\n')+'\n'+stage+';UPDRAFTS_LEVEL',{
  OpeningBeat:(o,beat,system)=>Object.assign(o,{openingActBeat:beat,openingActSystem:system}),
  Scenery:makeObject('scenery'),AmbientFigure:makeObject('ambientFigure'),StoryRelic:makeObject('storyRelic'),
  SealedRecollection:(x,y,id,title,options)=>({type:'storyRelic',x,y,id,title,...options}),
  BFDialogueModule:{text:id=>id},LoreMarker:(x,y)=>({type:'lore',x,y}),STAGE_LORE:{3:{}},Sign:(x,y,text)=>({type:'sign',x,y,text})
});
function machineryHarness(){
  const objects=JSON.parse(JSON.stringify(authored.objects)),
    G={stageIndex:3,ngPlus:0,worldProgressEligible:true,obstacles:objects,p:{x:0,y:0},npcs:[],
      openedZoneShortcuts:[],particles:[],shake:0,time:0},
    meta={soundOn:false,zoneState:systems.zones.createState()},circuits=new Set(),receipts=[],shortcuts=[];
  const context=vm.createContext({G,meta,GROUND_Y:700,BladefallInteractions:systems.interactions,
    BFWorldModule:{stageId:()=> 'updrafts'},BFZoneStateModule:systems.zones,
    hasCapability:()=>false,persistentCircuitOpen:id=>circuits.has(id),
    markPersistentCircuitOpen:(id,reason)=>{circuits.add(id);receipts.push({id,reason});},
    persist:()=>{},showStationNotice:()=>{throw Error('machinery should communicate through its physical state');},
    addText:()=>{throw Error('machinery should not emit instruction labels');}
  });
  vm.runInContext(['circuitOpen','registerCircuits','updraftsGateCount','windCollectorReady','windCollectorAtCatch',
    'pullLever','openUpdraftsShortcut','updraftsShortcutOpen','updateChoirFlame','updraftsVoidFloor'].map(functionSource).join('\n')+
    ';registerCircuits();',context);
  const open=context.openUpdraftsShortcut;
  context.openUpdraftsShortcut=id=>{shortcuts.push(id);return open(id);};
  return{context,G,meta,objects,circuits,receipts,shortcuts};
}

function recoveryHarness(){
  const objects=JSON.parse(JSON.stringify(authored.objects)),
    runCapabilities=systems.capabilities.createState({acquired:['jump','weapon','dash']}),
    G={stageIndex:3,obstacles:objects,p:{x:0,y:0,w:28,h:44,hp:80,blood:4,maxBlood:5,bloodGuard:.1,
      onGround:true,hasJetpack:true,fuel:12,vx:180,vy:80,dodgeTimer:0,invuln:0},particles:[],shake:0},
    meta={soundOn:false,capabilities:systems.capabilities.freshState(),recovery:systems.recovery.createState()},saved=[];
  const context=vm.createContext({G,meta,GROUND_Y:700,BFBloodModule:systems.blood,BFRecoveryModule:systems.recovery,
    BFMovementProgressionModule:systems.movement,BFWorldModule:{stageId:()=> 'updrafts'},
    activeCapabilityProgress:()=>runCapabilities,defenseR:()=>.22,vitalityKnotCount:()=>0,effMaxHp:()=>100,
    snapOf:p=>JSON.parse(JSON.stringify(p)),saveRunAtStage:(_,snap)=>saved.push(snap),ngRemixCrystal:()=>{},
    resolveEchoEvent:()=>{},coopRespawnAtPartner:()=>false,clearPlacedPortals:()=>{},buzz:()=>{},addText:()=>{}
  });
  const nest=between('  if(G.stageIndex===3&&p.onGround&&p.floorPlat&&p.floorPlat.aerieNest){','  // Checkpoints'),
    crystal=between('  if(!p.onGround)for(const o of G.obstacles){','  // Hidden coins');
  vm.runInContext(['activateRuntimeCheckpoint','hurtPlayer','syncBloodMirror','windTunnelSamples','windTunnelNearest',
    'activeWindTunnelState'].map(functionSource).join('\n')+
    ';function tickNest(){const p=G.p;'+nest+'}'+
    ';function tickCrystal(){const p=G.p;'+crystal+'}',context);
  return{context,G,meta,saved,objects};
}

test('Needlewind safe pockets lie inside the real curve and one wound returns to the last pocket',()=>{
  const h=recoveryHarness(),p=h.G.p,pockets=h.objects.filter(o=>o.safePocket);
  assert.equal(pockets.length,4,'the added rainward pocket bounds the long second half');
  for(const nest of pockets){
    Object.assign(p,{x:nest.x,y:nest.y,onGround:true,floorPlat:nest,fuel:12});
    assert.equal(h.context.activeWindTunnelState(p).hazardous,false,'a marked pocket cannot sit inside its own thorn boundary');
    h.context.tickNest();
    assert.equal(p.ckX,nest.x);assert.equal(p.ckY,nest.y+40);assert.equal(p.fuel,100);
    const count=h.saved.length;h.context.tickNest();assert.equal(h.saved.length,count,'standing in a pocket does not resave every frame');
  }
  const last=pockets.find(o=>o.safePocket==='rainward');
  Object.assign(p,{x:last.x,y:last.y,onGround:true,floorPlat:last});h.context.tickNest();
  Object.assign(p,{x:11900,y:900,onGround:false,floorPlat:null,fuel:5,vx:150,vy:-120,slamming:true,dashBuf:.1,invuln:0,blood:4});
  h.context.hurtPlayer(18,1,false,1);
  assert.equal(p.blood,3,'a missed bend costs one whole Blood measure');
  assert.equal(p.x,last.x);assert.equal(p.y,last.y+40);assert.equal(p.fuel,100);
  assert.equal(p.vx,0);assert.equal(p.vy,0);assert.equal(p.dashBuf,0);assert.equal(p.slamming,false);
  assert.ok(p.invuln>0,'the rewind has a reaction window');
  h.context.hurtPlayer(18,1,false,1);assert.equal(p.blood,3,'the same contact cannot charge a second wound immediately');
});

test('the final relief crystal restores only a quarter tank and uses run-local Dash ownership',()=>{
  const h=recoveryHarness(),p=h.G.p,crystal=h.objects.find(o=>o.type==='crystal'&&o.packRefill===25);
  assert.ok(crystal&&crystal.fullPackRefill===false);
  Object.assign(p,{x:crystal.x,y:crystal.y-p.h/2,onGround:false,fuel:10,jumps:1,dodgeCdT:1.2});
  h.context.tickCrystal();
  assert.equal(p.fuel,35,'the relief is 25 fuel, not a hidden full refill');
  assert.equal(p.jumps,0);assert.equal(p.airRefill,true);assert.equal(p.dodgeCdT,0,
    'a Level Select Dash refills even when the campaign save owns only Jump');
  assert.equal(p.blood,4);h.context.tickCrystal();assert.equal(p.fuel,35,'the cooldown prevents repeated touch rewards');
  crystal.cdT=0;p.fuel=90;h.context.tickCrystal();assert.equal(p.fuel,100,'fuel remains bounded');
});

test('Rain-Catcher cups require the previous gutter and their real docking window, then activate only once',()=>{
  const h=machineryHarness(),cups=h.objects.filter(o=>o.windCollector).sort((a,b)=>a.collectorIndex-b.collectorIndex),
    environment=systems.environment.createEnvironment();
  const dock=cup=>{
    const axis=cup.collectorAxis,delta=axis==='x'?cup.move.dx:cup.move.dy,base=axis==='x'?cup.x0:cup.y0;
    assert.ok(Math.abs(cup.collectorAt-base)<=Math.abs(delta),'the catch mark lies inside actual travel');
    const time=(Math.asin((cup.collectorAt-base)/delta)-(cup.move.phase||0))*cup.move.period/(Math.PI*2);
    environment.updateMechanism(cup,time,.016);
    assert.ok(Math.abs(cup[axis]-cup.collectorAt)<1e-7);
  };
  dock(cups[1]);h.context.pullLever(cups[1]);assert.equal(cups[1].timer,0,'a downstream cup cannot skip its prerequisite');
  for(const cup of cups){
    const axis=cup.collectorAxis;
    cup[axis]=cup.collectorAt+cup.collectorWindow+1;
    h.context.pullLever(cup);assert.equal(cup.timer,0,'being nearby does not substitute for docking');
    dock(cup);assert.equal(h.context.windCollectorAtCatch(cup),true);
    h.context.pullLever(cup);assert.ok(cup.timer>0);assert.equal(cup.aligned,true);
    assert.equal(h.context.circuitOpen(cup.id),true);
    const receipts=h.receipts.length,shortcuts=h.shortcuts.length;
    cup.timer=cup.dur-.8;h.context.pullLever(cup);
    assert.equal(h.receipts.length,receipts,'re-hitting a latched cup cannot issue another activation');
    assert.equal(h.shortcuts.length,shortcuts,'re-hitting cannot reopen the shortcut');
    assert.equal(h.context.circuitOpen('wind-gate-3'),cup===cups.at(-1));
  }
  assert.deepEqual(h.shortcuts,['rain-service-lift']);
  assert.equal(h.context.updraftsShortcutOpen('rain-service-lift'),true);
  assert.ok(h.meta.zoneState.zones.updrafts.openedShortcuts.includes('rain-service-lift'));
});

test('the Choir flame requires ignition and the high damper, travels for 3.2 seconds, then stays latched',()=>{
  for(const order of ['vessel','damper']){
    const h=machineryHarness(),vessel=h.objects.find(o=>o.cinderVessel),damper=h.objects.find(o=>o.choirDamper),
      channel=h.objects.find(o=>o.choirIgnitable);
    assert.equal(h.context.circuitOpen('wind-gate-1'),false);
    h.context.pullLever(order==='vessel'?vessel:damper);h.context.updateChoirFlame(4);
    assert.equal(h.context.circuitOpen('wind-gate-1'),false,'neither half alone opens the exit');
    h.context.pullLever(order==='vessel'?damper:vessel);
    assert.equal(vessel.broken,true);assert.equal(damper.struck,true);
    assert.equal(channel._bfReaction.element,'fire');assert.equal(channel._bfReaction.duration,1e9);
    h.context.updateChoirFlame(3.1);assert.equal(h.context.circuitOpen('wind-gate-1'),false,'heat needs travel time');
    h.context.updateChoirFlame(.11);assert.equal(h.context.circuitOpen('wind-gate-1'),true);
    assert.equal(h.context.updraftsGateCount(),1);
    const receipts=h.receipts.length,reaction=channel._bfReaction;
    vessel.timer=vessel.dur-1;damper.timer=damper.dur-1;
    h.context.pullLever(vessel);h.context.pullLever(damper);h.context.updateChoirFlame(5);
    assert.equal(h.receipts.length,receipts,'completed mechanism cannot issue another activation');
    assert.equal(channel._bfReaction,reaction,'the original sustained fire remains in the current');
    assert.equal(h.G.choirFlameT,3.2);
  }
});

test('the recessed Rain-Catcher has a basin-specific void floor without opening void space elsewhere',()=>{
  const h=machineryHarness(),basin=h.objects.find(o=>o.basinId==='updrafts-rain-catcher');
  assert.ok(basin);
  assert.equal(h.context.updraftsVoidFloor({x:basin.x}),basin.y-60);
  const floor=h.objects.find(o=>o.type==='plat'&&o.deep&&o.x===basin.x);
  assert.ok(floor.y>h.context.updraftsVoidFloor({x:floor.x}),'the masonry floor lies above the basin void threshold');
  for(const x of [basin.x-basin.w/2-1,basin.x+basin.w/2+1,10070])
    assert.equal(h.context.updraftsVoidFloor({x}),-50,'other stretches keep the normal void threshold');
  h.G.stageIndex=2;assert.equal(h.context.updraftsVoidFloor({x:basin.x}),-50);
  // The rewind is still driven by this one query, and now declines to fire while a
  // zone seam is mid-crossing — a fall that IS the road must not be undone.
  assert.match(source,/if\(!G\.physicalSeamCrossing&&\(p\.y < updraftsVoidFloor\(p\) \|\| p\.y > CEIL_Y\+400\)\)/);
});

function acquisitionHarness(levelSelect=false){
  const h=machineryHarness(),{G,meta,context}=h;
  Object.assign(G,{levelSelectMode:levelSelect,worldProgressEligible:!levelSelect,cam:0,
    npcs:JSON.parse(JSON.stringify(authored.npcs)),updraftsRepair:{},
    p:{x:3225,y:340,h:44,hp:60,blood:3,maxBlood:5,bloodGuard:0,hasJetpack:false,fuel:0},
    pickups:authored.loot.map(o=>({...o,jetpack:o.kind==='jetpack',portalSingle:o.kind==='portalSingle'}))});
  const before=systems.capabilities.createState({acquired:['jump','weapon','dash']});
  meta.capabilities=levelSelect?systems.capabilities.freshState():before;
  if(levelSelect)G.sessionCapabilities=before;
  meta.inventory={items:Array.from({length:24},(_,i)=>({id:'bag-'+i}))};
  const events=[],saved=[],taken=[],annotations=[];
  Object.assign(context,{BFCapabilitiesModule:systems.capabilities,BFBloodModule:systems.blood,
    BFInventoryModule:{collect:()=>{throw Error('authored equipment does not need the bag');}},
    syncMovementCapabilities:()=>{},syncPortalCapabilities:()=>{},syncWeaponCapabilities:()=>{},
    restoreSolvedBacktrackDoors:()=>{},recordQuestEvent:event=>events.push(event),
    coopRememberPickupTaken:pk=>taken.push(pk),hudUpdate:()=>{},effMaxHp:()=>100,vitalityKnotCount:()=>0,
    snapOf:p=>JSON.parse(JSON.stringify(p)),saveRunAtStage:(_,snap)=>saved.push(snap),
    showOutskirtsAnnotation:(_,html)=>annotations.push(html),escText:s=>s,keyLabel:s=>s,kbCode:s=>s,
    travelerLabel:()=> 'Ilyra',VW:1024,toast:()=>{throw Error('acquisition must use quiet presentation');},
    hasCapability:id=>systems.capabilities.has(G.sessionCapabilities||meta.capabilities,id)
  });
  vm.runInContext(['activeCapabilityProgress','grantPermanentCapability','acquireAerieHarness','updateUpdraftsCrown',
    'claimSignalCrownPortal','restoreBlood','syncBloodMirror','collectNearbyItem','itemInQuickRange',
    'updateUpdraftsKeeper','interactWithIlyra'].map(functionSource).join('\n')+
    ';function tickPickup(dt=.016){const p=G.p;'+
    between('  for(const pk of G.pickups){if(pk.taken)continue;pk.bob=','\n  // Chests')+'}',context);
  return{...h,events,saved,taken,annotations};
}

test('the released Aerie Harness equips on contact and persists a full tank without restoring Blood',()=>{
  const h=acquisitionHarness(),pack=h.G.pickups.find(o=>o.jetpack),brake=h.objects.find(o=>o.aeriePackRelease),
    bag=JSON.stringify(h.meta.inventory);
  h.context.tickPickup();assert.equal(h.G.p.hasJetpack,false,'the tied harness cannot be taken');
  assert.equal(h.context.acquireAerieHarness(pack),false);
  h.context.pullLever(brake);assert.equal(pack.ritualLocked,false);
  h.context.tickPickup();
  assert.equal(pack.taken,true);assert.equal(h.G.p.hasJetpack,true);assert.equal(h.G.p.fuel,100);
  assert.equal(h.G.p.blood,3);assert.equal(h.G.p.hp,60);assert.equal(JSON.stringify(h.meta.inventory),bag);
  assert.equal(h.context.circuitOpen('aerie-pack-owned'),true);assert.equal(h.saved.at(-1).hasJetpack,true);
  assert.equal(h.context.acquireAerieHarness(pack),false);assert.equal(h.taken.length,1);
});

test('all three gates physically release the Crown; contact or pickup key grants only the first portal and heals once',()=>{
  for(const levelSelect of [false,true]){
    const h=acquisitionHarness(levelSelect),gun=h.G.pickups.find(o=>o.portalSingle),campaign=JSON.stringify(h.meta.capabilities);
    Object.assign(h.G.p,{x:gun.x,y:gun.y});
    h.context.interactWithIlyra(h.G.npcs[0]);
    assert.equal(gun.ritualLocked,true,'talking does not unlock an unfinished Crown');
    h.circuits.add('wind-gate-1');h.circuits.add('wind-gate-2');
    assert.equal(h.context.updateUpdraftsCrown(),false);h.context.tickPickup();assert.equal(gun.taken,undefined);
    h.circuits.add('wind-gate-3');assert.equal(h.context.updateUpdraftsCrown(),true);assert.equal(gun.ritualLocked,false);
    if(levelSelect)assert.equal(h.context.collectNearbyItem(),true);else h.context.tickPickup();
    assert.equal(gun.taken,true);
    assert.deepEqual(Array.from(h.context.activeCapabilityProgress().acquired),['jump','weapon','dash','portal-single']);
    assert.equal(h.context.circuitOpen('updrafts-clearance'),true);assert.equal(h.G.p.blood,5);
    assert.equal(h.G.npcs[0].done,true);assert.equal(h.events.filter(o=>o.type==='traveler-helped').length,1);
    assert.equal(h.context.claimSignalCrownPortal(gun),false);
    assert.equal(h.taken.length,1);assert.equal(h.saved.at(-1).blood,5);
    if(levelSelect)assert.equal(JSON.stringify(h.meta.capabilities),campaign,'Level Select leaves permanent capabilities untouched');
  }
});

test('Ilyra recurs only out of view and her deliberate conversation does not gate the machinery',()=>{
  const h=acquisitionHarness(),n=h.G.npcs[0];
  assert.equal(n.x,2050);h.G.cam=1500;h.circuits.add('wind-gate-1');
  h.context.updateUpdraftsKeeper();assert.equal(n.x,2050,'she cannot disappear while visible');
  h.G.cam=8100;h.context.updateUpdraftsKeeper();assert.equal(n.x,2050,'she cannot arrive while visible');
  h.G.cam=5000;h.context.updateUpdraftsKeeper();assert.equal(n.x,8450);
  const gates=h.context.updraftsGateCount();
  h.context.interactWithIlyra(n);assert.equal(n.asked,true);assert.equal(h.context.updraftsGateCount(),gates);
  assert.equal(h.G.pickups.find(o=>o.portalSingle).ritualLocked,true);assert.equal(h.events.length,0);
  for(const id of ['updrafts-kitemender','updrafts-rainkeeper'])
    assert.equal(h.objects.find(o=>o.residentId===id).quietV4,true);
});

test('Gale Stitch fits a full harness loadout immediately, stays local in Level Select, and never applies twice',()=>{
  for(const levelSelect of [false,true]){
    const h=acquisitionHarness(levelSelect),fitNotices=[];
    h.G.p.hasJetpack=true;
    h.meta.echoes=systems.echoes.createState({owned:['fault-bell','road-knot','far-thread'],
      equipped:['fault-bell','road-knot','far-thread'],capacityKnots:['watch-thread','gaol-knot']});
    const before=JSON.stringify(h.meta.echoes),equipped=Array.from(h.meta.echoes.equipped);
    assert.equal(systems.echoes.profile(h.meta.echoes).free,0);
    Object.assign(h.context,{BFEchoesModule:systems.echoes,syncEchoRuntimeMods:()=>{},
      BFEchoes:{record:()=>{}},BFRuntime:{events:{emit:()=>{}}},toast:text=>fitNotices.push(text)});
    vm.runInContext(['fieldPassiveEchoIds','passiveEchoActive','passiveEchoReceipts','echoState','echoModifier','grantAuthoredEcho'].map(functionSource).join('\n'),h.context);
    assert.equal(h.context.echoModifier('player:jetpack','fuel-use:mul',1),1);
    h.context.grantAuthoredEcho('gale-stitch','secret:needlewind-mastery');
    assert.equal(h.context.echoModifier('player:jetpack','fuel-use:mul',1),.72);
    assert.equal(h.context.echoModifier('environment:air','control:mul',1),1.08);
    assert.equal(h.context.echoModifier('stats:combat','power:mul',1),1,'the fitting only changes its own hooks');
    assert.deepEqual(Array.from(h.meta.echoes.equipped),levelSelect?equipped:[],'campaign passives release slots; preview preserves the campaign save');
    assert.ok(h.circuits.has('gale-stitch-fitted'));assert.ok(h.saved.length>0);
    assert.equal(h.G.p.blood,3);assert.equal(fitNotices.length,1);
    if(levelSelect)assert.equal(JSON.stringify(h.meta.echoes),before,'preview fitting never grants a campaign Echo');
    else assert.equal(h.meta.echoes.owned.includes('gale-stitch'),true);
    h.G.stageIndex=4;assert.equal(h.context.echoModifier('player:jetpack','fuel-use:mul',1),levelSelect?1:.72,'preview fitting stays local; an earned campaign reward travels onward');
    h.G.stageIndex=3;h.G.p.hasJetpack=false;assert.equal(h.context.echoModifier('environment:air','control:mul',1),levelSelect?1:1.08);
    h.G.p.hasJetpack=true;
    h.meta.echoes=systems.echoes.createState({...h.meta.echoes,owned:[...h.meta.echoes.owned,'gale-stitch'],
      equipped:['fault-bell','road-knot','gale-stitch']});
    assert.equal(h.context.echoModifier('player:jetpack','fuel-use:mul',1),.72,'equipped and fitted do not multiply twice');
    assert.equal(h.context.echoModifier('environment:air','control:mul',1),1.08);
  }
  assert.match(source,/const force=authoredForce\*echoModifier\('environment:air','control:mul',1\)/);
});
