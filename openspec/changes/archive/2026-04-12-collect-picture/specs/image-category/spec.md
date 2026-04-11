## ADDED Requirements

### Requirement: 获取图片分类列表
系统 SHALL 提供获取用户图片分类列表的接口。

#### Scenario: 获取所有图片分类
- **WHEN** 前端请求获取图片分类列表
- **THEN** 服务端 SHALL 返回当前用户的所有图片分类，包含 id、name、icon、orders、counts 信息

### Requirement: 创建图片分类
系统 SHALL 提供创建新图片分类的功能。

#### Scenario: 成功创建分类
- **WHEN** 用户提交新分类名称
- **THEN** 服务端 SHALL 创建新分类并返回分类信息，counts 初始为 0

#### Scenario: 分类名称不能为空
- **WHEN** 用户提交空名称的分类
- **THEN** 服务端 SHALL 返回错误提示，分类创建失败

### Requirement: 更新图片分类
系统 SHALL 提供更新图片分类信息的功能。

#### Scenario: 更新分类名称
- **WHEN** 用户提交分类的新名称
- **THEN** 服务端 SHALL 更新分类名称并返回更新后的信息

### Requirement: 删除图片分类
系统 SHALL 提供删除图片分类的功能。

#### Scenario: 删除分类
- **WHEN** 用户请求删除某个分类
- **THEN** 服务端 SHALL 删除该分类，并将该分类下图片的 categoryId 设置为 null

#### Scenario: 删除不存在的分类
- **WHEN** 用户请求删除一个不存在的分类
- **THEN** 服务端 SHALL 返回错误提示