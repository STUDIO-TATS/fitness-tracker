// Polyfill for structuredClone
if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };
}