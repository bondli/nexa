## Context

Nexa 是一个 AI 知识库桌面应用，目前已有笔记本（Notes）功能模块。用户需要一个类似的结构来管理知识性文档。

当前知识库目录已创建部分文件：
- index.tsx：主入口，已有基础代码（Drawer + Layout）
- context.tsx：Context 状态管理（使用 NoteContext）
- KnowBase.tsx, Documents.tsx, Detail.tsx, Header.tsx：空文件待实现

后端已有完整 API：
- Knowledge: /knowledge/* (CRUD)
- Docs: /docs/* (CRUD + 上传 + 下载)

## Goals / Non-Goals

**Goals:**
- 实现知识库列表展示（antd Card，左侧边栏）
- 实现知识库文档列表（右侧区域）
- 实现文档上传、下载、删除功能
- 实现文档 Markdown 预览
- 首次进入自动加载第一个知识库文档

**Non-Goals:**
- 不实现虚拟分类功能（与笔记本的差异点）
- 后端 API 已有，无需开发

## Decisions

1. **前端页面结构**: 参考笔记本目录结构，左侧知识库列表 + 右侧文档列表
2. **UI 组件**: 知识库列表使用 antd Card，文档列表使用 Table
3. **文档上传**: 使用 antd Upload + 后端 /docs/upload 接口
4. **文档预览**: 使用 Markdown 编辑器（预览模式）
5. **下载功能**: 使用 fetch + Blob 方式下载文件

## Risks / Trade-offs

- [Risk] context.tsx 需要从 NoteContext 重构为 KnowledgeContext
- [Risk] 需要正确关联 knowledgeId 与 docs 列表查询