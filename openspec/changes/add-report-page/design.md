## Context

Nexa 知识库应用需要新增报告功能，帮助用户自动生成每日/每月的工作学习总结报告。

**现状**：
- 用户积累了大量笔记和文章，但缺乏周期性回顾机制
- 没有统一的报告生成和查看入口

**约束**：
- 技术栈：React + TypeScript（前端），Node.js + Express + MySQL（后端）
- 架构分层：UI 层 → Service 层 → Data 层 / AI 层
- 参考现有 Article 页面实现

## Goals / Non-Goals

**Goals:**
- 实现报告页面 UI，支持日报/月报列表展示
- 实现 AI 自动生成日报和月报功能
- 实现报告详情查看和缩略图展示
- 实现进入页面时的报告生成提醒

**Non-Goals:**
- 不支持手动编辑报告内容
- 不支持报告导出功能
- 不支持报告分享功能

## Decisions

### 1. 报告数据结构

**Decision**: 新建 Report 数据表，包含 reportDate, reportType, summary, content, image 等字段

**Rationale**: 报告需要存储生成的 markdown 内容和缩略图，Report 表可以与其他数据表（Note, Article）独立管理

### 2. 报告生成 AI 提示词设计

**Decision**: 日报基于昨日笔记/文章，月报基于上月笔记/文章，生成包含五部分内容的报告

**Rationale**: 通过时间范围筛选数据，确保报告内容的完整性和连续性

### 3. 前端页面结构

**Decision**: 参考 Article 页面，采用左侧分类导航 + 右侧列表布局

**Rationale**: 与现有页面保持一致的用户体验，降低学习成本

### 4. API 接口设计

**Decision**: 提供 /api/report/generate, /api/report/list, /api/report/check, /api/report/delete, /api/report/detail, /api/report/group 六个接口

**Rationale**: 覆盖报告的创建、查询、检测、删除、详情和分组所有场景

## Risks / Trade-offs

- **AI 生成质量不稳定** → 提示词需要精心设计，可能需要多次迭代优化
- **数据量影响生成速度** → 报告生成接口需要设置超时和进度提示

## Open Questions

- 报告缩略图生成的实现方式（是调用现有图片生成服务还是其他方案）
