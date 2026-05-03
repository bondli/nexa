## Why

用户需要快速了解文章的核心内容，无需完整阅读即可把握要点。AI总结功能可以自动提取文章的关键信息，以结构化的方式呈现给用户，大幅提升阅读效率。

## What Changes

- 在桌面端文章列表页面的操作菜单中新增"AI总结"选项
- 点击后弹出Modal框，显示AI正在总结的加载状态
- 调用后端接口使用LLM对文章内容进行总结
- 总结完成后在Modal框内以Markdown格式展示结果
- 支持SSE流式返回，实现打字机效果

## Capabilities

### New Capabilities
- `article-ai-summarize`: 文章AI总结功能，支持流式输出

## Impact

- 前端：`frontend/pages/Article/Actions.tsx` - 新增AI总结菜单和Modal
- 后端：`server/controllers/article-controller.ts` - 新增AI总结接口
- 复用现有 `server/services/llm-text-service.ts` 的LLM调用能力
