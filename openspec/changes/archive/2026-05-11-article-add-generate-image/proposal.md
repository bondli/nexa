## Why

当前桌面端文章管理中，没有图片的文章无法直接生成封面图。用户期望能够点击文章的头像图标触发AI生成图片，提升文章列表的视觉体验和可分享性。

## What Changes

- 文章列表中，**无图片文章**的 avatar 点击后触发图片生成流程
- 生成流程：调用后端 `/article/generate-image` 生成HTML内容 → 用户预览HTML → 点击转换为图片 → 上传云端 → 更新文章 `image` 字段
- 整个过程在 Modal 中完成，提供加载状态和错误提示

## Capabilities

### New Capabilities

- `article-image-generation`: 文章AI图片生成功能，支持生成HTML内容、转换为图片、上传到云端

## Impact

- **前端**：修改 `frontend/pages/Article/articles.tsx`，新增 GenerateImageModal 组件
- **后端接口**（已存在）：`/article/generate-image`、`/common/uploadFile`、`/article/update`
- **可参考实现**：`browser-extension/src/content/components/ArticleCollectModal/Step3GenerateImage.tsx`
