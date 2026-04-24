## ADDED Requirements

### Requirement: 消息持久化
系统 SHALL 将对话消息持久化到 MySQL 数据库。

#### Scenario: 保存用户消息
- **WHEN** 用户发送消息
- **THEN** 消息自动保存到 ChatMessage 表

#### Scenario: 保存 AI 响应
- **WHEN** AI 完成响应
- **THEN** AI 响应消息保存到 ChatMessage 表

#### Scenario: 会话历史恢复
- **WHEN** 用户重新打开会话
- **THEN** 从数据库加载完整的历史消息

### Requirement: Checkpoint 持久化
系统 SHALL 使用 Checkpoint 机制持久化 Agent 状态。

#### Scenario: 创建 Checkpoint
- **WHEN** Agent 执行关键步骤
- **THEN** 自动创建 Checkpoint 保存状态

#### Scenario: 从 Checkpoint 恢复
- **WHEN** 会话恢复或 Agent 重启
- **THEN** 从最近的 Checkpoint 恢复状态

### Requirement: 会话清理
系统 SHALL 正确清理会话相关的数据。

#### Scenario: 删除会话
- **WHEN** 删除会话时
- **THEN** 删除该会话的所有消息和 Checkpoint

#### Scenario: 清理过期会话
- **WHEN** 超过保留期限的会话（可配置）
- **THEN** 自动清理旧会话数据，释放存储空间