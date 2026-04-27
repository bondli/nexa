## Why

用户需要将已收藏的文章添加到本地知识库中，以便利用 RAG 检索能力进行语义搜索和 AI 问答。当前文章管理界面缺少直接将文章转入知识库的功能，用户只能通过知识库界面手动创建文档。

## What Changes

- 在文章列表页的操作菜单中新增「添加到知识库」选项
- 点击后弹出对话框，显示当前知识库列表供用户选择
- 选择知识库后，调用后端 `/knowledge/addToKnowledge` API 将文章内容向量化并存入知识库
- 添加成功后显示提示信息

## Capabilities

### New Capabilities

- `article-add-to-knowledge`: 支持从文章列表页直接将文章添加到指定知识库，实现文章内容的向量化存储

### Modified Capabilities

<!-- 暂无需求变更，知识库 RAG 检索能力保持不变 -->

## Impact

- **前端**：`frontend/pages/Article/Actions.tsx` - 新增菜单项和知识库选择弹窗
- **前端**：`frontend/pages/Knowledge/context.tsx` - 可能需要新增添加到知识库的 service 方法
- **后端**：API 已存在 (`/knowledge/addToKnowledge`)，无需修改
- **向量存储**：Qdrant 中新增文档向量
