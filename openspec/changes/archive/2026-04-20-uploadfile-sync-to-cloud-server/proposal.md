## Why

当前应用中的图片和文档上传功能存在两个核心问题：1）上传逻辑在多个 controller 中重复实现，维护困难；2）上传的文件仅保存在本地，换设备后文件丢失。通过将文件同步到云端存储，既能解决跨设备访问问题，也能统一上传逻辑。

## What Changes

1. 抽离通用上传逻辑到 common-controller
2. 新增云端同步 service（cloud-sync-service.ts），实现文件同步到云端
3. 数据库表增加 cloud_url 字段，本地失败后支持静默重试同步
4. 前端统一处理本地/云端链接显示，优先使用云端链接，图片/文档增加缓存设置
5. 添加同步校验的 API Key 机制
6. 上传接口返回给前端的数据格式需要同时包含本地链接和云端链接字段
7. 浏览器插件端上传后直接写入图片表的特殊处理需要纠正，走统一上传流程
8. 设计静默同步方案：通过本地 JSON 文件记录待同步列表，服务端定时扫描 + 实时重试机制

## Capabilities

### New Capabilities

- **file-upload-common**: 统一的文件上传接口，兼容图片和文档，支持本地存储和云端同步
- **cloud-sync-service**: 云端同步服务，负责将本地文件同步到云端，支持静默重试机制

### Modified Capabilities

- 无

## Impact

- **后端**: server/controllers 目录 - 新增 common-controller.ts，修改现有的 image/document controller 调用统一上传；server/services 新增 cloud-sync-service.ts
- **前端**: frontend/services - 调整图片/文档展示逻辑，优先使用云端链接，添加 HTTP 缓存头
- **浏览器插件**: browser-extension - 移除直接写入图片表逻辑，改为调用统一上传接口
- **数据库**: Picture 表和 Docs 表增加 cloud_url 字段
- **配置**: 新增云端存储配置（API Key、云端服务地址等）
- **静默同步**: 本地 JSON 文件记录待同步列表，server 启动时扫描 + 定时重试