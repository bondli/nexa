## ADDED Requirements

### Requirement: 创建新会话时生成临时会话标题
系统 SHALL 在用户发起新对话时创建会话记录，并生成临时会话标题。

#### Scenario: 用户发起新对话
- **WHEN** 用户在 ChatBox 点击新建对话
- **THEN** 系统创建会话记录，生成临时标题（如"新对话 1"）

#### Scenario: 会话创建时写入数据库
- **WHEN** 新会话创建
- **AND** 会话写入 chat 表
- **THEN** sessionId 和临时标题被持久化

### Requirement: AI 回复后自动总结会话主题
当 AI 返回消息后，系统 SHALL 分析对话内容并更新会话标题。

#### Scenario: AI 首轮回复后生成正式标题
- **WHEN** AI 首次返回有效回复
- **THEN** 系统调用 LLM 生成会话主题标题
- **AND** 更新 chat 表中的 title 字段

#### Scenario: 标题更新后刷新会话列表
- **WHEN** 会话标题更新
- **THEN** 前端会话列表中该会话的标题同步更新

### Requirement: 删除会话时级联删除所有消息
系统 SHALL 在删除会话时同时删除该会话下的所有消息记录。

#### Scenario: 用户删除会话
- **WHEN** 用户点击删除会话按钮
- **AND** 确认删除操作
- **THEN** 系统删除 chat_sessions 表中对应会话记录
- **AND** 删除 chat_messages 表中所有关联消息

#### Scenario: 删除不存在的会话
- **WHEN** 用户尝试删除不存在的会话
- **THEN** 系统返回错误提示