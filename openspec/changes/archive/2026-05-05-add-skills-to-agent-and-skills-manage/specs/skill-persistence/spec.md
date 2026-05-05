## ADDED Requirements

### Requirement: Skill 数据持久化
系统 SHALL 将 Skill 元数据持久化到 MySQL 数据库，脚本文件存储在本地文件系统。

#### Scenario: Skill 数据模型
- **WHEN** 系统需要存储 Skill 信息
- **THEN** skill 表包含字段：id、name、description、version、author、parameters(JSON)、entryFile、enabled、createdAt、updatedAt
- **AND** Skill 脚本文件存储在 `~/.nexa/skills/<skill-name>/` 目录下

### Requirement: Skill 安装
用户安装新 Skill 时 SHALL 将 Skill 信息写入数据库。

#### Scenario: 安装新 Skill
- **WHEN** 用户通过前端上传 Skill 目录（包含 manifest.json 和脚本文件）
- **THEN** 系统解析 manifest.json 提取元数据，将目录复制到 `~/.nexa/skills/<skill-name>/`，元数据写入数据库，并注册到 SkillRegistry

#### Scenario: Skill 名称唯一性
- **WHEN** 用户尝试安装一个已存在的 Skill 名称
- **THEN** 返回错误提示"Skill 已存在"

### Requirement: Skill 查询
系统 SHALL 提供查询已安装 Skills 的接口。

#### Scenario: 获取所有已安装 Skills
- **WHEN** 调用 GET /skill/list
- **THEN** 返回数据库中所有 Skills 列表（不包含 handlerCode）

#### Scenario: 获取单个 Skill 详情
- **WHEN** 调用 GET /skill/:name
- **THEN** 返回该 Skill 的完整信息（包括 handlerCode）

### Requirement: Skill 更新
系统 SHALL 支持更新 Skill 的启用状态。

#### Scenario: 禁用 Skill
- **WHEN** 调用 PUT /skill/:name/disable
- **THEN** 该 Skill 的 enabled 设为 false，且从 SkillRegistry 中移除

### Requirement: Skill 删除
系统 SHALL 支持从数据库删除 Skill。

#### Scenario: 删除 Skill
- **WHEN** 调用 DELETE /skill/:name
- **THEN** 该 Skill 从数据库删除，且从 SkillRegistry 中移除

### Requirement: Agent 启动时加载 Skills
系统 SHALL 在 Agent 初始化时从数据库加载所有 enabled=true 的 Skills。

#### Scenario: Agent 加载已安装 Skills
- **WHEN** Agent 实例被创建或获取默认 Agent 时
- **THEN** 系统从数据库加载所有 enabled=true 的 Skills 并注册到 SkillRegistry
