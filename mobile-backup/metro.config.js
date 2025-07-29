const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configure for Docker environment
config.watchFolders = [
  path.resolve(__dirname)
];

// Ensure Metro can resolve modules properly in Docker
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// Add web platform support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add web-specific extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.js', 'web.ts', 'web.tsx'];

// Configure asset extensions
config.resolver.assetExts = [...config.resolver.assetExts, 'png', 'jpg', 'jpeg', 'gif', 'svg'];

// Fix React Native Web Platform module resolution
// Based on community solutions for "Unable to resolve module ../Utilities/Platform"
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle Platform module resolution for web
  if (platform === 'web' && moduleName === '../Utilities/Platform') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/react-native-web/dist/exports/Platform/index.js'),
      type: 'sourceFile',
    };
  }
  
  // Handle react-native to react-native-web aliasing for web
  if (platform === 'web' && moduleName === 'react-native') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/react-native-web/index.js'),
      type: 'sourceFile',
    };
  }
  
  // Default resolver
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
