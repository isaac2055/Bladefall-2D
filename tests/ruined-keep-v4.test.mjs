import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const read=name=>readFile(new URL('../public/'+name,import.meta.url),'utf8');
const source=await read('index.html');
function fn(name){
  const start=source.indexOf('function '+name+'(');assert.ok(start>=0,name+' exists');
  const brace=source.indexOf('{',start);let depth=0;
  for(let i=brace;i<source.length;i++){
    if(source[i]==='{')depth++;
    else if(source[i]==='}'&&--depth===0)return source.slice(start,i+1);
  }
  throw Error('unterminated '+name);
}
const start=source.indexOf('const RUINED_KEEP_LEVEL='),end=source.indexOf('\n/*',start);
const constructors=['Pl','Gr','Wl','Slate','SlateWall','Check','Lever','DoorSeal','KeepBeat','Scenery','Crate','Plate','CoinOb','AmbientFigure'];
const authored=vm.runInNewContext(constructors.map(fn).join('\n')+'\n'+source.slice(start,end)+';RUINED_KEEP_LEVEL',{
  StoryRelic:(x,y,memoryId,o)=>({type:'storyRelic',x,y,memoryId,...o}),
  SealedRecollection:(x,y,id,title,o)=>({type:'storyRelic',x,y,id,title,...o}),
  LoreMarker:(x,y)=>({type:'sign',x,y}),STAGE_LORE:{5:{}}
});
const objects=authored.objects;
const environment=vm.runInNewContext(await read('bladefall-environment.js')+';BladefallEnvironment');

// These contracts protect meaningful distinctions between three payload jobs;
// full launch/capture behavior is covered by the Keep runtime checks.
test('Keep owns its pair and gives each reconstruction its own named payload',()=>{
  assert.equal(objects.filter(o=>o.type==='lportal').length,0);
  const crates=objects.filter(o=>o.type==='crate'),plates=objects.filter(o=>o.keepDock);
  assert.equal(crates.length,3);assert.equal(plates.length,3);
  assert.equal(new Set(plates.map(o=>o.targetCrate)).size,3);
  for(const plate of plates){
    const crate=crates.find(o=>o.keepPayload===plate.targetCrate);
    assert.ok(crate);assert.equal(crate.targetPlate,plate.id);
    assert.equal(plate.requiresPortal,true);assert.equal(plate.crateOnly,true);assert.equal(plate.latch,true);
  }
  assert.equal(plates.find(o=>o.keepDock==='masonry').x,6800);
  assert.equal(plates.find(o=>o.keepDock==='fold').x,12350);
  assert.ok(plates.find(o=>o.keepDock==='bell').move);
});

test('the two Belfry notches have visible narrow catching surfaces and floor recovery',()=>{
  for(const kind of ['fold','bell']){
    const plate=objects.find(o=>o.keepDock===kind),catcher=objects.find(o=>o.keepDockCatch===kind);
    assert.ok(catcher);assert.equal(catcher.x,plate.x);assert.equal(catcher.y,plate.y);
    assert.ok(catcher.w>=100&&catcher.w<=150);
  }
  assert.ok(objects.some(o=>o.type==='plat'&&o.deep&&o.x-o.w/2<=11100&&o.x+o.w/2>=14500));
});

test('bell plate and carriage stay aligned and clear the closed Archive gate throughout their cycle',()=>{
  const plate={...objects.find(o=>o.keepDock==='bell')},catcher={...objects.find(o=>o.keepDockCatch==='bell')};
  const system=environment.createEnvironment(),door=objects.find(o=>o.belfryArchiveGate);
  assert.ok(catcher.x0+Math.abs(catcher.move.dx)+catcher.w/2<door.x-door.w/2);
  for(const time of [0,1.2,2.4,3.6,4.8]){
    system.updateMechanism(plate,time,1/60);system.updateMechanism(catcher,time,1/60);
    assert.equal(plate.x,catcher.x);assert.equal(plate.y,catcher.y);
    assert.ok(catcher.x+catcher.w/2<door.x-door.w/2,'the whole carriage stays west of the sealed gate');
  }
});

