## Why

当前 `client-app/android` 目录下存在打包配置混乱、构建流程不规范的问题，导致应用无法正常启动以及打包后存在风险提示（安全警告）。需要系统性地重构 Android 构建配置和脚本，以实现稳定、可维护的构建流程。

## What Changes

1. **清理和规范 Gradle 配置文件**
   - 统一使用 Kotlin DSL (`.gradle.kts`)，移除混用的 Groovy 配置
   - 清理冗余的插件和依赖声明
   - 规范化 `build.gradle.kts` 和 `settings.gradle.kts` 的配置

2. **重构构建脚本**
   - 统一将构建脚本放在 `client-app/scripts/` 目录下
   - 重构 `dev:android` 脚本，实现 Metro 服务启动、APK 构建、模拟器安装的标准化流程
   - 创建 `build:android:release` 脚本，实现 bundle 打包、复制、签名 APK 构建的完整流程

3. **修复启动问题**
   - 排查并修复应用无法启动的根本原因
   - 确保打包的 APK 包含正确的 bundle 文件

4. **消除安全风险提示**
   - 修复签名配置问题
   - 清理可能导致安全警告的配置

## Capabilities

### New Capabilities

- **android-dev-workflow**: 标准化开发工作流，支持 `npm run dev:android` 启动 Metro 服务并安装调试 APK
- **android-release-build**: 标准化发布构建流程，支持 `npm run build:android:release` 生成签名 APK

### Modified Capabilities

- 无现有 capability 修改

## Impact

- 代码目录：`client-app/android/` (Gradle 配置重构)
- 代码目录：`client-app/scripts/` (新增/修改构建脚本)
- 代码目录：`client-app/package.json` (新增 npm scripts)
- 依赖：无新增外部依赖，仅调整现有配置