## Why

当前 Nexa 知识库的 Agent 只能进行对话交互，无法真正执行任务。用户说「帮我分析桌面上的订单文件」时，Agent 无法访问本地文件系统。需要一个**独立的沙箱运行环境**，让 Agent 能调用各种系统工具（读取文件、搜索文档等），工具执行结果交给 LLM 分析，最终返回有意义的回答。

## What Changes

- 新增 **沙箱工具运行环境**：独立的 Node.js 沙箱环境执行系统级工具
- 新增 **通用文件解析引擎**：支持 Excel、CSV、DOCX、PDF、TXT、MD 等多种文件格式
- 新增 **系统工具集**：`list_directory`、`read_file`、`read_document` 等
- 扩展现有 **工具注册机制**：支持注册沙箱工具到 Agent
- 工具执行结果流式返回给 LLM 进行分析和总结

## Capabilities

### New Capabilities

- `sandbox-tool-runtime`: 独立的沙箱运行环境，用于安全地执行系统级工具
- `document-parser`: 通用文档解析引擎，支持多种文件格式的读取和解析
- `system-tool-execution`: Agent 调用系统工具执行文件操作任务
- `execution-trace`: 实时返回 Agent 执行过程中的详细步骤（工具调用、结果、中间推理）

### Modified Capabilities

- `tool-calling`: 扩展工具注册表，支持沙箱工具的注册和执行

## Impact

- **后端改动**：`server/services/agent/` 下新增沙箱运行环境和文档解析引擎
- **Electron 改动**：`electron/main.js` 中添加 IPC handler 处理沙箱工具调用
- **前端改动**：`frontend/pages/ChatBox/index.tsx` 保持现有交互，Agent 响应中可能包含文件分析结果
