## ADDED Requirements

### Requirement: 知识库创建时自动创建向量集合
创建知识库时，系统 SHALL 在 Qdrant 向量数据库中自动创建对应的 collection，实现向量数据的隔离存储。

#### Scenario: 成功创建知识库向量集合
- **WHEN** 用户调用创建知识库 API（POST /api/knowledge）
- **THEN** 系统在 MySQL 中创建知识库记录，同时在 Qdrant 中创建名为 `knowledge_{knowledgeId}` 的 collection

#### Scenario: Qdrant 服务不可用时创建知识库
- **WHEN** Qdrant 服务不可用时创建知识库
- **THEN** 系统记录错误日志，但知识库仍然在 MySQL 中创建成功（向量集合创建失败不影响主流程）

### Requirement: 知识库删除时自动删除向量集合
删除知识库时，系统 SHALL 自动删除 Qdrant 中对应的 collection 及所有向量数据。

#### Scenario: 成功删除知识库向量集合
- **WHEN** 用户调用删除知识库 API（DELETE /api/knowledge?id={id}）
- **THEN** 系统在 MySQL 中删除知识库记录，同时在 Qdrant 中删除对应的 collection

#### Scenario: 删除知识库时一并删除所有文档向量
- **WHEN** 用户删除一个包含多个文档的知识库
- **THEN** Qdrant 中该知识库 collection 内的所有向量被一并删除

### Requirement: 知识库删除时删除关联文档
删除知识库时，系统 SHALL 一并删除该知识库下的所有文档记录。

#### Scenario: 删除知识库时删除所有文档
- **WHEN** 用户删除知识库
- **THEN** 系统删除该知识库在 MySQL 中的所有文档记录，以及 Qdrant 中对应的所有向量