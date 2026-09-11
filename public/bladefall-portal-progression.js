(function installBladefallPortalProgression(root) {
  'use strict';

  const SCHEMA = 'bladefall.progressive-portals';
  const VERSION = 1;
  const capabilities = root.BladefallCapabilities;
  if (!capabilities) throw new Error('BladefallPortalProgression requires BladefallCapabilities');

  const MODES = Object.freeze(['none', 'fixed', 'single', 'pair']);
  const PAIR_KINDS = Object.freeze(['fixed', 'anchored', 'personal']);

  function profile(raw) {
    const single = capabilities.has(raw, 'portal-single');
    const pair = capabilities.has(raw, 'portal-pair');
    return Object.freeze({
      ownsSingle: single,
      ownsPair: pair,
      mode: pair ? 'pair' : single ? 'single' : 'none',
      maxPlayerMouths: pair ? 2 : single ? 1 : 0,
      mayUseAuthoredFixedLessons: true,
      mayUseAnchoredPairs: single,
      mayUsePersonalPairs: pair,
    });
  }

  function placementPlan(raw, context) {
    const state = profile(raw);
    const ctx = context && typeof context === 'object' ? context : {};
    const mouthCount = Math.max(0, Math.floor(Number(ctx.mouthCount) || 0));
    if (!state.ownsSingle) return Object.freeze({
      allowed: false,
      reason: 'portal-memory-locked',
      feedback: 'THE SLATE HOLDS NO MEMORY',
      mode: 'none',
      maxMouths: 0,
      action: 'reject',
    });
    if (ctx.anchorPresent) return Object.freeze({
      allowed: true,
      reason: 'fixed-counterpart-ready',
      mode: 'single',
      maxMouths: 1,
      action: mouthCount ? 'replace' : 'add',
    });
    if (!state.ownsPair) return Object.freeze({
      allowed: false,
      reason: 'fixed-counterpart-required',
      feedback: 'ONE MOUTH NEEDS A FIXED COUNTERPART',
      mode: 'single',
      maxMouths: 1,
      action: 'reject',
    });
    return Object.freeze({
      allowed: true,
      reason: 'personal-pair-ready',
      mode: 'pair',
      maxMouths: 2,
      action: mouthCount >= 2 ? 'clear' : 'add',
    });
  }

  function pairEligibility(raw, kind, context) {
    const state = profile(raw);
    const ctx = context && typeof context === 'object' ? context : {};
    if (!PAIR_KINDS.includes(kind)) return Object.freeze({ allowed: false, reason: 'unknown-pair-kind', kind });
    if (kind === 'fixed') {
      if (ctx.authoredLesson !== true) return Object.freeze({ allowed: false, reason: 'unmarked-fixed-pair', kind });
      return Object.freeze({ allowed: true, reason: 'authored-fixed-lesson', kind });
    }
    if (kind === 'anchored') return Object.freeze({
      allowed: state.mayUseAnchoredPairs && ctx.anchorPresent !== false,
      reason: !state.mayUseAnchoredPairs ? 'portal-single-locked' : ctx.anchorPresent === false ? 'anchor-missing' : 'anchored-ready',
      kind,
    });
    return Object.freeze({
      allowed: state.mayUsePersonalPairs,
      reason: state.mayUsePersonalPairs ? 'personal-ready' : 'portal-pair-locked',
      kind,
    });
  }

  function sanitizeMouths(raw, mouths, context) {
    const input = Array.isArray(mouths) ? mouths : [];
    const plan = placementPlan(raw, { ...(context || {}), mouthCount: input.length });
    let kept;
    if (!profile(raw).ownsSingle) kept = [];
    else if (context && context.anchorPresent) kept = input.slice(0, 1);
    else if (profile(raw).ownsPair) kept = input.slice(0, 2);
    else kept = [];
    return Object.freeze({
      changed: kept.length !== input.length,
      removed: input.length - kept.length,
      mouths: Object.freeze(kept),
      plan,
    });
  }

  function fixedLessonPair(a, b, options) {
    const settings = options && typeof options === 'object' ? options : {};
    if (!a || !b) return null;
    return Object.freeze({
      id: String(settings.id || `fixed:${a.pg || a.x}:${b.pg || b.x}`),
      a,
      b,
      colors: Object.freeze(settings.colors || [a.col || '#b06bff', b.col || a.col || '#b06bff']),
      oneWay: !!settings.oneWay,
      mode: settings.mode || a.transformMode || b.transformMode || 'normal',
      kind: 'fixed',
      authoredLesson: true,
    });
  }

  function createController() {
    let counters = { placements: 0, replacements: 0, clears: 0, blocked: 0, fixedTransits: 0, anchoredTransits: 0, personalTransits: 0 };
    let last = null;
    // Private state participates in opt-in TAS branching.
    root.BladefallHarness?.register("portal-progression:createController", () => ({ counters, last }),
      state => ({ counters, last } = state));
    function recordPlacement(plan) {
      if (!plan || !plan.allowed) counters.blocked++;
      else if (plan.action === 'replace') counters.replacements++;
      else if (plan.action === 'clear') counters.clears++;
      else counters.placements++;
      last = plan ? Object.freeze({ type: 'placement', mode: plan.mode, action: plan.action, reason: plan.reason }) : null;
      return plan;
    }
    function recordClear(reason) {
      counters.clears++;
      last = Object.freeze({ type: 'clear', reason: String(reason || 'manual') });
    }
    function recordTransit(kind, actor) {
      const key = kind === 'fixed' ? 'fixedTransits' : kind === 'anchored' ? 'anchoredTransits' : 'personalTransits';
      counters[key]++;
      last = Object.freeze({ type: 'transit', kind, actor: String(actor || 'entity') });
    }
    function diagnostics() {
      return Object.freeze({ ...counters, last });
    }
    return Object.freeze({ recordPlacement, recordClear, recordTransit, diagnostics });
  }

  function validate() {
    const errors = [];
    const fresh = profile(capabilities.freshState());
    if (fresh.mode !== 'none' || fresh.maxPlayerMouths !== 0) errors.push('fresh campaign must not own a portal mouth');
    const single = capabilities.createState({ acquired: ['jump', 'weapon', 'dash', 'portal-single'] });
    const pair = capabilities.createState({ acquired: ['jump', 'weapon', 'dash', 'portal-single', 'portal-pair'] });
    if (profile(single).maxPlayerMouths !== 1 || profile(single).mayUsePersonalPairs) errors.push('single memory must require an anchor');
    if (profile(pair).maxPlayerMouths !== 2 || !profile(pair).mayUsePersonalPairs) errors.push('pair memory must own both mouths');
    if (placementPlan(single, { anchorPresent: false }).allowed) errors.push('single memory placed without a counterpart');
    if (!pairEligibility(fresh, 'fixed', { authoredLesson: true }).allowed) errors.push('authored fixed lesson must remain usable before ownership');
    if (pairEligibility(fresh, 'fixed', { authoredLesson: false }).allowed) errors.push('unmarked fixed pair bypassed authoring contract');
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), modes: MODES.length, pairKinds: PAIR_KINDS.length });
  }

  root.BladefallPortalProgression = Object.freeze({
    SCHEMA,
    VERSION,
    MODES,
    PAIR_KINDS,
    profile,
    placementPlan,
    pairEligibility,
    sanitizeMouths,
    fixedLessonPair,
    createController,
    validate,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
