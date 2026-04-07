## 1. 前端 - Context 状态管理

- [x] 1.1 重构 context.tsx 为 KnowledgeContext，使用 Knowledge API (/knowledge)
- [x] 1.2 实现获取知识库列表方法
- [x] 1.3 实现获取知识库文档列表方法（使用 Docs API /docs/getList?knowledgeId=x）
- [x] 1.4 实现首次进入自动加载第一个知识库文档
- [x] 1.5 实现创建知识库方法 (POST /knowledge/create)
- [x] 1.6 实现删除知识库方法 (POST /knowledge/delete)

## 2. 前端 - 左侧知识库列表 (KnowBase.tsx)

- [x] 2.1 实现知识库列表展示（使用 antd Card 组件）
- [x] 2.2 点击知识库切换选中状态
- [x] 2.3 显示知识库名称、描述、文档数量
- [x] 2.4 添加知识库删除操作按钮

## 3. 前端 - 右侧文档列表 (Documents.tsx)

- [x] 3.1 实现文档列表展示（Table 组件）
- [x] 3.2 添加文档下载按钮（点击触发下载，而非"查看"）
- [x] 3.3 添加文档删除按钮
- [x] 3.4 添加上传文档功能（使用 antd Upload，上传时传递当前 knowledgeId）
- [x] 3.5 空状态处理（无知识库、无文档时）

## 4. 前端 - 文档预览 (Detail.tsx)

- [x] 4.1 实现 Markdown 文档预览
- [x] 4.2 集成 Markdown 编辑器（预览模式）

## 5. 前端 - 头部工具栏 (Header.tsx)

- [x] 5.1 实现新建知识库按钮
- [x] 5.2 实现文档上传入口