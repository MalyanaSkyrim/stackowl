const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  {
    ignores: [
      'dist/**',
      '.expo/**',
      '.rnstorybook/**',
      'vendor/**',
      '.bundle/**',
      'android/**',
      'ios/**',
      'ios.bak/**',
      'node_modules/**',
    ],
  },
  expoConfig,
  {
    rules: {
      'react/display-name': 'off',
    },
  },
]);
