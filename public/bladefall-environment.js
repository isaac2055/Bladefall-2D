(function installBladefallEnvironment(root) {
  'use strict';

  const TAU = Math.PI * 2;
  const MATERIALS = Object.freeze({
    stone: Object.freeze({ id: 'stone', playerConveyor: 130, enemyConveyor: 92, crateDrag: 0.86 }),
    ice: Object.freeze({ id: 'ice', playerConveyor: 130, enemyConveyor: 92, crateDrag: 0.975 }),
    brittle: Object.freeze({ id: 'brittle', playerConveyor: 130, enemyConveyor: 92, crateDrag: 0.82 }),
    slate: Object.freeze({ id: 'slate', playerConveyor: 130, enemyConveyor: 92, crateDrag: 0.88 }),
  });

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function materialOf(surface, warmed) {
    if (!surface) return MATERIALS.stone;
    if (surface.ice && !warmed) return MATERIALS.ice;
    if (surface.brittle || surface.crumble) return MATERIALS.brittle;
    if (surface.slate) return MATERIALS.slate;
    return MATERIALS.stone;
  }

  // Existing movers use phase as an angle and sin() for both axes. Keeping that
  // exact default means authored timing does not shift when routed through here.
  function oscillator(spec, time, origin) {
    const motion = spec || {};
    const base = origin || {};
    const period = Math.max(0.05, Number(motion.period) || 1);
    const theta = (Number(time) || 0) * TAU / period + (Number(motion.phase) || 0);
    const mode = motion.mode || 'sine';
    if (mode === 'orbit') {
      const rx = Number.isFinite(motion.rx) ? motion.rx : Number(motion.dx) || 0;
      const ry = Number.isFinite(motion.ry) ? motion.ry : Number(motion.dy) || 0;
      return Object.freeze({
        x: (Number(base.x) || 0) + Math.cos(theta) * rx,
        y: (Number(base.y) || 0) + Math.sin(theta) * ry,
        theta,
      });
    }
    const wave = mode === 'pingpong' ? Math.asin(Math.sin(theta)) * 2 / Math.PI : Math.sin(theta);
    return Object.freeze({
      x: (Number(base.x) || 0) + wave * (Number(motion.dx) || 0),
      y: (Number(base.y) || 0) + wave * (Number(motion.dy) || 0),
      theta,
    });
  }

  function pendulumState(spec, time) {
    const value = spec || {};
    const period = Math.max(0.1, Number(value.period) || 3);
    const theta = (Number(time) || 0) * TAU / period + (Number(value.phase) || 0);
    const angle = Math.sin(theta) * (Number(value.amplitude) || 0.7);
    const length = Math.max(10, Number(value.length) || 180);
    const pivotX = Number(value.x) || 0;
    const pivotY = Number(value.y) || 0;
    return Object.freeze({
      pivotX,
      pivotY,
      x: pivotX + Math.sin(angle) * length,
      y: pivotY - Math.cos(angle) * length,
      angle,
      angularVelocity: Math.cos(theta) * (Number(value.amplitude) || 0.7) * TAU / period,
    });
  }

  function rotorState(spec, time) {
    const value = spec || {};
    const angle = (Number(time) || 0) * (Number(value.speed) || 1.4) + (Number(value.phase) || 0);
    const length = Math.max(8, Number(value.length) || 90);
    const dx = Math.cos(angle) * length;
    const dy = Math.sin(angle) * length;
    return Object.freeze({
      x1: value.x - dx,
      y1: value.y - dy,
      x2: value.x + dx,
      y2: value.y + dy,
      angle,
    });
  }

  function pointSegmentDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;
    const t = lengthSq ? clamp(((px - x1) * dx + (py - y1) * dy) / lengthSq, 0, 1) : 0;
    return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
  }

  function mechanismHitsActor(mechanism, actor, padding) {
    if (!mechanism || !actor) return false;
    const px = actor.x;
    const py = actor.y + actor.h / 2;
    const radius = Math.max(actor.w, actor.h) * 0.32 + (Number(padding) || 0);
    if (mechanism.type === 'pendulum') {
      return Math.hypot(px - mechanism.headX, py - mechanism.headY)
        <= radius + (Number(mechanism.headR) || 20);
    }
    if (mechanism.type === 'rotor') {
      return pointSegmentDistance(px, py, mechanism.x1, mechanism.y1, mechanism.x2, mechanism.y2)
        <= radius + (Number(mechanism.thickness) || 8);
    }
    return false;
  }

  function insideRect(actor, field, pad) {
    const halfW = actor.w ? actor.w / 2 : 0;
    return Math.abs(actor.x - field.x) < (field.w || 0) / 2 + halfW + (pad || 0)
      && actor.y >= (field.y || 0) - (pad || 0)
      && actor.y < (field.y || 0) + (field.h || 0) + (pad || 0);
  }

  function reactionForceMultiplier(field) {
    let target = field;
    const seen = new Set();
    while (target && target.source && !seen.has(target)) {
      seen.add(target);
      target = target.source;
    }
    const reaction = target && target._bfReaction;
    return reaction && reaction.time > 0 ? Number(reaction.forceMultiplier) || 1 : 1;
  }

  function reactionRequirementMet(field) {
    if (!field || !field.requiresReaction) return true;
    let target = field;
    const seen = new Set();
    while (target && target.source && !seen.has(target)) {
      seen.add(target);
      target = target.source;
    }
    const reaction = target && target._bfReaction;
    return !!(reaction && reaction.time > 0 && reaction.element === field.requiresReaction);
  }

  function sampleFields(actor, fields, options) {
    const settings = options || {};
    const flipped = !!settings.gravityFlipped;
    const active = [];
    let gravityScale = 1;
    let ax = 0;
    let ay = 0; // Bladefall velocity coordinates: positive points down.
    let updraft = false;
    let liftScale = 1;
    const cy = actor.y + (actor.h || 0) / 2;

    let insideAnyUpdraft=false;
    for (const field of fields || []) {
      if (!field || field.gone) continue;
      if (field.type === 'lowg') {
        const dx = actor.x - field.x;
        const dy = cy - field.y;
        if (dx * dx + dy * dy < field.r * field.r) {
          gravityScale = Math.min(gravityScale, Number(field.gravityScale) || 0.35);
          active.push('lowg');
        }
      } else if (field.type === 'updraft' && !flipped && reactionRequirementMet(field) && insideRect(actor, field)) {
        insideAnyUpdraft=true;
        if(field.weakFromHeight){
          if((Number(actor.vy)||0)>field.weakFromHeight)actor._weakLiftX=field.x;
          if(actor._weakLiftX!==field.x)continue;
        }
        updraft = true;
        if(field.gradualLift){
          actor._windDwell=Math.min(1,(Number(actor._windDwell)||0)+.055);
          liftScale*=.28+.72*actor._windDwell;
        }
        liftScale *= reactionForceMultiplier(field);
        active.push('updraft');
      } else if (field.type === 'lportal' && field.emit === 'updraft' && !flipped
        && (!settings.portalOpen || settings.portalOpen(field))) {
        const proxy = { x: field.x, y: field.y - 12, w: 110, h: (field.fieldHeight || 380) + 12 };
        if (insideRect(actor, proxy)) {
          updraft = true;
          liftScale *= reactionForceMultiplier(field);
          active.push('portal-updraft');
        }
      } else if (field.type === 'wind' && reactionRequirementMet(field) && insideRect(actor, field)) {
        const reactionScale = reactionForceMultiplier(field);
        const turbulence=field.turbulent?Math.sin((Number(settings.time)||0)*5.1+field.x*.013)*95:0;
        ax += ((Number(field.forceX) || Number(field.strength) || 0)+turbulence) * reactionScale;
        ay -= ((Number(field.forceY) || 0)+(field.turbulent?Math.cos((Number(settings.time)||0)*4.3)*70:0)) * reactionScale;
        active.push('wind');
      } else if (field.type === 'gravityWell') {
        const dx = field.x - actor.x;
        const dy = field.y - cy;
        const distance = Math.hypot(dx, dy);
        if (distance > 1 && distance < field.r) {
          const falloff = Math.pow(1 - distance / field.r, Number(field.falloff) || 1);
          const force = (Number(field.strength) || 900) * falloff;
          ax += dx / distance * force;
          ay -= dy / distance * force;
          active.push('gravity-well');
        }
      } else if (field.type === 'portalFlow') {
        const nx=Number(field.nx)||0,ny=Number(field.ny)||0,tx=-ny,ty=nx;
        const rx=actor.x-field.x,ry=cy-field.y;
        const along=rx*nx+ry*ny,across=rx*tx+ry*ty;
        if(along>=-12&&along<(field.length||380)&&Math.abs(across)<(field.w||110)/2+(actor.w||0)/2){
          const strength=(Number(field.strength)||2600)*reactionForceMultiplier(field);
          ax+=nx*strength;ay-=ny*strength;
          active.push('portal-flow');
        }
      }
    }
    if(!insideAnyUpdraft){actor._windDwell=0;actor._weakLiftX=null;}
    return Object.freeze({
      gravityScale,
      ax,
      ay,
      updraft,
      liftScale,
      active: Object.freeze(active),
    });
  }

  function createRope(options) {
    const settings = options || {};
    const segments = Math.max(2, settings.segments | 0 || 10);
    const length = Math.max(1, Number(settings.length) || 180);
    const points = [];
    for (let index = 0; index <= segments; index++) {
      const t = index / segments;
      const point = {
        x: settings.x,
        y: settings.y - length * t,
        px: settings.x,
        py: settings.y - length * t,
      };
      points.push(point);
    }
    return { points, segmentLength: length / segments, iterations: settings.iterations || 24 };
  }

  function stepRope(rope, dt, pins, gravity) {
    if (!rope || !rope.points || rope.points.length < 2) return rope;
    const seconds = clamp(Number(dt) || 0, 0, 1 / 20);
    const start = pins && pins.start;
    const end = pins && pins.end;
    for (let index = 1; index < rope.points.length - (end ? 1 : 0); index++) {
      const point = rope.points[index];
      const vx = (point.x - point.px) * 0.992;
      const vy = (point.y - point.py) * 0.992;
      point.px = point.x;
      point.py = point.y;
      point.x += vx;
      point.y += vy - (Number(gravity) || 980) * seconds * seconds;
    }
    const pin = () => {
      if (start) Object.assign(rope.points[0], { x: start.x, y: start.y, px: start.x, py: start.y });
      if (end) {
        const last = rope.points[rope.points.length - 1];
        Object.assign(last, { x: end.x, y: end.y, px: end.x, py: end.y });
      }
    };
    pin();
    for (let pass = 0; pass < rope.iterations; pass++) {
      for (let index = 0; index < rope.points.length - 1; index++) {
        const a = rope.points[index];
        const b = rope.points[index + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy) || 1;
        const correction = (distance - rope.segmentLength) / distance;
        const aPinned=index===0&&start,bPinned=index+1===rope.points.length-1&&end;
        const aWeight=aPinned?0:(bPinned?1:0.5),bWeight=bPinned?0:(aPinned?1:0.5);
        a.x += dx * correction * aWeight;
        a.y += dy * correction * aWeight;
        b.x -= dx * correction * bWeight;
        b.y -= dy * correction * bWeight;
      }
      pin();
    }
    return rope;
  }

  function createEnvironment() {
    let mechanisms = 0;
    let activeFields = [];
    let lastMaterial = 'stone';
    let ropePoints = 0;
    // Private state participates in opt-in TAS branching.
    root.BladefallHarness?.register("environment:createEnvironment", () => ({ mechanisms, activeFields, lastMaterial, ropePoints }),
      state => ({ mechanisms, activeFields, lastMaterial, ropePoints } = state));

    function updateMechanism(object, time, dt) {
      if (object.move) {
        const next = oscillator(object.move, time, { x: object.x0, y: object.y0 });
        object.dxf = next.x - object.x;
        object.dyf = next.y - object.y;
        object.x = next.x;
        object.y = next.y;
        object.motionTheta = next.theta;
        mechanisms++;
      }
      if (object.type === 'pendulum') {
        const state = pendulumState(object, time);
        object.headX = state.x;
        object.headY = state.y;
        object.angle = state.angle;
        object.angularVelocity = state.angularVelocity;
        mechanisms++;
      } else if (object.type === 'rotor') {
        Object.assign(object, rotorState(object, time));
        mechanisms++;
      }
      if (object.suspended) {
        const travel=Math.abs(object.move&&object.move.dy||0);
        const clearance=Math.max(80,Number(object.suspensionClearance)||170);
        const length=clearance+travel;
        const top = { x: object.x0, y: object.y0 + clearance };
        const end = { x: object.x, y: object.y + 4 };
        if (!object.ropeState) object.ropeState = createRope({ x: top.x, y: top.y, length, segments: 9 });
        stepRope(object.ropeState, dt, { start: top, end }, 560);
        ropePoints += object.ropeState.points.length;
      }
      return object;
    }

    function fields(actor, objects, options) {
      const result = sampleFields(actor, objects, options);
      activeFields = result.active;
      return result;
    }

    function material(surface, warmed) {
      const result = materialOf(surface, warmed);
      lastMaterial = result.id;
      return result;
    }

    function beginFrame() {
      mechanisms = 0;
      ropePoints = 0;
    }

    function diagnostics() {
      return Object.freeze({
        mechanisms,
        ropePoints,
        activeFields,
        material: lastMaterial,
      });
    }

    return Object.freeze({
      beginFrame,
      updateMechanism,
      fields,
      material,
      diagnostics,
      oscillator,
      pendulumState,
      rotorState,
      mechanismHitsActor,
      createRope,
      stepRope,
      materials: MATERIALS,
    });
  }

  root.BladefallEnvironment = Object.freeze({
    MATERIALS,
    materialOf,
    oscillator,
    pendulumState,
    rotorState,
    pointSegmentDistance,
    mechanismHitsActor,
    reactionForceMultiplier,
    reactionRequirementMet,
    sampleFields,
    createRope,
    stepRope,
    createEnvironment,
  });
})(typeof window !== 'undefined' ? window : globalThis);
