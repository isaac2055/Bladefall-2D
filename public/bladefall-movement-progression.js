(function installBladefallMovementProgression(root) {
  'use strict';

  const SCHEMA = 'bladefall.progressive-movement';
  const VERSION = 1;
  const capabilities = root.BladefallCapabilities;
  if (!capabilities) throw new Error('BladefallMovementProgression requires BladefallCapabilities');

  const ACTION_REQUIREMENTS = Object.freeze({
    jump: 'jump',
    dash: 'dash',
    'wall-jump': 'wall-jump',
    'double-jump': 'double-jump',
    'downward-strike': 'downward-strike',
    'gravity-flip': 'gravity-flip',
  });

  const TUNING = Object.freeze({
    runSpeed: 200,
    jumpVelocity: 480,
    secondJumpVelocity: 450,
    jumpBufferSeconds: 0.12,
    coyoteSeconds: 0.1,
    jumpCutVelocity: 170,
    dashDurationSeconds: 0.22,
    dashSpeedMultiplier: 3,
    dashGravityScale: 0.15,
    dashFallCap: 140,
    wallCoyoteSeconds: 0.09,
    wallJumpHorizontalVelocity: 350,
    wallJumpVerticalVelocity: 500,
    wallSlideVelocity: 80,
    downwardStrikeVelocity: 1400,
    downwardStrikeCooldownSeconds: 1.3,
  });

  const FEEDBACK = Object.freeze({
    dash: 'A DASH MEMORY IS MISSING',
    'wall-jump': 'THE WALL FEELS FAMILIAR',
    'double-jump': 'A SECOND LEAP IS FORGOTTEN',
    'downward-strike': 'THE FALL HAS NO EDGE YET',
    'gravity-flip': 'GRAVITY WILL NOT ANSWER',
  });

  function profile(raw) {
    const state = capabilities.createState(raw);
    const has = (id) => state.acquired.includes(id);
    return Object.freeze({
      jump: has('jump'),
      dash: has('dash'),
      wallJump: has('wall-jump'),
      doubleJump: has('double-jump'),
      downwardStrike: has('downward-strike'),
      gravityFlip: has('gravity-flip'),
      maxJumps: has('double-jump') ? 2 : has('jump') ? 1 : 0,
      acquired: Object.freeze(state.acquired.filter((id) => Object.values(ACTION_REQUIREMENTS).includes(id))),
      tuning: TUNING,
    });
  }

  function eligibility(raw, action, context) {
    const requirement = ACTION_REQUIREMENTS[action];
    const state = profile(raw);
    const ctx = context && typeof context === 'object' ? context : {};
    if (!requirement) return Object.freeze({ allowed: false, reason: 'unknown-action', action });
    if (!capabilities.has(raw, requirement))
      return Object.freeze({ allowed: false, reason: 'capability-locked', action, requirement, feedback: FEEDBACK[action] || 'A MEMORY IS MISSING' });
    if (action === 'double-jump' && ctx.grounded)
      return Object.freeze({ allowed: false, reason: 'grounded', action, requirement });
    if (action === 'wall-jump' && !ctx.wallContact)
      return Object.freeze({ allowed: false, reason: 'no-wall-contact', action, requirement });
    if (action === 'downward-strike' && (ctx.grounded || ctx.cartMode))
      return Object.freeze({ allowed: false, reason: ctx.cartMode ? 'cart-mode' : 'grounded', action, requirement });
    if (action === 'gravity-flip' && !ctx.gravityField)
      return Object.freeze({ allowed: false, reason: 'no-gravity-field', action, requirement });
    return Object.freeze({ allowed: true, reason: 'ready', action, requirement, profile: state });
  }

  function syncPlayer(player, raw) {
    const p = player && typeof player === 'object' ? player : {};
    const state = profile(raw);
    const changes = [];
    function set(key, value) {
      if (p[key] === value) return;
      p[key] = value;
      changes.push(key);
    }
    set('maxJumps', state.maxJumps);
    set('hasSlam', state.downwardStrike);
    if (!Number.isFinite(p.jumps) || p.jumps < 0) set('jumps', 0);
    else if (p.jumps > state.maxJumps) set('jumps', state.maxJumps);
    if (!state.dash) {
      set('dodgeTimer', 0);
      set('dodgeCdT', 0);
      set('dashBuf', 0);
    }
    if (!state.wallJump) set('wallCoyote', 0);
    if (!state.downwardStrike) set('slamming', false);
    return Object.freeze({ changed: changes.length > 0, changes: Object.freeze(changes), profile: state });
  }

  function syncWorld(world, raw) {
    const target = world && typeof world === 'object' ? world : {};
    const state = profile(raw);
    const changed = !state.gravityFlip && !!target.gravityFlipped;
    if (changed) target.gravityFlipped = false;
    return Object.freeze({ changed, profile: state });
  }

  function jumpVelocity(raw, airborne) {
    const state = profile(raw);
    if (!state.jump) return 0;
    if (airborne && !state.doubleJump) return 0;
    return airborne ? TUNING.secondJumpVelocity : TUNING.jumpVelocity;
  }

  function refill(raw) {
    const state = profile(raw);
    return Object.freeze({
      jumps: 0,
      dashReady: state.dash,
      maxJumps: state.maxJumps,
    });
  }

  function validate() {
    const errors = [];
    const fresh = profile(capabilities.freshState());
    if (!fresh.jump || fresh.maxJumps !== 1) errors.push('fresh movement must contain exactly one jump');
    for (const key of ['dash', 'wallJump', 'doubleJump', 'downwardStrike', 'gravityFlip'])
      if (fresh[key]) errors.push(`fresh movement leaked ${key}`);
    const ids = Object.values(ACTION_REQUIREMENTS);
    if (new Set(ids).size !== ids.length) errors.push('movement actions must map to unique capabilities');
    for (const id of ids) if (!capabilities.abilities.some((ability) => ability.id === id)) errors.push(`${id}:unknown-capability`);
    for (const [key, value] of Object.entries(TUNING)) if (!(Number.isFinite(value) && value > 0)) errors.push(`${key}:invalid-tuning`);
    if (!(TUNING.secondJumpVelocity < TUNING.jumpVelocity)) errors.push('second jump must not exceed the opening jump');
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), actions: ids.length, startingJumps: fresh.maxJumps });
  }

  root.BladefallMovementProgression = Object.freeze({
    SCHEMA,
    VERSION,
    ACTION_REQUIREMENTS,
    TUNING,
    profile,
    eligibility,
    syncPlayer,
    syncWorld,
    jumpVelocity,
    refill,
    validate,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
