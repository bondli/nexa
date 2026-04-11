## ADDED Requirements

### Requirement: 上传图片
系统 SHALL 提供图片上传功能，使用已有的 /common/uploadImage 接口。

#### Scenario: 上传图片文件
- **WHEN** 前端调用 /common/uploadImage 接口上传图片文件
- **THEN** 服务端 SHALL 将图片保存到指定目录并返回图片路径

### Requirement: 创建图片记录
系统 SHALL 提供创建图片记录的功能，将图片信息保存到数据库。

#### Scenario: 保存图片信息
- **WHEN** 前端提交图片信息（path、name、description、categoryId）
- **THEN** 服务端 SHALL 创建图片记录，返回图片信息

#### Scenario: 创建图片时更新分类计数
- **WHEN** 图片创建成功且关联了分类
- **THEN** 服务端 SHALL 将对应分类的 counts 字段加 1

### Requirement: 获取图片列表
系统 SHALL 提供获取图片列表的接口。

#### Scenario: 获取所有图片
- **WHEN** 前端请求获取图片列表
- **THEN** 服务端 SHALL 返回当前用户的所有图片，按创建时间倒序排列

#### Scenario: 按分类获取图片
- **WHEN** 前端指定 categoryId 参数请求图片列表
- **THEN** 服务端 SHALL 仅返回该分类下的图片

#### Scenario: 分页获取图片
- **WHEN** 前端请求图片列表时指定分页参数
- **THEN** 服务端 SHALL 返回对应页的图片数据

### Requirement: 获取单个图片详情
系统 SHALL 提供获取单张图片详情的功能。

#### Scenario: 获取图片详情
- **WHEN** 前端请求某张图片的详情
- **THEN** 服务端 SHALL 返回图片的完整信息（id、path、name、description、categoryId、createdAt、updatedAt）

### Requirement: 删除图片
系统 SHALL 提供删除图片的功能。

#### Scenario: 删除图片记录
- **WHEN** 前端请求删除某张图片
- **THEN** 服务端 SHALL 删除图片记录

#### Scenario: 删除图片时更新分类计数
- **WHEN** 图片删除成功且关联了分类
- **THEN** 服务端 SHALL 将对应分类的 counts 字段减 1

#### Scenario: 删除不存在的图片
- **WHEN** 用户请求删除一张不存在的图片
- **THEN** 服务端 SHALL 返回错误提示

### Requirement: 更新图片信息
系统 SHALL 提供更新图片信息的功能。

#### Scenario: 更新图片描述
- **WHEN** 前端提交图片的新描述
- **THEN** 服务端 SHALL 更新图片的 description 字段

#### Scenario: 移动图片到其他分类
- **WHEN** 前端提交图片的新分类ID
- **THEN** 服务端 SHALL 更新图片的 categoryId，并调整原分类和新分类的 counts