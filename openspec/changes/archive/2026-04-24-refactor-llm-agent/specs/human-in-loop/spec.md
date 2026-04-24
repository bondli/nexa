## ADDED Requirements

### Requirement: Human-in-the-loop 管理器
系统 SHALL 提供 HumanInTheLoopManager 管理器，处理需要人类介入的场景。

#### Scenario: 获取管理器实例
- **WHEN** 调用 `getHumanInTheLoopManager()`
- **THEN** 返回全局单例管理器实例

### Requirement: 等待用户输入
当工具调用缺少必要参数时，系统 SHALL 暂停执行并等待用户补充。

#### Scenario: 检测到缺参
- **WHEN** 工具调用时检测到缺少必要参数
- **THEN** 创建待处理任务，暂停 Agent 执行，返回需要用户补充的参数信息

#### Scenario: 用户补充参数
- **WHEN** 用户通过 API 提供缺失参数
- **THEN** 合并参数到原始调用，继续执行工具

#### Scenario: 用户拒绝提供参数
- **WHEN** 用户明确拒绝提供参数或超时
- **THEN** 取消任务，通知 Agent 任务已取消

### Requirement: 任务状态管理
系统 SHALL 管理待处理任务的完整生命周期。

#### Scenario: 查询待处理任务
- **WHEN** 调用 `getPendingTasksBySession(sessionId)`
- **THEN** 返回指定会话的所有待处理任务列表

#### Scenario: 清理会话状态
- **WHEN** 会话结束时
- **THEN** 清理该会话的所有待处理任务和检查点

### Requirement: 检查点保存
系统 SHALL 在暂停时保存 Agent 状态，以便恢复执行。

#### Scenario: 保存检查点
- **WHEN** Agent 暂停等待用户输入时
- **THEN** 保存当前状态到检查点，包括消息历史和执行上下文

#### Scenario: 恢复检查点
- **WHEN** 用户补充参数后恢复执行
- **THEN** 从检查点恢复状态，继续执行