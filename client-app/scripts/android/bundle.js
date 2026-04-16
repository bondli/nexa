const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const constants = require('../shared/constants');

/**
 * 打包 React Native JS bundle
 * 用于 release 构建，将 JS 代码打包成 bundle 文件
 */

const platform = process.argv[2] || 'android';

function ensureDistDir() {
  if (!fs.existsSync(constants.distDir)) {
    fs.mkdirSync(constants.distDir, { recursive: true });
    console.log('创建 dist 目录:', constants.distDir);
  }
}

function bundleAndroid() {
  console.log('=== 开始打包 Android JS bundle ===');

  ensureDistDir();

  const bundleOutput = path.join(constants.distDir, constants.bundleName.android);
  const assetsDest = constants.distDir;

  const cmd = [
    'npx react-native bundle',
    '--platform android',
    '--dev false',
    '--entry-file index.ts',
    `--bundle-output ${bundleOutput}`,
    `--assets-dest ${assetsDest}`,
    '--minify true',
  ].join(' ');

  console.log('执行命令:', cmd);

  try {
    execSync(cmd, { stdio: 'inherit', cwd: constants.projectRoot });
    console.log('=== Android bundle 打包完成 ===');
  } catch (error) {
    console.error('bundle 打包失败:', error.message);
    process.exit(1);
  }
}

function bundleIOS() {
  console.log('=== 开始打包 iOS JS bundle ===');

  ensureDistDir();

  const bundleOutput = path.join(constants.distDir, constants.bundleName.ios);
  const assetsDest = constants.distDir;

  const cmd = [
    'npx react-native bundle',
    '--platform ios',
    '--dev false',
    '--entry-file index.ts',
    `--bundle-output ${bundleOutput}`,
    `--assets-dest ${assetsDest}`,
    '--minify true',
  ].join(' ');

  console.log('执行命令:', cmd);

  try {
    execSync(cmd, { stdio: 'inherit', cwd: constants.projectRoot });
    console.log('=== iOS bundle 打包完成 ===');
  } catch (error) {
    console.error('bundle 打包失败:', error.message);
    process.exit(1);
  }
}

// 主入口
if (require.main === module) {
  switch (platform) {
    case 'android':
      bundleAndroid();
      break;
    case 'ios':
      bundleIOS();
      break;
    default:
      console.error('不支持的平台:', platform);
      console.log('支持的平台: android, ios');
      process.exit(1);
  }
}

module.exports = { bundleAndroid, bundleIOS };