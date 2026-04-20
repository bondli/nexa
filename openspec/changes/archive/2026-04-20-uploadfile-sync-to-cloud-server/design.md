## Context

当前应用的文件上传功能存在以下问题：
1. **代码重复**: 图片上传逻辑在 `common-controller.ts`，文档上传逻辑在 `docs-controller.ts`，实现高度相似
2. **跨设备丢失**: 上传的文件仅保存在 Electron 应用本地目录，换设备后无法访问
3. **前端拼接混乱**: 前端展示时需要手动拼接本地服务器地址，逻辑不统一
4. **无云端备份**: 缺乏云端同步机制，数据安全性不足

项目约束：
- 后端使用 Express + Sequelize + MySQL
- 前端使用 React + TypeScript + Antd6
- 客户端使用 Electron

## Goals / Non-Goals

**Goals:**
- 抽离统一的文件上传逻辑到 common-controller
- 实现云端同步 service，支持静默重试
- 数据库增加云端链接字段，支持本地/云端双链接
- 前端统一使用云端链接展示，失败降级本地
- 添加 API Key 校验机制保护同步接口

**Non-Goals:**
- 不实现云端存储服务的具体实现（调用外部 API）
- 不改变现有的文件存储结构（本地仍保留）
- 不处理云端删除文件的场景

## Decisions

### 1. 统一上传入口
在 `common-controller.ts` 中抽离通用上传逻辑，提供 `uploadFile` 统一接口：
- 根据文件类型自动识别是图片还是文档
- 统一处理文件存储、URL 生成
- 返回本地路径和 URL

**替代方案考虑：**
- 在 service 层抽离：但 controller 层已有完整实现，移动到 service 需要较大改动
- 直接复用现有 controller：会导致代码重复

### 2. 云端同步架构
新增 `cloud-sync-service.ts`：
- 独立的同步服务，不阻塞主上传流程
- 支持静默后台同步，失败不影响用户
- 通过 API Key 校验调用者身份

### 2.1 静默同步方案设计
采用"本地 JSON 文件 + 定时扫描"方案：

**待同步文件记录** (`sync-queue.json`):
```json
{
  "pending": [
    { "id": 1, "type": "picture", "localPath": "/files/xxx.jpg", "tableId": 123, "retryCount": 0 }
  ],
  "processing": [],
  "failed": []
}
```

**同步触发机制**:
1. **实时触发**: 主流程上传成功后，立即尝试云端同步，失败则写入 sync-queue.json
2. **启动扫描**: server 启动时扫描 sync-queue.json，对 pending 和 failed 列表进行重试
3. **定时扫描**: 每 5 分钟扫描一次，对 retryCount < 3 的记录进行重试
4. **成功清理**: 同步成功后从队列移除，并更新数据库 cloud_url

**优势**:
- 不依赖数据库额外字段
- 持久化存储，重启服务不丢失
- 可追溯失败的同步任务

### 2.2 上传返回格式
统一返回格式包含本地和云端两个链接：
```typescript
{
  localUrl: string;    // 本地服务器 URL
  cloudUrl: string | null; // 云端 URL（同步成功才有值）
  filePath: string;    // 本地文件相对路径
  fileType: 'image' | 'document';
  tableId: number;     // 对应数据库记录 ID
}
```

### 2.3 浏览器插件特殊处理
当前浏览器插件（browser-extension）上传图片后直接写入图片表，写入的是本地链接。需要纠正为：
1. 浏览器插件调用统一上传接口
2. 接口返回本地链接和云端链接
3. 插件将本地链接写入图片表，云端链接通过单独的同步接口写入

### 3. 数据模型变更
- `Picture` 表增加 `cloud_url` 字段（云端链接）
- `Docs` 表增加 `cloud_url` 字段（云端链接）

### 4. 前端展示策略
- 组件中优先使用 `cloud_url`，如无则使用 `localUrl`
- HTTP 缓存头设置：Cache-Control: max-age=86400（1天），减少重复请求

### 5. API Key 校验
- 同步接口添加 x-api-key 请求头校验
- API Key 存储在服务端配置，不暴露给前端

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|---------|
| 云端同步失败导致数据不一致 | 本地优先，同步失败不影响主流程；后台静默重试 |
| API Key 泄露 | 存储在服务端配置，前端不暴露；定期轮换 |
| 大文件同步慢 | 同步在后台进行，不阻塞用户操作 |

## Migration Plan

1. **数据库迁移**：为 Picture 和 Docs 表添加 cloud_url 字段
2. **后端部署**：
   - 部署新的 common-controller
   - 部署 cloudSyncService
   - 更新路由配置
3. **前端部署**：更新图片/文档展示组件
4. **数据回填**：针对存量数据，可通过定时任务扫描本地文件并同步到云端