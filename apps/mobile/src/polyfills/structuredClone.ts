// Polyfill for structuredClone in React Native
declare global {
  function structuredClone<T>(value: T): T;
}

if (typeof global.structuredClone === "undefined") {
  global.structuredClone = function structuredClone<T>(obj: T): T {
    // Handle primitives
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    // Handle dates
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as T;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => structuredClone(item)) as T;
    }

    // Handle objects
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      // Fallback for circular references
      console.warn(
        "structuredClone polyfill: falling back to simple clone due to:",
        error
      );
      const cloned = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = obj[key];
        }
      }
      return cloned;
    }
  };
}

// Make this file an external module
export {};