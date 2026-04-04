# Design: Switch to Markdown Editor

## 一、技术选型

### 推荐编辑器

**@uiw/react-md-editor** 或 **@monaco-editor/react** + markdown 预览

考虑因素：
- 美观程度
- 社区活跃度
- 与 React 生态兼容性
- 编辑/预览模式支持

### 备选方案

- **react-markdown** + 自定义编辑区
- **ByteMD**：字节跳动的 Markdown 编辑器，支持编辑/预览切换

### 决策

推荐使用 **@uiw/react-md-editor**，原因：
1. 开源活跃，长期维护
2. 原生支持编辑/预览切换
3. 支持工具栏自定义
4. 体积适中，性能良好
5. 支持 GFM (GitHub Flavored Markdown)

## 二、架构设计

### 组件层级

```
Detail (笔记详情页面)
  └── MarkdownEditor (新建 Markdown 编辑器组件)
        ├── Editor (编辑模式)
        └── Preview (预览模式，通过切换按钮控制)
```

### 数据流

```
User Input → MarkdownEditor → throttle (3s) → handleSaveContent → API
                                    ↓
                              debounce (1s) 首次输入后触发
```

### 自动保存策略

```typescript
// 节流：3秒内最多保存一次
const throttleSave = throttle(handleSaveContent, 3000);

// 防抖：停止输入1秒后触发首次保存
const debounceSave = debounce(() => {
  throttleSave.flush(); // 立即执行积压的保存
}, 1000);
```

## 三、UI 设计

### 编辑器布局

```
┌─────────────────────────────────────────────────────┐
│  标题                              2026/04/04       │
│                                     [编辑] [预览]   │
├─────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐  │
│  │  # 我的笔记                                   │  │
│  │                                               │  │
│  │  内容区域                                     │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 工具栏（编辑模式）

- 标题 (H1, H2, H3)
- 加粗、斜体、删除线
- 列表 (有序、无序)
- 代码块
- 链接、图片
- 分割线

### 预览模式

- 渲染 Markdown 为 HTML
- 支持 GFM 语法
- 代码块语法高亮

## 四、移除功能

### 自动提取链接

根据需求，原来在 MyQuill 中实现的 `registerUrlLinkPlugin` 自动提取链接功能需要移除：
- 删除 `MyQuill/UrlLinkPlugin.ts`
- 删除 `MyQuill/index.tsx` 中的 `registerUrlLinkPlugin()` 调用
- `Detail.tsx` 中的 `handleChange` 不再需要特殊处理

## 五、配置清单

### 依赖安装

```bash
npm install @uiw/react-md-editor
# 或
npm install @uiw/react-md-editor @types/markdown-it
```

### 文件变更

| 文件 | 操作 |
|------|------|
| `frontend/pages/NoteBook/MarkdownEditor/index.tsx` | 新建 |
| `frontend/pages/NoteBook/MarkdownEditor/index.module.less` | 新建 |
| `frontend/pages/NoteBook/Detail.tsx` | 修改：替换 MyQuill 为 MarkdownEditor |
| `frontend/pages/NoteBook/MyQuill/` | 保留（暂不删除，后续可移除） |
| `package.json` | 新增依赖 |

## 七、异常处理

1. **保存失败**：显示错误提示，保留本地内容
2. **Markdown 解析错误**：显示原始文本
3. **加载失败**：显示占位提示