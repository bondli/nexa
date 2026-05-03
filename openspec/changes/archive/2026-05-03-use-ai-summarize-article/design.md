## Context

桌面端文章列表页面（`frontend/pages/Article/Actions.tsx`）目前提供删除、移动分类、添加到知识库等操作。需要新增AI总结功能，让用户点击后通过LLM对文章内容进行智能总结，并以流式方式呈现结果。

后端现有 `server/services/llm-text-service.ts` 提供了 `summarize` 函数，但不支持流式输出。需要扩展为SSE流式接口。

## Goals / Non-Goals

**Goals:**
- 在文章操作菜单中新增"AI总结"入口
- 调用后端接口对文章进行AI总结
- Modal框显示加载状态和Markdown格式的总结结果
- 支持SSE流式返回，实现打字机效果

**Non-Goals:**
- 不修改文章数据库模型
- 不支持批量总结
- 不支持移动端/浏览器插件端

## Decisions

### 1. 后端接口设计
**决定**：新增 `GET /article/summarize` 接口，支持SSE流式输出

**理由**：
- GET便于前端直接通过URL调用，参数为文章ID
- SSE实现简单，前端可通过 `EventSource` 或 `fetch` + `ReadableStream` 接收
- 复用现有 `loadLLMConfig` 配置，保持一致性

**替代方案**：
- WebSocket：复杂度高，不需要双向通信
- 普通POST+轮询：延迟高，用户体验差

### 2. 前端Modal实现
**决定**：复用现有Modal组件，通过state控制加载/展示状态

**理由**：
- 项目已有Modal使用模式，保持一致
- Markdown渲染使用 `@ant-design/react-markdown-editor Lite` 或简单的 `react-markdown`

### 3. SSE流式处理
**决定**：后端使用 `text/event-stream` 格式，前端使用 `fetch` + `ReadableStream`

**理由**：
- `EventSource` 不支持POST请求和自定义Header
- `fetch` + `ReadableStream` 可获取响应头中的userId
- 前端实现打字机效果：逐字符/逐词追加到状态

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| LLM服务不可用 | 后端catch异常，返回错误事件，前端显示错误提示 |
| 文章内容过长 | 设置 `max_tokens` 限制，或对超长内容截断 |
| SSE连接中断 | 前端检测 `onerror`，显示重试按钮 |

## Open Questions

- 是否需要将总结结果缓存到数据库？（当前设计每次重新生成）
- Markdown渲染组件选择？（项目中未发现已使用的markdown组件）
