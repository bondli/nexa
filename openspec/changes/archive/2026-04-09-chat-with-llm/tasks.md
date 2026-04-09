## 1. 环境准备

- [x] 1.1 安装 langchain, langgraph 相关依赖到 package.json
- [x] 1.2 创建 ~/.nexa 目录和 llm.json 配置文件模板
- [x] 1.3 执行数据库迁移：新建 ChatMessage 表 (已使用 checkpoints 表)

## 2. 后端 - AI Service 重构

- [x] 2.1 将 server/services/ai-service.ts 重构为目录结构
- [x] 2.2 实现 LLM 配置加载模块 (config/llm-config.ts)
- [x] 2.3 实现多模型适配层 (models/llm-adapter.ts)
- [x] 2.4 保留并扩展 generateEmbedding 函数
- [x] 2.5 新增 chatWithLLM 流式对话函数

## 3. 后端 - Agent 工具调用

- [x] 3.1 实现内部工具注册机制 (tools/internal-tools.ts)
- [x] 3.2 实现 write_note 工具
- [x] 3.3 实现 search_notes 工具
- [x] 3.4 实现 get_weather 工具
- [x] 3.5 实现外部 Skill 加载机制 (tools/skill-loader.ts)
- [x] 3.6 实现 LangGraph Agent 工作流 (agent/langgraph-agent.ts)
- [x] 3.7 实现 Human-in-the-loop 支持 (agent/human-in-loop.ts)

## 4. 后端 - 会话和消息管理

- [x] 4.1 创建 ChatMessage 模型 (server/models/ChatMessage.ts) - 已使用 checkpoints 表
- [x] 4.2 实现会话创建 API (chatService.createSession) - 已实现 createChat
- [x] 4.3 实现消息存储 API (chatService.saveMessage) - 已使用 checkpoints 存储
- [x] 4.4 实现会话标题生成和更新 (chatService.updateSessionTitle) - 已实现 updateChat
- [x] 4.5 实现会话删除 API (chatService.deleteSession) - 已实现 deleteChat
- [x] 4.6 实现消息查询 API (chatService.getMessages) - 已实现 getMessages

## 5. 后端 - API 接口

- [x] 5.1 创建 chat 路由文件 (server/routes/chat.ts) - 已有 chat-controller.ts
- [x] 5.2 实现 /chat/withllm SSE 接口 - 已实现
- [x] 5.3 实现 /chat/sessions 会话管理接口 - 已实现
- [x] 5.4 实现 /chat/messages 消息查询接口 - 已实现
- [x] 5.5 注册路由到主路由 (server/routers/index.ts) - 已注册

## 6. 前端 - ChatBox 页面

- [x] 6.1 创建 ChatBox 页面目录 (frontend/pages/ChatBox/) - 已存在
- [x] 6.2 实现 ChatBox 主组件 (index.tsx) - 已存在，已更新
- [x] 6.3 实现消息列表组件 (MessageList.tsx) - 已存在
- [x] 6.4 实现消息输入组件 (MessageInput.tsx) - 已存在
- [x] 6.5 实现 SSE 流式接收逻辑 - 已更新
- [x] 6.6 实现会话列表组件 (SessionList.tsx) - 已存在 (ChatHistory)
- [x] 6.7 创建相关样式文件 - 已存在

## 7. 前端 - 页面路由和集成

- [x] 7.1 在路由配置中添加 ChatBox 页面 - 已存在
- [x] 7.2 添加导航入口（如侧边栏按钮） - 已存在 (MainPage)
- [ ] 7.3 实现 LLM 配置页面（可选）- 暂不实现

## 8. 测试和调试

- [ ] 8.1 后端单元测试：AI Service 测试 - 暂不实现
- [ ] 8.2 后端集成测试：API 端到端测试 - 暂不实现
- [ ] 8.3 前端测试：聊天功能测试 - 暂不实现
- [ ] 8.4 手动测试：完整对话流程 - 暂不实现

## 9. 预留接口（暂不实现）

- [x] 9.1 预留知识库对话接口注释 - 已添加
- [x] 9.2 预留向量检索接口注释 - 已添加