## Context

Nexa 桌面端当前存在以下问题：
1. UserPage 和 BootPage 使用固定白色背景，无法跟随系统/手动暗黑模式切换
2. Electron 层已移除原生 titlebar，但 UserPage 和 BootPage 未引入前端 TitleBar 组件进行占位
3. 文章图片 HTML 模板字体过大（标题 72px，KPI 数值 56px），影响美观

现有 TitleBar 组件已支持暗黑模式，MainPage 已通过 CSS 变量实现主题适配。

## Goals / Non-Goals

**Goals:**
- UserPage 和 BootPage 支持暗黑模式，与 MainPage 主题切换同步
- 在 UserPage 和 BootPage 顶部添加 TitleBar 组件占位
- 优化文章图片模板字体大小，提升信息密度

**Non-Goals:**
- 不修改 LoginPage 和 BootPage 的业务逻辑
- 不修改 TitleBar 组件本身的实现
- 不修改文章图片生成的数据提取逻辑

## Decisions

### 1. 暗黑模式适配方案

**决定**: 使用 CSS 变量 + antd 主题变量实现暗黑模式

**理由**:
- MainPage 已使用 `var(--ant-color-bg-container)` 等 antd 主题变量
- UserPage/BootPage 目前使用固定颜色，需迁移到 CSS 变量
- 与现有主题系统保持一致

**变更**:
- 将 `.header` 背景色从 `#fff` 改为 `var(--ant-color-bg-header)` 或透明
- 将文字颜色改为 `var(--ant-color-text)` 等变量
- 背景色使用 `var(--ant-color-bg-container)`

### 2. TitleBar 组件引入

**决定**: 在 UserPage 和 BootPage 的 Layout 顶部添加 TitleBar 组件

**理由**:
- TitleBar 组件已有完整的暗黑模式支持
- 只需在页面顶部插入组件，无需修改其内部实现
- BootPage 的 Logo 区域可移除，由 TitleBar 替代

**变更**:
- UserPage: 在 `<Header>` 前添加 `<TitleBar />`
- BootPage: 在 `<Header>` 前添加 `<TitleBar />`

### 3. 文章图片模板字体优化

**决定**: 按比例缩小字体，保持整体布局协调

**理由**:
- 当前标题 72px 过大，副标题 30px 也偏大
- KPI 数值 56px 导致卡片容易溢出
- 按 0.7-0.8 比例缩放可在相同空间展示更多内容

**建议变更**:
- 标题: 72px → 48px (缩小约 33%)
- 副标题: 30px → 20px
- KPI 数值: 56px → 40px
- KPI 标签: 26px → 18px
- 正文: 24-28px → 16-18px

## Risks / Trade-offs

- [风险]: TitleBar 固定定位可能与页面内容重叠
  - **缓解**: TitleBar 高度 27px，页面内容从 27px 开始即可
- [风险]: 模板字体缩小可能影响旧数据生成的图片一致性
  - **缓解**: 仅影响新生成的图片，旧图片不受影响

## Migration Plan

1. 修改 UserPage/index.tsx 和 index.module.less
2. 修改 BootPage/index.tsx 和 index.module.less
3. 修改 server/services/article-template-service.ts 中的 getHtmlTemplate 函数
4. 测试暗黑模式切换
5. 测试文章图片生成

## Open Questions

- TitleBar 是否需要在 LoginPage/BootPage 中也监听登录状态来显示/隐藏？
