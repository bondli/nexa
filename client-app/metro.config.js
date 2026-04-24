// Minimal Metro config for local development
const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  // 配置 Metro 支持 TypeScript 文件
  config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];

  return config;
})();
