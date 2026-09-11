import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
const shops=await readFile(new URL('../public/bladefall-shops.js',import.meta.url),'utf8');
const recovery=await readFile(new URL('../public/bladefall-recovery.js',import.meta.url),'utf8');
const movement=await readFile(new URL('../public/bladefall-movement-progression.js',import.meta.url),'utf8');
const start=source.indexOf('const UPDRAFTS_LEVEL=');
const end=source.indexOf('/* ================================================================\n   HOLLOW MARKSMAN',start);
const stage=source.slice(start,end);

test('Updrafts is an 18k seven-room authored route with intentional negative space',()=>{
  assert.match(stage,/\{len:18000,portal:null,/);
  for(const landmark of ['rootbreach-lift','bellows-rest','kite-stair','windwright-brace','needlewind-labyrinth','rain-catcher','signal-crown'])
    assert.match(stage,new RegExp(`'${landmark}'`));
  assert.equal((stage.match(/Check\(/g)||[]).length,7);
  assert.doesNotMatch(stage,/windDebris|windwright-route-board|airRefillPerch/);
});

test('Rootbreach and Bellows form a Dash/refill commissioning climb',()=>{
  assert.match(stage,/Gr\(0,330\).*Pl\(600,120,70.*dashLanding:1.*Pl\(970,140,150.*dashLanding:2.*Cry\(1215,235\).*Pl\(1450,180,250.*dashRefillLanding:1/s);
  assert.match(movement,/runSpeed: 200/);
  assert.match(movement,/dashSpeedMultiplier: 3/);
  assert.match(stage,/Gr\(1500,2250\).*Pl\(2410,120,75.*packApproach:1.*Pl\(2690,120,150.*packApproach:2.*Cry\(2940,270\).*Pl\(3200,190,340.*packSanctum:1,requiresAirRefill:1/s);
  assert.match(stage,/Pl\(2955,300,75,\{supportedBy:'bellows-frame',bellowsRetryStep:1,recoveryOnly:1\}\)/);
  assert.match(stage,/Lever\(3120,340,'aerie-pack-ready'.*aeriePackRelease:1,mooringBrake:1.*silentLever:1/s);
  assert.match(stage,/Scenery\(3225,340,'aerie-harness-rack'.*commissioningRig:1/s);
  assert.match(stage,/kind:'jetpack',ritualLocked:true,sourceKind:'aerie-harness-rack'/);
  assert.match(source,/if\(o\.aeriePackRelease\).*pack\.ritualLocked=false/s);
  assert.match(source,/if\(o\.mooringBrake\).*not advertised by the generic red lever glow/s);
  assert.match(source,/id==='aerie-pack-owned'.*G\.p\.hasJetpack/);
});

test('Kite Terraces examines Dash, Pack thrust, and the crystal together',()=>{
  assert.match(stage,/Pl\(4780,210,650.*Cry\(5260,1000\),Pl\(5600,180,1500.*requiresAirRefill:1,threeVerbLanding:1.*Check\(5600,1480\)/s);
});

test('Bellows refuge functions are separated and the service lift is a marked return route',()=>{
  assert.match(stage,/residentId:'updrafts-kitemender',name:'Talla'/);
  assert.match(shops,/id: 'bellows-exchange', stageIndex: 3, x: 2150/);
  assert.match(recovery,/\['bellows-rest', 'updrafts', 'Bellows Rest', 0\.10, true\]/);
  assert.match(stage,/rainShortcutReturn:1,requiresShortcut:'rain-service-lift'/);
  assert.match(source,/if\(o\.requiresShortcut&&!updraftsShortcutOpen\(o\.requiresShortcut\)\)continue/);
  assert.match(source,/if\(o\.requiresShortcut&&!updraftsShortcutOpen\(o\.requiresShortcut\)\)\{c\.restore\(\);return;\}/);
  assert.match(source,/openUpdraftsShortcut\(o\.shortcutId\)/);
  assert.match(stage,/RAIN-CATCHER SERVICE LIFT · WEST RETURN/);
  assert.match(source,/openUpdraftsShortcut\('rain-service-lift'\)/);
  assert.match(source,/data-map-shortcut="rain-service-lift"/);
  assert.match(source,/RAIN-CATCHER LIFT\$\{liftState\.open\?' · OPEN':' · INACTIVE'\}/);
});

test('Choir cinder directly latches Gate I and uses permanent restrained heat',()=>{
  assert.match(stage,/Lever\(7240,115,'wind-gate-1'.*cinderVessel:1.*silentLever:1/s);
  assert.doesNotMatch(stage,/requiresCinder/);
  assert.match(source,/channel\._bfReaction\.time=channel\._bfReaction\.duration=1e9/);
  assert.doesNotMatch(source,/CINDERS RISE/);
  assert.doesNotMatch(source,/COLLECTOR '+romanNum/);
  assert.match(source,/Heat is conveyed through shimmer, soot and sparse embers/);
  assert.match(source,/Elemental currents affect every ordinary enemy, including flying Choir/);
});

test('Needlewind is a long smooth main path with rewarding rejoin routes and an honest dead end',()=>{
  assert.equal((stage.match(/WindTunnel\(/g)||[]).length,4);
  assert.match(stage,/curveSequence:\['descending-hook','corkscrew','rising-s','final-crest'\]/);
  assert.match(stage,/id:'needlewind-inner-eye'.*optionalNeedleBranch:1/s);
  assert.match(stage,/id:'needlewind-high-arc'.*masteryBranch:1/s);
  assert.match(stage,/id:'needlewind-torn-sail'.*deadEndBranch:1,force:0/s);
  assert.match(stage,/windVaneAutoLatch:1/);
  assert.match(source,/o\.windVaneAutoLatch&&p\.hasJetpack/);
  assert.match(stage,/gale-stitch-cache/);
  assert.match(stage,/windwoven-thread-cache/);
  assert.match(source,/const authoredForce=Number\.isFinite\(tunnelFlow\.owner\.force\)\?tunnelFlow\.owner\.force:92/);
  assert.equal((stage.match(/safePocket:/g)||[]).length,3);
});

test('Needlewind collision, art, and current share one sampled curve authority',()=>{
  assert.match(source,/function WindTunnel\(points,halfWidth,o\)/);
  assert.match(source,/function windTunnelNearest\(o,x,y\)/);
  assert.match(source,/function drawWindTunnel\(c,o\)/);
  assert.match(source,/tunnelFlow&&tunnelFlow\.hazardous/);
  assert.match(source,/gMul\*=\.18/);
  assert.match(source,/p\.fuel = Math\.max\(0,p\.fuel-45/);
});

test('Rain-Catcher is contained, moving, and opens only after all three collectors latch',()=>{
  assert.match(stage,/Wl\(14000,80,260,36\).*basinSide:'west'/s);
  assert.match(stage,/Wl\(15200,80,260,36\).*basinSide:'east'/s);
  assert.match(stage,/Fluid\(14600,1160,-160,190,'water'.*contained:true,basinId:'updrafts-rain-catcher'/s);
  assert.equal((stage.match(/windCollector:1/g)||[]).length,3);
  assert.match(stage,/collectorIndex:2,collectorPrereq:'collector-west'/);
  assert.match(stage,/collectorIndex:3,collectorPrereq:'collector-heart'/);
  assert.match(stage,/requiresCircuit:'collector-west'.*requiresCircuit:'collector-heart'/s);
  assert.match(stage,/type:'updraft',x:15270,y:0,w:260,h:390,strongRefill:1,requiresCircuit:'wind-gate-3'.*rainReturnVent:1/s);
  assert.match(source,/function windCollectorAtCatch\(o\)/);
  assert.match(source,/if\(!windCollectorAtCatch\(o\)\)/);
  assert.match(source,/id==='wind-gate-3'.*collectors\.length===3&&collectors\.every\(o=>o\.timer>0\)/s);
  assert.match(source,/o\.windCollector&&!o\.timer.*o\.timer=o\.dur=1e9.*o\.aligned=true/s);
  assert.match(source,/if\(aligned===3\).*openUpdraftsShortcut\('rain-service-lift'\)/s);
});

test('Signal Crown has unconditional recovery plus a gate-powered lift and physical exit',()=>{
  assert.match(stage,/Gr\(16100,17780\).*aerieNest:1,crownRecoveryFloor:1/s);
  assert.match(stage,/strongRefill:1,spiral:1,requiresCircuit:'all-wind-gates'/);
  assert.match(stage,/Cry\(17155,475\)/);
  assert.match(stage,/Wl\(17810,760,760,42\).*crownExitCliff:1.*Pl\(17920,120,810.*crownExitLip:1/s);
  assert.doesNotMatch(stage,/Gr\(17840,18000\)/);
  assert.match(source,/connector:'updrafts-marksman'.*G\.p\.y>=720/s);
  assert.match(source,/if\(updraftsGateCount\(\)===3&&p\.x>16050\)\{n\.x=16440;n\.y=0;\}/);
  assert.match(stage,/Scenery\(16600,0,'portal-gun-plinth'/);
  assert.match(stage,/kind:'portalSingle',ritualLocked:true,sourceKind:'portal-gun-plinth'/);
  assert.match(source,/if\(crownGun\)return claimSignalCrownPortal\(crownGun\)/);
  assert.match(source,/id==='updrafts-clearance'\)return hasCapability\('portal-single'\)/);
  assert.match(source,/LINKED PORTAL REMEMBERED.*One anchored mouth now answers the portal gun.*kind:'marker',manual:true,radius:420/s);
  assert.doesNotMatch(source,/addText\(pk\.x,GROUND_Y-pk\.y-92,'LINKED PORTAL REMEMBERED'/);
});

test('Level Select uses session quest and shortcut state instead of campaign leakage',()=>{
  assert.match(source,/BFQuestsModule\.hasEvent\(activeQuestProgress\(\),'traveler-helped','ilyra','updrafts'\)/);
  assert.match(source,/const state=G\.levelSelectMode\?G\.sessionZoneState:meta\.zoneState/);
  assert.match(source,/if\(G\.levelSelectMode\)G\.sessionZoneState=next;else\{meta\.zoneState=next;persist\(\);\}/);
});

test('Talla, Edrin, and Ilyra use deliberate Up interaction and environmental language',()=>{
  assert.match(stage,/residentId:'updrafts-rainkeeper',name:'Edrin'/);
  assert.match(source,/if\(o\.profileId==='ilyra'\)return interactWithIlyra\(o\)/);
  assert.match(source,/The Crown has three empty bearings/);
  assert.doesNotMatch(source,/No portal is needed here/);
  assert.match(source,/grantPermanentCapability\('portal-single','signal-crown'\)/);
  assert.match(source,/The high road is awake\. You carry its mouth/);
});

test('death feedback never exposes internal checkpoint ids or replays the stage banner',()=>{
  assert.match(source,/G\.stageBanner=0/);
  assert.match(source,/The wind carries you back/);
  assert.doesNotMatch(source,/returning to <b>'\+escText\(death\.plan\.checkpointId\)/);
});
