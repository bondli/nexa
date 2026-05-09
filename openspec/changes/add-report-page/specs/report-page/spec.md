## ADDED Requirements

### Requirement: 报告列表展示
系统 SHALL 支持展示报告列表，每条记录包含：固定 Icon（GithubFilled）、报告日期、报告类型、报告摘要、报告创建时间。

#### Scenario: 查看全部报告列表
- **WHEN** 用户进入报告页面且未选择特定分类
- **THEN** 系统显示全部报告列表，支持分页加载

#### Scenario: 按报告类型筛选
- **WHEN** 用户点击左侧"全部日报"或"全部月报"菜单
- **THEN** 系统显示对应类型的报告列表

#### Scenario: 按月份分组筛选
- **WHEN** 用户点击左侧月份分组菜单（如 2026-05）
- **THEN** 系统显示该月的所有报告列表

### Requirement: 报告新增功能
系统 SHALL 支持用户新增日报或月报，通过下拉选择报告类型后，系统自动调用 AI 生成报告内容。

#### Scenario: 新增日报
- **WHEN** 用户点击新增按钮并选择"日报"
- **THEN** 系统调用 AI 基于昨日笔记/文章生成日报，显示生成进度，完成后在 Modal 中预览

#### Scenario: 新增月报
- **WHEN** 用户点击新增按钮并选择"月报"
- **THEN** 系统调用 AI 基于上月笔记/文章生成月报，显示生成进度，完成后在 Modal 中预览

### Requirement: 报告详情展示
系统 SHALL 支持通过 Drawer 侧拉方式展示报告详情，点击报告 Icon 可查看缩略图。

#### Scenario: 查看报告详情
- **WHEN** 用户点击报告日期或摘要
- **THEN** 系统从右侧拉出 Drawer，展示报告完整内容（Markdown 格式）

#### Scenario: 查看报告缩略图
- **WHEN** 用户点击报告固定 Icon
- **THEN** 系统展示报告缩略图

### Requirement: 报告生成提醒
系统 SHALL 在进入报告页面时检测是否需要生成日报或月报，并主动提醒用户。

#### Scenario: 日报提醒
- **WHEN** 进入报告页面时，当天还没有昨日的日报
- **THEN** 系统提示用户需要写日报

#### Scenario: 月报提醒
- **WHEN** 进入报告页面时是月初（每月 5 日前）且上个月月报不存在
- **THEN** 系统提示用户需要写月报

### Requirement: 报告数据模型
报告数据 SHALL 包含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| reportDate | string | 报告日期 |
| reportType | 'daily' \\| 'monthly' | 报告类型 |
| summary | string | 报告摘要 |
| content | text | 报告内容（Markdown） |
| image | string | 报告缩略图 |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

### Requirement: 报告生成 AI 提示词
日报生成 SHALL 包含以下五部分内容：
1. 核心记录的笔记内容
2. 主要完成的工作
3. 所收藏的文章的核心知识点
4. 总结过去一天的知识收获
5. 后续重点可以跟进的事项

月报生成 SHALL 包含以下五部分内容：
1. 核心记录的笔记内容
2. 主要完成的工作
3. 所收藏的文章的核心知识点
4. 总结过去一月的知识收获
5. 后续重点可以跟进的事项
