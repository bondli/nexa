## Why

Nexa 作为个人知识库桌面应用，当前仅支持笔记的存储和搜索。用户希望能够直接与 AI 大模型进行对话，获取智能助手能力，如写笔记、查天气等工具调用，以及支持多 Agent 协同工作。这将大幅提升应用的智能化和可用性。

## What Changes

1. 新增 LLM 对话功能模块
   - 前端页面：ChatBox 聊天界面
   - 后端接口：/chat/withllm (SSE 流式返回)
   - 配置文件：~/.nexa/llm.json (API Key, Base URL, Model Name)
2. 支持多种大语言模型：OpenAI, Qwen, ChatGLM, MiniMax 等
3. 实现 Agent 能力：
   - 内部工具调用（写笔记、查天气等）
   - 外部 Skill 安装和调用
   - 多 Agent 协同工作
   - Human-in-the-loop 交互
4. 会话管理：
   - 创建会话时写入 chat 表，生成临时会话标题
   - AI 返回消息后总结会话主题，刷新左侧会话列表
   - 删除会话时级联删除所有消息
5. 消息存储：使用 MySQL 模拟 langchain.js/langgraph.js 的 checkpoint 机制
6. 预留知识库对话接口（暂不实现向量化和 RAG）

## Capabilities

### New Capabilities

- `llm-chat`: LLM 对话核心功能，支持流式 SSE 返回、多模型切换、工具调用
- `agent-tool-calling`: Agent 工具调用能力，支持内部工具、外部 Skill、多 Agent 协同
- `session-management`: 会话管理能力，包括创建会话、标题生成、级联删除
- `message-storage`: 消息存储能力，持久化会话消息

### Modified Capabilities

- (无) 现有功能不涉及需求变更

## Impact

- **前端**: 新增 pages/ChatBox 目录及组件
- **后端**: 新增 server/routes/chat.ts, server/services/ai-service 目录
- **数据库**: 新增 chat_sessions, chat_messages 表
- **依赖**: 引入 langchain.js, langgraph.js
- **配置**: 支持 ~/.nexa/llm.json 配置文件