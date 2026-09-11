(function installBladefallPortals(root) {
  'use strict';

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function mouthFrame(mouth) {
    const source = mouth || {};
    const magnitude = Math.hypot(Number(source.nx) || 0, Number(source.ny) || 0) || 1;
    const nx = (Number(source.nx) || 0) / magnitude;
    const ny = (Number(source.ny) || 0) / magnitude;
    return Object.freeze({
      x: Number(source.x) || 0,
      y: Number(source.y) || 0,
      nx,
      ny,
      tx: -ny,
      ty: nx,
      source,
    });
  }

  function normalizePair(raw, index) {
    if (!raw) return null;
    if (Array.isArray(raw)) {
      return Object.freeze({
        id: raw.id || `pair-${index || 0}`,
        a: raw[0],
        b: raw[1],
        colors: Object.freeze([raw[2] || '#4fc3ff', raw[3] || raw[2] || '#ff9a3b']),
        oneWay: !!raw[4],
        mode: raw.mode || (raw[0] && raw[0].transformMode) || (raw[1] && raw[1].transformMode) || 'normal',
        source: raw,
      });
    }
    return Object.freeze({
      id: raw.id || `pair-${index || 0}`,
      a: raw.a,
      b: raw.b,
      colors: Object.freeze(raw.colors || ['#4fc3ff', '#ff9a3b']),
      oneWay: !!raw.oneWay,
      mode: raw.mode || 'normal',
      source: raw,
    });
  }

  function entityCenter(entity, centered) {
    return Object.freeze({
      x: Number(entity.x) || 0,
      y: centered ? Number(entity.y) || 0 : (Number(entity.y) || 0) + (Number(entity.h) || 40) * 0.5,
    });
  }

  function touching(entity, mouth, options) {
    const settings = options || {};
    const center = entityCenter(entity, !!settings.centered);
    return Math.abs(center.x - mouth.x) < (settings.radiusX || 30)
      && Math.abs(center.y - (mouth.y + (settings.centerOffset == null ? 20 : settings.centerOffset)))
        < (settings.radiusY || 36);
  }

  function worldVelocity(entity, centered) {
    return Object.freeze({
      x: Number(entity.vx) || 0,
      y: (centered ? 1 : -1) * (Number(entity.vy) || 0),
    });
  }

  function entityVelocity(world, centered) {
    return Object.freeze({ x: world.x, y: (centered ? 1 : -1) * world.y });
  }

  function transformVector(vector, entry, exit, mode) {
    const a = mouthFrame(entry);
    const b = mouthFrame(exit);
    const speed = Math.hypot(vector.x, vector.y);
    if (!speed) return Object.freeze({ x: 0, y: 0 });
    if ((mode || 'normal') === 'frame') {
      const inward = Math.max(0, -(vector.x * a.nx + vector.y * a.ny));
      const tangent = vector.x * a.tx + vector.y * a.ty;
      const x = b.nx * inward + b.tx * tangent;
      const y = b.ny * inward + b.ty * tangent;
      const transformedSpeed = Math.hypot(x, y);
      if (transformedSpeed > 0.0001) return Object.freeze({
        x: x / transformedSpeed * speed,
        y: y / transformedSpeed * speed,
      });
    }
    return Object.freeze({ x: b.nx * speed, y: b.ny * speed });
  }

  function transformPoint(point, entry, exit, offset) {
    const b = mouthFrame(exit);
    const distance = Number.isFinite(offset) ? offset : 36;
    return Object.freeze({
      x: b.x + b.nx * distance,
      y: Math.max(0, b.y + b.ny * distance),
    });
  }

  function attemptTransit(entity, pairs, options) {
    const settings = options || {};
    const dt = Number(settings.dt) || 0;
    if ((entity._tpCd || 0) > 0) entity._tpCd = Math.max(0, entity._tpCd - dt);
    const normalized = (pairs || []).map(normalizePair).filter((pair) => pair && pair.a && pair.b);
    for (const pair of normalized) {
      for (let side = 0; side < 2; side++) {
        if (pair.oneWay && side === 1) continue;
        const entry = side === 0 ? pair.a : pair.b;
        const exit = side === 0 ? pair.b : pair.a;
        const hit = touching(entity, entry, settings);
        if (!hit) {
          if (entity._restMouth === entry) entity._restMouth = null;
          continue;
        }
        if (entity._restMouth === entry || (entity._tpCd || 0) > 0) continue;

        const eligibility = typeof settings.eligible === 'function'
          ? settings.eligible(entity, entry, exit, pair)
          : true;
        const allowed = eligibility === true || eligibility == null || eligibility.ok !== false;
        if (!allowed) {
          entity._restMouth = entry;
          entry._sputter = 0.3;
          return Object.freeze({
            transited: false,
            reason: eligibility.reason || 'ineligible',
            entry,
            exit,
            pair,
          });
        }

        const velocity = worldVelocity(entity, !!settings.centered);
        const incoming = Math.hypot(velocity.x, velocity.y);
        const minimum = Math.max(Number(entry.minSpeed) || 0, Number(exit.minSpeed) || 0);
        if (minimum && incoming < minimum) {
          entity._restMouth = entry;
          entry._sputter = 0.3;
          return Object.freeze({
            transited: false,
            reason: 'speed',
            incoming,
            minimum,
            entry,
            exit,
            pair,
          });
        }

        const speed = exit.ejectSpeed == null
          ? clamp(incoming, Number(settings.minimumExitSpeed) || 150, Number(settings.maximumExitSpeed) || 1400)
          : Number(exit.ejectSpeed);
        let output = transformVector(velocity, entry, exit, pair.mode);
        const outputMagnitude = Math.hypot(output.x, output.y);
        if (outputMagnitude > 0.0001) output = {
          x: output.x / outputMagnitude * speed,
          y: output.y / outputMagnitude * speed,
        };
        else {
          const frame = mouthFrame(exit);
          output = { x: frame.nx * speed, y: frame.ny * speed };
        }
        const position = transformPoint(entityCenter(entity, !!settings.centered), entry, exit, settings.exitOffset);
        const storedVelocity = entityVelocity(output, !!settings.centered);
        entity.x = position.x;
        entity.y = position.y;
        entity.vx = storedVelocity.x;
        entity.vy = storedVelocity.y;
        entity._tpCd = Number(settings.cooldown) || 0.7;
        entity._restMouth = exit;
        entity._portalEntry = entry;
        entity._portalExit = exit;
        return Object.freeze({
          transited: true,
          reason: 'transit',
          incoming,
          speed,
          position,
          velocity: Object.freeze(output),
          entry,
          exit,
          pair,
          side,
        });
      }
    }
    return null;
  }

  function routePerception(from, to, pairs) {
    const origin = { x: Number(from.x) || 0, y: Number(from.y) || 0 };
    const target = { x: Number(to.x) || 0, y: Number(to.y) || 0 };
    let best = {
      distance: Math.hypot(target.x - origin.x, target.y - origin.y),
      viaPortal: false,
      waypoint: target,
      exitPoint: null,
      pair: null,
    };
    const normalized = (pairs || []).map(normalizePair).filter((pair) => pair && pair.a && pair.b);
    for (const pair of normalized) {
      for (let side = 0; side < 2; side++) {
        if (pair.oneWay && side === 1) continue;
        const entry = side === 0 ? pair.a : pair.b;
        const exit = side === 0 ? pair.b : pair.a;
        const distance = Math.hypot(entry.x - origin.x, entry.y - origin.y)
          + Math.hypot(target.x - exit.x, target.y - exit.y);
        if (distance < best.distance) best = {
          distance,
          viaPortal: true,
          waypoint: { x: entry.x, y: entry.y },
          exitPoint: { x: exit.x, y: exit.y },
          pair,
        };
      }
    }
    return Object.freeze(best);
  }

  function fieldContainsMouth(field, mouth) {
    if (field.type === 'updraft' || field.type === 'wind') {
      return Math.abs(mouth.x - field.x) < (field.w || 0) / 2
        && mouth.y >= (field.y || 0) - 20
        && mouth.y <= (field.y || 0) + (field.h || 0) + 20;
    }
    if (field.type === 'lowg' || field.type === 'gravityWell') {
      return Math.hypot(mouth.x - field.x, mouth.y - field.y) < field.r;
    }
    return false;
  }

  function projectedFields(pairs, fields) {
    const projected = [];
    const normalized = (pairs || []).map(normalizePair).filter((pair) => pair && pair.a && pair.b);
    for (const pair of normalized) {
      for (let side = 0; side < 2; side++) {
        if (pair.oneWay && side === 1) continue;
        const entry = side === 0 ? pair.a : pair.b;
        const exit = side === 0 ? pair.b : pair.a;
        for (const field of fields || []) {
          if (!field || field.gone || !fieldContainsMouth(field, entry)) continue;
          const frame = mouthFrame(exit);
          if (field.type === 'updraft') projected.push({
            type: 'portalFlow',
            x: exit.x,
            y: exit.y,
            nx: frame.nx,
            ny: frame.ny,
            length: field.portalLength || 380,
            w: Math.min(140, field.w || 100),
            strength: field.portalStrength || 2600,
            source: field,
            pairId: pair.id,
          });
          else if (field.type === 'wind') {
            const input = { x: Number(field.forceX) || Number(field.strength) || 0, y: Number(field.forceY) || 0 };
            const force = transformVector(input, entry, exit, 'frame');
            projected.push({
              type: 'portalFlow',
              x: exit.x,
              y: exit.y,
              nx: frame.nx,
              ny: frame.ny,
              length: field.portalLength || 320,
              w: Math.min(160, field.w || 120),
              strength: Math.hypot(force.x, force.y),
              source: field,
              pairId: pair.id,
            });
          }
        }
      }
    }
    return projected;
  }

  function createPortalSystem(options) {
    const settings = options || {};
    let transits = 0;
    let rejected = 0;
    let byKind = {};
    let last = null;
    // Private state participates in opt-in TAS branching.
    root.BladefallHarness?.register("portals:createPortalSystem", () => ({ transits, rejected, byKind, last }),
      state => ({ transits, rejected, byKind, last } = state));

    function attempt(entity, pairs, attemptOptions) {
      const result = attemptTransit(entity, pairs, attemptOptions);
      if (!result) return null;
      const kind = attemptOptions && attemptOptions.kind || entity.portalKind || entity.kind || entity.type || 'entity';
      if (result.transited) {
        transits++;
        byKind[kind] = (byKind[kind] || 0) + 1;
      } else rejected++;
      last = Object.freeze({
        transited: result.transited,
        reason: result.reason,
        kind,
        pairId: result.pair.id,
        entry: Object.freeze({ x: result.entry.x, y: result.entry.y }),
        exit: Object.freeze({ x: result.exit.x, y: result.exit.y }),
      });
      if (settings.events && typeof settings.events.emit === 'function') {
        settings.events.emit(result.transited ? 'portal:transit' : 'portal:rejected', last);
      }
      return result;
    }

    function diagnostics() {
      return Object.freeze({ transits, rejected, byKind: Object.freeze({ ...byKind }), last });
    }

    return Object.freeze({
      attempt,
      routePerception,
      projectedFields,
      transformVector,
      transformPoint,
      mouthFrame,
      diagnostics,
    });
  }

  root.BladefallPortals = Object.freeze({
    mouthFrame,
    normalizePair,
    entityCenter,
    touching,
    worldVelocity,
    entityVelocity,
    transformVector,
    transformPoint,
    attemptTransit,
    routePerception,
    projectedFields,
    createPortalSystem,
  });
})(typeof window !== 'undefined' ? window : globalThis);
