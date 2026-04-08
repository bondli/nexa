## ADDED Requirements

### Requirement: Agent 可以调用内部工具
Agent SHALL 能够调用系统内置工具，如写笔记、查天气等。

#### Scenario: Agent 调用写笔记工具
- **WHEN** 用户请求 Agent 写一条笔记
- **THEN** Agent 调用 write_note 工具，创建笔记并返回结果

#### Scenario: Agent 调用搜索笔记工具
- **WHEN** 用户请求 Agent 搜索相关笔记
- **AND** 工具返回搜索结果
- **THEN** Agent 基于搜索结果生成回复

#### Scenario: Agent 调用查天气工具
- **WHEN** 用户询问某地天气
- **THEN** Agent 调用 get_weather 工具获取天气信息并回复

### Requirement: 系统支持外部 Skill 安装和调用
系统 SHALL 动态加载外部 Skill 插件，并在 Agent 工具列表中注册。

#### Scenario: 外部 Skill 被正确加载
- **WHEN** 系统启动扫描 Skill 目录
- **THEN** 有效的 Skill 被注册到 Agent 工具列表

#### Scenario: Agent 调用外部 Skill
- **WHEN** Agent 决定调用外部 Skill
- **THEN** Skill 执行并返回结果给 Agent

### Requirement: 系统支持多 Agent 协同工作
系统 SHALL 支持多个 Agent 协同处理复杂任务。

#### Scenario: 主 Agent 调用子 Agent
- **WHEN** 主 Agent 需要处理子任务
- **THEN** 主 Agent 调用子 Agent，子 Agent 返回结果后主 Agent 汇总

### Requirement: Agent 支持 Human-in-the-loop 交互
当工具调用缺少必要参数时，系统 SHALL 暂停并等待用户输入。

#### Scenario: 工具参数缺失时请求用户补充
- **WHEN** Agent 调用工具但缺少必要参数
- **THEN** 系统向用户请求缺失参数，用户回复后继续执行

#### Scenario: 用户拒绝提供参数
- **WHEN** 用户明确拒绝提供缺失参数
- **THEN** Agent 取消该工具调用并告知用户