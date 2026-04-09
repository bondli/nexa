## ADDED Requirements

### Requirement: AI 优化 OCR 识别结果
服务端 SHALL 调用 AI 对 OCR 识别结果进行优化，包括修正错别字、整理格式、优化表达。

#### Scenario: AI 优化成功
- **WHEN** AI 成功优化文本
- **THEN** 返回优化后的文本，以 Markdown 格式展示

#### Scenario: AI 优化失败
- **WHEN** AI 服务调用失败
- **THEN** 回退到原始 OCR 结果，显示提示"AI 优化失败，显示原始识别结果"

#### Scenario: OCR 结果为空
- **WHEN** OCR 未识别到任何文字
- **THEN** 返回提示"未识别到文字，请手动输入"

### Requirement: 文本编辑
用户 SHALL 能够在保存前手动编辑 AI 优化后的文本。

#### Scenario: 用户编辑文本
- **WHEN** 用户在文本框中修改内容
- **THEN** 文本框内容更新为用户修改后的值

#### Scenario: 用户清空文本
- **WHEN** 用户清空文本框内容
- **THEN** "存到知识库"按钮变为禁用状态