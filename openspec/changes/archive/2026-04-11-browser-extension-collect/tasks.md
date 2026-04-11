## 1. 项目初始化

- [x] 1.1 检查 browser-extension 目录结构（如已有目录则跳过）
- [x] 1.2 初始化 Vite + TypeScript 项目配置
- [x] 1.3 安装 Antd 6 依赖
- [x] 1.4 配置 Chrome Extension Manifest V3
- [x] 1.5 配置 package.json 构建脚本（整合到主项目）

## 2. 插件基础架构

- [x] 2.1 编写 manifest.json（Popup、Content Script、Background）
- [x] 2.2 实现 Popup 页面入口
- [x] 2.3 实现 Content Script 注入逻辑
- [x] 2.4 实现 Background Service Worker

## 3. 页面内容提取

- [x] 3.1 实现 DOM 内容提取工具（标题、URL、正文）
- [x] 3.2 实现 HTML 转 Markdown 转换器
- [x] 3.3 处理常见网站结构（article、main、content）
- [x] 3.4 添加提取失败错误处理

## 4. 浮层面板 UI

- [x] 4.1 使用 Antd Drawer 实现右侧浮动面板
- [x] 4.2 实现"一键提取"按钮及加载状态
- [x] 4.3 集成 Markdown 编辑器组件
- [x] 4.4 实现分类选择器（下拉选择）
- [x] 4.5 实现"保存到笔记"按钮
- [x] 4.6 面板高度自适应，最大 1000px

## 5. 登录态管理

- [x] 5.1 配置并调用登录接口（POST /user/login）
- [x] 5.2 实现登录界面（用户名+密码）
- [x] 5.3 实现 token 存储（chrome.storage）
- [x] 5.4 实现登录态检查与过期处理

## 6. 服务端接口配置

- [x] 6.1 配置分类列表接口（GET /cate/list）
- [x] 6.2 配置创建笔记接口（POST /note/add）
- [x] 6.3 确保服务端 CORS 配置允许插件跨域访问

## 7. 插件与服务端通信

- [x] 7.1 实现 API 请求封装（配置现有接口地址）
- [x] 7.2 处理跨域请求（配置 CORS 或使用 background 转发）
- [x] 7.3 添加请求错误处理

## 8. 构建与测试

- [x] 8.1 配置 Vite 构建输出为 dist 目录
- [ ] 8.2 添加 Chrome 插件加载测试（开发者模式）
- [ ] 8.3 测试完整流程：提取->编辑->保存