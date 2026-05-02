## 1. 客户端基础设施

- [x] 1.1 修改 `client-app/src/commons/constants.ts` 添加 Picture tab 到 TAB_KEY 和 PAGE_MAP
- [x] 1.2 创建 `client-app/src/pages/Main/Picture/` 目录结构（index.tsx, styles.ts）
- [x] 1.3 创建 `client-app/src/services/PictureService.ts` 图片服务

## 2. 图片列表页面实现

- [x] 2.1 实现 Picture 页面基础布局，包含上传按钮和图片列表
- [x] 2.2 实现 Card 布局，每行 3 张图片展示
- [x] 2.3 实现图片大图预览功能（使用 Modal 实现）
- [x] 2.4 实现空状态展示
- [x] 2.5 实现分页加载逻辑

## 3. Android 原生模块开发

- [x] 3.1 在 `client-app/Android/app/src/main/java/` 下创建原生图片选择模块
- [x] 3.2 实现图片选择器打开系统相册
- [x] 3.3 实现权限请求逻辑
- [x] 3.4 通过 React Native Bridge 暴露图片选择接口

## 4. 图片上传功能

- [x] 4.1 在 PictureService 中实现图片上传方法
- [x] 4.2 连接 Android 原生图片选择器和上传功能
- [x] 4.3 添加图片格式和大小校验（jpg/png/gif, <=10M）
- [x] 4.4 实现上传进度和失败提示

## 5. 页面入口集成

- [x] 5.1 修改 Main/index.tsx 添加 Picture TabBar.Item
- [x] 5.2 导入并渲染 PicturePage 组件
