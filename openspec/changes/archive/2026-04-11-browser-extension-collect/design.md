## Context

Nexa 是一款 AI 知识库桌面应用，用户需要将从浏览器看到的有价值内容便捷地保存到知识库中。目前用户只能手动复制粘贴内容到笔记，流程繁琐且效率低下。

本设计针对浏览器插件采集功能的技术实现进行规划，涉及：
- 浏览器插件前端（TypeScript + Antd 6 + Vite）
- 插件与服务端通信
- 浮动面板 UI 布局与交互

## Goals / Non-Goals

**Goals:**
- 实现浏览器插件一键提取当前页面内容为 Markdown 格式
- 提供友好的浮动面板 UI（提取按钮、编辑器、分类选择、保存按钮）
- 支持登录态校验，未登录时引导登录
- 插件构建产物可安装使用

**Non-Goals:**
- 不实现插件自动同步或云端存储
- 不支持除 Chrome 外的其他浏览器（后续可扩展）
- 不实现复杂的页面内容解析（如 SPA 动态内容深度提取）

## Decisions

### 1. 技术栈选择
- **UI 框架**: Antd 6（按需求）
- **构建工具**: Vite（支持 TypeScript，产物为 dist 目录）
- **状态管理**: React Hooks（useState/useEffect）

### 2. 插件架构
- 采用 Manifest V3
- 使用 Chrome Extension APIs (chrome.runtime, chrome.tabs)
- 内容提取：通过 Content Script 注入页面获取 DOM 内容

### 3. 页面内容提取策略
- 提取页面标题（`<title>` 或 `<h1>`）
- 提取页面 URL
- 提取主要内容：遍历 `<article>`, `<main>`, `.content`, `.article` 等常见容器，提取文本
- 转换为 Markdown：保留基本格式（段落、标题、链接、图片）

### 4. 浮动面板布局
- 使用 Antd 布局组件（Drawer 或 FloatButton + Popover）
- 固定在页面右侧
- 最大高度 1000px，超出可滚动
- 高度自适应内容

### 5. 登录态管理
- 插件存储登录态（localStorage 或 chrome.storage）
- 调用服务端 API 前校验 token
- 未登录时显示登录界面（用户名+密码或扫码）

### 6. 服务端 API（复用现有接口）
- 用户登录：`POST /user/login`
- 分类列表：`GET /cate/list`
- 创建笔记：`POST /note/add`

### 7. 内容提取方案选择
- **方案 A（推荐）**: DOM 分析 - 遍历常见容器提取内容，轻量级，适合大多数网页
- **方案 B（可选）**: Playwright - 可处理 SPA 动态内容，但需要后台服务支持
- **方案 C（可选）**: AI Agent - 智能提取页面核心内容，但需要调用 LLM

推荐先用方案 A，后续可扩展支持方案 B/C。

## Risks / Trade-offs

- **内容提取准确性**: 不同网站结构差异大，提取质量不稳定
  - 缓解：提供 Markdown 编辑器供用户手动调整
- **跨域请求**: 插件请求服务端 API 存在跨域问题
  - 缓解：服务端配置 CORS，或使用 chrome.runtime.sendNativeMessage
- **登录态安全**: token 存储在插件端存在安全风险
  - 缓解：使用 chrome.storage 加密存储（若支持）