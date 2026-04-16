## Context

当前 Android 构建系统存在以下问题：

1. **配置混乱**：`android/` 目录下同时存在 `.gradle` (Groovy) 和 `.gradle.kts` (Kotlin DSL) 配置文件
2. **脚本分散**：部分脚本在 `android/` 根目录，部分在 `client-app/scripts/`
3. **启动失败**：应用无法正常启动，可能是 bundle 打包或加载问题
4. **安全警告**：打包的 APK 安装时出现风险提示，可能是签名配置不当

**项目约束**：
- 使用 React Native 0.75.3
- 目标 Android API 34
- 需要支持调试和发布两种构建模式

## Goals / Non-Goals

**Goals:**
- 规范化 Gradle 配置文件，全部使用 Kotlin DSL
- 统一构建脚本到 `client-app/scripts/` 目录
- 实现稳定的开发工作流 (`npm run dev:android`)
- 实现完整的发布构建流程 (`npm run build:android:release`)
- 修复应用启动问题，确保 APK 包含正确 bundle
- 消除安装风险提示

**Non-Goals:**
- 不修改 React Native 代码逻辑
- 不改变应用的功能和 UI
- 不升级 React Native 版本

## Decisions

### 1. 配置文件规范

**决定**：统一使用 Kotlin DSL (.gradle.kts)

**理由**：
- Kotlin DSL 提供更好的类型安全和 IDE 支持
- 消除 Groovy/Kotlin 混用导致的配置不一致
- 社区主流方案，便于维护

**替代方案考虑**：
- 全部改回 Groovy：需要更多改动，收益不大

### 2. 构建脚本架构

**决定**：将所有构建脚本放在 `client-app/scripts/` 目录下

**理由**：
- 遵循 React Native 社区最佳实践
- 便于统一管理和版本控制
- 分离平台无关逻辑和平台特定逻辑

**脚本结构**：
```
client-app/scripts/
  ├── android/
  │   ├── bundle.js        # 打包 RN bundle
  │   ├── copy-bundle.js   # 复制 bundle 到 Android 资源目录
  │   ├── dev.js           # 开发模式构建脚本
  │   └── release.js       # 发布模式构建脚本
  └── shared/
      └── constants.js     # 共享配置常量
```

### 3. 签名配置

**决定**：使用明确的签名配置，消除 V1/V2 签名混用问题

**理由**：
- V1+V2 混用可能导致部分设备安装时出现风险提示
- 使用 V2 签名（Android 7.0+）配合 V1 签名（兼容老设备）

### 4. 调试构建配置

**决定**：调试构建使用 JS bundle 内置模式（不依赖 Metro）

**理由**：
- 确保应用可以在没有 Metro 服务器的情况下启动
- 便于测试和分享

## Risks / Trade-offs

- **[风险]** Gradle 插件版本兼容性 → **缓解**：使用经过验证的稳定版本组合
- **[风险]** 签名配置变更导致已有 keystore 失效 → **缓解**：保留现有 keystore，仅修改签名配置
- **[风险]** 构建流程变化导致现有 CI/CD 中断 → **缓解**：提供兼容的脚本接口

## Migration Plan

1. 备份现有配置文件
2. 创建新的 Gradle 配置文件（Kotlin DSL）
3. 移动和重构构建脚本到 `client-app/scripts/android/`
4. 更新 `package.json` 的 npm scripts
5. 验证开发模式构建 (`npm run dev:android`)
6. 验证发布构建 (`npm run build:android:release`)
7. 验证 APK 可以正常安装和启动
8. 清理旧配置文件

## Open Questions

- 是否需要保留对 Android 5.x (API 21) 的兼容支持？
- 是否需要配置代码混淆 (ProGuard/R8)？