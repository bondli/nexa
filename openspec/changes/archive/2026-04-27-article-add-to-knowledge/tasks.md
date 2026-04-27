## 1. Frontend - Actions.tsx 修改

- [x] 1.1 在操作菜单中添加「添加到知识库」菜单项（位于「移动分类」之后）
- [x] 1.2 添加知识库选择状态（showAddToKnowledgePanel, selectedKnowledgeId）
- [x] 1.3 添加「添加到知识库」点击处理函数，打开知识库选择弹窗
- [x] 1.4 创建知识库选择弹窗 UI（Modal + Select）

## 2. Frontend - Knowledge 状态获取

- [x] 2.1 在 Actions.tsx 中引入 KnowledgeContext 获取知识库列表
- [x] 2.2 处理知识库列表为空的情况（显示提示）

## 3. Frontend - API 调用

- [x] 3.1 实现确认添加处理函数，调用 `/knowledge/addToKnowledge` API
- [x] 3.2 添加成功/失败的提示反馈
- [x] 3.3 添加 loading 状态

## 4. 验证

- [ ] 4.1 启动开发服务器验证功能入口显示正常
- [ ] 4.2 验证知识库选择弹窗显示正常
- [ ] 4.3 验证文章成功添加到知识库
- [ ] 4.4 验证添加到已存在的知识库时行为正确
