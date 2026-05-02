## ADDED Requirements

### Requirement: 图片列表展示

系统 SHALL 提供图片列表页面，以卡片布局展示图片，每行显示 3 张图片。

#### Scenario: 进入图片列表页面
- **WHEN** 用户点击底部导航栏的图片入口
- **THEN** 系统展示图片列表页面，加载并显示所有图片卡片

#### Scenario: 滚动加载更多图片
- **WHEN** 用户滚动到图片列表底部
- **THEN** 系统自动加载下一页图片数据并追加展示

#### Scenario: 点击图片查看大图
- **WHEN** 用户点击任意一张图片卡片
- **THEN** 系统以大图模式展示该图片，支持手势缩放和关闭

#### Scenario: 无图片时显示空状态
- **WHEN** 用户进入图片列表且无任何图片
- **THEN** 系统展示空状态提示

### Requirement: 图片数据结构

图片列表中的每项 SHALL 包含以下字段：id、path（图片地址）、name（图片名称）、createdAt（创建时间）。
