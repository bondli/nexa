# Nexa - AI 知识库桌面应用

## 需求功能
- 用户登录页面和安装页面需要支持暗黑模式
- 用户登录页面和安装页面因为electron层面去掉了titlebar，需引入前端的titlebar组件来占位
- 生成文章图片的html模版字体太大，需要缩写点，让他能更加的美观

### 目标
- 让用户登录和软件初始化安装的页面支持暗黑模式
- 页面适配暗黑模式，包括但不限于：背景色、文字颜色、按钮样式等
- 引入前端titlebar组件来占位，使页面在electron中显示正常
- 生成文章图片的html模版字体缩小可以放下更多文字信息，而且更美观

### 上下文
- 用户登录页面： frontend/modules/UserPage
- 初始化安装页面： frontend/modules/BootPage
- 前端titlebar组件：frontend/components/TitleBar
- 生成文章图片的html模版：server/services/article-template-service.ts中的getHtmlTemplate函数


### 验收标准
- 进入桌面端，设置暗黑模式，退出登录，进入用户登录页面，看下暗黑模式下是正常
- 进入桌面端，点击一个没有图片的文章，生成文章图片，看html模版字体大小合适，内容展示清晰美观