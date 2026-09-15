import test from 'node:test';
import assert from 'node:assert/strict';

import { buildBaseline } from '../scripts/baseline-audit.mjs';

test('A1 baseline inventories the complete campaign and canonical deploy mirror', async () => {
  const report = await buildBaseline();

  assert.equal(report.schema, 'bladefall.a1-structural-baseline');
  assert.equal(report.game.stageCount, 16);
  assert.deepEqual(report.ownership.stageSources, {
    custom: 10,
    procedural: 4,
    bonus: 1,
    secret: 1,
  });
  assert.equal(report.ownership.canonicalSource, 'public');
  assert.equal(report.ownership.mirrorParity.ok, true);
  assert.ok(report.ownership.mirrorParity.checked >= 20);
  assert.equal(report.baseline.captureVersion, '7.8.0');
  assert.equal(report.baseline.scope, 'archived-pre-reimagining');
});

test('A1 baseline retains historical debt while recognizing F08 geometry remediations', async () => {
  const report = await buildBaseline();
  const risks = new Map(report.risks.map((risk) => [risk.id, risk]));

  assert.equal(risks.get('fluid-showcase-surface-placement').detected, false);
  assert.equal(risks.get('automatic-environment-composition').detected, false);
  assert.equal(risks.get('detached-blueprint-geometry').detected, true);
  assert.equal(risks.get('dynamic-route-proof-gap').detected, true);
  assert.equal(risks.get('interactive-evidence-incomplete').detected, true);
  assert.equal(risks.get('interactive-evidence-incomplete').severity, 'blocking');
  assert.equal(report.completion.structuralInventory, 'complete');
  assert.ok(['complete', 'pending'].includes(report.completion.visualAtlas));
  assert.ok(['complete', 'pending'].includes(report.completion.entranceLocomotionProbes));
  assert.ok(['complete', 'pending'].includes(report.completion.targetedDynamicProbeSet));
  assert.ok(['complete', 'pending'].includes(report.completion.targetedBossResetProbes));
  assert.ok(['complete', 'pending'].includes(report.completion.openingRouteAttemptSet));
  assert.ok(['partial', 'pending'].includes(report.completion.dynamicRoomRecordings));
  assert.equal(
    risks.get('visual-capture-incomplete').detected,
    report.completion.visualAtlas === 'pending',
  );
  assert.equal(report.completion.a1Status, 'open');
});

test('A1 records opening route attempts without treating automation as human review', async () => {
  const report = await buildBaseline();

  assert.equal(report.completion.openingRouteAttemptSet, 'complete');
  assert.equal(report.openingRouteEvidence.capturedStages, 4);
  assert.equal(report.openingRouteEvidence.coverage.stageTransitions, 0);
  assert.equal(report.openingRouteEvidence.coverage.humanIntendedRoute, 'pending');
  assert.equal(report.openingRouteEvidence.currentVersionMatched, false);
  assert.equal(report.completion.humanRouteReviews, 'pending');
  assert.equal(report.completion.a1Status, 'open');
});

test('A1 records forced boss phases and resets without claiming victories', async () => {
  const report = await buildBaseline();

  assert.equal(report.completion.targetedBossResetProbes, 'complete');
  assert.equal(report.bossEvidence.capturedBosses, 7);
  assert.equal(report.bossEvidence.coverage.forcedPhaseResponse, 'complete');
  assert.equal(report.bossEvidence.coverage.syntheticDeathRestart, 'complete');
  assert.equal(report.bossEvidence.coverage.victories, 'pending');
  assert.equal(report.completion.bossRecordings, 'partial');
  assert.equal(report.completion.naturalBossVictories, 'pending');
  assert.equal(report.completion.a1Status, 'open');
});

test('A1 records targeted mechanics without upgrading them to natural route proof', async () => {
  const report = await buildBaseline();

  assert.equal(report.completion.targetedDynamicProbeSet, 'complete');
  assert.equal(report.dynamicEvidence.capturedProbes, 8);
  assert.equal(
    report.dynamicEvidence.coverage.portalAnchorLowSpeedAttempt,
    'activation-observed-transit-unproven',
  );
  assert.equal(
    report.dynamicEvidence.coverage.portalAnchorSpeedGate,
    'state-positioned-high-speed-transit-observed',
  );
  assert.equal(report.completion.dynamicRoomRecordings, 'partial');
  assert.equal(report.completion.a1Status, 'open');
});

test('A1 recognizes entrance probes without confusing them with route completion', async () => {
  const report = await buildBaseline();

  assert.equal(report.completion.entranceLocomotionProbes, 'complete');
  assert.equal(report.completion.dynamicRoomRecordings, 'partial');
  assert.equal(report.interactiveEvidence.capturedStages, 16);
  assert.equal(report.interactiveEvidence.coverage.intendedRoute, 'pending');
  assert.equal(report.interactiveEvidence.coverage.twoPlayerRouteAndTransition, 'pending');
  assert.equal(report.completion.a1Status, 'open');
});

test('every stage has a room-by-room visual and playthrough evidence plan', async () => {
  const report = await buildBaseline();

  for (const stage of report.stages) {
    assert.equal(stage.evidence.status, 'pending-visual-capture', stage.id);
    assert.equal(stage.evidence.stills[0].id, 'entrance', stage.id);
    assert.equal(stage.evidence.stills.at(-1).id, 'exit', stage.id);
    assert.ok(stage.evidence.stills.length >= stage.acts.length + 2, stage.id);
    assert.ok(stage.evidence.playthroughs.includes('credible speedrun route'), stage.id);
    assert.ok(stage.evidence.playthroughs.includes('two-player route and transition'), stage.id);
  }
});
