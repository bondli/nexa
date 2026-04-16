const { execSync } = require('child_process');
const path = require('path');
const constants = require('../shared/constants');
const { bundleAndroid } = require('./bundle');
const { copyAndroid } = require('../copy-bundle');

/**
 * Android Release 构建脚本
 * 功能：
 * 1. 打包 JS bundle（minified）
 * 2. 复制 bundle 到 Android assets 目录
 * 3. 使用 release keystore 签名构建 APK
 */

function buildRelease() {
  console.log('=== 开始 Android Release 构建 ===');

  const androidDir = path.join(constants.projectRoot, 'android');

  try {
    // 执行 assembleRelease 构建
    execSync('./gradlew assembleRelease', {
      cwd: androidDir,
      stdio: 'inherit',
    });

    const apkPath = path.join(
      constants.projectRoot,
      'android/app/build/outputs/apk/release/app-release.apk'
    );

    if (require('fs').existsSync(apkPath)) {
      console.log('');
      console.log('=== Release 构建完成 ===');
      console.log('APK 路径:', apkPath);
    } else {
      console.error('APK 生成失败');
      process.exit(1);
    }
  } catch (error) {
    console.error('Release APK 构建失败:', error.message);
    process.exit(1);
  }
}

async function runRelease() {
  console.log('=== Android Release 构建流程 ===');
  console.log('');

  // 步骤 1: 打包 JS bundle
  console.log('步骤 1/3: 打包 JS bundle');
  bundleAndroid();

  // 步骤 2: 复制 bundle 到 Android assets
  console.log('');
  console.log('步骤 2/3: 复制 bundle 到 Android 资源目录');
  copyAndroid();

  // 步骤 3: 构建 Release APK
  console.log('');
  console.log('步骤 3/3: 构建 Release APK');
  buildRelease();

  console.log('');
  console.log('=== 所有步骤完成 ===');
}

// 主入口
if (require.main === module) {
  runRelease();
}

module.exports = { buildRelease, runRelease };