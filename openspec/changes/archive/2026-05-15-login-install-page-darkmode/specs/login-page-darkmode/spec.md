# login-page-darkmode

登录页面暗黑模式支持规范

## ADDED Requirements

### Requirement: 登录页面暗黑模式样式

登录页面 (UserPage) SHALL 支持暗黑模式，与系统主题或手动切换同步。

#### Scenario: 跟随系统暗黑模式
- **WHEN** 用户设置主题为"跟随系统"且系统处于暗黑模式
- **THEN** 登录页面自动切换到暗黑模式，背景色、文字颜色等使用对应的 CSS 变量

#### Scenario: 手动切换暗黑模式
- **WHEN** 用户在设置中手动切换到暗黑模式
- **THEN** 登录页面立即切换到暗黑模式，无需刷新页面

#### Scenario: 切换回亮色模式
- **WHEN** 用户切换回亮色模式
- **THEN** 登录页面立即切换到亮色模式

### Requirement: 登录页面 TitleBar 占位

登录页面 SHALL 在页面顶部包含 TitleBar 组件，用于在 Electron 无原生 titlebar 时进行占位。

#### Scenario: TitleBar 正确显示
- **WHEN** 用户进入登录页面
- **THEN** TitleBar 组件正确显示在页面顶部，高度 27px，背景色跟随当前主题

#### Scenario: TitleBar 主题同步
- **WHEN** 登录页面主题切换时
- **THEN** TitleBar 组件同步切换暗黑/亮色样式
