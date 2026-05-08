## Why

Nexa 作为个人知识库桌面应用，当前 Agent 内置工具（write_note、search_notes、get_weather）只有桩代码，未实现实际功能。此外，需要新增 alarm_clock（闹钟）和 search_articles（搜索文章）工具，完善 Agent 的工具生态，提升应用的智能化程度。

## What Changes

1. **实现现有工具**：
   - write_note：调用实际 note-service 创建笔记，缺少分类时通过对话确认分类
   - search_notes：调用实际搜索服务，返回笔记列表，用户选择后显示详情
   - get_weather：调用国内免费天气 API（如和风天气）

2. **新增工具**：
   - alarm_clock：调用系统闹钟接口，设置闹钟并支持桌面通知提醒
   - search_articles：调用实际文章搜索服务，返回文章列表，用户选择后显示详情

3. **通用能力**：
   - 所有工具支持在 Chat 页面直接调用，无需用户手动输入工具名
   - 参数缺失时通过对话方式让用户补全

## Capabilities

### New Capabilities
- `alarm_clock`: 系统闹钟工具，支持设置闹钟和桌面通知
- `search_articles`: 文章搜索工具，支持搜索和详情查看

### Modified Capabilities
- `write_note`: 实现笔记创建，与分类服务联动
- `search_notes`: 实现笔记搜索，与笔记服务联动
- `get_weather`: 实现天气查询，接入真实 API

## Impact
- **后端**: 修改 server/services/agent/tools/builtins.ts
- **依赖**: 和风天气 API（免费额度）、Electron notification API
