## 1. Bugfix - 笔记Modal点击问题

- [x] 1.1 分析 Note/index.tsx 和 Detail 组件代码，找出首次点击Modal不弹出的根因
- [x] 1.2 修复笔记列表项点击事件处理 - 使用 useCallback 优化事件处理函数
- [x] 1.3 验证修复后在笔记页面首次点击列表项能正常弹出Modal

## 2. Bugfix - 文章Modal点击问题

- [x] 2.1 检查 Article 页面列表项点击事件绑定方式
- [x] 2.2 修复文章列表项点击事件处理 - 使用 useCallback 优化事件处理函数
- [x] 2.3 验证修复后在文章页面首次点击列表项能正常弹出Modal

## 3. Feature - MySQL连接状态检测和自动重连

- [x] 3.1 在 context.tsx 中添加 AppState 监听，检测应用前后台切换
- [x] 3.2 在 DatabaseService 中添加 reconnect() 方法，实现连接重连逻辑
- [x] 3.3 在 AppState 切换到前台时检测连接状态，断开时自动重连
- [x] 3.4 重连失败时设置 isDBConnected=false，UI显示"连接已断开，请刷新重试"提示
- [x] 3.5 验证后台唤醒后数据库操作正常

## 4. Feature - 笔记长按操作菜单

- [x] 4.1 为笔记列表项添加 onLongPress 事件处理
- [x] 4.2 实现 ActionSheet 展示，包含编辑笔记、设置为已完成、删除笔记三个选项
- [x] 4.3 实现编辑笔记功能：弹出Modal编辑标题和详情，调用NoteService保存
- [x] 4.4 实现标记完成功能：调用NoteService更新笔记状态为已完成
- [x] 4.5 实现删除笔记功能：确认后调用NoteService删除笔记
- [x] 4.6 验证长按操作各项功能正常工作
