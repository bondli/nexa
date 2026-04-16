## Why

用户在微信中看到优质文章时，希望能够一键保存到 Nexa 应用中保存和管理。目前缺少从微信分享文章到 Nexa 的能力，需要在 Android 端配置应用以响应微信的分享intent。

## What Changes

- 在 Android 端配置应用以响应微信的分享intent，使 Nexa 出现在微信的「使用其他应用打开」列表中
- 配置自定义 URL Scheme (`nexa://share/article?title=xxx&url=xxx`) 用于接收微信传递的文章数据
- 确保 Android 端能正确解析分享参数并传递给 React Native 应用

## Capabilities

### New Capabilities

- **weixin-share-receive**: 支持从微信分享文章到 Nexa 应用，包括 Android 端的 Intent 配置和 URL Scheme 注册

### Modified Capabilities

无

## Impact

- **Android 端**: 需要在 AndroidManifest.xml 中添加 Intent Filter 配置自定义 URL Scheme
- **React Native 端**: 已在 client-app/src/App.tsx 中实现 Share 页面，接收并处理分享参数
- **数据库端**: 临时文章表已创建完成