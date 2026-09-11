import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-authoring.js');
await import('../public/bladefall-campaign.js');

const Campaign = globalThis.BladefallCampaign;

test('campaign blueprint catalog preserves all 16 progression-facing stages', () => {
  const stages = Campaign.stageCatalog();
  assert.equal(stages.length, 16);
  assert.deepEqual(stages.map((stage) => stage.name), [
    'The Outskirts', 'Black Woods', 'Broken Causeway', 'The Updrafts',
    'Hollow Marksman', 'Ruined Keep', 'The Warden', 'Frostfell',
    'Frost Sorcerer', 'Emberdeep', 'Ember Colossus', 'The Inversion',
    'The Void Tyrant', 'The Abyss King', 'The Gilded Vault', 'The Deep Line',
  ]);
  assert.equal(stages[13].boss, 'king');
  assert.equal(stages[15].secret, true);
  assert.equal(stages[14].len, 9700);
});

test('blueprints validate and retain unique ids, systems, acts, and recipes', () => {
  const report = Campaign.validateBlueprints();
  assert.deepEqual(report, { ok: true, errors: [], warnings: [], stages: 16 });
  assert.equal(new Set(Campaign.blueprints.map((item) => item.id)).size, 16);
  assert.ok(Campaign.blueprints.every((item) => item.systems.length >= 4));
  assert.ok(Campaign.blueprints.every((item) => item.acts.length >= 3));
});

test('portal verbs remain unique across adjacent stages and keep authored assignments', () => {
  const verbs = Campaign.portalVerbs();
  assert.deepEqual(verbs, {
    3: 'acquire-linked-mouth',
    4: 'break-rangefinder',
    5: 'reconstruction',
    6: 'cross-the-guard',
    7: 'sightline',
    9: 'traveler-relay',
    11: 'gravity',
  });
  const entries = Object.entries(verbs);
  for (let index = 1; index < entries.length; index++) {
    assert.notEqual(entries[index][1], entries[index - 1][1]);
  }
});

test('cadence, optional portal trials, and custom extension ownership moved into blueprints', () => {
  const cadence = Campaign.cadence();
  const trials = Campaign.portalTrials();
  const extensions = Campaign.customExtensions();

  assert.equal(cadence[3], undefined);
  assert.equal(cadence[10].adds, 3);
  assert.deepEqual(cadence[10].accents, []);
  assert.deepEqual(trials, {});
  assert.deepEqual(extensions, { 11: 2600 });
});

test('composition plans are optional, deterministic, and stage-specific', () => {
  const frost = Campaign.compositionPlan(7, 9000);
  const keep = Campaign.compositionPlan(5, 9000);
  const ember = Campaign.compositionPlan(9, 10000);
  const vault = Campaign.compositionPlan(14, 9900);

  assert.deepEqual(frost, {
    stageId: 'frostfell',
    recipe: 'none',
    targetX: 5490,
    optional: true,
    systems: Campaign.blueprint(7).systems,
  });
  assert.equal(keep.recipe, 'none');
  assert.equal(ember.recipe, 'none');
  assert.equal(ember.targetX, 7000);
  assert.equal(Campaign.compositionPlan(12, 9000).recipe, 'none');
  assert.equal(Campaign.compositionPlan(13, 10000).recipe, 'none');
  assert.equal(vault.recipe, 'none');
});

test('act assignment maps the complete level span without gaps', () => {
  const first = Campaign.actFor(15, 0, 14000);
  const middle = Campaign.actFor(15, 7200, 14000);
  const last = Campaign.actFor(15, 13999, 14000);

  assert.equal(first.name, 'signal descent');
  assert.equal(middle.name, 'trick fork');
  assert.equal(last.name, 'black gap');
  assert.equal(last.index, 5);
});

