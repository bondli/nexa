## 1. 数据库变更

- [x] 1.1 为 Picture 表增加 cloud_url 字段（ VARCHAR，存储云端链接）
- [x] 1.2 为 Docs 表增加 cloud_url 字段（ VARCHAR，存储云端链接）
- [x] 1.3 更新 Picture 模型类型定义
- [x] 1.4 更新 Docs 模型类型定义

## 2. 后端 - 统一上传接口

- [x] 2.1 在 common-controller.ts 中抽离通用上传逻辑
- [x] 2.2 添加 uploadFile 统一接口，上传后同步云端
- [x] 2.3 更新路由配置，注册新的上传接口
- [x] 2.4 上传接口返回：name, size, type, path, cloudUrl
- [x] 2.5 同步失败写入队列，静默重试

## 3. 后端 - 云端同步服务

- [x] 3.1 创建 cloud-sync-service.ts 服务
- [x] 3.2 实现同步到云端的 HTTP 请求方法
- [x] 3.3 添加 API Key 校验机制
- [x] 3.4 实现静默重试机制（sync-queue.json 队列管理）
- [x] 3.5 通过 localPath 查找记录并更新 cloudUrl

## 4. 后端 - 静默同步队列

- [x] 4.1 设计并创建 sync-queue.json 队列文件结构
- [x] 4.2 实现队列写入逻辑（同步失败时写入 pending）
- [x] 4.3 实现服务启动时扫描队列
- [x] 4.4 实现定时扫描任务（每5分钟）
- [x] 4.5 实现重试成功后的清理逻辑

## 5. 后端 - 创建记录接口

- [x] 5.1 创建 Picture 记录时接受 cloudUrl 参数
- [x] 5.2 创建 Docs 记录时接受 cloudUrl 参数

## 6. 前端 - 图片/文档展示

- [x] 6.1 修改前端图片展示组件，优先使用 cloudUrl
- [x] 6.2 修改前端文档展示组件，优先使用 cloudUrl
- [x] 6.3 添加本地 URL 降级逻辑
- [x] 6.4 添加 HTTP 缓存头设置

## 7. 前端/插件 - 上传流程

- [x] 7.1 前端上传图片后创建记录时传递 cloudUrl
- [x] 7.2 浏览器插件上传后创建记录时传递 cloudUrl

## 8. 配置与工具

- [x] 8.1 在配置文件中添加云端存储配置（API Key、服务地址）
- [ ] 8.2 可选：添加存量数据同步脚本