## ADDED Requirements

### Requirement: 用户可以一键提取当前页面内容
浏览器插件 SHALL 能够提取当前活动标签页的页面内容，并将其转换为 Markdown 格式。

#### Scenario: 成功提取页面内容
- **WHEN** 用户点击插件图标打开浮层面板，然后点击"一键提取"按钮
- **THEN** 插件 SHALL 提取当前页面的标题、URL 和主要内容，并将其转换为 Markdown 格式后填充到编辑器中

#### Scenario: 提取失败时显示错误
- **WHEN** 页面内容无法提取（如跨域限制页面）
- **THEN** 插件 SHALL 显示错误提示信息，告知用户提取失败

### Requirement: 提取内容可编辑
插件 SHALL 提供 Markdown 编辑器，允许用户在保存前编辑提取的内容。

#### Scenario: 编辑提取的内容
- **WHEN** 提取内容出现在编辑器中后
- **THEN** 用户 SHALL 能够在编辑器中修改内容

### Requirement: 用户可以选择笔记分类
插件 SHALL 提供分类选择器，允许用户选择将内容保存到哪个笔记分类下。

#### Scenario: 选择笔记分类
- **WHEN** 提取内容成功后
- **THEN** 分类选择器 SHALL 显示可用分类列表，用户 SHALL 能够选择目标分类

### Requirement: 用户可以将内容保存到笔记
插件 SHALL 能够将编辑后的内容和选择的分类发送到服务端保存。

#### Scenario: 保存内容到笔记
- **WHEN** 用户点击"保存到笔记"按钮
- **THEN** 插件 SHALL 调用服务端 API 保存内容，保存成功后 SHALL 显示成功提示

#### Scenario: 未登录时引导登录
- **WHEN** 用户未登录状态下点击"保存到笔记"按钮
- **THEN** 插件 SHALL 显示登录界面，用户完成登录后 SHALL 自动执行保存操作

### Requirement: 浮动面板布局规范
插件浮层面板 SHALL 按照特定布局规范显示。

#### Scenario: 面板显示在页面右侧
- **WHEN** 用户点击插件图标
- **THEN** 浮层面板 SHALL 固定显示在页面右侧

#### Scenario: 面板高度自适应
- **WHEN** 内容增加时
- **THEN** 面板高度 SHALL 随内容增加而增加，但最大不超过 1000px

### Requirement: 插件需要登录态校验
插件 SHALL 校验用户登录状态，未登录时提供登录入口。

#### Scenario: 检查登录态
- **WHEN** 插件启动或用户执行需要登录的操作时
- **THEN** 插件 SHALL 检查存储的登录态 token 是否有效

#### Scenario: 登录态过期
- **WHEN** 存储的 token 无效或已过期
- **THEN** 插件 SHALL 清除本地存储的登录态并显示登录界面