## ADDED Requirements

### Requirement: 笔记列表支持分页加载
后端笔记接口 SHALL 支持 `limit` 和 `offset` 查询参数，以实现分页加载。

#### Scenario: 默认分页查询
- **WHEN** 前端请求笔记列表且不传 limit/offset 参数
- **THEN** 后端返回默认分页结果（limit=20, offset=0）

#### Scenario: 指定分页参数查询
- **WHEN** 前端请求笔记列表且传入 limit=10&offset=20
- **THEN** 后端返回第3页的10条数据

### Requirement: 前端触底加载更多
笔记、文章、图片页面 SHALL 实现触底自动加载更多功能。

#### Scenario: 触底加载更多笔记
- **WHEN** 用户滚动到笔记列表底部
- **THEN** 系统自动加载下一页数据并追加到列表底部

#### Scenario: 触底加载更多文章
- **WHEN** 用户滚动到文章列表底部
- **THEN** 系统自动加载下一页数据并追加到列表底部

#### Scenario: 触底加载更多图片
- **WHEN** 用户滚动到图片列表底部
- **THEN** 系统自动加载下一页数据并追加到列表底部

### Requirement: 加载状态展示
页面 SHALL 在加载更多时展示加载状态指示。

#### Scenario: 加载中显示加载指示器
- **WHEN** 触底触发加载更多且数据加载中
- **THEN** 页面底部显示加载指示器

#### Scenario: 无更多数据停止加载
- **WHEN** 已加载数据达到总数
- **THEN** 不再触发加载，且显示"没有更多数据"提示