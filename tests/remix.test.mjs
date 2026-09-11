import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-remix.js');
const Remix = globalThis.BladefallRemix;

test('remix catalog covers every stage with valid distinct laws', () => {
  const report = Remix.validateCatalog();
  assert.equal(report.ok, true);
  assert.equal(report.stages, 16);
  assert.equal(report.rules, 7);
  assert.equal(new Set(Remix.STAGES.map((stage) => stage.title)).size, 16);
});

test('NG+2 preserves the first remix law and layers a second', () => {
  for (let stage = 0; stage < 16; stage++) {
    const first = Remix.contractFor(stage, 1);
    const second = Remix.contractFor(stage, 2);
    assert.equal(first.laws.length, 1);
    assert.equal(second.laws.length, 2);
    assert.equal(second.laws[0].id, first.laws[0].id);
    assert.notEqual(second.laws[0].id, second.laws[1].id);
  }
  assert.equal(Remix.contractFor(0, 0), null);
  assert.equal(Remix.contractFor(99, 2), null);
});

test('remix director gates events by active law and deterministic cooldown', () => {
  const director = Remix.createDirector();
  director.begin(0, 2);
  assert.equal(director.has('resonance'), true);
  assert.equal(director.has('rift-renewal'), true);
  assert.equal(director.has('hazard-tide'), false);
  assert.equal(director.trigger('rift-renewal', 'portal', 10, 2.5), true);
  assert.equal(director.trigger('rift-renewal', 'portal', 11, 2.5), false);
  assert.equal(director.trigger('rift-renewal', 'portal', 12.5, 2.5), true);
  assert.equal(director.diagnostics().counts['rift-renewal'], 2);
});
