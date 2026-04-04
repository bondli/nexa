# Tasks: 统一前后端 API 响应格式

## Task List

### Task 1: 创建后端响应工具函数
- [x] 创建 `server/utils/response.ts`
- [x] 实现 success、fail、successWithPage 等方法
- [x] 实现 badRequest、unauthorized、forbidden、notFound、serverError 快捷方法

### Task 2: 修改 note-controller.ts
- [x] 引入 response 工具
- [x] 替换 createNote 的返回格式
- [x] 替换 getNoteInfo 的返回格式
- [x] 替换 getNotes 的返回格式
- [x] 替换 updateNote 的返回格式
- [x] 替换 moveNote 的返回格式
- [x] 替换 getNoteCounts 的返回格式
- [x] 替换 searchNotes 的返回格式
- [x] 替换 removeNote 的返回格式
- [x] 替换 addNoteToKnowledge 的返回格式

### Task 3: 修改 cate-controller.ts
- [x] 引入 response 工具
- [x] 替换 createCate 的返回格式
- [x] 替换 getCateInfo 的返回格式
- [x] 替换 getCates 的返回格式
- [x] 替换 updateCate 的返回格式
- [x] 替换 deleteCate 的返回格式

### Task 4: 修改其他 controller
- [x] chat-controller.ts - 逐个接口替换
- [x] common-controller.ts - 逐个接口替换
- [x] docs-controller.ts - 逐个接口替换
- [x] knowledge-controller.ts - 逐个接口替换
- [x] settings-controller.ts - 逐个接口替换
- [x] user-controller.ts - 逐个接口替换
- [x] install-controller.ts - 逐个接口替换

### Task 5: 更新前端 request.ts
- [x] 更新 ApiResponse 接口定义
- [x] 更新响应拦截器逻辑
- [x] 适配新的 code/data/message 格式

### Task 6: 检查前端 API 调用方 (关键任务)
需要逐个检查以下文件，更新响应数据获取方式：

**NoteBook 模块：**
- [x] frontend/pages/NoteBook/context.tsx - getNotes/setNote 等
- [x] frontend/pages/NoteBook/Detail.tsx
- [x] frontend/pages/NoteBook/SearchBox.tsx
- [x] frontend/pages/NoteBook/Header.tsx
- [x] frontend/pages/NoteBook/Category.tsx
- [x] frontend/pages/NoteBook/Actions.tsx

**Knowledge 模块：**
- [x] frontend/pages/Knowledge/index.tsx

**ChatBox 模块：**
- [x] frontend/pages/ChatBox/context.tsx
- [x] frontend/pages/ChatBox/ChatHistory/index.tsx

**其他模块：**
- [x] frontend/modules/UserPage/index.tsx
- [x] frontend/modules/BootPage/index.tsx
- [x] frontend/components/QuickNote/index.tsx

### Task 7: 验证测试 (lint 已通过)
- [x] 后端代码格式修复
- [x] 前端代码格式修复