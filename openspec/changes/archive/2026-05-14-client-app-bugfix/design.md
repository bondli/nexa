## Context

Nexa手机客户端采用React-native技术栈，通过Android原生模块暴露MySQL连接给RN直接使用（JDBC方式）。笔记和文章页面使用FlatList展示列表项，点击列表项通过Popup/Modal展示详情。

**根因分析（基于代码分析）**：

1. **Modal首次点击无响应**：
   - 代码中 `Note/index.tsx` 使用 `onPress={() => handleNotePress(item)}` 绑定点击事件
   - `Popup` 通过 `visible={!!selectedNote && operator === 'detail'}` 控制显示
   - 问题可能出在 FlatList 首次渲染时子组件的事件处理机制，或 Detail 组件首次加载数据时序问题

2. **MySQL连接断开**：
   - `DatabaseService` 在 `context.tsx` 中延迟1秒初始化，连接一次后不释放
   - `DatabaseService` 没有实现连接断开检测和重连机制
   - 虽然JDBC URL设置了 `autoReconnect=true`，但这只在连接失效时生效，不是在App切换到后台后再唤醒时自动重连
   - **RN端没有使用 `AppState` API监听前后台切换**，所以切回前台时不会检测连接状态
   - Android `MainActivity.kt` 主要处理微信分享唤起，未涉及数据库重连

根据项目规范，UI层禁止写复杂业务逻辑，业务逻辑应放在Service层。

## Goals / Non-Goals

**Goals:**
- 修复笔记和文章列表项点击首次不弹出Modal的问题
- 实现App前后台切换时MySQL连接状态检测和自动重连机制
- 实现笔记长按操作的编辑、标记完成、删除功能

**Non-Goals:**
- 不修改数据库Schema
- 不涉及笔记的创建功能（仅处理已有笔记的操作）
- 不涉及文章的长按操作

## Decisions

### 1. Modal首次点击无响应的修复

**问题分析**：需要进一步检查代码，可能是 FlatList 初始化时点击事件与 Detail 组件数据加载的时序问题。

**方案**：
- 检查 `Note/index.tsx` 中 `handleNotePress` 的实现，确保 `setSelectedNote` 和 `setOperator` 正确调用
- 检查 Detail 组件是否在首次加载时正确获取数据
- 如果是 FlatList 事件问题，考虑使用 `onPress` 而不是子组件内部的事件处理

### 2. MySQL自动重连机制

**问题分析**：JDBC `autoReconnect=true` 不能覆盖App进入后台再唤醒的场景。

**方案**：
- 在 `context.tsx` 中使用 React Native 的 `AppState` API 监听应用前后台切换
- 当 App 从后台切换到前台时，检测 `DatabaseService.isConnected` 状态
- 如果连接已断开，自动调用 `DatabaseService.reconnect()` 重连
- 重连失败时设置 `setIsDBConnected(false)`，UI显示"连接已断开，请刷新重试"提示

### 3. 笔记长按操作

**问题分析**：需要通过ActionSheet展示操作菜单，包含编辑、标记完成、删除三个选项。

**方案**：
- 使用 `@ant-design/react-native` 的 `ActionSheet` 或 `Modal` + `Button` 组合
- 编辑：弹出Modal编辑标题和详情，调用 `NoteService.updateNote` 保存
- 标记完成：调用 `NoteService.updateNoteStatus` 更新状态
- 删除：调用 `NoteService.deleteNote` 删除笔记

## Risks / Trade-offs

| 风险 | Mitigation |
|------|------------|
| MySQL重连失败 | 增加重试次数(3次)，超时后提示用户手动刷新页面 |
| ActionSheet在Android兼容性 | 使用 `@ant-design/react-native` 跨平台组件 |
| Modal点击问题根因不明 | 需先深入分析 Note/index.tsx 和 Detail 组件代码确定根因 |
