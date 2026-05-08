## 1. 环境准备

- [x] 1.1 创建 `server/services/agent/tools/` 目录结构（如果不存在）
- [x] 1.2 安装 axios 依赖（用于 HTTP 请求）

## 2. 实现天气服务 (weather-service.ts)

- [x] 2.1 创建 `server/services/agent/tools/weather-service.ts`
- [x] 2.2 实现和风天气 API 调用函数 `getWeather(city: string): Promise<WeatherResult>`
- [x] 2.3 添加错误处理和类型定义

## 3. 实现闹钟服务 (alarm-service.ts)

- [x] 3.1 创建 `server/services/agent/tools/alarm-service.ts`
- [x] 3.2 实现 `setAlarm(title: string, time: Date): Promise<AlarmResult>` 函数
- [x] 3.3 实现闹钟触发逻辑（使用 setTimeout）
- [x] 3.4 集成 Electron Notification（通过 IPC 到主进程）

## 4. 实现 write_note 工具

- [x] 4.1 修改 `builtins.ts` 中的 `createWriteNoteTool`
- [x] 4.2 调用 `note-controller` 的 `createNote` 接口
- [x] 4.3 实现分类查询：当 cateId 缺失时调用 `getCates` 接口
- [x] 4.4 实现分类选择交互逻辑
- [x] 4.5 更新工具描述，添加参数说明

## 5. 实现 search_notes 工具

- [x] 5.1 修改 `builtins.ts` 中的 `createSearchNotesTool`
- [x] 5.2 调用 `note-controller` 的 `searchNotes` 接口
- [x] 5.3 实现搜索结果列表返回
- [x] 5.4 实现笔记详情查询（用户选择后调用 `getNoteInfo`）
- [x] 5.5 处理多轮交互（搜索 → 选择 → 详情）

## 6. 实现 get_weather 工具

- [x] 6.1 修改 `builtins.ts` 中的 `createGetWeatherTool`
- [x] 6.2 调用 `weather-service.ts` 的 `getWeather` 函数
- [x] 6.3 格式化天气信息返回
- [x] 6.4 添加错误处理

## 7. 实现 alarm_clock 工具

- [x] 7.1 在 `builtins.ts` 中新增 `createAlarmClockTool`
- [x] 7.2 调用 `alarm-service.ts` 的 `setAlarm` 函数
- [x] 7.3 定义工具参数：title（标题）、time（时间，ISO 格式）
- [x] 7.4 添加参数验证
- [x] 7.5 在 `getBuiltInTools` 和 `registerBuiltInTools` 中注册新工具

## 8. 实现 search_articles 工具

- [x] 8.1 在 `builtins.ts` 中新增 `createSearchArticlesTool`
- [x] 8.2 调用 `article-controller` 的 `searchArticles` 接口
- [x] 8.3 实现搜索结果列表返回
- [x] 8.4 实现文章详情查询（用户选择后调用 `getArticleInfo`）
- [x] 8.5 处理多轮交互
- [x] 8.6 在 `getBuiltInTools` 和 `registerBuiltInTools` 中注册新工具

## 9. 测试验证

- [ ] 9.1 手动测试：write_note 创建笔记流程
- [ ] 9.2 手动测试：search_notes 搜索和详情查看流程
- [ ] 9.3 手动测试：get_weather 天气查询
- [ ] 9.4 手动测试：alarm_clock 设置闹钟和通知
- [ ] 9.5 手动测试：search_articles 搜索和详情查看流程
- [ ] 9.6 验证对话中直接调用工具（无需手动输入工具名）
