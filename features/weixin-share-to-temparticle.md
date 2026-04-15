# Nexa - AI 知识库桌面应用

## 需求功能
- 支持在微信中看到的文章，点击分享，可以选择到手机端安装的Nexa应用，拉起一个中间页，将微信侧给到的文章标题/url，写入到临时文章表
- 数据库端：临时文章表新增一个字段：title
- RN端：在client-app/src/services/ArticleService.ts 中新增一个方法：shareToTempArticle，实现写入`TempArticle`表的功能
- RN端：在页面`Article`(client-app/src/pages/Main/Article/index.tsx)中，临时文章的tab下展示的列表中每一个临时文章的展示上和其他文章有所区别，需要展示title和url，点击是打开微信，再打开这个这个文章
- desktop端：在页面`Article`(frontend/pages/Article/Articles.tsx)中，临时文章展示的列表中也是需要展示title和url，url展示在普通文章的desc位置，点击不是进入详情，而是在浏览器中打开，右侧的Actions组件，针对临时文章只有删除功能（删除是软删除，也是可以在回收站中恢复）
