## Why

构建一个个人知识库桌面应用，结合大模型能力实现知识的高效记录、管理与智能检索，解决传统笔记工具缺乏语义搜索和智能内容生成能力的问题。

## What Changes

- 初始化 Nexa AI 知识库桌面应用项目架构
- 建立前端（React + antd6）、后端（Node.js + Express）、Electron 客户端分层架构
- 实现笔记系统：创建/编辑/删除笔记，支持 Markdown、标签、分类、移动、优先级、截止日期
- 实现 AI 知识处理：自动生成 Embedding、语义搜索、基于知识库问答（RAG）
- 实现 AI 写作助手：文本润色、总结、扩写、语气调整
- 实现内容理解与增强：自动标签、关键信息提取、结构化摘要、摘要卡片
- 建立数据存储层：MySQL 存储笔记数据，Chroma 向量数据库存储 Embedding
- 集成 GLM4.7 大模型能力，支持配置远程模型

## Capabilities

### New Capabilities
- `note-system`: 笔记管理功能，包括笔记的增删改查、分类、标签、移动、优先级、截止日期
- `markdown-editor`: Markdown 编辑器，支持主流 Markdown 编辑功能
- `web-content-import`: 网页内容导入，支持粘贴和 URL 解析
- `ai-knowledge-processing`: AI 知识处理，包括自动生成 Embedding、语义搜索、RAG 问答
- `knowledge-base-management`: 知识库管理，知识库列表、文档列表、索引维护
- `ai-writing-assistant`: AI 写作助手，文本润色、总结、扩写、语气调整
- `content-intelligence`: 内容理解与增强，自动标签、关键信息提取、结构化摘要、摘要卡片
- `data-storage`: 数据存储层，MySQL 和向量数据库集成
- `ai-integration`: AI 能力集成，GLM4.7 Embedding 和 LLM 调用，支持远程模型配置
- `electron-client`: Electron 客户端架构，主进程和渲染进程通信
- `theme-system`: 主题系统，支持暗黑/白色主题切换
- `settings-management`: 设置管理，大模型配置、开机启动项设置
- `user-profile`: 个人中心，用户头像、密码修改

### Modified Capabilities
- (无现有能力需要修改)

## Impact

- 创建完整的项目目录结构
- 初始化前端（React + Vite + antd6）依赖
- 初始化后端（Node.js + Express + MySQL + Sequelize）依赖
- 初始化 Electron 客户端架构
- 集成 Chroma 向量数据库
- 集成 LangChain.js 用于 AI agent 实现
- 建立 IPC 通信机制
