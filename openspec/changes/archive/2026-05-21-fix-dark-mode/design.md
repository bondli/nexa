## Context

系统已实现暗黑模式支持，通过 `ThemeProvider` 组件（基于 Ant Design ConfigProvider）为 `MainPage` 提供主题切换能力。但以下页面未接入主题系统：

- **BootPage** 和 **UserPage**：在 `App.tsx` 中渲染时未被 `ThemeProvider` 包裹，且使用硬编码颜色值
- **QuickNote** 和 **CaptureSave**：作为独立 Electron 窗口运行，使用硬编码的暗色样式（`#000`, `#18181b` 等）

主题检测机制已在 `@utils/theme.ts` 中实现：
- `getThemeMode()`: 获取用户设置的主题模式
- `getResolvedTheme()`: 获取实际解析后的主题（light/dark）
- `watchSystemThemeChange()`: 监听系统主题变化

## Goals / Non-Goals

**Goals:**
- 使 `BootPage`、`UserPage` 支持主题切换
- 使 `QuickNote`、`CaptureSave` 在浅色/暗色模式下均有正确表现
- 复用现有 `ThemeProvider` 组件和主题工具函数

**Non-Goals:**
- 不修改 `MainPage`（已有暗黑模式支持）
- 不修改 `ThemeProvider` 自身逻辑
- 不新增主题配置 UI

## Decisions

### Decision 1: ThemeProvider 提升到 main.tsx 根部

**选项 A（采用）**：在 `main.tsx` 中将 `ThemeProvider` 作为最外层包裹

- 优点：一次包裹，全部生效，无需在 App.tsx 中为每个分支单独处理
- 优点：QuickNote、CaptureSave 也能受益于统一的主题配置
- 缺点：需要确保 ThemeProvider 能在独立窗口环境中正常工作（依赖 `getStore` 等 electron API）

**选项 B**：在 App.tsx 中为每个页面分支单独包裹
- 缺点：代码重复，容易遗漏，维护成本高

### Decision 2: QuickNote 和 CaptureSave 使用动态 theme 属性

由于 QuickNote 和 CaptureSave 运行在独立 Electron 窗口中，它们的样式使用硬编码的 LESS 文件。

**选项 A（采用）**：使用 CSS 变量 + `data-theme` 属性

- 优点：与现有 electron 窗口架构兼容，无需 Context
- 优点：ThemeProvider 仍然可以为其提供 Ant Design 组件的主题支持
- 缺点：需要改造 LESS 文件

**选项 B**：完全依赖 ThemeProvider 的 ConfigProvider
- 缺点：这些独立窗口的样式主要是自定义 LESS，非 Ant Design token，直接用 ConfigProvider 效果有限

### Decision 3: QuickNote 和 CaptureSave 的样式变量映射

为保持一致性，采用与 Ant Design 一致的语义化 CSS 变量：

```less
// 浅色模式 (默认)
@bg-container: #ffffff;
@bg-overlay: #fafafa;
@text-primary: #18181b;
@text-secondary: #71717a;
@border-color: #d9d9d9;

// 暗色模式 ([data-theme="dark"])
@bg-container: #18181b;
@bg-overlay: #27272a;
@text-primary: #ffffff;
@text-secondary: #a1a1aa;
@border-color: #3f3f46;
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| QuickNote/CaptureSave 切换主题时闪烁 | 在 HTML 加载时同步设置 theme 属性，避免异步延迟 |
| 独立窗口主题同步 | 使用 `getStore` 读取主题设置，与主窗口保持一致 |

## Open Questions

- QuickNote 和 CaptureSave 是否需要响应系统主题变化？（建议：跟随主应用设置，即使用 `getThemeMode()` 的返回值）
