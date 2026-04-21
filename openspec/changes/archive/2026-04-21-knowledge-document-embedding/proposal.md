## Why

当前知识库功能使用 ChromaDB 作为向量数据库实现，但已在腾讯云 CVM 上部署了 Qdrant 服务。需要将向量数据库从 ChromaDB 迁移到 Qdrant，并完善知识库与知识库文档的向量化集成。

## What Changes

1. **移除 ChromaDB 依赖**：删除 `server/config/vectorDB.ts` 中的 ChromaDB 实现
2. **新增 Qdrant 向量数据库配置**：创建 Qdrant 连接配置，支持远程 Qdrant 服务
3. **修改知识库创建逻辑**：创建知识库时在 Qdrant 中创建对应的 collection
4. **修改知识库删除逻辑**：删除知识库时删除对应的 Qdrant collection 及所有文档向量
5. **修改文档创建逻辑**：创建文档时对文档内容进行向量化，存储到对应知识库的 collection
6. **修改文档删除逻辑**：删除文档时从 Qdrant 中删除对应的向量
7. **更新向量存储服务**：使用 Qdrant TypeScript Client 替换 ChromaDB 实现

## Capabilities

### New Capabilities
- **knowledge-vector-collection**: 知识库向量集合管理 - 创建知识库时自动创建对应的 Qdrant collection
- **document-embedding**: 文档向量化存储 - 创建文档时自动向量化并存入对应知识库 collection

### Modified Capabilities
- (无)

## Impact

- **前端影响**：`frontend/pages/Knowledge` 和 `frontend/pages/Knowledge/Documents` 无需修改
- **后端影响**：
  - `server/config/vectorDB.ts` - 需要重写为 Qdrant 实现
  - `server/services/vector-store-service.ts` - 需要适配 Qdrant API
  - `server/controllers/knowledge-controller.ts` - 创建/删除知识库时操作 Qdrant collection
  - `server/controllers/docs-controller.ts` - 创建/删除文档时操作 Qdrant 向量
- **依赖变化**：移除 ChromaDB，添加 `@qdrant/js-client-rest`
- **配置变更**：添加 Qdrant 服务连接配置，从 `~/.nexa/qdrant.json` 读取（支持 URL 方式，适配 nginx 域名代理）
- **数据库变更**：在 Docs 表新增 `content` 字段（TEXT 类型），存储文档文本内容，支持后续 RAG 分段处理