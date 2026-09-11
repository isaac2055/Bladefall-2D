(function installBladefallReactions(root) {
  'use strict';

  const VERSION = 1;
  const ELEMENTS = Object.freeze(['physical', 'fire', 'ice', 'poison', 'arcane', 'void', 'storm', 'holy']);
  const ELEMENT_SET = new Set(ELEMENTS);
  const TARGET_KINDS = Object.freeze(['enemy', 'air', 'fluid', 'surface', 'destructible', 'mechanism', 'projectile']);
  const TARGET_SET = new Set(TARGET_KINDS);

  const AIR = Object.freeze({
    fire: Object.freeze({ id: 'firestream', label: 'WIND IGNITED', duration: 3.4,
      operations: Object.freeze([{ op: 'prime', state: 'burning-air' }, { op: 'burn-dps', value: 11 },
        { op: 'force-multiplier', value: 1.18 }]), color: '#ff7a3a', accent: '#ffd75a' }),
    ice: Object.freeze({ id: 'froststream', label: 'FROST CURRENT', duration: 3.1,
      operations: Object.freeze([{ op: 'prime', state: 'frozen-air' }, { op: 'slow-scale', value: 0.48 },
        { op: 'freeze-after', value: 1.05 }, { op: 'force-multiplier', value: 0.78 }]),
      color: '#7fd6ff', accent: '#effaff' }),
    storm: Object.freeze({ id: 'stormstream', label: 'CHARGED CURRENT', duration: 2.7,
      operations: Object.freeze([{ op: 'prime', state: 'charged-air' }, { op: 'shock-dps', value: 9 },
        { op: 'force-multiplier', value: 1.08 }]), color: '#9fe0ff', accent: '#ffffff' }),
  });

  const FLUID = Object.freeze({
    water: Object.freeze({
      fire: Object.freeze({ id: 'steam', label: 'STEAM BURST', operations: Object.freeze([
        { op: 'extinguish' }, { op: 'steam', duration: 0.45 }, { op: 'impulse', value: 4 },
      ]), color: '#d7f4ff', accent: '#ffffff' }),
      ice: Object.freeze({ id: 'flash-freeze', label: 'WATER FROZEN', operations: Object.freeze([
        { op: 'freeze-fluid', duration: 4.5 }, { op: 'create-surface', material: 'ice', duration: 4.5 },
      ]), color: '#9ee8ff', accent: '#ffffff' }),
      storm: Object.freeze({ id: 'conductive-surge', label: 'CURRENT CONDUCTED', operations: Object.freeze([
        { op: 'charge-fluid', duration: 2.8 }, { op: 'conduct-radius', value: 220 },
      ]), color: '#9fe0ff', accent: '#ffffff' }),
    }),
    lava: Object.freeze({
      ice: Object.freeze({ id: 'obsidian-cool', label: 'OBSIDIAN FORMED', operations: Object.freeze([
        { op: 'cool-fluid', duration: 4 }, { op: 'create-surface', material: 'brittle', duration: 4 },
      ]), color: '#a9c0ca', accent: '#d7f4ff' }),
      water: Object.freeze({ id: 'lava-quench', label: 'LAVA QUENCHED', operations: Object.freeze([
        { op: 'cool-fluid', duration: 3 }, { op: 'steam', duration: 0.7 },
      ]), color: '#a9c0ca', accent: '#ffffff' }),
    }),
    sludge: Object.freeze({
      fire: Object.freeze({ id: 'sludge-ignite', label: 'SLUDGE IGNITED', operations: Object.freeze([
        { op: 'ignite-fluid', duration: 3.2 }, { op: 'burn-dps', value: 13 },
      ]), color: '#ff8c3b', accent: '#d9ef9d' }),
    }),
    void: Object.freeze({
      holy: Object.freeze({ id: 'void-purge', label: 'VOID PURGED', operations: Object.freeze([
        { op: 'suppress-fluid', duration: 2.4 },
      ]), color: '#ffe9a8', accent: '#ffffff' }),
    }),
  });

  const SURFACE = Object.freeze({
    ice: Object.freeze({ fire: Object.freeze({ id: 'ice-thaw', label: 'ICE THAWED', operations: Object.freeze([
      { op: 'thaw' }, { op: 'steam', duration: 0.35 },
    ]), color: '#d7f4ff', accent: '#ffffff' }) }),
    brittle: Object.freeze({ physical: Object.freeze({ id: 'brittle-shatter', label: 'SHATTERED', operations: Object.freeze([
      { op: 'shatter' },
    ]), color: '#c7d5de', accent: '#ffffff' }) }),
    conductive: Object.freeze({ storm: Object.freeze({ id: 'surface-conduct', label: 'CIRCUIT CHARGED', operations: Object.freeze([
      { op: 'activate', duration: 3 },
    ]), color: '#9fe0ff', accent: '#ffffff' }) }),
  });

  const DESTRUCTIBLE = Object.freeze({
    cracked: Object.freeze({ physical: Object.freeze({ id: 'cracked-break', label: 'BREACHED', operations: Object.freeze([
      { op: 'damage-structure', value: 1 },
    ]), color: '#d8d0c0', accent: '#ffffff' }) }),
    overgrown: Object.freeze({ fire: Object.freeze({ id: 'growth-burn', label: 'BRAMBLES BURNED', operations: Object.freeze([
      { op: 'burn-structure', duration: 1.2 },
    ]), color: '#ff7a3a', accent: '#ffd75a' }) }),
    frozen: Object.freeze({ fire: Object.freeze({ id: 'frozen-seal-thaw', label: 'SEAL THAWED', operations: Object.freeze([
      { op: 'thaw' },
    ]), color: '#d7f4ff', accent: '#ffffff' }) }),
  });

  const MECHANISM = Object.freeze({
    conductive: Object.freeze({ storm: Object.freeze({ id: 'mechanism-conduct', label: 'CIRCUIT CHARGED', operations: Object.freeze([
      { op: 'activate', duration: 3 },
    ]), color: '#9fe0ff', accent: '#ffffff' }) }),
    solar: Object.freeze({ holy: Object.freeze({ id: 'solar-kindled', label: 'LENS KINDLED', operations: Object.freeze([
      { op: 'activate', duration: 3 },
    ]), color: '#ffe9a8', accent: '#ffffff' }) }),
    arcane: Object.freeze({ arcane: Object.freeze({ id: 'rune-resonance', label: 'RUNE RESONATES', operations: Object.freeze([
      { op: 'activate', duration: 3 },
    ]), color: '#c47bff', accent: '#ffffff' }) }),
  });

  const ENEMY_EFFECTS = Object.freeze({
    fire: Object.freeze({ id: 'enemy-ignite', operations: Object.freeze([{ op: 'status', status: 'burn', duration: 2.5, scale: 0.22 }]) }),
    ice: Object.freeze({ id: 'enemy-chill', operations: Object.freeze([{ op: 'status', status: 'slow', duration: 2 }]) }),
    poison: Object.freeze({ id: 'enemy-poison', operations: Object.freeze([{ op: 'status', status: 'poison', duration: 4, stacks: 1, maxStacks: 5 }]) }),
    void: Object.freeze({ id: 'enemy-siphon', operations: Object.freeze([{ op: 'heal-owner', scale: 0.05 }]) }),
    storm: Object.freeze({ id: 'enemy-arc', operations: Object.freeze([{ op: 'chain', scale: 0.4, radius: 260, maxTargets: 1 }]) }),
    holy: Object.freeze({ id: 'enemy-radiance', operations: Object.freeze([{ op: 'burst', scale: 0.25, radius: 120 }]) }),
    arcane: Object.freeze({ id: 'enemy-arcane', operations: Object.freeze([{ op: 'surge', chance: 0.2, multiplier: 2 }]) }),
    physical: Object.freeze({ id: 'enemy-impact', operations: Object.freeze([]) }),
  });

  const WEAKNESS = Object.freeze({ fire: 'ice', ice: 'fire', poison: 'holy', storm: 'arcane',
    void: 'holy', arcane: 'storm', holy: 'void' });

  function cloneOperation(operation) { return Object.freeze({ ...operation }); }
  function receipt(spec, signal, target, extra) {
    return Object.freeze({
      schema: 'bladefall.reaction-receipt', version: VERSION, id: spec.id,
      element: signal.element, delivery: signal.delivery, owner: signal.owner,
      target: Object.freeze({ kind: target.kind, material: target.material || null, element: target.element || null }),
      label: spec.label || null, color: spec.color || null, accent: spec.accent || null,
      duration: Number(spec.duration) || 0,
      operations: Object.freeze((spec.operations || []).map(cloneOperation)),
      ...(extra || {}),
    });
  }

  function normalizeSignal(raw) {
    const source = raw || {};
    const element = source.element || source.el || 'physical';
    if (!ELEMENT_SET.has(element)) return null;
    return Object.freeze({ element, delivery: source.delivery || 'contact', owner: source.owner || 'world',
      power: Math.max(0, Number(source.power) || 0), tags: Object.freeze([...(source.tags || [])]) });
  }

  function normalizeTarget(raw) {
    const source = raw || {};
    if (!TARGET_SET.has(source.kind)) return null;
    return Object.freeze({ kind: source.kind, material: source.material || null,
      element: source.element || null, boss: !!source.boss, immune: !!source.immune });
  }

  function effectiveness(element, targetElement) {
    if (!element || !targetElement) return 1;
    if (element === 'void') return 1.15;
    if (element === targetElement) return 0.6;
    if (WEAKNESS[targetElement] === element) return 1.5;
    return 1;
  }

  function lookup(signal, target) {
    if (target.kind === 'enemy') return ENEMY_EFFECTS[signal.element] || null;
    if (target.kind === 'air') return AIR[signal.element] || null;
    if (target.kind === 'fluid') return FLUID[target.material] && FLUID[target.material][signal.element] || null;
    if (target.kind === 'surface') return SURFACE[target.material] && SURFACE[target.material][signal.element] || null;
    if (target.kind === 'destructible') return DESTRUCTIBLE[target.material] && DESTRUCTIBLE[target.material][signal.element] || null;
    if (target.kind === 'mechanism') return MECHANISM[target.material] && MECHANISM[target.material][signal.element] || null;
    if (target.kind === 'projectile' && target.material === 'wet') {
      return signal.element === 'fire' ? FLUID.water.fire : null;
    }
    return null;
  }

  function resolve(rawSignal, rawTarget) {
    const signal = normalizeSignal(rawSignal);
    const target = normalizeTarget(rawTarget);
    if (!signal || !target) return Object.freeze({ ok: false, reason: 'invalid-input', receipt: null });
    if (target.immune) return Object.freeze({ ok: false, reason: 'immune', receipt: null });
    const spec = lookup(signal, target);
    if (!spec) return Object.freeze({ ok: false, reason: 'no-explicit-reaction', receipt: null });
    const multiplier = target.kind === 'enemy' ? effectiveness(signal.element, target.element) : 1;
    return Object.freeze({ ok: true, reason: null, receipt: receipt(spec, signal, target, {
      damageMultiplier: multiplier,
      bossDurationMultiplier: target.boss ? 0.5 : 1,
    }) });
  }

  function operation(receiptValue, name) {
    return receiptValue && receiptValue.operations.find((entry) => entry.op === name) || null;
  }

  function stateDuration(receiptValue) {
    return Math.max(Number(receiptValue && receiptValue.duration) || 0,
      ...(receiptValue && receiptValue.operations || []).map((entry) => Number(entry.duration) || 0));
  }

  function applyState(target, receiptValue) {
    if (!target || !receiptValue) return null;
    const duration = stateDuration(receiptValue);
    if (!duration) return null;
    const prior = target._bfWorldReaction;
    const fresh = !prior || prior.id !== receiptValue.id || prior.time <= 0;
    target._bfWorldReaction = {
      id: receiptValue.id, element: receiptValue.element, time: duration, duration,
      color: receiptValue.color, operations: receiptValue.operations,
    };
    return Object.freeze({ fresh, state: target._bfWorldReaction });
  }

  function activeState(target) {
    const state = target && target._bfWorldReaction;
    return state && state.time > 0 ? state : null;
  }

  function stepState(target, dt) {
    const state = activeState(target);
    if (!state) return null;
    state.time -= Math.max(0, Math.min(Number(dt) || 0, 0.1));
    if (state.time <= 0) { delete target._bfWorldReaction; return null; }
    return state;
  }

  function createReactionSystem(options) {
    const settings = options || {};
    let attempts = 0;
    let resolved = 0;
    let blocked = 0;
    let last = null;
    let byReaction = {};
    let byTarget = {};
    let blockedByReason = {};
    // Private state participates in opt-in TAS branching.
    root.BladefallHarness?.register("reactions:createReactionSystem", () => ({ attempts, resolved, blocked, last, byReaction, byTarget, blockedByReason }),
      state => ({ attempts, resolved, blocked, last, byReaction, byTarget, blockedByReason } = state));
    function react(signal, target) {
      attempts++;
      const result = resolve(signal, target);
      if (result.ok) {
        resolved++;
        last = result.receipt;
        byReaction[last.id] = (byReaction[last.id] || 0) + 1;
        byTarget[last.target.kind] = (byTarget[last.target.kind] || 0) + 1;
        if (settings.events && typeof settings.events.emit === 'function') settings.events.emit('reaction:resolved', last);
      } else {
        blocked++;
        blockedByReason[result.reason] = (blockedByReason[result.reason] || 0) + 1;
      }
      return result;
    }
    function diagnostics() { return Object.freeze({ attempts, resolved, blocked,
      byReaction: Object.freeze({ ...byReaction }), byTarget: Object.freeze({ ...byTarget }),
      blockedByReason: Object.freeze({ ...blockedByReason }), last }); }
    return Object.freeze({ react, diagnostics });
  }

  root.BladefallReactions = Object.freeze({ VERSION, ELEMENTS, TARGET_KINDS, AIR, FLUID, SURFACE,
    DESTRUCTIBLE, MECHANISM, ENEMY_EFFECTS, WEAKNESS, normalizeSignal, normalizeTarget,
    effectiveness, lookup, resolve, operation, stateDuration, applyState, activeState, stepState,
    createReactionSystem });
})(typeof window !== 'undefined' ? window : globalThis);
