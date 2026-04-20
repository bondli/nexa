# Nexa - AI 知识库桌面应用

## 需求功能
- 笔记、文章、图片页面支持分页加载，触底加载更多
- 笔记页面：frontend/pages/NoteBook
  - 笔记页面对应的服务端：server/controllers/note-controller.js，没有实现limit,offset的查询条件，需要补充
  - 前端frontend/pages/NoteBook/Notes.tsx 需要实现分页加载逻辑,列表底部触底触发加载更多的实现
- 文章页面：frontend/pages/Article
  - 前端frontend/pages/Article/Articles.tsx 需要实现分页加载逻辑,列表底部触底触发加载更多的实现
- 图片页面：frontend/pages/Picture
  - 前端frontend/pages/Picture/PictureList.tsx 需要实现分页加载逻辑,列表底部触底触发加载更多的实现
  - 前端frontend/pages/Picture/PictureList.tsx 中目前不是使用Antd的Card组件实现的UI布局，需要切换到使用Antd的Card组件实现图片列表的UI布局
  - 切换到Antd的Card组件布局后清理index.module.less中多余的样式
