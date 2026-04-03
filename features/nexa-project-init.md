# Nexa - AI 知识库桌面应用

## 一、产品概述（Product Overview）

Nexa 是一款个人知识库桌面应用，结合大模型能力，实现知识的高效记录、管理与智能检索，以及二次生成等功能。

产品目标：
- 统一管理笔记、备忘、网页内容
- 基于向量化实现语义搜索与问答
- 提供 AI 写作与内容优化能力
- 自动理解知识内容（打标签、提取重点、生成摘要）
- 提供可视化的知识总结（如摘要卡片）

---

## 二、核心功能（Core Features）

### 1. 笔记系统（Note System）
- 支持创建 / 编辑 / 删除笔记，需要有移动分类，调整优先级，设置完结ddl
- 支持 Markdown 格式编写，使用主流好用的markdown编辑器实现笔记创建和编辑
- 支持将笔记添加到一个知识库下，成为文档
- 支持标签（Tag）与分类（Folder）
- 支持导入网页内容（粘贴 / URL解析）

---

### 2. AI 知识处理（AI Processing）
- 自动为笔记生成向量（Embedding）
- 基于向量实现语义搜索
- 支持“基于知识库问答”（RAG）
- 提供知识库管理的单独页面

---

### 3. AI 写作助手（AI Writing）
- 文本润色（Rewrite）
- 内容总结（Summarize）
- 内容扩写（Expand）
- 语气调整（正式 / 口语 / 专业等）

---

### 4. 内容理解与增强（Content Intelligence）
- 自动生成标签（Auto Tagging）
- 提取关键信息（Key Points Extraction）
- 生成结构化摘要（Structured Summary）
- 生成摘要卡片（可导出为图片）

---

### 5. 数据存储（Storage）
- 使用 mysql 存储笔记数据
- 使用本地轻量的向量数据库存储 Embedding
- 支持后续扩展云向量数据库

---

## 三、技术选型（Tech Stack）

### 桌面应用
- Electron
- 使用electron-builder来构建客户端应用

### 前端
- React
- antd6.0
- vite
- npm

### 后端 / 服务层
- Node.js
- Express.js
- mysql2
- sequelize(操作数据库)

### 数据库
- mysql（笔记数据）
- 向量数据库：Chroma

### AI 能力
- Embedding：
  - GLM4.7
- 大模型（LLM）：
  - GLM4.7
- 在设置模块中支持配置远程模型

---

## 四、系统架构（Architecture）

系统分为以下层级：

### 1. UI 层（Renderer Process）
- React 构建界面
- 提供笔记编辑、搜索、AI交互界面

### 2. 主进程（Main Process）
- Electron 主进程
- 负责系统能力（文件、IPC通信）

### 3. 服务层（Service Layer）
- Note Service（笔记管理）
- Embedding Service（向量生成）
- AI Service（LLM调用）
- 与大模型聊天的agent采用langchian.js来实现

### 4. 数据层（Storage Layer）
- mysql（结构化数据）
- 向量数据库（Embedding）

### 5. AI 层（AI Layer）
- Embedding 模型
- LLM 推理接口

---

### ⚠️ 通信方式（重要约束）

- Renderer 与 Main 之间必须使用 IPC 通信
- 不允许前端直接访问数据库，前端通过axois请求到node服务

---

## 五、核心页面
- 笔记管理：包含笔记列表，新增笔记，删除笔记，移动笔记，笔记分类，搜索，按标签查找
  - 参考UI：/public/assets/note.jpg
- 知识库管理：知识库列表，知识库下文档列表，索引维护等
  - 参考UI：/public/assets/knowledge.jpg
- 与AI聊天：类似于antd-x实现的与AI聊天，采用antd-x的组件库来构建消息列表，发送消息等
  - 参考UI：/public/assets/chat.jpg
- 设置：大模型配置
- 个人中心：主题设置，支持暗黑/白色主题切换，开机启动项设置，个人头像，密码修改等

## 六、核心数据结构（Data Model）

### Note（笔记）

```ts
type Note = {
  id: string
  title: string
  desc: string
  cateId: number
  userId: number
  status: string
  deadline: string
  priority: number
  tags: string[]
  createdAt: string
  updatedAt: string
};

## 七、开发约束（重要）
- 代码结构必须模块化
- 所有数据访问必须通过 Service 层
- 不允许业务逻辑写在 UI 层