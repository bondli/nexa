## Context

当前 Nexa Agent 已支持工具调用机制（基于 LangChain DynamicTool），现有内置工具是纯逻辑工具（写笔记、搜索笔记、查天气），无法访问用户本地文件系统。

**新需求**：用户希望 Agent 能在**独立沙箱环境**中执行各种系统工具：
- 读取本地文件（Excel、CSV、DOCX、PDF、TXT、MD 等）
- 搜索目录、查找文件
- 工具执行结果交给 LLM 分析

**架构要求**：
- 沙箱隔离：工具在独立环境中执行，避免安全风险
- 支持多种文件格式：通用文档解析引擎
- 与现有 Agent 框架集成：工具注册到 ToolRegistry

## Goals / Non-Goals

**Goals:**
- 提供独立的沙箱运行环境（基于 Node.js child_process 或 isolated-vm）
- 通用文档解析引擎，支持多种文件格式
- Agent 能识别用户意图并调用相应工具
- 工具执行结果流式返回给 LLM 进行分析

**Non-Goals:**
- 不支持文件写入/修改/删除操作
- 不支持执行用户自定义脚本
- 不实现完整的 Shell 环境

## Decisions

### 1. 沙箱运行环境架构

**选择方案**：Node.js 沙箱 + IPC 通信

```
Agent (LangChain) --> ToolRegistry --> SandboxRuntime (IPC)
                                              |
                                        child_process
                                        执行系统工具
                                              |
                                        返回执行结果
```

**选择理由**：
- 与 Electron 架构契合（Main Process 作为安全边界）
- 简单可靠，无需引入复杂的虚拟化技术
- 可以控制命令白名单，保证安全性

### 2. 文档解析引擎

使用 `pdf-parse` 解析 PDF，`xlsx` 解析 Excel，使用 `y、未完成` 解析 Word。

**选择理由**：成熟库多，社区支持好。

### 3. 工具定义规范

```typescript
interface SystemTool {
  name: string;           // 工具名称
  description: string;    // 工具描述（供 LLM 理解何时调用）
  parameters: {           // 参数 schema
    path?: string;        // 文件路径
    keyword?: string;      // 搜索关键词
  };
  execute: (params) => Promise<ToolResult>;  // 执行函数
}
```

### 4. IPC 通道设计

```
Renderer --> Main: 'execute-tool' { tool: 'read_file', params: { path: '...' } }
Main --> Renderer: 'tool-result' { success: true, result: '...' }
```

### 5. 执行过程可见性（Execution Trace）

用户可以在聊天界面实时看到 Agent 的完整执行过程：

**事件类型**：
| 事件类型 | 说明 | 示例 |
|---------|------|------|
| `thinking` | Agent 思考中 | "正在分析用户请求..." |
| `tool_call` | Agent 决定调用工具 | "调用 list_directory 查看桌面" |
| `tool_start` | 工具开始执行 | "正在读取文件..." |
| `tool_result` | 工具执行结果 | "读取成功，共 100 行数据" |
| `tool_error` | 工具执行错误 | "文件不存在" |
| `reasoning` | Agent 推理过程 | "这是一个 Excel 文件，需要调用 read_document" |
| `final` | 最终回答 | Agent 的完整回答 |

**SSE 返回格式**：
```typescript
// 工具调用开始
{ "type": "tool_call", "data": { "tool": "read_file", "params": { "path": "~/Desktop/订单.xlsx" } } }

// 工具执行结果
{ "type": "tool_result", "data": { "tool": "read_file", "success": true, "result": "..." } }

// Agent 推理
{ "type": "reasoning", "data": { "thought": "文件已读取，现在调用 LLM 分析数据" } }

// 最终回答
{ "type": "final", "data": { "content": "根据数据分析，订单总额为..." } }
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 恶意文件导致系统问题 | 仅暴露读取工具，白名单校验 |
| 大文件导致内存问题 | 限制单次读取大小（10MB），大文件分块 |
| 沙箱执行超时 | 设置 30 秒超时，超时返回错误 |

## Open Questions

- [ ] 是否需要用户确认再执行文件操作？
- [ ] 是否支持流式读取大文件？
- [ ] 沙箱环境是否需要持久化状态？