test('every blueprint compiles to a valid level-schema authoring document', () => {
  for (let index = 0; index < 16; index++) {
    const manifest = Campaign.authoringManifest(index);
    const validation = globalThis.BladefallAuthoring.validateManifest(manifest);
    assert.equal(validation.ok, true, `stage ${index}`);
    assert.equal(manifest.schema, 'bladefall.level');
    assert.equal(manifest.meta.stageIndex, index);
    assert.equal(manifest.annotations.blueprint, Campaign.blueprint(index).id);
  }
});

test('public blueprint data is immutable and catalog clones cannot mutate ownership', () => {
  const blueprint = Campaign.blueprint(0);
  assert.equal(Object.isFrozen(blueprint), true);
  assert.equal(Object.isFrozen(blueprint.systems), true);
  assert.throws(() => {
    blueprint.systems.push('mutation');
  }, TypeError);

  const catalog = Campaign.stageCatalog();
  catalog[0].name = 'Changed';
  assert.equal(Campaign.blueprint(0).stage.name, 'The Outskirts');
});

test('campaign source modes cover custom, procedural, bonus, and secret construction', () => {
  const modes = new Set(Campaign.blueprints.map((item) => item.source));
  assert.deepEqual(modes, new Set(['custom', 'procedural', 'bonus', 'secret']));
  assert.equal(Campaign.blueprint(14).composition.recipe, 'none');
  assert.equal(Campaign.blueprint(15).composition.recipe, 'none');
});

test('Outskirts planning charter is a six-room jump-only physical opening', () => {
  const outskirts = Campaign.blueprint(0);
  assert.deepEqual(outskirts.acts, ['poisoned verge','camp echo','watcher’s cut','hollow mile','broken muster','mothlight descent']);
  assert.deepEqual(outskirts.systems, ['single-jump-mastery','weaponless-evasion','route-choice','ability-foreshadowing','physical-world-seams','return-visit-sentinel']);
  assert.equal(outskirts.portalVerb,null);
  assert.equal(outskirts.stage.len,13800);
  assert.equal(outskirts.charter.planningComplete, true);
  assert.equal(outskirts.charter.geometryComplete, true);
  assert.equal(outskirts.charter.contentComplete, true);
  assert.equal(outskirts.charter.geometryEvidence, 'docs/charters/01-outskirts/evidence/validation/receipt.json');
  assert.equal(outskirts.charter.contentEvidence, 'docs/charters/01-outskirts/evidence/validation/receipt.json');
  assert.deepEqual(outskirts.charter.firstRunMinutes, [25, 32]);
  assert.deepEqual(outskirts.charter.roomSpans[3], [7000, 9300]);
  assert.equal(Campaign.actFor(0, 5900, 13800).name, 'watcher’s cut');
  assert.equal(Campaign.actFor(0, 7800, 13800).name, 'hollow mile');
  assert.equal(Object.isFrozen(outskirts.charter), true);
});

test('Black Woods planning charter turns the obstacle sampler into a settlement expedition', () => {
  const woods = Campaign.blueprint(1);
  assert.deepEqual(woods.acts, ['mothlight refuge', 'oathblade clearing', 'biting canopy', 'mirror thicket', 'rootbound passage']);
  assert.deepEqual(woods.systems, ['weapon-awakening', 'single-jump-combat', 'false-surfaces', 'traveler-lamp', 'route-reading', 'return-secret', 'physical-world-seams']);
  assert.equal(woods.portalVerb, null);
  assert.equal(woods.stage.len, 12400);
  assert.equal(woods.charter.planningComplete, true);
  assert.equal(woods.charter.geometryComplete, true);
  assert.equal(woods.charter.contentComplete, true);
  assert.deepEqual(woods.charter.firstRunMinutes, [22, 30]);
  assert.deepEqual(woods.charter.speedrunMinutes, [5, 7]);
  assert.deepEqual(woods.charter.roomSpans, [[0, 2400], [2400, 4200], [4200, 6700], [6700, 9700], [9700, 12400]]);
  assert.deepEqual(woods.charter.roomFocals, [1080, 3300, 5450, 8200, 11100]);
  assert.equal(Campaign.actFor(1, 2399, 12400).name, 'mothlight refuge');
  assert.equal(Campaign.actFor(1, 2400, 12400).name, 'oathblade clearing');
  assert.equal(Campaign.actFor(1, 4200, 12400).name, 'biting canopy');
  assert.equal(Campaign.actFor(1, 6700, 12400).name, 'mirror thicket');
  assert.equal(Campaign.actFor(1, 9700, 12400).name, 'rootbound passage');
});

