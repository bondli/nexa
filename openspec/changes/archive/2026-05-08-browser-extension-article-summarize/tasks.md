## 1. 浏览器插件 - Modal组件开发

- [x] 1.1 创建 ArticleCollectModal 组件目录结构
- [x] 1.2 实现 Modal 基础布局和 Tabs 结构
- [x] 1.3 实现步骤状态管理 (step1/2/3 完成状态)
- [x] 1.4 实现 Tab 切换禁用逻辑 (前置步骤未完成不可切换)
- [x] 1.5 添加 Modal 样式文件

## 2. 浏览器插件 - Step1 采集原文

- [x] 2.1 复用现有内容提取逻辑
- [x] 2.2 集成 Markdown 编辑器预览采集内容
- [x] 2.3 实现"下一步"按钮，手动触发进入Step2
- [x] 2.4 Step1完成状态管理

## 3. 浏览器插件 - Step2 AI总结

- [x] 3.1 调用 /article/summarize-content 接口
- [x] 3.2 显示AI总结加载状态
- [x] 3.3 集成 Markdown 编辑器预览总结内容
- [x] 3.4 总结完成后自动进入Step3 (或手动触发)
- [x] 3.5 Step2完成状态管理

## 4. 浏览器插件 - Step3 生成图片

- [x] 4.1 调用 /article/generate-image 接口
- [x] 4.2 显示图片生成加载状态
- [x] 4.3 展示生成的图片预览
- [x] 4.4 Step3完成状态管理

## 5. 浏览器插件 - 流程集成

- [x] 5.1 修改现有采集面板点击"一键提取"逻辑
- [x] 5.2 关闭采集面板，打开 ArticleCollectModal
- [x] 5.3 传递采集内容到 Step1
- [x] 5.4 完成后自动保存 (调用 /article/add)

## 6. 服务端 - /article/add 接口修改 & 数据库变更

- [x] 6.1 Article 表新增 `image` 字段 (图片云端地址)
- [x] 6.2 新增 `summary` 字段到文章保存逻辑
- [x] 6.3 确保 summary 和 image 字段正确写入数据库

## 7. 服务端 - /article/generate-image & /article/summarize-content 接口开发

- [x] 7.1 创建 /article/generate-image 接口路由
- [x] 7.2 实现 HTML 模板填充逻辑
- [x] 7.3 前端使用 html2canvas 进行截图
- [x] 7.4 实现图片上传到云端
- [x] 7.5 返回图片 URL
- [x] 7.6 新增 /article/summarize-content 接口 (支持直接对内容总结)

## 7.1 服务端 - 图文模版 AI 提取服务

- [x] 7.1.1 创建 article-template-service.ts 服务
- [x] 7.1.2 实现 extractDataForImage 函数 - AI 提取结构化数据
- [x] 7.1.3 实现 fillHtmlTemplate 函数 - 使用提取数据填充 HTML 模版
- [x] 7.1.4 修改 generateImageArticle - 先 AI 提取再填充模版

## 8. 测试与验收

- [ ] 8.1 刷新浏览器插件
- [ ] 8.2 测试完整3步流程
- [ ] 8.3 验证 AI 总结内容质量
- [ ] 8.4 验证生成的图片效果
- [ ] 8.5 验收标准检查
