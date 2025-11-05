const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Allow importing from the monorepo root (packages/*)
config.watchFolders = [workspaceRoot];

// Ensure single instances of react/react-native and resolve modules correctly
config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
  ],
  extraNodeModules: {
    'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
    'react': path.resolve(projectRoot, 'node_modules/react'),
  },
};

module.exports = config;


