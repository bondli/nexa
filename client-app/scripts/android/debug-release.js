const { spawn, execSync } = require('child_process');
const path = require('path');
const constants = require('../shared/constants');
const { bundleAndroid } = require('./bundle');
const { copyAndroid } = require('../copy-bundle');

/**
 * Android 真机调试脚本
 * 功能：
 * 1. 检测真机设备
 * 2. 构建 Release 包
 * 3. 安装到真机
 * 4. 启动应用
 * 5. 输出日志
 */

const bundleId = 'com.bondli.nexa.app';

// 获取连接的 Android 设备（真机）
function getAndroidDevices() {
  try {
    const output = execSync('adb devices', { encoding: 'utf-8' });
    const lines = output.split('\n').filter(line => line.trim() && !line.startsWith('List'));

    const devices = [];
    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length >= 2) {
        const deviceId = parts[0].trim();
        const status = parts[1].trim();
        if (status === 'device') {
          devices.push(deviceId);
        }
      }
    }
    return devices;
  } catch (error) {
    return [];
  }
}

// 打包 JS bundle
function createBundle() {
  console.log('\n=== 打包 JS Bundle ===');
  try {
    bundleAndroid();
    console.log('✅ JS Bundle 打包完成');
  } catch (error) {
    console.error('❌ JS Bundle 打包失败:', error.message);
    throw error;
  }
}

// 复制 bundle 到 Android
function copyBundleToAndroid() {
  console.log('\n=== 复制 Bundle 到 Android ===');
  try {
    copyAndroid();
    console.log('✅ Bundle 复制完成');
  } catch (error) {
    console.error('❌ Bundle 复制失败:', error.message);
    throw error;
  }
}

// 构建 Release APK
function buildReleaseApk() {
  console.log('\n=== 构建 Release APK ===');

  const androidDir = path.join(constants.projectRoot, 'android');

  try {
    console.log('🧹 清理旧构建...');
    execSync('./gradlew clean', {
      cwd: androidDir,
      stdio: 'inherit',
    });

    console.log('\n🔨 开始构建 Release APK...');
    execSync('./gradlew assembleRelease', {
      cwd: androidDir,
      stdio: 'inherit',
    });

    console.log('✅ Release APK 构建完成');
    return true;
  } catch (error) {
    console.error('❌ Release APK 构建失败:', error.message);
    return false;
  }
}

// 安装 APK 到真机
function installApk(deviceId) {
  console.log('\n=== 安装 APK 到真机 ===');

  const apkPath = path.join(
    constants.projectRoot,
    'android/app/build/outputs/apk/release/app-release.apk'
  );

  try {
    // 先卸载旧版本
    console.log('🗑️ 卸载旧版本...');
    try {
      execSync(`adb -s ${deviceId} uninstall ${bundleId}`, { stdio: 'ignore' });
    } catch (e) {
      // 忽略卸载失败
    }

    // 安装新版本
    console.log('📲 安装新版本...');
    execSync(`adb -s ${deviceId} install -r "${apkPath}"`, {
      stdio: 'inherit',
    });

    console.log('✅ APK 已安装');
    return true;
  } catch (error) {
    console.error('❌ APK 安装失败:', error.message);
    return false;
  }
}

// 启动应用
function launchApp(deviceId) {
  console.log('\n=== 启动应用 ===');

  try {
    execSync(`adb -s ${deviceId} shell am start -n ${bundleId}/.MainActivity`, {
      stdio: 'inherit',
    });
    console.log('✅ 应用已启动');
    return true;
  } catch (error) {
    console.error('❌ 应用启动失败:', error.message);
    return false;
  }
}

// 获取应用的 PID
function getAppPid(deviceId, packageName) {
  try {
    const output = execSync(`adb -s ${deviceId} shell pidof ${packageName}`, { encoding: 'utf-8' });
    const pid = output.trim();
    return pid || null;
  } catch (e) {
    return null;
  }
}

