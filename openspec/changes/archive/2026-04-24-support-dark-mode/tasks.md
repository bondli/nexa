## 1. 主题配置基础设施

- [x] 1.1 在 `frontend/services/configService.ts` 中添加主题配置项（theme: 'light' | 'dark' | 'followSystem'）
- [x] 1.2 添加主题持久化存储和读取逻辑（使用 localStorage）
- [x] 1.3 添加获取当前主题的辅助函数

## 2. 主题切换 UI 入口

- [x] 2.1 在 `frontend/components/User/index.tsx` 的菜单中增加"外观设置"菜单项（位于退出登录上方）
- [x] 2.2 实现外观设置的子菜单，包含浅色模式、深色模式、跟随系统三个选项
- [x] 2.3 添加当前主题选中状态的视觉标识

## 3. 主题切换功能实现

- [x] 3.1 创建 `frontend/components/ThemeProvider/index.tsx`，使用 Ant Design ConfigProvider 实现主题切换
- [x] 3.2 在 App 根组件中引入 ThemeProvider
- [x] 3.3 实现跟随系统主题的检测逻辑（使用 `prefers-color-scheme` MediaQuery）
- [x] 3.4 实现主题切换时实时更新 ConfigProvider 的 theme 属性

## 4. 样式适配

- [x] 4.1 梳理并替换 `frontend/components/User/index.module.less` 中的硬编码颜色为 CSS 变量
- [x] 4.2 梳理其他组件中的硬编码颜色，确保支持主题切换
- [ ] 4.3 测试浅色和深色模式下的所有主要页面布局

## 5. 验证与测试

- [ ] 5.1 验证三种主题模式都能正常切换
- [ ] 5.2 验证刷新页面后主题设置被正确恢复
- [ ] 5.3 验证跟随系统模式下，操作系统主题切换后应用主题同步变化
