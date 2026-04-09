## ADDED Requirements

### Requirement: 用户可以通过 ChatBox 页面与 LLM 对话
用户能够在前端聊天界面发送消息，并通过 SSE 流式接收 AI 回复。

#### Scenario: 用户发送消息并接收流式回复
- **WHEN** 用户在 ChatBox 输入框中输入问题并点击发送
- **THEN** 系统通过 SSE 流式返回 AI 回复，前端逐字展示

#### Scenario: 用户切换聊天模型
- **WHEN** 用户在设置中选择不同模型（如从 OpenAI 切换到 Qwen）
- **THEN** 后续对话使用新模型的配置

### Requirement: 系统支持配置文件管理 LLM 连接信息
系统通过 ~/.nexa/llm.json 文件管理 LLM 的 API Key、Base URL、模型名等配置。

#### Scenario: 配置文件存在时加载配置
- **WHEN** 应用程序启动且 ~/.nexa/llm.json 存在
- **THEN** 系统读取并应用配置文件中的设置

#### Scenario: 配置文件不存在时使用默认配置
- **WHEN** 应用程序启动但配置文件不存在
- **THEN** 系统返回错误提示，引导用户配置

### Requirement: 系统支持多种 LLM 提供商
系统 SHALL 支持 OpenAI, Qwen, ChatGLM, MiniMax 等主流 LLM 提供商。

#### Scenario: 使用 OpenAI 模型
- **WHEN** 用户配置 provider 为 "openai"
- **THEN** 系统使用 OpenAI API 端点进行调用

#### Scenario: 使用 Qwen 模型
- **WHEN** 用户配置 provider 为 "qwen"
- **THEN** 系统使用阿里云 Qwen API 端点进行调用

### Requirement: 对话接口返回 SSE 流式响应
后端 /chat/withllm 接口 SHALL 使用 Server-Sent Events 返回流式数据。

#### Scenario: SSE 连接正常建立
- **WHEN** 前端发起 /chat/withllm 请求
- **THEN** 后端保持连接，分块返回 AI 生成的内容

#### Scenario: SSE 连接中断
- **WHEN** 网络异常导致 SSE 连接断开
- **THEN** 前端显示连接断开提示，可选择重连