## 1. 数据库层

- [x] 1.1 创建 `server/models/skill.ts` 数据模型，包含 name、description、version、author、category、tags、enabled 字段
- [x] 1.2 执行数据库迁移，创建 skill 表（通过 sequelize.sync 自动创建）

## 2. 后端接口层

- [x] 2.1 创建 `server/controllers/skill-controller.ts`
- [x] 2.2 实现 POST /skill/parse 接口，解析 skill.md 返回元数据
- [x] 2.3 实现 POST /skill/install 接口，支持上传文件 + 元数据
- [x] 2.4 实现 PUT /skill/:name/toggle 接口，支持启用/禁用 Skill
- [x] 2.5 实现 DELETE /skill/:name 接口，支持删除 Skill
- [x] 2.6 实现 GET /skill/:name 接口，支持获取 Skill 详情
- [x] 2.7 实现 GET /skill/export-all 接口，导出所有 Skills 为 zip
- [x] 2.8 实现 GET /skill/list 接口，获取 Skills 列表
- [x] 2.9 在 `server/routes/` 中注册 skill 相关路由

## 3. Agent 集成

- [x] 3.1 在 `server/services/agent/manager.ts` 中添加 loadSkillsFromDB 函数
- [x] 3.2 启动时调用 initializeAgentSkills 加载 DB 中的 enabled Skills 到 registry
- [x] 3.3 Skill 入口文件自动查找（优先 index.js，否则第一个 .js 文件）

## 4. 前端 Skill 管理组件

- [x] 4.1 创建 `frontend/pages/ChatBox/SkillManage/` 目录结构
- [x] 4.2 SkillManage 主组件（按钮 + Drawer + 导出按钮）
- [x] 4.3 SkillList 子组件，展示 Skills 列表（名称、描述、版本、分类、标签、状态开关、删除）
- [x] 4.4 AddSkillModal 子组件，支持上传文件、解析 skill.md、自动填充表单
- [x] 4.5 在 ChatBox 入口文件中替换左上角 NewChatButton 为 SkillManage

## 5. 验证测试（需手动）

- [ ] 5.1 启动应用，点击 Skills 按钮验证 Drawer 展示
- [ ] 5.2 上传一个 skill 目录（包含 skill.md），验证解析和自动填充
- [ ] 5.3 安装成功后验证目录存储和数据库持久化
- [ ] 5.4 在聊天中调用已安装的 Skill 验证执行流程
- [ ] 5.5 禁用/删除 Skill 验证状态更新
- [ ] 5.6 导出所有 Skills 验证 zip 包
