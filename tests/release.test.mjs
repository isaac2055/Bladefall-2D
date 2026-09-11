import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-release.js');
const Release = globalThis.BladefallRelease;

const defaults = {
  ngPlus: 0, bestStage: 0, followerTier: 0, linewalkerUnlocked: false, gold: 0, run: null, world: null, capabilities: null, weaponTechniques: null, legacyTrainingCredit: null, equipment: null, echoes: null, secrets: null, story: null, shops: null, quests: null,
  musicVolume: 0.4, sfxVolume: 0.8, screenShake: 1, graphicsQuality: 'auto',
  soundOn: true, dynamicAudio: true, nightMode: false, soundCaptions: false,
  cameraAssist: true, reducedMotion: false, flashReduction: false,
  highContrast: false, largeText: false, colorAssist: false, haptics: true,
  combatCues: true, autoAttack: false,
};

test('legacy saves migrate without dropping unknown progress or unlocks', () => {
  const result = Release.migrateSave({
    bestStage: 8,
    ngPlus: 1,
    skinsOwned: { warden: true, voidshade: true },
    secretCleared: true,
    customFutureField: 42,
  }, defaults);
  assert.equal(result.save.saveSchemaVersion, Release.SAVE_SCHEMA_VERSION);
  assert.equal(result.save.reach[0], 8);
  assert.equal(result.save.secretCleared, true);
  assert.equal(result.save.customFutureField, 42);
  assert.equal(result.save.skinsOwned.voidshade, true);
  assert.equal(result.receipt.from, 0);
  assert.equal(result.receipt.changed, true);
});

test('migration repairs corrupt scalar values and safely normalizes a valid legacy run', () => {
  const run = { stageIndex: 5, p: { hp: 80 } };
  const result = Release.migrateSave({
    ngPlus: 99,
    bestStage: -4,
    gold: -300,
    musicVolume: 7,
    sfxVolume: -2,
    screenShake: Number.NaN,
    graphicsQuality: 'cinematic',
    linewalkerUnlocked: 'yes',
    run,
  }, defaults);
  assert.equal(result.save.ngPlus, 2);
  assert.equal(result.save.bestStage, 0);
  assert.equal(result.save.gold, 0);
  assert.equal(result.save.musicVolume, 1);
  assert.equal(result.save.sfxVolume, 0);
  assert.equal(result.save.graphicsQuality, 'auto');
  assert.equal(result.save.linewalkerUnlocked, false);
  assert.equal(result.save.run.stageIndex, 5);
  assert.equal(result.save.run.p.hp, 80);
  assert.equal(result.save.run.p.maxHp, 100);
  assert.deepEqual(result.save.run.p.stats, { power: 1, speed: 1, atkSpeed: 1, lifesteal: 0, dodgeCd: 0.75 });
});

test('current saves remain stable and do not repeat migration steps', () => {
  const source = { ...defaults, saveSchemaVersion: Release.SAVE_SCHEMA_VERSION, reach: { 0: 4 } };
  const result = Release.migrateSave(source, defaults);
  assert.deepEqual(result.receipt.steps, []);
  assert.equal(result.receipt.changed, false);
});

test('schema six preserves valid world progress and repairs malformed world state', () => {
  const validWorld = { schema: 'bladefall.world-progress', version: 1, current: 'ruined-keep' };
  const kept = Release.migrateSave({ saveSchemaVersion: 5, world: validWorld }, defaults);
  assert.equal(kept.save.world, validWorld);
  assert.ok(kept.receipt.steps.includes('world-progress'));

  const repaired = Release.migrateSave({ saveSchemaVersion: 5, world: ['bad'] }, defaults);
  assert.equal(repaired.save.world, null);
});

test('schema seven preserves valid story progress and repairs malformed narrative state', () => {
  const validStory = { schema: 'bladefall.story-progress', version: 1, memoriesFound: ['first-draught'] };
  const kept = Release.migrateSave({ saveSchemaVersion: 6, story: validStory }, defaults);
  assert.equal(kept.save.story, validStory);
  assert.ok(kept.receipt.steps.includes('story-progress'));

  const repaired = Release.migrateSave({ saveSchemaVersion: 6, story: ['bad'] }, defaults);
  assert.equal(repaired.save.story, null);
});

