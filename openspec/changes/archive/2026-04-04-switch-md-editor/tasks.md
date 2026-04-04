# Tasks: Switch to Markdown Editor

## 任务清单

### Phase 1: 依赖安装

- [x] **T1**: 安装 `@uiw/react-md-editor` 依赖

### Phase 2: 组件开发

- [x] **T2**: 创建 MarkdownEditor 组件 (`frontend/pages/NoteBook/MarkdownEditor/index.tsx`)
- [x] **T3**: 创建 MarkdownEditor 样式文件 (`frontend/pages/NoteBook/MarkdownEditor/index.module.less`)
- [x] **T4**: 修改 Detail.tsx，替换 MyQuill 为 MarkdownEditor
- [x] **T5**: 实现编辑/预览模式切换功能
- [x] **T6**: 实现边输入边保存（节流+防抖）

### Phase 3: 功能移除

- [x] **T7**: 移除自动提取链接相关代码（UrlLinkPlugin）

### Phase 4: 测试验证

- [ ] **T8**: 测试编辑器基本功能
- [ ] **T9**: 测试自动保存功能
- [ ] **T10**: 测试预览模式切换
- [ ] **T11**: 测试已有笔记数据的显示

---

## 详细步骤

### T1: 安装依赖

```bash
npm install @uiw/react-md-editor
```

### T2-T3: 创建 MarkdownEditor 组件

创建目录：`frontend/pages/NoteBook/MarkdownEditor/`

文件结构：
```
MarkdownEditor/
  index.tsx
  index.module.less
```

核心功能：
1. 接收 `value` 和 `onChange` props
2. 支持编辑/预览模式切换
3. 使用 `@uiw/react-md-editor` 组件

### T4: 修改 Detail.tsx

修改 `frontend/pages/NoteBook/Detail.tsx`：
1. 导入 MarkdownEditor 组件
2. 替换 `<MyQuill />` 为 `<MarkdownEditor />`
3. 更新 props 传递

### T5: 实现模式切换

在 MarkdownEditor 组件中：
1. 添加 `mode` 状态：`edit` | `preview`
2. 右上角添加切换按钮
3. 点击切换按钮切换模式

### T6: 实现自动保存

在 Detail.tsx 中：
```typescript
// 使用 lodash-es 的 throttle 和 debounce
import { throttle, debounce } from 'lodash-es';

// 3秒节流保存
const throttleSave = throttle(handleSaveContent, 3000);

// 首次输入1秒后保存（防抖）
const debounceFirstSave = debounce(() => {
  throttleSave.flush();
}, 1000);
```

### T7: 移除自动提取链接

根据现有代码：
- `MyQuill/UrlLinkPlugin.ts` - 可保留暂不删除
- `MyQuill/index.tsx` 中的 `registerUrlLinkPlugin()` 调用
- Detail.tsx 中的相关逻辑

---

## 验收标准

1. ✅ 点击笔记后显示 Markdown 编辑器
2. ✅ 右上角有"编辑"/"预览"切换按钮
3. ✅ 切换到预览模式显示渲染后的 Markdown
4. ✅ 边输入边自动保存，有节流防抖
5. ✅ 自动提取链接功能不再生效