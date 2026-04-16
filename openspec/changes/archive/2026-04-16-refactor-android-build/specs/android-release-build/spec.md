## ADDED Requirements

### Requirement: 发布构建生成签名 APK
开发人员执行 `npm run build:android:release` 时，系统 SHALL 生成包含完整 JS bundle 的签名 APK。

#### Scenario: 启动发布构建
- **WHEN** 开发人员在 `client-app/` 目录下执行 `npm run build:android:release`
- **THEN** 系统自动执行以下步骤：
  1. 打包 JS bundle（minified）
  2. 复制 bundle 到 Android assets 目录
  3. 使用 release keystore 签名构建 APK
  4. 输出 APK 到 `android/app/build/outputs/apk/release/` 目录

#### Scenario: 构建成功输出 APK
- **WHEN** 发布构建成功完成
- **THEN** 在 `android/app/build/outputs/apk/release/` 目录下存在 `app-release.apk` 文件

#### Scenario: 构建失败时给出明确错误信息
- **WHEN** 构建过程中发生错误
- **THEN** 系统输出明确的错误信息，帮助开发人员定位问题

### Requirement: 签名配置消除安全警告
发布 APK SHALL 使用正确的签名配置，安装时不出现风险提示。

#### Scenario: APK 使用 V1 和 V2 签名
- **WHEN** 检查签名后的 APK
- **THEN** APK 同时使用 V1（JAR 签名）和 V2（APK 签名方案 v2）签名

#### Scenario: keystystore 配置正确
- **WHEN** 检查 `android/app/build.gradle.kts` 的签名配置
- **THEN** 正确配置了 keystore 路径、别名和密码

### Requirement: Release 构建包含独立 JS bundle
发布 APK SHALL 包含完整的 JS bundle，可以独立安装和运行。

#### Scenario: APK 包含 minified JS bundle
- **WHEN** 检查已构建的 release APK
- **THEN** APK 的 assets 目录下存在 `index.android.bundle` 文件

#### Scenario: JS bundle 已 minified
- **WHEN** 检查 bundle 文件大小
- **THEN** bundle 文件相比开发版本更小（经过压缩）

### Requirement: Gradle 配置使用 Kotlin DSL
Android 项目 SHALL 统一使用 Kotlin DSL (.gradle.kts) 进行配置。

#### Scenario: 所有 Gradle 文件使用 .kts 扩展名
- **WHEN** 检查 `android/` 目录下的 Gradle 文件
- **THEN** 不存在 `.gradle`（Groovy）文件，只存在 `.gradle.kts`（Kotlin）文件

#### Scenario: build.gradle.kts 配置规范
- **WHEN** 检查 `android/app/build.gradle.kts`
- **THEN** 配置包含：
  - 正确的 namespace 和 applicationId
  - 统一的插件版本管理
  - 正确的 minSdkVersion 和 targetSdkVersion
  - 完整的签名配置

#### Scenario: settings.gradle.kts 配置规范
- **WHEN** 检查 `android/settings.gradle.kts`
- **THEN** 配置包含正确的项目名称和模块引用