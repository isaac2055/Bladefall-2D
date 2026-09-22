(function installBladefallCampaign(root) {
  'use strict';

  const BLUEPRINT_SCHEMA = 'bladefall.campaign-blueprint';
  const BLUEPRINT_VERSION = 1;
  const RECIPES = new Set([
    'wind-lift', 'pendulum-passage', 'lowg-rotor', 'current-updraft',
    'gravity-well', 'ice-wind', 'lava-step', 'none',
  ]);

  const stages = [
    { name: 'The Outskirts', len: 13800, theme: 'plains', sky: '#111827', ground: '#26313a', grunts: 0, flyers: 0, type: 'normal' },
    { name: 'Black Woods', len: 12400, theme: 'forest', sky: '#13211a', ground: '#1d3026', grunts: 2, flyers: 2, mix: { toxling: 1 }, type: 'normal' },
    { name: 'Broken Causeway', len: 14000, theme: 'badlands', sky: '#241a1a', ground: '#33231f', grunts: 1, flyers: 1, type: 'miniboss', boss: 'brute' },
    { name: 'The Updrafts', len: 5000, theme: 'canyon', sky: '#241e16', ground: '#352a1e', grunts: 2, flyers: 2, type: 'normal' },
    { name: 'Hollow Marksman', len: 15000, theme: 'canyon', sky: '#1f1a12', ground: '#312718', grunts: 0, flyers: 0, type: 'miniboss', boss: 'archer' },
    { name: 'Ruined Keep', len: 8850, theme: 'ruins', sky: '#1c1830', ground: '#2a2440', grunts: 3, flyers: 2, mix: { shadeling: 1, toxling: 1 }, type: 'normal' },
    { name: 'The Warden', len: 8100, theme: 'dungeon', sky: '#2a1c2c', ground: '#3a2440', grunts: 1, flyers: 1, type: 'miniboss', boss: 'warden' },
    { name: 'Frostfell', len: 15100, theme: 'frost', sky: '#15202b', ground: '#243240', grunts: 3, flyers: 1, mix: { frostling: 3 }, type: 'normal' },
    { name: 'Frost Sorcerer', len: 16000, theme: 'frost', sky: '#10202c', ground: '#1e3340', grunts: 1, flyers: 1, mix: { frostling: 1 }, type: 'miniboss', boss: 'sorcerer' },
    { name: 'Emberdeep', len: 16400, theme: 'volcano', sky: '#2a1410', ground: '#3a1c14', grunts: 3, flyers: 1, mix: { emberling: 3 }, type: 'normal' },
    { name: 'Ember Colossus', len: 16600, theme: 'volcano', sky: '#2c130c', ground: '#3d1a10', grunts: 1, flyers: 1, mix: { emberling: 1 }, type: 'miniboss', boss: 'colossus' },
    { name: 'The Inversion', len: 16100, theme: 'void', sky: '#140b22', ground: '#241431', grunts: 2, flyers: 1, type: 'normal' },
    { name: 'The Void Tyrant', len: 17000, theme: 'apex', sky: '#0c0716', ground: '#1c1029', grunts: 1, flyers: 1, type: 'miniboss', boss: 'tyrant' },
    { name: 'The Abyss King', len: 18600, theme: 'void', sky: '#0a0510', ground: '#180c24', grunts: 0, flyers: 0, type: 'boss', boss: 'king' },
    // CUT 2026-09-20. The slot stays so every stageIndex after it keeps its number;
    // nothing routes here, it has no world node, no recollection and no rest site.
    { name: '(cut)', len: 9700, theme: 'apex', sky: '#141020', ground: '#242030', grunts: 0, flyers: 0, type: 'normal', cut: true },
    { name: 'The Deep Line', len: 13950, theme: 'badlands', sky: '#170f0c', ground: '#241610', grunts: 0, flyers: 0, type: 'normal', secret: true },
  ];

  const details = [
    {
      id: 'outskirts',
      source: 'custom',
      systems: ['single-jump-mastery', 'weaponless-evasion', 'route-choice', 'ability-foreshadowing', 'physical-world-seams', 'return-visit-sentinel'],
      signature: 'Wake unarmed at the dream’s broken camp-edge, learn one demanding jump through safe recovery and deliberate avoidance, help Mara read the old road, and walk through Mothlight Tunnel into Black Woods while later abilities remain visibly useful but never required.',
      acts: ['poisoned verge', 'camp echo', 'watcher’s cut', 'hollow mile', 'broken muster', 'mothlight descent'],
      composition: { recipe: 'none', at: 0.50 },
      charter: {
        planningComplete: true,
        geometryComplete: true,
        contentComplete: true,
        firstRunMinutes: [25, 32],
        speedrunMinutes: [5, 8],
        evidence: 'docs/charters/01-outskirts/charter.md',
        geometryEvidence: 'docs/charters/01-outskirts/evidence/validation/receipt.json',
        contentEvidence: 'docs/charters/01-outskirts/evidence/validation/receipt.json',
        roomSpans: [[0, 2600], [2600, 4700], [4700, 7000], [7000, 9300], [9300, 11500], [11500, 13800]],
        roomFocals: [1080, 3550, 5850, 8150, 10350, 12700],
      },
    },
    {
      id: 'black-woods',
      source: 'custom',
      systems: ['weapon-awakening', 'single-jump-combat', 'false-surfaces', 'traveler-lamp', 'route-reading', 'return-secret', 'physical-world-seams'],
      signature: 'Pause in the first refuge, recover the Oathblade in its own clearing, learn how armed enemies occupy terrain, then read the forest’s honest resin through a recoverable thicket and leave by the root tunnel.',
      acts: ['mothlight refuge', 'oathblade clearing', 'biting canopy', 'mirror thicket', 'rootbound passage'],
      composition: { recipe: 'none', at: 0.58 },
      charter: {
        planningComplete: true,
        geometryComplete: true,
        contentComplete: true,
        firstRunMinutes: [22, 30],
        speedrunMinutes: [5, 7],
        evidence: 'docs/charters/02-black-woods/evidence/receipt.json',
        roomSpans: [[0, 2400], [2400, 4200], [4200, 6700], [6700, 9700], [9700, 12400]],
        roomFocals: [1080, 3300, 5450, 8200, 11100],
      },
    },
    {
      id: 'brute',
      source: 'custom',
      systems: ['weapon-combat', 'committed-mass', 'route-choice', 'single-jump-machinery', 'brace-and-chain', 'dash-awakening', 'physical-world-seams'],
      signature: 'Read the causeway’s stopped machinery, turn the Brute’s committed charge into climbable wreckage, cut the exposed chain, and let the old counterweight break its armor before a direct pursuit duel.',
      acts: ['chainwake camp', 'drop yard', 'chainwalk', 'counterweight rise', 'broken standard'],
      composition: { recipe: 'none', at: 0.42 },
      charter: {
        planningComplete: true,
        geometryComplete: true,
        contentComplete: true,
        firstRunMinutes: [28, 36],
        speedrunMinutes: [6, 9],
        evidence: 'docs/charters/03-brute/evidence/receipt.json',
        geometryEvidence: 'docs/charters/03-brute/evidence/validation/receipt.json',
        contentEvidence: 'docs/charters/03-brute/evidence/validation/receipt.json',
        roomSpans: [[0, 2600], [2600, 5600], [5600, 8200], [8200, 10500], [10500, 14000]],
        roomFocals: [1100, 4050, 6900, 9300, 12150],
      },
    },
    {
      id: 'updrafts',
      source: 'custom',
      portalVerb: 'acquire-linked-mouth',
      systems: ['authored-thermals', 'draft-terraces', 'wind-reactive-enemies', 'jetpack-rhythm', 'needlewind-maze', 'contained-rain-cistern', 'three-wind-gates'],
      signature: 'Master authored currents, survive a localized flight maze, align three distinct wind gates, and earn the first linked portal without using it inside the level.',
      acts: ['rootbreach lift', 'bellows rest', 'kite terraces', 'choir of drafts', 'needlewind labyrinth', 'rain-catcher basin', 'signal crown'],
      composition: { recipe: 'none', at: 0.50 },
      charter: {
        planningComplete: true,
        geometryComplete: true,
        contentComplete: true,
        firstRunMinutes: [25, 35],
        speedrunMinutes: [4, 6],
        evidence: 'docs/charters/04-updrafts/evidence/receipt.json',
        geometryEvidence: 'docs/charters/04-updrafts/evidence/validation/receipt.json',
        contentEvidence: 'docs/charters/04-updrafts/evidence/validation/receipt.json',
        roomSpans: [[0, 1500], [1500, 3100], [3100, 5700], [5700, 8400], [8400, 12400], [12400, 15100], [15100, 17000]],
        roomFocals: [750, 2300, 4380, 7050, 10400, 13600, 15900],
      },
    },
    {
      id: 'hollow-marksman',
      source: 'custom',
      portalVerb: 'break-rangefinder',
      systems: ['telegraphed-sightlines', 'linked-mouth-traversal', 'anchored-arrow-redirection', 'linked-mouth-under-fire', 'one-shot-rangefinder-bank', 'mobile-marksman-duel'],
      signature: 'Master one movable mouth linked to authored anchors, turn a single marked shot against the Marksman’s rangefinder, then earn the independent pair.',
      acts: ['shotfall camp', 'the watching road', 'mantlet works', 'windcut gallery', 'deadeye court'],
      composition: { recipe: 'none', at: 0.43 },
      cadence: { adds: 0, foes: [], accents: [] },
      charter: {
        planningComplete: true,
        geometryComplete: true,
        contentComplete: true,
        firstRunMinutes: [28, 36],
        speedrunMinutes: [4, 6],
        evidence: 'docs/charters/05-hollow-marksman/evidence/receipt.json',
        geometryEvidence: 'docs/charters/05-hollow-marksman/evidence/validation/receipt.json',
        contentEvidence: 'docs/charters/05-hollow-marksman/evidence/validation/receipt.json',
        roomSpans: [[0, 2500], [2500, 5600], [5600, 9000], [9000, 11800], [11800, 15000]],
        roomFocals: [900, 4050, 7300, 10400, 13650],
      },
    },
    {
      id: 'ruined-keep',
      source: 'custom',
      portalVerb: 'reconstruction',
      systems: ['independent-portal-pair', 'keystone-routing', 'latched-architecture', 'wall-jump', 'return-road'],
      signature: 'Build both ends of a spatial route, carry a fallen keystone through it, then climb the Keep the repaired stone reveals.',
      acts: ['gatehouse hearth', 'fallen refectory', 'weight hall', 'mason quarter', 'split belfry', 'clinging archive'],
      composition: { recipe: 'none', at: 0.5 },
      customExtension: 0,
      charter: {
        planningComplete: true,
        geometryComplete: true,
        contentComplete: true,
        firstRunMinutes: [32, 42],
        speedrunMinutes: [7, 10],
        evidence: 'docs/charters/06-ruined-keep/evidence/receipt.json',
        geometryEvidence: 'docs/charters/06-ruined-keep/evidence/validation/receipt.json',
        contentEvidence: 'docs/charters/06-ruined-keep/evidence/validation/receipt.json',
        roomSpans: [[0, 3000], [3000, 4800], [4800, 8200], [8200, 11100], [11100, 14500], [14500, 18000]],
        roomFocals: [1250, 3900, 6500, 9550, 12800, 16400],
      },
    },
    {
      id: 'warden',
      source: 'custom',
      portalVerb: 'cross-the-guard',
      systems: ['reverse-traversal', 'wall-jump-descent', 'shield-facing', 'contained-low-gravity', 'gaol-rotors', 'opposed-mouth-flank', 'counter-awakening', 'physical-world-seams'],
      signature: 'Descend the Gaol from its eastern crown, learn how shielded jailers commit to a facing, then cross a personal portal pair through the Warden’s guard and earn Counter before taking the mine road into Frostfell.',
      acts: ['sentence well', 'red court', 'turning cells', 'hush engine', 'blind gallery', 'western crown'],
      composition: { recipe: 'none', at: 0.5 },
      customExtension: 0,
      charter: {
        planningComplete: true,
        geometryComplete: true,
        contentComplete: true,
        firstRunMinutes: [30, 38],
        speedrunMinutes: [6, 9],
        evidence: 'docs/charters/07-warden/evidence/receipt.json',
        geometryEvidence: 'docs/charters/07-warden/evidence/validation/receipt.json',
        contentEvidence: 'docs/charters/07-warden/evidence/validation/receipt.json',
        roomSpans: [[0, 2900], [2900, 5100], [5100, 7700], [7700, 10100], [10100, 12600], [12600, 15000]],
        roomFocals: [1500, 4000, 6400, 8900, 11400, 13800],
      },
    },
    {
      id: 'frostfell',
      source: 'custom',
      portalVerb: 'sightline',
      systems: ['counter', 'ice', 'traveler-warmth', 'signal-routing', 'wind', 'double-jump'],
      signature: 'Restore a frozen settlement with Nim’s permanent hearths, route fire through a wind duct, and carry Double Jump through exposed ice galleries to the dormant Muster Engine.',
      acts: ['banked refuge', 'working streets', 'workers hearth', 'thermal works', 'thawed court', 'frozen stair', 'exposed galleries', 'muster crown'],
      composition: { recipe: 'none', at: 0.61 },
      cadence: { adds: 0, foes: [], accents: [] },
    },
    {
      id: 'frost-sorcerer',
      source: 'custom',
      systems: ['spell-capture', 'moving-siphon', 'water', 'chasing-boss', 'double-jump'],
      signature: 'Reopen the inhabited sluice, cross the glassworks, and steal the court’s cold magic.',
      acts: ['west sluice', 'sluice refuge', 'thaw court', 'glassworks', 'petition gallery', 'white court'],
      charter: { planningComplete:true, geometryComplete:false, contentComplete:false,
        firstRunMinutes:[30,38],speedrunMinutes:[6,9],evidence:"docs/charters/09-frost-sorcerer/DESIGN-PLAN.md",
        roomSpans:[[0,3600],[3600,5600],[5600,8200],[8200,10800],[10800,13000],[13000,16000]],
        roomFocals:[1850,4450,6800,9400,11600,14300] },
      composition: { recipe: 'none', at: 0.46 },
      cadence: { adds: 0, foes: [], accents: [] },
    },
    {
      id: 'emberdeep',
      source: 'custom',
      portalVerb: 'traveler-relay',
      systems: ['traveler-relay', 'lava', 'timed-platforming', 'portals'],
      signature: 'Pass a traveler through a selective barrier so their held relay materializes the only route across a live furnace.',
      acts: ['cooling road', 'pour schedule', 'the draw', 'held bridge', 'pour floor', 'deep stair'],
      composition: { recipe: 'none', at: 0.70 },
      cadence: { adds: 0, foes: [], accents: [] },
    },
    {
      id: 'ember-colossus',
      source: 'custom',
      systems: ['projectile-cooling', 'water-circuit', 'portal-capture', 'forged-ammunition'],
      signature: 'Capture a molten shot, force it through the coolant channel, and return the forged slug.',
      acts: ['receiving floor', 'casting line', 'the anvil', 'mould hall', 'casting pit', 'the fissure'],
      composition: { recipe: 'none', at: 0.49 },
      cadence: { adds: 0, foes: [], accents: [] },
    },
    {
      id: 'inversion',
      source: 'custom',
      portalVerb: 'gravity',
      systems: ['gravity-flip', 'alternating-polarity', 'ceiling-route', 'portal-crate'],
      signature: 'Alternate between floor and ceiling under pressure, then apply both orientations to a two-mouth drop-lock.',
      // Six authored rooms, played right-to-left and downward as a diagonal of
      // terraces. The procedural coda is gone: a region about which surface you owe
      // cannot end in a generated hazard stretch laid on one flat floor.
      acts: ['the fall in', 'the unreachable line', 'the reversal', 'polarity gauntlet', 'the drop-lock', 'the void fissure'],
      composition: { recipe: 'none', at: 0.76 },
      customExtension: 0,
    },
    {
      id: 'void-tyrant',
      source: 'custom',
      systems: ['two-mouth-placement', 'height-phases', 'paradox-loop', 'void-barrage'],
      signature: 'Rebuild the opposed pair at leg, torso, and head height while each successful phase accelerates the barrage.',
      // Six authored rooms walked EAST TO WEST, mirroring the charter, because the
      // map puts the Inversion above this region's east gate and the Drowned Throne
      // beyond its west one. Every room rehearses the arena before the arena.
      acts: ['fissure mouth', 'rising ledgers', 'opposed faces', 'the spent line', 'paradox vigil', 'three-band arena'],
      composition: { recipe: 'none', at: 0.34 },
      cadence: { adds: 0, foes: [], accents: [] },
    },
    {
      id: 'abyss-king',
      source: 'custom',
      systems: ['portal-hijack', 'echo-setup', 'crown-phases', 'spatial-offset'],
      signature: 'Construct an attack route the boss can steal, then survive the consequences of that geometry.',
      // Five authored rooms walked WEST TO EAST, and a TWO-boss region: the Void
      // Tyrant did not die in the Citadel and holds the middle of it.
      //   THIS BLUEPRINT WAS PROCEDURAL UNTIL 7.141.0 AND ITS LEFTOVERS WERE LIVE.
      // `source` drives the authoring manifest's ownership tags, `acts` files every
      // object into a room, and `cadence.adds` INJECTS ENEMIES — the old value of 3
      // was dropping a shadeling at 5900 (inside the Right Hand's arena), a stormmote
      // at 8840 and a sporecaster at 1460 into an authored region. Authoring a stage
      // is not finished until its blueprint stops describing the generated one.
      acts: ['the drowned stair', 'the two marks', 'the right hand', 'the long drowning',
        'the divided stair', 'the last breath', 'the throne'],
      composition: { recipe: 'none', at: 0.37 },
      cadence: { adds: 0, foes: [], accents: [] },
    },
    {
      // CUT 2026-09-20. The blueprint pairs one-to-one with the stage table by index,
      // so the slot must exist for every later stageIndex to keep its number. It has
      // no world node, no connector, no recollection and no rest site: nothing routes
      // here and nothing can.
      id: 'cut-slot-14',
      source: 'bonus',
      systems: ['cut', 'cut', 'cut', 'cut'],
      signature: 'Cut region. The road past the King is the Deep Line.',
      acts: ['cut', 'cut', 'cut', 'cut'],
      composition: { recipe: 'none', at: 0.5 },
    },
    {
      id: 'deep-line',
      source: 'secret',
      systems: ['minecart', 'route-lean', 'signal-memory', 'collapsing-rail', 'snipers'],
      signature: 'Bank route signals through dangerous high lines, then cash that history into the final black-gap launch.',
      acts: ['signal descent', 'first fork', 'falling bridge', 'trick fork', 'sniper clock', 'black gap'],
      composition: { recipe: 'none', at: 0.5 },
    },
  ];

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

  const blueprints = details.map((detail, index) => deepFreeze({
    schema: BLUEPRINT_SCHEMA,
    version: BLUEPRINT_VERSION,
    index,
    id: detail.id,
    stage: clone(stages[index]),
    source: detail.source,
    signature: detail.signature,
    systems: detail.systems.slice(),
    acts: detail.acts.slice(),
    portalVerb: detail.portalVerb || null,
    portalTrial: detail.portalTrial || null,
    cadence: detail.cadence ? clone(detail.cadence) : null,
    customExtension: detail.customExtension || 0,
    composition: clone(detail.composition),
    charter: detail.charter ? clone(detail.charter) : null,
  }));

  function blueprint(index) {
    return blueprints[index] || null;
  }

  function stageCatalog() {
    return blueprints.map((item) => clone(item.stage));
  }

  function portalVerbs() {
    const output = {};
    for (const item of blueprints) if (item.portalVerb) output[item.index] = item.portalVerb;
    return output;
  }

  function cadence() {
    const output = {};
    for (const item of blueprints) if (item.cadence) output[item.index] = clone(item.cadence);
    return output;
  }

  function portalTrials() {
    const output = {};
    for (const item of blueprints) if (item.portalTrial) output[item.index] = item.portalTrial;
    return output;
  }

  function customExtensions() {
    const output = {};
    for (const item of blueprints) if (item.customExtension) output[item.index] = item.customExtension;
    return output;
  }

  function compositionPlan(index, length) {
    const item = blueprint(index);
    if (!item) return null;
    return Object.freeze({
      stageId: item.id,
      recipe: item.composition.recipe,
      targetX: Math.round((Number(length) || item.stage.len) * item.composition.at),
      optional: true,
      systems: item.systems,
    });
  }

  function actFor(index, x, length) {
    const item = blueprint(index);
    if (!item || !item.acts.length) return null;
    if (item.charter && Array.isArray(item.charter.roomSpans)) {
      const position = Number(x) || 0;
      let actIndex = item.charter.roomSpans.findIndex((span) => position >= span[0] && position < span[1]);
      if (actIndex < 0) actIndex = position < item.charter.roomSpans[0][0] ? 0 : item.acts.length - 1;
      return Object.freeze({ index: actIndex, name: item.acts[actIndex], stageId: item.id });
    }
    const progress = Math.max(0, Math.min(0.999999, (Number(x) || 0) / Math.max(1, Number(length) || item.stage.len)));
    const actIndex = Math.min(item.acts.length - 1, Math.floor(progress * item.acts.length));
    return Object.freeze({ index: actIndex, name: item.acts[actIndex], stageId: item.id });
  }

  function authoringManifest(index) {
    const item = blueprint(index);
    if (!item) return null;
    const payload = {
      schema: 'bladefall.level',
      version: 1,
      id: `blueprint-${String(index + 1).padStart(2, '0')}-${item.id}`,
      meta: {
        name: item.stage.name,
        theme: item.stage.theme,
        length: item.stage.len,
        stageIndex: index,
        stageType: item.stage.type,
        source: item.source,
      },
      start: { x: 70, y: 0 },
      exit: { type: item.stage.boss ? 'boss-clear' : 'portal', x: item.stage.len, y: 0 },
      objects: [],
      enemies: [],
      pickups: [],
      travelers: [],
      annotations: {
        blueprint: item.id,
        signature: item.signature,
        systems: item.systems.slice(),
        acts: item.acts.slice(),
        portalVerb: item.portalVerb,
        portalTrial: item.portalTrial,
        composition: clone(item.composition),
      },
    };
    const authoring = root.BladefallAuthoring;
    return authoring && typeof authoring.normalizeManifest === 'function'
      ? authoring.normalizeManifest(payload) : payload;
  }

  function compileLegacyLevel(index, authoredLevel) {
    const item = blueprint(index);
    if (!item) throw new Error(`Unknown campaign stage ${index}`);
    if (!authoredLevel || typeof authoredLevel !== 'object') {
      throw new TypeError(`Stage "${item.id}" requires an authored level object`);
    }
    const level = clone(authoredLevel);
    level.objects = Array.isArray(level.objects) ? level.objects : [];
    level.loot = Array.isArray(level.loot) ? level.loot : [];
    level.enemies = Array.isArray(level.enemies) ? level.enemies : [];
    level.npcs = Array.isArray(level.npcs) ? level.npcs : [];
    level.qitems = Array.isArray(level.qitems) ? level.qitems : [];

    const objects = level.objects.map((object, objectIndex) => {
      const record = clone(object);
      if (record.id != null) record.sourceId = String(record.id);
      record.id = `object-${String(objectIndex + 1).padStart(3, '0')}`;
      record.type = record.type || 'unknown';
      record.x = Number(record.x) || 0;
      record.y = Number(record.y) || 0;
      return record;
    });
    for (let qIndex = 0; qIndex < level.qitems.length; qIndex++) {
      const qitem = level.qitems[qIndex];
      objects.push({
        id: `qitem-${String(qIndex + 1).padStart(3, '0')}`,
        type: 'qitem',
        x: Number(qitem.x) || 0,
        y: Number(qitem.y) || 0,
      });
    }
    const enemies = level.enemies.map((enemy, enemyIndex) => ({
      id: `enemy-${String(enemyIndex + 1).padStart(3, '0')}`,
      type: enemy.t || enemy.type || 'unknown',
      x: Number(enemy.x) || 0,
      y: Number(enemy.y) || 0,
      railSniper: !!enemy.railSniper,
    }));
    const pickups = level.loot.map((loot, lootIndex) => ({
      id: `pickup-${String(lootIndex + 1).padStart(3, '0')}`,
      type: loot.kind || 'loot',
      x: Number(loot.x) || 0,
      y: Number(loot.y) || 0,
    }));
    const travelers = level.npcs.map((npc, npcIndex) => ({
      id: `traveler-${String(npcIndex + 1).padStart(3, '0')}`,
      type: npc.kind || 'traveler',
      x: Number(npc.x) || 0,
      y: Number(npc.y) || 0,
    }));
    const authoring = root.BladefallAuthoring;
    const rawManifest = {
      schema: 'bladefall.level',
      version: 1,
      id: `authored-${String(index + 1).padStart(2, '0')}-${item.id}`,
      meta: {
        name: item.stage.name,
        theme: item.stage.theme,
        length: Number(level.len) || item.stage.len,
        stageIndex: index,
        stageType: item.stage.type,
        source: item.source,
      },
      start: { x: 70, y: Number(level.spawnY) || 0 },
      exit: {
        type: item.stage.boss ? 'boss-clear' : 'portal',
        x: Number(level.portal) || Number(level.len) || item.stage.len,
        y: 0,
      },
      objects,
      enemies,
      pickups,
      travelers,
      annotations: {
        blueprint: item.id,
        compatibilityCompiler: 1,
        hasBuildHook: typeof level.build === 'function',
        flip: !!level.flip,
        cart: !!level.cart,
        bonus: !!level.bonus,
      },
    };
    const manifest = authoring && typeof authoring.normalizeManifest === 'function'
      ? authoring.normalizeManifest(rawManifest) : rawManifest;
    const validation = authoring && typeof authoring.validateManifest === 'function'
      ? authoring.validateManifest(manifest)
      : { ok: true, errors: [], warnings: [] };
    return {
      level,
      manifest,
      validation,
      parity: {
        objects: level.objects.length,
        enemies: level.enemies.length,
        loot: level.loot.length,
        travelers: level.npcs.length,
        qitems: level.qitems.length,
        buildHook: typeof level.build === 'function',
      },
    };
  }

  function validateBlueprints() {
    const errors = [];
    const warnings = [];
    const ids = new Set();
    if (blueprints.length !== 16) errors.push({ code: 'campaign.count', message: 'Campaign must define exactly 16 stages.' });
    for (let index = 0; index < blueprints.length; index++) {
      const item = blueprints[index];
      if (item.index !== index) errors.push({ code: 'campaign.index', stage: item.id });
      if (ids.has(item.id)) errors.push({ code: 'campaign.id.duplicate', stage: item.id });
      ids.add(item.id);
      if (!item.stage.name || !item.stage.theme || !item.stage.type) errors.push({ code: 'campaign.stage.meta', stage: item.id });
      if (!item.systems.length) errors.push({ code: 'campaign.systems.empty', stage: item.id });
      if (!item.acts.length) errors.push({ code: 'campaign.acts.empty', stage: item.id });
      if (!RECIPES.has(item.composition.recipe)) errors.push({ code: 'campaign.recipe.unknown', stage: item.id });
      if (item.portalVerb && index > 0 && item.portalVerb === blueprints[index - 1].portalVerb) {
        warnings.push({ code: 'campaign.portal.adjacent-repeat', stage: item.id });
      }
    }
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), warnings: Object.freeze(warnings), stages: blueprints.length });
  }

  root.BladefallCampaign = Object.freeze({
    schema: Object.freeze({ id: BLUEPRINT_SCHEMA, version: BLUEPRINT_VERSION }),
    blueprints: Object.freeze(blueprints),
    blueprint,
    stageCatalog,
    portalVerbs,
    cadence,
    portalTrials,
    customExtensions,
    compositionPlan,
    actFor,
    authoringManifest,
    compileLegacyLevel,
    validateBlueprints,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
