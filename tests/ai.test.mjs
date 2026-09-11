import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-portals.js');
await import('../public/bladefall-ai.js');
const AI = globalThis.BladefallAI;

const platform = (x, y, w = 180, extra = {}) => ({ type: 'plat', x, y, w, h: 20, ...extra });

test('platform graph distinguishes walk, jump, and drop connections', () => {
  const graph = AI.buildPlatformGraph([
    platform(0, 0, 200),
    platform(210, 0, 180),
    platform(430, 120, 160),
    platform(430, -220, 160),
  ]);
  const types = graph.edges.flat().map((edge) => edge.type);
  assert.ok(types.includes('walk'));
  assert.ok(types.includes('jump'));
  assert.ok(types.includes('drop'));
});

test('solid walls prevent navigation and line-of-sight through a connection', () => {
  const objects = [
    platform(0, 0, 180),
    platform(300, 0, 180),
    { type: 'wall', x: 150, y: 180, h: 180, w: 30 },
  ];
  const graph = AI.buildPlatformGraph(objects);
  assert.equal(graph.edges[0].some((edge) => edge.to === 1), false);
  assert.equal(AI.lineOfSight({ x: 0, y: 0, h: 40 }, { x: 300, y: 0, h: 40 }, objects), false);
});

test('portal edges make disconnected platforms reachable and respect one-way pairs', () => {
  const graph = AI.buildPlatformGraph([
    platform(0, 0, 180),
    platform(1000, 0, 180),
  ]);
  const a = { x: 0, y: 0, nx: 0, ny: 1 };
  const b = { x: 1000, y: 0, nx: 0, ny: 1 };
  const forward = AI.shortestPath(graph, graph.nodes[0], graph.nodes[1], [[a, b, '#a', '#b', true]]);
  const reverse = AI.shortestPath(graph, graph.nodes[1], graph.nodes[0], [[a, b, '#a', '#b', true]]);
  assert.equal(forward.edges[0].type, 'portal');
  assert.equal(reverse, null);
});

test('navigation intent waits for a takeoff and then requests a grounded jump', () => {
  const graph = AI.buildPlatformGraph([
    platform(0, 0, 180),
    platform(260, 100, 180),
  ]);
  const far = AI.navigationIntent(graph, { x: 0, y: 0, vy: 0, kind: 'walk' }, { x: 260, y: 100 }, [], {});
  assert.equal(far.action, 'jump');
  assert.equal(far.jump, false);
  const ready = AI.navigationIntent(
    graph,
    { x: far.waypoint.x, y: 0, vy: 0, kind: 'walk' },
    { x: 260, y: 100 },
    [],
    {},
  );
  assert.equal(ready.jump, true);
  assert.ok(ready.jumpVelocity > 500);
});

test('utility abilities honor range, line-of-sight, attack tokens, and cooldowns', () => {
  const hound = { type: 'rifthound' };
  assert.equal(AI.chooseAbility(hound, { distance: 240, canAttack: true }).id, 'charge');
  assert.equal(AI.chooseAbility(hound, { distance: 240, canAttack: false }), null);

  const caster = { type: 'sporecaster', ranged: true };
  assert.equal(AI.chooseAbility(caster, { distance: 450, canAttack: true, lineOfSight: false }), null);
  const shot = AI.chooseAbility(caster, { distance: 450, canAttack: true, lineOfSight: true });
  assert.equal(shot.id, 'shoot');
  AI.beginAbility(caster, shot, { target: { x: 400, y: 0 }, direction: 1 });
  assert.equal(AI.chooseAbility(caster, { distance: 450, canAttack: true, lineOfSight: true }), null);
});

test('ability lifecycle emits a deterministic windup followed by one execution', () => {
  const enemy = { type: 'shadeling' };
  const ability = AI.ABILITIES.blink;
  assert.equal(AI.beginAbility(enemy, ability, { target: { x: 100, y: 0 }, direction: 1 }), true);
  const warning = AI.stepAbility(enemy, 0.1);
  assert.equal(warning.phase, 'windup');
  const execute = AI.stepAbility(enemy, 0.25);
  assert.equal(execute.phase, 'execute');
  assert.equal(execute.id, 'blink');
  assert.equal(AI.stepAbility(enemy, 0.1), null);
});

test('encounter director caps pressure, spaces roles, and budgets attack tokens', () => {
  const director = AI.createEncounterDirector();
  const target = { x: 500, y: 0 };
  const enemies = Array.from({ length: 9 }, (_, index) => ({
    type: index < 4 ? 'sporecaster' : 'grunt',
    ranged: index < 4,
    x: 100 + index * 70,
    y: 0,
    spawnX: 100 + index * 70,
    active: true,
    aiId: index + 1,
  }));
  director.beginFrame(enemies, [{ id: 'player', entity: target }], { viewport: 1280, stage: 4 });
  const diagnostics = director.diagnostics();
  assert.equal(diagnostics.engaged, 5);
  assert.ok(diagnostics.meleeTokens <= 2);
  assert.ok(diagnostics.rangedTokens <= 2);
  assert.equal(enemies.filter((enemy) => director.directive(enemy).attack).length,
    diagnostics.meleeTokens + diagnostics.rangedTokens);
  const engaged = enemies.filter((enemy) => director.directive(enemy).engage);
  assert.notEqual(director.directive(engaged[0]).slotX, director.directive(engaged[1]).slotX);
});

test('target selection has stable tie-breaking and target hysteresis', () => {
  const enemy = { x: 0, y: 0 };
  const candidates = [
    { id: 'guest', entity: { x: 100, y: 0 } },
    { id: 'host', entity: { x: -100, y: 0 } },
  ];
  assert.equal(AI.selectTarget(enemy, candidates).id, 'guest');
  assert.equal(AI.selectTarget(enemy, candidates, 'host').id, 'host');
});

test('AI controller reports graph, planning, decision, and encounter diagnostics', () => {
  const ai = AI.createAI();
  const enemy = {
    type: 'rifthound', kind: 'walk', x: 0, y: 0, vy: 0, spawnX: 0, active: true, aiId: 1,
  };
  const target = { x: 260, y: 100 };
  ai.beginFrame([enemy], [{ id: 'player', entity: target }], [
    platform(0, 0, 180), platform(260, 100, 180),
  ], [], { viewport: 1000, stage: 1 });
  assert.equal(ai.plan(enemy, target, {}).action, 'jump');
  assert.equal(ai.decide(enemy, { distance: 240, canAttack: true }).id, 'charge');
  const diagnostics = ai.diagnostics();
  assert.equal(diagnostics.platforms, 2);
  assert.equal(diagnostics.plans, 1);
  assert.equal(diagnostics.decisions, 1);
  assert.equal(diagnostics.encounter.engaged, 1);
});
