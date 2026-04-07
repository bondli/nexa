## ADDED Requirements

### Requirement: 知识库列表展示
系统 SHALL 在知识库页面左侧显示所有知识库列表，每个知识库使用 antd Card 组件展示。

#### Scenario: 首次进入页面
- **WHEN** 用户首次进入知识库页面
- **THEN** 页面自动加载第一个知识库下的文档列表

#### Scenario: 查看知识库列表
- **WHEN** 用户查看知识库列表
- **THEN** 显示所有知识库的名称和描述

#### Scenario: 点击知识库
- **WHEN** 用户点击某个知识库
- **THEN** 右侧区域加载并显示该知识库下的所有文档

### Requirement: 创建知识库
系统 SHALL 允许用户创建新的知识库。

#### Scenario: 创建新知识库
- **WHEN** 用户点击"新建知识库"按钮并填写名称和描述
- **THEN** 系统创建新知识库并显示在列表中

### Requirement: 删除知识库
系统 SHALL 允许用户删除知识库。

#### Scenario: 删除知识库
- **WHEN** 用户点击知识库的删除按钮
- **THEN** 系统删除该知识库及其所有文档

### Requirement: 知识库文档列表
系统 SHALL 在选中知识库后显示其下的所有文档列表。

#### Scenario: 显示文档列表
- **WHEN** 用户选择一个知识库
- **THEN** 右侧区域显示该知识库的所有文档，包括文档名称和上传时间

### Requirement: 上传文档
系统 SHALL 允许用户向知识库上传文档文件。

#### Scenario: 上传文档
- **WHEN** 用户点击上传按钮并选择文件
- **THEN** 系统上传文件并在文档列表中显示新文档

### Requirement: 预览文档
系统 SHALL 允许用户预览知识库中的 Markdown 文档。

#### Scenario: 预览文档
- **WHEN** 用户点击文档
- **THEN** 系统使用 Markdown 编辑器显示文档内容（预览模式）

### Requirement: 删除文档
系统 SHALL 允许用户删除知识库中的文档。

#### Scenario: 删除文档
- **WHEN** 用户点击文档的删除按钮
- **THEN** 系统删除该文档