// Very early patch for PlatformConstants - must run before any React Native code
const PlatformConstantsModule = {
  getConstants: () => ({
    isTesting: false,
    reactNativeVersion: { major: 0, minor: 79, patch: 5 },
    forceTouchAvailable: false,
    interfaceIdiom: 'phone',
    osVersion: '14.0',
    systemName: 'iOS',
  })
};

// Patch TurboModuleRegistry before it's used
if (!global.TurboModuleRegistry) {
  global.TurboModuleRegistry = {
    get: (name) => name === 'PlatformConstants' ? PlatformConstantsModule : null,
    getEnforcing: (name) => {
      if (name === 'PlatformConstants') return PlatformConstantsModule;
      throw new Error(`TurboModuleRegistry.getEnforcing(...): '${name}' could not be found`);
    }
  };
} else {
  const original = global.TurboModuleRegistry;
  const originalGetEnforcing = original.getEnforcing;
  
  original.getEnforcing = function(name) {
    if (name === 'PlatformConstants') {
      return PlatformConstantsModule;
    }
    return originalGetEnforcing.call(this, name);
  };
  
  if (original.get) {
    const originalGet = original.get;
    original.get = function(name) {
      if (name === 'PlatformConstants') {
        return PlatformConstantsModule;
      }
      return originalGet.call(this, name);
    };
  }
}