test('the first wall contact perch is available before Grip and all new approach rises are ordinary jumps',()=>{
  const wall=objects.find(o=>o.belfryFoldExit),perch=objects.find(o=>o.belfryContactPerch);
  assert.ok(perch.y>=wall.y-wall.h&&perch.y<wall.y);
  assert.ok(wall.x-wall.w/2-(perch.x+perch.w/2)<20);
  const stairs=objects.filter(o=>o.supportedBy==='belfry-release-stair'||o.supportedBy==='belfry-fold-approach').sort((a,b)=>a.y-b.y);
  let previous=0;
  for(const stair of stairs){assert.ok(stair.y-previous<=70);previous=stair.y;}
  const mason=objects.filter(o=>o.supportedBy==='mason-scaffold').sort((a,b)=>a.y-b.y);
  previous=0;for(const step of mason){assert.ok(step.y-previous<=70);previous=step.y;}
});

test('Grip and Archive recovery points sit on real resting surfaces',()=>{
  const expected=[[13280,0],[14570,0],[15490,470],[16250,870]];
  for(const [x,y] of expected){
    assert.ok(objects.some(o=>o.type==='check'&&o.x===x&&o.y===y));
    assert.ok(objects.some(o=>o.type==='plat'&&o.y===y&&Math.abs(o.x-x)<=o.w/2));
  }
  const source=objects.find(o=>o.keepReturn),exit=objects.find(o=>o.keepReturnExit);
  assert.ok(source&&exit);assert.equal(source.y,1080);assert.equal(exit.y,0);
});

function keeperHarness(){
  const oren=structuredClone(objects.find(o=>o.keepKeeper));
  const G={stageIndex:5,cam:0,obstacles:[oren]},meta={world:{}},abilities=new Set();
  const context=vm.createContext({G,meta,VW:1024,hasCapability:id=>abilities.has(id)});
  vm.runInContext(fn('updateKeepKeeper')+'\n'+fn('ambientFigureDialogue'),context);
  return {oren,G,meta,abilities,context};
}

test('the recurring Chainwright moves only when both positions are outside the camera',()=>{
  const h=keeperHarness();h.abilities.add('wall-jump');
  h.context.updateKeepKeeper();assert.equal(h.oren.x,690,'visible old position remains');
  h.G.cam=13000;h.context.updateKeepKeeper();assert.equal(h.oren.x,690,'visible destination remains');
  h.G.cam=8000;h.context.updateKeepKeeper();assert.equal(h.oren.x,13340);
  h.G.keepWestSealOpen=true;h.G.cam=13000;h.context.updateKeepKeeper();assert.equal(h.oren.x,13340);
  h.G.cam=16000;h.context.updateKeepKeeper();assert.equal(h.oren.x,690);
  assert.equal(h.G.obstacles.length,1,'there is one resident, not a duplicate at each stop');
});

test('Keep reuses Oren without a quest transaction and keeps its second resident quiet',()=>{
  const h=keeperHarness();assert.equal(h.oren.residentId,'brute-chainwright');
  assert.equal(h.oren.name,'Oren');assert.equal(h.oren.questActor,undefined);
  assert.equal(objects.find(o=>o.residentId==='keep-hearth-keeper').quietV4,true);
  assert.match(h.context.ambientFigureDialogue(h.oren,false),/chains still hold/);
  h.abilities.add('wall-jump');assert.match(h.context.ambientFigureDialogue(h.oren,true),/fits your hand/);
  h.G.keepWestSealOpen=true;assert.match(h.context.ambientFigureDialogue(h.oren,true),/road home/);
  assert.match(source,/o\.quietV4\|\|o\.type!=='ambientFigure'\|\|G\.outskirtsInteractionTarget!==o/);
});

