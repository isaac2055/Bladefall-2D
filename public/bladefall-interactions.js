(function installBladefallInteractions(root) {
  'use strict';

  const Reactions = root.BladefallReactions;
  if (!Reactions) throw new Error('BladefallInteractions requires BladefallReactions');

  const CHANNEL_TYPES = Object.freeze(['wind', 'updraft', 'portalFlow']);
  const CHANNEL_SET = new Set(CHANNEL_TYPES);
  const REACTIONS = Reactions.AIR;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function reactionTarget(field) {
    let target = field;
    const seen = new Set();
    while (target && target.source && !seen.has(target)) {
      seen.add(target);
      target = target.source;
    }
    return target || field;
  }

  function channelType(field) {
    if (!field || !CHANNEL_SET.has(field.type)) return null;
    return field.type;
  }

  function reactionFor(element, field) {
    if (!channelType(field)) return null;
    const result = Reactions.resolve({ element, delivery: 'projectile', owner: 'player' }, { kind: 'air' });
    return result.ok ? result.receipt : null;
  }

  function actorCenter(entity, centered) {
    return {
      x: Number(entity && entity.x) || 0,
      y: centered
        ? Number(entity && entity.y) || 0
        : (Number(entity && entity.y) || 0) + (Number(entity && entity.h) || 0) / 2,
      radius: centered
        ? Number(entity && entity.size) || 2
        : Math.max(0, Number(entity && entity.w) || 0) / 2,
    };
  }

  function insideChannel(entity, field, options) {
    if (!entity || !channelType(field)) return false;
    const point = actorCenter(entity, options && options.centered);
    if (field.type === 'portalFlow') {
      const nx = Number(field.nx) || 0;
      const ny = Number(field.ny) || 0;
      const magnitude = Math.hypot(nx, ny) || 1;
      const normalX = nx / magnitude;
      const normalY = ny / magnitude;
      const tangentX = -normalY;
      const tangentY = normalX;
      const rx = point.x - (Number(field.x) || 0);
      const ry = point.y - (Number(field.y) || 0);
      const along = rx * normalX + ry * normalY;
      const across = rx * tangentX + ry * tangentY;
      return along >= -10
        && along <= (Number(field.length) || 380)
        && Math.abs(across) <= (Number(field.w) || 110) / 2 + point.radius;
    }
    const halfWidth = (Number(field.w) || 0) / 2 + point.radius;
    return Math.abs(point.x - (Number(field.x) || 0)) <= halfWidth
      && point.y >= (Number(field.y) || 0) - point.radius
      && point.y <= (Number(field.y) || 0) + (Number(field.h) || 0) + point.radius;
  }

  function activeReaction(field) {
    const target = reactionTarget(field);
    const state = target && target._bfReaction;
    return state && state.time > 0 ? state : null;
  }

  function primeField(field, element, options) {
    const spec = reactionFor(element, field);
    if (!spec) return null;
    const target = reactionTarget(field);
    if (!target) return null;
    const previous = activeReaction(target);
    const fresh = !previous || previous.id !== spec.id;
    target._bfReaction = {
      id: spec.id,
      element,
      owner: options && options.owner || 'player',
      time: spec.duration,
      duration: spec.duration,
      burnDps: (Reactions.operation(spec, 'burn-dps') || {}).value || 0,
      shockDps: (Reactions.operation(spec, 'shock-dps') || {}).value || 0,
      slowScale: (Reactions.operation(spec, 'slow-scale') || {}).value || 1,
      freezeAfter: (Reactions.operation(spec, 'freeze-after') || {}).value || 0,
      forceMultiplier: (Reactions.operation(spec, 'force-multiplier') || {}).value || 1,
      color: spec.color,
      accent: spec.accent,
      label: spec.label,
    };
    return Object.freeze({
      fresh,
      field,
      target,
      reaction: target._bfReaction,
    });
  }

  function stepFields(fields, dt) {
    const seconds = clamp(Number(dt) || 0, 0, 0.1);
    const targets = new Set();
    for (const field of fields || []) {
      const target = reactionTarget(field);
      if (target) targets.add(target);
    }
    let active = 0;
    for (const target of targets) {
      if (!target._bfReaction) continue;
      target._bfReaction.time -= seconds;
      if (target._bfReaction.time <= 0) delete target._bfReaction;
      else active++;
    }
    return active;
  }

  function sampleActor(entity, fields, options) {
    const reactions = [];
    const seen = new Set();
    let burnDps = 0;
    let shockDps = 0;
    let slowScale = 1;
    let freezeAfter = 0;
    for (const field of fields || []) {
      const target = reactionTarget(field);
      if (!target || seen.has(target)) continue;
      const reaction = activeReaction(target);
      if (!reaction || !insideChannel(entity, field, options)) continue;
      seen.add(target);
      reactions.push(reaction);
      burnDps = Math.max(burnDps, reaction.burnDps || 0);
      shockDps += reaction.shockDps || 0;
      slowScale = Math.min(slowScale, reaction.slowScale == null ? 1 : reaction.slowScale);
      if (reaction.freezeAfter) {
        freezeAfter = freezeAfter ? Math.min(freezeAfter, reaction.freezeAfter) : reaction.freezeAfter;
      }
    }
    return Object.freeze({
      burnDps,
      shockDps,
      slowScale,
      freezeAfter,
      reactions: Object.freeze(reactions),
    });
  }

  function visualState(field) {
    const reaction = activeReaction(field);
    if (!reaction) return null;
    return Object.freeze({
      id: reaction.id,
      element: reaction.element,
      color: reaction.color,
      accent: reaction.accent,
      intensity: clamp(reaction.time / Math.min(0.45, reaction.duration), 0, 1),
      remaining: reaction.time,
    });
  }

  function createInteractionSystem(options) {
    const settings = options || {};
    let activations = 0;
    let samples = 0;
    let activeChannels = 0;
    let last = null;
    let byReaction = {};
    // Private state participates in opt-in TAS branching.
    root.BladefallHarness?.register("interactions:createInteractionSystem", () => ({ activations, samples, activeChannels, last, byReaction }),
      state => ({ activations, samples, activeChannels, last, byReaction } = state));

    function update(fields, dt) {
      activeChannels = stepFields(fields, dt);
      return activeChannels;
    }

    function projectile(projectile, fields) {
      if (!projectile || !REACTIONS[projectile.el]) return Object.freeze([]);
      const owner = projectile.reflected ? 'player' : projectile.owner;
      if (owner !== 'player' && owner !== 'remote') return Object.freeze([]);
      const results = [];
      const seen = new Set();
      for (const field of fields || []) {
        const target = reactionTarget(field);
        if (!target || seen.has(target) || !insideChannel(projectile, field, { centered: true })) continue;
        seen.add(target);
        const result = primeField(field, projectile.el, { owner });
        if (!result) continue;
        results.push(result);
        if (result.fresh) {
          activations++;
          byReaction[result.reaction.id] = (byReaction[result.reaction.id] || 0) + 1;
          last = Object.freeze({
            id: result.reaction.id,
            element: projectile.el,
            field: field.type,
            x: Number(projectile.x) || 0,
            y: Number(projectile.y) || 0,
          });
          if (settings.events && typeof settings.events.emit === 'function') {
            settings.events.emit('interaction:primed', last);
          }
        }
      }
      return Object.freeze(results);
    }

    function sample(entity, fields, sampleOptions) {
      samples++;
      return sampleActor(entity, fields, sampleOptions);
    }

    function diagnostics() {
      return Object.freeze({
        activations,
        samples,
        activeChannels,
        byReaction: Object.freeze({ ...byReaction }),
        last,
      });
    }

    return Object.freeze({
      update,
      projectile,
      sample,
      visual: visualState,
      diagnostics,
    });
  }

  root.BladefallInteractions = Object.freeze({
    CHANNEL_TYPES,
    REACTIONS,
    channelType,
    reactionTarget,
    reactionFor,
    insideChannel,
    activeReaction,
    primeField,
    stepFields,
    sampleActor,
    visualState,
    createInteractionSystem,
  });
})(typeof window !== 'undefined' ? window : globalThis);
