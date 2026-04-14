#!/bin/bash
# Release APK 构建和安装脚本

set -e

echo "📦 构建 Release APK for Huawei Mate 60 Pro"
echo ""

cd "$(dirname "$0")"

# 检查签名配置
if [ ! -f "nexa-release-key.keystore" ]; then
    echo "❌ 错误：未找到签名密钥文件"
    echo "请先运行: ./generate-keystore.sh"
    exit 1
fi

# 检查 gradle.properties
if ! grep -q "MYAPP_RELEASE_STORE_PASSWORD" gradle.properties; then
    echo "❌ 错误：gradle.properties 中未配置签名密码"
    echo "请编辑 gradle.properties 文件，填入你的密钥密码"
    exit 1
fi

# 检查密码是否还是默认值
if grep -q "你的密钥库密码" gradle.properties; then
    echo "❌ 错误：请在 gradle.properties 中填入真实的密钥密码"
    echo "编辑文件: client-app/android/gradle.properties"
    exit 1
fi

echo "🧹 清理旧构建..."
./gradlew clean

echo ""
echo "🔨 构建 Release APK..."
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 构建成功！"
    echo ""
    echo "📁 APK 位置:"
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
    ls -lh "$APK_PATH"
    
    echo ""
    echo "📊 APK 信息:"
    file "$APK_PATH"
    
    echo ""
    echo "📱 下一步："
    echo "  方法1 - ADB 安装:"
    echo "    adb install $APK_PATH"
    echo ""
    echo "  方法2 - 文件传输:"
    echo "    1. 将 APK 复制到电脑桌面"
    echo "    2. 通过 USB/微信/AirDrop 传输到手机"
    echo "    3. 在手机上点击 APK 文件安装"
    echo ""
    
    # 询问是否直接安装
    read -p "是否现在通过 ADB 安装到连接的设备？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # 检查设备连接
        if adb devices | grep -q "device$"; then
            echo "📲 安装到设备..."
            adb install -r "$APK_PATH"
            
            if [ $? -eq 0 ]; then
                echo ""
                echo "✅ 安装成功！"
                echo ""
                read -p "是否启动应用？(y/n) " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    adb shell am start -n com.bondli.nexa.app/.MainActivity
                    echo "🚀 应用已启动"
                fi
            fi
        else
            echo "❌ 未检测到连接的设备"
            echo "请通过 USB 连接手机并启用 USB 调试"
        fi
    fi
else
    echo ""
    echo "❌ 构建失败"
    exit 1
fi
