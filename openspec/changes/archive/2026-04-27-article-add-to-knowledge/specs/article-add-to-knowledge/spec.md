## ADDED Requirements

### Requirement: 文章添加到知识库

用户可以将文章从文章列表页直接添加到指定的知识库中，系统自动完成内容的向量化处理。

#### Scenario: 点击添加到知识库菜单

- **WHEN** 用户在文章列表页点击操作菜单中的「添加到知识库」
- **THEN** 弹出知识库选择对话框，显示当前知识库列表

#### Scenario: 知识库列表为空

- **WHEN** 用户点击「添加到知识库」时没有任何知识库
- **THEN** 显示「暂无知识库，请先创建」提示，并关闭对话框

#### Scenario: 选择知识库并确认添加

- **WHEN** 用户从列表中选择一个知识库并点击确认
- **THEN** 调用 `/knowledge/addToKnowledge?id={articleId}&knowledgeId={knowledgeId}&type=article` API
- **AND** 显示 loading 状态
- **AND** 添加成功后显示「已添加到知识库」提示
- **AND** 关闭对话框

#### Scenario: 添加失败

- **WHEN** 添加到知识库请求失败
- **THEN** 显示错误提示信息
- **AND** 对话框保持打开状态供用户重试

#### Scenario: 重复添加同一文章

- **WHEN** 用户尝试将已添加过的文章再次添加到知识库
- **THEN** 后端 API 正常处理（向量可能重复生成）
- **AND** 知识库文档计数可能增加

#### Scenario: 取消添加操作

- **WHEN** 用户在选择知识库对话框中点击取消
- **THEN** 关闭对话框，不进行任何操作
