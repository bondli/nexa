## Context

当前知识库功能使用 ChromaDB 本地向量数据库，代码位于 `server/config/vectorDB.ts`。但已在腾讯云 CVM 上部署了 Qdrant 远程向量数据库服务，需要将向量存储从 ChromaDB 迁移到 Qdrant。

当前架构问题：
- ChromaDB 使用本地存储，无法利用远程部署的 Qdrant 服务
- 知识库创建时未在向量数据库中创建对应 collection
- 知识库删除时未清理对应的向量数据
- 文档向量存储使用统一的 collection，未按知识库隔离

## Goals / Non-Goals

**Goals:**
1. 将向量数据库从 ChromaDB 迁移到 Qdrant 远程服务
2. 每个知识库对应 Qdrant 中的一个 collection，实现数据隔离
3. 创建知识库时自动创建对应的 Qdrant collection
4. 删除知识库时自动删除对应的 Qdrant collection 及所有向量
5. 创建文档时自动将文档内容向量化并存入对应知识库的 collection
6. 删除文档时自动删除 Qdrant 中对应的向量

**Non-Goals:**
- 不修改前端 UI 代码
- 不修改 MySQL 数据库结构
- 不实现文档内容的读取和分段处理（当前只对文档名称和描述进行向量化）
- 不实现向量数据库的全文检索 API

## Decisions

### 1. 使用 Qdrant TypeScript Client

**选择**: 使用 `@qdrant/js-client-rest`

**理由**:
- Qdrant 官方提供的 TypeScript 客户端，支持 REST API
- 已在 `package.json` 中添加依赖
- 支持远程 Qdrant 服务连接

**替代方案考虑**:
- gRPC 客户端：需要额外配置，暂不采用

### 2. Collection 命名策略

**选择**: Collection 名称使用 `knowledge_{knowledgeId}`

**理由**:
- 每个知识库独立 collection，实现数据隔离
- 便于管理和删除整个知识库的向量数据

### 3. 向量 ID 策略

**选择**: 向量 ID 使用 `doc_{documentId}`

**理由**:
- 唯一标识每个文档的向量
- 便于查询和删除特定文档

### 4. 配置管理

**选择**: 从 `~/.nexa/qdrant.json` 读取 Qdrant 连接配置

**理由**:
- 复用现有 `setting.ts` 的配置管理机制
- 配置文件格式参考 `api.json`
- 便于在不同环境（开发/生产）使用不同配置

**配置格式**:
```json
{
  "url": "https://your-qdrant-domain.com",
  "apiKey": "optional-api-key"
}
```

**连接方式**:
- 使用 Qdrant 客户端的 `url` 参数（而非 host + port）
- 适配 nginx 域名代理场景，无需指定端口

## Risks / Trade-offs

### 风险 1: Qdrant 服务不可用
**影响**: 向量操作失败可能导致整个知识库/文档操作失败
**缓解**: 向量操作使用 try-catch 捕获异常，不阻塞主流程（文档创建/删除成功但向量操作失败时记录日志）

### 风险 2: 向量维度不匹配
**影响**: 搜索结果不准确
**缓解**: 确保 embedding 模型输出的向量维度与 Qdrant collection 配置一致（当前使用 1536 维）

### 风险 3: 数据迁移
**影响**: 切换到 Qdrant 后原有向量数据丢失
**缓解**: 当前为全新功能，暂无历史数据需要迁移

### 风险 4: 网络延迟
**影响**: 远程 Qdrant 服务访问可能有网络延迟
**缓解**: Qdrant 服务部署在腾讯云 CVM，与应用服务器同区域，网络延迟可控