# Architecture Rules（架构规范）

本规范用于约束系统整体架构设计，Claude 在生成代码时必须严格遵守。

---

## 一、分层架构（必须遵守）

系统必须按照以下分层结构设计：

1. UI 层（React）--> frontend/pages or frontend/components
2. Service 层（业务逻辑）--> frontend/pages/xxx/context.tsx
3. Data 层（数据库访问） --> server/controller
4. AI 层（大模型调用）--> server/services/*.ts

---

## 二、分层职责（强制）

### 1. UI 层（frontend/components, frontend/pages）

职责：
- 负责界面展示
- 处理用户交互
- 调用 service 层

限制：
- 禁止写复杂业务逻辑
- 禁止直接访问数据库
- 禁止直接调用 AI API

---

### 2. Service 层（frontend/pages/xxx/context.tsx）

职责：
- 处理业务逻辑
- 组织数据流
- 调用 data 层和 AI 层

要求：
- 所有业务逻辑必须写在 service 层
- UI 只能调用 service

---

### 3. Data 层（server/controller）

职责：
- 数据库 CRUD 操作
- 不包含业务逻辑

---

### 4. AI 层（server/services/*.ts）

职责：
- 封装所有大模型调用
- 提供统一接口

示例接口：
- generateEmbedding
- chatWithContext
- summarize

---

## 三、Electron 架构约束（重要）

### 1. 进程划分

- Main Process：
  - 桌面应用原生生命周期，加载window，载入web页面
  - 勾起服务端进程，管理服务端服务
  - 客户端原生能力，存储，消息，托盘等
- Renderer Process：UI

---

### 2. 通信方式（强制）

- 必须使用 IPC（如 ipcRenderer / ipcMain）

---

## 四、依赖方向（必须遵守）

依赖只能单向：

UI → Service → Data / AI

禁止反向依赖：

- Service 不允许依赖 UI
- Data 不允许依赖 Service

---

## 五、模块化要求

- 每个模块职责单一
- 禁止出现“万能文件”（超过 300 行应拆分）

---

## 六、AI 使用约束

- 禁止在任何组件中直接调用 LLM

---

## 七、错误处理

- Service 层必须处理错误
- UI 层只负责展示错误

---

## 八、可扩展性要求

设计必须支持未来扩展：

- 向量数据库替换
- LLM provider 替换
- 本地模型接入

---

## 九、优先级

本规则优先级高于默认实现方式。

如有冲突，必须遵守本规范。