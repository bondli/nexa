# Nexa - AI 知识库桌面应用

## 需求功能
- 实现知识库和知识库文档嵌入能力
- 目前知识库前端已完成，后端也有部分实现，需要优化和完善
  - 知识库前端：frontend/pages/Knowledge，目前有新建知识库，删除知识库，修改知识库名称，通过知识库ID查询该知识库下的文档列表
  - 知识库文档前端：frontend/pages/Knowledge/Documents，目前有上传文档，删除文档等功能
  - 知识库后端：server/controllers/knowledge-controller.ts，目前有创建知识库，获取知识库列表，获取知识库详情，更新知识库，删除知识库
  - 知识库文档后端：server/controllers/docs-controller.ts，目前有上传文档，获取文档列表，获取文档详情，更新文档，删除文档等
- 需要做的：
  - 创建知识库的时候需要去向量数据库中创建一个向量数据库的集合（collection）
  - 创建文档的时候，需要：
    - 将该文档向量化到对应的知识库下
    - 目前docs-controller.ts中上传文档的逻辑要去掉，上传文档都统一到了common/uploadFile
    - 创建文档的时候需要对文档做向量化
  - 删除文档
    - 需要从向量数据库中删除对应的向量
  - 删除知识库
    - 需要删除向量数据库中对应的集合
    - 需要删除该知识库下的所有文档
  - 目前在向量化的处理是不对的，我已经在腾讯云的cvm上部署了qdrant，你需要使用TS的client来操作他
    - 目前是chromadb实现的，需要全部移除
