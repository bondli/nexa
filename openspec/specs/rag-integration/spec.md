## ADDED Requirements

### Requirement: RAG 检索能力
系统 SHALL 在回答问题前利用向量知识库进行 RAG 检索。

#### Scenario: 自动 RAG 检索
- **WHEN** 用户提问时
- **THEN** 系统自动从知识库检索相关内容，作为上下文提供给 AI

#### Scenario: 检索结果排序
- **WHEN** 返回检索结果
- **THEN** 按相似度得分排序，默认返回 top 5 条结果

#### Scenario: 无检索结果
- **WHEN** 知识库中没有相关内容
- **THEN** 正常进行对话，不返回无关内容

### Requirement: 知识库选择
系统 SHALL 支持选择特定知识库进行检索。

#### Scenario: 指定知识库 ID
- **WHEN** 请求时指定 `knowledgeId`
- **THEN** 仅从指定知识库检索

#### Scenario: 多知识库检索
- **WHEN** 请求时指定多个知识库 ID
- **THEN** 从所有指定知识库检索并合并结果

### Requirement: 向量检索集成
系统 SHALL 集成现有的向量检索服务（Qdrant）。

#### Scenario: 生成查询向量
- **WHEN** 用户提问时
- **THEN** 使用 embedding 服务将问题转换为向量

#### Scenario: 执行相似度搜索
- **WHEN** 得到查询向量后
- **THEN** 调用向量服务执行相似度搜索

### Requirement: 检索结果处理
系统 SHALL 处理检索结果，提取有用信息提供给 AI。

#### Scenario: 格式化检索结果
- **WHEN** 获得检索结果
- **THEN** 提取文档内容和元数据，格式化为 AI 可理解的上下文

#### Scenario: 控制检索上下文长度
- **WHEN** 检索结果过多
- **THEN** 限制提供给 AI 的上下文长度，避免超过 LLM 限制