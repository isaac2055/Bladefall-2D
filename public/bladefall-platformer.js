(function installBladefallPlatformer(root) {
  'use strict';

  const MOTION_PROFILES = Object.freeze({
    precision: Object.freeze({
      // v4 feel (2026-09-16): snappier starts, stops and reversals; air momentum still carries.
      groundAccel: 22,
      groundTurn: 40,
      groundBrake: 22,
      groundOverspeed: 2.5,
      airAccel: 9,
      airTurn: 14,
      airOverspeed: 1,
      iceCoast: 0.22,
      iceSteer: 0.55,
      dash: 15,
      platformDeparture: 0.55,
      platformDepartureCap: 240,
    }),
    cart: Object.freeze({
      groundAccel: 10,
      airAccel: 3,
      slopeGravity: 2400,
    }),
  });

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  // Bladefall's authored movement was tuned around a fixed-tick linear blend.
  // Keep those exact response curves, but clamp the blend so a stalled tab or
  // diagnostic single-step cannot overshoot and reverse the player.
  function blendVelocity(current, target, rate, dt) {
    if (!Number.isFinite(current) || !Number.isFinite(target)) return current || 0;
    const amount = clamp((Number(rate) || 0) * (Number(dt) || 0), 0, 1);
    return current + (target - current) * amount;
  }

  function horizontalVelocity(options) {
    const settings = options || {};
    const profile = settings.profile || MOTION_PROFILES.precision;
    const current = Number(settings.current) || 0;
    const target = Number(settings.target) || 0;
    const input = clamp(Number(settings.input) || 0, -1, 1);
    const grounded = !!settings.grounded;
    let rate;
    let response;

    if (settings.ice) {
      rate = input === 0 ? profile.iceCoast : profile.iceSteer;
      response = input === 0 ? 'ice-coast' : 'ice-steer';
    } else if (input !== 0 && Math.sign(input) !== Math.sign(current) && Math.abs(current) > 20) {
      rate = grounded ? profile.groundTurn : profile.airTurn;
      response = grounded ? 'ground-turn' : 'air-turn';
    } else if (Math.abs(current) > Math.abs(target) + 15) {
      rate = grounded ? (input === 0 ? profile.groundBrake : profile.groundOverspeed) : profile.airOverspeed;
      response = grounded ? (input === 0 ? 'ground-brake' : 'ground-overspeed') : 'air-overspeed';
    } else {
      rate = grounded ? profile.groundAccel : profile.airAccel;
      response = grounded ? 'ground-accel' : 'air-accel';
    }

    return Object.freeze({
      velocity: blendVelocity(current, target, rate, settings.dt),
      rate,
      response,
    });
  }

  function sampleSlope(platform, x) {
    if (!platform || !platform.slope || !(platform.w > 0)) return null;
    const left = platform.x - platform.w / 2;
    const t = clamp(((Number(x) || 0) - left) / platform.w, 0, 1);
    const smooth = t * t * (3 - 2 * t);
    const rise = platform.slopeY1 - platform.slopeY0;
    const grade = rise * 6 * t * (1 - t) / platform.w;
    const length = Math.hypot(1, grade) || 1;
    return Object.freeze({
      t,
      y: platform.slopeY0 + rise * smooth,
      grade,
      tangent: Object.freeze({ x: 1 / length, y: grade / length }),
      normal: Object.freeze({ x: -grade / length, y: 1 / length }),
    });
  }

  function platformMotion(platform, dt) {
    const seconds = Math.max(0.000001, Number(dt) || 0);
    const dx = Number(platform && platform.dxf) || 0;
    const dy = Number(platform && platform.dyf) || 0;
    return Object.freeze({ dx, dy, vx: dx / seconds, vy: dy / seconds });
  }

  function carryByPlatform(actor, platform, dt) {
    const motion = platformMotion(platform, dt);
    return Object.freeze({
      x: (Number(actor && actor.x) || 0) + motion.dx,
      y: (Number(actor && actor.y) || 0) + motion.dy,
      ...motion,
    });
  }

  function departureVelocity(platformVx, options) {
    const settings = options || {};
    const profile = settings.profile || MOTION_PROFILES.precision;
    const factor = Number.isFinite(settings.factor) ? settings.factor : profile.platformDeparture;
    const cap = Number.isFinite(settings.cap) ? settings.cap : profile.platformDepartureCap;
    return clamp((Number(platformVx) || 0) * factor, -cap, cap);
  }

  // Sweeps the actor's horizontal center from oldX to newX against vertical
  // solids. This prevents fast dashes and portal exits from stepping through a
  // thin wall while retaining Bladefall's one-way platform rules.
  function sweepHorizontal(actor, oldX, newX, solids) {
    const direction = Math.sign(newX - oldX);
    if (!direction) return Object.freeze({ x: newX, hit: null, wallDir: 0, fraction: 1 });
    const halfActor = (Number(actor && actor.w) || 0) / 2;
    const bodyBottom = Number(actor && actor.y) || 0;
    const bodyTop = bodyBottom + (Number(actor && actor.h) || 0);
    let best = null;

    for (const solid of solids || []) {
      if (!solid || solid.gone || !(solid.w > 0) || !(solid.h > 0)) continue;
      const solidBottom = solid.y - solid.h;
      const solidTop = solid.y;
      if (bodyTop - 4 <= solidBottom || bodyBottom + 4 >= solidTop) continue;
      const halfWidth = solid.w / 2 + halfActor;
      const boundary = solid.x - direction * halfWidth;
      const crossed = direction > 0
        ? oldX <= boundary && newX > boundary
        : oldX >= boundary && newX < boundary;
      if (!crossed) continue;
      const fraction = (boundary - oldX) / (newX - oldX);
      if (!best || fraction < best.fraction) best = { x: boundary, hit: solid, wallDir: direction, fraction };
    }
    return Object.freeze(best || { x: newX, hit: null, wallDir: 0, fraction: 1 });
  }

  function adjacentWall(actor, solids, tolerance, verticalSkin) {
    const epsilon = Math.max(0, Number.isFinite(tolerance) ? tolerance : 0.75);
    // Adjacent wall pieces frequently meet at a platform lip. A strict body
    // overlap test drops cling for a frame at that seam even though the art is
    // continuous, which makes return climbs feel randomly unresponsive. Keep a
    // small vertical skin around the body while still requiring a real face to
    // be horizontally adjacent.
    const skin = Math.max(0, Number.isFinite(verticalSkin) ? verticalSkin : 8);
    const bodyBottom = Number(actor && actor.y) || 0;
    const bodyTop = bodyBottom + (Number(actor && actor.h) || 0);
    const actorLeft = actor.x - actor.w / 2;
    const actorRight = actor.x + actor.w / 2;
    let best = null;
    for (const wall of solids || []) {
      if (!wall || wall.gone || !(wall.w > 0) || !(wall.h > 0)) continue;
      if (bodyTop + skin <= wall.y - wall.h || bodyBottom - skin >= wall.y) continue;
      const gapRight = wall.x - wall.w / 2 - actorRight;
      const gapLeft = actorLeft - (wall.x + wall.w / 2);
      const candidate = Math.abs(gapRight) <= epsilon
        ? { hit: wall, wallDir: 1, distance: Math.abs(gapRight) }
        : Math.abs(gapLeft) <= epsilon
          ? { hit: wall, wallDir: -1, distance: Math.abs(gapLeft) }
          : null;
      if (candidate && (!best || candidate.distance < best.distance)) best = candidate;
    }
    return best ? Object.freeze(best) : null;
  }

  function probeContacts(actor, options) {
    const settings = options || {};
    const gravity = settings.gravity === -1 ? -1 : 1;
    const floor = typeof settings.floorAt === 'function' ? settings.floorAt(actor.x, actor.y) : null;
    const ceiling = typeof settings.ceilingAt === 'function'
      ? settings.ceilingAt(actor.x, actor.y, actor.h)
      : null;
    const groundDistance = gravity === 1
      ? (floor && floor.o ? actor.y - floor.y : Infinity)
      : (ceiling && ceiling.o ? ceiling.y - (actor.y + actor.h) : Infinity);
    let left = Infinity;
    let right = Infinity;
    const bodyBottom = actor.y;
    const bodyTop = actor.y + actor.h;
    for (const wall of settings.walls || []) {
      if (!wall || wall.gone || !(wall.w > 0) || !(wall.h > 0)) continue;
      if (bodyTop <= wall.y - wall.h || bodyBottom >= wall.y) continue;
      const gapLeft = (actor.x - actor.w / 2) - (wall.x + wall.w / 2);
      const gapRight = (wall.x - wall.w / 2) - (actor.x + actor.w / 2);
      if (gapLeft >= -0.01) left = Math.min(left, gapLeft);
      if (gapRight >= -0.01) right = Math.min(right, gapRight);
    }
    return Object.freeze({
      gravity,
      groundDistance,
      ceilingDistance: ceiling && ceiling.o ? ceiling.y - (actor.y + actor.h) : Infinity,
      wallLeftDistance: left,
      wallRightDistance: right,
      grounded: !!actor.onGround,
      wall: !!actor.onWall,
    });
  }

  function traversalState(actor, world) {
    const state = world || {};
    const gravity = state.gravityFlipped ? -1 : 1;
    if (state.cartMode) return 'cart';
    if ((actor._flungT || 0) > 0) return 'portal-ballistic';
    if ((actor.dodgeTimer || 0) > 0) return 'dash';
    if (actor.onWall) return 'wall-slide';
    if (actor.onGround) {
      if (actor.floorPlat && actor.floorPlat.slope) return 'grounded-slope';
      if (actor.floorPlat && actor.floorPlat.move) return 'grounded-mover';
      if (actor.floorPlat && actor.floorPlat.ice) return 'grounded-ice';
      return 'grounded';
    }
    return actor.vy * gravity < 0 ? 'rising' : 'falling';
  }

  function createController() {
    let frame = 0;
    let previousState = null;
    let transitions = 0;
    let landings = 0;
    let wallContacts = 0;
    let snapshot = Object.freeze({ frame: 0, state: 'idle' });
    // Private state participates in opt-in TAS branching.
    root.BladefallHarness?.register("platformer:createController", () => ({ frame, previousState, transitions, landings, wallContacts, snapshot }),
      state => ({ frame, previousState, transitions, landings, wallContacts, snapshot } = state));

    function observe(actor, world, probes) {
      const state = traversalState(actor, world);
      if (previousState !== null && state !== previousState) {
        transitions++;
        if (state.startsWith('grounded')) landings++;
        if (state === 'wall-slide') wallContacts++;
      }
      previousState = state;
      snapshot = Object.freeze({
        frame: ++frame,
        state,
        transitions,
        landings,
        wallContacts,
        position: Object.freeze({ x: +actor.x.toFixed(2), y: +actor.y.toFixed(2) }),
        velocity: Object.freeze({ x: +actor.vx.toFixed(2), y: +actor.vy.toFixed(2) }),
        support: actor.floorPlat ? Object.freeze({
          type: actor.floorPlat.slope ? 'slope' : actor.floorPlat.move ? 'moving' : actor.floorPlat.ice ? 'ice' : actor.floorPlat.type,
          x: Number(actor.floorPlat.x) || 0,
          y: Number(actor.floorPlat.y) || 0,
        }) : null,
        probes: probes || null,
      });
      return snapshot;
    }

    function diagnostics() {
      return snapshot;
    }

    return Object.freeze({
      horizontalVelocity,
      blendVelocity,
      sampleSlope,
      platformMotion,
      carryByPlatform,
      departureVelocity,
      sweepHorizontal,
      adjacentWall,
      probeContacts,
      traversalState,
      observe,
      diagnostics,
      profiles: MOTION_PROFILES,
    });
  }

  root.BladefallPlatformer = Object.freeze({
    MOTION_PROFILES,
    blendVelocity,
    horizontalVelocity,
    sampleSlope,
    platformMotion,
    carryByPlatform,
    departureVelocity,
    sweepHorizontal,
    adjacentWall,
    probeContacts,
    traversalState,
    createController,
  });
})(typeof window !== 'undefined' ? window : globalThis);
