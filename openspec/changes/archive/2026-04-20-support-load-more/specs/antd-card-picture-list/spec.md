## ADDED Requirements

### Requirement: 图片列表使用 Antd Card 组件
图片列表 SHALL 使用 Ant Design Card 组件进行布局重构。

#### Scenario: 使用 Antd Card 展示图片
- **WHEN** 图片列表渲染时
- **THEN** 每个图片使用 Antd Card 组件展示，包含图片缩略图和名称

#### Scenario: 卡片点击交互
- **WHEN** 用户点击图片卡片
- **THEN** 触发原有的图片预览或详情逻辑

### Requirement: 样式清理
图片页面 SHALL 清理不再使用的 CSS 样式。

#### Scenario: 移除冗余样式
- **WHEN** 图片列表切换到 Antd Card 布局后
- **THEN** 移除 index.module.less 中不再使用的样式类