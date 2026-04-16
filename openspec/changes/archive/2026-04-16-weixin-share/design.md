## Context

用户在微信中看到优质文章时，希望能够一键保存到 Nexa 应用中。目前 React Native 端已实现 Share 页面用于接收分享参数，数据库端已完成临时文章表的创建。需要在 Android 端配置应用以响应微信的分享intent，使 Nexa 能够出现在微信的「使用其他应用打开」列表中。

当前 Android 端的 AndroidManifest.xml 只配置了 MAIN/LAUNCHER intent filter，需要添加自定义 URL Scheme 支持。

## Goals / Non-Goals

**Goals:**
- 配置 Android 应用响应 URL Scheme (`nexa://share/article?title=xxx&url=xxx`)
- 使 Nexa 出现在微信的「使用其他应用打开」列表中
- 确保分享参数能正确传递到 React Native 应用

**Non-Goals:**
- 不实现 iOS 端的微信分享接收（当前仅支持 Android）
- 不修改 React Native 端的业务逻辑（已实现）
- 不修改数据库表结构（已完成）

## Decisions

### 1. 使用 URL Scheme 而非 App Links

**选择**: 配置自定义 URL Scheme (`nexa://`)

**原因**:
- URL Scheme 是更通用的方案，配置简单，不需要域名验证
- 微信的「使用其他应用打开」列表支持 URL Scheme 方式唤起应用
- React Native 端已支持解析 `nexa://` 协议的 URL

**备选方案考虑**:
- App Links (HTTPS 协议): 需要域名和 SSL 证书，配置更复杂，适合长期演进

### 2. Intent Filter 配置位置

**选择**: 在 MainActivity 中添加 intent-filter

**原因**:
- React Native 的 MainActivity 是应用入口，更适合处理启动类的 intent
- 与现有的 MAIN/LAUNCHER intent filter 共存

### 3. 支持的 Intent Action

**选择**: 支持 `android.intent.action.SEND` 和 `android.intent.action.VIEW`

**原因**:
- `android.intent.action.SEND`: 用于接收从其他应用分享的内容（文本/链接）
- `android.intent.action.VIEW`: 用于接收通过 URL Scheme 打开的应用请求

## Risks / Trade-offs

- **风险**: 微信的「使用其他应用打开」列表可能需要用户手动配置才能显示
  - **缓解**: 确认 AndroidManifest.xml 配置正确后，用户在微信中选择「其他应用」时应能看到 Nexa

- **风险**: URL 参数编码问题
  - **缓解**: React Native 端已使用 URLSearchParams 解析，Android 端只需传递原始 URL

- **限制**: 当前仅支持 Android 端，iOS 端需要额外配置