const runtimeSystems=vm.runInNewContext((await Promise.all(['progression','capabilities','zones','recovery','portals','blood'].map(name=>read('bladefall-'+name+'.js')))).join('\n')+
  ';({capabilities:BladefallCapabilities,recovery:BladefallRecovery,portals:BladefallPortals,blood:BladefallBlood})');
function runtimeHarness({preview=false,campaignCleared=false,grip=false}={}){
  const capabilities=runtimeSystems.capabilities.createState({acquired:[grip?'wall-jump':'portal-pair']}),
    campaign=preview?runtimeSystems.capabilities.createState({acquired:['wall-jump']}):capabilities;
  const G={stageIndex:5,ngPlus:0,levelSelectMode:preview,worldProgressEligible:!preview,cam:0,
    p:{x:13280,y:0,w:28,h:44,vx:0,vy:0,blood:2,maxBlood:5,bloodGuard:0,hp:40},
    obstacles:structuredClone(objects),persistentCircuits:{},sessionCapabilities:preview?capabilities:undefined},
    meta={soundOn:false,capabilities:campaign,world:{keepWestSealOpen:campaignCleared}},
    saved=[],annotations=[],toasts=[],events=[];
  const active=()=>G.sessionCapabilities||meta.capabilities;
  const context=vm.createContext({G,meta,GROUND_Y:700,VW:1024,
    BFCapabilitiesModule:runtimeSystems.capabilities,BFRecoveryModule:runtimeSystems.recovery,BFBloodModule:runtimeSystems.blood,
    BFWorldModule:{stageId:()=> 'ruined-keep'},activeCapabilityProgress:active,
    hasCapability:id=>runtimeSystems.capabilities.has(active(),id),
    restoreUpdraftsReturnGear:()=>{},restoreMarksmanVictory:()=>{},
    syncMovementCapabilities:()=>{},syncPortalCapabilities:()=>{},syncWeaponCapabilities:()=>{},
    vitalityKnotCount:()=>0,effMaxHp:()=>100,persist:()=>events.push('persist'),hudUpdate:()=>{},
    snapOf:p=>structuredClone(p),saveRunAtStage:(stage,snap)=>saved.push({stage,snap:structuredClone(snap),capabilities:structuredClone(active())}),
    showOutskirtsAnnotation:(o,html)=>annotations.push({o,html}),toast:html=>toasts.push(html),
    escText:s=>s,keyLabel:s=>s,kbCode:()=> 'Space',
    commitStageCompletion:()=>events.push('stage'),recordWorldClear:()=>events.push('world'),
    recordStoryStageClear:()=>events.push('story'),recordHelpedTravelers:()=>events.push('travelers'),
    outskirtsInteractionCandidate:()=>G.obstacles.find(o=>o.keepVaultKey),
    sightVaultSecretObject:o=>events.push('sight-key'),activateVaultSecretObject:o=>{o.used=true;events.push('activate-key');}
  });
  vm.runInContext(['seatKeepWeight','restoreKeepMachinery','keepReturnOpen','useKeepReturn','grantMasonsGrip',
    'completeRuinedKeepReward','grantPermanentCapability','activateRuntimeCheckpoint','restoreBlood','syncBloodMirror',
    'persistentCircuitOpen','markPersistentCircuitOpen','restoreSolvedBacktrackDoors','circuitOpen','registerCircuits',
    'beginOutskirtsInteraction'].map(fn).join('\n')+';registerCircuits();',context);
  const contactStart=source.indexOf("  if(G.stageIndex===5&&!hasCapability('wall-jump')){"),
    contactEnd=source.indexOf('\n  for(const o of G.obstacles){',contactStart);
  assert.ok(contactStart>0&&contactEnd>contactStart);
  vm.runInContext('function touchGrip(){const p=G.p;'+source.slice(contactStart,contactEnd)+'}',context);
  return {G,meta,context,saved,annotations,toasts,events,active};
}
function dockParts(h,kind){
  const plate=h.G.obstacles.find(o=>o.keepDock===kind);
  return {plate,weight:h.G.obstacles.find(o=>o.keepPayload===plate.targetCrate),catcher:h.G.obstacles.find(o=>o.keepDockCatch===kind)};
}
function giveTransit(weight,plate){
  weight.x=0;weight.y=0;weight.vx=0;weight.vy=640;
  const entry={x:0,y:0,nx:0,ny:1},exit={x:plate.x+100,y:plate.y+120,nx:-1,ny:0};
  const receipt=runtimeSystems.portals.attemptTransit(weight,[{a:entry,b:exit}],{maximumExitSpeed:640});
  assert.equal(receipt.transited,true);assert.equal(weight._portalExit,exit);
}

