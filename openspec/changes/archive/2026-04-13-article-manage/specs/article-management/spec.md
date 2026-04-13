## ADDED Requirements

### Requirement: 用户可以查看文章列表
系统 SHALL 允许用户查看其所有文章，支持分页、搜索和排序。

#### Scenario: 查看全部文章列表
- **WHEN** 用户进入 Article 页面并选择"全部文章"分类
- **THEN** 系统 SHALL 返回按创建时间倒序排列的文章列表，每页返回指定数量的文章

#### Scenario: 分页加载文章
- **WHEN** 用户滚动到页面底部或点击分页控件
- **THEN** 系统 SHALL 加载下一页文章数据

#### Scenario: 搜索文章
- **WHEN** 用户在搜索框输入关键词并提交搜索
- **THEN** 系统 SHALL 返回标题包含关键词的文章列表

#### Scenario: 临时文章列表展示
- **WHEN** 用户选择"临时文章"分类
- **THEN** 系统 SHALL 仅展示 URL 和加入时间，点击 URL 可跳转到浏览器打开

### Requirement: 用户可以查看文章详情
系统 SHALL 允许用户查看文章的详细内容。

#### Scenario: 查看文章详情
- **WHEN** 用户点击文章标题
- **THEN** 系统 SHALL 打开详情抽屉，展示 Markdown 渲染后的文章内容

#### Scenario: 文章 URL 跳转
- **WHEN** 用户点击文章标题后的 URL 图标
- **THEN** 系统 SHALL 在浏览器中打开该文章的 URL

### Requirement: 用户可以编辑文章
系统 SHALL 允许用户编辑已有文章的内容。

#### Scenario: 编辑文章内容
- **WHEN** 用户在文章详情页点击编辑按钮
- **THEN** 系统 SHALL 显示 Markdown 编辑器，预填当前文章内容

#### Scenario: 保存编辑后的文章
- **WHEN** 用户编辑完成并点击保存按钮
- **THEN** 系统 SHALL 更新文章内容并返回成功提示

### Requirement: 用户可以创建新文章
系统 SHALL 允许用户创建新的文章。

#### Scenario: 创建新文章
- **WHEN** 用户点击新建按钮并填写文章标题、URL 和内容后点击保存
- **THEN** 系统 SHALL 创建新文章并返回成功提示

### Requirement: 用户可以删除文章
系统 SHALL 允许用户删除文章，删除后进入回收站。

#### Scenario: 删除文章到回收站
- **WHEN** 用户点击文章删除按钮
- **THEN** 系统 SHALL 将文章状态标记为已删除，进入回收站

### Requirement: 用户可以恢复已删除文章
系统 SHALL 允许用户从回收站恢复文章。

#### Scenario: 从回收站恢复文章
- **WHEN** 用户在回收站选中一篇文章并点击恢复按钮
- **THEN** 系统 SHALL 将文章状态恢复为正常

### Requirement: 用户可以永久删除文章
系统 SHALL 允许用户从回收站永久删除文章。

#### Scenario: 永久删除文章
- **WHEN** 用户在回收站选中一篇文章并点击彻底删除按钮
- **THEN** 系统 SHALL 物理删除该文章

### Requirement: 用户可以移动文章分类
系统 SHALL 允许用户将文章移动到不同分类。

#### Scenario: 移动文章到分类
- **WHEN** 用户选择文章并选择目标分类
- **THEN** 系统 SHALL 更新文章的分类ID