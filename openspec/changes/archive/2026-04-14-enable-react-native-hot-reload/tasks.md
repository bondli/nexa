## 1. 配置 Android 构建

- [x] 1.1 修改 build.gradle.kts，配置 debug 构建时排除 JS Bundle 打包
- [x] 1.2 在 AndroidManifest.xml 添加网络权限配置

## 2. 修改 React Native 加载逻辑

- [x] 2.1 修改 MainApplication.kt，配置从开发服务器加载 JS Bundle
- [x] 2.2 添加开发服务器不可用时的错误处理

## 3. 添加启动脚本

- [x] 3.1 在 package.json 添加 dev:android 脚本
- [x] 3.2 验证脚本可以正常启动 Metro 和 Android 构建

## 4. 测试验证

- [ ] 4.1 运行 `npm run dev:android` 验证热更新功能
- [ ] 4.2 修改 RN 代码验证模拟器实时更新
- [ ] 4.3 验证 release 版本仍从本地 bundle 加载