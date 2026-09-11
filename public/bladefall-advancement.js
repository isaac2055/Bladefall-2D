(function installBladefallAdvancement(root) {
  'use strict';

  const SCHEMA = 'bladefall.authored-advancement';
  const VERSION = 1;
  const FRAGMENTS_PER_KNOT = 4;
  const MAX_VITALITY_KNOTS = 5;
  const HP_PER_KNOT = 15;
  const MAX_FORGE_SEALS = 24;
  const MAX_RESONANCE_DUST = 30;
  const MAX_WOVEN_KNOTS = 2;
  const RESONANCE_COST = 5;

  const REWARDS = Object.freeze({
    'boss:brute': Object.freeze({ forgeSeals: 1 }),
    'boss:archer': Object.freeze({ vitalityFragments: 1, forgeSeals: 1 }),
    'boss:warden': Object.freeze({ vitalityFragments: 1, forgeSeals: 1 }),
    'boss:sorcerer': Object.freeze({ vitalityFragments: 1, resonanceDust: 2 }),
    'boss:colossus': Object.freeze({ vitalityFragments: 1, forgeSeals: 2 }),
    'boss:tyrant': Object.freeze({ vitalityFragments: 2, resonanceDust: 2 }),
    'boss:king': Object.freeze({ vitalityFragments: 2, forgeSeals: 2 }),
    'quest:road-without-a-name': Object.freeze({ vitalityFragments: 1 }),
    'quest:kindling-the-sky': Object.freeze({ resonanceDust: 2 }),
    'quest:couriers-proof': Object.freeze({ vitalityFragments: 1 }),
    'quest:inventory-of-effects': Object.freeze({ resonanceDust: 2 }),
    'quest:release-the-causeway': Object.freeze({ forgeSeals: 1 }),
  });

  function record(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  function bounded(value, max) { return Math.max(0, Math.min(max, Math.floor(Number(value) || 0))); }
  function sourceIds(values) {
    return [...new Set((Array.isArray(values) ? values : []).map(String))]
      .filter((id) => /^(boss|quest|secret|legacy|authored):[a-z0-9-]+$/.test(id)).slice(-64);
  }

  function createState(raw) {
    const source = record(raw);
    const vitalityKnots = bounded(source.vitalityKnots, MAX_VITALITY_KNOTS);
    return {
      schema: SCHEMA,
      version: VERSION,
      vitalityFragments: bounded(source.vitalityFragments, FRAGMENTS_PER_KNOT - 1),
      vitalityKnots,
      forgeSeals: bounded(source.forgeSeals, MAX_FORGE_SEALS),
      resonanceDust: bounded(source.resonanceDust, MAX_RESONANCE_DUST),
      wovenKnots: bounded(source.wovenKnots, MAX_WOVEN_KNOTS),
      claimedLegacy: source.claimedLegacy === true,
      sources: sourceIds(source.sources),
      revision: Math.max(0, Math.floor(Number(source.revision) || 0)),
    };
  }

  function migrate(raw) {
    const state = createState(raw), recognized = !!raw && raw.schema === SCHEMA && raw.version === VERSION;
    return Object.freeze({ state, receipt: Object.freeze({
      from: raw && raw.version || 0, to: VERSION,
      changed: !recognized || JSON.stringify(raw) !== JSON.stringify(state),
    }) });
  }

  function addBundle(raw, bundle, sourceId) {
    const state = createState(raw), gain = record(bundle), source = String(sourceId || '');
    if (!/^(boss|quest|secret|legacy|authored):[a-z0-9-]+$/.test(source))
      return Object.freeze({ ok: false, changed: false, reason: 'authored-source-required', state });
    if (state.sources.includes(source)) return Object.freeze({ ok: true, changed: false, reason: 'already-claimed', state });
    const totalFragments = state.vitalityFragments + bounded(gain.vitalityFragments, MAX_VITALITY_KNOTS * FRAGMENTS_PER_KNOT);
    const room = MAX_VITALITY_KNOTS - state.vitalityKnots;
    const newKnots = Math.min(room, Math.floor(totalFragments / FRAGMENTS_PER_KNOT));
    state.vitalityKnots += newKnots;
    state.vitalityFragments = state.vitalityKnots >= MAX_VITALITY_KNOTS ? 0 : totalFragments % FRAGMENTS_PER_KNOT;
    state.forgeSeals = bounded(state.forgeSeals + bounded(gain.forgeSeals, MAX_FORGE_SEALS), MAX_FORGE_SEALS);
    state.resonanceDust = bounded(state.resonanceDust + bounded(gain.resonanceDust, MAX_RESONANCE_DUST), MAX_RESONANCE_DUST);
    state.sources.push(source);state.revision++;
    return Object.freeze({ ok: true, changed: true, reason: 'advancement-granted', state,
      gained: Object.freeze({ vitalityFragments: bounded(gain.vitalityFragments, 20), forgeSeals: bounded(gain.forgeSeals, 24), resonanceDust: bounded(gain.resonanceDust, 30), vitalityKnots: newKnots }) });
  }

  function rewardKey(event) {
    const packet = record(event);
    if (packet.type === 'boss:defeated') return `boss:${String(packet.boss || '')}`;
    if (packet.type === 'quest:completed') return `quest:${String(packet.questId || '')}`;
    return '';
  }

  function applyRewardEvent(raw, event) {
    const key = rewardKey(event), reward = REWARDS[key];
    if (!reward) return Object.freeze({ ok: false, changed: false, reason: 'no-authored-reward', state: createState(raw) });
    return addBundle(raw, reward, key);
  }

  function claimLegacy(raw, credit) {
    const state = createState(raw), legacy = record(credit);
    if (state.claimedLegacy || legacy.claimed === true)
      return Object.freeze({ ok: true, changed: false, reason: 'already-claimed', state });
    const fragments = bounded(legacy.healthShards, MAX_VITALITY_KNOTS * FRAGMENTS_PER_KNOT);
    const result = addBundle(state, {
      vitalityFragments: fragments,
      forgeSeals: bounded(legacy.forgeMarks, MAX_FORGE_SEALS),
      resonanceDust: bounded(legacy.echoDust, MAX_RESONANCE_DUST),
    }, 'legacy:random-training');
    result.state.claimedLegacy = true;
    return Object.freeze({ ...result, state: createState(result.state) });
  }

  function vitalityBonus(raw) { return createState(raw).vitalityKnots * HP_PER_KNOT; }

  function sealPlan(raw, amount) {
    const state = createState(raw), cost = bounded(amount, MAX_FORGE_SEALS);
    return Object.freeze({ allowed: state.forgeSeals >= cost, cost, available: state.forgeSeals,
      missing: Math.max(0, cost - state.forgeSeals), state });
  }

  function spendSeals(raw, amount) {
    const plan = sealPlan(raw, amount);
    if (!plan.allowed) return Object.freeze({ ok: false, reason: 'forge-seal-required', state: plan.state, plan });
    const state = createState(plan.state);state.forgeSeals -= plan.cost;state.revision++;
    return Object.freeze({ ok: true, reason: 'forge-seals-spent', state, plan });
  }

  function forgeSealCost(kind, nextRank) {
    const rank = Math.max(1, Math.floor(Number(nextRank) || 1));
    if (kind === 'weapon-temper' || kind === 'armor-reinforce') return rank >= 3 ? 2 : 1;
    if (kind === 'tool-calibrate') return 1;
    if (kind === 'weapon-ascend' || kind === 'armor-ascend') return Math.min(3, Math.max(1, rank));
    return 0;
  }

  function weavePlan(raw) {
    const state = createState(raw);
    const reason = state.wovenKnots >= MAX_WOVEN_KNOTS ? 'woven-knot-maxed'
      : state.resonanceDust < RESONANCE_COST ? 'resonance-dust-required' : 'weave-ready';
    return Object.freeze({ allowed: reason === 'weave-ready', reason, cost: RESONANCE_COST,
      available: state.resonanceDust, nextKnot: state.wovenKnots + 1, state });
  }

  function weave(raw) {
    const plan = weavePlan(raw);
    if (!plan.allowed) return Object.freeze({ ok: false, changed: false, reason: plan.reason, state: plan.state, plan });
    const state = createState(plan.state);state.resonanceDust -= RESONANCE_COST;state.wovenKnots++;state.revision++;
    return Object.freeze({ ok: true, changed: true, reason: 'resonance-woven', state, plan,
      capacityKnot: `woven-resonance-${state.wovenKnots}` });
  }

  function profile(raw) {
    const state = createState(raw);
    return Object.freeze({ ...state, maxHpBonus: vitalityBonus(state), nextVitality: state.vitalityKnots >= MAX_VITALITY_KNOTS ? null : `${state.vitalityFragments}/${FRAGMENTS_PER_KNOT}`,
      weave: weavePlan(state) });
  }

  function validate() {
    const errors = [];
    let state = createState();
    state = addBundle(state, { vitalityFragments: 5, forgeSeals: 2, resonanceDust: 5 }, 'authored:test').state;
    if (state.vitalityKnots !== 1 || state.vitalityFragments !== 1 || vitalityBonus(state) !== HP_PER_KNOT) errors.push('vitality fragments must bind deterministically');
    if (!sealPlan(state, 2).allowed || spendSeals(state, 2).state.forgeSeals !== 0) errors.push('forge seals must be atomic');
    const woven = weave(state);if (!woven.ok || woven.state.wovenKnots !== 1 || woven.state.resonanceDust !== 0) errors.push('resonance weaving must be bounded');
    if (addBundle(state, {}, 'authored:test').changed) errors.push('authored rewards must be idempotent');
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), rewards: Object.keys(REWARDS).length,
      maxVitalityKnots: MAX_VITALITY_KNOTS, maxWovenKnots: MAX_WOVEN_KNOTS });
  }

  root.BladefallAdvancement = Object.freeze({
    SCHEMA, VERSION, FRAGMENTS_PER_KNOT, MAX_VITALITY_KNOTS, HP_PER_KNOT,
    MAX_FORGE_SEALS, MAX_RESONANCE_DUST, MAX_WOVEN_KNOTS, RESONANCE_COST,
    REWARDS, createState, migrate, addBundle, applyRewardEvent, claimLegacy,
    vitalityBonus, sealPlan, spendSeals, forgeSealCost, weavePlan, weave, profile, validate,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
