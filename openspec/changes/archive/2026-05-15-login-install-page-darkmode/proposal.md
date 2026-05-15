## Why

当前 Nexa 桌面端用户登录页面（UserPage）和初始化安装页面（BootPage）不支持暗黑模式，影响用户体验一致性。此外 Electron 层已移除原生 titlebar，需要前端 TitleBar 组件进行占位。文章图片生成模板字体过大，影响美观和信息密度。

## What Changes

- UserPage 和 BootPage 页面支持暗黑模式切换，包括背景色、文字颜色、按钮样式等
- 在 UserPage 和 BootPage 中引入前端 TitleBar 组件进行占位
- 优化文章图片 HTML 模板字体大小，提升美观度和信息密度

## Capabilities

### New Capabilities

- `login-page-darkmode`: 登录页面暗黑模式支持
- `install-page-darkmode`: 安装页面暗黑模式支持
- `article-image-template-optimization`: 文章图片模板优化

### Modified Capabilities

<!-- 无现有 spec 级别的行为变更 -->

## Impact

- 修改文件：
  - `frontend/modules/UserPage/` - 添加暗黑模式样式和 TitleBar
  - `frontend/modules/BootPage/` - 添加暗黑模式样式和 TitleBar
  - `server/services/article-template-service.ts` - 调整 HTML 模板字体大小
- 依赖组件：`frontend/components/TitleBar`
- 无 API 变更
