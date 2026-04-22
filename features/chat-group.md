# Nexa - AI 知识库桌面应用

## 需求功能
- 聊天会话支持分组
- 前端：
  - 对页面`frontend/pages/ChatBox`左侧增加分组能力,代码只需修改：frontend/pages/ChatBox/ChatHistory/index.tsx
  - 整体UI从上到下：新增会话框 -> 分组文案 -> 分组列表 -> 未分组的会话列表
  - 分组文案：右侧有新增分组的入口，点击和笔记分类的一致，出现一个框，输入新的分组名，回车调用接口新增
  - 分组列表：支持右侧的操作：重命名，删除
    - 点击一个分组的时候，出现一个Modal，里面是该分组下的会话列表，支持移动到其他分组，支持删除会话，支持重命名会话
    - 点击一个会话就关闭Modal，然后右侧就切换到了这个会话，可以看到他的消息列表
  - 会话列表：这个列表是没有加入到分组中的，按时间做一些分组，比如今天，昨天，七天前，更早
- 后端：
  - server/controllers/chat-controller.ts 提供会话分组的相关接口
  - server/models/Chat.ts 新增分组id的字段
  - 新增一个分组的model：ChatCate.ts，表名就是ChatCate，含有：id,name,counts,createdAt,updatedAt
