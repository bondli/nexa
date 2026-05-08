## Goals / Non-Goals

**Goals:**
- 实现3步文章采集流程：采集原文 → AI总结 → 生成图片
- Modal支持Tab切换，未完成前置步骤时不可切换
- 复用现有Antd组件和Markdown编辑器
- 图片生成使用HTML模板 + html2canvas方案

**Non-Goals:**
- 不修改现有的悬浮图标和采集面板入口
- 不修改文章列表页面
- 不实现图片生成以外的其他AI能力

## Decisions

### 1. UI架构

- **Modal设计**: 使用Antd Modal作为容器，内部使用Tabs组件实现步骤切换
- **步骤状态**: 使用React state管理，step1/2/3完成状态独立追踪
- **Tab禁用逻辑**: 只有前置步骤完成才能切换到对应Tab

### 2. 步骤流程

```
[点击"一键提取"]
       ↓
[关闭采集面板]
       ↓
[弹出ArticleCollectModal]
       ↓
┌─────────────────────────┐
│ Step 1: 采集原文         │ ← 默认激活
│ (完成后自动/手动进入Step2) │
├─────────────────────────┤
│ Step 2: AI总结           │ ← Step1完成后可切换
│ (自动触发，总结完成后进入Step3)│
├─────────────────────────┤
│ Step 3: 生成图片          │ ← Step2完成后可切换
└─────────────────────────┘
```

### 3. 组件结构

```
ArticleCollectModal/
├── index.tsx (主组件)
├── Step1Collect.tsx (采集原文)
├── Step2Summarize.tsx (AI总结)
├── Step3GenerateImage.tsx (生成图片)
└── styles.module.less
```

### 4. 服务端接口

#### 4.1 /article/save (修改)

新增字段：
- `summary`: string - AI总结内容
- `image`: string - 生成的图片云端地址

#### 4.2 /article/generate-image (新增)

请求：
```typescript
interface GenerateImageRequest {
  summary: string;      // 文章总结内容
  title?: string;        // 文章标题(可选)
}
```

响应：
```typescript
interface GenerateImageResponse {
  imageUrl: string;      // 云端图片URL
}
```

实现逻辑：
1. 接收总结内容，填充HTML模板
2. 在Node.js环境渲染HTML
3. 使用html2canvas或puppeteer截图
4. 上传到云端存储
5. 返回图片URL

### 5. HTML模板

用户提供HTML模板，模板变量使用 `{{variable}}` 格式：
- `{{title}}`: 文章标题
- `{{summary}}`: 文章总结内容
- `{{date}}`: 生成日期

模板设计要求：
- 视觉美观，适合分享
- 固定尺寸，适配图片生成
- 支持中文字体

### 6. 技术选型

- **前端状态管理**: React Hooks (useState管理步骤和状态)
- **Markdown预览**: 复用现有Markdown编辑器组件
- **图片生成**: HTML模板渲染 + html2canvas截图
- **服务端截图**: Puppeteer 或 html2canvas (Node.js版本)

## Risks / Trade-offs

- **HTML2canvas兼容**: 不同服务器环境可能对html2canvas支持不同
  - 缓解：先尝试Puppeteer方案，回退到html2canvas
- **长文本处理**: 总结内容过长时HTML模板可能溢出
  - 缓解：模板设计考虑文本截断或滚动
- **AI总结耗时**: 第二步可能耗时较长
  - 缓解：显示加载状态，支持中断
