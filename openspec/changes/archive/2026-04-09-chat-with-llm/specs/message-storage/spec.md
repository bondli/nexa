## ADDED Requirements

### Requirement: 消息持久化到数据库
用户与 AI 的对话消息 SHALL 被持久化存储到 MySQL 数据库。

#### Scenario: 用户消息被保存
- **WHEN** 用户发送消息
- **THEN** 消息被保存到 chat_messages 表，包含 role 为 'user'

#### Scenario: AI 消息被保存
- **WHEN** AI 返回完整回复
- **THEN** 消息被保存到 chat_messages 表，包含 role 为 'assistant'

#### Scenario: 工具调用记录被保存
- **WHEN** Agent 调用工具
- **AND** 工具返回结果
- **THEN** 工具调用记录被保存到 chat_messages 表

### Requirement: 消息表支持分页查询
系统 SHALL 支持按会话分页查询消息历史。

#### Scenario: 查询会话消息列表
- **WHEN** 前端请求获取会话消息
- **THEN** 系统返回该会话的消息列表，按时间正序排列

#### Scenario: 分页加载历史消息
- **WHEN** 用户滚动到顶部请求更多历史消息
- **THEN** 系统分页返回历史消息

### Requirement: 消息存储模拟 checkpoint 机制
系统 SHALL 使用 MySQL 模拟 langchain.js/langgraph.js 的 checkpoint 机制。

#### Scenario: 保存 Agent 执行状态
- **WHEN** Agent 执行工具调用
- **AND** 需要暂停等待用户输入
- **THEN** 当前状态被保存到数据库

#### Scenario: 恢复 Agent 执行状态
- **WHEN** 用户提供缺失参数后继续对话
- **THEN** 系统从数据库恢复之前的状态继续执行