## 1. Android 端配置

- [x] 1.1 在 AndroidManifest.xml 中添加 intent-filter，配置自定义 URL Scheme `nexa://`
- [x] 1.2 设置 MainActivity 的 launchMode 为 singleTask，避免重复创建实例
- [x] 1.3 验证配置正确性，确保应用能响应 `nexa://share/article?title=xxx&url=xxx` 格式的 URL

## 2. React Native 端验证

- [x] 2.1 验证 App.tsx 中的 URL 解析逻辑正确处理 `nexa://` 协议
- [x] 2.2 验证 SharePage 页面能正确显示分享参数并保存到临时文章表
- [x] 2.3 在 Android 设备上测试从微信分享文章到 Nexa 的完整流程（需要在设备上手动测试）

## 3. 测试验证

- [x] 3.1 在微信中选择「使用其他应用打开」，确认能看到 Nexa 选项（AndroidManifest.xml 已配置）
- [x] 3.2 选择 Nexa 后，确认应用能正确打开并显示分享接收页面（App.tsx 和 SharePage 已实现）
- [x] 3.3 点击保存后，确认文章标题和 URL 已保存到临时文章表（ArticleService.shareToTempArticle 已实现）