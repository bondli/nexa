## 1. 后端 - 数据模型

- [x] 1.1 新增 ChatCate 模型（server/models/ChatCate.ts），包含 id, name, counts, createdAt, updatedAt 字段
- [x] 1.2 修改 Chat 模型（server/models/Chat.ts），增加 cateId 字段
- [x] 1.3 执行数据库迁移，创建 ChatCate 表，为 Chat 表添加 cateId 字段

## 2. 后端 - 接口

- [x] 2.1 新增 chat-cate-controller.ts
- [x] 2.2 新增获取分组列表接口 GET /chat_cate/list
- [x] 2.3 新增创建分组接口 POST /chat_cate/add
- [x] 2.4 新增更新分组接口 PUT /chat_cate/update
- [x] 2.5 新增删除分组接口 DELETE /chat_cate/delete
- [x] 2.6 新增获取分组内会话列表接口 GET /chat_cate/chats
- [x] 2.7 新增移动会话到分组接口 PUT /chat/move_to_cate
- [x] 2.8 修改获取会话列表接口，返回未分组会话和分组信息

## 3. 前端 - UI 组件

- [x] 3.1 修改 ChatHistory 组件，添加分组列表区域
- [x] 3.2 实现新增分组输入框交互
- [x] 3.3 实现分组操作菜单（重命名、删除）
- [x] 3.4 实现分组详情 Modal，展示分组内会话列表
- [x] 3.5 实现未分组会话按时间分组展示（今天、昨天、七天前、更早）
- [x] 3.6 实现会话移动到分组的交互
- [x] 3.7 实现会话重命名和删除功能