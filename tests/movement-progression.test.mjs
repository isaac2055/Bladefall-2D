import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

await import('../public/bladefall-progression.js');
await import('../public/bladefall-capabilities.js');
await import('../public/bladefall-movement-progression.js');
const Capabilities = globalThis.BladefallCapabilities;
const Movement = globalThis.BladefallMovementProgression;

const through = (zone) => Capabilities.createState({ acquired: globalThis.BladefallProgression.capabilitiesThrough(zone) });

test('N07 movement authority validates and a fresh knight has one jump only', () => {
  assert.deepEqual(Movement.validate(), { ok: true, errors: [], actions: 6, startingJumps: 1 });
  assert.deepEqual(Movement.profile(Capabilities.freshState()), {
    jump: true, dash: false, wallJump: false, doubleJump: false,
    downwardStrike: false, gravityFlip: false, maxJumps: 1,
    acquired: ['jump'], tuning: Movement.TUNING,
  });
});

test('movement verbs become live at their constitutional milestones', () => {
  const brute = Movement.profile(through('brute'));
  const keep = Movement.profile(through('ruined-keep'));
  const frost = Movement.profile(through('frostfell'));
  const foundry = Movement.profile(through('ember-colossus'));
  const inversion = Movement.profile(through('inversion'));
  assert.equal(brute.dash, true);
  assert.equal(brute.wallJump, false);
  assert.equal(keep.wallJump, true);
  assert.equal(keep.doubleJump, false);
  assert.equal(frost.doubleJump, true);
  assert.equal(frost.maxJumps, 2);
  assert.equal(foundry.downwardStrike, true);
  assert.equal(inversion.gravityFlip, true);
});

test('eligibility names locked capabilities and respects contextual constraints', () => {
  const fresh = Capabilities.freshState();
  assert.deepEqual(Movement.eligibility(fresh, 'dash'), {
    allowed: false, reason: 'capability-locked', action: 'dash', requirement: 'dash', feedback: 'A DASH MEMORY IS MISSING',
  });
  assert.equal(Movement.eligibility(through('ruined-keep'), 'wall-jump', { wallContact: false }).reason, 'no-wall-contact');
  assert.equal(Movement.eligibility(through('ruined-keep'), 'wall-jump', { wallContact: true }).allowed, true);
  assert.equal(Movement.eligibility(through('inversion'), 'gravity-flip', { gravityField: false }).reason, 'no-gravity-field');
  assert.equal(Movement.eligibility(through('inversion'), 'gravity-flip', { gravityField: true }).allowed, true);
});

test('sync strips every legacy movement leak from a fresh player and snapshot', () => {
  const player = {
    maxJumps: 3, jumps: 3, hasSlam: true, slamming: true,
    dodgeTimer: 0.2, dodgeCdT: 0.6, dashBuf: 0.1, wallCoyote: 0.08,
  };
  const receipt = Movement.syncPlayer(player, Capabilities.freshState());
  assert.equal(receipt.changed, true);
  assert.deepEqual(player, {
    maxJumps: 1, jumps: 1, hasSlam: false, slamming: false,
    dodgeTimer: 0, dodgeCdT: 0, dashBuf: 0, wallCoyote: 0,
  });
  assert.ok(receipt.changes.includes('maxJumps'));
  assert.ok(receipt.changes.includes('hasSlam'));
});

test('sync derives later traversal without overwriting unrelated player state', () => {
  const player = { hp: 77, maxJumps: 1, jumps: 1, hasSlam: false, dodgeTimer: 0, dodgeCdT: 0, dashBuf: 0, wallCoyote: 0 };
  const receipt = Movement.syncPlayer(player, through('ember-colossus'));
  assert.equal(player.hp, 77);
  assert.equal(player.maxJumps, 2);
  assert.equal(player.hasSlam, true);
  assert.equal(receipt.profile.dash, true);
  assert.equal(receipt.profile.wallJump, true);
});

test('gravity state is righted when the permanent memory is absent', () => {
  const world = { gravityFlipped: true, unrelated: 9 };
  assert.equal(Movement.syncWorld(world, Capabilities.freshState()).changed, true);
  assert.deepEqual(world, { gravityFlipped: false, unrelated: 9 });
  world.gravityFlipped = true;
  assert.equal(Movement.syncWorld(world, through('inversion')).changed, false);
  assert.equal(world.gravityFlipped, true);
});

test('jump impulses and crystals respect the authorized movement inventory', () => {
  const fresh = Capabilities.freshState();
  const frost = through('frostfell');
  assert.equal(Movement.jumpVelocity(fresh, false), 480);
  assert.equal(Movement.jumpVelocity(fresh, true), 0);
  assert.equal(Movement.jumpVelocity(frost, true), 450);
  assert.deepEqual(Movement.refill(fresh), { jumps: 0, dashReady: false, maxJumps: 1 });
  assert.deepEqual(Movement.refill(frost), { jumps: 0, dashReady: true, maxJumps: 2 });
});

test('runtime consumes movement authority at input, physics, HUD, and snapshot boundaries', async () => {
  const source = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.match(source, /syncMovementCapabilities\(p\)/);
  assert.match(source, /if\(\(movement\.dash\|\|testDash\)&&p\.dashBuf>0/);
  assert.match(source, /movement\.wallJump && !p\.onGround/);
  assert.match(source, /BFMovementProgressionModule\.jumpVelocity\(activeCapabilityProgress\(\),airborne&&!crystalJump\)/);
  assert.match(source, /movement\.downwardStrike && !G\.cartMode/);
  assert.match(source, /G\.flipUnlocked&&movement\.gravityFlip/);
  assert.match(source, /BFMovementProgressionModule\.refill\(meta\.capabilities\)/);
  assert.doesNotMatch(source.match(/function snapOf\(p\)\{[^\n]+/)?.[0] || '', /maxJumps|hasSlam/);
  assert.doesNotMatch(source, /n:'Ground Slam',d:'Press DOWN in air'/);
  assert.match(source, /const PERK_DEFS=\[\]/);
});
