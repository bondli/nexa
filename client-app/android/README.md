# � Android 应用开发指南

## 🚀 脱离 Android Studio 进行开发

本项目完全支持命令行构建和调试，无需打开 Android Studio。

---


## 📋 前置要求

### 1. 环境配置

确保安装以下工具：

```bash
# 检查 Java 版本（需要 JDK 11+）
java -version

# 检查 Android SDK
ls $HOME/Library/Android/sdk
```

### 2. 配置 PATH 环境变量

```bash
# 临时添加（当前终端会话有效）
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator

# 永久添加（推荐）
cat >> ~/.zshrc << 'EOF'
# Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
EOF

source ~/.zshrc
```

### 3. 验证环境

```bash
# 验证 adb
adb version

# 验证 emulator
emulator -list-avds
```

---

## 🎮 模拟器管理（无需 Android Studio）

### 查看可用模拟器

```bash
emulator -list-avds
```

### 启动模拟器

```bash
# 方法1: 启动指定模拟器（推荐）
emulator -avd Pixel_10_Pro &

# 方法2: 启动第一个可用模拟器
emulator @$(emulator -list-avds | head -n 1) &

# 后台启动（不阻塞终端）
nohup emulator -avd Pixel_10_Pro > /dev/null 2>&1 &
```

---

## 🔨 构建和打包

### 完整构建流程

```bash
# 1. 进入项目目录
cd client-app/android

# 2. 清理旧构建（可选，但推荐）
./gradlew clean

# 3. 构建 Debug APK
./gradlew assembleDebug

# 4. 构建 Release APK（需要签名配置）
./gradlew assembleRelease

# 5. 查看构建输出
ls -lh app/build/outputs/apk/debug/
```

---

## 📦 安装和运行

### 安装到设备/模拟器

```bash
# 方法1: 使用 Gradle（推荐）
./gradlew installDebug

# 方法2: 直接使用 adb
adb install app/build/outputs/apk/debug/app-debug.apk

# 方法3: 强制覆盖安装
adb install -r app/build/outputs/apk/debug/app-debug.apk

# 安装到指定设备
adb -s emulator-5554 install app/build/outputs/apk/debug/app-debug.apk
```

### 卸载应用

```bash
# 卸载应用（保留数据）
adb uninstall com.bondli.nexa.app

# 卸载应用（删除所有数据）
adb uninstall -k com.bondli.nexa.app
```

### 启动应用

```bash
# 启动主 Activity
adb shell am start -n com.bondli.nexa.app/.MainActivity

# 启动并清除任务栈
adb shell am start -S -n com.bondli.nexa.app/.MainActivity

# 启动特定 Activity
adb shell am start -n com.bondli.nexa.app/.SplashActivity
```

### 停止应用

```bash
# 强制停止应用
adb shell am force-stop com.bondli.nexa.app

# 结束应用进程
adb shell am kill com.bondli.nexa.app
```

---

## 🔍 调试和日志

### 实时日志查看

```bash
# 查看所有日志（过滤应用）
adb logcat | grep -i nexa

# 只看错误日志
adb logcat *:E | grep -i nexa

# 查看特定标签
adb logcat MainApplication:D ReactNativeJS:D *:S

# 清空日志缓冲区
adb logcat -c

# 保存日志到文件
adb logcat > app.log
```

### 应用信息查看

```bash
# 查看应用包信息
adb shell dumpsys package com.bondli.nexa.app | grep version

# 查看应用权限
adb shell dumpsys package com.bondli.nexa.app | grep permission

# 查看应用占用的内存
adb shell dumpsys meminfo com.bondli.nexa.app

# 查看应用 CPU 使用
adb shell top | grep nexa
```

### 截图和录屏

```bash
# 截图
adb shell screencap /sdcard/screen.png
adb pull /sdcard/screen.png

# 录屏（最多3分钟）
adb shell screenrecord /sdcard/demo.mp4
# Ctrl+C 停止录制
adb pull /sdcard/demo.mp4
```


---

## 🎨 更换应用图标

### 使用 Android Studio Image Asset Studio（推荐）

这是官方提供的图标生成工具，可以自动生成所有尺寸的图标，包括 Adaptive Icons。

#### 1. 准备原始图标

- **尺寸要求**: 1024x1024 像素或更大
- **格式**: PNG 格式（推荐使用透明背景）
- **设计建议**: 
  - 图标主体应在安全区域内（避免边缘被裁切）
  - 使用简洁的设计，在小尺寸下也能清晰识别
  - 避免使用过多细节

#### 2. 打开 Android Studio

```bash
# 在命令行中打开项目
open -a "Android Studio" client-app/android
```

或者直接从 Android Studio 打开 `client-app/android` 目录。

#### 3. 启动 Image Asset Studio

**方法一：通过项目视图**
1. 在左侧项目结构中，右键点击 `app` 模块
2. 选择：`New` → `Image Asset`

**方法二：通过菜单栏**
- 菜单栏：`File` → `New` → `Image Asset`

#### 4. 配置图标参数

