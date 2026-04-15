## ADDED Requirements

### Requirement: 用户可以通过微信分享文章到 Nexa
用户在微信中浏览文章时，选择"更多打开方式"，然后选择 Nexa 应用，Nexa 被唤起后展示分享接收页面。

#### Scenario: 微信分享文章到 Nexa
- **WHEN** 用户在微信中选择"更多打开方式"→选择 Nexa 应用，传递文章标题和 URL
- **THEN** Nexa 应用被唤起，打开分享接收页面，页面展示文章标题和 URL

#### Scenario: 分享接收页面展示
- **WHEN** 分享接收页面打开
- **THEN** 页面显示文章标题、URL，提供"保存"按钮

#### Scenario: 用户点击保存按钮
- **WHEN** 用户在分享接收页面点击"保存"按钮
- **THEN** 调用 `shareToTempArticle` 方法将 title 和 url 保存到 TempArticle 表

#### Scenario: 保存成功
- **WHEN** title 和 url 都有效且保存成功
- **THEN** 显示保存成功提示，跳转到临时文章列表页

#### Scenario: URL 参数无效
- **WHEN** 传递的 URL 参数为空或无效
- **THEN** 显示错误提示，无法保存

### Requirement: 临时文章在列表中展示标题和 URL
临时文章列表中的每一项需要清晰展示文章标题和 URL，与普通文章有所区分。

#### Scenario: RN 端展示临时文章
- **WHEN** 用户查看临时文章列表
- **THEN** 每条临时文章显示：标题（title 字段）和 URL（url 字段），标题优先展示

#### Scenario: Desktop 端展示临时文章
- **WHEN** 用户在 Desktop 端查看临时文章列表
- **THEN** 每条临时文章在标题位置显示 title（如果存在）或 URL，描述位置显示加入时间

### Requirement: 点击临时文章打开原文章
用户点击临时文章时，应该在浏览器中打开原始文章 URL，而不是进入详情页。

#### Scenario: RN 端点击临时文章
- **WHEN** 用户点击临时文章列表中的某一项
- **THEN** 调用系统浏览器打开该文章的 URL

#### Scenario: Desktop 端点击临时文章
- **WHEN** 用户点击临时文章列表中的某一项
- **THEN** 在浏览器中打开该文章的 URL（与点击 URL 链接行为一致）

### Requirement: 临时文章的 Actions 只显示删除功能
临时文章的右侧操作栏只显示删除按钮，不显示其他操作。

#### Scenario: Desktop 端临时文章 Actions 显示
- **WHEN** 临时文章列表渲染时
- **THEN** Actions 组件只显示删除按钮，不显示恢复/编辑等按钮

#### Scenario: 临时文章删除
- **WHEN** 用户点击临时文章的删除按钮
- **THEN** 执行软删除（status 设为 deleted），文章进入回收站

### Requirement: 临时文章支持回收站恢复
删除的临时文章可以在回收站中恢复。

#### Scenario: 从回收站恢复临时文章
- **WHEN** 用户在回收站中恢复一篇临时文章
- **THEN** 该文章 status 恢复为 normal，回到临时文章列表