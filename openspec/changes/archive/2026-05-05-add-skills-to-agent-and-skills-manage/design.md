## Context

当前系统已有基于内存的 `SkillRegistry`（`server/services/agent/skills/registry.ts`），管理内置 skills 的注册和执行。但用户安装的自定义 skills 没有持久化，重启后丢失，且缺少管理界面。

需求将：
- 在 `frontend/pages/ChatBox` 新增 Skills 管理入口（替换左上角 New Chat 按钮）
- 通过 Drawer 展示已安装的 skills，支持禁用、删除、上传新 skill
- Skill 元数据持久化到数据库（新增 `skill` 表和 `server/models/skill.ts`）
- 新增 `server/controllers/skill-controller.ts` 处理 CRUD
- Agent 初始化时从数据库加载已安装且未禁用的 skills

## Goals / Non-Goals

**Goals:**
- 提供 Skills 管理 UI 入口，替换左上角 New Chat 按钮
- 支持上传 skill 目录并解析 skill.md 获取元数据
- 支持禁用/删除已安装的 skills
- Skill 数据持久化到 MySQL，重启后保留
- Agent 聊天时可调用已安装的 skills
- 支持导出所有 skills 为 zip，用于换设备时恢复

**Non-Goals:**
- Skill 运行时环境沙箱（已在 `sandbox/executor.ts` 处理）
- Skill 市场/商店（仅本地管理）
- Skill 版本更新机制

## Decisions

### 1. 新增 Skill 数据模型

**Decision:** 新增 `server/models/skill.ts`，对应 `skill` 表。

**Schema:**
```typescript
// server/models/skill.ts
Skill {
  id: int (PK, auto)
  name: string (unique)
  description: text
  version: string
  author: string
  category: string (nullable)  // 预留分类
  tags: string (nullable)      // JSON 数组格式
  enabled: boolean (default true)
  createdAt: datetime
  updatedAt: datetime
}
```

**注意：** Skill 脚本实际存储在文件系统，不在 DB 中。DB 只存元数据。

### 2. Skill 存储结构

**存储位置：** `~/.nexa/skills/<skill-name>/`

**目录结构：**
```
~/.nexa/skills/calculator/
  skill.md      # 必须，包含元数据
  index.js     # 入口脚本
  utils.js     # 其他脚本
  ...
```

**skill.md 格式（参考 OpenClaw）：**
```markdown
# Calculator
name: calculator
description: 计算器技能，可以执行数学运算
version: 1.0.0
author: xxx
```

### 3. Skill Controller 接口

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | /skill/list | 获取已安装的 skills |
| GET | /skill/:name | 获取 skill 详情 |
| POST | /skill/parse | 解析 skill.md，返回元数据 |
| POST | /skill/install | 安装新 skill |
| PUT | /skill/:name/toggle | 启用/禁用 skill |
| DELETE | /skill/:name | 删除 skill |
| GET | /skill/export-all | 导出所有 skills 为 zip |

### 4. 前端 SkillManage 组件

**Structure:**
```
frontend/pages/ChatBox/SkillManage/
  index.tsx          # 主组件，入口按钮 + Drawer + 导出按钮
  SkillList.tsx      # skills 列表
  AddSkillModal.tsx  # 添加 skill Modal
  index.module.less
```

**创建流程：**
1. 用户上传 skill 目录文件
2. 前端解析 `skill.md` 内容，自动填充 name、description
3. 用户填写 version、author、category、tags
4. 提交安装

### 5. Agent 入口文件查找

**Decision:** 启动时从 `~/.nexa/skills/<skill-name>/` 目录加载 skill，优先使用 `index.js`，否则使用第一个 `.js` 文件。

### 6. Skill 导出/导入

**导出：** GET `/skill/export-all` 返回 zip 包，包含所有 skills 目录 + metadata.json

**导入（预留）：** POST `/skill/import` 解压 zip 到 skills 目录并写入 DB

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Skill 目录结构不标准 | skill.md 解析失败时提示用户 |
| 导出文件跨设备兼容 | metadata.json 记录完整元数据 |
| Skill 命名冲突 | DB 层 name 字段 unique 约束 |

## Open Questions

1. **导入功能**：是否需要实现 zip 解压导入？目前预留接口。
