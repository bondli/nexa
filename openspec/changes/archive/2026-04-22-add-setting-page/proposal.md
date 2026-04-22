## Why

目前应用配置分散在 5 个独立的 JSON 文件中（setting.json、llm.json、embedding.json、qdrant.json、api.json），用户无法通过图形界面统一管理这些配置。使用体验不佳，需要提供一个集中的设置页面来简化配置管理。

## What Changes

1. 新增设置入口：在左下角用户信息区域添加设置图标，点击后从右侧拉出设置抽屉
2. 设置页面 UI：使用 Ant Design Drawer + Form 组件，分为 5 个表单分组展示配置
3. 数据合并：将分散的 5 个配置文件合并为单一的 `~/.nexa/config.json`
4. 后端接口：新增 `/api/settings/get` 和 `/api/settings/save` 接口
5. 前端服务：创建 settingService 处理设置相关的业务逻辑

## Capabilities

### New Capabilities
- `settings-management`: 提供统一的设置管理界面，支持配置读取和保存

### Modified Capabilities
- 无

## Impact

- 前端：新增 Setting 组件，设置抽屉页面
- 后端：新增 settings 控制器和路由
- 配置：配置文件从 5 个合并为 1 个
- 无新增外部依赖