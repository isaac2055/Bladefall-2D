(function installBladefallRelease(root) {
  'use strict';

  const SAVE_SCHEMA_VERSION = 14;
  const GRAPHICS_MODES = Object.freeze(['auto', 'low', 'balanced', 'high']);

  function finite(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function cloneRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {};
  }

  const AUTHORED_BASE_STATS = Object.freeze({ power: 1, speed: 1, atkSpeed: 1, lifesteal: 0, dodgeCd: 0.75 });

  function legacyRank(value, base, multiplier, inverse) {
    const n = finite(value, base);
    if (n <= 0 || base <= 0 || multiplier <= 0 || multiplier === 1) return 0;
    const ratio = inverse ? base / n : n / base;
    return clamp(Math.round(Math.log(Math.max(1, ratio)) / Math.log(multiplier)), 0, 12);
  }

  function advancementRanks(snapshot) {
    const player = snapshot && typeof snapshot === 'object' ? snapshot : {};
    const stats = cloneRecord(player.stats);
    return Object.freeze({
      vitality: clamp(Math.round((finite(player.maxHp, 100) - 100) / 25), 0, 12),
      power: legacyRank(stats.power, 1, 1.18, false),
      swiftness: legacyRank(stats.speed, 1, 1.12, false),
      frenzy: legacyRank(stats.atkSpeed, 1, 1.15, false),
      lifedrain: clamp(Math.round(finite(stats.lifesteal, 0) / 0.04), 0, 12),
      evasion: legacyRank(stats.dodgeCd, 0.75, 1 / 0.85, true),
    });
  }

  function normalizePlayerAdvancement(snapshot) {
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) return snapshot;
    const player = { ...snapshot };
    const oldMax = Math.max(1, finite(player.maxHp, 100));
    const healthRatio = clamp(finite(player.hp, oldMax) / oldMax, 0, 1);
    player.maxHp = 100;
    player.hp = Math.max(1, Math.round(healthRatio * player.maxHp));
    player.level = 1;
    player.xp = 0;
    player.xpNext = 46;
    player.stats = { ...AUTHORED_BASE_STATS };
    return player;
  }

  function migrateAuthoredAdvancement(run) {
    if (!run || typeof run !== 'object' || Array.isArray(run))
      return Object.freeze({ run, credit: null, changed: false });
    const candidates = [run.p, run.baseLoadout, run.base].filter((value) => value && typeof value === 'object');
    const ranks = { vitality: 0, power: 0, swiftness: 0, frenzy: 0, lifedrain: 0, evasion: 0 };
    for (const candidate of candidates) {
      const found = advancementRanks(candidate);
      for (const key of Object.keys(ranks)) ranks[key] = Math.max(ranks[key], found[key]);
    }
    const output = { ...run };
    for (const key of ['p', 'baseLoadout', 'base'])
      if (output[key] && typeof output[key] === 'object') output[key] = normalizePlayerAdvancement(output[key]);
    const credit = Object.freeze({
      schema: 'bladefall.legacy-training-credit',
      version: 1,
      healthShards: clamp(ranks.vitality * 4, 0, 24),
      forgeMarks: clamp(ranks.power + ranks.frenzy, 0, 16),
      echoDust: clamp(ranks.swiftness + ranks.lifedrain + ranks.evasion, 0, 20),
      claimed: false,
    });
    return Object.freeze({ run: output, credit, changed: candidates.length > 0 });
  }

  function migrateSave(raw, defaults) {
    const source = cloneRecord(raw);
    const fallback = cloneRecord(defaults);
    const save = { ...fallback, ...source };
    const from = Math.max(0, Math.floor(finite(source.saveSchemaVersion, 0)));
    const repairs = [];
    const steps = [];

    function repair(key, value, reason) {
      if (save[key] === value) return;
      save[key] = value;
      repairs.push(Object.freeze({ key, reason }));
    }

    if (from < 1) {
      steps.push('collections');
      for (const key of ['achievements', 'coins', 'skinsOwned', 'bossTypeKills', 'reach']) {
        if (!save[key] || typeof save[key] !== 'object' || Array.isArray(save[key])) repair(key, {}, 'invalid collection');
      }
    }
    if (from < 2) {
      steps.push('progress');
      repair('ngPlus', clamp(Math.floor(finite(save.ngPlus, 0)), 0, 2), 'bounded progression tier');
      repair('bestStage', clamp(Math.floor(finite(save.bestStage, 0)), 0, 15), 'bounded stage progress');
      repair('followerTier', clamp(Math.floor(finite(save.followerTier, 0)), 0, 2), 'bounded follower tier');
      repair('gold', Math.max(0, Math.floor(finite(save.gold, 0))), 'non-negative currency');
      if (save.run !== null && (!save.run || typeof save.run !== 'object' || Array.isArray(save.run))) repair('run', null, 'invalid run snapshot');
    }
    if (from < 3) {
      steps.push('presentation');
      for (const key of ['musicVolume', 'sfxVolume', 'screenShake']) {
        repair(key, clamp(finite(save[key], finite(fallback[key], key === 'screenShake' ? 1 : 0.5)), 0, 1), 'bounded presentation value');
      }
      const bools = ['soundOn', 'dynamicAudio', 'nightMode', 'soundCaptions', 'cameraAssist',
        'reducedMotion', 'flashReduction', 'highContrast', 'largeText', 'colorAssist',
        'haptics', 'combatCues', 'autoAttack'];
      for (const key of bools) if (typeof save[key] !== 'boolean') repair(key, !!fallback[key], 'invalid preference type');
    }
    if (from < 4) {
      steps.push('release');
      const graphics = GRAPHICS_MODES.includes(save.graphicsQuality) ? save.graphicsQuality : 'auto';
      repair('graphicsQuality', graphics, 'unknown graphics mode');
      const reach = cloneRecord(save.reach);
      const baseReach = Math.max(0, Math.floor(finite(reach[0], finite(save.bestStage, 0))));
      if (reach[0] !== baseReach) {
        reach[0] = baseReach;
        repair('reach', reach, 'folded legacy stage progress into base tier');
      }
    }
    if (from < 5) {
      steps.push('remix-rewards');
      if (typeof source.linewalkerUnlocked !== 'boolean')
        repair('linewalkerUnlocked', false, 'invalid secret reward flag');
    }
    if (from < 6) {
      steps.push('world-progress');
      if (source.world !== null && (!source.world || typeof source.world !== 'object' || Array.isArray(source.world)))
        repair('world', null, 'invalid interconnected world progress');
    }
    if (from < 7) {
      steps.push('story-progress');
      if (source.story !== null && (!source.story || typeof source.story !== 'object' || Array.isArray(source.story)))
        repair('story', null, 'invalid narrative progress');
    }
    if (from < 8) {
      steps.push('shop-progress');
      if (source.shops !== null && (!source.shops || typeof source.shops !== 'object' || Array.isArray(source.shops)))
        repair('shops', null, 'invalid regional shop progress');
    }
    if (from < 9) {
      steps.push('quest-progress');
      if (source.quests !== null && (!source.quests || typeof source.quests !== 'object' || Array.isArray(source.quests)))
        repair('quests', null, 'invalid multi-stage quest progress');
    }
    if (from < 10) {
      steps.push('capability-progress');
      if (source.capabilities !== null && (!source.capabilities || typeof source.capabilities !== 'object' || Array.isArray(source.capabilities)))
        repair('capabilities', null, 'invalid permanent capability progress');
    }
    if (from < 11) {
      steps.push('equipment-economy');
      if (source.equipment !== null && (!source.equipment || typeof source.equipment !== 'object' || Array.isArray(source.equipment)))
        repair('equipment', null, 'invalid equipment economy progress');
    }
    if (from < 12) {
      steps.push('echo-loadout');
      if (source.echoes !== null && (!source.echoes || typeof source.echoes !== 'object' || Array.isArray(source.echoes)))
        repair('echoes', null, 'invalid echo loadout progress');
    }
    if (from < 13) {
      steps.push('secret-progress');
      if (source.secrets !== null && (!source.secrets || typeof source.secrets !== 'object' || Array.isArray(source.secrets)))
        repair('secrets', null, 'invalid secret progress');
    }
    if (from < 14) {
      steps.push('authored-advancement');
      if (source.weaponTechniques !== null && (!source.weaponTechniques || typeof source.weaponTechniques !== 'object' || Array.isArray(source.weaponTechniques)))
        repair('weaponTechniques', null, 'invalid weapon technique progress');
      const migrated = migrateAuthoredAdvancement(save.run);
      if (migrated.changed) repair('run', migrated.run, 'retired random stat progression');
      if (migrated.credit && !save.legacyTrainingCredit)
        repair('legacyTrainingCredit', migrated.credit, 'preserved bounded value from retired upgrades');
    }
    repair('saveSchemaVersion', SAVE_SCHEMA_VERSION, 'current save schema');

    return Object.freeze({
      save,
      receipt: Object.freeze({
        from,
        to: SAVE_SCHEMA_VERSION,
        changed: repairs.length > 0,
        steps: Object.freeze(steps),
        repairs: Object.freeze(repairs),
      }),
    });
  }

  function selectDeviceProfile(environment, preferences) {
    const env = environment || {};
    const prefs = preferences || {};
    const width = Math.max(1, finite(env.width, 1280));
    const height = Math.max(1, finite(env.height, 720));
    const dpr = clamp(finite(env.devicePixelRatio, 1), 1, 4);
    const cores = Math.max(1, Math.floor(finite(env.hardwareConcurrency, 4)));
    const memory = Math.max(0, finite(env.deviceMemory, 0));
    const pixelLoad = width * height * dpr * dpr;
    const coarsePointer = !!env.coarsePointer;

    let quality = 'high';
    const constrained = cores <= 2 || (memory > 0 && memory <= 2) || pixelLoad > 7_000_000;
    const moderate = coarsePointer || cores <= 4 || (memory > 0 && memory <= 4) || pixelLoad > 3_200_000;
    if (constrained) quality = 'low';
    else if (moderate || prefs.reducedMotion) quality = 'balanced';

    return Object.freeze({
      quality,
      targetFrameMs: quality === 'low' ? 20 : 16.667,
      maxDevicePixelRatio: quality === 'low' ? 1.5 : quality === 'balanced' ? 2 : 3,
      coarsePointer,
      width,
      height,
      devicePixelRatio: dpr,
      hardwareConcurrency: cores,
      deviceMemory: memory || null,
      pixelLoad: Math.round(pixelLoad),
      reason: constrained ? 'constrained' : moderate ? 'mobile-or-midrange' : prefs.reducedMotion ? 'reduced-motion' : 'desktop',
    });
  }

  function createReleaseMonitor(options) {
    const settings = options || {};
    const targetFrameMs = Math.max(8, finite(settings.targetFrameMs, 16.667));
    const historyLimit = Math.max(10, Math.floor(finite(settings.historyLimit, 120)));
    const history = [];
    let samples = 0;
    let longSamples = 0;
    let last = null;

    function observe(frame) {
      const value = frame || {};
      const metrics = value.metrics || {};
      const update = metrics.update || {};
      const render = metrics.render || {};
      const p95 = Math.max(0, finite(update.p95, 0)) + Math.max(0, finite(render.p95, 0));
      const average = Math.max(0, finite(update.avg, 0)) + Math.max(0, finite(render.avg, 0));
      const memoryMb = Math.max(0, finite(value.memoryBytes, 0)) / (1024 * 1024);
      const warnings = [];
      if (p95 > targetFrameMs * 1.35) warnings.push('frame-p95');
      if (average > targetFrameMs) warnings.push('frame-average');
      if (memoryMb > 450) warnings.push('memory');
      if (Array.isArray(value.errors) && value.errors.length) warnings.push('runtime-errors');
      if (value.storageFailures > 0) warnings.push('storage');
      samples++;
      if (warnings.includes('frame-p95')) longSamples++;
      last = Object.freeze({
        averageFrameMs: +average.toFixed(3),
        p95FrameMs: +p95.toFixed(3),
        targetFrameMs,
        memoryMb: +memoryMb.toFixed(1),
        quality: value.quality || null,
        warnings: Object.freeze(warnings),
        healthy: warnings.length === 0,
      });
      history.push(last);
      if (history.length > historyLimit) history.shift();
      return last;
    }

    function diagnostics() {
      const recent = history.slice(-30);
      const warningCounts = {};
      for (const row of recent) for (const warning of row.warnings) warningCounts[warning] = (warningCounts[warning] || 0) + 1;
      return Object.freeze({
        samples,
        longSamples,
        targetFrameMs,
        healthy: !last || last.healthy,
        last,
        recentWarningCounts: Object.freeze(warningCounts),
      });
    }

    return Object.freeze({ observe, diagnostics });
  }

  function validateBalance(input) {
    const value = input || {};
    const stages = Array.isArray(value.stages) ? value.stages : [];
    const enemies = cloneRecord(value.enemies);
    const rarities = cloneRecord(value.rarities);
    const issues = [];
    const warnings = [];
    const names = new Set();
    let bosses = 0;

    if (stages.length < 16) issues.push('campaign requires at least 16 stages');
    stages.forEach((stage, index) => {
      if (!stage || typeof stage !== 'object') {
        issues.push(`stage ${index} is invalid`);
        return;
      }
      if (!stage.name || names.has(stage.name)) issues.push(`stage ${index} has a missing or duplicate name`);
      names.add(stage.name);
      if (!(finite(stage.len, 0) >= 2400)) issues.push(`${stage.name || index} has an invalid length`);
      if (stage.boss) bosses++;
    });
    if (bosses < 6) warnings.push('campaign boss variety is below the release target');

    for (const [id, enemy] of Object.entries(enemies)) {
      if (!enemy || finite(enemy.hp, 0) <= 0) issues.push(`enemy ${id} has invalid health`);
      if (!enemy || finite(enemy.dmg, 0) < 0) issues.push(`enemy ${id} has invalid damage`);
    }
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    let prior = 0;
    for (const id of rarityOrder) {
      const multiplier = rarities[id] && finite(rarities[id].mul, 0);
      if (!(multiplier >= prior)) issues.push(`rarity ${id} does not preserve progression`);
      prior = multiplier;
    }

    return Object.freeze({
      ok: issues.length === 0,
      stageCount: stages.length,
      enemyArchetypes: Object.keys(enemies).length,
      bossStages: bosses,
      issues: Object.freeze(issues),
      warnings: Object.freeze(warnings),
    });
  }

  function buildReleaseReport(input) {
    const value = input || {};
    const errors = Array.isArray(value.errors) ? value.errors : [];
    const balance = value.balance || { ok: false, issues: ['not evaluated'] };
    const performance = value.performance || null;
    const storage = value.storage || { failures: [] };
    const blockers = [];
    if (!balance.ok) blockers.push('balance-validation');
    if (errors.length) blockers.push('runtime-errors');
    if (storage.failures && storage.failures.length) blockers.push('storage-errors');
    if (performance && performance.samples >= 3 && performance.healthy === false) blockers.push('performance-budget');
    return Object.freeze({
      version: String(value.version || 'dev'),
      saveSchemaVersion: SAVE_SCHEMA_VERSION,
      ready: blockers.length === 0,
      blockers: Object.freeze(blockers),
      device: value.device || null,
      saveMigration: value.saveMigration || null,
      balance,
      performance,
    });
  }

  root.BladefallRelease = Object.freeze({
    SAVE_SCHEMA_VERSION,
    GRAPHICS_MODES,
    migrateSave,
    advancementRanks,
    normalizePlayerAdvancement,
    migrateAuthoredAdvancement,
    selectDeviceProfile,
    createReleaseMonitor,
    validateBalance,
    buildReleaseReport,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
