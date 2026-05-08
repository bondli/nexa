## Why

浏览器插件现有的一键采集功能采集回来的原文可读性差，用户体验不佳。需要升级为3步流程：采集原文 → AI总结 → 基于总结生成图片，提供更好的交互体验和更高价值的内容输出。

## What Changes

- 升级浏览器插件文章采集为3步流程：采集原文 → AI总结 → 生成图片
- 新增 Modal 界面支持分步骤Tab切换，每步完成后才能进入下一步
- 第一步：采集原文（复用现有逻辑），Markdown编辑器预览
- 第二步：AI总结原文（调用 /article/summarize 接口），Markdown预览总结内容
- 第三步：基于总结内容生成图片（调用 /article/generate-image 接口），使用HTML模板 + html2canvas生成

## Capabilities

### New Capabilities

- `browser-extension-article-summarize`: 浏览器插件文章采集+总结+图片生成
  - 保留现有悬浮图标和采集面板交互
  - 点击"一键提取"后关闭采集面板，弹出3步Modal
  - Step 1: 采集原文 → Markdown预览（可编辑）
  - Step 2: AI总结（自动触发，仅Step1完成后可切换）→ Markdown预览总结
  - Step 3: 生成图片（自动触发，仅Step2完成后可切换）→ 展示生成的图片

### Modified Capabilities

- `/article/save` 接口：新增 `summary` 和 `image` 字段
  - `summary`: AI总结内容
  - `image`: 生成的图片云端地址

### New APIs

- `POST /article/generate-image`: 基于文章总结内容生成HTML模板，转换为图片并上传云端，返回图片URL

## Impact

- 浏览器插件端：`browser-extension/src/content/content.tsx` - 修改采集面板UI和新增Modal组件
- 服务端：
  - `server/controllers/article-controller.ts` - 新增 `/article/generate-image` 接口
  - `/article/save` 接口 - 新增 `summary` 字段支持
- 依赖现有 Antd 组件和 Markdown 编辑器组件
