## Context

当前项目笔记、文章、图片页面在数据量大时存在性能问题：
- 笔记页面一次性加载所有数据，无分页
- 文章页面已有后端分页支持，但前端未实现触底加载
- 图片页面已有后端分页支持，前端未实现触底加载，且使用非 Antd 组件

## Goals / Non-Goals

**Goals:**
- 后端笔记接口增加 limit/offset 分页参数
- 前端三个页面实现触底加载更多功能
- 图片列表使用 Antd Card 组件重构
- 清理图片页面多余样式

**Non-Goals:**
- 不修改现有 API 响应结构（保持向后兼容）
- 不添加上拉刷新功能（仅触底加载）
- 不修改笔记搜索功能

## Decisions

1. **分页参数命名**: 统一使用 `limit` 和 `offset`，与现有图片/文章接口风格保持一致
2. **前端分页实现**: 使用 Ant Design 的 `useInfiniteScroll` 或Intersection Observer API实现触底检测
3. **图片列表组件**: 切换为 Antd Card 组件，与项目整体风格统一

### 后端修改点

- `server/controllers/note-controller.ts` 的 `getNotes` 函数：
  - 接收 `limit` 和 `offset` 查询参数
  - 传递给 `findAndCountAll` 的查询选项

### 前端修改点

- `frontend/pages/NoteBook/Notes.tsx`:
  - 添加分页状态管理（limit, offset, hasMore）
  - 添加触底检测逻辑
  - 加载更多时累加 offset

- `frontend/pages/Article/Articles.tsx`:
  - 添加触底检测逻辑
  - 利用已有后端分页参数

- `frontend/pages/Picture/PictureList.tsx`:
  - 添加触底检测逻辑
  - 切换为 Antd Card 组件布局

## Risks / Trade-offs

- [风险] 笔记接口修改可能影响现有调用方 →  mitigation: limit/offset 设置合理默认值兼容旧调用
- [风险] 图片布局切换可能影响现有交互 → mitigation: 保持原有交互逻辑不变

## Open Questions

无