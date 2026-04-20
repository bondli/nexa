## ADDED Requirements

### Requirement: 云端文件同步
系统 SHALL 提供云端同步服务，将本地文件同步到云端存储。

#### Scenario: 同步成功
- **WHEN** 云端同步服务接收本地文件路径和正确的 API Key
- **THEN** 系统将文件上传到云端，返回云端 URL，更新数据库 cloud_url 字段

#### Scenario: API Key 无效
- **WHEN** 调用同步接口时提供无效的 API Key
- **THEN** 系统返回 401 错误，拒绝请求

#### Scenario: 云端同步失败
- **WHEN** 云端同步服务调用失败（网络错误、服务不可用等）
- **THEN** 系统将任务写入 sync-queue.json 待同步列表，不阻塞主业务流程

### Requirement: 静默同步队列管理
系统 SHALL 通过本地 JSON 文件管理待同步任务列表。

#### Scenario: 写入待同步队列
- **WHEN** 云端同步失败
- **THEN** 系统将 {id, type, localPath, tableId, retryCount} 写入 sync-queue.json 的 pending 列表

#### Scenario: 服务启动扫描
- **WHEN** 服务启动
- **THEN** 系统扫描 sync-queue.json，对 pending 和 failed 列表（retryCount < 3）进行重试

#### Scenario: 定时扫描重试
- **WHEN** 每隔 5 分钟
- **THEN** 系统扫描 sync-queue.json，对 pending 列表中 retryCount < 3 的记录进行重试

#### Scenario: 重试成功清理
- **WHEN** 重试同步成功
- **THEN** 系统从队列移除该记录，更新数据库 cloud_url 字段

### Requirement: 静默后台同步
系统 SHALL 支持静默后台同步，当主流程完成后在后台尝试同步到云端。

#### Scenario: 后台静默同步
- **WHEN** 文件上传成功后，云端同步在后台执行
- **THEN** 同步失败不影响用户请求的响应，同步重试在后台进行

### Requirement: 云端链接存储
系统 SHALL 将云端返回的链接存储到数据库对应表中。

#### Scenario: 更新图片云端链接
- **WHEN** 图片同步成功
- **THEN** 系统更新 Picture 表的 cloud_url 字段

#### Scenario: 更新文档云端链接
- **WHEN** 文档同步成功
- **THEN** 系统更新 Docs 表的 cloud_url 字段

### Requirement: 静默重试机制
对于同步失败的场景，系统 SHALL 支持静默重试。

#### Scenario: 重试同步
- **WHEN** 上次同步失败后，系统 SHALL 定期重试同步操作
- **THEN** 重试成功后将 cloud_url 更新到数据库