## ADDED Requirements

### Requirement: Android 应用响应微信分享intent
Android 应用 SHALL 能够响应微信的分享intent，使得 Nexa 出现在微信的「使用其他应用打开」列表中。

#### Scenario: 通过 URL Scheme 打开应用
- **WHEN** 用户在微信中点击「使用其他应用打开」并选择 Nexa
- **THEN** Android 系统 SHALL 使用 URL Scheme `nexa://share/article?title=xxx&url=xxx` 唤起 Nexa 应用

#### Scenario: 应用接收分享参数
- **WHEN** 应用通过 URL Scheme 被唤起并携带参数时
- **THEN** 应用 SHALL 解析 URL 中的 title 和 url 参数并传递给 React Native 层

### Requirement: AndroidManifest.xml 配置自定义 URL Scheme
应用 SHALL 在 AndroidManifest.xml 中配置 intent-filter 以支持自定义 URL Scheme。

#### Scenario: 配置 intent-filter
- **WHEN** 检查 AndroidManifest.xml 配置时
- **THEN** SHALL 包含支持 `nexa:` 协议的 intent-filter，且 android:scheme="nexa"

#### Scenario: 设置 launchMode 为 singleTask
- **WHEN** 处理通过 URL Scheme 打开的应用请求时
- **THEN** Activity SHALL 使用 singleTask 启动模式，避免创建多个实例

### Requirement: React Native 端接收并处理分享参数
React Native 应用 SHALL 能够接收并处理从 Android 传递过来的分享参数。

#### Scenario: 解析分享 URL
- **WHEN** 应用接收到 nexa://share/article?title=xxx&url=xxx 格式的 URL
- **THEN** 应用 SHALL 解析出 title 和 url 参数，并显示分享接收页面

#### Scenario: 保存到临时文章表
- **WHEN** 用户在分享接收页面点击「保存」按钮
- **THEN** 应用 SHALL 将文章标题和 URL 保存到临时文章表