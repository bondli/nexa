## ADDED Requirements

### Requirement: 统一文件上传接口
系统 SHALL 提供一个统一的文件上传接口，支持图片和文档上传，并自动处理本地存储。

#### Scenario: 上传图片成功
- **WHEN** 用户调用 POST /api/common/upload 接口上传图片文件
- **THEN** 系统将文件保存到本地存储目录，并返回本地 URL 和文件路径

#### Scenario: 上传文档成功
- **WHEN** 用户调用 POST /api/common/upload 接口上传文档文件
- **THEN** 系统将文件保存到本地存储目录，并返回本地 URL 和文件路径

#### Scenario: 上传文件类型不支持
- **WHEN** 用户上传不允许的文件类型
- **THEN** 系统返回错误信息，提示允许的文件类型

#### Scenario: 上传文件大小超限
- **WHEN** 用户上传超过限制大小的文件
- **THEN** 系统返回错误信息，提示文件大小限制

### Requirement: 文件类型自动识别
系统 SHALL 根据文件扩展名自动识别上传文件是图片还是文档。

#### Scenario: 识别为图片
- **WHEN** 上传 .jpg, .jpeg, .png, .gif, .webp, .bmp 文件
- **THEN** 系统识别为图片类型

#### Scenario: 识别为文档
- **WHEN** 上传 .pdf, .doc, .docx, .txt, .md 文件
- **THEN** 系统识别为文档类型

### Requirement: 返回统一的数据格式
上传接口 SHALL 返回包含本地 URL、云端 URL 和文件路径的统一数据格式。

#### Scenario: 返回格式验证
- **WHEN** 上传成功
- **THEN** 返回 { localUrl: string, cloudUrl: string | null, filePath: string, fileType: 'image' | 'document', tableId: number }

#### Scenario: 云端同步成功
- **WHEN** 上传成功后云端同步成功
- **THEN** cloudUrl 字段有值，数据库 cloud_url 字段已更新

#### Scenario: 云端同步失败
- **WHEN** 上传成功但云端同步失败
- **THEN** cloudUrl 为 null，文件进入静默重试队列