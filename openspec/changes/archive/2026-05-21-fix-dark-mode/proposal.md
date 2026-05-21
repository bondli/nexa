## Why

系统已具备暗黑模式支持，但部分页面（登录页、安装页、快速笔记页、截图快存页）未适配暗黑模式，导致用户体验不一致。这些页面目前只支持单一模式，需要改造以适配全局主题切换。

## What Changes

- **UserPage（登录页面）**：适配暗黑模式，支持亮色/暗色切换
- **BootPage（安装页面）**：适配暗黑模式，支持亮色/暗色切换
- **QuickNote（快速笔记页面）**：修复写死黑色背景问题，支持浅色模式
- **CaptureSave（截图快存页面）**：修复写死黑色背景问题，支持浅色模式

## Capabilities

### New Capabilities

- `dark-mode-ui-adaptation`：全局UI组件暗黑模式适配能力，确保所有页面组件能够响应主题切换

### Modified Capabilities

<!-- 暗黑模式相关的能力目前没有独立的spec，这是一个纯实现性变更 -->

## Impact

**受影响的代码路径**：
- `frontend/modules/UserPage` - 登录页面
- `frontend/modules/BootPage` - 安装页面
- `frontend/blocks/QuickNote` - 快速笔记页面
- `frontend/blocks/CaptureSave` - 截图快存页面

**参考实现**：
- `frontend/components/ThemeProvider` - 已有主题Provider，直接复用
- `apps/web/src/main.tsx` - 已有的暗黑模式适配参考实现
