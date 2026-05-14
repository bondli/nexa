## ADDED Requirements

### Requirement: 笔记列表项点击能弹出详情Modal

笔记列表中的每一项在用户点击时必须弹出详情Modal显示笔记内容。

#### Scenario: 首次点击笔记项弹出Modal
- **WHEN** 用户首次进入笔记页面，点击任意笔记列表项
- **THEN** 系统必须立即弹出笔记详情Modal，显示该笔记的标题和内容

#### Scenario: 非首次点击笔记项也能弹出Modal
- **WHEN** 用户已经打开过Modal后，再次点击另一个笔记项
- **THEN** 系统必须弹出新点击笔记的详情Modal

#### Scenario: 文章页面同样支持点击弹出Modal
- **WHEN** 用户在文章页面点击任意文章列表项
- **THEN** 系统必须立即弹出文章详情Modal
