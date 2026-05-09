## 1. 数据库层

- [x] 1.1 创建 Report 数据表（server/models/report.ts）
- [x] 1.2 在 server/index.ts 中导入 Report 模型

## 2. 后端接口

- [x] 2.1 创建 report.controller.ts 基础结构
- [x] 2.2 实现 /api/report/generate 接口（报告生成）
- [x] 2.3 实现 /api/report/list 接口（报告列表，支持分页）
- [x] 2.4 实现 /api/report/check 接口（报告检测提醒）
- [x] 2.5 实现 /api/report/delete 接口（报告删除）
- [x] 2.6 实现 /api/report/detail 接口（报告详情）
- [x] 2.7 实现 /api/report/group 接口（报告分组）

## 3. AI 服务层

- [x] 3.1 创建 reportService.ts 封装报告生成逻辑
- [x] 3.2 设计日报生成提示词模板
- [x] 3.3 设计月报生成提示词模板
- [x] 3.4 实现根据日期范围获取笔记/文章逻辑

## 4. 前端页面

- [x] 4.1 创建 Report 页面入口（frontend/pages/Report/index.tsx）
- [x] 4.2 实现左侧分类导航组件
- [x] 4.3 实现报告列表组件
- [x] 4.4 实现新增报告 Modal（含下拉选择日报/月报）
- [x] 4.5 实现报告详情 Drawer 组件
- [x] 4.6 实现报告缩略图查看功能
- [x] 4.7 创建 ReportContext 管理状态和业务逻辑

## 5. 集成与测试

- [x] 5.1 路由注册（左侧菜单入口）
- [x] 5.2 报告检测提醒功能集成
- [ ] 5.3 手动测试完整流程
