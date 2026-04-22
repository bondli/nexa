## 1. 后端配置服务

- [x] 1.1 创建统一配置服务 `server/services/config-service.ts`，实现 config.json 的读写和旧配置迁移
- [x] 1.2 创建设置控制器 `server/controllers/settings-controller.ts`，实现 get 和 save 接口
- [x] 1.3 在路由中注册设置接口

## 2. 前端 Setting 组件

- [x] 2.1 创建 `frontend/components/Setting/index.tsx` 组件，包含：
  - 设置图标（使用 antd SettingOutlined 图标）
  - 内部管理 Drawer 组件的打开/关闭状态
  - 5 个表单分组的配置表单
- [x] 2.2 创建 `frontend/components/Setting/index.module.less` 样式文件
- [x] 2.3 实现 5 个表单分组：数据库配置、LLM 设置、Embedding 设置、Qdrant 设置、图片服务器设置

## 3. 前端 Service 层

- [x] 3.1 创建 `frontend/services/settingService.ts`，处理设置相关的业务逻辑

## 4. 集成到 MainPage

- [x] 4.1 在 `frontend/modules/MainPage/index.tsx` 中，User 组件上方添加 Setting 组件

## 5. 配置统一与迁移

- [x] 5.1 移除旧配置文件迁移逻辑，直接使用 config.json
- [x] 5.2 修改所有消费旧配置文件的模块，改用 config-service 统一获取
  - embedding-service.ts → 使用 getEmbeddingConfig
  - vectorDB.ts → 使用 getQdrantConfig
  - llm-config.ts → 使用 getConfig
  - setting.ts → 使用 getApiConfig
  - cloud-sync-service.ts → 使用 getApiConfig
  - database.ts → 使用 getDatabaseConfig
  - install-controller.ts → 使用 getConfig/saveConfig

## 6. 测试与验证

- [ ] 6.1 测试打开设置抽屉，验证配置读取正常
- [ ] 6.2 测试保存配置，验证写入 config.json 正常