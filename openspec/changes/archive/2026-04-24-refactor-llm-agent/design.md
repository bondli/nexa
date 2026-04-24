## Context

当前系统使用 langchain.js 实现的 agent 架构存在以下问题：

1. **架构混乱**：LangGraph Agent 实现较为简单，缺乏完整的状态管理和工具调用流程
2. **缺少 human-in-the-loop**：工具调用缺参时无法优雅地让用户补充
3. **上下文管理不足**：无上下文压缩机制，上下文过长时会影响 LLM 响应
4. **RAG 集成不完整**：虽有向量服务，但 agent 未集成 RAG 能力
5. **Skill 系统缺失**：无 skill 能力系统
6. **多 agent 预留不足**：架构上未考虑多 agent 协作

现有基础设施：
- LLM 配置：~/.nexa/config.json，支持 openai/qwen/glm/minimax
- 向量服务：已部署 Qdrant，知识库文档已向量化
- 消息持久化：使用 MySQL ChatMessage 表
- 前端：ChatBox 页面

## Goals / Non-Goals

**Goals:**
- 使用 langchain 体系重构 agent 核心，实现完整的工具调用流程
- 集成 human-in-the-loop 机制，工具缺参时等待用户补充
- 实现上下文压缩，保证 LLM 输入在合理范围内
- 集成 RAG 能力，利用向量知识库回答问题
- 构建 skill 系统，支持前端动态安装 skill
- 预留多 agent 协作架构

**Non-Goals:**
- 不实现具体的多 agent 协作逻辑（预留接口）
- 不更换已有的 LLM Provider（继续使用配置文件）
- 不修改现有的向量服务和数据库结构

## Decisions

### 1. Agent 架构选型

**选择**: LangGraph Agent (langchain/langgraph)

**原因**:
- 官方推荐的 agent 框架，文档完善
- 原生支持工具调用、状态管理、checkpoint
- 与 langchain 生态无缝集成
- 支持 Human-in-the-loop

**替代方案考虑**:
- LangChain Agent: 功能较弱，不支持复杂状态管理
- 自实现 Agent: 开发工作量大，不推荐

### 2. 状态持久化方案

**选择**: 复用现有 MySQL ChatMessage 表

**原因**:
- 已有表结构可用，减少迁移成本
- MySQL 可靠性和性能满足需求
- 避免引入额外依赖

### 3. 工具调用机制

**选择**: LangChain Tool + Human-in-the-loop

**原因**:
- 统一工具定义格式
- 原生支持参数校验和 human-in-the-loop
- 便于 skill 系统集成

### 4. 上下文压缩方案

**选择**: LangChain 的 `ConversationSummaryMemory` + 消息数量限制

**原因**:
- 官方提供的摘要方案，稳定可靠
- 结合消息数量限制，双重保障
- 实现相对简单

### 5. RAG 集成方案

**选择**: LangChain Retrieval Chain + 现有向量服务

**原因**:
- 复用现有 vector-store-service
- LangChain 提供统一的 Retrieval 接口
- 便于扩展多知识库

### 6. Skill 系统设计

**选择**: Skill 注册表模式

**原因**:
- 前端可动态注册 skill
- Skill 定义标准化（名称、描述、参数schema）
- 运行时加载，灵活可控

## Risks / Trade-offs

1. **[风险] LangGraph 版本兼容性**
   - LangGraph 版本更新可能导致 API 变化
   -  mitigation: 锁定版本，定期更新测试

2. **[风险] 上下文压缩可能丢失重要信息**
   - 摘要方式可能遗漏关键细节
   - mitigation: 保留最近 N 条完整消息 + 摘要

3. **[风险] Human-in-the-loop 可能阻塞会话**
   - 用户长时间不响应
   - mitigation: 添加超时机制，自动取消

4. **[权衡] 性能 vs 功能完整性**
   - 完整功能带来额外开销
   - mitigation: 提供配置开关，可选择性启用

## Migration Plan

1. **第一阶段：基础设施**
   - 创建 agent 核心模块目录结构
   - 实现工具注册表和 skill 系统
   - 集成现有向量服务 RAG

2. **第二阶段：核心功能**
   - 重构 LangGraph Agent
   - 实现 human-in-the-loop
   - 实现上下文压缩

3. **第三阶段：集成测试**
   - 与现有 chat-controller 对接
   - 前端功能测试
   - 性能优化

## Open Questions

1. 是否需要支持多知识库同时检索？
2. Skill 的参数校验规则如何定义？
3. 多 agent 协作的具体场景是什么？