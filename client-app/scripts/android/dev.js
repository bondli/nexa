const { spawn, execSync } = require('child_process');
const path = require('path');
const constants = require('../shared/constants');

/**
 * Android 开发模式构建脚本
 * 功能：
 * 1. 检查并启动 Android 模拟器
 * 2. 检查并清理 8081 端口（Metro）
 * 3. 启动 Metro 打包服务
 * 4. 构建 Debug APK
 * 5. 安装 APK 到模拟器
 * 6. 启动应用
 */

const metroPort = constants.metro.port;

// 检查端口是否被占用
function checkPort(port) {
  try {
    const output = execSync(`lsof -i :${port} -t`, { encoding: 'utf-8' });
    return output.trim() ? output.trim().split('\n') : [];
  } catch (error) {
    return []; // 端口未被占用
  }
}

// 杀掉占用端口的进程
async function killPort(port) {
  const pids = checkPort(port);
  if (pids.length > 0) {
    console.log(`⚠️ 端口 ${port} 被占用 (PID: ${pids.join(', ')})，正在清理...`);
    try {
      for (const pid of pids) {
        execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
      }
      console.log(`✅ 端口 ${port} 已释放`);
      // 等待端口释放
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.log('⚠️ 清理端口时出现问题，继续尝试...');
    }
  } else {
    console.log(`✅ 端口 ${port} 可用`);
  }
}

// 获取已连接的 Android 设备
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

// 获取可用的 Android 模拟器列表
function getAndroidEmulators() {
  try {
    const output = execSync('emulator -list-avds', { encoding: 'utf-8' });
    return output.split('\n').map(line => line.trim()).filter(line => line);
  } catch (error) {
    return [];
  }
}

// 检查并启动模拟器
function setupEmulator() {
  console.log('=== 检查 Android 模拟器 ===');

  // 首先检查已连接的设备
  let devices = getAndroidDevices();
  if (devices.length > 0) {
    console.log('✅ 找到已连接的 Android 设备:', devices.join(', '));
    return devices[0];
  }

  // 检查可用的模拟器
  const emulators = getAndroidEmulators();
  if (emulators.length === 0) {
    console.log('❌ 未找到可用模拟器或设备');
    console.log('💡 请先启动 Android 模拟器或连接设备');
    process.exit(1);
  }

  console.log('📱 找到可用模拟器:', emulators[0]);
  console.log('⏳ 正在启动模拟器...');

  // 启动模拟器（后台运行）
  const emulatorName = emulators[0];
  spawn('emulator', ['-avd', emulatorName, '-no-snapshot-load'], {
    detached: true,
    stdio: 'ignore',
  });

  // 等待模拟器启动
  console.log('等待模拟器启动...');
  let retries = 30;
  while (retries > 0) {
    devices = getAndroidDevices();
    if (devices.length > 0) {
      console.log('✅ 模拟器已启动，设备:', devices[0]);
      return devices[0];
    }
    retries--;
    process.stdout.write('.');
    execSync('sleep 2', { stdio: 'ignore' });
  }

  console.log('\n❌ 模拟器启动超时');
  process.exit(1);
}

// 启动 Metro 服务
async function startMetro() {
  console.log('=== 启动 Metro 开发服务器 ===');

  const metro = spawn('npx', ['react-native', 'start'], {
    cwd: constants.projectRoot,
    stdio: 'inherit',
    shell: true,
    detached: false,
    env: {
      ...process.env,
      RCT_METRO_PORT: metroPort.toString(),
    },
  });

  metro.on('error', (error) => {
    console.error('Metro 启动失败:', error.message);
    process.exit(1);
  });

  return metro;
}

// 构建 Debug APK
function buildDebugApk() {
  console.log('\n=== 构建 Debug APK ===');

  const androidDir = path.join(constants.projectRoot, 'android');

  try {
    // 先 clean 再构建，减少警告
    console.log('🧹 清理旧构建...');
    execSync('./gradlew clean', {
      cwd: androidDir,
      stdio: 'inherit',
    });

    console.log('\n🔨 开始构建...');
    execSync('./gradlew assembleDebug --warning-mode all', {
      cwd: androidDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        GRADLE_OPTS: '-Dorg.gradle.warning.mode=all',
      },
    });
    console.log('✅ Debug APK 构建完成');
  } catch (error) {
    console.error('❌ Debug APK 构建失败:', error.message);
    process.exit(1);
  }
}

// 安装 APK 到设备
function installApk(deviceId) {
  console.log('\n=== 安装 APK 到设备 ===');

  const apkPath = path.join(
    constants.projectRoot,
    'android/app/build/outputs/apk/debug/app-debug.apk'
  );

  try {
    execSync(`adb -s ${deviceId} install -r "${apkPath}"`, {
      stdio: 'inherit',
    });
    console.log('✅ APK 已安装');
  } catch (error) {
    console.error('❌ APK 安装失败:', error.message);
    process.exit(1);
  }
}

// 启动应用
function launchApp(deviceId) {
  console.log('\n=== 启动应用 ===');

  const bundleId = 'com.bondli.nexa.app';

  try {
    execSync(`adb -s ${deviceId} shell am start -n ${bundleId}/.MainActivity`, {
      stdio: 'inherit',
    });
    console.log('✅ 应用已启动');
  } catch (error) {
    console.error('❌ 应用启动失败:', error.message);
  }
}

async function runDev() {
  console.log('🚀 === 开始 Android 开发构建流程 ===\n');

  // 步骤 1: 检查/启动模拟器
  console.log('📱 步骤 1/4: 检查并启动模拟器');
  const deviceId = setupEmulator();

  // 步骤 2: 构建 APK
  console.log('\n📦 步骤 2/4: 构建 Debug APK');
  buildDebugApk();

  // 步骤 3: 安装并启动应用
  console.log('\n📲 步骤 3/4: 安装并启动应用');
  installApk(deviceId);
  launchApp(deviceId);

  // 步骤 4: 清理端口并启动 Metro
  console.log('\n🔌 步骤 4/4: 清理端口并启动 Metro 服务');
  await killPort(metroPort);
  const metro = startMetro();

  console.log('⏳ 等待 Metro 服务启动...');
  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log('');
  console.log('🎉 === 开发构建流程完成 ===');
  console.log(`📍 Metro 服务运行在: http://localhost:${metroPort}`);
  console.log('');
  console.log('💡 提示：');
  console.log('   - 按 Ctrl+C 可以停止 Metro 服务');
  console.log('   - 或者在另一个终端运行: lsof -ti :8081 | xargs kill');

  // 保持进程运行，等待用户中断
  return new Promise((resolve) => {
    // 处理 Ctrl+C
    const shutdown = () => {
      console.log('\n🛑 停止 Metro 服务...');
      // 安全检查：metro 可能还未启动
      if (metro && typeof metro.kill === 'function') {
        metro.kill('SIGTERM');
      }
      // 同时杀掉所有 react-native 进程
      try {
        execSync('pkill -f "react-native" || true', { stdio: 'ignore' });
      } catch (e) {
        // 忽略错误
      }
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // 也可以通过输入命令退出
    console.log('\n按回车键退出...');
    process.stdin.resume();
    process.stdin.once('data', shutdown);
  });
}

// 主入口
if (require.main === module) {
  runDev();
}

module.exports = {
  checkPort,
  killPort,
  getAndroidDevices,
  getAndroidEmulators,
  setupEmulator,
  startMetro,
  buildDebugApk,
  installApk,
  launchApp,
  runDev,
};