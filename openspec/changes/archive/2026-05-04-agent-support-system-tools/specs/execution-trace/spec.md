## ADDED Requirements

### Requirement: 执行过程事件类型
系统 SHALL 在 Agent 执行过程中返回多种事件类型，供前端展示执行细节。

#### Scenario: 思考中事件
- **WHEN** Agent 正在分析用户请求时
- **THEN** 发送 `thinking` 类型事件，前端显示「正在思考...」

#### Scenario: 工具调用事件
- **WHEN** Agent 决定调用某个工具时
- **THEN** 发送 `tool_call` 类型事件，包含工具名称和参数

#### Scenario: 工具开始执行事件
- **WHEN** 工具开始执行时
- **THEN** 发送 `tool_start` 类型事件，前端显示「正在执行 [工具名]...」

#### Scenario: 工具执行结果事件
- **WHEN** 工具执行完成时
- **THEN** 发送 `tool_result` 类型事件，包含执行结果（成功/失败/返回数据）

#### Scenario: Agent 推理事件
- **WHEN** Agent 进行中间推理时
- **THEN** 发送 `reasoning` 类型事件，显示 Agent 的思考过程

#### Scenario: 最终回答事件
- **WHEN** Agent 完成所有推理和工具调用后
- **THEN** 发送 `final` 类型事件，包含最终回答内容

### Requirement: SSE 流式返回
系统 SHALL 通过 SSE 实时返回执行过程事件。

#### Scenario: 多事件顺序返回
- **WHEN** Agent 执行一个包含多次工具调用的任务
- **THEN** 按时间顺序流式返回各类型事件，前端实时展示

#### Scenario: 事件数据结构
- **WHEN** 返回任何事件时
- **THEN** 事件包含 `type`（事件类型）和 `data`（事件数据）两个字段

### Requirement: 前端执行过程展示
系统 SHALL 提供前端组件展示 Agent 执行过程。

#### Scenario: 工具调用卡片
- **WHEN** 收到 `tool_call` 事件
- **THEN** 前端展示工具调用卡片，显示工具图标、名称、参数

#### Scenario: 结果展示面板
- **WHEN** 收到 `tool_result` 事件
- **THEN** 前端在对应工具卡片下方展开显示执行结果

#### Scenario: 推理步骤展示
- **WHEN** 收到 `reasoning` 事件
- **THEN** 前端以缩进形式展示 Agent 的推理思考过程
