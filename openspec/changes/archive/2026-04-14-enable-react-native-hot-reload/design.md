## Context

当前 React Native 项目的 Android 端使用独立打包模式：每次修改 JS 代码后，需要运行 `npm run bundle:android` 生成 bundle 文件，然后通过脚本复制到 `android/app/src/main/assets/` 目录，最后重新编译 APK 并安装到模拟器。这种方式每次修改代码都需要等待完整的 Android 构建流程，效率极低。

React Native 0.75.3 版本内置了对 Metro 开发服务器的支持，可以通过配置让 debug 版本直接从开发服务器加载 JS Bundle，实现代码修改后立即在模拟器上生效。

项目现状：
- React Native 版本：0.75.3
- Android Gradle 插件：使用 Kotlin DSL
- 已存在开发服务器相关配置字段（build.gradle.kts 中有 REACT_NATIVE_DEV_SERVER_ENABLED 和 REACT_NATIVE_DEV_SERVER_URL）

## Goals / Non-Goals

**Goals:**
1. 实现 debug 版本从 Metro 开发服务器加载 JS Bundle
2. 应用启动时自动检测开发服务器是否可用
3. 创建一键启动脚本，同时启动 Metro 服务器和 Android 模拟器
4. release 版本继续使用本地 bundle 文件

**Non-Goals:**
- 不修改现有的 release 构建流程
- 不实现 OTA 热更新（只针对开发环境）
- 不修改 iOS 相关配置（目前项目暂无 iOS 端）

## Decisions

### Decision 1: 使用 DevSettings 配置开发服务器加载

React Native 提供了 `DevSettings` 模块来配置开发模式行为。通过在 MainApplication 中启用 `devSettings.setIsDebuggingEnabled(true)` 并配置 JS Bundle 加载地址，可以实现从 Metro 服务器加载代码。

**替代方案考虑：**
- 方案 A：修改 ReactNativeHost 的 getJSBundleFile 方法（较复杂，需要重写整个加载逻辑）
- 方案 B：使用 JSI 直接加载（需要更多底层改动）
- **最终选择**：使用 DevSettings + ReactNativeHost 配置，这是官方推荐的标准方式，改动最小

### Decision 2: 开发服务器 URL 配置

Android 模拟器访问宿主机 Metro 服务器需要使用特殊地址：
- Android 模拟器：`10.0.2.2` 指向宿主机的 localhost
- Genymotion：`10.0.3.2` 指向宿主机
- 真机：通过 USB 调试时使用 `localhost`

**最终选择**：默认使用 `10.0.2.2:8081`，这是 Android 模拟器的标准配置

### Decision 3: 启动方式

创建一个 npm 脚本同时启动 Metro 和 Android 调试构建。

**替代方案考虑：**
- 使用 concurrently 库并行执行
- 使用 shell 脚本
- **最终选择**：使用 package.json 中的 scripts 结合 shell 后台执行，简化依赖

## Risks / Trade-offs

1. **网络连接问题** → 如果模拟器无法访问开发服务器，应用会报错
   - 缓解：在应用中添加错误提示，显示无法连接的原因

2. **首次启动较慢** → 需要等待 Metro 服务器响应
   - 缓解：显示加载提示

3. **调试构建的 APK 大小** → debug 版本会包含完整的开发工具
   - 确认：这是预期行为，debug 版本本来就应该更大

## Migration Plan

1. 修改 `build.gradle.kts` 确保 debug 版本不打包 JS Bundle 到 assets
2. 修改 MainApplication.kt 配置开发服务器加载
3. 添加网络权限到 AndroidManifest.xml
4. 创建启动脚本 `npm run dev:android`
5. 验证热更新功能正常工作