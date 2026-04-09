## Why

用户需要快速将截图内容保存到知识库。目前应用已有托盘和快速笔记功能，但缺少直接从屏幕截图提取文字并保存的能力。这个功能可以大幅提升用户从外部内容（如网页、图片、文档）快速收集信息的效率。

## What Changes

1. **托盘菜单新增"截图快存"入口** - 位置在"快速笔记"后面
2. **截图粘贴窗口** - 托盘下方出现黑色半透明框，提示用户粘贴截图
3. **OCR 文字识别** - 上传图片后服务端进行 OCR 识别
4. **AI 文案优化** - 识别文字后调用 AI 优化文案
5. **知识库保存** - 展示优化后的文案（Markdown），提供"存到知识库"按钮
6. **保存结果反馈** - 成功/失败提示，成功后自动关闭窗口

## Capabilities

### New Capabilities

- **screenshot-capture**: 托盘入口、截图粘贴窗口、粘贴事件监听、进度显示
- **screenshot-ocr**: 图片上传、OCR 文字识别服务
- **ai-text-optimize**: 调用 AI 对 OCR 识别结果进行优化
- **knowledge-save**: 将优化后的文案保存到指定知识库

### Modified Capabilities

- **desktop-quick-note**: 现有快速笔记功能，可复用部分 UI 组件

## Impact

### 前端 (frontend/)

- 新增截图粘贴窗口组件 (ScreenshotCapture)
- 托盘菜单添加"截图快存"入口
- 知识库选择器组件复用

### 后端 (server/)

- 新增截图上传接口
- 新增 OCR 识别服务
- 新增 AI 文本优化服务
- 知识库文档保存接口复用

### 客户端 (electron/)

- 托盘菜单添加新选项
- 全局粘贴事件监听

### 依赖

- 需要 OCR 库（如 tesseract.js）或 OCR API
- 复用现有 AI 服务 (aiService)