## 1. 基础设施搭建

- [x] 1.1 创建 agent 核心目录结构 (server/agents/, server/services/agent/, server/memory/)
- [x] 1.2 安装 langchain 依赖包 (@langchain/langgraph, @langchain/community)
- [x] 1.3 创建 Agent 基础类型定义 (server/services/agent/types.ts)
- [x] 1.4 配置 langchain 日志和错误处理

## 2. 工具调用系统

- [x] 2.1 实现工具注册表 ToolRegistry (server/services/agent/tools/registry.ts)
- [x] 2.2 实现内置工具：write_note, search_notes, get_weather
- [x] 2.3 创建 BaseTool 抽象类，统一工具定义格式
- [x] 2.4 实现工具到 LangChain Tool 的转换器

## 3. Skill 系统

- [x] 3.1 实现 SkillRegistry (server/services/agent/skills/registry.ts)
- [x] 3.2 定义 Skill 接口和 JSON Schema 参数格式
- [x] 3.3 实现 Skill 安装/卸载 API
- [x] 3.4 实现 Skill 到 Tool 的自动转换
- [x] 3.5 创建内置 Skill 集

## 4. Human-in-the-loop

- [x] 4.1 完善 HumanInTheLoopManager，集成 LangGraph 状态
- [x] 4.2 实现参数缺失检测逻辑
- [x] 4.3 实现任务超时机制
- [x] 4.4 添加前端 API 接口（查询待处理任务、补充参数、取消任务）

## 5. 记忆与持久化

- [x] 5.1 重构 Checkpoint 管理，使用 LangGraph CheckpointSaver
- [x] 5.2 实现消息历史加载和保存逻辑
- [x] 5.3 实现会话清理接口

## 6. 上下文压缩

- [x] 6.1 实现 ContextCompressor 服务
- [x] 6.2 集成 LangChain ConversationSummaryMemory
- [x] 6.3 添加配置项：maxRecentMessages, summaryMaxTokens
- [x] 6.4 实现异步压缩逻辑

## 7. RAG 集成

- [x] 7.1 创建 RetrievalService，封装向量检索逻辑
- [x] 7.2 实现知识库选择功能（支持单/多知识库）
- [x] 7.3 实现检索结果格式化
- [x] 7.4 将 RAG 能力集成到 Agent 对话流程

## 8. Agent 核心重构

- [x] 8.1 使用 LangGraph 重新实现 Agent 类
- [x] 8.2 实现工具调用图（ToolCallingGraph）
- [x] 8.3 集成 Checkpoint 持久化
- [x] 8.4 实现流式响应
- [x] 8.5 对接现有 chat-controller

## 9. 多 Agent 预留

- [x] 9.1 创建 AgentManager 类
- [x] 9.2 实现 Agent 注册和路由接口
- [x] 9.3 添加 Agent 监控日志
- [x] 9.4 预留扩展接口

## 10. 测试与集成

- [x] 10.1 单元测试：工具注册、Skill 系统、上下文压缩
- [x] 10.2 集成测试：完整对话流程
- [x] 10.3 前端功能验证：ChatBox 页面测试
- [x] 10.4 性能优化：响应时间、内存使用