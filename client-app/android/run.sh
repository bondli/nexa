#!/bin/bash
# 快速构建、安装和运行 Android 应用

set -e

echo "🚀 开始构建 Android 应用..."

# 配置环境变量
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"

cd "$(dirname "$0")"

# 构建
echo "📦 构建 APK..."
./gradlew assembleDebug

# 卸载旧版本
echo "🗑️  卸载旧版本..."
adb uninstall com.bondli.nexa.app 2>/dev/null || echo "没有找到旧版本"

# 安装新版本
echo "📲 安装新版本..."
./gradlew installDebug

# 启动应用
echo "▶️  启动应用..."
adb shell am start -n com.bondli.nexa.app/.MainActivity

echo "✅ 完成！应用已启动"
echo ""
echo "📊 查看日志："
echo "   adb logcat | grep -E 'nexa|ReactNative'"
