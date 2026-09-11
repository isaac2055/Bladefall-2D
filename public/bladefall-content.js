(function installBladefallContent(root) {
  'use strict';

  function requireFields(fields) {
    const required = Array.from(fields || []);
    return (value) => !!value && required.every((field) => value[field] !== undefined);
  }

  function arrayOf(itemValidator) {
    return (value) => Array.isArray(value) && value.every((item) => itemValidator(item));
  }

  function recordOf(itemValidator) {
    return (value) => !!value && !Array.isArray(value) && typeof value === 'object'
      && Object.values(value).every((item) => itemValidator(item));
  }

  function createRegistry() {
    const entries = new Map();

    function register(name, value, validator) {
      if (!name || typeof name !== 'string') throw new TypeError('Content name must be a non-empty string');
      if (entries.has(name)) throw new Error(`Content "${name}" is already registered`);
      if (validator && !validator(value)) throw new Error(`Content "${name}" failed validation`);
      entries.set(name, value);
      return value;
    }

    function get(name) {
      if (!entries.has(name)) throw new Error(`Unknown content "${name}"`);
      return entries.get(name);
    }

    function has(name) {
      return entries.has(name);
    }

    function list() {
      return Object.freeze(Array.from(entries.keys()));
    }

    function summary() {
      const output = {};
      for (const [name, value] of entries) {
        output[name] = Array.isArray(value) ? value.length
          : value && typeof value === 'object' ? Object.keys(value).length
            : 1;
      }
      return Object.freeze(output);
    }

    return Object.freeze({ register, get, has, list, summary });
  }

  root.BladefallContent = Object.freeze({
    createRegistry,
    validators: Object.freeze({ requireFields, arrayOf, recordOf }),
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
