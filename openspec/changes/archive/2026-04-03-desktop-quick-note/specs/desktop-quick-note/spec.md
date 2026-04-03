## ADDED Requirements

### Requirement: 快速笔记入口
系统 SHALL 在 macOS 系统托盘菜单中提供"快速笔记"入口，用户点击后 SHALL 弹出快速笔记窗口。

#### Scenario: 点击快速笔记菜单
- **WHEN** 用户点击托盘图标并选择"快速笔记"
- **THEN** 系统 SHALL 弹出快速笔记输入窗口

### Requirement: 快速笔记输入
系统 SHALL 提供一个文本输入区域供用户输入笔记内容，并 SHALL 支持提交和取消操作。

#### Scenario: 输入笔记内容
- **WHEN** 用户在快速笔记窗口的文本框中输入内容
- **THEN** 系统 SHALL 实时显示用户输入的内容

#### Scenario: 提交笔记
- **WHEN** 用户点击"保存"按钮
- **THEN** 系统 SHALL 调用后端 `/note/add` 接口保存笔记
- **AND** 保存成功后 SHALL 关闭快速笔记窗口

#### Scenario: 取消输入
- **WHEN** 用户点击"取消"按钮
- **THEN** 系统 SHALL 关闭快速笔记窗口而不保存内容

### Requirement: 快速笔记窗口样式
- 快速笔记窗口 SHALL 呈现简洁的界面
- 界面大概是：
  - 输入框  - 标题区域
  - 操作按钮（保存）
  - 窗口大小为 400x300px

#### Scenario: 窗口展示
- **WHEN** 快速笔记窗口打开
- **THEN** 窗口 SHALL 显示标题区域、文本输入区域和操作按钮