test('schema eight preserves valid shop progress and repairs malformed shop state', () => {
  const validShops = { schema: 'bladefall.shop-progress', version: 1, purchased: {}, visits: {} };
  const kept = Release.migrateSave({ saveSchemaVersion: 7, shops: validShops }, defaults);
  assert.equal(kept.save.shops, validShops);
  assert.ok(kept.receipt.steps.includes('shop-progress'));

  const repaired = Release.migrateSave({ saveSchemaVersion: 7, shops: ['bad'] }, defaults);
  assert.equal(repaired.save.shops, null);
});

test('schema nine preserves valid quest progress and repairs malformed quest state', () => {
  const validQuests = { schema: 'bladefall.quest-progress', version: 1, quests: {} };
  const kept = Release.migrateSave({ saveSchemaVersion: 8, quests: validQuests }, defaults);
  assert.equal(kept.save.quests, validQuests);
  assert.ok(kept.receipt.steps.includes('quest-progress'));

  const repaired = Release.migrateSave({ saveSchemaVersion: 8, quests: ['bad'] }, defaults);
  assert.equal(repaired.save.quests, null);
});

test('schema ten preserves valid capability progress and repairs malformed state', () => {
  const valid = { schema: 'bladefall.capability-progress', version: 1, acquired: ['jump'] };
  const kept = Release.migrateSave({ saveSchemaVersion: 9, capabilities: valid }, defaults);
  assert.equal(kept.save.capabilities, valid);
  assert.ok(kept.receipt.steps.includes('capability-progress'));

  const repaired = Release.migrateSave({ saveSchemaVersion: 9, capabilities: ['all-at-spawn'] }, defaults);
  assert.equal(repaired.save.capabilities, null);
});

test('schema eleven preserves valid equipment economy and repairs malformed state', () => {
  const valid = { schema: 'bladefall.equipment-economy', version: 1, materials: {}, ownedTools: [] };
  const kept = Release.migrateSave({ saveSchemaVersion: 10, equipment: valid }, defaults);
  assert.equal(kept.save.equipment, valid);
  assert.ok(kept.receipt.steps.includes('equipment-economy'));

  const repaired = Release.migrateSave({ saveSchemaVersion: 10, equipment: ['free-everything'] }, defaults);
  assert.equal(repaired.save.equipment, null);
});

test('schema twelve preserves a valid Echo loadout and repairs malformed state', () => {
  const valid = { schema: 'bladefall.echo-loadout', version: 1, owned: [], equipped: [] };
  const kept = Release.migrateSave({ saveSchemaVersion: 11, echoes: valid }, defaults);
  assert.equal(kept.save.echoes, valid);
  assert.ok(kept.receipt.steps.includes('echo-loadout'));

  const repaired = Release.migrateSave({ saveSchemaVersion: 11, echoes: ['every-echo'] }, defaults);
  assert.equal(repaired.save.echoes, null);
});

test('schema thirteen preserves valid secret progress and repairs malformed state', () => {
  const valid = { schema: 'bladefall.secret-progress', version: 1, recovered: ['root-key'], secrets: {} };
  const kept = Release.migrateSave({ saveSchemaVersion: 12, secrets: valid }, defaults);
  assert.equal(kept.save.secrets, valid);
  assert.ok(kept.receipt.steps.includes('secret-progress'));

  const repaired = Release.migrateSave({ saveSchemaVersion: 12, secrets: ['all-keys'] }, defaults);
  assert.equal(repaired.save.secrets, null);
});

