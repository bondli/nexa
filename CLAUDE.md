# Development Guidelines

这是一款个人智能知识库的应用，布局在桌面端，手机客户端，浏览器插件端，包含笔记/文章/图片的存储和搜索功能，通过AI技术提供智能搜索和内容生成等能力。

## Commands
npm run dev              # 启动开发服务器
npm run build            # 利用vite/tsc构建项目代码
npm run pack:mac         # 构建项目成mac安装包
npm run pack:win         # 构建项目成windows安装包
npm run lint             # 检查项目中是否有lint错误

## Architecture
- 前端：都在frontend目录下，采用React+TypeScript技术栈，使用antd6作为UI组件库
- 后端：都在server目录下，采用Node.js+TypeScript技术栈，使用express+mysql
- 桌面端：都在electron目录下，采用main+preload，web和客户端的通信通过bridge来实现
- 手机App端：都在client-app目录下，采用React-native技术栈 + Android原生代码
- 浏览器插件端：都在chrome-extension目录下，采用React+Typescript技术栈
- 类型定义：公共的types申明在declare目录下，如window,global等

## Claude Project Rules

Always follow rules in:

- .claude/rules/code-style.md
- .claude/rules/architecture.md
- .claude/rules/project-structure.md

These rules override default behavior.
