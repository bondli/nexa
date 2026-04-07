## Why

Nexa 需要一个知识库功能模块，用于管理和知识文档。当前系统已有笔记本功能，用户需要一个类似的结构来存储和管理知识性文档。

## What Changes

- 新增知识库页面 KnowBase.tsx，参考现有笔记本页面实现
- 知识库列表使用 antd Card 组件展示，左侧边栏
- 点击知识库后加载对应文档列表（右侧区域）
- 文档支持上传功能（区别于笔记本的手动输入）
- 文档支持 Markdown 编辑器预览
- 首次进入自动加载第一个知识库的文档
- 文档列表支持下载功能

## Capabilities

### New Capabilities

- `knowledge-base`: 知识库前端页面功能

### Modified Capabilities

- 无

## Impact

- 前端：新增/完善 `frontend/pages/Knowledge/` 目录下的多个组件
- 后端：已有 Knowledge 和 Docs 模型/Controller/Route，无需修改