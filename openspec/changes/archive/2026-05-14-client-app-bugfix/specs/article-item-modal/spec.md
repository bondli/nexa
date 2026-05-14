## ADDED Requirements

### Requirement: 文章列表项点击能弹出详情Modal

文章列表中的每一项在用户点击时必须弹出详情Modal显示文章内容。

#### Scenario: 首次点击文章项弹出Modal
- **WHEN** 用户首次进入文章页面，点击任意文章列表项
- **THEN** 系统必须立即弹出文章详情Modal，显示该文章的标题和内容

#### Scenario: 非首次点击文章项也能弹出Modal
- **WHEN** 用户已经打开过Modal后，再次点击另一篇文章
- **THEN** 系统必须弹出新点击文章的详情Modal
