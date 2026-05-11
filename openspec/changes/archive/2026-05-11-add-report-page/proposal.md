## Why

Nexa 知识库应用需要新增报告功能，帮助用户定期回顾和总结每日/每月的学习和工作内容。通过 AI 自动生成日报和月报，提升用户记录效率和知识沉淀质量。

## What Changes

- **新增报告页面**：在桌面端左侧菜单最后一个图标进入报告页面
- **报告列表功能**：支持分页加载、按类型（日报/月报）筛选、按月份分组展示
- **报告生成功能**：支持 AI 自动生成日报（基于昨日笔记/文章）和月报（基于上月笔记/文章）
- **报告详情功能**：点击报告可通过 Drawer 侧拉展示报告详情和缩略图
- **报告检测提醒**：进入页面时检测是否需要写日报或月报，并主动提醒用户
- **数据表新增**：新建 Report 表存储报告数据

## Capabilities

### New Capabilities

- `report-page`: 报告页面，包含报告列表、报告生成、报告详情、报告提醒功能
  - `report-daily`: 日报功能，基于昨日笔记/文章 AI 自动生成
  - `report-monthly`: 月报功能，基于上月笔记/文章 AI 自动生成
  - `report-list`: 报告列表，支持分页、筛选、分组
  - `report-detail`: 报告详情展示，支持 Drawer 侧拉和缩略图查看
  - `report-reminder`: 报告生成提醒，检测是否需要写日报/月报

### Modified Capabilities

- （无）

## Impact

- **前端**：`frontend/pages/Report/` 新增报告页面，参考 Article 页面实现
- **后端**：`server/controllers/report.controller.ts` 新增报告相关接口
- **数据库**：新建 Report 数据表
- **AI 服务**：新增报告生成 AI 提示词模板
