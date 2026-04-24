## Why

当前使用 langchain.js 实现的 agent 体系内部实现混乱，缺乏统一的架构设计。同时缺少工具调用、human-in-the-loop、持久化记忆、上下文压缩、RAG 集成、skill 能力和多 agent 协作等关键能力。需要使用 langchain 体系下的 DeepAgent 重新构建，提供更清晰的架构和完整的能力。

## What Changes

1. 使用 langchain 的 DeepAgent 重新实现 agent 体系
2. 添加工具调用能力，支持动态配置工具
3. 添加 human-in-the-loop 机制，当工具调用缺少参数时让用户补充
4. 复用已有的消息 mysql 表实现持久化记忆
5. 添加上下文压缩能力，当上下文过长时自动压缩
6. 集成已有向量知识库实现 RAG 能力
7. 添加 skill 系统，支持前端安装 skill 给 agent
8. 预留多 agent 协作架构

## Capabilities

### New Capabilities

- `langchain-agent`: 使用 langchain DeepAgent 重构 agent 核心体系
- `tool-calling`: 动态工具调用能力
- `human-in-loop`: 人类介入机制，工具缺参时等待用户补充
- `memory-persistence`: 持久化记忆能力
- `context-compression`: 上下文压缩能力
- `rag-integration`: RAG 集成能力
- `skill-system`: Skill 能力系统
- `multi-agent`: 多 agent 架构设计（预留）

### Modified Capabilities

- `chat-api`: 现有的 chat-controller 需要适配新的 agent 体系

## Impact

- 影响的代码：server/chat-controller.ts, server/services/ai-service.ts, server/models/
- 依赖：langchain.js, 已有的 mysql 消息表, 已部署的向量服务
- 新增目录：server/agents/, server/services/agent/, server/memory/