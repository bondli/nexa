## Context

Nexa 知识库应用需要扩展手机端能力，新增图片管理功能。现有的 Article 列表功能展示了文章存储和搜索能力，图片功能将复用已有的后端 Picture 数据模型和控制器，提供类似的列表、上传、预览能力。

后端已具备完整的 Picture 相关接口：
- `POST /api/picture/create` - 创建图片记录
- `GET /api/picture/list` - 获取图片列表
- `GET /api/picture/info` - 获取图片详情
- `PUT /api/picture/update` - 更新图片
- `DELETE /api/picture/delete` - 软删除图片

客户端需在 React Native 侧实现图片列表页面和上传功能，Android 原生层提供图片选择能力。

## Goals / Non-Goals

**Goals:**
- 实现手机端图片列表展示，每行 3 张 Card 布局
- 实现点击图片大图预览功能
- 实现图片上传功能，支持 jpg、png、gif，限制 10M
- Android 原生提供图片选择模块供 RN 调用
- 后端复用已有 Picture 表结构

**Non-Goals:**
- 不实现图片编辑、裁剪等高级功能
- 不实现图片分类管理功能
- 不实现批量上传或下载功能

## Decisions

### 1. React Native 端架构

**决策**: 遵循现有项目结构规范，在 `client-app/src/pages/Main/` 下新增 `Picture` 目录作为独立页面组件，`client-app/src/services/` 下新增 `PictureService.ts`。

**原因**: 对齐项目现有的 Note/Article/Collect 等页面结构，保持一致性。

### 2. 图片上传流程

**决策**: 采用 Android 原生模块 + RN Bridge 方式进行图片选择，然后通过 RN 侧上传到服务端。

**原因**: 需求明确要求使用原生 Android 代码提供模块给 RN 侧调用。

### 3. 大图预览方案

**决策**: 使用 React Native 社区成熟的 `@react-native-community/image-viewer` 或类似组件实现大图预览。

**原因**: 避免重复造轮子，社区组件已处理手势、缩放等交互细节。

### 4. 页面入口集成

**决策**: 修改 `client-app/src/commons/constants.ts` 中 `TAB_KEY` 类型和 `PAGE_MAP`，在底部 TabBar 第四个位置（Profile 之前）新增 Picture tab。

**原因**: 需求描述图片入口在文章后面、我的前面。

## Risks / Trade-offs

| 风险 |  Mitigation |
|------|-------------|
| Android 原生模块需额外打包和调试 | 独立开发调试完成后集成 |
| 大图预览在低端设备上可能卡顿 | 限制图片尺寸或使用懒加载 |
| 上传大文件可能超时 | 增加上传进度提示和超时处理 |

## Open Questions

1. Android 原生模块具体使用 ImagePicker 还是 DocumentPicker？
2. 图片上传后的存储路径是否需要单独的图片服务器？
3. 是否需要实现图片删除功能（需求未明确）？
