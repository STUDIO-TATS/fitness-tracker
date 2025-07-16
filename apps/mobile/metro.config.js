const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add custom resolver to handle PlatformConstants
const originalResolver = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Intercept PlatformConstants module requests
  if (moduleName === 'PlatformConstants') {
    return {
      type: 'sourceFile',
      filePath: require.resolve('./src/polyfills/PlatformConstants.js'),
    };
  }
  
  // If there's no original resolver, return undefined to let Metro handle it
  if (!originalResolver) {
    return undefined;
  }
  
  return originalResolver(context, moduleName, platform);
};

module.exports = config;