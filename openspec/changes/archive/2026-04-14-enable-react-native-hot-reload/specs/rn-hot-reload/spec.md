## ADDED Requirements

### Requirement: Debug 版本从 Metro 开发服务器加载 JS Bundle
debug 构建的 Android 应用 SHALL 从 Metro 开发服务器（默认地址 10.0.2.2:8081）加载 JS Bundle，而不是从本地 assets 目录读取打包好的 bundle 文件。

#### Scenario: Metro 服务器正常运行
- **WHEN** 应用以 debug 模式启动且 Metro 开发服务器正在运行
- **THEN** 应用成功从开发服务器下载并加载 JS Bundle，用户可以看到主界面

#### Scenario: Metro 服务器未运行
- **WHEN** 应用以 debug 模式启动但 Metro 开发服务器未运行
- **THEN** 应用显示错误界面，提示"无法连接到开发服务器，请确保 Metro 正在运行"

### Requirement: Release 版本使用本地 bundle
release 构建的 Android 应用 SHALL 使用预置在 assets 目录中的 bundle 文件，确保离线可用。

#### Scenario: Release 版本启动
- **WHEN** 应用以 release 模式启动
- **THEN** 应用从本地 assets/index.android.bundle 加载代码，无需网络连接

### Requirement: 开发服务器地址可配置
开发服务器的地址 SHALL 可通过 gradle 属性或 BuildConfig 进行配置。

#### Scenario: 自定义开发服务器地址
- **WHEN** 在 gradle.properties 中设置 `reactNativeDevServerUrl=192.168.1.100:8081`
- **THEN** 应用尝试连接到指定的自定义地址

### Requirement: 一键启动脚本
提供 npm scripts 同时启动 Metro 开发服务器和 Android 调试构建。

#### Scenario: 执行 dev:android 脚本
- **WHEN** 用户运行 `npm run dev:android`
- **THEN** Metro 开发服务器在后台启动，并执行 Android debug 构建