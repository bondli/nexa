## Why

当前桌面端聊天页面左上角的"New Chat"按钮功能单一，用户无法管理已安装的 skills。通过将入口改为 skills 管理，可以方便用户查看、安装、禁用和删除 skills，提升 Agent 的可扩展性和用户体验。

## What Changes

- 将聊天页面左上角"New Chat"按钮替换为 Skills 管理入口按钮
- 新增 Skills 管理 Drawer，展示已安装的 skills 列表
- 支持对 skill 进行禁用和删除操作
- 新增"添加 Skill"功能，支持上传 skill 目录（包含 manifest.json 和脚本），解析元数据并存储到 `~/.nexa/skills/` 目录
- 新增 skill 数据模型和 controller，支持 skill 的 CRUD 操作
- Agent 聊天时可调用已安装的 skills

## Capabilities

### New Capabilities

- `skill-management`: 提供 skill 的管理界面（列表、禁用、删除、添加）
- `skill-persistence`: 将 skill 元数据持久化到数据库，支持 skill 的安装和卸载
- `skill-invocation`: Agent 在聊天过程中可以调用已安装的 skills

### Modified Capabilities

- `skill-system`: 扩展现有 skill 系统，支持从数据库加载用户安装的 skills

## Impact

- **前端**: 修改 `frontend/pages/ChatBox/index.tsx`，新增 `SkillManage` 组件和 skill 管理相关 UI
- **后端**: 新增 `server/controllers/skill-controller.ts` 和 `server/models/skill.ts`
- **数据库**: 新增 skill 数据表
- **Agent**: Agent 初始化时从数据库加载已安装的 skills
