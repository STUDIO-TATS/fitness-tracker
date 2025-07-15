// Minimal patch for Expo SDK 53 with New Architecture in Expo Go
import { NativeModules, Platform } from 'react-native';

// PlatformConstants implementation that matches the native interface
const PlatformConstantsModule = {
  getConstants: () => ({
    isTesting: false,
    isDisableAnimations: false,
    reactNativeVersion: {
      major: 0,
      minor: 79,
      patch: 5,
      prerelease: null
    },
    forceTouchAvailable: false,
    interfaceIdiom: Platform.OS === 'ios' ? (Platform.isPad ? 'pad' : 'phone') : 'phone',
    osVersion: Platform.Version.toString(),
    systemName: Platform.OS === 'ios' ? 'iOS' : 'Android',
  })
};

// Intercept the turboModuleProxy function call
const originalTurboModuleProxy = global.__turboModuleProxy;

if (typeof originalTurboModuleProxy === 'function') {
  global.__turboModuleProxy = function(moduleName) {
    if (moduleName === 'PlatformConstants') {
      return PlatformConstantsModule;
    }
    try {
      return originalTurboModuleProxy.call(this, moduleName);
    } catch (e) {
      console.warn(`Module ${moduleName} not found in turboModuleProxy`);
      return null;
    }
  };
}

// Also ensure it exists in NativeModules
if (!NativeModules.PlatformConstants) {
  NativeModules.PlatformConstants = PlatformConstantsModule;
}

console.log('[Patch] New Architecture compatibility patch applied');