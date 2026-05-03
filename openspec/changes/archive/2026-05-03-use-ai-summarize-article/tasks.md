## 1. 后端实现

- [x] 1.1 在 `server/controllers/article-controller.ts` 中新增 `summarizeArticle` 函数，支持SSE流式输出
- [x] 1.2 在 `server/routers/index.ts` 中添加 `GET /article/summarize` 路由

## 2. 前端实现

- [x] 2.1 在 `frontend/pages/Article/Actions.tsx` 的菜单中添加"AI总结"菜单项
- [x] 2.2 创建 `frontend/components/AISummarizeModal/` 组件目录，包含 `index.tsx` 和 `index.module.less`
- [x] 2.3 实现 `AISummarizeModal` 组件：显示Modal、处理SSE流式数据、实现打字机效果、渲染Markdown
- [x] 2.4 在 `Actions.tsx` 中集成 `AISummarizeModal`，传入文章ID触发总结
