## 1. 依赖安装

- [x] 1.1 安装 `xlsx` 库用于 Excel 解析
- [x] 1.2 安装 `pdf-parse` 用于 PDF 解析
- [x] 1.3 安装 `mammoth` 用于 Word DOCX 解析
- [x] 1.4 在 `package.json` 中添加依赖记录

## 2. 扩展 SSE 流式返回事件类型

- [x] 2.1 在 `server/services/agent/types.ts` 中新增 `ExecutionEvent` 类型定义
- [x] 2.2 新增 `EventEmitter` 或扩展 `StreamCallback` 支持多事件类型
- [x] 2.3 修改 `chatToLLM` 返回格式支持 `type` + `data` 结构

## 3. 沙箱运行环境

- [x] 3.1 创建 `server/services/agent/sandbox/` 目录
- [x] 3.2 创建沙箱主模块 `sandbox/index.ts`
- [x] 3.3 实现 IPC 通信层连接 Main Process（沙箱直接在server执行，跳过IPC）
- [x] 3.4 实现工具执行器 `executor.ts`

## 4. 文档解析引擎

- [x] 4.1 创建 `sandbox/document-parser.ts` 通用解析器
- [x] 4.2 实现 `parseExcel()` - 解析 Excel 文件
- [x] 4.3 实现 `parsePdf()` - 解析 PDF 文件
- [x] 4.4 实现 `parseDocx()` - 解析 Word 文件
- [x] 4.5 实现 `parseText()` - 解析文本文件（TXT、MD、CSV、JSON）

## 5. 系统工具实现

- [x] 5.1 创建 `sandbox/tools/system-tools.ts`
- [x] 5.2 实现 `list_directory` 工具 - 列出目录内容
- [x] 5.3 实现 `read_file` 工具 - 读取文本文件
- [x] 5.4 实现 `read_document` 工具 - 通用文档解析（根据扩展名选择解析器）

## 6. Electron IPC 集成

- [x] 6.1 在 `electron/preload.ts` 中添加 `executeSandboxTool` API
- [x] 6.2 在 `electron/main.ts` 中添加 IPC handler（沙箱直接在server执行，跳过IPC）
- [x] 6.3 实现路径白名单校验逻辑
- [x] 6.4 添加超时处理（30秒）

## 7. 工具注册集成

- [x] 7.1 在 `server/services/agent/tools/index.ts` 中导出系统工具
- [x] 7.2 在 `server/services/agent/index.ts` 中注册系统工具到 ToolRegistry

## 8. Agent 执行过程返回（Execution Trace）

- [x] 8.1 修改 `chatWithTools` 方法，在工具调用时发送 `tool_call` 事件
- [x] 8.2 在工具执行前后发送 `tool_start` / `tool_result` 事件
- [x] 8.3 添加 `reasoning` 事件支持（如果 LLM 支持）
- [x] 8.4 确保 `final` 事件包含最终回答

## 9. 前端执行过程展示

- [x] 9.1 在 `frontend/pages/ChatBox/` 中创建 `ExecutionTrace` 组件
- [x] 9.2 实现工具调用卡片组件 `ToolCallCard`
- [x] 9.3 实现结果展示面板组件 `ResultPanel`
- [x] 9.4 实现推理步骤展示组件 `ReasoningSteps`
- [x] 9.5 集成到 ChatBox 页面，根据事件类型渲染对应 UI

## 10. 功能测试

- [ ] 10.1 启动开发服务器验证工具注册成功
- [ ] 10.2 测试 `list_directory` - 列出桌面目录
- [ ] 10.3 测试 `read_file` - 读取 TXT/MD 文件
- [ ] 10.4 测试 `read_document` - 读取 Excel 文件
- [ ] 10.5 测试 `read_document` - 读取 PDF 文件
- [ ] 10.6 测试完整场景 - 「分析桌面上的订单文件」
- [ ] 10.7 验证执行过程展示 - 看到工具调用和结果的完整过程