test('a notch rejects a foreign stone, an unrouted shove, a rising pass, and an off-center miss',()=>{
  const h=runtimeHarness(),{plate,weight}=dockParts(h,'fold'),foreign=dockParts(h,'masonry').weight;
  Object.assign(foreign,{x:plate.x,y:plate.y,vy:0,_portalExit:{x:1,y:1}});
  assert.equal(h.context.seatKeepWeight(plate,false),false,'a different named payload cannot satisfy the notch');
  Object.assign(weight,{x:plate.x,y:plate.y,vx:50,vy:0});
  assert.equal(h.context.seatKeepWeight(plate,false),false,'walking the correct crate onto the plate is insufficient');
  giveTransit(weight,plate);Object.assign(weight,{x:plate.x,y:plate.y,vy:-80});
  assert.equal(h.context.seatKeepWeight(plate,false),false,'the rising half of a launch cannot latch');
  Object.assign(weight,{x:plate.x+90,vy:50});assert.equal(h.context.seatKeepWeight(plate,false),false);
  Object.assign(weight,{x:plate.x,y:plate.y+60});assert.equal(h.context.seatKeepWeight(plate,false),false);
  Object.assign(weight,{y:plate.y+3,vx:-220,vy:120});
  assert.equal(h.context.seatKeepWeight(plate,false),true,'a genuine descending routed landing is caught');
  assert.equal(weight.keepSeated,true);assert.equal(weight.x,plate.x);assert.equal(weight.y,plate.y);
  assert.equal(weight.vx,0);assert.equal(weight.vy,0);
});

test('landing on the moving bell stops its carriage and hydration rebuilds the solved arrangement',()=>{
  const h=runtimeHarness(),{plate,weight,catcher}=dockParts(h,'bell'),system=environment.createEnvironment();
  system.updateMechanism(plate,.7,1/60);system.updateMechanism(catcher,.7,1/60);
  giveTransit(weight,plate);Object.assign(weight,{x:plate.x,y:plate.y,vy:90});
  assert.equal(h.context.seatKeepWeight(plate,false),true);const seatedX=plate.x;
  for(const t of [1.2,2.4,3.6]){system.updateMechanism(plate,t,1/60);system.updateMechanism(catcher,t,1/60);}
  assert.equal(plate.x,seatedX);assert.equal(catcher.x,seatedX);assert.equal(catcher.dxf,0);
  h.context.markPersistentCircuitOpen('belfry-bell','latched-plate');
  h.G.obstacles=structuredClone(objects);h.context.registerCircuits();h.context.restoreKeepMachinery();
  const restored=dockParts(h,'bell');assert.equal(restored.plate.pressed,true);
  assert.equal(restored.weight.keepSeated,true);assert.equal(restored.weight.x,restored.plate.x);
  assert.equal(restored.catcher.move,null);assert.equal(restored.plate.move,null);
});

