## ADDED Requirements

### Requirement: 用户可以打开设置页面
应用 SHALL 提供设置入口，用户点击后可打开设置抽屉。

#### Scenario: 点击设置图标打开抽屉
- **WHEN** 用户点击左下角用户信息区域的设置图标
- **THEN** 应用 SHALL 从右侧滑出设置抽屉，显示所有配置表单

### Requirement: 设置页面展示所有配置分组
设置抽屉 SHALL 展示 5 个配置分组：数据库配置、LLM 设置、Embedding 设置、Qdrant 服务器设置、图片服务器设置。

#### Scenario: 各分组显示对应配置项
- **WHEN** 打开设置抽屉
- **THEN** 每个分组 SHALL 展示对应配置文件中的所有配置项

### Requirement: 用户可以查看当前配置
应用 SHALL 在打开设置抽屉时通过接口获取当前配置并填充到表单中。

#### Scenario: 打开抽屉时加载配置
- **WHEN** 用户打开设置抽屉
- **THEN** 应用 SHALL 调用 `/api/settings/get` 接口获取配置并填充到表单

#### Scenario: 配置文件存在时正常显示
- **WHEN** 配置文件存在
- **THEN** 表单 SHALL 显示已保存的配置值

#### Scenario: 配置文件不存在时显示空表单
- **WHEN** 配置文件不存在
- **THEN** 表单 SHALL 显示空值或默认值

### Requirement: 用户可以保存配置
用户修改配置后可点击保存按钮，应用 SHALL 将配置保存到配置文件。

#### Scenario: 保存配置成功
- **WHEN** 用户点击保存按钮
- **THEN** 应用 SHALL 调用 `/api/settings/save` 接口保存配置
- **AND** 保存成功后 SHALL 显示成功提示

#### Scenario: 保存配置失败
- **WHEN** 保存配置时发生错误
- **THEN** 应用 SHALL 显示错误提示信息

### Requirement: 配置文件合并为单一文件
应用 SHALL 将原本分散的 5 个配置文件合并为 `~/.nexa/config.json` 一个文件。

#### Scenario: 使用统一配置文件
- **WHEN** 应用读取或保存配置
- **THEN** SHALL 操作单一的 `config.json` 文件

#### Scenario: 旧配置文件迁移
- **WHEN** 首次启动时存在旧配置文件
- **THEN** 应用 SHALL 将旧配置合并到新的 `config.json` 并备份旧文件