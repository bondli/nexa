## ADDED Requirements

### Requirement: 创建文档时自动向量化存储
创建文档时，系统 SHALL 自动将文档名称、描述和内容转换为向量，并存储到对应知识库的 Qdrant collection 中。

#### Scenario: 成功创建文档向量
- **WHEN** 用户调用创建文档 API（POST /api/docs）
- **THEN** 系统读取文档文件内容，存储到 content 字段，同时调用 AI 服务生成 embedding，并存储到 Qdrant 中对应知识库的 collection

#### Scenario: 向量生成失败时创建文档
- **WHEN** AI 服务生成 embedding 失败时创建文档
- **THEN** 系统记录错误日志，但文档仍然在 MySQL 中创建成功（向量存储失败不影响主流程）

### Requirement: 更新文档时更新向量
更新文档时，系统 SHALL 自动更新 Qdrant 中对应的向量数据。

#### Scenario: 成功更新文档向量
- **WHEN** 用户调用更新文档 API（PUT /api/docs）
- **THEN** 系统在 MySQL 中更新文档记录，同时更新 Qdrant 中对应的向量

### Requirement: 删除文档时删除向量
删除文档时，系统 SHALL 自动删除 Qdrant 中对应的向量。

#### Scenario: 成功删除文档向量
- **WHEN** 用户调用删除文档 API（DELETE /api/docs?id={id}）
- **THEN** 系统在 MySQL 中删除文档记录，同时删除 Qdrant 中对应的向量（ID 为 `doc_{documentId}`）

#### Scenario: 删除文档时更新知识库文档计数
- **WHEN** 用户删除文档
- **THEN** 系统更新该文档所属知识库的文档计数（counts - 1）