# Nexa - AI 知识库桌面应用

## 需求功能
- 桌面端文章管理中，给每个文章增加AI生成图片的功能
- 现状：
  - 文章管理中，如果文章有图片，则点击文章列表的文章的图标，能预览这个图片，但是没有图片的文章缺少生成图片的功能，需要增加一个生成图片的功能
- 具体功能点：
  - 文章如果没有图片（image字段为空），点击文章的avatar调用接口去生成图片
  - 点击avatar后，先打开一个Modal，Modal内容为：'正在调用AI生成图片，请稍等...'
  - 调用后端接口生成图片，会分成两个步骤，先以AI的内容调用LLM，生成摘要信息，然后结合给到的HTML模板生成html，展示出来
  - 然后让用户基于看到的HTML内容，点击转成图片，，调用htmltocanvas得到图片，上传到云端，最后将图片云端地址更新到文章表中
  - 成功后，关闭Modal，刷新当前文章列表，如果调用失败，提示错误信息

### 目标
- 给文章增加图片生成功能
- 可以参考浏览器插件端的实现（./browser-extension/src/content/components/ArticleCollectModal/Step3GenerateImage.tsx）

### 上下文
- 前端：./frontend/pages/Article/articles.tsx
- 后端：
  - 使用已有的文章图片生成接口：/article/generate-image
  - 使用已有的图片上传接口：/common/uploadFile?fileType=image
  - 上传才能之后，需要调用已有的文章更新接口：/article/update（只更新image字段）

### 验收标准
- 桌面端文章管理中，点击没有图片的文章的图标，验证是否有生成图片的功能入口，以及验证是否有图片生成