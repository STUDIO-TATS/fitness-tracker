// PlatformConstants polyfill for Expo SDK 53
import { Platform } from 'react-native';

const PlatformConstants = {
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
    osVersion: Platform.Version ? Platform.Version.toString() : '14.0',
    systemName: Platform.OS === 'ios' ? 'iOS' : 'Android',
    isMacCatalyst: false,
    isVision: false,
    Model: 'Unknown',
    Brand: Platform.OS === 'android' ? 'google' : undefined,
  })
};

export default PlatformConstants;