// 启动日志输出
function startLogcat(deviceId) {
  console.log('\n=== 开始输出日志 ===');
  console.log('💡 按 Ctrl+C 停止日志输出\n');

  const packageName = bundleId;
  let pid = getAppPid(deviceId, packageName);

  if (!pid) {
    console.log(`⚠️ 应用 ${packageName} 尚未运行`);
    console.log('💡 请启动应用，脚本会自动检测并开始监控日志\n');
    
    // 等待应用启动，轮询获取 PID
    const checkInterval = setInterval(() => {
      pid = getAppPid(deviceId, packageName);
      if (pid) {
        clearInterval(checkInterval);
        console.log(`✅ 检测到应用启动，PID: ${pid}`);
        startLogcatWithPid(deviceId, pid);
      }
    }, 1000);
    
    return null;
  } else {
    console.log(`✅ 应用 PID: ${pid}`);
    return startLogcatWithPid(deviceId, pid);
  }
}

// 使用 PID 启动日志监控
function startLogcatWithPid(deviceId, pid) {
  // 先清空日志缓冲区，避免历史日志干扰
  execSync(`adb -s ${deviceId} logcat -c`);
  console.log('🧹 已清空历史日志\n');
  
  // 只保留需要的日志，排除系统 UI 日志
  // grep -v 排除不需要的 tag
  const cmd = `adb -s ${deviceId} logcat -v time --pid=${pid} | grep -v -E 'HwViewRootImpl|ViewRootImpl|InputEvent|Choreographer|BufferQueue|ViewManagerPropertyUpdater|DynamicRefreshRateHelper'`;
  console.log(`🔍 执行命令: ${cmd}\n`);

  const logcat = spawn(cmd, {
    stdio: 'inherit',
    shell: true,
  });

  logcat.on('error', (error) => {
    console.error('日志输出失败:', error.message);
  });

  return logcat;
}

async function runDebugRelease() {
  console.log('🚀 === 开始 Android 真机调试流程 ===\n');

  // 步骤 1: 检测真机设备
  console.log('📱 步骤 1/5: 检测真机设备');
  const devices = getAndroidDevices();

  if (devices.length === 0) {
    console.log('❌ 未找到真机设备');
    console.log('💡 请确保：');
    console.log('   1. 手机已通过 USB 连接到电脑');
    console.log('   2. 手机已开启 USB 调试模式');
    console.log('   3. 已在手机上授权此电脑进行 USB 调试');
    process.exit(1);
  }

  const deviceId = devices[0];
  console.log('✅ 找到真机设备:', deviceId);

  // 步骤 2: 打包 JS Bundle
  console.log('\n📦 步骤 2/5: 打包 JS Bundle');
  createBundle();

  // 步骤 3: 复制 Bundle 到 Android
  console.log('\n📦 步骤 3/5: 复制 Bundle 到 Android');
  copyBundleToAndroid();

  // 步骤 4: 构建 Release 包
  console.log('\n📦 步骤 4/5: 构建 Release APK');
  const built = buildReleaseApk();
  if (!built) {
    process.exit(1);
  }

  // 步骤 5: 安装并启动
  console.log('\n📲 步骤 5/5: 安装并启动应用');
  installApk(deviceId);

  // 询问用户是否启动应用
  console.log('\n✅ APK 已安装');
  console.log('💡 请手动打开应用，观察是否闪退');
  console.log('💡 如果闪退，在另一个终端运行: adb logcat -d "*:F" | tail -30');

  const logcat = startLogcat(deviceId);

  console.log('\n⚠️ 如果应用闪退，请查看日志');

  // 保持进程运行
  return new Promise((resolve) => {
    const shutdown = () => {
      console.log('\n🛑 停止日志输出...');
      if (logcat) {
        logcat.kill();
      }
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  });
}

// 主入口
if (require.main === module) {
  runDebugRelease();
}

module.exports = {
  getAndroidDevices,
  buildReleaseApk,
  installApk,
  launchApp,
  startLogcat,
  runDebugRelease,
};