(function installBladefallMultiplayer(root) {
  'use strict';

  const PROTOCOL_VERSION = 2;
  const CHANNELS = Object.freeze({
    control: 'control',
    event: 'event',
    input: 'input',
    snapshot: 'snapshot',
  });
  const DEFAULTS = Object.freeze({
    interpolationMs: 100,
    extrapolationMs: 120,
    reliableRetryMs: 350,
    reliableMaxAgeMs: 5000,
    softCorrection: 0.18,
    hardCorrection: 180,
  });

  function finite(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function channelFor(type) {
    if (type === 'input' || type === 'p') return CHANNELS.input;
    if (type === 'snapshot' || type === 'w') return CHANNELS.snapshot;
    if (/^(attack|combat|enemy|battleHit|battleRound|down|revive|portals|portalIntent|interact|traveler|remix)/.test(type)) {
      return CHANNELS.event;
    }
    return CHANNELS.control;
  }

  function reliableFor(channel) {
    return channel === CHANNELS.control || channel === CHANNELS.event;
  }

  function copyState(state) {
    if (!state || typeof state !== 'object') return {};
    return { ...state };
  }

  function interpolateState(a, b, alpha) {
    const output = {};
    const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
    for (const key of keys) {
      const av = a && a[key];
      const bv = b && b[key];
      output[key] = Number.isFinite(av) && Number.isFinite(bv)
        ? av + (bv - av) * alpha
        : alpha < 0.5 ? av : bv;
    }
    return output;
  }

  function createSnapshotBuffer(options) {
    const settings = { ...DEFAULTS, ...(options || {}) };
    const capacity = Math.max(3, Math.floor(finite(settings.capacity, 32)));
    const frames = [];

    function push(state, receivedAt, sequence) {
      const at = finite(receivedAt, Date.now());
      const seq = Math.max(0, Math.floor(finite(sequence, frames.length + 1)));
      const last = frames[frames.length - 1];
      if (last && seq <= last.sequence) return false;
      frames.push({ state: copyState(state), receivedAt: at, sequence: seq });
      if (frames.length > capacity) frames.splice(0, frames.length - capacity);
      return true;
    }

    function sample(now) {
      if (!frames.length) return null;
      const target = finite(now, Date.now()) - settings.interpolationMs;
      while (frames.length > 2 && frames[1].receivedAt <= target) frames.shift();
      const first = frames[0];
      const second = frames[1];
      if (second && target >= first.receivedAt && target <= second.receivedAt) {
        const span = Math.max(1, second.receivedAt - first.receivedAt);
        return interpolateState(first.state, second.state, clamp((target - first.receivedAt) / span, 0, 1));
      }
      const latest = frames[frames.length - 1];
      const age = clamp(target - latest.receivedAt, 0, settings.extrapolationMs);
      const projected = copyState(latest.state);
      if (Number.isFinite(projected.x) && Number.isFinite(projected.vx)) projected.x += projected.vx * age / 1000;
      // Bladefall stores vertical velocity in screen-opposite coordinates.
      if (Number.isFinite(projected.y) && Number.isFinite(projected.vy)) projected.y -= projected.vy * age / 1000;
      return projected;
    }

    function clear() {
      frames.length = 0;
    }

    return Object.freeze({
      push,
      sample,
      clear,
      get size() { return frames.length; },
      latest() { return frames.length ? copyState(frames[frames.length - 1].state) : null; },
    });
  }

  function reconcileState(local, authoritative, options) {
    const settings = { ...DEFAULTS, ...(options || {}) };
    const current = copyState(local);
    const canonical = copyState(authoritative);
    const dx = finite(canonical.x, current.x || 0) - finite(current.x, 0);
    const dy = finite(canonical.y, current.y || 0) - finite(current.y, 0);
    const error = Math.hypot(dx, dy);
    if (error >= settings.hardCorrection) {
      return { state: { ...current, ...canonical }, error, corrected: 'hard' };
    }
    if (error > 0.5) {
      current.x = finite(current.x, 0) + dx * settings.softCorrection;
      current.y = finite(current.y, 0) + dy * settings.softCorrection;
      if (Number.isFinite(canonical.vx)) current.vx = finite(current.vx, 0) + (canonical.vx - finite(current.vx, 0)) * 0.12;
      if (Number.isFinite(canonical.vy)) current.vy = finite(current.vy, 0) + (canonical.vy - finite(current.vy, 0)) * 0.12;
      return { state: current, error, corrected: 'soft' };
    }
    return { state: current, error, corrected: false };
  }

  function validateRemoteState(previous, candidate, elapsedMs, bounds) {
    const prior = copyState(previous);
    const next = copyState(candidate);
    const limits = bounds || {};
    const elapsed = clamp(finite(elapsedMs, 33), 8, 500) / 1000;
    const maxSpeed = Math.max(200, finite(limits.maxSpeed, 920));
    const slack = Math.max(20, finite(limits.slack, 72));
    const maxTravel = maxSpeed * elapsed + slack;
    const dx = finite(next.x, prior.x || 0) - finite(prior.x, 0);
    const dy = finite(next.y, prior.y || 0) - finite(prior.y, 0);
    const distance = Math.hypot(dx, dy);
    if (distance > maxTravel && distance > 0) {
      const scale = maxTravel / distance;
      next.x = finite(prior.x, 0) + dx * scale;
      next.y = finite(prior.y, 0) + dy * scale;
    }
    next.x = clamp(finite(next.x, prior.x || 0), finite(limits.minX, 20), finite(limits.maxX, 1e9));
    next.y = clamp(finite(next.y, prior.y || 0), finite(limits.minY, -120), finite(limits.maxY, 5000));
    next.vx = clamp(finite(next.vx, 0), -maxSpeed, maxSpeed);
    next.vy = clamp(finite(next.vy, 0), -maxSpeed * 1.8, maxSpeed * 1.8);
    return Object.freeze({ state: next, clamped: distance > maxTravel, distance, maxTravel });
  }

  function createEndpoint(options) {
    const settings = { ...DEFAULTS, ...(options || {}) };
    let epoch = Math.max(0, Math.floor(finite(settings.epoch, 0)));
    let role = settings.role || null;
    const sent = new Map();
    const received = new Map();
    const pending = new Map();
    const seenReliable = new Set();
    const statistics = {
      sent: 0, received: 0, stale: 0, duplicate: 0, invalid: 0, gaps: 0, resent: 0,
    };

    function nextSequence(channel) {
      const value = (sent.get(channel) || 0) + 1;
      sent.set(channel, value);
      return value;
    }

    function acknowledgements() {
      const ack = {};
      for (const [channel, sequence] of received) ack[channel] = sequence;
      return ack;
    }

    function encode(type, payload, options) {
      const opts = options || {};
      const channel = opts.channel || channelFor(type);
      const reliable = opts.reliable === undefined ? reliableFor(channel) : !!opts.reliable;
      const sequence = nextSequence(channel);
      const packet = {
        v: PROTOCOL_VERSION,
        e: epoch,
        c: channel,
        s: sequence,
        a: acknowledgements(),
        r: reliable ? 1 : 0,
        t: type,
        p: payload || {},
      };
      statistics.sent++;
      if (reliable) pending.set(`${channel}:${sequence}`, {
        packet,
        firstSentAt: finite(opts.now, Date.now()),
        lastSentAt: finite(opts.now, Date.now()),
      });
      return packet;
    }

    function applyAcks(ack) {
      if (!ack || typeof ack !== 'object') return;
      for (const [key, record] of pending) {
        const channel = record.packet.c;
        if (finite(ack[channel], 0) >= record.packet.s) pending.delete(key);
      }
    }

    function receive(packet) {
      if (!packet || typeof packet !== 'object') {
        statistics.invalid++;
        return { accepted: false, reason: 'invalid' };
      }
      // Rooms created by pre-protocol builds can still finish their current run.
      if (!Number.isFinite(packet.v) && packet.t) {
        statistics.received++;
        return { accepted: true, legacy: true, type: packet.t, payload: packet, channel: channelFor(packet.t) };
      }
      if (packet.v !== PROTOCOL_VERSION || !packet.t || !packet.c || !Number.isFinite(packet.s)) {
        statistics.invalid++;
        return { accepted: false, reason: 'version' };
      }
      applyAcks(packet.a);
      if (packet.e < epoch) {
        statistics.stale++;
        return { accepted: false, reason: 'stale-epoch' };
      }
      if (packet.e > epoch) {
        statistics.stale++;
        return { accepted: false, reason: 'future-epoch', futureEpoch: packet.e };
      }
      const last = received.get(packet.c) || 0;
      const key = `${packet.e}:${packet.c}:${packet.s}`;
      if (packet.r && seenReliable.has(key) || !packet.r && packet.s <= last) {
        statistics.duplicate++;
        return { accepted: false, reason: 'duplicate' };
      }
      if (packet.s > last + 1) statistics.gaps += packet.s - last - 1;
      received.set(packet.c, Math.max(last, packet.s));
      if (packet.r) {
        seenReliable.add(key);
        if (seenReliable.size > 512) seenReliable.delete(seenReliable.values().next().value);
      }
      statistics.received++;
      return {
        accepted: true,
        type: packet.t,
        payload: packet.p || {},
        channel: packet.c,
        sequence: packet.s,
        reliable: !!packet.r,
        epoch: packet.e,
      };
    }

    function due(now) {
      const time = finite(now, Date.now());
      const output = [];
      for (const [key, record] of pending) {
        if (time - record.firstSentAt > settings.reliableMaxAgeMs) {
          pending.delete(key);
          continue;
        }
        if (time - record.lastSentAt >= settings.reliableRetryMs) {
          record.lastSentAt = time;
          record.packet.a = acknowledgements();
          output.push(record.packet);
          statistics.resent++;
        }
      }
      return output;
    }

    function advanceEpoch(nextEpoch) {
      epoch = nextEpoch === undefined ? epoch + 1 : Math.max(epoch + 1, Math.floor(nextEpoch));
      sent.clear();
      received.clear();
      pending.clear();
      seenReliable.clear();
      return epoch;
    }

    function syncEpoch(nextEpoch) {
      const value = Math.max(0, Math.floor(finite(nextEpoch, epoch)));
      if (value === epoch) return epoch;
      epoch = value;
      sent.clear();
      received.clear();
      pending.clear();
      seenReliable.clear();
      return epoch;
    }

    return Object.freeze({
      encode,
      receive,
      due,
      advanceEpoch,
      syncEpoch,
      setRole(value) { role = value || null; },
      diagnostics() {
        return Object.freeze({
          version: PROTOCOL_VERSION,
          role,
          epoch,
          pendingReliable: pending.size,
          ...statistics,
        });
      },
      get epoch() { return epoch; },
      get role() { return role; },
    });
  }

  function createTransitionBarrier(options) {
    const settings = options || {};
    let state = null;
    let tokenSequence = 0;

    function open(stage, epoch) {
      state = {
        stage,
        epoch: Math.max(0, Math.floor(finite(epoch, 0))),
        token: null,
        to: null,
        seed: null,
        localReady: false,
        remoteReady: false,
        localLoaded: false,
        remoteLoaded: false,
        phase: 'voting',
      };
      return snapshot();
    }

    function ensure(stage, epoch) {
      return state && state.stage === stage && state.epoch === epoch ? snapshot() : open(stage, epoch);
    }

    function ready(side, value) {
      if (!state || state.phase !== 'voting') return snapshot();
      state[side === 'remote' ? 'remoteReady' : 'localReady'] = value !== false;
      return snapshot();
    }

    function prepare(to, seed, token) {
      if (!state || !state.localReady || !state.remoteReady || state.phase !== 'voting') return null;
      state.token = token || `${state.epoch + 1}-${++tokenSequence}`;
      state.to = to;
      state.seed = seed;
      state.phase = 'prepared';
      return snapshot();
    }

    function acceptPrepare(message) {
      if (!state || !message || message.from !== state.stage || message.epoch !== state.epoch) return false;
      state.localReady = true;
      state.remoteReady = true;
      state.token = message.token;
      state.to = message.to;
      state.seed = message.seed;
      state.phase = 'prepared';
      return true;
    }

    function beginLoad(token) {
      if (!state || state.token !== token || state.phase === 'voting') return false;
      state.phase = 'loading';
      return true;
    }

    function loaded(side, token) {
      if (!state || state.token !== token || state.phase !== 'loading') return false;
      state[side === 'remote' ? 'remoteLoaded' : 'localLoaded'] = true;
      return true;
    }

    function canResume() {
      return !!(state && state.phase === 'loading' && state.localLoaded && state.remoteLoaded);
    }

    function resume(token) {
      if (!state || state.token !== token || state.phase !== 'loading') return null;
      state.phase = 'resumed';
      return snapshot();
    }

    function cancel() {
      const old = snapshot();
      state = null;
      return old;
    }

    function snapshot() {
      return state ? Object.freeze({ ...state }) : null;
    }

    return Object.freeze({ open, ensure, ready, prepare, acceptPrepare, beginLoad, loaded, canResume, resume, cancel, snapshot });
  }

  function createResumeToken(random) {
    const source = typeof random === 'function' ? random : Math.random;
    let output = '';
    for (let index = 0; index < 24; index++) output += Math.floor(source() * 36).toString(36);
    return output;
  }

  root.BladefallMultiplayer = Object.freeze({
    PROTOCOL_VERSION,
    CHANNELS,
    DEFAULTS,
    channelFor,
    createEndpoint,
    createSnapshotBuffer,
    createTransitionBarrier,
    createResumeToken,
    interpolateState,
    reconcileState,
    validateRemoteState,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
