## Context

当前项目处于初始阶段，需要从零开始构建一个基于 Electron 的 AI 知识库桌面应用。项目需要：

1. 分层架构设计：前端（React）、后端（Node.js）、Electron 客户端
2. 数据存储：MySQL（结构化数据）+ Chroma（向量数据库）
3. AI 集成：GLM4.7 模型用于 Embedding 和 LLM 推理
4. 遵循严格的代码规范和架构规则

## Goals / Non-Goals

**Goals:**
- 建立清晰的四层架构：UI 层、Service 层、Data 层、AI 层
- 实现 Electron 主进程与渲染进程的 IPC 通信
- 建立统一的数据访问和 AI 调用接口
- 支持主题切换和设置管理
- 实现笔记的完整生命周期管理
- 提供基于向量的语义搜索和 RAG 问答能力

**Non-Goals:**
- 云端数据同步（本阶段仅支持本地存储）
- 多用户协作
- 复杂的权限管理
- 移动端适配

## Decisions

### 前端技术栈

**选择：React + TypeScript + antd6 + Vite**

**原因：**
- React 生态成熟，组件化开发高效
- TypeScript 提供类型安全
- antd6 组件库完整，文档丰富
- Vite 构热更新快，开发体验好

**替代方案考虑：**
- Vue 3：团队更熟悉 React，且 antd 生态更适合
- Next.js：桌面应用不需要 SSR，Vite 更轻量

### 后端技术栈

**选择：Node.js + Express + Sequelize**

**原因：**
- Node.js 与前端共享语言，开发效率高
- Express 轻量灵活，适合桌面应用后端
- Sequelize 提供 ORM，简化 MySQL 操作

**替代方案考虑：**
- NestJS：对于简单的桌面应用后端过于复杂
- Prisma：团队对 Sequelize 更熟悉

### 向量数据库

**选择：Chroma**

**原因：**
- 轻量级，适合本地部署
- 支持向量存储和相似度搜索
- 与 LangChain 集成良好

**替代方案考虑：**
- Pinecone：云服务，本阶段需要本地存储
- Qdrant：相对较重，Chroma 更轻量

### Markdown 编辑器

**选择：react-markdown-editor-lite 或 toast-ui/editor**

**原因：**
- 支持丰富的 Markdown 编辑功能
- 与 React 集成良好
- 性能较好

**替代方案考虑：**
- Monaco Editor：过于复杂，功能冗余
- simplemde：功能较弱

### 通信机制

**选择：IPC（Inter-Process Communication）**

**原因：**
- Electron 官方推荐的进程间通信方式
- 安全可靠，性能良好
- 支持双向通信

**限制：**
- 前端不允许直接访问数据库
- 必须通过 Service 层调用后端接口

### AI 集成

**选择：LangChain.js + 直接 HTTP 调用**

**原因：**
- LangChain 提供 agent 和 chain 抽象
- 对于简单调用，直接 HTTP 更灵活
- 便于后续切换模型 provider

**替代方案：**
- OpenAI SDK：仅适用于 OpenAI 模型
- 模型厂商 SDK：切换成本高

## Risks / Trade-offs

### 数据迁移风险

**风险：** 向量数据库结构变更导致数据不可用

**缓解：**
- 使用明确的 schema 版本控制
- 提供数据迁移工具
- 保持向后兼容性

### AI 模型切换成本

**风险：** GLM4.7 更新或切换到其他模型导致适配工作量大

**缓解：**
- 统一封装 AI Service 层
- 使用标准化的接口设计
- 支持多 provider 配置

### IPC 性能瓶颈

**风险：** 频繁的 IPC 通信可能影响性能

**缓解：**
- 批量处理数据传输
- 使用缓存减少通信次数
- 优化数据序列化

### Electron 打包体积

**风险：** Electron 应用体积较大

**缓解：**
- 使用 asar 打包
- 按需加载依赖
- 优化静态资源

## Migration Plan

### 开发阶段

1. 初始化项目结构和依赖
2. 实现核心数据模型和服务层
3. 实现基础 UI 组件和页面
4. 集成 AI 能力
5. 完善功能和优化性能

### 部署阶段

1. 构建前端代码
2. 打包 Electron 应用
3. 生成安装包（dmg / exe）
4. 测试安装和运行

### 回滚策略

- 使用 git 管理代码版本
- 保留历史版本的安装包
- 提供数据库备份和恢复功能

## Open Questions

1. Chroma 向量数据库的最佳存储位置（应用目录或系统目录）？
2. AI 模型的调用频率限制和缓存策略？
3. 大型笔记的分片处理方案？
4. 主题系统的实现方式（CSS 变量或 antd 主题）？
