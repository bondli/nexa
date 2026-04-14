## Why

目前 React Native 项目在修改代码后，需要手动执行 `npm run bundle:android` 打包 JS Bundle，然后通过脚本复制到 Android assets 目录，再重新编译安装 debug 包才能在模拟器上看到效果。这个流程非常低效，每次修改代码都需要等待完整的 Android 构建过程。React Native 本身支持热更新，应该利用 Metro 开发服务器的实时加载能力来解决这个问题。

## What Changes

1. **修改 Android 应用配置**：让 debug 版本从 Metro 开发服务器加载 JS Bundle，而不是从本地 assets 目录读取
2. **添加开发服务器检测逻辑**：在应用启动时检测 Metro 服务器是否可用，自动切换加载模式
3. **添加一键启动脚本**：创建同时启动 Metro 服务器和 Android 模拟器的脚本
4. **配置网络权限**：确保应用可以访问开发服务器

## Capabilities

### New Capabilities
- **rn-hot-reload**: 实现 React Native 热更新功能，使代码修改后能在模拟器上实时生效

### Modified Capabilities
- 无

## Impact

- 需要修改 `client-app/android/app/build.gradle.kts` 的 debug 构建配置
- 需要修改 MainApplication.kt 或创建新的 React Native 配置
- 需要添加网络权限配置
- 需要更新 package.json 添加新的启动脚本