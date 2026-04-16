const fs = require('fs');
const path = require('path');
const constants = require('./shared/constants');

/**
 * 复制 React Native bundle 和字体资源到平台资源目录
 * 支持 Android 和 iOS 平台
 */

const platform = process.argv[2] || 'android';

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log('创建目录:', dirPath);
  }
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) {
    console.error('源文件不存在:', src);
    return false;
  }
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log('已拷贝:', dest);
  return true;
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn('源目录不存在:', src);
    return false;
  }
  ensureDir(dest);
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    if (fs.statSync(srcFile).isFile()) {
      copyFile(srcFile, destFile);
    }
  });
  return true;
}

function copyAndroid() {
  console.log('=== 开始复制 Android bundle ===');

  const distDir = constants.distDir;
  const bundleName = constants.bundleName.android;
  const bundleSrc = path.join(distDir, bundleName);
  const bundleDest = path.join(constants.androidAssets, bundleName);

  // 检查 dist 目录
  if (!fs.existsSync(distDir)) {
    console.error('dist 目录不存在，请先运行 bundle 打包命令');
    process.exit(1);
  }

  // 检查 bundle 文件
  if (!fs.existsSync(bundleSrc)) {
    console.error(`未找到 ${bundleName}，请确认打包已完成`);
    process.exit(1);
  }

  // 确保 assets 目录存在
  ensureDir(constants.androidAssets);

  // 复制 JS bundle
  copyFile(bundleSrc, bundleDest);

  // 复制 antd 字体资源
  const fontDestDir = path.join(constants.androidAssets, constants.antdFontDestDir);
  copyDir(constants.antdFontSrcDir, fontDestDir);

  console.log('=== Android bundle 复制完成 ===');
}

function copyIOS() {
  console.log('=== 开始复制 iOS bundle ===');

  const distDir = constants.distDir;
  const bundleName = constants.bundleName.ios;
  const bundleSrc = path.join(distDir, bundleName);
  const bundleDest = path.join(constants.iosAssets, bundleName);

  // 检查 dist 目录
  if (!fs.existsSync(distDir)) {
    console.error('dist 目录不存在，请先运行 bundle 打包命令');
    process.exit(1);
  }

  // 检查 bundle 文件
  if (!fs.existsSync(bundleSrc)) {
    console.error(`未找到 ${bundleName}，请确认打包已完成`);
    process.exit(1);
  }

  // 复制 JS bundle
  copyFile(bundleSrc, bundleDest);

  // 复制 antd 字体资源 (iOS 需要添加到 Resources 目录)
  const fontDestDir = path.join(constants.iosAssets, 'Resources/fonts');
  copyDir(constants.antdFontSrcDir, fontDestDir);

  console.log('=== iOS bundle 复制完成 ===');
}

// 主入口
if (require.main === module) {
  switch (platform) {
    case 'android':
      copyAndroid();
      break;
    case 'ios':
      copyIOS();
      break;
    default:
      console.error('不支持的平台:', platform);
      console.log('支持的平台: android, ios');
      process.exit(1);
  }
}

module.exports = { copyAndroid, copyIOS };