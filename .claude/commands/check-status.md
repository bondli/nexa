# 项目状态检查命令

请检查当前项目的整体状态：

## 🔍 检查清单

### 1. 环境检查
运行命令：node -v（检查 Node 版本）
运行命令：npm list --depth=0（检查依赖安装）

### 2. 构建验证
运行命令：npm run build

### 3. Git 状态
运行命令：git status（查看未提交更改）
运行命令：git log --oneline -5（查看最近提交）

### 4. 代码质量
运行命令：npm run lint
运行命令：npm run test

### 5. 依赖检查
运行命令：npm outdated
运行命令：npm audit

## 📋 输出格式

请用表格格式输出：
- 环境检查结果
- 构建验证结果
- Git 状态
- 代码质量
- 依赖检查
- 待办事项（分优先级：紧急/重要/可选）