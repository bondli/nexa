# Code Style Rules（代码风格规范）

本规范用于约束所有由 Claude 生成或修改的代码，必须严格遵守。

---

## 一、通用规则（General Rules）

1. 所有代码必须保持清晰、可读、结构化
2. 禁止生成冗余代码或未使用的变量
3. 必须遵循模块化设计，避免单文件过大
4. 命名必须语义化，禁止使用无意义命名（如 a, b, temp）

---

## 二、JavaScript / TypeScript 规范

### 1. 分号（强制）和引号

- 每一行代码必须以分号结尾
- 禁止省略分号（即使语法允许）
- 字符串必须使用单引号
- 对于多行字符串，必须使用反引号

示例：
const name = 'Nexa';

---

### 2. 变量声明

- 优先使用 const
- 仅在必要时使用 let
- 禁止使用 var

---

### 3. 函数写法

- 优先使用箭头函数
- 保持函数职责单一

示例：
const getUserName = (user: User): string => {
  return user.name;
};

---

### 4. 类型定义（TypeScript）

- 必须为函数参数和返回值添加类型
- 推荐使用 type 而不是 interface（除非明确需要扩展）

---

## 三、React 组件规范

### 1. 组件结构

- 一个组件一个目录，放在frontend/components下
- 目录命名采用 PascalCase（如 NoteCard）
- 组件目录下，一定有一个index.tsx 文件作为组件入口
- 如果有样式，则必须有index.module.less 文件

---

### 2. 组件写法

示例：
import styles from "./index.module.less";

type Props = {
  title: string;
};

const NoteCard = ({ title }: Props) => {
  return <div className={styles.container}>{title}</div>;
};

export default NoteCard;

---

### 3. 状态管理

- 使用 useState / useEffect
- 避免在组件中写复杂业务逻辑（应放入 service）

---

## 四、样式规范（强制）

### 1. 样式必须独立文件（强制）

- 禁止使用 inline style
- 禁止在组件中写 <style>
- 必须使用 CSS Modules

---

### 2. 样式方案

- 使用 .module.less 文件
- 每个组件对应一个样式文件

示例结构：
NoteCard/index.tsx
NoteCard/index.module.less

---

### 3. 引入方式

import styles from "./index.module.less";

---

### 4. 类名规范

- 使用语义化命名
- 推荐简单语义命名

示例：
.container {
  padding: 12px;
}

.title {
  font-size: 16px;
}

---

## 五、注释规范（强制）

### 1. 必须添加必要注释

以下场景必须写注释：

- 复杂逻辑
- 数据处理逻辑
- AI 调用逻辑
- 非直观代码
- 注释需要使用中文

---

### 2. 注释要求

- 使用中文注释
- 说明“为什么”，而不仅是“做什么”

示例：
// 根据用户输入生成 embedding，用于后续语义搜索
const embedding = await generateEmbedding(text);

---

### 3. 禁止无意义注释

错误示例：
const a = 1; // 设置a为1

---

## 六、文件结构规范

推荐结构：

/frontend
  /components
  /pages
  /services
  /utils
  /commons
  /hooks

---

## 七、AI 调用规范（重要）

- 所有 AI 相关调用必须封装在 /services/aiService.ts
- UI 层禁止直接调用 AI API

---

## 八、错误处理

- 必须处理 async/await 错误
- 禁止忽略异常

示例：
try {
  const result = await fetchData();
} catch (error) {
  console.error("数据获取失败:", error);
}

---

## 九、输出要求（针对 Claude）

当生成代码时，必须：

1. 严格遵守本规范
2. 自动补充分号
3. 自动拆分样式文件
4. 自动添加必要注释
5. 保持代码可直接运行

---

## 十、优先级说明

本规则优先级高于默认代码风格。

如有冲突，必须以本规则为准。