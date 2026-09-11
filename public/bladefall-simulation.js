(function installBladefallSimulation(root) {
  'use strict';

  const Core = root.BladefallCore;
  if (!Core) throw new Error('BladefallSimulation requires BladefallCore');

  const TRACE_VERSION = 1;
  const INPUT_BITS = Object.freeze({
    left: 1 << 0,
    right: 1 << 1,
    down: 1 << 2,
    jump: 1 << 3,
    attack: 1 << 4,
    dodge: 1 << 5,
    portal: 1 << 6,
    flip: 1 << 7,
    command: 1 << 8,
  });

  function createSeed() {
    try {
      if (root.crypto && typeof root.crypto.getRandomValues === 'function') {
        const values = new Uint32Array(1);
        root.crypto.getRandomValues(values);
        return values[0] >>> 0;
      }
    } catch (error) {}
    return Core.hashSeed(`${Date.now()}:${Math.random()}`);
  }

  function quantizeAxis(value) {
    return Math.round(Core.clamp(Number(value) || 0, -1, 1) * 127);
  }

  function encodeInput(frame) {
    const source = frame || {};
    let bits = 0;
    for (const [name, bit] of Object.entries(INPUT_BITS)) if (source[name]) bits |= bit;
    return Object.freeze({ bits, x: quantizeAxis(source.x), y: quantizeAxis(source.y) });
  }

  function decodeInput(encoded) {
    const value = encoded || { bits: 0, x: 0, y: 0 };
    const output = { x: value.x / 127, y: value.y / 127 };
    for (const [name, bit] of Object.entries(INPUT_BITS)) output[name] = !!(value.bits & bit);
    return Object.freeze(output);
  }

  function createTraceRecorder(fixedHz, maxTicks) {
    const frames = [];
    const stages = [];
    const limit = Math.max(fixedHz * 60, Math.floor(maxTicks || fixedHz * 60 * 180));
    let totalTicks = 0;
    let truncated = false;

    function record(tick, frame) {
      if (totalTicks >= limit) {
        truncated = true;
        return;
      }
      const encoded = encodeInput(frame);
      const previous = frames[frames.length - 1];
      if (previous && previous[0] + previous[1] === tick
        && previous[2] === encoded.bits && previous[3] === encoded.x && previous[4] === encoded.y) {
        previous[1]++;
      } else {
        frames.push([tick, 1, encoded.bits, encoded.x, encoded.y]);
      }
      totalTicks++;
    }

    function markStage(tick, stage, seed) {
      stages.push(Object.freeze({ tick, stage, seed: seed >>> 0 }));
    }

    function exportTrace(runSeed) {
      return Object.freeze({
        version: TRACE_VERSION,
        fixedHz,
        runSeed: runSeed >>> 0,
        ticks: totalTicks,
        truncated,
        stages: stages.map((marker) => Object.freeze({ ...marker })),
        frames: frames.map((run) => Object.freeze(run.slice())),
      });
    }

    return Object.freeze({ record, markStage, exportTrace,
      capture: () => ({ frames, stages, totalTicks, truncated }),
      restore(state) {
        frames.splice(0, frames.length, ...state.frames);
        stages.splice(0, stages.length, ...state.stages);
        totalTicks = state.totalTicks; truncated = state.truncated;
      },
    });
  }

  function createReplay(trace) {
    if (!trace || trace.version !== TRACE_VERSION || !Array.isArray(trace.frames)) {
      throw new Error('Unsupported Bladefall input trace');
    }
    let runIndex = 0;
    let offset = 0;
    let tick = 0;

    function next() {
      const run = trace.frames[runIndex];
      if (!run) return null;
      const frame = decodeInput({ bits: run[2], x: run[3], y: run[4] });
      const result = Object.freeze({ tick, frame });
      tick++;
      offset++;
      if (offset >= run[1]) {
        runIndex++;
        offset = 0;
      }
      return result;
    }

    function reset() {
      runIndex = 0;
      offset = 0;
      tick = 0;
    }

    return Object.freeze({
      next,
      reset,
      get done() {
        return runIndex >= trace.frames.length;
      },
      get tick() {
        return tick;
      },
    });
  }

  function createSimulation(options) {
    const settings = options || {};
    const fixedHz = Math.max(1, Math.min(240, Number(settings.fixedHz) || 60));
    const fixedDt = 1 / fixedHz;
    let runSeed = 0;
    let stageSeed = 0;
    let tick = 0;
    let stageTick = 0;
    let stage = -1;
    let streams = new Map();
    let trace = createTraceRecorder(fixedHz, settings.maxTraceTicks);
    if (settings.harness) root.BladefallHarness?.register('simulation',
      () => ({ runSeed, stageSeed, tick, stageTick, stage,
        streams: [...streams].map(([name, rng]) => [name, rng.state]), trace: trace.capture() }),
      state => {
        ({ runSeed, stageSeed, tick, stageTick, stage } = state);
        streams = new Map(state.streams.map(([name, seed]) => [name, Core.createRng(seed)]));
        trace.restore(state.trace);
      });

    function startRun(seed) {
      runSeed = Number.isFinite(seed) ? seed >>> 0
        : settings.harness === true && Number.isFinite(settings.fixedSeed)
          ? settings.fixedSeed >>> 0 : createSeed();
      stageSeed = 0;
      tick = 0;
      stageTick = 0;
      stage = -1;
      streams = new Map();
      trace = createTraceRecorder(fixedHz, settings.maxTraceTicks);
      return runSeed;
    }

    function beginStage(stageIndex, sharedSeed) {
      stage = stageIndex;
      stageSeed = Number.isFinite(sharedSeed)
        ? sharedSeed >>> 0
        : Core.hashSeed(`${runSeed}:stage:${stageIndex}`);
      stageTick = 0;
      streams = new Map();
      trace.markStage(tick, stage, stageSeed);
      return stageSeed;
    }

    function stream(name) {
      const key = String(name || 'gameplay');
      let rng = streams.get(key);
      if (!rng) {
        rng = Core.createRng(Core.hashSeed(`${stageSeed}:${key}`));
        streams.set(key, rng);
      }
      return rng;
    }

    function random(name) {
      return stream(name).next();
    }

    function int(name, min, max) {
      return stream(name).int(min, max);
    }

    function chance(name, probability) {
      return random(name) < Core.clamp(Number(probability) || 0, 0, 1);
    }

    function pick(name, values) {
      return stream(name).pick(values);
    }

    function step(inputFrame, onStep) {
      if (typeof onStep !== 'function') throw new TypeError('Simulation step requires a callback');
      trace.record(tick, inputFrame);
      onStep(fixedDt, tick, inputFrame);
      tick++;
      stageTick++;
      return tick;
    }

    function exportTrace() {
      return trace.exportTrace(runSeed);
    }

    function snapshot() {
      return Object.freeze({ runSeed, stageSeed, stage, tick, stageTick, fixedHz, fixedDt });
    }

    return Object.freeze({
      startRun,
      beginStage,
      random,
      int,
      chance,
      pick,
      step,
      exportTrace,
      snapshot,
      fixedHz,
      fixedDt,
      get runSeed() {
        return runSeed;
      },
      get stageSeed() {
        return stageSeed;
      },
      get tick() {
        return tick;
      },
    });
  }

  root.BladefallSimulation = Object.freeze({
    TRACE_VERSION,
    INPUT_BITS,
    createSeed,
    encodeInput,
    decodeInput,
    createReplay,
    createSimulation,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
