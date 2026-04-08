## Context

Nexa 是一款个人知识库桌面应用，当前已支持笔记存储和搜索功能。用户提出新增与 LLM 对话的能力，需求包括：
- 前端 ChatBox 页面，SSE 流式返回
- 后端 /chat/withllm 接口
- 配置文件 ~/.nexa/llm.json
- 支持 OpenAI, Qwen, ChatGLM, MiniMax 等多模型
- Agent 能力：工具调用、外部 Skill、多 Agent 协同、Human-in-the-loop
- 会话管理：创建会话、动态标题、级联删除
- 消息持久化（MySQL）

现有代码：
- server/services/ai-service.ts：已有 GLM 调用基础能力
- server/models/Chat.ts：已有 Chat 会话模型（sessionId, title, userId）
- 架构规则：UI → Service → Data/AI 分层

## Goals / Non-Goals

**Goals:**
1. 实现 LLM 对话功能，支持 SSE 流式返回
2. 支持多模型切换（OpenAI, Qwen, ChatGLM, MiniMax）
3. 实现 Agent 工具调用能力（内部工具 + 外部 Skill）
4. 支持多 Agent 协同工作
5. 实现 Human-in-the-loop 交互（参数缺失时等待用户输入）
6. 会话管理：创建会话、动态标题生成、级联删除
7. 消息持久化到 MySQL

**Non-Goals:**
1. 知识库 RAG 对话（预留接口，暂不实现）
2. 向量化存储和检索
3. 本地模型支持
4. 复杂的多轮对话记忆管理（暂用简单上下文）

## Decisions

### 1. 技术选型：langchain.js + langgraph.js

**选择理由：**
- langchain.js 提供成熟的 LLM 封装和工具调用能力
- langgraph.js 支持有状态的工作流和多 Agent 协同
- 社区活跃，文档完善

**替代方案考虑：**
- 纯手写 Agent：灵活性高，但工作量大，难以维护
- AutoGen：微软方案，主要针对 .NET/Java，JS 支持较弱

### 2. 配置文件结构 ~/.nexa/llm.json

```json
{
  "provider": "openai|qwen|glm|minimax",
  "apiKey": "xxx",
  "baseUrl": "https://api.xxx.com",
  "model": "gpt-4|qwen-turbo|glm-4|abab6.5s",
  "temperature": 0.7,
  "maxTokens": 2000
}
```

**选择理由：**
- 统一配置格式，支持多种模型
- 配置文件放用户目录，支持多实例配置

### 3. 工具调用架构

```
User Message → LangGraph Agent
               ├── Tool: write_note (内部)
               ├── Tool: search_notes (内部)
               ├── Tool: get_weather (内部)
               └── Skill: 自定义 Skill 加载
```

**选择理由：**
- 内部工具直接注册到 langgraph
- 外部 Skill 动态加载，支持扩展

### 4. 消息存储方案

**方案 A：扩展现有 Chat 表**
- 优点：简单，改动小
- 缺点：消息和会话混合，查询不便

**方案 B：新建 ChatMessage 表（采用）**
- 优点：职责分离，查询灵活，支持消息级操作
- 表结构：id, sessionId, role, content, tool_calls, created_at

### 5. SSE 实现方案

使用 Express 的 Response 对象直接写入流：
```typescript
res.write(`data: ${JSON.stringify({ content: 'xxx' })}\n\n`);
```

**选择理由：**
- 简单直接，无需额外依赖
- 与前端 EventSource 完美配合

## Risks / Trade-offs

### 1. [风险] langchain.js/langgraph.js 版本兼容性

**描述：** 新版本 API 变化可能导致代码需要适配
**缓解：** 锁定主要版本，具体版本号在实现时确定

### 2. [风险] 多模型适配工作量

**描述：** 不同模型的 API 格式、工具调用格式可能有差异
**缓解：** 抽象模型适配层，统一接口

### 3. [风险] SSE 连接断开处理

**描述：** 网络异常可能导致 SSE 连接中断
**缓解：** 前端心跳检测，后端超时释放

### 4. [风险] Human-in-the-loop 实现复杂度

**描述：** 需要在 Agent 流程中暂停并等待用户输入
**缓解：** 使用 langgraph 的 checkpoint 机制保存状态

## Migration Plan

### 步骤 1：环境准备
1. 安装依赖：langchain, langgraph, axios
2. 创建配置文件 ~/.nexa/llm.json
3. 执行数据库迁移（新建 ChatMessage 表）

### 步骤 2：后端实现
1. 重构 server/services/ai-service.ts 为目录
2. 实现模型适配层
3. 实现 LangGraph Agent 工作流
4. 实现 /chat/withllm SSE 接口
5. 实现会话管理和消息存储 API

### 步骤 3：前端实现
1. 创建 ChatBox 页面组件
2. 实现 SSE 流式接收
3. 实现会话列表组件
4. 实现工具调用结果展示

### 步骤 4：测试
1. 单元测试：AI Service 单元测试
2. 集成测试：API 端到端测试
3. UI 测试：聊天功能测试

## Open Questions

1. **Q: 是否需要支持流式输出到数据库？**
   - 当前方案：消息完成后一次性存储
   - 待定：是否需要实时存储部分内容

2. **Q: 外部 Skill 的加载机制？**
   - 当前方案：Skill 目录扫描 + 动态加载
   - 待定：是否需要 Skill 注册表

3. **Q: 会话标题生成时机？**
   - 当前方案：首条消息后生成
   - 待定：是否需要用户手动编辑标题