test('Grip is granted on contact without a bag or modal and immediately saves its local checkpoint once',()=>{
  const h=runtimeHarness();h.G.p.x=13280-40;h.context.touchGrip();
  assert.equal(runtimeSystems.capabilities.has(h.active(),'wall-jump'),false);assert.equal(h.saved.length,0);
  h.G.p.x=13280-20;h.context.touchGrip();
  assert.equal(runtimeSystems.capabilities.has(h.active(),'wall-jump'),true);
  assert.equal(h.G.p.blood,5);assert.equal(h.G.p.ckX,13280);assert.equal(h.G.p.ckY,0);
  assert.equal(h.saved.length,1);assert.equal(runtimeSystems.capabilities.has(h.saved[0].capabilities,'wall-jump'),true);
  assert.equal(h.toasts.length,0);assert.equal(h.annotations.length,1);
  assert.equal(h.context.circuitOpen('keep-weight'),true);assert.equal(h.context.circuitOpen('belfry-fold'),true);
  assert.equal(h.context.circuitOpen('belfry-bell'),false);
  h.context.touchGrip();assert.equal(h.context.grantMasonsGrip(),false);
  assert.equal(h.saved.length,1);assert.equal(h.annotations.length,1);
});

test('the key refuses premature interaction and successful recovery commits campaign progress exactly once',()=>{
  const h=runtimeHarness(),key=h.G.obstacles.find(o=>o.keepVaultKey);
  assert.equal(h.context.beginOutskirtsInteraction(),false);assert.equal(key.used,undefined);
  assert.equal(h.context.completeRuinedKeepReward(),false);assert.equal(h.events.length,0);
  h.context.grantMasonsGrip();assert.equal(h.context.beginOutskirtsInteraction(),false);
  h.context.markPersistentCircuitOpen('belfry-bell','latched-plate');
  assert.equal(h.context.beginOutskirtsInteraction(),true);assert.equal(key.used,true);
  assert.equal(h.context.keepReturnOpen(),true);assert.equal(h.context.persistentCircuitOpen('keep-key-recovered'),true);
  assert.equal(h.meta.world.keepWestSealOpen,true);assert.equal(h.meta.bestStage,6);
  assert.equal(h.G.p.ckX,16810);assert.equal(h.G.p.ckY,1080);
  assert.deepEqual(h.events.filter(e=>['stage','world','story','travelers'].includes(e)),['stage','world','story','travelers']);
  const saves=h.saved.length;assert.equal(h.context.completeRuinedKeepReward(),false);assert.equal(h.saved.length,saves);
});

test('preview Keep ignores campaign completion and restores only its own earned key',()=>{
  const h=runtimeHarness({preview:true,campaignCleared:true,grip:true});
  h.context.restoreSolvedBacktrackDoors();assert.equal(h.context.keepReturnOpen(),false);
  assert.equal(h.context.circuitOpen('belfry-bell'),false);assert.equal(h.context.completeRuinedKeepReward(),false);
  const before=JSON.stringify(h.meta.capabilities);
  h.context.markPersistentCircuitOpen('belfry-bell','preview-plate');
  assert.equal(h.context.completeRuinedKeepReward(),true);assert.equal(h.meta.bestStage,undefined);
  assert.equal(JSON.stringify(h.meta.capabilities),before);
  assert.equal(h.events.some(e=>['stage','world','story','travelers'].includes(e)),false);
  h.G.keepWestSealOpen=false;h.G.ruinedKeepArchiveComplete=false;h.G.obstacles=structuredClone(objects);
  h.context.restoreKeepMachinery();assert.equal(h.context.keepReturnOpen(),true);
  assert.equal(h.G.obstacles.find(o=>o.keepVaultKey).used,true);
});

