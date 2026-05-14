## Why

手机客户端存在两个影响使用的bug：首次进入笔记页面点击笔记无响应，以及后台唤醒后数据库连接断开导致操作失败。同时缺少笔记的常用操作功能（编辑、标记完成、删除），影响用户效率。

## What Changes

1. **Bugfix - 笔记Modal首次点击无响应**：修复笔记列表点击笔记无法弹出详情的Modal的问题
2. **Bugfix - 数据库连接断开恢复**：修复App进入后台后数据库连接断开的问题，支持自动重连或友好提示
3. **Feature - 笔记长按操作**：新增笔记的长按操作菜单，支持编辑、标记完成、删除三个功能
4. **Feature - 文章页面同样问题**：文章页面存在同样的Modal首次点击无响应问题，也需修复

## Capabilities

### New Capabilities

- `note-item-modal`: 修复笔记列表项点击事件，确保首次点击能正常弹出详情Modal
- `article-item-modal`: 修复文章列表项点击事件，确保首次点击能正常弹出详情Modal
- `database-reconnection`: 数据库连接断开后自动重连机制，支持前台唤醒时检测并恢复连接
- `note-long-press-actions`: 笔记长按操作功能，支持通过ActionSheet展示编辑、标记完成、删除选项

### Modified Capabilities

- 无

## Impact

- 影响代码：`client-app/src/pages/Main/Note` 目录下的组件
- 相关模块：笔记服务、数据持久层、App生命周期管理
