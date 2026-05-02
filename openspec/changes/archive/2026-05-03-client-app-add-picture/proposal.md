## Why

用户需要在手机客户端管理和查看已存储的图片，实现图片的上传、列表展示和预览功能，完善知识库的媒体内容管理能力。

## What Changes

- 在手机 App 底部导航栏新增图片入口 icon（位于文章后面）
- 新增图片列表页面，采用 Card 布局每行展示 3 张图片
- 支持点击图片查看大图
- 新增图片上传功能，支持 jpg、png、gif 格式，限制 10M 以内
- Android 原生层提供图片选择和上传模块给 React Native 调用
- 后端新增 PictureService 处理图片数据操作

## Capabilities

### New Capabilities

- `picture-list`: 手机端图片列表展示能力，支持卡片布局和大图预览
- `picture-upload`: 图片上传能力，支持选择和上传图片到服务器

### Modified Capabilities

- 无

## Impact

- **客户端**: `client-app/src/pages/Main/index.tsx` 底部导航新增图片 tab
- **React Native 页面**: `client-app/src/pages/Picture/` 新增图片列表页面组件
- **Service 层**: `client-app/src/services/PictureService.ts` 新增图片服务
- **Android 原生**: `client-app/Android/` 新增原生图片选择模块
- **后端**: `server/` Picture 表相关数据操作接口
