(function installBladefallPresentation(root) {
  'use strict';

  function createChannel(eventBus) {
    if (!eventBus || typeof eventBus.emit !== 'function' || typeof eventBus.on !== 'function') {
      throw new TypeError('Presentation channel requires an event bus');
    }
    let sequence = 0;
    let counts = Object.create(null);
    // Private state participates in opt-in TAS branching.
    root.BladefallHarness?.register("presentation:createChannel", () => ({ sequence, counts }),
      state => ({ sequence, counts } = state));

    function publish(type, detail) {
      const packet = Object.freeze({
        type,
        sequence: ++sequence,
        detail: detail === undefined ? null : detail,
      });
      counts[type] = (counts[type] || 0) + 1;
      eventBus.emit(`presentation:${type}`, packet);
      eventBus.emit('presentation:*', packet);
      return packet;
    }

    function subscribe(type, handler) {
      return eventBus.on(`presentation:${type}`, handler);
    }

    function stats() {
      return Object.freeze({ sequence, counts: Object.freeze({ ...counts }) });
    }

    return Object.freeze({ publish, subscribe, stats });
  }

  root.BladefallPresentation = Object.freeze({ createChannel });
})(typeof globalThis !== 'undefined' ? globalThis : window);
