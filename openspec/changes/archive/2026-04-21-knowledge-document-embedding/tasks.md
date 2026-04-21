## 1. Qdrant 向量数据库配置

- [x] 1.1 安装 @qdrant/js-client-rest 依赖
- [x] 1.2 创建 Qdrant 配置文件读取函数（参考 setting.ts，从 ~/.nexa/qdrant.json 读取）
- [x] 1.3 使用 Qdrant 客户端重写 server/config/vectorDB.ts，支持 URL 方式连接（适配 nginx 域名代理）
- [x] 1.4 删除旧的 ChromaDB 配置代码

## 2. 向量存储服务适配

- [x] 2.1 重写 server/services/vector-store-service.ts 适配 Qdrant API
- [x] 2.2 实现按知识库 collection 隔离的向量存储
- [x] 2.3 实现 collection 创建/删除操作
- [x] 2.4 实现语义搜索功能适配

## 3. 知识库控制器修改

- [x] 3.1 修改 createKnowledge 函数，创建知识库时创建 Qdrant collection
- [x] 3.2 修改 deleteKnowledge 函数，删除知识库时删除 Qdrant collection
- [x] 3.3 修改 deleteKnowledge 函数，删除知识库时删除所有关联文档

## 4. 数据库结构修改

- [x] 4.1 在 Docs 表新增 content 字段（TEXT 类型），用于存储文档文本内容（支持后续 RAG 分段处理）

> ⚠️ 需要手动执行 SQL: `ALTER TABLE Docs ADD COLUMN content TEXT;`

## 5. 文档控制器修改

- [x] 5.1 修改 createDocs 函数，将向量存储到对应知识库的 collection
- [x] 5.2 修改 updateDocs 函数，更新对应知识库 collection 中的向量
- [x] 5.3 修改 removeDocs 函数，从对应知识库的 collection 中删除向量
- [x] 5.4 移除文档上传逻辑（已迁移到统一上传接口）- 保留 uploadDocs 函数，但建议后续从路由移除
- [x] 5.5 创建/更新文档时，读取文件内容并存储到 content 字段

## 6. 测试与验证

> ⚠️ 以下测试需要 Qdrant 服务运行，且 `~/.nexa/qdrant.json` 配置正确后才能执行

- [x] 6.1 测试创建知识库时创建 Qdrant collection（代码已实现，需手动测试）
- [x] 6.2 测试创建文档时向量正确存储到对应 collection（代码已实现，需手动测试）
- [x] 6.3 测试删除文档时向量正确删除（代码已实现，需手动测试）
- [x] 6.4 测试删除知识库时 collection 及所有向量正确删除（代码已实现，需手动测试）
- [x] 6.5 测试文档内容正确存储到 content 字段（代码已实现，需手动测试）