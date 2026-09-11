import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

await import('../public/bladefall-progression.js');
await import('../public/bladefall-capabilities.js');
await import('../public/bladefall-portal-progression.js');
const Capabilities = globalThis.BladefallCapabilities;
const Portals = globalThis.BladefallPortalProgression;

const single = Capabilities.createState({ acquired: ['jump', 'weapon', 'dash', 'portal-single'] });
const pair = Capabilities.createState({ acquired: ['jump', 'weapon', 'dash', 'portal-single', 'portal-pair'] });

test('N08 portal progression validates and fresh campaigns own no mouths', () => {
  assert.deepEqual(Portals.validate(), { ok: true, errors: [], modes: 4, pairKinds: 3 });
  assert.deepEqual(Portals.profile(Capabilities.freshState()), {
    ownsSingle: false, ownsPair: false, mode: 'none', maxPlayerMouths: 0,
    mayUseAuthoredFixedLessons: true, mayUseAnchoredPairs: false, mayUsePersonalPairs: false,
  });
});

test('first memory owns one anchored mouth and second memory owns a pair', () => {
  assert.deepEqual(Portals.profile(single), {
    ownsSingle: true, ownsPair: false, mode: 'single', maxPlayerMouths: 1,
    mayUseAuthoredFixedLessons: true, mayUseAnchoredPairs: true, mayUsePersonalPairs: false,
  });
  assert.equal(Portals.profile(pair).mode, 'pair');
  assert.equal(Portals.profile(pair).maxPlayerMouths, 2);
  assert.equal(Portals.profile(pair).mayUsePersonalPairs, true);
});

test('placement plans enforce none, anchored replacement, and pair cycling', () => {
  assert.deepEqual(Portals.placementPlan(Capabilities.freshState(), { anchorPresent: true, mouthCount: 0 }), {
    allowed: false, reason: 'portal-memory-locked', feedback: 'THE SLATE HOLDS NO MEMORY', mode: 'none', maxMouths: 0, action: 'reject',
  });
  assert.equal(Portals.placementPlan(single, { anchorPresent: false }).reason, 'fixed-counterpart-required');
  assert.equal(Portals.placementPlan(single, { anchorPresent: true, mouthCount: 0 }).action, 'add');
  assert.equal(Portals.placementPlan(single, { anchorPresent: true, mouthCount: 1 }).action, 'replace');
  assert.equal(Portals.placementPlan(pair, { anchorPresent: false, mouthCount: 0 }).action, 'add');
  assert.equal(Portals.placementPlan(pair, { anchorPresent: false, mouthCount: 1 }).action, 'add');
  assert.equal(Portals.placementPlan(pair, { anchorPresent: false, mouthCount: 2 }).action, 'clear');
  assert.equal(Portals.placementPlan(pair, { anchorPresent: true, mouthCount: 1 }).mode, 'single');
});

test('only explicitly authored fixed lessons bypass permanent ownership', () => {
  const fresh = Capabilities.freshState();
  assert.deepEqual(Portals.pairEligibility(fresh, 'fixed', { authoredLesson: true }), {
    allowed: true, reason: 'authored-fixed-lesson', kind: 'fixed',
  });
  assert.equal(Portals.pairEligibility(fresh, 'fixed', { authoredLesson: false }).reason, 'unmarked-fixed-pair');
  assert.equal(Portals.pairEligibility(fresh, 'anchored').reason, 'portal-single-locked');
  assert.equal(Portals.pairEligibility(single, 'anchored', { anchorPresent: true }).allowed, true);
  assert.equal(Portals.pairEligibility(single, 'personal').reason, 'portal-pair-locked');
  assert.equal(Portals.pairEligibility(pair, 'personal').allowed, true);
});

test('mouth sanitation removes stale pairs at capability boundaries', () => {
  const mouths = [{ id: 'blue' }, { id: 'orange' }, { id: 'bad-third' }];
  assert.deepEqual(Portals.sanitizeMouths(Capabilities.freshState(), mouths).mouths, []);
  assert.deepEqual(Portals.sanitizeMouths(single, mouths, { anchorPresent: false }).mouths, []);
  assert.deepEqual(Portals.sanitizeMouths(single, mouths, { anchorPresent: true }).mouths, [mouths[0]]);
  assert.deepEqual(Portals.sanitizeMouths(pair, mouths, { anchorPresent: false }).mouths, mouths.slice(0, 2));
});

test('fixed lesson pairs retain explicit transport identity', () => {
  const a = { x: 10, y: 0, nx: 0, ny: 1, pg: 'lesson' };
  const b = { x: 90, y: 80, nx: 1, ny: 0, pg: 'lesson' };
  const fixed = Portals.fixedLessonPair(a, b, { id: 'lesson-one', oneWay: true });
  assert.equal(fixed.id, 'lesson-one');
  assert.equal(fixed.a, a);
  assert.equal(fixed.b, b);
  assert.equal(fixed.kind, 'fixed');
  assert.equal(fixed.authoredLesson, true);
  assert.equal(fixed.oneWay, true);
  assert.ok(Object.isFrozen(fixed));
});

test('controller diagnostics distinguish placement lifecycle and transit modes', () => {
  const controller = Portals.createController();
  controller.recordPlacement(Portals.placementPlan(Capabilities.freshState(), {}));
  controller.recordPlacement(Portals.placementPlan(single, { anchorPresent: true, mouthCount: 0 }));
  controller.recordPlacement(Portals.placementPlan(single, { anchorPresent: true, mouthCount: 1 }));
  controller.recordClear('manual');
  controller.recordTransit('fixed', 'player');
  controller.recordTransit('anchored', 'crate');
  controller.recordTransit('personal', 'projectile');
  assert.deepEqual(controller.diagnostics(), {
    placements: 1, replacements: 1, clears: 1, blocked: 1,
    fixedTransits: 1, anchoredTransits: 1, personalTransits: 1,
    last: { type: 'transit', kind: 'personal', actor: 'projectile' },
  });
});

test('runtime classifies and gates placement, pairs, transit consumers, UI, and cleanup', async () => {
  const source = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.match(source, /function FixedPortal\(x,y,group,dir,o\)/);
  assert.match(source, /BFPortalProgressionModule\.placementPlan\(activeCapabilityProgress\(\)/);
  assert.match(source, /ownership\.mayUsePersonalPairs&&G\.cratePortals/);
  assert.match(source, /ownership\.mayUseAnchoredPairs&&m\.length===1/);
  assert.match(source, /mouths\.every\(mouth=>mouth\.portalLesson==='fixed'/);
  assert.match(source, /BFPortalProgression\.recordTransit\(pairKind,kind\)/);
  assert.match(source, /syncPortalCapabilities\(\)/);
  assert.match(source, /DORMANT SLATE MEMORY/);
  assert.match(source, /FIXED COUNTERPART/);
  assert.match(source, /portalBtn\.classList\.toggle\('ability-locked',!canPlacePortal\)/);
});
