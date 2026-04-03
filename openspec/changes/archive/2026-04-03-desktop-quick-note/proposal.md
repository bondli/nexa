## Why

用户需要一种快速记录笔记的方式，目前需要先打开应用才能记录笔记，流程繁琐。通过在系统托盘添加"快速笔记"入口，用户可以直接弹出快速笔记窗口，无需先启动主应用，提升效率。

## What Changes

- 在 macOS 系统托盘添加"快速笔记"菜单项
- 创建快速笔记弹窗界面（React + Antd6）
- 快速笔记弹窗调用后端 API 保存笔记数据
- 笔记保存成功后自动关闭弹窗

## Capabilities

### New Capabilities

- `desktop-quick-note`: 系统托盘快速笔记功能，用户点击托盘图标选择"快速笔记"后弹出笔记输入窗口，提交后保存到后端

### Modified Capabilities

- 无

## Impact

- **前端**: 新增 `frontend/components/QuickNote` 组件
- **后端**: 复用现有的 `/note/add` 接口保存笔记
- **Electron**: 修改托盘菜单，添加"快速笔记"入口