test('Broken Causeway turns authored machinery into Dash-awakening pursuit', () => {
  const brute = Campaign.blueprint(2);
  assert.deepEqual(brute.acts, ['chainwake camp', 'drop yard', 'chainwalk', 'counterweight rise', 'broken standard']);
  assert.deepEqual(brute.systems, ['weapon-combat','committed-mass','route-choice','single-jump-machinery','brace-and-chain','dash-awakening','physical-world-seams']);
  assert.equal(brute.portalVerb, null);
  assert.equal(brute.charter.planningComplete, true);
  assert.equal(brute.charter.geometryComplete, true);
  assert.equal(brute.charter.contentComplete, true);
  assert.equal(brute.charter.geometryEvidence, 'docs/charters/03-brute/evidence/validation/receipt.json');
  assert.equal(brute.charter.contentEvidence, 'docs/charters/03-brute/evidence/validation/receipt.json');
  assert.deepEqual(brute.charter.firstRunMinutes, [28, 36]);
  assert.deepEqual(brute.charter.speedrunMinutes, [6, 9]);
  assert.deepEqual(brute.charter.roomSpans, [[0,2600],[2600,5600],[5600,8200],[8200,10500],[10500,14000]]);
  assert.deepEqual(brute.charter.roomFocals, [1100,4050,6900,9300,12150]);
  assert.equal(Campaign.actFor(2, 2599, 14000).name, 'chainwake camp');
  assert.equal(Campaign.actFor(2, 2600, 14000).name, 'drop yard');
  assert.equal(Campaign.actFor(2, 5600, 14000).name, 'chainwalk');
  assert.equal(Campaign.actFor(2, 8200, 14000).name, 'counterweight rise');
  assert.equal(Campaign.actFor(2, 10500, 14000).name, 'broken standard');
});

test('Updrafts planning charter makes wind mastery a seven-room pilgrimage', () => {
  const updrafts = Campaign.blueprint(3);
  assert.deepEqual(updrafts.acts, ['rootbreach lift', 'bellows rest', 'kite terraces', 'choir of drafts', 'needlewind labyrinth', 'rain-catcher basin', 'signal crown']);
  assert.deepEqual(updrafts.systems, ['authored-thermals', 'draft-terraces', 'wind-reactive-enemies', 'jetpack-rhythm', 'needlewind-maze', 'contained-rain-cistern', 'three-wind-gates']);
  assert.equal(updrafts.portalVerb, 'acquire-linked-mouth');
  assert.equal(updrafts.composition.recipe, 'none');
  assert.equal(updrafts.charter.planningComplete, true);
  assert.equal(updrafts.charter.geometryComplete, true);
  assert.equal(updrafts.charter.contentComplete, true);
  assert.equal(updrafts.charter.contentEvidence, 'docs/charters/04-updrafts/evidence/validation/receipt.json');
  assert.deepEqual(updrafts.charter.firstRunMinutes, [25, 35]);
  assert.deepEqual(updrafts.charter.speedrunMinutes, [4, 6]);
  assert.deepEqual(updrafts.charter.roomSpans, [[0,1500],[1500,3100],[3100,5700],[5700,8400],[8400,12400],[12400,15100],[15100,17000]]);
  assert.deepEqual(updrafts.charter.roomFocals, [750,2300,4380,7050,10400,13600,15900]);
  assert.equal(Campaign.actFor(3, 1499, 17000).name, 'rootbreach lift');
  assert.equal(Campaign.actFor(3, 1500, 17000).name, 'bellows rest');
  assert.equal(Campaign.actFor(3, 8400, 17000).name, 'needlewind labyrinth');
  assert.equal(Campaign.actFor(3, 15100, 17000).name, 'signal crown');
});

