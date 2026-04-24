## ADDED Requirements

### Requirement: LangGraph Agent 初始化
系统 SHALL 使用 LangGraph 框架创建 Agent 实例，支持流式对话和工具调用。

#### Scenario: 创建 Agent 实例
- **WHEN** 调用 `createAgent()` 函数
- **THEN** 返回配置好的 LangGraph Agent 实例，可用于对话

#### Scenario: 加载 LLM 配置
- **WHEN** Agent 初始化时
- **THEN** 自动从 ~/.nexa/config.json 加载 LLM 配置（provider, apiKey, baseUrl, model）

### Requirement: 流式对话
系统 SHALL 支持 SSE 流式返回 AI 响应内容。

#### Scenario: 用户发送消息
- **WHEN** 用户发送消息并请求流式响应
- **THEN** AI 响应内容通过 SSE 逐步返回，客户端实时展示

#### Scenario: 对话结束
- **WHEN** AI 完成响应
- **THEN** 发送 `done: true` 信号，标识对话结束

### Requirement: 简单对话模式
系统 SHALL 提供不使用工具的简单对话模式。

#### Scenario: 禁用工具的对话
- **WHEN** 请求时设置 `useTools: false`
- **THEN** Agent 不加载工具，仅进行纯对话

### Requirement: 工具调用
系统 SHALL 在 Agent 中集成工具调用能力，支持自定义工具。

#### Scenario: Agent 识别需要调用工具
- **WHEN** AI 响应中包含工具调用请求
- **THEN** 系统解析工具名称和参数，执行工具并返回结果

#### Scenario: 工具执行失败
- **WHEN** 工具执行时发生错误
- **THEN** 返回错误信息给 AI，AI 尝试生成友好的错误响应