test('the service lift requires the earned key and saves safe reciprocal arrival checkpoints',()=>{
  const h=runtimeHarness({grip:true}),upper=h.G.obstacles.find(o=>o.keepReturn),lower=h.G.obstacles.find(o=>o.keepReturnExit);
  const before={x:h.G.p.x,y:h.G.p.y};assert.equal(h.context.useKeepReturn(upper),false);
  assert.deepEqual({x:h.G.p.x,y:h.G.p.y},before);assert.equal(h.saved.length,0);
  h.context.markPersistentCircuitOpen('belfry-bell','test');h.context.completeRuinedKeepReward();
  Object.assign(h.G.p,{vx:300,vy:-450,onWall:true,onGround:true,floorPlat:{},_restMouth:{}});
  assert.equal(h.context.useKeepReturn(upper),true);
  assert.equal(h.G.p.x,lower.x);assert.equal(h.G.p.y,lower.y);
  assert.equal(h.G.p.vx,0);assert.equal(h.G.p.vy,0);assert.equal(h.G.p.onWall,false);
  assert.equal(h.G.p.floorPlat,null);assert.equal(h.G.p._restMouth,null);
  assert.equal(h.G.p.ckX,lower.x);assert.equal(h.saved.at(-1).snap.ckY,lower.y);
  assert.equal(h.context.useKeepReturn(lower),true);assert.equal(h.G.p.x,upper.x);assert.equal(h.G.p.ckY,upper.y);
});

test('Continue chooses only the saved preview checkpoint and preserves campaign recovery isolation',()=>{
  const campaignPoint={id:'ruined-keep:campaign',zoneId:'ruined-keep',kind:'checkpoint',position:{x:690,y:0}},
    previewPoint={id:'ruined-keep:archive-key',zoneId:'ruined-keep',kind:'checkpoint',position:{x:16810,y:1080}},
    meta={recovery:{activeCheckpoint:campaignPoint}},
    G={stageIndex:5,levelSelectMode:true,p:{ckSet:true,ckX:16810,ckY:1080,blood:5},
      sessionCapabilities:{acquired:['wall-jump']},sessionQuests:{},sessionZoneState:{}},persisted=[],
    context=vm.createContext({meta,G,BFWorldModule:{stageId:i=>i===5?'ruined-keep':'black-woods'},BFRecoveryModule:runtimeSystems.recovery,
      snapOf:p=>({blood:p.blood}),persist:()=>persisted.push(JSON.parse(JSON.stringify(meta.run)))});
  vm.runInContext(['runRecoveryPoint','savedRunSession','saveRunAtStage'].map(fn).join('\n'),context);
  const run={stageIndex:5,levelSelectMode:true,previewCheckpoint:previewPoint};
  let chosen=context.runRecoveryPoint(run);assert.equal(chosen.position.x,16810);assert.equal(chosen.position.y,1080);
  for(const bad of [undefined,null,{...previewPoint,zoneId:'black-woods'},
    {...previewPoint,position:{x:NaN,y:1080}},{...previewPoint,position:{x:16810,y:Infinity}},
    {...previewPoint,position:{x:16810}}]){
    assert.equal(context.runRecoveryPoint({...run,previewCheckpoint:bad}),null,'invalid preview data cannot fall back to campaign recovery');
  }
  chosen=context.runRecoveryPoint({...run,levelSelectMode:false});
  assert.equal(chosen.position.x,690);assert.equal(chosen.position.y,0,'campaign ignores the unrelated preview point');
  assert.equal(context.runRecoveryPoint({...run,levelSelectMode:false,stageIndex:1}),null,'a checkpoint in another region is not reused');
  context.saveRunAtStage(5);
  assert.equal(persisted.length,1);assert.equal(persisted[0].previewCheckpoint.zoneId,'ruined-keep');
  assert.deepEqual(persisted[0].previewCheckpoint.position,{x:16810,y:1080});
  assert.equal(persisted[0].p.x,undefined,'the normal player snapshot still omits position');
  chosen=context.runRecoveryPoint(persisted[0]);assert.equal(chosen.position.x,16810);assert.equal(chosen.position.y,1080);
  G.levelSelectMode=false;context.saveRunAtStage(5);
  assert.equal(persisted[1].previewCheckpoint,null,'campaign saves do not retain the preview recovery point');
  assert.equal(context.runRecoveryPoint(persisted[1]).position.x,690);
  G.levelSelectMode=true;G.p.ckSet=false;context.saveRunAtStage(5);
  assert.equal(persisted[2].previewCheckpoint,null);assert.equal(context.runRecoveryPoint(persisted[2]),null);
});
