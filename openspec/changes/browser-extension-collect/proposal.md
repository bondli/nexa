## Why

用户需要一种便捷的方式将浏览器中看到的有价值内容（如文章、文档、网页）一键保存到 Nexa 知识库中。目前没有直接从浏览器快速采集内容的入口，用户只能手动复制粘贴，流程繁琐。

## What Changes

- 新增浏览器插件（Chrome Extension），实现一键提取当前页面 URL 内容并保存为 Markdown 格式
- 插件采用 TypeScript + Antd 6 + Vite 构建
- 插件提供浮动面板 UI，包含提取按钮、Markdown 编辑器、分类选择器和保存按钮
- 插件需要登录态校验，支持登录流程

## Capabilities

### New Capabilities

- `browser-extension-collect`: 浏览器插件采集功能
  - 插件安装后，点击图标显示浮动面板
  - "一键提取"按钮提取当前页面标题、URL、内容（提取为 Markdown）
  - Markdown 编辑器展示提取的内容
  - 分类选择器选择目标笔记分类
  - "保存到笔记"按钮调用服务端 API 保存
  - 登录态校验，未登录时显示登录界面
  - 浮动面板最大高度 1000px，高度随内容自适应

## Impact

- 代码目录：`browser-extension/` - 浏览器插件代码（已创建）
- 服务端接口：复用了现有接口
  - 用户登录：`POST /user/login`
  - 分类列表：`GET /cate/list`
  - 创建笔记：`POST /note/add`
- 需要实现：Chrome Extension 前端 + 内容提取逻辑
- 内容获取方案：采用 DOM 分析 + 可选的 AI 增强方案