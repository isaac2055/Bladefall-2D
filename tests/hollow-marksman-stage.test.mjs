import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const source = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const start = source.indexOf('const HOLLOW_MARKSMAN_LEVEL=');
// End at whatever is authored next - a following level or its banner comment -
// so inserting a new stage here cannot silently widen this slice.
const rest = source.slice(start + 1);
const nextBlock = rest.search(/\nconst [A-Z0-9_]+_LEVEL\s*=|\n\/\*/);
const end = nextBlock < 0 ? source.length : start + 1 + nextBlock;
const stage = source.slice(start, end);

test('Hollow Marksman is a 15k five-room authored watch road', () => {
  assert.match(stage, /\{len:15000,/);
  for (const landmark of ['shotfall-camp', 'watching-road', 'mantlet-road', 'windcut-gallery', 'deadeye-court']) {
    assert.match(stage, new RegExp(`'${landmark}'`));
  }
  assert.equal((stage.match(/roomLandmark:1/g) || []).length, 5);
  assert.match(source, /if\(G\.stageIndex>4\)seedVariantEnemies\(\)/);
});

test('Shotfall Camp teaches unsupported crystal-refill traversal before portals', () => {
  assert.match(stage, /Cry\(1040,76\).*marksmanMantletRefill:1,refillFor:'shotfall-west'/s);
  assert.match(stage, /Wl\(1120,150,150,58\).*watchMantlet:1/s);
  assert.match(stage, /Cry\(1625,78\).*marksmanMantletRefill:1,refillFor:'shotfall-east'/s);
  assert.match(stage, /Wl\(1710,155,155,60\).*watchMantlet:1/s);
  assert.doesNotMatch(stage, /Pl\((1040|1625),/);
});

test('first visit owns one mouth and every portal lesson supplies an anchor', () => {
  assert.match(stage, /Slate\(3610,220,0\).*marksmanLinkedSlate:'crossing'/s);
  assert.match(stage, /Anchor\(4370,315,'floor'.*marksmanAnchor:'crossing'/s);
  assert.match(stage, /Slate\(7200,240,0\).*marksmanLinkedSlate:'arrow-intake'/s);
  assert.match(stage, /Anchor\(8010,250,'wallR'.*marksmanAnchor:'arrow-release'/s);
  assert.match(stage, /Anchor\([^\n]*'wallR'.*marksmanAnchor:'gallery'.*galleryLaunch:1/);
  assert.match(source, /placementPlan\(activeCapabilityProgress\(\),/);
  assert.doesNotMatch(stage, /two-mouth-cover-crossing|marksmanGalleryBand/);
});

test('Mantlet Works releases only after a portal-routed local watch arrow', () => {
  assert.match(stage, /MarksmanTarget\(8230,250,'mantlet-release','road-release'/);
  assert.match(stage, /requiresPortalHop:1/);
  assert.match(source, /if\(o\.arrowOnly\)return;/);
  assert.match(stage, /circuit:'mantlet-release'/);
  assert.match(stage, /gateMechanismSniper:1/);
  assert.match(source, /e\.gateMechanismSniper&&!circuitOpen\('mantlet-release'\)/);
  assert.match(source, /o\.rejectFlash=\.34/);
});

test('Marksman Road enemies hold authored sightline roles without floating detection labels', () => {
  for (const role of ['watch-runner', 'mantlet-guard', 'watch-sniper']) assert.match(stage, new RegExp(`marksmanRole:'${role}'`));
  assert.match(source, /function updateMarksmanRoadEnemy\(e,target,dt,eff\)/);
  assert.match(source, /watchMoveT=.*\.62/);
  assert.match(source, /if\(!e\.watchSniper\)addText\(e\.x,GROUND_Y-e\.y-e\.h-8,'LOCK'/);
  assert.match(source, /e\.elite&&!\(G\.stageIndex===4&&e\.marksmanRole\)/);
  assert.match(source, /e\.turnDelay=\.85;e\.watchTurnT=e\.turnDelay/);
  assert.match(source, /if\(e\.watchTurnT<=0\)\{e\.shieldFace=dir/);
  assert.doesNotMatch(source, /if\(e\.marksmanRole==='mantlet-guard'\)e\.shieldFace=dir/);
  assert.doesNotMatch(stage, /GLINT · DRAW · RELEASE/);
});

test('the road and duel own distinct supplied music without checkpoint swaps', async () => {
  assert.match(source, /4:Object\.freeze\(\{id:'marksman-crosshairs-open-ground',src:'\.\/audio\/music\/crosshairs-over-open-ground\.mp3'/);
  assert.match(source, /boss:Object\.freeze\(\{id:'marksman-crosshairs-dark',src:'\.\/audio\/music\/crosshairs-in-the-dark\.mp3'/);
  assert.ok((await stat(new URL('../public/audio/music/crosshairs-over-open-ground.mp3', import.meta.url))).size > 1000);
  assert.ok((await stat(new URL('../public/audio/music/crosshairs-in-the-dark.mp3', import.meta.url))).size > 1000);
});

test('one linked marked bank atomically transforms the boss into a three-phase duel', () => {
  assert.match(source, /Anchor\(bx-390,430,'wallR'.*marksmanAnchor:'rangefinder'/s);
  assert.match(source, /Slate\(bx-1110,230,0\).*marksmanIntake:1/s);
  assert.match(source, /e\.rangefinderBroken=true;e\.marksmanState='transform'/);
  assert.match(source, /e\.ignoreRaisedPlatforms=true/);
  assert.match(source, /function getEnemyFloor\(e,oldY\)/);
  assert.match(source, /if\(top===null\|\|top>0\|\|Math\.abs\(e\.x-o\.x\)>=o\.w\/2\)continue/);
  assert.match(source, /const floor = getEnemyFloor\(e,oldY\),eFloor=floor\.y/);
  assert.match(source, /clearPlacedPortals\(false,'rangefinder-break'\)/);
  assert.match(source, /perch\.gone=true/);
  assert.match(source, /e\.marksmanState='hunt';e\.portalGate=null/);
  assert.match(source, /marksmanCoverTier===1/);
  assert.match(source, /marksmanCoverTier:2/);
  assert.doesNotMatch(source.slice(source.indexOf('function updateMarksmanPortalFight'), source.indexOf('function beginBruteTransformation')), /MARKED SHOT|SHIFT|WARD BROKEN|NO COVER/);
});

test('enraged Marksman retains half-frequency ground attacks and increased vulnerability', () => {
  assert.match(source, /e\.rainT=e\.marksmanPortalFight&&e\.phase>=2\?9\.8:e\.phase>=2\?2\.45:3\.15/);
  assert.match(source, /if\(e\.marksmanPortalFight\)e\.rainT=9\.8/);
  assert.match(source, /if\(e\.marksmanPortalFight&&e\.rangefinderBroken&&e\.phase>=2\)mod\*=1\.5/);
});

test('victory grants the independent pair and immediately opens the east gate', () => {
  assert.match(source, /grantPermanentCapability\('portal-pair','deadeye-rangefinder',\{quiet:true\}\)/);
  assert.match(source, /function showMarksmanDefeatBriefing\(\)/);
  assert.match(stage, /secondMouthSlate:'lower'/);
  assert.match(stage, /secondMouthSlate:'upper'/);
  assert.match(source, /function markSecondMouthProof\(\)/);
  assert.match(source, /pair\.kind==='personal'.*markSecondMouthProof\(\)/s);
  assert.match(source, /G\.secondMouthProved=true;if\(!G\.levelSelectMode\)meta\.portalPairProved=true/);
  assert.match(source, /circuit:'marksman-clearance'/);
  assert.match(source, /id==='marksman-clearance'.*hasCapability\('portal-pair'\).*G\.boss\.dead.*secondMouthProved.*portalPairProved/);
  assert.match(source, /connector:'marksman-keep'.*targetStage:5.*requires:'portal-pair'/s);
  assert.match(source, /e\.type==='archer'&&G\.stageIndex===4\)\|\|\(e\.type==='warden'&&G\.stageIndex===6\)/);
});

test('conventional enemy and boss health bars are hidden', () => {
  assert.match(source, /#bosshpwrap,#bosshpwrap\.on\{display:none!important;\}/);
  assert.doesNotMatch(source, /getElementById\('bosshpwrap'\)\.classList\.add\('on'\)/);
  assert.doesNotMatch(source, /32\*\(e\.hp\/e\.maxHp\)/);
});

test('death at Deadeye Court retries from its threshold with a fresh mechanism', () => {
  assert.match(stage, /Check\(12100,0\)/);
  assert.match(source, /BFRecoveryModule\.recordDeath\(meta\.recovery,zoneId,fallback\)/);
  assert.match(source, /G\.zonePersistenceManifest=null;G\._suppressEntranceCheckpoint=true/);
});

test('the road has the recurring surveyor, quiet Senn, authored memories, and no random loot carpet', () => {
  assert.match(stage, /residentId:'marksman-fletcher',questActor:'daro',name:'Mara'/);
  assert.match(stage, /residentId:'marksman-veilmender',name:'Senn'.*quietV4:true/);
  assert.equal((stage.match(/AmbientFigure\(/g) || []).length, 2);
  assert.match(stage, /StoryRelic\(11310,610,'watch-command-token'/);
  assert.match(stage, /loot:\[\]/);
  assert.doesNotMatch(stage, /kind:'weapon'|kind:'armor'/);
  assert.match(source, /if\(G\.stageIndex>V4_LAST_STAGE\)rollDrop\(e,!!e\.elite\)/);
});

test('checkpoint economy keeps one earned retry on either side of Mantlet Works', () => {
  assert.match(stage, /Check\(5430,0\)/);
  assert.doesNotMatch(stage, /Check\(5700,0\)/);
  assert.match(stage, /Check\(8780,0\)/);
});
