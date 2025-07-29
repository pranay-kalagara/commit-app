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

module.exports = config;
