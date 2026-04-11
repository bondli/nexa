## ADDED Requirements

### Requirement: 图片管理页面入口
系统 SHALL 提供图片管理页面的入口，用户能够访问图片管理功能。

#### Scenario: 访问图片页面
- **WHEN** 用户在侧边栏点击"图片"菜单项
- **THEN** 系统 SHALL 加载并显示图片管理页面

### Requirement: 左侧分类导航
图片管理页面 SHALL 显示左侧分类导航，与笔记分类交互形式一致。

#### Scenario: 显示图片分类列表
- **WHEN** 用户打开图片管理页面
- **THEN** 页面 SHALL 左侧显示图片分类列表，包含"全部图片"和所有自定义分类

#### Scenario: 点击分类筛选图片
- **WHEN** 用户点击某个图片分类
- **THEN** 右侧图片列表 SHALL 仅显示该分类下的图片，当前选中的分类 SHALL 高亮显示

#### Scenario: 显示分类下图片数量
- **WHEN** 分类列表显示时
- **THEN** 每个分类 SHALL 显示该分类下的图片数量

### Requirement: 图片列表展示
图片管理页面 SHALL 在右侧展示图片列表，使用 Card 组件展示。

#### Scenario: 显示图片卡片列表
- **WHEN** 用户打开图片管理页面或切换分类
- **THEN** 右侧 SHALL 显示图片卡片列表，每张图片以卡片形式展示

#### Scenario: 图片按时间倒序排列
- **WHEN** 图片列表加载时
- **THEN** 图片 SHALL 按照创建时间倒序排列，最新的图片显示在最前面

#### Scenario: 图片卡片显示内容
- **WHEN** 图片卡片渲染时
- **THEN** 卡片 SHALL 显示：图片缩略图（固定大小）、图片名称、图片描述（如有）

### Requirement: 删除图片
用户 SHALL 能够删除不需要的图片。

#### Scenario: 删除图片
- **WHEN** 用户点击图片卡片上的删除按钮
- **THEN** 系统 SHALL 弹出确认对话框，用户确认后 SHALL 删除该图片并更新列表

### Requirement: 查看大图
用户 SHALL 能够查看图片的大图详情。

#### Scenario: 点击图片查看大图
- **WHEN** 用户点击图片卡片
- **THEN** 系统 SHALL 弹出图片预览模态框，显示原图大小的图片

#### Scenario: 关闭大图预览
- **WHEN** 用户点击预览模态框的关闭按钮或模态框外部
- **THEN** 系统 SHALL 关闭图片预览模态框

### Requirement: 新增图片分类
用户 SHALL 能够在图片管理页面新增图片分类。

#### Scenario: 新增分类
- **WHEN** 用户点击分类列表的新增按钮
- **THEN** 系统 SHALL 显示新建分类的输入框，用户输入名称后 SHALL 创建新分类

### Requirement: 编辑图片分类
用户 SHALL 能够编辑已有的图片分类名称。

#### Scenario: 编辑分类名称
- **WHEN** 用户右键点击某个分类或点击编辑按钮
- **THEN** 系统 SHALL 显示编辑输入框，用户可修改分类名称

### Requirement: 删除图片分类
用户 SHALL 能够删除不需要的图片分类。

#### Scenario: 删除分类
- **WHEN** 用户点击某个分类的删除按钮
- **THEN** 系统 SHALL 弹出确认对话框，用户确认后 SHALL 删除该分类（可选择是否同时删除分类下的图片）