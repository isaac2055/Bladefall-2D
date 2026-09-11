import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const source = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const start = source.indexOf('const RUINED_KEEP_LEVEL=');
const end = source.indexOf('/* ================================================================\n   THE WARDEN (stage 7)', start);
const stage = source.slice(start, end);

test('Ruined Keep is an 18k six-room authored settlement with no completion portal', () => {
  assert.match(stage, /\{len:18000,portal:null,authoredEcology:true/);
  for (const landmark of ['keep-gatehouse', 'fallen-refectory', 'weight-hall', 'masons-quarter', 'split-belfry', 'clinging-archive']) {
    assert.match(stage, new RegExp(`'${landmark}'`));
  }
  assert.equal((stage.match(/roomLandmark:1/g) || []).length, 6);
  assert.match(source, /5:RUINED_KEEP_LEVEL/);
  assert.match(source, /G\.suppressVariantEnemies=!!L\.authoredEcology/);
  assert.match(source, /if\(!G\|\|G\.suppressVariantEnemies\|\|G\.cartMode/);
});

test('the first full pair level owns only player-chosen slate mouths', () => {
  assert.match(stage, /Slate\(4060,260,240\)/);
  assert.match(stage, /Slate\(3150,200,0\)/);
  assert.match(stage, /Slate\(11580,260,0\)/);
  assert.match(stage, /SlateWall\(12720,520,340\)/);
  assert.match(stage, /Slate\(13540,250,0\)/);
  assert.match(stage, /SlateWall\(14160,1120,420\)/);
  assert.doesNotMatch(stage, /Anchor\(|FixedPortal\(|FollowerPlate\(/);
  assert.match(source, /levelSelectCapabilitiesForStage/);
});

test('the first screen has a continuous climb to a naturally powered drop perch', () => {
  assert.match(stage, /Pl\(3370,220,60,\{supportedBy:'refectory-stair',refectoryApproach:1\}\)/);
  assert.match(stage, /Pl\(3590,220,120,\{supportedBy:'refectory-stair',refectoryApproach:1\}\)/);
  assert.match(stage, /Pl\(3810,220,180,\{supportedBy:'refectory-stair',refectoryApproach:1\}\)/);
  assert.match(stage, /Slate\(4060,260,240\)/);
  assert.match(stage, /Pl\(3750,340,300,\{supportedBy:'refectory-drop-frame',refectoryDropStep:1\}\)/);
  assert.match(stage, /Pl\(3370,360,360,\{supportedBy:'refectory-drop-frame',refectoryDropPerch:1\}\)/);
  assert.match(stage, /Slate\(3150,200,0\)/);
  assert.match(stage, /Wl\(4270,520,520,72\).*refectoryScreen:1/s);
  assert.match(source, /if\(exit\)\{[^}]*p\.jumpCutOk=false/);
});

test('the portal-routed keystone is broad, latched, and retryable', () => {
  assert.match(stage, /Crate\(5400,726\).*keepMasonry:1.*targetPlate:'keep-weight'/s);
  for (const [x,y] of [[5800,60],[6020,120],[6240,180],[6480,240]])
    assert.match(stage,new RegExp(`Pl\\(${x},(?:220|260),${y},\\{supportedBy:'weight-stair',weightApproach:1\\}\\)`));
  assert.match(stage, /Slate\(6800,360,300\)/);
  assert.match(stage, /Plate\(6800,300,'keep-weight',true,true\).*keepMasonryPlate:1/s);
  assert.match(stage, /Lever\(7160,300,'keep-drop',1\.5\).*keepDropRelease:1/s);
  assert.match(stage, /Pl\(7160,320,300,\{supportedBy:'weight-control',weightControl:1\}\)/);
  assert.match(stage, /circuit:'keep-weight'.*keepReconstructionGate:1/s);
  assert.match(source, /if\(ent\.keepMasonry\)\{clearPlacedPortals\(false,'keystone-transit'\)/);
  assert.match(source, /!onTarget&&o\.y0>60/);
  assert.match(source, /o\.resetLabel\|\|'CUBE RECALLED'/);
  assert.match(source, /o\.repairCatch\|\|o\.keepDropRelease/);
  assert.match(source, /if\(o\.keepDropRelease\)\{pullLever\(o\);return true;\}/);
  assert.match(source, /target\.repairCatch\|\|target\.keepDropRelease\?'↑  RELEASE'/);
});

test('the Folded Belfry composes two payload routes around Mason’s Grip', () => {
  assert.equal((stage.match(/belfryWeight:1/g)||[]).length,2);
  assert.match(stage, /targetPlate:'belfry-fold'/);
  assert.match(stage, /targetPlate:'belfry-bell'/);
  assert.match(stage, /belfryFoldGate:1/);
  assert.match(stage, /belfryArchiveGate:1/);
  assert.match(stage, /keepWallJump:1.*title:'MASON’S GRIP'/s);
  assert.match(stage, /keepVaultKey:1,vaultKeyId:'keep-key'.*landmarkId:'masked-belfry'/s);
  assert.match(source, /grantMasonsGrip\(\)/);
  assert.match(source, /grantPermanentCapability\('wall-jump','masons-grip'\)/);
  assert.match(source, /if\(!hasCapability\('wall-jump'\)\|\|!circuitOpen\('belfry-bell'\)\)return false/);
  assert.match(source, /activateVaultSecretObject\(o,'wall-ascent'\)/);
  assert.match(source, /connector:'marksman-keep'.*targetStage:4.*forward:false/s);
});

test('Keep Hearth and continuous supplied music are authored in place', async () => {
  assert.match(stage, /restSiteAnchor:'keep-hearth'/);
  assert.match(source, /5:Object\.freeze\(\{id:'ruined-keep-floating-dream',src:'\.\/audio\/music\/floating-dream\.ogg'/);
  assert.ok((await stat(new URL('../public/audio/music/floating-dream.ogg', import.meta.url))).size > 1000);
});

test('the Keep carries concrete narrative evidence rather than instruction spam', () => {
  assert.match(stage, /clockId:'pulse-two'.*keepClock:1/s);
  assert.match(stage, /'empty-scabbard'.*SHEATH OF THE LAST WARDEN/s);
  assert.match(stage, /id:'cut-bars'.*Every bar was cut from the corridor side/s);
  assert.match(stage, /SealedRecollection\(2680,120,'ruined-keep'/);
  assert.doesNotMatch(stage, /PRESS E|COMMAND|FOLLOWER|0\/3|PORTAL HERE/);
});

test('the dedicated westward return converts old slick barriers into Grip surfaces', () => {
  assert.equal((source.match(/returnClingAfterGrip:1/g)||[]).length,4);
  assert.match(stage,/Wl\(4270,520,520,72\).*refectoryScreen:1.*returnClingAfterGrip:1/s);
  assert.match(source,/function wallFaceSlick\(o,dir\)[\s\S]*o&&o\.returnClingAfterGrip&&hasCapability\('wall-jump'\)/);
  assert.doesNotMatch(source,/function wallFaceSlick\(o,dir\)[\s\S]{0,300}keepWestSealOpen/);
  assert.match(source,/Marksman Road → Rain-Catcher Service Lift → Black Woods → Outskirts breach/);
});

test('the first backtrack obstacles are solved doors, never substitute cling walls',()=>{
  assert.match(stage,/circuit:'keep-weight',keepReconstructionGate:1/);
  assert.match(stage,/circuit:'belfry-fold',belfryFoldGate:1/);
  assert.match(stage,/circuit:'belfry-bell',belfryArchiveGate:1/);
  assert.match(source,/if\(G\.stageIndex===5&&hasCapability\('wall-jump'\)\)ids\.push\('keep-weight','belfry-fold'\)/);
  assert.match(source,/keepWestSealOpen[\s\S]*ids\.push\('belfry-bell'\)/);
  assert.match(source,/if\(persistentCircuitOpen\(String\(id\)\)\)return true/);
});
