# dark-mode-ui-adaptation

## ADDED Requirements

### Requirement: 全局页面支持暗黑模式

所有全局页面（登录页、安装页、快速笔记页、截图快存页）应支持主题切换，在亮色和暗色模式下均有正确的视觉表现。

系统应使用 `ThemeProvider` 提供的 Ant Design ConfigProvider 实现主题切换。

### Requirement: UserPage 暗黑模式支持

UserPage（登录/注册页面）应被 `ThemeProvider` 包裹以支持主题切换。

页面样式应使用 CSS 变量（`var(--ant-color-bg-container)` 等），确保在主题切换时自动响应。

#### Scenario: 用户在浅色模式下访问登录页

- **WHEN** 用户在系统设置为浅色模式时访问登录页
- **THEN** 页面背景为浅色，文字为深色，所有表单元素符合浅色主题规范

#### Scenario: 用户在暗色模式下访问登录页

- **WHEN** 用户在系统设置为暗色模式时访问登录页
- **THEN** 页面背景为深色，文字为浅色，所有表单元素符合暗色主题规范

### Requirement: BootPage 暗黑模式支持

BootPage（安装页面）应被 `ThemeProvider` 包裹以支持主题切换。

页面样式应使用 CSS 变量，确保在主题切换时自动响应。

#### Scenario: 用户在浅色模式下访问安装页

- **WHEN** 用户在系统设置为浅色模式时访问安装页
- **THEN** 页面背景为浅色，文字为深色，表单元素符合浅色主题规范

#### Scenario: 用户在暗色模式下访问安装页

- **WHEN** 用户在系统设置为暗色模式时访问安装页
- **THEN** 页面背景为深色，文字为浅色，表单元素符合暗色主题规范

### Requirement: QuickNote 暗黑模式支持

QuickNote（快速笔记弹窗）应支持浅色和暗色模式。

由于 QuickNote 运行在独立 Electron 窗口中无法访问 React Context，应使用 CSS 变量 + `data-theme` 属性实现主题支持。

#### Scenario: 用户在浅色模式下打开快速笔记

- **WHEN** 用户在浅色模式下打开快速笔记窗口
- **THEN** 窗口背景为浅色（`#ffffff` 或接近），文字为深色，textarea 为浅色背景

#### Scenario: 用户在暗色模式下打开快速笔记

- **WHEN** 用户在暗色模式下打开快速笔记窗口
- **THEN** 窗口背景为深色（`#18181b`），文字为浅色，textarea 为深色背景

### Requirement: CaptureSave 暗黑模式支持

CaptureSave（截图快存弹窗）应支持浅色和暗色模式。

由于 CaptureSave 运行在独立 Electron 窗口中无法访问 React Context，应使用 CSS 变量 + `data-theme` 属性实现主题支持。

#### Scenario: 用户在浅色模式下使用截图快存

- **WHEN** 用户在浅色模式下打开截图快存窗口
- **THEN** 窗口背景为浅色，所有文字为深色，表单元素符合浅色主题规范

#### Scenario: 用户在暗色模式下使用截图快存

- **WHEN** 用户在暗色模式下打开截图快存窗口
- **THEN** 窗口背景为深色，所有文字为浅色，表单元素符合暗色主题规范

### Requirement: 主题状态持久化

主题设置应持久化保存，用户关闭应用后重新打开，主题设置应保持不变。

#### Scenario: 用户设置主题后关闭应用

- **WHEN** 用户设置主题为暗色模式后关闭应用
- **THEN** 下次打开应用时，主题仍为暗色模式
