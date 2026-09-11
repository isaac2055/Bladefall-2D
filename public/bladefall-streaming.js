(function installBladefallStreaming(root) {
  'use strict';

  const SCHEMA = 'bladefall.zone-streamer';
  const VERSION = 1;
  const PHASES = Object.freeze(['idle', 'preloading', 'armed', 'committing', 'settling', 'rolling-back']);

  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (!value || typeof value !== 'object') return value;
    const output = {};
    for (const [key, item] of Object.entries(value)) {
      if (typeof item !== 'function' && key !== 'signal') output[key] = clone(item);
    }
    return output;
  }

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);
    for (const item of Object.values(value)) deepFreeze(item);
    return value;
  }

  function createAbortController() {
    if (typeof AbortController !== 'undefined') return new AbortController();
    return { signal: { aborted: false }, abort() { this.signal.aborted = true; } };
  }

  function createStreamer(options) {
    const config = options && typeof options === 'object' ? options : {};
    const zones = config.zones;
    if (!zones || typeof zones.planTransition !== 'function') throw new Error('Zone streamer requires a BladefallZones-compatible contract');
    const adapter = config.adapter && typeof config.adapter === 'object' ? config.adapter : {};
    for (const name of ['preload', 'captureSource', 'commit', 'placeArrival', 'handoffCamera', 'releaseSource', 'rollback']) {
      if (typeof adapter[name] !== 'function') throw new Error(`Zone streamer adapter requires ${name}()`);
    }

    const maxEvents = Math.max(16, Number(config.maxEvents) || 80);
    const now = typeof adapter.now === 'function' ? adapter.now : () =>
      (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
    const cache = new Map();
    const events = [];
    let phase = 'idle';
    let active = null;
    let sequence = 0;
    let completed = 0;
    let rolledBack = 0;
    let canceled = 0;
    let cacheHits = 0;
    let lastFailure = null;

    function event(type, detail) {
      events.push(deepFreeze({ type, at: now(), ...(detail || {}) }));
      if (events.length > maxEvents) events.splice(0, events.length - maxEvents);
    }

    function setPhase(next, detail) {
      if (!PHASES.includes(next)) throw new Error(`Unknown streaming phase: ${next}`);
      const previous = phase;
      phase = next;
      event('phase', { previous, next, token: active?.token || null, ...(detail || {}) });
    }

    function cacheKey(plan) {
      return `${plan.targetZoneId}|${plan.targetEndpointId}`;
    }

    function publicReceipt(extra) {
      return deepFreeze({
        ok: true,
        phase,
        token: active?.token || null,
        connectorId: active?.plan.connectorId || null,
        sourceZoneId: active?.plan.sourceZoneId || null,
        targetZoneId: active?.plan.targetZoneId || null,
        ...(extra || {}),
      });
    }

    function failReceipt(reason, extra) {
      return deepFreeze({ ok: false, phase, reason, ...(extra || {}) });
    }

    function preparedIsValid(prepared, plan) {
      return prepared && prepared.ready === true && prepared.zoneId === plan.targetZoneId;
    }

    async function discardPrepared(record, reason) {
      if (!record?.prepared || typeof adapter.discard !== 'function') return;
      try { await adapter.discard(record.plan, record.prepared, reason); } catch (_) { /* diagnostic cleanup only */ }
    }

    async function warm(connectorId, fromZoneId, sourceState) {
      const plan = zones.planTransition(connectorId, fromZoneId, sourceState);
      if (!plan.ok) return failReceipt(plan.reason, clone(plan));

      if (active && active.plan.connectorId === connectorId && active.plan.sourceZoneId === fromZoneId) {
        if (active.warmPromise) return active.warmPromise;
        if (phase === 'armed' || phase === 'committing' || phase === 'settling') return publicReceipt({ cached: !!active.cacheHit });
      }
      if (active) await cancel('superseded');

      const token = ++sequence;
      const controller = createAbortController();
      active = {
        token, plan, controller, prepared: null, snapshot: null,
        cacheHit: false, committed: false, settleRemaining: 0,
        startedAt: now(), warmPromise: null, commitPromise: null,
      };
      const record = active;
      const cached = cache.get(cacheKey(plan));
      if (cached && preparedIsValid(cached, plan)) {
        record.prepared = cached;
        record.cacheHit = true;
        cacheHits++;
        setPhase('armed', { connectorId, cacheHit: true });
        event('preload-cache-hit', { token, targetZoneId: plan.targetZoneId });
        return publicReceipt({ cached: true });
      }

      setPhase('preloading', { connectorId, targetZoneId: plan.targetZoneId });
      record.warmPromise = (async () => {
        try {
          const prepared = await adapter.preload(plan, { token, signal: controller.signal });
          if (controller.signal.aborted || !active || active.token !== token) {
            await discardPrepared({ plan, prepared }, 'stale-preload');
            return failReceipt('canceled', { token });
          }
          if (!preparedIsValid(prepared, plan)) throw new Error('preload-did-not-produce-ready-target');
          record.prepared = deepFreeze(clone(prepared));
          cache.set(cacheKey(plan), record.prepared);
          record.warmPromise = null;
          setPhase('armed', { connectorId, cacheHit: false });
          event('preload-ready', { token, targetZoneId: plan.targetZoneId });
          return publicReceipt({ cached: false });
        } catch (error) {
          if (!active || active.token !== token || controller.signal.aborted) return failReceipt('canceled', { token });
          lastFailure = String(error?.message || error);
          event('preload-failed', { token, message: lastFailure });
          active = null;
          setPhase('idle', { failure: 'preload' });
          return failReceipt('preload-failed', { token, message: lastFailure });
        }
      })();
      return record.warmPromise;
    }

    async function commitActive() {
      const record = active;
      if (!record || phase !== 'armed') return failReceipt('not-armed');
      if (record.commitPromise) return record.commitPromise;
      setPhase('committing', { connectorId: record.plan.connectorId });
      record.commitPromise = (async () => {
        try {
          record.snapshot = await adapter.captureSource(record.plan, { token: record.token });
          if (!active || active.token !== record.token || record.controller.signal.aborted) throw new Error('commit-canceled-before-swap');
          const commitResult = await adapter.commit(record.plan, record.prepared, { token: record.token });
          record.committed = true;
          await adapter.placeArrival(record.plan, commitResult, { token: record.token });
          await adapter.handoffCamera(record.plan, commitResult, { token: record.token });
          record.settleRemaining = Math.max(0, Number(record.plan.arrival.cameraHandoff.settleSeconds) || 0);
          record.commitPromise = null;
          setPhase('settling', { connectorId: record.plan.connectorId });
          event('committed', {
            token: record.token,
            sourceZoneId: record.plan.sourceZoneId,
            targetZoneId: record.plan.targetZoneId,
          });
          if (record.settleRemaining === 0) finishSettling();
          return publicReceipt({ arrival: clone(record.plan.arrival), cached: record.cacheHit });
        } catch (error) {
          return rollbackRecord(record, error, 'commit-failed');
        }
      })();
      return record.commitPromise;
    }

    async function cross(connectorId, fromZoneId, sourceState) {
      const warmed = await warm(connectorId, fromZoneId, sourceState);
      if (!warmed.ok) return warmed;
      if (phase === 'settling' && active?.plan.connectorId === connectorId) return publicReceipt({ alreadyCommitted: true });
      return commitActive();
    }

    async function rollbackRecord(record, error, reason) {
      if (!record) return failReceipt(reason || 'rollback-unavailable');
      lastFailure = String(error?.message || error || reason || 'rollback');
      if (active?.token === record.token) setPhase('rolling-back', { reason });
      try {
        if (record.snapshot !== null) await adapter.rollback(record.plan, record.snapshot, { token: record.token, reason, error: lastFailure });
      } catch (rollbackError) {
        lastFailure += `; rollback: ${String(rollbackError?.message || rollbackError)}`;
      }
      rolledBack++;
      event('rolled-back', { token: record.token, reason, message: lastFailure });
      if (active?.token === record.token) active = null;
      setPhase('idle', { rollback: true });
      return failReceipt(reason || 'rolled-back', { token: record.token, message: lastFailure, rolledBack: true });
    }

    function finishSettling() {
      const record = active;
      if (!record || phase !== 'settling') return false;
      try {
        const result = adapter.releaseSource(record.plan, record.prepared, { token: record.token });
        if (result && typeof result.then === 'function') result.catch((error) => {
          lastFailure = `release: ${String(error?.message || error)}`;
          event('release-failed', { token: record.token, message: lastFailure });
        });
      } catch (error) {
        lastFailure = `release: ${String(error?.message || error)}`;
        event('release-failed', { token: record.token, message: lastFailure });
      }
      completed++;
      event('settled', { token: record.token, targetZoneId: record.plan.targetZoneId });
      active = null;
      setPhase('idle', { completed: true });
      return true;
    }

    function tick(dt) {
      if (!active || phase !== 'settling') return false;
      active.settleRemaining = Math.max(0, active.settleRemaining - Math.max(0, Number(dt) || 0));
      return active.settleRemaining === 0 ? finishSettling() : false;
    }

    async function cancel(reason) {
      const record = active;
      if (!record) return failReceipt('nothing-active');
      record.controller.abort();
      sequence++;
      canceled++;
      event('canceled', { token: record.token, reason: reason || 'canceled' });
      if (record.committed || record.snapshot !== null) return rollbackRecord(record, new Error(reason || 'canceled'), 'canceled-after-capture');
      await discardPrepared(record, reason || 'canceled');
      if (active?.token === record.token) active = null;
      setPhase('idle', { canceled: true });
      return failReceipt('canceled', { token: record.token });
    }

    function invalidate(zoneId) {
      let removed = 0;
      for (const [key, prepared] of cache) if (!zoneId || prepared.zoneId === zoneId) {
        cache.delete(key);
        removed++;
      }
      event('cache-invalidated', { zoneId: zoneId || null, removed });
      return removed;
    }

    function diagnostics() {
      return deepFreeze({
        schema: SCHEMA,
        version: VERSION,
        phase,
        active: active ? {
          token: active.token,
          connectorId: active.plan.connectorId,
          sourceZoneId: active.plan.sourceZoneId,
          targetZoneId: active.plan.targetZoneId,
          cacheHit: active.cacheHit,
          committed: active.committed,
          settleRemaining: active.settleRemaining,
        } : null,
        cache: [...cache.values()].map((prepared) => ({ zoneId: prepared.zoneId, ready: prepared.ready })),
        counters: { completed, rolledBack, canceled, cacheHits },
        lastFailure,
        events: events.map(clone),
      });
    }

    return Object.freeze({ warm, cross, tick, cancel, invalidate, diagnostics });
  }

  root.BladefallStreaming = Object.freeze({ SCHEMA, VERSION, PHASES, createStreamer });
})(typeof globalThis !== 'undefined' ? globalThis : window);
