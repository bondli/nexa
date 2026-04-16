## ADDED Requirements

### Requirement: 开发环境可以启动 Metro 服务并构建调试 APK
开发人员执行 `npm run dev:android` 时，系统 SHALL 启动 React Native Metro 服务，连接本地模拟器，构建并安装调试 APK。

#### Scenario: 启动开发模式构建
- **WHEN** 开发人员在 `client-app/` 目录下执行 `npm run dev:android`
- **THEN** 系统自动执行以下步骤：
  1. 启动 Metro 打包服务
  2. 构建调试 APK（包含 JS bundle）
  3. 将 APK 安装到连接的模拟器或设备

#### Scenario: Metro 服务启动成功
- **WHEN** Metro 服务成功启动
- **THEN** 控制台输出 Metro 服务 URL（通常是 http://localhost:8081）

#### Scenario: 构建失败时给出明确错误信息
- **WHEN** 构建过程中发生错误
- **THEN** 系统输出明确的错误信息，帮助开发人员定位问题

### Requirement: 调试 APK 可以独立运行
调试 APK SHALL 包含完整的 JS bundle，可以不依赖 Metro 服务独立启动。

#### Scenario: APK 安装后可以正常启动
- **WHEN** 用户在设备上打开已安装的调试 APK
- **THEN** 应用正常启动，显示主界面

#### Scenario: APK 包含正确的 JS bundle
- **WHEN** 检查已构建的 APK
- **THEN** APK 的 assets 目录下存在 `index.android.bundle` 文件

### Requirement: 构建脚本统一管理
所有 Android 构建相关的脚本 SHALL 统一放在 `client-app/scripts/android/` 目录下。

#### Scenario: 脚本目录结构规范
- **WHEN** 检查 `client-app/scripts/android/` 目录
- **THEN** 存在以下文件：
  - `bundle.js` - 打包 JS bundle
  - `copy-bundle.js` - 复制 bundle 到 Android 资源目录
  - `dev.js` - 开发模式构建脚本
  - `release.js` - 发布模式构建脚本

### Requirement: npm scripts 配置规范
`package.json` SHALL 定义清晰的 npm scripts，支持开发和发布构建。

#### Scenario: package.json 包含正确的 scripts
- **WHEN** 检查 `client-app/package.json` 的 scripts 字段
- **THEN** 存在以下脚本：
  - `dev:android` - 启动开发构建并安装 APK
  - `build:android:release` - 构建发布版本 APK