## ADDED Requirements

### Requirement: 用户可以查看临时文章列表
系统 SHALL 允许用户查看通过外部渠道导入的临时文章。

#### Scenario: 查看临时文章列表
- **WHEN** 用户在 Article 页面选择"临时文章"分类
- **THEN** 系统 SHALL 返回临时文章列表，仅包含 url、加入时间

#### Scenario: 临时文章 URL 跳转
- **WHEN** 用户点击临时文章的 URL
- **THEN** 系统 SHALL 在默认浏览器中打开该 URL

### Requirement: 用户可以删除临时文章
系统 SHALL 允许用户删除临时文章（物理删除）。

#### Scenario: 删除临时文章
- **WHEN** 用户选中一个临时文章并点击删除按钮
- **THEN** 系统 SHALL 物理删除该临时文章

### Requirement: 外部渠道可以导入临时文章
系统 SHALL 允许通过 API 导入临时文章。

#### Scenario: 导入临时文章
- **WHEN** 外部渠道（如浏览器插件）调用临时文章导入接口
- **THEN** 系统 SHALL 创建新的临时文章记录