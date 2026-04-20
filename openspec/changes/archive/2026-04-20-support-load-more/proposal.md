## Why

当前笔记、文章、图片页面一次性加载所有数据，当数据量大时会导致页面加载缓慢、内存占用过高的问题。用户需要分页加载功能来提升使用体验。

## What Changes

- 后端笔记接口增加 `limit` 和 `offset` 查询参数支持
- 前端笔记页面 (`NoteBook/Notes.tsx`) 实现触底加载更多
- 前端文章页面 (`Article/Articles.tsx`) 实现触底加载更多
- 前端图片页面 (`Picture/PictureList.tsx`) 实现触底加载更多
- 图片列表从自定义布局切换为 Antd Card 组件
- 清理图片页面多余的样式代码

## Capabilities

### New Capabilities

- `pagination-load-more`: 统一的分页加载机制，支持触底自动加载更多
- `antd-card-picture-list`: 使用 Antd Card 组件重构图片列表布局

### Modified Capabilities

- `note-management`: 笔记管理后端接口增加分页查询能力

## Impact

- **后端**: `server/controllers/note-controller.js` 需要修改，增加 limit/offset 参数
- **前端**:
  - `frontend/pages/NoteBook/Notes.tsx` - 添加分页加载逻辑
  - `frontend/pages/Article/Articles.tsx` - 添加分页加载逻辑
  - `frontend/pages/Picture/PictureList.tsx` - 添加分页加载并切换为 Antd Card
  - `frontend/pages/Picture/index.module.less` - 清理多余样式