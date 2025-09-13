const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname, { isCSSEnabled: true });

// Enable package exports for React Native Web compatibility
config.resolver = {
  ...config.resolver,
  unstable_enablePackageExports: true,
};

module.exports = config;