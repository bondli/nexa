# Project Structure Rules（项目结构规范）

本规范用于统一项目目录结构，Claude 必须严格按照该结构生成代码。

---

## 一、根目录结构

/nexa                # 项目根目录
  declare            # 全局types申明
  electron           # electron代码
    /main.js
    /preload.js
  frontend           # 前端代码
    /components      # 组件
    /pages           # 页面
    /services        # 业务逻辑
    /commons         # 公共
    /utils           # 工具函数
    /styles          # 样式文件
    /types           # 类型定义
  public
    /assets          # 静态资源
    /icons           # 应用图标
  server
    /config          # 配置文件
    /controllers     # 数据访问层
    /models          # 数据模型，表定义
    /routes          # 路由定义
    /services        # 服务层
  README.md
  package.json       # 项目配置文件（前后端以及electron的依赖都在这个里面定义）
  tsconfig.json      # ts配置文件
  vite.config.ts     # vite配置文件

---

## 二、组件结构规范

/components 每个组件必须独立目录：

示例：
/components/NoteCard
  index.tsx
  index.module.less

---

## 三、页面结构

/pages 下每个页面单独一个文件夹：

/pages/Note
  index.tsx
  Note.module.less

---

## 四、Service 结构

/services
  noteService.ts
  aiService.ts
  searchService.ts

要求：

- 每个 service 只负责一个领域
- 不允许写 UI 逻辑

---

## 五、数据库层

/model
  note.ts
  user.ts

要求：

- 只做数据模型定义
- 不写业务逻辑

---

## 六、类型定义

/types
  note.ts
  ai.ts

---

## 七、命名规范

- 文件名：kebab-case 或 PascalCase
- 组件：PascalCase
- 变量：camelCase

---

## 八、禁止行为

- 禁止所有代码写在一个文件
- 禁止组件和样式混写
- 禁止 UI 层直接操作数据库

---

## 九、输出要求

Claude 在生成代码时必须：

- 自动放入正确目录
- 遵守命名规范
- 保持结构清晰

---

## 十、优先级

本规范高于默认结构生成规则。