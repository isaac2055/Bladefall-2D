(function installBladefallCamera(root) {
  'use strict';

  const DEFAULT_SETTINGS = Object.freeze({
    cameraAssist: true,
    reducedMotion: false,
    screenShake: 1,
  });

  function finite(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function approach(current, target, response, dt) {
    return current + (target - current) * (1 - Math.exp(-response * Math.max(0, dt)));
  }

  function createCameraController(options) {
    let settings = { ...DEFAULT_SETTINGS, ...(options || {}) };
    let x = 0;
    let y = 0;
    let lookAhead = 0;
    let fallLook = 0;
    let anchorBias = 1;
    let framing = 'player';
    let updates = 0;
    let last = null;
    // Private state participates in opt-in TAS branching.
    root.BladefallHarness?.register("camera:createCameraController", () => ({ settings, x, y, lookAhead, fallLook, anchorBias, framing, updates, last }),
      state => ({ settings, x, y, lookAhead, fallLook, anchorBias, framing, updates, last } = state));

    function applySettings(next) {
      settings = { ...settings, ...(next || {}) };
      settings.screenShake = clamp(finite(settings.screenShake, 1), 0, 1);
      if (settings.reducedMotion) lookAhead = 0;
      return Object.freeze({ ...settings });
    }

    function reset(nextX, nextY) {
      x = finite(nextX, 0);
      y = finite(nextY, 0);
      lookAhead = 0; fallLook = 0; anchorBias = 1;
      framing = 'player';
      last = null;
    }

    function sync(nextX, nextY) {
      x = finite(nextX, x);
      y = finite(nextY, y);
    }

    function update(frame, dt) {
      const state = frame || {};
      const player = state.player || { x: 0, y: 0, vx: 0, face: 1 };
      const partner = state.partner && !state.partner.dead ? state.partner : null;
      const boss = state.boss && !state.boss.dead ? state.boss : null;
      const viewportWidth = Math.max(1, finite(state.viewportWidth, 1280));
      const levelLength = Math.max(viewportWidth, finite(state.levelLength, viewportWidth));
      const verticalThreshold = finite(state.verticalThreshold, 420);
      const minimumY = finite(state.minimumY, 0);
      const face = finite(player.face, 1) || 1;
      const velocityLook = clamp(finite(player.vx, 0) * 0.18, -viewportWidth * 0.12, viewportWidth * 0.12);
      const facingLook = face * viewportWidth * 0.075;
      const targetLook = settings.cameraAssist && !settings.reducedMotion ? velocityLook + facingLook : 0;
      lookAhead = approach(lookAhead, targetLook, 4.5, dt);

      let focusX = finite(player.x, 0);
      let highY = finite(player.y, 0);
      framing = 'player';
      if (partner) {
        focusX = (focusX + finite(partner.x, focusX)) * 0.5;
        highY = Math.max(highY, finite(partner.y, highY));
        framing = 'coop';
      }
      if (boss && Math.abs(finite(boss.x, focusX) - focusX) < viewportWidth * 1.25) {
        focusX = focusX * 0.58 + finite(boss.x, focusX) * 0.42;
        highY = Math.max(highY, finite(boss.y, highY));
        framing = partner ? 'coop-boss' : 'boss';
      }

      // THE ANCHOR FOLLOWS TRAVEL. Fixed at .38 of the view from the left, a player
      // walking WEST saw about 620 units ahead against 930 walking east — which is
      // backwards in three regions that are now authored right to left. It eases,
      // so it never snaps, and it reduces to the old value on a rightward run.
      const lean = settings.cameraAssist && !settings.reducedMotion ? clamp(finite(player.vx, 0) / 200, -1, 1) : 0;
      anchorBias = approach(anchorBias, lean, 2.6, dt);
      const anchorFrac = framing === 'player' ? 0.5 - anchorBias * 0.12 : 0.5;
      const anchor = viewportWidth * anchorFrac;
      const desiredX = clamp(focusX + lookAhead - anchor, 0, Math.max(0, levelLength - viewportWidth));
      // FALL LOOK-AHEAD. The camera only ever led horizontally, which is fine on a
      // road and useless in a shaft: a long drop spent most of its time looking at
      // where you had been. Smoothed, capped, and off under reduced motion.
      const targetFall = settings.reducedMotion ? 0 : clamp(finite(player.vy, 0) * 0.17, -260, 260);
      fallLook = approach(fallLook, targetFall, 4.5, dt);
      const desiredY = Math.max(minimumY, highY - verticalThreshold + fallLook);
      const response = settings.reducedMotion ? 12 : framing.includes('boss') ? 5.6 : 7.2;
      x = approach(x, desiredX, response, dt);
      y = approach(y, desiredY, settings.reducedMotion ? 12 : 7.5, dt);
      if (Math.abs(desiredX - x) < 0.02) x = desiredX;
      if (Math.abs(desiredY - y) < 0.02) y = desiredY;
      updates++;
      last = Object.freeze({
        x,
        y,
        desiredX,
        desiredY,
        lookAhead,
        focusX,
        framing,
      });
      return last;
    }

    function shakeOffset(time, trauma) {
      const amount = settings.reducedMotion ? 0 : clamp(finite(trauma, 0), 0, 24) * settings.screenShake;
      if (amount <= 0) return Object.freeze({ x: 0, y: 0 });
      const t = finite(time, 0);
      const envelope = amount * amount / 24;
      return Object.freeze({
        x: Math.sin(t * 71.3 + 1.7) * envelope,
        y: Math.sin(t * 89.9 + 4.1) * envelope * 0.72,
      });
    }

    function diagnostics() {
      return Object.freeze({
        x,
        y,
        lookAhead,
        framing,
        updates,
        settings: Object.freeze({ ...settings }),
        last,
      });
    }

    applySettings(settings);
    return Object.freeze({ update, shakeOffset, reset, sync, applySettings, diagnostics });
  }

  root.BladefallCamera = Object.freeze({
    DEFAULT_SETTINGS,
    createCameraController,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
