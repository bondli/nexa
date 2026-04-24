## ADDED Requirements

### Requirement: 上下文长度限制
系统 SHALL 限制单个请求的上下文长度，防止超过 LLM 限制。

#### Scenario: 检测上下文过长
- **WHEN** 消息数量超过配置阈值（默认 20 条）
- **THEN** 触发上下文压缩流程

### Requirement: 上下文压缩
系统 SHALL 使用摘要方式压缩过长的上下文。

#### Scenario: 执行上下文压缩
- **WHEN** 触发上下文压缩
- **THEN** 将早期消息压缩为摘要，保留最近 N 条完整消息

#### Scenario: 压缩后继续对话
- **WHEN** 上下文压缩完成
- **THEN** 使用压缩后的消息继续对话，AI 能理解对话历史

### Requirement: 压缩配置
系统 SHALL 提供可配置的压缩策略。

#### Scenario: 配置消息保留数量
- **WHEN** 设置 `maxRecentMessages` 配置
- **THEN** 压缩后保留指定数量的完整消息

#### Scenario: 配置摘要长度
- **WHEN** 设置 `summaryMaxTokens` 配置
- **THEN** 生成的摘要不超过指定 token 数量

### Requirement: 性能优化
上下文压缩 SHALL 在后台异步执行，不阻塞当前请求。

#### Scenario: 异步压缩
- **WHEN** 需要压缩上下文
- **THEN** 压缩操作异步执行，当前请求立即返回