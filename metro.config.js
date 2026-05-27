const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@': path.resolve(__dirname),
  '@components': path.resolve(__dirname, 'components'),
  '@hooks': path.resolve(__dirname, 'hooks'),
  '@lib': path.resolve(__dirname, 'lib'),
  '@types': path.resolve(__dirname, 'types'),
};

module.exports = withNativeWind(config, {
  input: './global.css',
  inlineRem: 16,
  inlineVariables: false,
});
