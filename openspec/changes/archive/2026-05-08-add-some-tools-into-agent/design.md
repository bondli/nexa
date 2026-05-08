## Context

Nexa 是一款个人知识库桌面应用，当前 Agent 内置工具只有桩代码：
- `server/services/agent/tools/builtins.ts`：write_note、search_notes、get_weather 工具
- `server/controllers/note-controller.ts`：笔记 CRUD API（createNote, getNotes, searchNotes）
- `server/controllers/article-controller.ts`：文章 CRUD API（searchArticles, getArticleInfo）
- `server/controllers/cate-controller.ts`：分类 API（getCates）

需求：
1. 实现现有三个工具的实际功能
2. 新增 alarm_clock 和 search_articles 工具
3. 所有工具支持直接调用，参数缺失时通过对话补全

## Goals / Non-Goals

**Goals:**
1. 实现 write_note 工具：调用 note-service，缺少分类时查询分类列表让用户选择
2. 实现 search_notes 工具：调用搜索服务，返回列表，用户选择后显示详情
3. 实现 get_weather 工具：接入和风天气 API
4. 新增 alarm_clock 工具：使用 Electron Notification 设置闹钟
5. 新增 search_articles 工具：调用文章搜索服务，返回列表，用户选择后显示详情

**Non-Goals:**
1. 不实现复杂的多步骤工作流
2. 不实现闹钟的持久化存储（仅支持当前会话）

## Decisions

### 1. 天气 API 选型：和风天气 API

**选择理由：**
- 国内免费额度充足（每天 1000 次）
- API 文档完善，支持城市名称查询
- 无需申请复杂权限

**API 格式：**
```
https://devapi.qweather.com/v7/weather/now?location={城市编码}&key={API_KEY}
```

**替代方案：**
- OpenWeatherMap：国外服务，国内访问不稳定
- 高德/百度天气：需要申请权限，流程复杂

### 2. 闹钟通知方案：Electron Notification

**选择理由：**
- Electron 原生支持，无需额外依赖
- 跨平台支持（macOS/Windows）
- 可设置精确时间

**实现方案：**
- 使用 `electron` 的 `Notification` API
- 闹钟触发时显示系统通知
- 通知内容包含闹钟标题和时间

### 3. write_note 分类确认流程

**方案 A：强制要求传入 cateId**
- 缺点：用户体验差，无法理解用户意图

**方案 B：参数缺失时返回分类列表让用户选择（采用）**
- 优点：用户体验好，交互自然
- 实现：工具返回 `requires_action` 类型的特殊结果，前端展示分类选择

### 4. 搜索结果交互流程

**统一交互模式：**
1. 工具返回搜索结果列表
2. 用户选择某一项（通过数字索引）
3. 工具被再次调用，传入 `selectedId` 参数
4. 返回详细结果

## Risks / Trade-offs

### 1. [风险] 天气 API 依赖

**描述：** 外部 API 可能不稳定或达到限额
**缓解：** 添加错误处理和友好提示

### 2. [风险] 闹钟在应用关闭后失效

**描述：** Electron Notification 仅在应用运行时有效
**缓解：** 记录闹钟到数据库，下次启动时检查并触发

### 3. [风险] 分类列表为空

**描述：** 用户没有创建任何分类
**缓解：** 提示用户先创建分类

## Migration Plan

### 步骤 1：重构 builtins.ts 结构
1. 创建 `server/services/agent/tools/weather-service.ts`：封装天气 API
2. 创建 `server/services/agent/tools/alarm-service.ts`：封装闹钟逻辑
3. 修改 builtins.ts：调用实际服务

### 步骤 2：实现 write_note
1. 调用 note-controller 的 createNote 接口
2. 实现分类查询和选择逻辑
3. 处理参数缺失的交互

### 步骤 3：实现 search_notes
1. 调用 note-controller 的 searchNotes 接口
2. 实现列表返回和详情查询

### 步骤 4：实现 get_weather
1. 接入和风天气 API
2. 添加错误处理

### 步骤 5：实现 alarm_clock
1. 使用 Electron Notification
2. 实现闹钟触发逻辑

### 步骤 6：实现 search_articles
1. 调用 article-controller 的 searchArticles 接口
2. 实现列表返回和详情查询

## Open Questions

1. **Q: 闹钟是否需要持久化？**
   - 当前方案：仅支持当前会话
   - 待定：是否存入数据库，下次启动时恢复

2. **Q: 天气 API Key 如何管理？**
   - 当前方案：硬编码或配置文件
   - 待定：是否需要单独的配置文件
