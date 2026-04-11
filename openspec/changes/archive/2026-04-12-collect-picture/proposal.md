## Why

用户需要在浏览网页时能够一键收藏看到的图片，并希望在一个专门的图片管理页面中查看和管理这些收藏的图片。目前系统已有浏览器插件支持文字内容收藏，但缺少图片收藏功能。

## What Changes

1. **浏览器插件扩展**：在现有浏览器插件上新增图片收藏功能，鼠标悬停图片时显示收藏角标，点击弹出收藏弹层
2. **图片管理前端页面**：新增 Picture 页面，左侧为图片分类导航，右侧为图片列表（Card 组件展示）
3. **图片分类管理**：支持图片分类的增删改查，交互形式与笔记本分类一致
4. **图片 CRUD 接口**：在 server 层实现图片的增删改查 API
5. **图片数据模型**：新建图片表，包含 id、path、name、description、categoryId、createdAt、updatedAt 字段

## Capabilities

### New Capabilities

- `browser-image-collect`: 浏览器插件图片收藏功能
  - 鼠标悬停图片时显示收藏角标
  - 点击角标弹出收藏弹层（下拉分类选择 + 描述输入 + 确认收藏）
  - 调用 /common/uploadImage 上传图片到服务端
- `picture-page`: 图片管理前端页面
  - 新增 frontend/pages/Picture 页面
  - 左侧分类导航（与笔记分类类似的交互）
  - 右侧图片列表（Card 组件展示，支持删除和查看大图）
  - 按时间倒序展示
- `image-category`: 图片分类管理
  - 支持图片分类的增删改查
  - 可复用现有 Cate 模型或新建专用图片分类模型
- `image-api`: 图片相关服务端接口
  - 图片分类 CRUD API
  - 图片 CRUD API（使用已有 /common/uploadImage 接口）

### Modified Capabilities

- `browser-extension-collect`: 扩展现有浏览器插件能力，新增图片收藏功能

## Impact

- **前端**: 新增 `frontend/pages/Picture` 目录和相关组件
- **后端**: 新增图片和图片分类的 controller、model、route
- **浏览器插件**: 修改插件代码，新增图片收藏浮层 UI
- **数据库**: 新增图片表（Picture），可能需要区分图片分类与笔记分类