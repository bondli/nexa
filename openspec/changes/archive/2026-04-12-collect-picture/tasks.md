## 1. 数据库层

- [x] 1.1 创建图片分类模型 `server/models/PictureCate.ts`，包含字段：id、icon、name、orders、counts、userId
- [x] 1.2 创建图片模型 `server/models/Picture.ts`，包含字段：id、path、name、description、categoryId、createdAt、updatedAt
- [x] 1.3 在数据库中创建 PictureCate 和 Picture 表（通过 sequelize.sync 自动同步）

## 2. 后端 API

- [x] 2.1 创建图片分类控制器 `server/controllers/picture-cate-controller.ts`，实现分类的 CRUD 接口
- [x] 2.2 创建图片控制器 `server/controllers/picture-controller.ts`，实现图片的 CRUD 接口
- [x] 2.3 在 `server/routers/index.ts` 中添加图片分类路由：`/pictureCate/create`、`/pictureCate/list`、`/pictureCate/update`、`/pictureCate/delete`
- [x] 2.4 在 `server/routers/index.ts` 中添加图片路由：`/picture/add`、`/picture/getList`、`/picture/update`、`/picture/delete`、`/picture/detail`

## 3. 前端 Context

- [x] 3.1 在 `frontend/pages/Picture/context.tsx` 中创建 PictureContext，封装图片分类和图片的 API 调用（参考 NoteBook/context.tsx 模式）

## 4. 前端页面 - Picture 页面

- [x] 4.1 创建 `frontend/pages/Picture/index.tsx` 主页面组件
- [x] 4.2 创建 `frontend/pages/Picture/index.module.less` 样式文件
- [x] 4.3 实现左侧分类导航组件，包含分类列表、新增、编辑、删除功能
- [x] 4.4 实现右侧图片列表组件，使用 Card 展示图片，支持删除和查看大图
- [x] 4.5 在路由中配置 Picture 页面入口（在 MainPage 中添加图片入口）

## 5. 浏览器插件 - 图片收藏功能

- [x] 5.1 在浏览器插件中实现鼠标悬停图片时显示收藏角标
- [x] 5.2 实现点击角标弹出收藏弹层
- [x] 5.3 实现弹层中分类下拉选择（调用 `/pictureCate/list` 获取分类）
- [x] 5.4 实现图片描述输入框
- [x] 5.5 实现一键收藏功能：
  - 调用 `/common/uploadImage` 上传图片
  - 调用 `/picture/add` 保存图片记录
- [x] 5.6 处理收藏成功/失败的提示反馈

## 6. 验证测试

- [x] 6.1 测试后端 API 是否正常工作（手动测试）
- [x] 6.2 测试前端 Picture 页面功能是否正常（手动测试）
- [x] 6.3 测试浏览器插件图片收藏功能（手动测试）
- [x] 6.4 测试整体流程：插件收藏 → 桌面端查看（手动测试）