在弹出的 "Configure Image Asset" 窗口中：

##### Foreground Layer（前景层）
```
Icon Type: Launcher Icons (Adaptive and Legacy)

Foreground Layer:
  ☑ Source Asset
    ● Image          ← 选择这个
    ○ Clip Art
    ○ Text
    
  📁 Path: [点击文件夹图标] 
           → 选择你的 1024x1024 图标文件
  
  Trim: Yes          ← 自动裁剪透明边距
  Resize: 75%        ← 调整图标在画布中的大小（根据预览调整）
```

##### Background Layer（背景层）
```
Background Layer:
  ☑ Source Asset
    ● Color          ← 选择纯色背景
    ○ Image          ← 或选择图片背景
    
  Color: #FFFFFF     ← 输入背景颜色（十六进制）
                       建议使用品牌主色
```

##### Options（选项）
```
Shape: 
  ○ Circle                   ← 圆形
  ○ Square                   ← 正方形
  ● Rounded Square           ← 圆角方形（推荐）
  ○ Squircle                 ← 超椭圆
  ○ Full Bleed Layers        ← 全出血
  
Legacy:
  ☑ Generate Legacy Icons    ← 生成旧版图标（建议勾选）
  ☑ Generate Round Icons     ← 生成圆形图标（建议勾选）
```

#### 5. 预览效果

Image Asset Studio 会实时显示：
- 不同形状下的图标效果
- Adaptive Icon 在不同设备上的显示
- 圆形图标效果
- 旧版 Android 系统的图标效果

**检查项**：
- ✅ 图标在小尺寸下是否清晰
- ✅ 前景图标是否被背景遮挡
- ✅ 圆形裁切后图标是否完整
- ✅ 不同背景下图标是否清晰可见

#### 6. 生成图标

1. 确认预览效果满意后，点击 **Next** 按钮
2. 确认文件输出路径：
   ```
   app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml
   app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml
   app/src/main/res/mipmap-mdpi/ic_launcher.webp
   app/src/main/res/mipmap-mdpi/ic_launcher_round.webp
   app/src/main/res/mipmap-hdpi/ic_launcher.webp
   ...
   ```
3. 点击 **Finish** 完成生成

#### 7. 生成的文件结构

Image Asset Studio 会自动生成以下文件：

```
app/src/main/res/
├── mipmap-mdpi/              # 48x48
│   ├── ic_launcher.webp
│   └── ic_launcher_round.webp
├── mipmap-hdpi/              # 72x72
│   ├── ic_launcher.webp
│   └── ic_launcher_round.webp
├── mipmap-xhdpi/             # 96x96
│   ├── ic_launcher.webp
│   └── ic_launcher_round.webp
├── mipmap-xxhdpi/            # 144x144
│   ├── ic_launcher.webp
│   └── ic_launcher_round.webp
├── mipmap-xxxhdpi/           # 192x192
│   ├── ic_launcher.webp
│   └── ic_launcher_round.webp
└── mipmap-anydpi-v26/        # Android 8.0+ Adaptive Icons
    ├── ic_launcher.xml       # 自适应图标（标准）
    └── ic_launcher_round.xml # 自适应图标（圆形）
```

#### 8. 重新构建和安装

```bash
cd client-app/android

# 清理旧构建
./gradlew clean

# 构建新 APK
./gradlew assembleDebug

# 卸载旧应用（避免图标缓存问题）
adb uninstall com.bondli.nexa.app

# 安装新应用
./gradlew installDebug

# 启动应用
adb shell am start -n com.bondli.nexa.app/.MainActivity
```

#### 9. 验证图标

安装后，检查：
- ✅ 启动器中的图标是否正确显示
- ✅ 最近任务列表中的图标
- ✅ 设置 → 应用信息中的图标
- ✅ 通知栏图标（如果应用有通知）

#### 10. 常见问题

**Q: 图标没有更新？**
```bash
# 解决方案：清除启动器缓存
adb shell pm clear com.android.launcher
# 或者重启设备
adb reboot
```

**Q: 想要不同的前景和背景？**
- Adaptive Icons 支持分离的前景和背景层
- 前景层：可以使用透明 PNG
- 背景层：可以使用纯色或图片
- 系统会根据设备主题动态组合

**Q: 想要复古的非 Adaptive Icon？**
- 取消勾选 "Icon Type: Adaptive"
- 选择 "Legacy Launcher Icons"
- 这样会生成传统的正方形图标

**Q: 如何支持不同的品牌形状？**
- Adaptive Icons 自动支持
- 不同厂商（小米、华为、OPPO 等）会自动应用各自的形状
- 你只需要提供前景层和背景层即可

---


## � 项目信息

- **应用ID**: `com.bondli.nexa.app`
- **最小支持**: Android 7.0 (API 24)
- **目标版本**: Android 14 (API 34)
- **React Native**: 0.75.3
- **Hermes**: 0.75.3
- **构建工具**: Gradle 8.7
- **AGP**: 8.5.2
- **Kotlin**: 1.9.22

