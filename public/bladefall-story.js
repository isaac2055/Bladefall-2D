(function installBladefallStory(root) {
  'use strict';

  const SCHEMA = 'bladefall.story-progress';
  const VERSION = 2;

  const memories = [
    { id: 'first-draught', order: 1, stage: 'outskirts', relic: 'Chalice of the First Draught', reality: 'tin-cup', clarity: 'fragment' },
    { id: 'red-clasp', order: 2, stage: 'black-woods', relic: 'Clasp of the Unbroken Standard', reality: 'cloak-clasp', clarity: 'fragment' },
    { id: 'wristguard-bearer', order: 3, stage: 'brute', relic: 'Wristguard of the Bearer', reality: 'rough-leather-wristguard', clarity: 'fragment' },
    { id: 'watch-command-token', order: 4, stage: 'hollow-marksman', relic: 'Token of the Open Watch', reality: 'night-watch-order', clarity: 'fragment' },
    { id: 'empty-scabbard', order: 5, stage: 'ruined-keep', relic: 'Sheath of the Last Warden', reality: 'missing-sword', clarity: 'suspicion' },
    { id: 'four-bone-dice', order: 6, stage: 'frostfell', relic: 'Lots of the Numberless Host', reality: 'four-gaming-dice', clarity: 'pattern' },
    { id: 'apothecary-spoon', order: 7, stage: 'emberdeep', relic: 'Spoon of the Pale Alchemist', reality: 'mixing-spoon', clarity: 'recognition' },
    { id: 'right-hand-seal', order: 8, stage: 'void-tyrant', relic: 'Seal of the Tyrant', reality: 'enemy-officer-signet', clarity: 'confirmation' },
    { id: 'rusted-edge', order: 9, stage: 'deep-line', relic: 'Flameblade Without Dawn', reality: 'rusty-axe', clarity: 'carry-through' },
  ];

  const clocks = [
    { id: 'pulse-one', stage: 'black-woods', time: '3:40', encounter: 1 },
    { id: 'pulse-two', stage: 'ruined-keep', time: '3:41', encounter: 2 },
    { id: 'pulse-three', stage: 'inversion', time: '3:44', encounter: 3 },
  ];

  const bossEchoes = [
    { boss: 'brute', stage: 'brute', rank: 'hands', reality: 'soldier-who-held-him-down' },
    { boss: 'archer', stage: 'hollow-marksman', rank: 'sentry', reality: 'watchman-who-let-them-in' },
    { boss: 'warden', stage: 'warden', rank: 'gate', reality: 'guard-who-would-not-look' },
    { boss: 'sorcerer', stage: 'frost-sorcerer', rank: 'apothecary', reality: 'soldier-who-mixed-the-draught' },
    { boss: 'colossus', stage: 'ember-colossus', rank: 'artillery', reality: 'fever-peak' },
    { boss: 'tyrant', stage: 'void-tyrant', rank: 'right-hand', reality: 'officer-who-led-the-night-attack' },
    { boss: 'king', stage: 'abyss-king', rank: 'enemy-king', reality: 'unseen-commander-who-gave-the-order' },
  ];

  const stageSymptoms = [
    ['outskirts', 'photophobia', 1],
    ['black-woods', 'time-distortion', 1],
    ['brute', 'compulsive-repetition', 2],
    ['updrafts', 'racing-pulse', 1],
    ['hollow-marksman', 'missing-faces', 2],
    ['ruined-keep', 'amnesia', 2],
    ['warden', 'averted-recognition', 2],
    ['frostfell', 'cold-sweat', 2],
    ['frost-sorcerer', 'numbing', 3],
    ['emberdeep', 'fever-rise', 3],
    ['ember-colossus', 'fever-peak', 4],
    ['inversion', 'seizure-and-time-loss', 4],
    ['void-tyrant', 'lucid-recognition', 4],
    ['abyss-king', 'unconsciousness', 5],
    ['deep-line', 'threshold-of-waking', 5],
  ].map(([stage, symptom, flowerDensity]) => ({ stage, symptom, flowerDensity }));

  const searcherTrail = [
    { id: 'warm-ash', stage: 'outskirts', evidence: 'a fire abandoned moments ago' },
    { id: 'called-name', stage: 'black-woods', evidence: 'the knight hears his name beyond the trees' },
    { id: 'clean-bandage', stage: 'updrafts', evidence: 'a clean field bandage tied above the wind' },
    { id: 'cut-bars', stage: 'ruined-keep', evidence: 'cell bars cut from the outside' },
    { id: 'snow-tracks', stage: 'frostfell', evidence: 'fresh tracks that do not belong to an enemy' },
    { id: 'water-spoon', stage: 'emberdeep', evidence: 'a spoonful of water beside a dry well' },
    { id: 'answered-call', stage: 'inversion', evidence: 'a distant voice answers when the world flips' },
    { id: 'comrade-voice', stage: 'deep-line', evidence: 'the searcher finally reaches the edge of the dream' },
  ];

  const residents = [
    { id: 'outskirts-survivor', stage: 'outskirts', role: 'ash-survivor', name: 'Vey', occupation: 'Wounded Standard-Bearer' },
    { id: 'outskirts-roadkeeper', stage: 'outskirts', role: 'cut-watcher', name: 'Olan', occupation: 'Road Keeper' },
    { id: 'woods-clockkeeper', stage: 'black-woods', role: 'clock-keeper', name: 'Orra', occupation: 'Clock Keeper' },
    { id: 'woods-resinworker', stage: 'black-woods', role: 'resin-worker', name: 'Pell', occupation: 'Resin Worker' },
    { id: 'woods-veteran', stage: 'black-woods', role: 'quiet-veteran', name: 'Hale', occupation: 'Quiet Veteran' },
    { id: 'brute-chainwright', stage: 'brute', role: 'chainwright', name: 'Oren', occupation: 'Causeway Chainwright' },
    { id: 'brute-stretcher', stage: 'brute', role: 'stretcher-keeper', name: 'Sable', occupation: 'Stretcher-Keeper' },
    { id: 'updrafts-kitemender', stage: 'updrafts', role: 'kite-mender', name: 'Talla', occupation: 'Kite-Mender' },
    { id: 'updrafts-rainkeeper', stage: 'updrafts', role: 'rain-keeper', name: 'Edrin', occupation: 'Rain-Catcher Keeper' },
    { id: 'marksman-fletcher', stage: 'hollow-marksman', role: 'watch-fletcher', name: 'Mara', occupation: 'Road Surveyor' },
    { id: 'marksman-veilmender', stage: 'hollow-marksman', role: 'veil-mender', name: 'Senn', occupation: 'Veil-Mender' },
  ];

  const facts = [
    { id: 'poisoned-in-camp', clues: ['white-trumpet-flowers', 'first-draught', 'apothecary-spoon'] },
    { id: 'only-minutes-passed', clues: ['pulse-one', 'pulse-two', 'pulse-three'] },
    { id: 'army-was-four-men', clues: ['repeated-grunt-face', 'four-bone-dice', 'right-hand-seal'] },
    { id: 'world-is-a-survival-fight', clues: ['physician-checkpoints', 'lucid-critical-hits', 'searcher-trail'] },
    { id: 'bosses-are-a-command-chain', clues: ['boss-rank-titles', 'averted-faces', 'right-hand-seal'] },
  ];

  const endings = [
    {
      id: 'wake-fall',
      requires: ['abyss-king-cleared'],
      excludes: ['deep-line-cleared'],
      beats: ['wake-delirious', 'enemy-soldiers-enter', 'halfway-defense', 'knight-killed', 'darkness'],
    },
    {
      id: 'wake-armed',
      requires: ['abyss-king-cleared', 'deep-line-cleared'],
      excludes: [],
      beats: ['wake-delirious', 'enemy-soldiers-enter', 'flameblade-focus', 'dream-images-return', 'rusty-axe-defense', 'knight-collapses', 'ordinary-axe-reveal', 'darkness', 'comrade-says-he-who-saved-us-has-awoken', 'eyes-open'],
    },
  ];

  const memoryById = new Map(memories.map((item) => [item.id, item]));
  const clockById = new Map(clocks.map((item) => [item.id, item]));
  const searcherById = new Map(searcherTrail.map((item) => [item.id, item]));
  const residentById = new Map(residents.map((item) => [item.id, item]));
  const bossById = new Map(bossEchoes.map((item) => [item.boss, item]));

  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (!value || typeof value !== 'object') return value;
    const output = {};
    for (const [key, item] of Object.entries(value)) output[key] = clone(item);
    return output;
  }

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);
    for (const item of Object.values(value)) deepFreeze(item);
    return value;
  }

  function known(values, catalog) {
    const output = [];
    const seen = new Set();
    for (const value of Array.isArray(values) ? values : []) {
      const id = String(value || '');
      if (!catalog.has(id) || seen.has(id)) continue;
      seen.add(id);
      output.push(id);
    }
    return output;
  }

  function createProgress(source) {
    const input = source && typeof source === 'object' && !Array.isArray(source) ? source : {};
    return {
      schema: SCHEMA,
      version: VERSION,
      memoriesFound: known(input.memoriesFound, memoryById),
      memoriesRead: known(input.memoriesRead, memoryById),
      clockVisits: known(input.clockVisits, clockById),
      searcherSigns: known(input.searcherSigns, searcherById),
      residentVisits: known(input.residentVisits, residentById),
      bossEchoes: known(input.bossEchoes, bossById),
      kingCleared: !!input.kingCleared,
      endingSeen: endings.some((ending) => ending.id === input.endingSeen) ? input.endingSeen : null,
    };
  }

  function migrateProgress(raw, legacy) {
    const source = legacy && typeof legacy === 'object' ? legacy : {};
    const input = raw && raw.schema === SCHEMA ? raw : {
      kingCleared: (Number(source.kingKills) || 0) > 0 || !!source.gameBeaten,
      bossEchoes: Object.entries(source.bossTypeKills || {}).filter(([, count]) => Number(count) > 0).map(([id]) => id),
    };
    const progress = createProgress(input);
    return Object.freeze({
      progress,
      receipt: Object.freeze({
        from: raw && raw.schema === SCHEMA ? Number(raw.version) || 0 : 0,
        to: VERSION,
        changed: JSON.stringify(raw || null) !== JSON.stringify(progress),
        source: raw && raw.schema === SCHEMA ? 'story-progress' : 'legacy-campaign',
      }),
    });
  }

  function add(progress, key, id, catalog) {
    const state = createProgress(progress);
    if (!catalog.has(id)) return Object.freeze({ ok: false, reason: 'unknown-clue', progress: state });
    if (!state[key].includes(id)) state[key].push(id);
    return Object.freeze({ ok: true, reason: 'recorded', progress: state });
  }

  function findMemory(progress, id) {
    return add(progress, 'memoriesFound', id, memoryById);
  }

  function readMemory(progress, id) {
    const state = createProgress(progress);
    if (!state.memoriesFound.includes(id)) return Object.freeze({ ok: false, reason: 'memory-not-found', progress: state });
    return add(state, 'memoriesRead', id, memoryById);
  }

  function visitClock(progress, id) {
    return add(progress, 'clockVisits', id, clockById);
  }

  function markSearcherSign(progress, id) {
    return add(progress, 'searcherSigns', id, searcherById);
  }

  function meetResident(progress, id) {
    return add(progress, 'residentVisits', id, residentById);
  }

  function markBossEcho(progress, boss) {
    const result = add(progress, 'bossEchoes', boss, bossById);
    if (!result.ok) return result;
    if (boss === 'king') result.progress.kingCleared = true;
    return result;
  }

  function revelation(progress) {
    const state = createProgress(progress);
    const read = new Set(state.memoriesRead);
    const count = read.size;
    const tyrantConfirmed = read.has('right-hand-seal') && state.bossEchoes.includes('tyrant');
    const suspicion=read.has('empty-scabbard')||count>=4;
    const pattern=read.has('four-bone-dice')||count>=6;
    return Object.freeze({
      fragmentsRead: count,
      stage: tyrantConfirmed ? 'confirmed' : pattern ? 'pattern' : suspicion ? 'suspicion' : 'undiagnostic',
      tyrantConfirmed,
      clocksComplete: state.clockVisits.length === clocks.length,
    });
  }

  function endingState(progress, worldProgress) {
    const state = createProgress(progress);
    const deepLineCleared = !!(worldProgress && worldProgress.flags && worldProgress.flags.deepLineCleared);
    if (!state.kingCleared) return Object.freeze({ eligible: false, id: null, reason: 'abyss-king-standing' });
    const id = deepLineCleared ? 'wake-armed' : 'wake-fall';
    return Object.freeze({ eligible: true, id, reason: deepLineCleared ? 'truth-route-complete' : 'direct-route-complete' });
  }

  function markEndingSeen(progress, worldProgress) {
    const state = createProgress(progress);
    const selected = endingState(state, worldProgress);
    if (!selected.eligible) return Object.freeze({ ok: false, reason: selected.reason, progress: state });
    state.endingSeen = selected.id;
    return Object.freeze({ ok: true, reason: 'ending-recorded', progress: state });
  }

  function stageBrief(stageId) {
    return Object.freeze({
      stage: stageId,
      symptom: stageSymptoms.find((item) => item.stage === stageId) || null,
      memory: memories.find((item) => item.stage === stageId) || null,
      clock: clocks.find((item) => item.stage === stageId) || null,
      searcher: searcherTrail.find((item) => item.stage === stageId) || null,
      residents: residents.filter((item) => item.stage === stageId),
      boss: bossEchoes.find((item) => item.stage === stageId) || null,
      flowersIgnoreBiome: true,
      poisonPlayerElement: false,
    });
  }

  function validateStory() {
    const errors = [];
    if (memories.length < 6 || memories.find((item) => item.id === 'right-hand-seal')?.stage !== 'void-tyrant') errors.push('the Void Tyrant must own the confirmation memory');
    if (clocks.map((clock) => clock.time).join(',') !== '3:40,3:41,3:44') errors.push('clock witnesses must span only four minutes');
    if (bossEchoes.length !== 7 || !bossById.has('king') || !bossById.has('tyrant')) errors.push('boss command-chain correspondence is incomplete');
    for (const fact of facts) if (fact.clues.length < 3 || new Set(fact.clues).size < 3) errors.push(`fact ${fact.id} lacks three independent clues`);
    if (!endings.some((ending) => ending.id === 'wake-fall') || !endings.some((ending) => ending.id === 'wake-armed')) errors.push('both agreed endings are required');
    if (!endings.find((ending) => ending.id === 'wake-armed')?.beats.includes('ordinary-axe-reveal')) errors.push('alternate ending must reveal the rusty axe');
    if (residents.filter((item) => item.stage === 'outskirts').length !== 2) errors.push('Outskirts requires Vey and Olan');
    if (residents.filter((item) => item.stage === 'black-woods').length !== 3) errors.push('Black Woods refuge requires three distinct residents');
    if (residents.filter((item) => item.stage === 'brute').length !== 2) errors.push('Broken Causeway requires Oren and Sable');
    if (residents.filter((item) => item.stage === 'hollow-marksman').length !== 2) errors.push('Hollow Marksman requires its surveyor and veil-mender');
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), memories: memories.length, clocks: clocks.length, residents: residents.length, bosses: bossEchoes.length, facts: facts.length, endings: endings.length });
  }

  root.BladefallStory = Object.freeze({
    SCHEMA,
    VERSION,
    memories: deepFreeze(memories.map(clone)),
    clocks: deepFreeze(clocks.map(clone)),
    bossEchoes: deepFreeze(bossEchoes.map(clone)),
    stageSymptoms: deepFreeze(stageSymptoms.map(clone)),
    searcherTrail: deepFreeze(searcherTrail.map(clone)),
    residents: deepFreeze(residents.map(clone)),
    facts: deepFreeze(facts.map(clone)),
    endings: deepFreeze(endings.map(clone)),
    createProgress,
    migrateProgress,
    findMemory,
    readMemory,
    visitClock,
    markSearcherSign,
    meetResident,
    markBossEcho,
    revelation,
    endingState,
    markEndingSeen,
    stageBrief,
    validateStory,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
