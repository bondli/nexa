## ADDED Requirements

### Requirement: Skill 执行
已安装且启用的 Skill SHALL 能被 Agent 在聊天过程中调用。

#### Scenario: Agent 识别 Skill 调用
- **WHEN** Agent 在对话中决定调用某个 Skill
- **THEN** 系统查找 SkillRegistry 中对应的 Skill 并执行其 handler

#### Scenario: Skill 执行结果返回
- **WHEN** Skill 执行完成
- **THEN** 执行结果通过 SSE 事件返回给前端展示

### Requirement: Skill 参数传递
系统 SHALL 支持 Skill 的参数校验和传递。

#### Scenario: Skill 参数校验
- **WHEN** Skill 被调用时
- **THEN** 根据 skill.parameters (JSON Schema) 校验参数，参数缺失时返回错误

#### Scenario: Skill 参数传递
- **WHEN** Agent 决定调用 Skill 并提供参数
- **THEN** 系统将参数传递给 Skill 的 handler 函数

### Requirement: Skill 错误处理
Skill 执行失败时 SHALL 返回友好的错误信息。

#### Scenario: Skill 执行异常
- **WHEN** Skill handler 执行时抛出异常
- **THEN** 返回错误信息给 Agent，Agent 尝试生成友好的错误响应

#### Scenario: Skill 不存在
- **WHEN** Agent 调用一个不存在的 Skill
- **THEN** 返回"Unknown skill"错误
