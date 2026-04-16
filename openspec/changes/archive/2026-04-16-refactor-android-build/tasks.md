## 1. 创建构建脚本目录和基础文件

- [x] 1.1 创建 `client-app/scripts/android/` 目录结构
- [x] 1.2 创建 `client-app/scripts/shared/constants.js` 共享配置
- [x] 1.3 创建 `client-app/scripts/copy-bundle.js` 平台无关的 bundle 复制脚本（Android/iOS 共用，包含 antd 字体复制）
- [x] 1.4 创建 `client-app/scripts/android/bundle.js` JS bundle 打包脚本

## 2. 重构 Gradle 配置文件

- [x] 2.1 检查并规范化 `android/settings.gradle.kts` (已使用 Kotlin DSL，无需修改)
- [x] 2.2 检查并规范化 `android/build.gradle.kts` (根项目，已使用 Kotlin DSL，无需修改)
- [x] 2.3 检查并规范化 `android/app/build.gradle.kts` (已配置正确)
- [x] 2.4 清理旧的 Groovy 配置文件（不存在，无需清理）

## 3. 开发模式构建脚本

- [x] 3.1 创建 `client-app/scripts/android/dev.js` 开发构建脚本（含模拟器检查/启动、端口管理、Metro 启动、构建、安装、启动应用）
- [x] 3.2 更新 `package.json` 的 `dev:android` 脚本
- [x] 3.3 确保 debug 构建配置正确连接 Metro 服务（已配置 reactNativeBundleInDebug=false）

## 4. 发布模式构建脚本

- [x] 4.1 创建 `client-app/scripts/android/release.js` 发布构建脚本（先打包 bundle，再 copy 到 android，最后构建 release apk）
- [x] 4.2 更新 `package.json` 添加 `release:android` 命令（`build:android:release` 作为别名保留）

## 5. 验证构建流程

> 以下任务需要在本地环境执行验证

- [ ] 5.1 运行 `npm run dev:android` 验证开发构建
- [ ] 5.2 验证 APK 可以正常安装
- [ ] 5.3 验证应用可以正常启动
- [ ] 5.4 验证热更新功能：修改 RN 代码后，Metro 服务自动 reload
- [ ] 5.5 运行 `npm run release:android` 验证发布构建
- [ ] 5.6 验证 release APK 签名正常，无安全警告

## 6. 清理和优化

- [x] 6.1 清理 `android/` 目录下多余的脚本文件（决定保留现有脚本，它们提供备用功能）
- [ ] 6.2 验证构建日志中无警告信息
- [ ] 6.3 更新 README.md 文档（如需要）