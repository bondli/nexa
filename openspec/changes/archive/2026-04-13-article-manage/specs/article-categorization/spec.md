## ADDED Requirements

### Requirement: 用户可以查看文章分类列表
系统 SHALL 允许用户查看其所有文章分类。

#### Scenario: 查看分类列表
- **WHEN** 用户进入 Article 页面
- **THEN** 系统 SHALL 返回用户的所有文章分类列表（不包括虚拟分类）

#### Scenario: 左侧固定虚拟分类
- **WHEN** 用户查看左侧分类栏
- **THEN** 系统 SHALL 显示固定的三项虚拟分类：全部文章、临时文章、回收站

### Requirement: 用户可以创建文章分类
系统 SHALL 允许用户创建新的文章分类。

#### Scenario: 创建分类
- **WHEN** 用户点击新建分类按钮并填写分类名称后确认
- **THEN** 系统 SHALL 创建新分类并返回成功提示

### Requirement: 用户可以编辑文章分类
系统 SHALL 允许用户编辑已有分类的名称。

#### Scenario: 编辑分类名称
- **WHEN** 用户选中一个分类并修改名称后保存
- **THEN** 系统 SHALL 更新分类名称并返回成功提示

### Requirement: 用户可以删除文章分类
系统 SHALL 允许用户删除文章分类。

#### Scenario: 删除分类
- **WHEN** 用户选中一个分类并点击删除按钮
- **THEN** 系统 SHALL 删除该分类（若该分类下有文章，文章移动到默认分类）