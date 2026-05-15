## 1. UserPage 暗黑模式支持

- [x] 1.1 在 UserPage/index.tsx 中引入 TitleBar 组件
- [x] 1.2 修改 UserPage/index.module.less，使用 CSS 变量替代固定颜色
- [x] 1.3 将 Header 背景色改为透明或使用 var(--ant-color-bg-header)
- [x] 1.4 将文字颜色改为 var(--ant-color-text)
- [ ] 1.5 验证 UserPage 暗黑模式切换正常

## 2. BootPage 暗黑模式支持

- [x] 2.1 在 BootPage/index.tsx 中引入 TitleBar 组件
- [x] 2.2 修改 BootPage/index.module.less，使用 CSS 变量替代固定颜色
- [x] 2.3 将 Header 背景色改为透明或使用 var(--ant-color-bg-header)
- [x] 2.4 将文字颜色改为 var(--ant-color-text)
- [x] 2.5 将表单容器背景适配暗黑模式
- [ ] 2.6 验证 BootPage 暗黑模式切换正常

## 3. 文章图片模板字体优化

- [x] 3.1 修改 server/services/article-template-service.ts 中 getHtmlTemplate 函数
- [x] 3.2 将主标题字体从 72px 改为 48px
- [x] 3.3 将副标题字体从 30px 改为 20px
- [x] 3.4 将 KPI 数值字体从 56px 改为 40px
- [x] 3.5 将 KPI 标签字体从 26px 改为 18px
- [x] 3.6 将正文字体从 24-28px 改为 16-18px
- [ ] 3.7 验证生成的文章图片字体大小合适

## 4. 集成测试

- [ ] 4.1 启动桌面端应用，设置暗黑模式
- [ ] 4.2 退出登录，验证登录页面暗黑模式正常
- [ ] 4.3 测试文章图片生成，验证字体大小合适
