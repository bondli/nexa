const path = require('path');

const projectRoot = path.resolve(__dirname, '../..');

const constants = {
  projectRoot,

  // 输出目录
  distDir: path.join(projectRoot, 'dist'),

  // Android 资源目录
  androidAssets: path.join(projectRoot, 'android/app/src/main/assets'),
  androidSrcMain: path.join(projectRoot, 'android/app/src/main'),

  // iOS 资源目录
  iosAssets: path.join(projectRoot, 'ios'),

  // Bundle 文件名
  bundleName: {
    android: 'index.android.bundle',
    ios: 'main.jsbundle',
  },

  // antd 字体资源
  antdFontSrcDir: path.join(projectRoot, 'node_modules/@ant-design/icons-react-native/fonts'),
  antdFontDestDir: 'fonts',

  // Metro 配置
  metro: {
    port: 8081,
    devServerUrl: 'http://localhost:8081',
  },
};

module.exports = constants;