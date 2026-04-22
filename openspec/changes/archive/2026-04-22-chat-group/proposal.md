## Why

随着聊天会话数量增加，用户难以有效组织和查找历史会话。目前所有会话都平铺展示，缺乏分组管理能力，导致用户体验混乱。增加会话分组功能可以帮助用户更好地管理对话历史。

## What Changes

- 前端 ChatHistory 组件增加分组能力（无需新增会话按钮）
- 新增分组管理功能：创建、重命名、删除分组
- 分组内会话管理：移动会话到分组、重命名会话、删除会话
- 会话列表按时间分组展示：今天、昨天、七天前、更早
- 后端新增 ChatCate 数据模型和相关接口
- Chat 模型增加分组 ID 字段

## Capabilities

### New Capabilities
- `chat-group`: 聊天会话分组管理功能，包括分组 CRUD、会话移动、时间分组展示

### Modified Capabilities
- 无

## Impact

- 前端：`frontend/pages/ChatBox/ChatHistory/index.tsx`，使用 ChatBox 页面 context
- 后端：`server/controllers/chat-cate-controller.ts`、`server/models/Chat.ts`、`server/models/ChatCate.ts`
- 数据库：新增 ChatCate 表，Chat 表增加 cateId 字段