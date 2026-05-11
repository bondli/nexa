## Context

桌面端文章管理 (`frontend/pages/Article/articles.tsx`) 目前支持预览已有图片的文章，但无法为无图片文章生成封面图。需求是在文章无图片时，点击 avatar 触发 AI 生成图片流程。

### 现有实现参考

浏览器插件端已有完整实现 (`Step3GenerateImage.tsx`)，桌面端复用的设计如下：
1. 调用 `/article/generate-image` 获取 HTML 内容
2. 使用 `html2canvas` 将 HTML 渲染为 canvas
3. canvas 转为 blob 上传至 `/common/uploadFile?fileType=image`
4. 调用 `/article/update` 更新文章的 `image` 字段

## Goals / Non-Goals

**Goals:**
- 无图片文章点击 avatar 触发 AI 图片生成
- 生成流程在 Modal 中完成，包含加载状态
- 成功后将云端图片地址更新到文章记录

**Non-Goals:**
- 不修改后端接口逻辑（仅使用现有接口）
- 不支持批量生成

## Decisions

1. **复用 Step3GenerateImage 逻辑**：参考浏览器插件实现，保持一致的交互体验
2. **Modal 交互**：点击 avatar 后打开 Modal，用户在 Modal 内完成生成→预览→上传的完整流程
3. **状态管理**：在 Modal 组件内部管理生成/上传/完成状态

## Risks / Trade-offs

- **风险**：html2canvas 渲染复杂 HTML 可能失败 →  Mitigation: 捕获异常并提示用户重试
- **风险**：大图片上传可能超时 → Mitigation: 使用 loading 状态提示，设置合理超时
