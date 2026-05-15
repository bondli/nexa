# install-page-darkmode

安装页面暗黑模式支持规范

## ADDED Requirements

### Requirement: 安装页面暗黑模式样式

安装页面 (BootPage) SHALL 支持暗黑模式，与系统主题或手动切换同步。

#### Scenario: 跟随系统暗黑模式
- **WHEN** 用户设置主题为"跟随系统"且系统处于暗黑模式
- **THEN** 安装页面自动切换到暗黑模式，背景色、表单项样式等使用对应的 CSS 变量

#### Scenario: 手动切换暗黑模式
- **WHEN** 用户在设置中手动切换到暗黑模式
- **THEN** 安装页面立即切换到暗黑模式，无需刷新页面

#### Scenario: 切换回亮色模式
- **WHEN** 用户切换回亮色模式
- **THEN** 安装页面立即切换到亮色模式

### Requirement: 安装页面 TitleBar 占位

安装页面 SHALL 在页面顶部包含 TitleBar 组件，用于在 Electron 无原生 titlebar 时进行占位。

#### Scenario: TitleBar 正确显示
- **WHEN** 用户进入安装页面
- **THEN** TitleBar 组件正确显示在页面顶部，高度 27px，背景色跟随当前主题

#### Scenario: TitleBar 主题同步
- **WHEN** 安装页面主题切换时
- **THEN** TitleBar 组件同步切换暗黑/亮色样式

### Requirement: 安装页面表单暗黑模式

安装页面的数据库配置表单 SHALL 在暗黑模式下正常显示。

#### Scenario: 表单输入框暗黑模式
- **WHEN** 页面处于暗黑模式
- **THEN** 表单输入框、标签、按钮等使用暗黑模式配色

#### Scenario: 表单验证错误提示
- **WHEN** 表单验证失败且处于暗黑模式
- **THEN** 错误提示使用适合暗黑模式的颜色