test('schema fourteen retires random stats while preserving bounded upgrade value', () => {
  const run = { stageIndex: 2, p: {
    hp: 75, maxHp: 150, level: 7, xp: 40, xpNext: 200,
    stats: { power: 1.18 ** 2, speed: 1.12, atkSpeed: 1.15, lifesteal: 0.08, dodgeCd: 0.75 * 0.85 },
  } };
  const migrated = Release.migrateSave({ saveSchemaVersion: 13, run }, defaults);
  assert.ok(migrated.receipt.steps.includes('authored-advancement'));
  assert.equal(migrated.save.run.p.maxHp, 100);
  assert.equal(migrated.save.run.p.hp, 50);
  assert.equal(migrated.save.run.p.level, 1);
  assert.equal(migrated.save.run.p.xp, 0);
  assert.deepEqual(migrated.save.run.p.stats, { power: 1, speed: 1, atkSpeed: 1, lifesteal: 0, dodgeCd: 0.75 });
  assert.deepEqual(migrated.save.legacyTrainingCredit, {
    schema: 'bladefall.legacy-training-credit', version: 1,
    healthShards: 8, forgeMarks: 3, echoDust: 4, claimed: false,
  });
});

test('device selection differentiates desktop, mobile, and constrained hardware', () => {
  assert.equal(Release.selectDeviceProfile({
    width: 1440, height: 900, devicePixelRatio: 1, hardwareConcurrency: 10, deviceMemory: 8,
  }).quality, 'high');
  assert.equal(Release.selectDeviceProfile({
    width: 844, height: 390, devicePixelRatio: 3, hardwareConcurrency: 6, deviceMemory: 4, coarsePointer: true,
  }).quality, 'balanced');
  assert.equal(Release.selectDeviceProfile({
    width: 1280, height: 720, devicePixelRatio: 2, hardwareConcurrency: 2, deviceMemory: 2,
  }).quality, 'low');
});

test('release monitor reports healthy and over-budget samples', () => {
  const monitor = Release.createReleaseMonitor({ targetFrameMs: 16.667 });
  assert.equal(monitor.observe({
    metrics: { update: { avg: 2, p95: 3 }, render: { avg: 5, p95: 8 } },
    quality: 'high',
  }).healthy, true);
  const slow = monitor.observe({
    metrics: { update: { avg: 8, p95: 12 }, render: { avg: 12, p95: 18 } },
    quality: 'balanced',
  });
  assert.equal(slow.healthy, false);
  assert.ok(slow.warnings.includes('frame-p95'));
  assert.equal(monitor.diagnostics().samples, 2);
});

test('balance validation catches invalid content and accepts a release-shaped catalog', () => {
  const stages = Array.from({ length: 16 }, (_, i) => ({
    name: `Stage ${i}`,
    len: 4000 + i * 100,
    boss: i % 2 ? null : `boss${i}`,
  }));
  const rarities = {
    common: { mul: 1 }, uncommon: { mul: 1.3 }, rare: { mul: 1.7 },
    epic: { mul: 2.25 }, legendary: { mul: 3 },
  };
  assert.equal(Release.validateBalance({
    stages, enemies: { grunt: { hp: 40, dmg: 8 } }, rarities,
  }).ok, true);
  const broken = Release.validateBalance({
    stages: [{ name: 'Broken', len: 10 }],
    enemies: { ghost: { hp: 0, dmg: -1 } },
    rarities: {},
  });
  assert.equal(broken.ok, false);
  assert.ok(broken.issues.length >= 3);
});

test('release report blocks runtime, storage, and balance failures', () => {
  const ready = Release.buildReleaseReport({
    version: '7.0.0',
    balance: { ok: true, issues: [] },
    storage: { failures: [] },
    errors: [],
  });
  assert.equal(ready.ready, true);
  const blocked = Release.buildReleaseReport({
    version: '7.0.0',
    balance: { ok: false, issues: ['bad stage'] },
    storage: { failures: [{ operation: 'write' }] },
    performance: { samples: 3, healthy: false },
    errors: ['boom'],
  });
  assert.deepEqual(blocked.blockers, ['balance-validation', 'runtime-errors', 'storage-errors', 'performance-budget']);
});
