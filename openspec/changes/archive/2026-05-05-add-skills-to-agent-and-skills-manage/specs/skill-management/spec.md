## ADDED Requirements

### Requirement: Skill 管理入口按钮
桌面端聊天页面左上角的 New Chat 按钮区域 SHALL 改为 Skills 管理入口按钮，点击打开 Skills 管理 Drawer。

#### Scenario: 点击 Skills 管理按钮
- **WHEN** 用户点击聊天页面左上角的 Skills 管理按钮
- **THEN** 右侧拉出一个 Drawer，展示已安装的 Skills 列表

#### Scenario: New Chat 按钮位置调整
- **WHEN** 用户需要创建新对话
- **THEN** New Chat 按钮出现在 Header 右侧区域

### Requirement: Skill 列表展示
Skills 管理 Drawer SHALL 展示所有已安装的 Skills，包含名称、描述、版本、作者信息。

#### Scenario: 查看 Skill 列表
- **WHEN** 用户打开 Skills 管理 Drawer
- **THEN** 展示所有已安装的 Skills，每项显示 name、description、version、author

### Requirement: Skill 禁用
系统 SHALL 支持禁用已安装的 Skill，被禁用的 Skill 不再被 Agent 调用。

#### Scenario: 禁用 Skill
- **WHEN** 用户在 Skills 管理页面点击某 Skill 的禁用按钮
- **THEN** 该 Skill 的 enabled 状态设为 false，Agent 不可再调用

#### Scenario: 启用已禁用的 Skill
- **WHEN** 用户在 Skills 管理页面点击已禁用 Skill 的启用按钮
- **THEN** 该 Skill 的 enabled 状态设为 true，Agent 可再次调用

### Requirement: Skill 删除
系统 SHALL 支持永久删除已安装的 Skill。

#### Scenario: 删除 Skill
- **WHEN** 用户在 Skills 管理页面点击某 Skill 的删除按钮
- **THEN** 该 Skill 从数据库和 registry 中移除

### Requirement: 添加新 Skill
Skills 管理页面右上角 SHALL 提供添加新 Skill 的入口，点击弹出 Modal。

#### Scenario: 打开添加 Skill Modal
- **WHEN** 用户点击 Skills 管理页右上角的"添加"按钮
- **THEN** 弹出 AddSkill Modal，包含 name、description、version、author、handlerCode 等输入项

#### Scenario: 填写并提交 Skill
- **WHEN** 用户在 AddSkill Modal 中填写完整的 Skill 信息并提交
- **THEN** 系统调用 POST /skill/install 接口，Skill 被保存到数据库并注册到 registry

#### Scenario: 取消添加 Skill
- **WHEN** 用户在 AddSkill Modal 中点击取消
- **THEN** Modal 关闭，不保存任何数据
