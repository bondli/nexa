# 需求：修复暗黑模式下的一些遗留问题

## 背景

系统已经具备了暗黑模式的支持，但是还有一些细节问题需要修复

## 目标

全局页面支持暗黑模式

## 期望行为

- 全局页面适配暗黑模式，目前登录页面/安装页面/快速笔记页面/截图快存页面，都没有做适配，都是只支持一种模式
  - 登录页面/安装页面，只支持亮色模式
  - 快速笔记页面/截图快存页面，目前是写死的黑色，需要在浅色模式下有浅色的表现
- 上下文说明：
  - 暗黑模式的判断逻辑，已经在 components/ThemeProvider 做了，直接使用即可
  - 目前暗黑模式的实现是在App.tsx下只对<MainPage />做了适配，需要对其他的页面也做适配
  - 登录页面：/Users/bondli/githubProjects/nexa/frontend/modules/UserPage
  - 安装页面：/Users/bondli/githubProjects/nexa/frontend/modules/BootPage
  - 快速笔记页面：/Users/bondli/githubProjects/nexa/frontend/blocks/QuickNote
  - 截图快存页面：/Users/bondli/githubProjects/nexa/frontend/blocks/CaptureSave
- 可参考已有的实现：/Users/bondli/githubProjects/nova/apps/web/src/main.tsx

## 验收标准

- 桌面端能正常运行起来，切换不同的模式去验证页面的显示效果
