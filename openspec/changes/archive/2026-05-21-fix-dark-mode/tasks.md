## 1. 主题配置统一到 main.tsx

- [x] 1.1 在 `frontend/main.tsx` 中将 `ThemeProvider` 提升为最外层包裹，使所有页面共享主题配置
- [x] 1.2 移除 `App.tsx` 中 `MainPage` 的 `ThemeProvider` 包裹（已在上一步统一处理）
- [ ] 1.3 验证 QuickNote、CaptureSave 等独立窗口也能正确获取主题配置

## 2. QuickNote 主题适配

- [x] 2.1 在 `QuickNote/index.tsx` 中导入 `getResolvedTheme` 函数
- [x] 2.2 在组件挂载时根据主题动态设置 `data-theme` 属性到根元素
- [x] 2.3 重构 `QuickNote/index.module.less`，将硬编码颜色替换为 CSS 变量
- [x] 2.4 添加 `[data-theme="dark"]` 暗色模式样式覆盖

## 3. CaptureSave 主题适配

- [x] 3.1 在 `CaptureSave/index.tsx` 中导入 `getResolvedTheme` 函数
- [x] 3.2 在组件挂载时根据主题动态设置 `data-theme` 属性到根元素
- [x] 3.3 重构 `CaptureSave/index.module.less`，将硬编码颜色替换为 CSS 变量
- [x] 3.4 添加 `[data-theme="dark"]` 暗色模式样式覆盖

## 4. 验证与测试

- [ ] 4.1 桌面端能正常启动
- [ ] 4.2 切换系统为浅色模式，验证所有页面显示正确
- [ ] 4.3 切换系统为暗色模式，验证所有页面显示正确
