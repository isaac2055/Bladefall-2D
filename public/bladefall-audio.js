(function installBladefallAudio(root) {
  'use strict';

  const SURFACES = Object.freeze({
    stone: Object.freeze({ gain: 0.82, pitch: 1, caption: 'stone impact' }),
    ice: Object.freeze({ gain: 0.68, pitch: 1.28, caption: 'ice scrape' }),
    brittle: Object.freeze({ gain: 0.92, pitch: 0.86, caption: 'rock crack' }),
    slate: Object.freeze({ gain: 0.76, pitch: 1.12, caption: 'slate step' }),
    metal: Object.freeze({ gain: 0.72, pitch: 1.35, caption: 'metal clang' }),
    fluid: Object.freeze({ gain: 0.62, pitch: 0.72, caption: 'splash' }),
  });

  const CUES = Object.freeze({
    'muster-bell': Object.freeze({ category: 'combat', gain: 1, duck: 0.6, caption: 'a deep bell; iron answering in the distance' }),
    slash: Object.freeze({ category: 'combat', gain: 0.82, duck: 0.02, caption: 'blade swing' }),
    shoot: Object.freeze({ category: 'combat', gain: 0.84, duck: 0.02, caption: 'projectile fired' }),
    hit: Object.freeze({ category: 'combat', gain: 1, duck: 0.13, caption: 'hit confirmed' }),
    hurt: Object.freeze({ category: 'combat', gain: 1, duck: 0.34, caption: 'player hurt' }),
    enemyDie: Object.freeze({ category: 'combat', gain: 0.95, duck: 0.12, caption: 'enemy defeated' }),
    boss: Object.freeze({ category: 'combat', gain: 1, duck: 0.22, caption: 'boss impact' }),
    jump: Object.freeze({ category: 'movement', gain: 0.62, duck: 0, caption: 'jump' }),
    land: Object.freeze({ category: 'movement', gain: 0.72, duck: 0.03, caption: 'landing' }),
    dodge: Object.freeze({ category: 'movement', gain: 0.72, duck: 0, caption: 'dash' }),
    pickup: Object.freeze({ category: 'ui', gain: 0.8, duck: 0.06, caption: 'item collected' }),
    levelup: Object.freeze({ category: 'ui', gain: 0.92, duck: 0.14, caption: 'level gained' }),
    magic: Object.freeze({ category: 'combat', gain: 0.82, duck: 0.04, caption: 'magic cast' }),
    win: Object.freeze({ category: 'ui', gain: 1, duck: 0.42, caption: 'victory' }),
  });

  const DEFAULT_SETTINGS = Object.freeze({
    soundOn: true,
    musicVolume: 0.4,
    sfxVolume: 0.8,
    dynamicAudio: true,
    nightMode: false,
    captions: false,
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

  function createAudioDirector(options) {
    let settings = { ...DEFAULT_SETTINGS, ...(options || {}) };
    let intensity = 0;
    let duck = 0;
    let lastMix = null;
    let cueCount = 0;
    let lastCue = null;
    // Private state participates in opt-in TAS branching.
    root.BladefallHarness?.register("audio:createAudioDirector", () => ({ settings, intensity, duck, lastMix, cueCount, lastCue }),
      state => ({ settings, intensity, duck, lastMix, cueCount, lastCue } = state));

    function applySettings(next) {
      settings = { ...settings, ...(next || {}) };
      settings.musicVolume = clamp(finite(settings.musicVolume, 0.4), 0, 1);
      settings.sfxVolume = clamp(finite(settings.sfxVolume, 0.8), 0, 1);
      return Object.freeze({ ...settings });
    }

    function threatTarget(frame) {
      const state = frame || {};
      const hpPressure = 1 - clamp(finite(state.hpFraction, 1), 0, 1);
      const enemyPressure = clamp(finite(state.nearbyEnemies, 0) / 6, 0, 1);
      const comboPressure = clamp(finite(state.combo, 0) / 20, 0, 0.35);
      const bossPressure = state.boss ? 0.78 : 0;
      return clamp(Math.max(bossPressure, enemyPressure * 0.68, hpPressure * 0.62) + comboPressure, 0, 1);
    }

    function update(frame, dt) {
      const state = frame || {};
      const target = settings.dynamicAudio ? threatTarget(state) : state.boss ? 0.65 : 0.18;
      intensity = approach(intensity, target, target > intensity ? 3.8 : 1.35, dt);
      duck = Math.max(0, duck - Math.max(0, dt) * 1.8);
      const paused = !!state.paused;
      const enabled = settings.soundOn ? 1 : 0;
      const dynamicBed = settings.dynamicAudio ? 1 - intensity * 0.12 : 1;
      const musicGain = enabled * settings.musicVolume * dynamicBed * (1 - duck * 0.62) * (paused ? 0.58 : 1);
      const lowpassHz = settings.dynamicAudio ? Math.round(18000 - intensity * 7200 - duck * 4800) : 18000;
      lastMix = Object.freeze({
        intensity: +intensity.toFixed(4),
        duck: +duck.toFixed(4),
        musicGain: +clamp(musicGain, 0, 1).toFixed(4),
        lowpassHz: clamp(lowpassHz, 1800, 20000),
        layer: intensity > 0.72 ? 'climax' : intensity > 0.38 ? 'tension' : 'exploration',
      });
      return lastMix;
    }

    function spatialPan(x, cameraX, viewportWidth) {
      if (!Number.isFinite(x) || !Number.isFinite(cameraX) || !Number.isFinite(viewportWidth) || viewportWidth <= 0) return 0;
      return clamp(((x - cameraX) / viewportWidth - 0.5) * 1.65, -0.85, 0.85);
    }

    function cue(type, context) {
      const spec = CUES[type] || Object.freeze({ category: 'ambient', gain: 0.7, duck: 0, caption: type || 'sound' });
      const value = context || {};
      duck = Math.max(duck, finite(value.duck, spec.duck));
      const categoryMul = spec.category === 'movement' ? 0.82 : spec.category === 'ui' ? 0.9 : 1;
      const nightCompression = settings.nightMode && spec.category === 'combat' ? 0.68 : 1;
      const gain = (settings.soundOn ? 1 : 0) * settings.sfxVolume * spec.gain * categoryMul * nightCompression;
      const result = Object.freeze({
        type,
        category: spec.category,
        gain: clamp(gain, 0, 1),
        pan: spatialPan(value.x, value.cameraX, value.viewportWidth),
        caption: settings.captions ? spec.caption : null,
      });
      cueCount++;
      lastCue = result;
      return result;
    }

    function surface(material) {
      const id = typeof material === 'string' ? material : material && material.id;
      return SURFACES[id] || SURFACES.stone;
    }

    function diagnostics() {
      return Object.freeze({
        settings: Object.freeze({ ...settings }),
        intensity: +intensity.toFixed(4),
        duck: +duck.toFixed(4),
        mix: lastMix,
        cueCount,
        lastCue,
      });
    }

    applySettings(settings);
    return Object.freeze({ update, cue, surface, spatialPan, applySettings, diagnostics });
  }

  root.BladefallAudio = Object.freeze({
    SURFACES,
    CUES,
    DEFAULT_SETTINGS,
    createAudioDirector,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
