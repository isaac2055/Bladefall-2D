(function installBladefallHarness(root) {
  'use strict';
  if (!root.location || !new URLSearchParams(root.location.search).has('tas')) return;

  const adapters = [];
  const saves = new Map();
  function register(name, read, write) { adapters.push({ name, read, write }); }

  // Encode a graph, not just a JSON tree: preserve aliases, cycles, undefined,
  // negative zero, non-finite numbers, Maps and Sets in the comparison bytes.
  function serialize(value) {
    const seen = new Map(), nodes = [];
    function visit(item) {
      if (item === undefined) return ['undefined'];
      if (typeof item === 'number' && (!Number.isFinite(item) || Object.is(item, -0)))
        return ['number', Object.is(item, -0) ? '-0' : String(item)];
      if (item === null || typeof item !== 'object') {
        if (typeof item === 'function' || typeof item === 'symbol') throw new Error('Unsupported TAS state value');
        return item;
      }
      if (seen.has(item)) return ['ref', seen.get(item)];
      const id = nodes.length; seen.set(item, id); nodes.push(null);
      if (item instanceof Map) nodes[id] = ['map', [...item].map(([k,v]) => [visit(k),visit(v)])];
      else if (item instanceof Set) nodes[id] = ['set', [...item].map(visit)];
      else if (Array.isArray(item)) nodes[id] = ['array', item.map(visit)];
      else {
        const proto = Object.getPrototypeOf(item);
        if (proto !== Object.prototype && proto !== null) throw new Error('Unsupported TAS state object');
        nodes[id] = ['object', Object.keys(item).map(key => [key,visit(item[key])])];
      }
      return ['ref', id];
    }
    const start = visit(value);
    return JSON.stringify({ version: 1, start, nodes });
  }
  function clone(value, seen = new Map()) {
    if (value === null || typeof value !== 'object') {
      if (typeof value === 'function' || typeof value === 'symbol') throw new Error('Unsupported TAS state value');
      return value;
    }
    if (seen.has(value)) return seen.get(value);
    const proto = Object.getPrototypeOf(value);
    const result = value instanceof Map ? new Map() : value instanceof Set ? new Set()
      : Array.isArray(value) ? [] : Object.create(proto);
    if (!(value instanceof Map) && !(value instanceof Set) && !Array.isArray(value)
      && proto !== Object.prototype && proto !== null) throw new Error('Unsupported TAS state object');
    seen.set(value, result);
    if (value instanceof Map) for (const [key,item] of value) result.set(clone(key,seen),clone(item,seen));
    else if (value instanceof Set) for (const item of value) result.add(clone(item,seen));
    else for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!('value' in descriptor)) throw new Error('Unsupported TAS state accessor');
      descriptor.value = clone(descriptor.value, seen);
      Object.defineProperty(result, key, descriptor);
    }
    if (!Object.isExtensible(value)) Object.preventExtensions(result);
    return result;
  }
  function capture() {
    // Clone once across all owners so platform/entity references stay shared.
    return clone(adapters.map(adapter => ({ name: adapter.name, state: adapter.read() })));
  }
  function save(name) {
    if (typeof name !== 'string' || !name.length) throw new TypeError('Save name must be a non-empty string');
    const snapshot = capture(), bytes = serialize(snapshot);
    saves.set(name, snapshot);
    return bytes;
  }
  function restore(name) {
    if (!saves.has(name)) throw new Error('Unknown TAS save: ' + name);
    const snapshot = clone(saves.get(name));
    if (snapshot.length !== adapters.length) throw new Error('TAS state owners changed since save');
    snapshot.forEach((entry, i) => {
      if (entry.name !== adapters[i].name) throw new Error('TAS state owner mismatch');
    });
    snapshot.forEach((entry, i) => adapters[i].write(entry.state));
  }
  root.BladefallHarness = Object.freeze({ register, save, restore, clear: () => saves.clear() });
})(globalThis);
