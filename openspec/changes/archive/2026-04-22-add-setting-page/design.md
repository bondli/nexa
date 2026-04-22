## Context

目前应用配置分散在 5 个独立 JSON 文件中：
- `~/.nexa/setting.json` - 通用设置
- `~/.nexa/llm.json` - LLM 配置
- `~/.nexa/embedding.json` - Embedding 配置
- `~/.nexa/qdrant.json` - Qdrant 向量数据库配置
- `~/.nexa/api.json` - 第三方 API 配置（云同步等）

这些配置需要通过设置页面统一管理，提升用户体验。

## Goals / Non-Goals

**Goals:**
1. 提供统一的设置管理 UI，用户可在应用内直接修改配置
2. 将 5 个配置文件合并为 1 个 `config.json`
3. 实现配置的读取和保存功能
4. 与现有 Electron 架构兼容

**Non-Goals:**
- 不修改现有服务的配置加载逻辑（后续迭代）
- 不涉及数据库配置的修改
- 不添加新的外部依赖

## Decisions

### 1. 配置合并方案
将 5 个配置文件合并为 `~/.nexa/config.json`，包含以下结构：
```json
{
  "setting": { ... },
  "llm": { ... },
  "embedding": { ... },
  "qdrant": { ... },
  "api": { ... }
}
```

### 2. 前端架构
- 新增 `Setting` 组件（`frontend/components/Setting`）
- 组件内部包含设置图标（Icon）和 Drawer 组件
- 点击图标后在组件内部控制 Drawer 的打开/关闭
- 使用 `Form` 组件实现分组表单
- 创建 `settingService.ts` 处理业务逻辑
- Setting 组件放置在 MainPage 中 User 组件的上方

### 3. 后端架构
- 新增 `settings` 控制器（`server/controllers/settings-controller.ts`）
- 新增路由 `/api/settings/get` 和 `/api/settings/save`
- 保持向后兼容，读取时支持旧的 5 个配置文件并迁移

### 4. 配置迁移策略
- 首次读取时检查旧配置文件是否存在
- 如存在则合并到新的 `config.json` 并备份旧文件
- 如不存在则创建新的 `config.json`

## Risks / Trade-offs

- [风险] 旧配置文件迁移可能丢失数据 → **缓解**：读取时优先使用旧文件，确保数据不丢失
- [风险] 配置格式变更导致服务重启后配置不生效 → **缓解**：服务启动时自动加载合并后的配置
- [权衡] UI 复杂度 vs 用户体验 → 决定使用分组表单，每个分组可折叠