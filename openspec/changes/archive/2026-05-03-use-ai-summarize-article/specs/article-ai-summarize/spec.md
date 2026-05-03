## ADDED Requirements

### Requirement: 文章AI总结接口
系统 SHALL 提供文章AI总结功能，通过SSE流式返回总结结果。

#### Scenario: 总结正常文章
- **WHEN** 用户点击"AI总结"按钮
- **THEN** 系统调用LLM对文章内容进行总结，并通过SSE流式返回Markdown格式的总结结果

#### Scenario: 文章内容为空
- **WHEN** 被总结的文章内容为空
- **THEN** 系统返回错误事件，前端显示"文章内容为空，无法总结"

#### Scenario: LLM服务异常
- **WHEN** LLM服务调用失败
- **THEN** 系统返回错误事件，前端显示"总结失败，请稍后重试"

### Requirement: 前端AI总结Modal
系统 SHALL 在文章操作菜单中显示"AI总结"选项，并提供Modal展示总结结果。

#### Scenario: 显示加载状态
- **WHEN** 用户点击"AI总结"
- **THEN** 弹出Modal，显示"AI正在总结中..."的加载状态

#### Scenario: 流式展示结果
- **WHEN** 收到SSE流式数据
- **THEN** 实时以打字机效果展示Markdown格式的总结结果

#### Scenario: 总结完成
- **WHEN** SSE流结束（data: [DONE]）
- **THEN** Modal标题变更为"AI总结结果"，显示完整总结内容
