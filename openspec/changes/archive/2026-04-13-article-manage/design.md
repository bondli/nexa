## Context

Nexa 当前仅支持笔记（Note）管理，用户无法将网上看到的有价值文章纳入知识库统一管理。用户需要一个与 NoteBook 功能对标的 Article 页面，用于管理文章、URL 链接，并支持通过浏览器插件等其他渠道导入临时文章。

### 当前状态
- 已有完整的 NoteBook 页面实现（Category、Notes、Detail、Header、SearchBox）
- 已有 Note、Cate 模型和对应 API
- 临时文章来自浏览器插件等外部渠道

### 约束
- 功能和 UI 对齐现有 NoteBook 页面
- 必须包含 url 字段
- 临时文章仅需简单存储（url、userId、createdAt）
- 临时文章列表与普通文章列表展示逻辑不同

## Goals / Non-Goals

**Goals:**
- 新增 Article 页面，功能对标 NoteBook
- 支持文章的分页、搜索、分类管理
- 支持 Markdown 编辑器和渲染
- 支持通过 URL 跳转浏览器
- 支持临时文章（TempArticle）管理
- 新增 Article、ArticleCate、TempArticle 数据表
- 新增对应的后端 API 接口

**Non-Goals:**
- 不实现笔记的优先级、截止时间等功能
- 不实现文章标签功能
- 临时文章不支持编辑，仅支持查看和删除
- 不实现文章回收站的自动清理

## Decisions

### 1. 数据模型设计
**决定：** Article 模型字段对齐 Note 模型，增加 url 字段

**理由：** 需求明确要求 Article 必须有 url 字段，对齐 Note 可保持代码一致性

### 2. 页面结构设计
**决定：** 完全复用 NoteBook 的组件结构（Category、Notes、Detail、Header）

**理由：** 需求明确要求"功能和 UI 对齐 Note 页面"，直接复用可减少重复代码

### 3. 前端服务层设计
**决定：** 所有 API 调用在 context.tsx 中实现，不单独创建 service 文件

**理由：** 对齐 NoteBook 的实现方式，所有业务逻辑集中在 context 中管理

### 3. 虚拟分类实现
**决定：** 使用固定分类 ID 或特殊标识来区分"全部文章"、"临时文章"、"回收站"

**理由：** 这些是系统级虚拟分类，不存储在数据库中，通过前端逻辑区分处理

### 4. 临时文章存储
**决定：** 使用独立的 TempArticle 表，仅存储 url、userId、createdAt

**理由：** 需求明确要求，且临时文章不需要复杂属性，独立表可简化查询

### 5. API 路径设计
**决定：** 使用 /article/* 和 /article_cate/* 路径

**理由：** 需求明确要求对齐 note 和 cate 接口规范

## Risks / Trade-offs

### Risk: 组件复用 vs 定制化
**描述：** 过度复用 NoteBook 组件可能导致 Article 特定逻辑（如 URL 点击跳转）难以实现

** Mitigation：** 在 Notes 组件中通过 type 区分处理 Article 特有逻辑

### Risk: 虚拟分类状态管理
**描述：** 全部文章、临时文章、回收站是前端虚拟分类，后端需配合返回不同数据

** Mitigation：** 前端根据选中分类发送不同请求，后端统一通过 cateId 或特殊标识区分

### Risk: Markdown 编辑器一致性
**描述：** 需要确保 Article 的 Markdown 编辑器与 NoteBook 一致

** Mitigation：** 直接复用 NoteBook 的 MarkdownEditor 组件