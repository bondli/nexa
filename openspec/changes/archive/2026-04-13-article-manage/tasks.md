## 1. 后端数据模型

- [x] 1.1 创建 Article 模型（server/models/Article.ts），字段对齐 Note，增加 url 字段
- [x] 1.2 创建 ArticleCate 分类模型（server/models/ArticleCate.ts），字段对齐 Cate
- [x] 1.3 创建 TempArticle 临时文章模型（server/models/TempArticle.ts），仅包含 url、userId、createdAt
- [x] 1.4 在 server/models/index.ts 中注册新模型（该项目无 models/index.ts，直接在 controller 引入）

## 2. 后端控制器

- [x] 2.1 创建 articleController.ts，实现 /article/list 接口（分页、搜索、分类筛选、时间倒序）
- [x] 2.2 实现 /article/detail 接口（根据 ID 获取文章详情）
- [x] 2.3 实现 /article/create 接口（创建新文章）
- [x] 2.4 实现 /article/update 接口（更新文章，支持编辑和移动分类）
- [x] 2.5 实现 /article/delete 接口（软删除到回收站）
- [x] 2.6 实现 /article_cate/list 接口（获取分类列表）
- [x] 2.7 实现 /article_cate/create 接口（创建分类）
- [x] 2.8 实现 /article_cate/update 接口（更新分类）
- [x] 2.9 实现 /article_cate/delete 接口（删除分类）
- [x] 2.10 实现 /temp_article/list 接口（临时文章列表，仅 url 和时间）
- [x] 2.11 实现 /temp_article/delete 接口（物理删除临时文章）

## 3. 后端路由

- [x] 3.1 创建 server/routes/article.ts 路由文件（直接合并到 routers/index.ts）
- [x] 3.2 在 server/routes/index.ts 中注册新路由

## 4. 前端类型定义

- [x] 4.1 在 frontend/types 目录下创建 article.ts 类型定义文件（在 NoteBook 中参考，类型定义在 constant.ts）
- [x] 4.2 定义 Article、ArticleCate、TempArticle 相关类型

## 5. 前端 Context 实现

- [x] 5.1 在 context.tsx 中实现 getArticleList（分页、搜索、分类）
- [x] 5.2 在 context.tsx 中实现 getArticleDetail
- [x] 5.3 在 context.tsx 中实现 createArticle
- [x] 5.4 在 context.tsx 中实现 updateArticle
- [x] 5.5 在 context.tsx 中实现 deleteArticle（软删除）
- [x] 5.6 在 context.tsx 中实现 recoverArticle（从回收站恢复）
- [x] 5.7 在 context.tsx 中实现 getArticleCateList
- [x] 5.8 在 context.tsx 中实现 createArticleCate
- [x] 5.9 在 context.tsx 中实现 updateArticleCate
- [x] 5.10 在 context.tsx 中实现 deleteArticleCate
- [x] 5.11 在 context.tsx 中实现 getTempArticleList
- [x] 5.12 在 context.tsx 中实现 deleteTempArticle
- [x] 5.13 导出各方法供组件调用

## 6. 前端页面组件

- [x] 6.1 创建 frontend/pages/Article/index.tsx 主页面组件
- [x] 6.2 创建 Article/index.module.less 样式文件
- [x] 6.3 创建 frontend/pages/Article/context.tsx 状态管理
- [x] 6.4 创建 frontend/pages/Article/Category.tsx 分类侧边栏（包含虚拟分类）
- [x] 6.5 创建 frontend/pages/Article/Header.tsx 顶部操作栏
- [x] 6.6 创建 frontend/pages/Article/Notes.tsx 文章列表（支持临时文章/普通文章区分）
- [x] 6.7 创建 frontend/pages/Article/Detail.tsx 详情抽屉（Markdown 渲染+编辑）
- [x] 6.8 创建 frontend/pages/Article/SearchBox.tsx 搜索框
- [x] 6.9 创建 frontend/pages/Article/Actions.tsx 操作菜单（删除、移动分类、恢复）

## 7. 路由配置

- [x] 7.1 在前端路由配置中添加 Article 页面路由