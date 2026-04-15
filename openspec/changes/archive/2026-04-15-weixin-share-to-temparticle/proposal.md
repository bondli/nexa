## Why

用户在使用微信浏览文章时，希望能够将感兴趣的文章快速保存到 Nexa 应用中。目前缺少从微信直接分享文章到 Nexa 的能力，用户需要手动复制粘贴链接，体验不够流畅。

## What Changes

- 新增微信分享到 Nexa 的能力，通过 URL Scheme 唤起应用并传递文章标题和 URL
- 数据库 `TempArticle` 表新增 `title` 字段用于存储文章标题
- RN 端新增 `shareToTempArticle` 方法用于保存临时文章
- RN 端临时文章列表展示优化，显示标题和 URL，点击打开原文章
- Desktop 端临时文章列表展示优化，显示标题和 URL，点击在浏览器打开
- Desktop 端临时文章的 Actions 只保留删除功能（软删除，可在回收站恢复）

## Capabilities

### New Capabilities

- `weixin-share-to-temparticle`: 支持从微信分享文章到 Nexa 临时文章，包含数据存储和 UI 展示

### Modified Capabilities

- 无（现有功能仅为增强，不涉及需求变更）

## Impact

- **数据库**: `TempArticle` 表新增 `title` 字段
- **RN 端**: `client-app/src/services/ArticleService.ts` 新增方法，`client-app/src/pages/Main/Article/` 页面修改
- **Desktop 端**: `frontend/pages/Article/Articles.tsx` 页面修改，`frontend/components/Actions/` 可能需要调整