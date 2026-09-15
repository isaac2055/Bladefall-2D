import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const start = source.indexOf('/* ---- STAGE 3 · BROKEN CAUSEWAY');
const end = source.indexOf('const UPDRAFTS_LEVEL', start);
const stage = source.slice(start, end);

test('Broken Causeway owns five long-form rooms using jump and weapon only', () => {
  assert.match(stage, /\{len:14000,portal:null,physicalExit:'return-to-black-woods'/);
  for (const landmark of ['chainwake-camp', 'drop-hoist', 'causeway-gears', 'broken-causeway-gate'])
    assert.match(stage, new RegExp(`'${landmark}'`));
  for (const boundary of ['Gr(0,2600)', 'Gr(2600,5600)', 'Gr(5600,8200)', 'Gr(8200,10500)', 'Gr(10500,14000)'])
    assert.ok(stage.includes(boundary), boundary);
  assert.doesNotMatch(stage, /\bSlate\(|\bAnchor\(|portalTruth|portalDecoy/);
  assert.match(source, /criticalCapabilities:\['jump','weapon'\]/);
});

test('Drop Yard machinery is deterministic, recoverable, and cannot softlock', () => {
  assert.match(stage, /Plate\(4050,0,'drop-yard',true\),\{trapOnly:1\}/);
  assert.match(stage, /targetCircuit:'drop-yard',resetMiss:2\.8/);
  assert.match(stage, /type:'door',x:5360.*circuit:'drop-yard'/);
  assert.match(source, /if\(o\.trapOnly\)/);
  assert.match(source, /if\(o\.hoist&&o\.state==='idle'\)/);
  assert.match(stage, /RepairCatch\(3420,130,'causeway-catch-yard'\)/);
  assert.match(stage, /RepairCatch\(4930,105,'causeway-catch-rise'\)/);
});

test('Chainwalk and Counterweight Rise offer authored route and combat choices', () => {
  assert.equal((stage.match(/upperRoute:1/g)||[]).length, 7);
  assert.equal((stage.match(/causewayRole:/g)||[]).length, 6);
  assert.equal((stage.match(/patrol:\[/g)||[]).length, 6);
  assert.equal((stage.match(/noticeRange:/g)||[]).length, 6);
  for (const rise of [65,130,195,260,325])assert.match(stage,new RegExp(`Pl\\(\\d+,\\d+,${rise}`));
  assert.match(stage, /StoryRelic\(9300,360,'wristguard-bearer'/);
  assert.match(source, /if\(en\.causewayRole\)\{e\.causewayRole=en\.causewayRole;e\.authoredEncounter=true;e\.active=false;\}/);
});

test('Brute uses airborne rivets, a remote release, and a resettable lure-and-drop transformation', () => {
  assert.match(source, /e\.portalGate='bruteRivets';e\.bruteMachineryFight=true/);
  assert.equal((source.match(/bruteRivetIndex:/g)||[]).length,3);
  assert.match(source, /bruteDropRelease:1/);
  assert.match(source, /if\(!pr\|\|pr\.shape!=='arrow'\|\|pr\.owner!=='player'\|\|!pr\.airborneShot\)return true/);
  assert.match(source, /weight\.active=1;weight\.vy=0;weight\.resetT=0/);
  assert.match(source, /o\.active===3/);
  assert.match(source, /o\.y=Math\.min\(o\.y0,o\.y\+520\*dt\)/);
  assert.match(source, /beginBruteTransformation\(boss,o\)/);
  assert.match(source, /e\.bruteArmorBroken=true;e\.bruteState='transform'/);
  assert.match(source, /e\.bruteState='recover';e\.bruteRecover=\.72;e\.portalGate=null/);
  assert.match(source, /if\(e\.bruteRecover<=0\)e\.bruteState='pursuit'/);
  assert.match(source, /e\.bruteState='slamWind'/);
  assert.match(source, /e\.bruteState='rushWind'/);
});

test('Broken Standard introduces the bow through three physical precision rivets', () => {
  assert.match(stage, /Pl\(10840,180,65,\{archeryStep:1\}\).*Pl\(11400,210,260,\{archeryPerch:1\}\)/s);
  assert.match(stage, /Pl\(11840,150,65,\{archeryReturnStep:1\}\).*Pl\(11600,120,260,\{archeryReturnStep:1\}\)/s);
  assert.match(stage, /Scenery\(11400,260,'causeway-bow-rack'/);
  assert.match(stage, /\{x:11400,y:278,kind:'bruteBow',sourceKind:'causeway-bow-rack'\}/);
  assert.match(source, /makeWeapon\('bow','rare','Chainwake Longbow'\)/);
  assert.match(source, /e\.bruteState='dormant';\s*e\.bruteDormant=true/);
  assert.equal((source.match(/bruteWakeLever:1,bruteRivetIndex:/g)||[]).length,3);
  assert.match(source, /if\(e\.bruteDormant\)\{e\.active=false;e\.vx=0;e\.vy=0;e\.lunge=0;continue;\}/);
  assert.match(source, /boss\.bruteWakeRivets\[o\.id\]=true/);
  assert.match(source, /boss\.bruteWakeHits=Object\.keys\(boss\.bruteWakeRivets\)/);
  assert.match(source, /if\(boss\.bruteWakeHits>=need\)awakenBruteFromChain\(o,boss\)/);
  assert.equal((source.match(/bruteDropRelease:1,authoringCritical:1/g)||[]).length,2);
  assert.equal((source.match(/bruteReleaseStep:1/g)||[]).length,4);
  assert.equal((source.match(/bruteReleasePerch:1/g)||[]).length,2);
  assert.match(source,/Pl\(releaseX-300,80,55,\{bruteReleaseStep:1\}\)[\s\S]*Pl\(releaseX-220,80,110,\{bruteReleaseStep:1\}\)[\s\S]*Pl\(releaseX-105,190,170,\{bruteReleasePerch:1\}\)/);
  assert.match(source,/Pl\(weightX\+610,80,55,\{bruteReleaseStep:1\}\)[\s\S]*Pl\(weightX\+530,80,110,\{bruteReleaseStep:1\}\)[\s\S]*Pl\(weightX\+435,190,170,\{bruteReleasePerch:1\}\)/);
  assert.match(source, /bossContract:\{airborneRivets:3,remoteRelease:true,lureUnderWeight:true,missResets:true,returnStair:true,portal:false\}/);
  assert.doesNotMatch(stage, /THREE RIVETS HOLD|CUT THE CHAIN|BAIT THE BRACE/);
  assert.doesNotMatch(stage, /focus|charged|hold attack/i);
});

test('the counterweight breaks the armor without granting or requiring Focus', () => {
  assert.doesNotMatch(source, /grantWeaponTechnique\('focus','brute-counterweight'\)/);
  assert.match(source, /e\.bruteFocusArmor=false;e\.portalGate='bruteTransform'/);
  assert.match(source, /e\.bruteState='recover';e\.bruteRecover=\.72;e\.portalGate=null/);
  assert.match(source, /if\(weight\)\{weight\.active=2/);
  assert.doesNotMatch(source, /function breakBruteFocusArmor\(e\)/);
  assert.doesNotMatch(source, /HOLD ATTACK · BREAK PLATE/);
});

test('counterweight firing decks are reachable with opening jump and overlap the arrow target', () => {
  // Opening jump is 480 px/s against 1400 px/s² gravity: ~82px theoretical
  // height. Each authored rise stays comfortably below that envelope.
  const jumpHeight=(480*480)/(2*1400),rises=[55,55,60];
  assert.ok(rises.every(rise=>rise<jumpHeight),`${jumpHeight}px jump must clear ${rises.join(', ')}px rises`);
  // A bow spawns at player anchor + h/2 (44/2). Target collision accepts a
  // vertical difference strictly below 28 + arrow size (5), never equal to it.
  const deckY=170,arrowY=deckY+44/2,targetY=220,collisionRadius=28+5;
  assert.ok(Math.abs(targetY-arrowY)<collisionRadius,
    `arrow at ${arrowY} must overlap target at ${targetY} inside ${collisionRadius}px`);
});

test('Brute defeat grants Dash, records completion, and creates no exit portal', () => {
  assert.match(source, /grantPermanentCapability\('dash','brute-counterweight'\)/);
  assert.match(source, /commitStageCompletion\(\);recordWorldClear\(\);recordStoryStageClear\(\);recordHelpedTravelers\(\)/);
  assert.match(source, /else if\(e\.whiteCourtFight\|\|e\.type==='brute'\|\|\(e\.type==='archer'&&G\.stageIndex===4\)\|\|\(e\.type==='warden'&&G\.stageIndex===6\)\)G\.portal=null/);
  assert.match(source, /G\.stageIndex===2&&G\.p\.x<G\.levelLength\/2.*targetStage:1/s);
  assert.match(source,/function showBruteDefeatBriefing\(\)/);
  assert.match(source,/This message waits until you dismiss it/);
  assert.match(source,/return <b>west<\/b> through the Causeway and Black Woods/i);
  assert.match(source,/if\(e\.type==='brute'&&G\.ngPlus===0\)showBruteDefeatBriefing\(\)/);
  assert.match(source,/Oren’s repaired Drop Yard gate now holds open/);
});

test('Only Oren repair permanently opens the mandatory westbound Drop Yard gate', () => {
  assert.match(source,/if\(o\.causewayRepairShortcut\)return !!\(G\.causewayRepair&&G\.causewayRepair\.completed\)/);
  assert.doesNotMatch(source,/const causewayCleared=/);
  const gateX=Number(stage.match(/type:'door',x:(\d+).*causewayRepairShortcut:1/)[1]);
  const catches=[...stage.matchAll(/RepairCatch\((\d+),\d+,'causeway-catch-(?:yard|rise)'\)/g)].map(match=>Number(match[1]));
  assert.equal(catches.length,2);
  assert.ok(catches.every(x=>x<gateX),`both mandatory catches (${catches}) must be reachable west of gate ${gateX}`);
});

test('Both mandatory catches disclose an Up interaction and have opening-jump approaches', () => {
  assert.match(source,/target\.repairCatch\|\|target\.keepDropRelease\?'↑  RELEASE'/);
  assert.match(source,/if\(o\.repairCatch\)\{pullLever\(o\);return true;\}/);
  assert.match(stage,/Pl\(3200,170,65.*Pl\(3420,170,130/s);
  assert.match(stage,/Pl\(4700,150,50.*Pl\(4930,170,105/s);
  const jumpHeight=(480*480)/(2*1400);
  assert.ok(65<jumpHeight&&55<jumpHeight,`${jumpHeight}px opening jump must clear both repair approaches`);
  // Platform edge gaps are 50px and 70px respectively, within a normal
  // running jump rather than a future Dash or Wall Jump requirement.
  assert.ok(50<100&&70<100);
});

test('Level Select can run Oren locally without granting Focus or mutating campaign quests', () => {
  assert.match(source,/levelSelectMode:!!\(opts&&opts\.levelSelect\),sessionQuests:opts&&opts\.levelSelect\?BFQuestsModule\.createProgress\(\):null/);
  assert.match(source,/const sessionOnly=!!\(G&&G\.levelSelectMode\)/);
  assert.match(source,/capabilities:\[\.\.\.new Set\(activeCapabilityProgress\(\)&&activeCapabilityProgress\(\)\.acquired\|\|\[\]\)\]/);
  assert.match(source,/return !!\(G&&\(G\.bossRush\|\|G\.battle\)\)\|\|BFWeaponProgressionModule\.hasTechnique\(meta\.weaponTechniques,id\)/);
});

test('Up Arrow starts Oren and releases either broad-stance safety catch', () => {
  assert.match(source,/if\(o\.questActor&&talkQuestContact\(\)\)return true/);
  assert.match(source,/target\.questActor\?'↑  TALK'/);
  assert.match(source,/else if\(o\.repairCatch\|\|o\.keepDropRelease\)\{xr=108;yr=120;\}/);
});

test('A newly offered quest remains readable longer than an ordinary toast', () => {
  assert.match(source,/before&&before\.state==='available'\?6000:undefined/);
});

test('Brute grants run-local Dash in Level Select and the seam accepts it', () => {
  assert.match(source,/function activeCapabilityProgress\(\)\{return G&&G\.sessionCapabilities\|\|meta\.capabilities;\}/);
  assert.match(source,/const sessionOnly=!!G\.levelSelectMode/);
  assert.match(source,/if\(sessionOnly\)G\.sessionCapabilities=result\.state;else meta\.capabilities=result\.state/);
  assert.match(source,/G\.levelSelectMode&&hasCapability\('dash'\)/);
  assert.match(source,/capabilities:activeCapabilityProgress\(\)&&activeCapabilityProgress\(\)\.acquired\|\|\[\]/);
});

test('Level Select hydrates fresh encounters instead of campaign boss clears', () => {
  assert.match(source,/sessionZoneState:opts&&opts\.levelSelect\?BFZoneStateModule\.createState\(\):null/);
  assert.match(source,/const state=G\.levelSelectMode\?G\.sessionZoneState:meta\.zoneState/);
  assert.match(source,/if\(G\.levelSelectMode\)G\.sessionZoneState=result\.state;else meta\.zoneState=result\.state/);
});

test('Dash turns the bruised Black Woods seam into the Updrafts road and preserves a return', () => {
  assert.match(source,/if\(o\.woodsReturnSecret&&verb==='dash-impact'\)openBlackWoodsWindShaft\(o\)/);
  assert.match(source,/function openBlackWoodsWindShaft\(sourceObject\)/);
  assert.match(source,/blackWoodsAscent:1/);
  assert.match(source,/h:1700/);
  assert.match(source,/threshold:1480/);
  assert.match(source,/inside&&G\.p\.y>=shaft\.threshold/);
  assert.match(source,/beginPhysicalBranchTransition\('black-woods-updrafts','black-woods',shaft\.sourceObject\)/);
  assert.match(source,/function beginPhysicalBranchTransition\(connector,zone,sourceObject\)/);
  assert.match(source,/BFZoneStreamer\.cross\(connector,zone,state\)/);
  assert.match(source,/sourceObject\.used=false;sourceObject\.gone=false;sourceObject\.opened=false/);
  assert.match(source,/plan\.connectorId==='black-woods-updrafts'&&plan\.targetZoneId==='updrafts'.*x=70;y=0/s);
  assert.match(source,/G\.stageIndex===3.*connector:'black-woods-updrafts'.*targetStage:1/s);
});

test('Brute transformation authority is included in co-op snapshots', () => {
  assert.match(source, /e\.bruteArmorBroken\?1:0,e\.bruteState\|\|null/);
  assert.match(source, /e\.portalGate=e\.bruteArmorBroken\?\(e\.bruteState==='transform'\?'bruteTransform':null\)/);
});

test('Causeway content is spatial, concise, and exposed for acceptance', () => {
  assert.match(stage, /residentId:'brute-chainwright'.*name:'Oren'/);
  assert.match(stage, /residentId:'brute-stretcher'.*name:'Sable'/);
  assert.match(source, /const CAUSEWAY_ROOM_CUES=Object\.freeze/);
  assert.match(source, /G\.causewayProduction=G\.stageIndex===2\?/);
  assert.match(source, /bossContract:\{airborneRivets:3,remoteRelease:true,lureUnderWeight:true,missResets:true,returnStair:true,portal:false\}/);
  assert.match(source, /causewayState:\(\)=>G&&G\.causewayProduction\|\|null/);
  assert.doesNotMatch(source,/JAMMED · ASK THE CHAINWRIGHT/);
  assert.match(source,/const repair=questRow\('release-the-causeway'\),disclosed=!!\(repair&&repair\.started\)/);
});

test('Brute deaths retry from the claimed boss-threshold checkpoint', () => {
  assert.match(source, /BFRecoveryModule\.recordDeath\(meta\.recovery,zoneId,fallback\)/);
  assert.match(source, /G\.p\.x=death\.plan\.position\.x;G\.p\.y=death\.plan\.position\.y/);
  assert.match(source, /captureCurrentZonePersistence\(\);/);
});
