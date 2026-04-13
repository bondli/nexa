## Why

Nexa 作为个人知识库桌面应用，目前仅支持笔记（Note）管理。用户需要将网上看到的有价值文章也纳入知识库统一管理，提供与笔记类似的浏览、编辑、分类和搜索能力。

## What Changes

- 新增 Article 页面，功能和 UI 对齐 NoteBook 页面
- 左侧固定虚拟分类：全部文章、临时文章、回收站
- 临时文章列表仅展示 URL 和加入时间，点击 URL 跳转浏览器
- 普通文章展示与 Note 一致，URL 使用图标展示在标题后，点击跳转浏览器
- 文章支持：列表展示（分页、搜索、倒序）、详情（Markdown 渲染+编辑）、新增（Markdown 编辑器+保存）
- 相比 Note 操作：保留删除、移动分类，回收站支持恢复
- 新增服务端数据表：Article、ArticleCate、TempArticle
- 新增服务端接口：对齐 note 和 cate 接口规范

## Capabilities

### New Capabilities
- `article-management`: 文章管理功能，包括文章的增删改查、分类管理、临时文章管理
- `article-categorization`: 文章分类功能，对齐现有笔记分类体系
- `temp-article`: 临时文章功能，用于保存通过其他渠道（如浏览器插件）导入的文章

### Modified Capabilities
- 无

## Impact

- **前端影响**：
  - 新增 `frontend/pages/Article` 目录及组件
  - 在 context.tsx 中实现所有业务逻辑（API 调用）
  - 可能需要新增 Article 相关的 types 定义

- **后端影响**：
  - 新增 `server/models/article.ts` (Article, ArticleCate, TempArticle 模型)
  - 新增 `server/controllers/articleController.ts`
  - 新增 `server/routes/article.ts`
  - 新增对应 service 层

- **数据库影响**：
  - 新增 article 表
  - 新增 article_cate 表
  - 新增 temp_article 表