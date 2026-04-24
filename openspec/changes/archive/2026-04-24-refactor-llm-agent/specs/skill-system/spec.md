## ADDED Requirements

### Requirement: Skill 注册表
系统 SHALL 提供 SkillRegistry 管理所有已安装的 skill。

#### Scenario: 获取注册表实例
- **WHEN** 调用 `getSkillRegistry()`
- **THEN** 返回 SkillRegistry 全局实例

### Requirement: Skill 安装
前端 SHALL 能够安装 skill 给 Agent 使用。

#### Scenario: 安装 Skill
- **WHEN** 前端调用 API 安装 skill
- **THEN** Skill 被添加到注册表，Agent 可使用该 skill

#### Scenario: Skill 定义结构
- **WHEN** 安装 skill 时
- **THEN** 必须提供 name、description、parameters（JSON Schema）、handler

### Requirement: Skill 卸载
系统 SHALL 支持卸载已安装的 skill。

#### Scenario: 卸载 Skill
- **WHEN** 前端调用 API 卸载 skill
- **THEN** Skill 从注册表中移除，Agent 不可再使用

#### Scenario: 查询已安装的 Skill
- **WHEN** 调用 `listSkills()`
- **THEN** 返回所有已安装的 skill 列表

### Requirement: Skill 执行
系统 SHALL 在 Agent 执行时调用相应的 skill。

#### Scenario: Agent 调用 Skill
- **WHEN** Agent 决定调用某个 skill
- **THEN** 系统查找对应 skill 并执行 handler

#### Scenario: Skill 参数校验
- **WHEN** Skill 被调用时
- **THEN** 根据 parameters schema 校验参数，参数缺失时触发 human-in-the-loop

### Requirement: Skill 与工具集成
Skill SHALL 被转换为 Agent 可用的工具。

#### Scenario: Skill 转换为工具
- **WHEN** Skill 注册时
- **THEN** 自动转换为 LangChain Tool 格式

### Requirement: 内置 Skill
系统 SHALL 提供内置 Skill 集。

#### Scenario: 获取内置 Skill
- **WHEN** Agent 初始化时
- **THEN** 自动加载内置 Skill（如计算器、日期查询等）