test('Hollow Marksman charter turns one portal deduction into a mobile duel', () => {
  const marksman = Campaign.blueprint(4);
  assert.deepEqual(marksman.acts, ['shotfall camp', 'the watching road', 'mantlet works', 'windcut gallery', 'deadeye court']);
  assert.deepEqual(marksman.systems, ['telegraphed-sightlines', 'linked-mouth-traversal', 'anchored-arrow-redirection', 'linked-mouth-under-fire', 'one-shot-rangefinder-bank', 'mobile-marksman-duel']);
  assert.equal(marksman.portalVerb, 'break-rangefinder');
  assert.equal(marksman.source, 'custom');
  assert.equal(marksman.composition.recipe, 'none');
  assert.deepEqual(marksman.cadence, { adds: 0, foes: [], accents: [] });
  assert.equal(marksman.charter.planningComplete, true);
  assert.equal(marksman.charter.geometryComplete, true);
  assert.equal(marksman.charter.contentComplete, true);
  assert.equal(marksman.charter.geometryEvidence, 'docs/charters/05-hollow-marksman/evidence/validation/receipt.json');
  assert.equal(marksman.charter.contentEvidence, 'docs/charters/05-hollow-marksman/evidence/validation/receipt.json');
  assert.deepEqual(marksman.charter.firstRunMinutes, [28, 36]);
  assert.deepEqual(marksman.charter.speedrunMinutes, [4, 6]);
  assert.deepEqual(marksman.charter.roomSpans, [[0, 2500], [2500, 5600], [5600, 9000], [9000, 11800], [11800, 15000]]);
  assert.deepEqual(marksman.charter.roomFocals, [900, 4050, 7300, 10400, 13650]);
  assert.equal(Campaign.actFor(4, 2499, 15000).name, 'shotfall camp');
  assert.equal(Campaign.actFor(4, 2500, 15000).name, 'the watching road');
  assert.equal(Campaign.actFor(4, 5600, 15000).name, 'mantlet works');
  assert.equal(Campaign.actFor(4, 9000, 15000).name, 'windcut gallery');
  assert.equal(Campaign.actFor(4, 11800, 15000).name, 'deadeye court');
});

test('compatibility compiler preserves authored parity while producing detached schema data', () => {
  const hook = () => 'kept';
  const source = {
    len: 1800,
    portal: 1720,
    objects: [
      { type: 'plat', x: 400, y: 0, w: 800, move: { dx: 40, period: 3 } },
      { type: 'plate', x: 720, y: 0, id: 'gate-a' },
    ],
    enemies: [{ t: 'grunt', x: 600 }],
    loot: [{ x: 900, y: 10, kind: 'weapon' }],
    npcs: [{ x: 1100, kind: 'escort' }],
    qitems: [{ x: 1300, y: 30 }],
    build: hook,
  };
  const compiled = Campaign.compileLegacyLevel(0, source);

  assert.equal(compiled.validation.ok, true);
  assert.deepEqual(compiled.parity, {
    objects: 2,
    enemies: 1,
    loot: 1,
    travelers: 1,
    qitems: 1,
    buildHook: true,
  });
  assert.equal(compiled.level.build, hook);
  assert.equal(compiled.manifest.annotations.compatibilityCompiler, 1);
  assert.equal(compiled.manifest.objects.length, 3);
  assert.equal(compiled.manifest.enemies[0].type, 'grunt');
  compiled.level.objects[0].move.dx = 999;
  assert.equal(source.objects[0].move.dx, 40);
});

test('compatibility compiler rejects unknown stages and missing authored levels', () => {
  assert.throws(() => Campaign.compileLegacyLevel(99, {}), /Unknown campaign stage/);
  assert.throws(() => Campaign.compileLegacyLevel(0, null), /requires an authored level object/);
});
