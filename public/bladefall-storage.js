(function installBladefallStorage(root) {
  'use strict';

  function createJsonStore(storageSource) {
    const provider = typeof storageSource === 'function' ? storageSource : () => storageSource;
    const failures = [];

    function getStorage() {
      try {
        return provider() || null;
      } catch (error) {
        failures.push({ operation: 'connect', message: String(error && error.message || error) });
        return null;
      }
    }

    function note(operation, key, error) {
      failures.push({ operation, key, message: String(error && error.message || error) });
      if (failures.length > 20) failures.shift();
    }

    function read(key, fallback) {
      const storage = getStorage();
      if (!storage) return fallback;
      try {
        const raw = storage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (error) {
        note('read', key, error);
        return fallback;
      }
    }

    function write(key, value) {
      const storage = getStorage();
      if (!storage) return false;
      try {
        storage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        note('write', key, error);
        return false;
      }
    }

    function remove(key) {
      const storage = getStorage();
      if (!storage) return false;
      try {
        storage.removeItem(key);
        return true;
      } catch (error) {
        note('remove', key, error);
        return false;
      }
    }

    function diagnostics() {
      return Object.freeze({ failures: failures.map((entry) => Object.freeze({ ...entry })) });
    }

    return Object.freeze({ read, write, remove, diagnostics });
  }

  root.BladefallStorage = Object.freeze({ createJsonStore });
})(typeof globalThis !== 'undefined' ? globalThis : window);
