(function installBladefallCore(root) {
  'use strict';

  const API_VERSION = 1;
  const DEFAULT_FIXED_HZ = 60;

  function finiteNumber(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  // FNV-1a gives named stages, runs, and encounters stable 32-bit seeds without
  // tying future deterministic simulation to save-slot order or wall-clock time.
  function hashSeed(value) {
    const text = String(value);
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  // Mulberry32 is small, reproducible across browsers, and intentionally
  // stateful. It will replace gameplay-facing Math.random calls incrementally;
  // visual-only randomness can remain non-deterministic.
  function createRng(seed) {
    let state = typeof seed === 'number' ? seed >>> 0 : hashSeed(seed);
    return Object.freeze({
      next() {
        state = (state + 0x6d2b79f5) >>> 0;
        let value = state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
      },
      int(min, max) {
        const lo = Math.ceil(Math.min(min, max));
        const hi = Math.floor(Math.max(min, max));
        return lo + Math.floor(this.next() * (hi - lo + 1));
      },
      pick(items) {
        return items && items.length ? items[Math.floor(this.next() * items.length)] : undefined;
      },
      get state() {
        return state >>> 0;
      },
    });
  }

  function createEventBus() {
    const listeners = new Map();

    function on(type, handler) {
      if (typeof handler !== 'function') throw new TypeError('Event handler must be a function');
      let bucket = listeners.get(type);
      if (!bucket) listeners.set(type, (bucket = new Set()));
      bucket.add(handler);
      return () => {
        bucket.delete(handler);
        if (!bucket.size) listeners.delete(type);
      };
    }

    function once(type, handler) {
      let off = null;
      off = on(type, (payload) => {
        off();
        handler(payload);
      });
      return off;
    }

    function emit(type, payload) {
      const bucket = listeners.get(type);
      if (!bucket) return 0;
      const snapshot = Array.from(bucket);
      for (const handler of snapshot) handler(payload);
      return snapshot.length;
    }

    function clear(type) {
      if (type === undefined) listeners.clear();
      else listeners.delete(type);
    }

    return Object.freeze({ on, once, emit, clear });
  }

  function createFixedStepper(options) {
    const settings = options || {};
    const hz = clamp(finiteNumber(settings.hz, DEFAULT_FIXED_HZ), 1, 240);
    const fixedDt = 1 / hz;
    const maxFrame = clamp(finiteNumber(settings.maxFrame, 0.25), fixedDt, 1);
    const maxSteps = Math.max(1, Math.floor(finiteNumber(settings.maxSteps, 8)));
    const onStep = typeof settings.onStep === 'function' ? settings.onStep : function noop() {};
    let accumulator = 0;
    let tick = 0;
    let droppedSeconds = 0;

    function advance(elapsedSeconds) {
      const elapsed = clamp(finiteNumber(elapsedSeconds, 0), 0, maxFrame);
      accumulator += elapsed;
      let steps = 0;
      while (accumulator + Number.EPSILON >= fixedDt && steps < maxSteps) {
        onStep(fixedDt, tick++);
        accumulator -= fixedDt;
        steps++;
      }
      if (accumulator >= fixedDt) {
        const kept = accumulator % fixedDt;
        droppedSeconds += accumulator - kept;
        accumulator = kept;
      }
      return Object.freeze({
        steps,
        tick,
        alpha: clamp(accumulator / fixedDt, 0, 1),
        droppedSeconds,
      });
    }

    function reset() {
      accumulator = 0;
      tick = 0;
      droppedSeconds = 0;
    }

    return Object.freeze({
      advance,
      reset,
      fixedDt,
      get tick() {
        return tick;
      },
    });
  }

  function createMetrics(capacity) {
    const sampleCapacity = clamp(Math.floor(finiteNumber(capacity, 180)), 30, 3600);
    const series = new Map();

    function record(name, milliseconds) {
      if (!Number.isFinite(milliseconds) || milliseconds < 0) return;
      let samples = series.get(name);
      if (!samples) series.set(name, (samples = []));
      samples.push(milliseconds);
      if (samples.length > sampleCapacity) samples.splice(0, samples.length - sampleCapacity);
    }

    function summarize(samples) {
      if (!samples || !samples.length) return Object.freeze({ samples: 0, avg: 0, max: 0, p95: 0 });
      const sorted = samples.slice().sort((a, b) => a - b);
      const total = samples.reduce((sum, value) => sum + value, 0);
      return Object.freeze({
        samples: samples.length,
        avg: +(total / samples.length).toFixed(3),
        max: +sorted[sorted.length - 1].toFixed(3),
        p95: +sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))].toFixed(3),
      });
    }

    function snapshot() {
      const output = {};
      for (const [name, samples] of series) output[name] = summarize(samples);
      return Object.freeze(output);
    }

    function clear() {
      series.clear();
    }

    return Object.freeze({ record, snapshot, clear, capacity: sampleCapacity });
  }

  function createRuntime(options) {
    const settings = options || {};
    const fixedHz = clamp(finiteNumber(settings.fixedHz, DEFAULT_FIXED_HZ), 1, 240);
    return Object.freeze({
      apiVersion: API_VERSION,
      gameVersion: String(settings.gameVersion || 'dev'),
      fixedHz,
      fixedDt: 1 / fixedHz,
      events: createEventBus(),
      metrics: createMetrics(settings.metricSamples),
    });
  }

  root.BladefallCore = Object.freeze({
    API_VERSION,
    DEFAULT_FIXED_HZ,
    clamp,
    hashSeed,
    createRng,
    createEventBus,
    createFixedStepper,
    createMetrics,
    createRuntime,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
