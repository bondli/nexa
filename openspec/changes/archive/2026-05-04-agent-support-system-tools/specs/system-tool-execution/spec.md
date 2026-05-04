## ADDED Requirements

### Requirement: 沙箱工具运行环境
系统 SHALL 提供独立的沙箱运行环境，用于安全执行系统级工具。

#### Scenario: 创建沙箱实例
- **WHEN** Agent 需要执行系统工具时
- **THEN** 通过 IPC 调用 Main Process，在沙箱中执行工具

#### Scenario: 沙箱执行结果返回
- **WHEN** 沙箱工具执行完成
- **THEN** 结果通过 IPC 返回给 Agent，Agent 将结果交给 LLM 分析

### Requirement: 目录列表工具
系统 SHALL 提供 `list_directory` 工具，列出指定目录的文件和文件夹。

#### Scenario: 列出目录内容
- **WHEN** 用户请求查看某个目录
- **THEN** Agent 调用 `list_directory`，返回文件列表（名称、类型、大小）

### Requirement: 文件读取工具
系统 SHALL 提供 `read_file` 工具，读取文本文件内容。

#### Scenario: 读取文本文件
- **WHEN** 用户请求读取 `.txt`、`.md`、`.json`、`.csv` 等文本文件
- **THEN** Agent 调用 `read_file`，返回文件内容（限制 10MB）

#### Scenario: 文件不存在
- **WHEN** 尝试读取不存在的文件
- **THEN** 返回错误「文件不存在」

### Requirement: 通用文档解析工具
系统 SHALL 提供 `read_document` 工具，支持多种文档格式。

#### Scenario: 解析 Excel 文件
- **WHEN** 用户请求分析 `.xlsx`、`.xls` 文件
- **THEN** Agent 调用 `read_document`，返回解析后的 JSON 数据

#### Scenario: 解析 Word 文件
- **WHEN** 用户请求分析 `.docx` 文件
- **THEN** Agent 调用 `read_document`，返回文档文本内容

#### Scenario: 解析 PDF 文件
- **WHEN** 用户请求分析 `.pdf` 文件
- **THEN** Agent 调用 `read_document`，返回 PDF 文本内容

#### Scenario: 不支持的格式
- **WHEN** 用户请求解析不支持的文件格式
- **THEN** 返回错误「不支持该文件格式」

### Requirement: 路径安全校验
系统 SHALL 在执行文件操作前进行路径安全校验。

#### Scenario: 白名单路径访问
- **WHEN** 用户请求访问允许的路径（如桌面、下载文件夹）
- **THEN** 允许执行文件操作

#### Scenario: 非白名单路径访问
- **WHEN** 用户请求访问白名单外路径
- **THEN** 返回错误「该路径不在允许访问范围内」

### Requirement: 沙箱工具注册
系统 SHALL 将系统工具注册到 ToolRegistry，供 Agent 调用。

#### Scenario: 系统启动时注册
- **WHEN** Agent 服务启动
- **THEN** 自动注册所有系统工具到工具注册表
