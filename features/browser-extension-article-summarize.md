# Nexa - AI 知识库桌面应用

## 需求功能
- 浏览器插件端支持AI对文章总结和基于总结内容进行生成图片
- 现状：
  - 浏览器端面对文章仅仅具备一键采集功能，采集回来的原文可读性比较差，现在需要对交互实现做优化
- 具体功能点：
  - 还是叫一键采集，分成三个步骤：1、采集原文；2、AI总结原文；3、基于总结内容生成图片
  - 目前的UI实现上需要大改，做成3个步骤的UI，前置UI界面不需要改，保留点击悬浮图标，出现采集面板，点击“一键提取”按钮之后，关闭采集面板，然后：
    - 弹出一个Modal框，每一步都支持tab切换，当这个步骤还没有开始的时候不可切换到写个步骤的面板
    - 第一步：采集原文（这个可以复用现有逻辑），采集到的内容使用Markdown编辑器预览
    - 第二步：AI总结原文，只有第一步完成了之后才自动进行这个步骤，AI总结的内容也是采用Markdown编辑器预览
    - 第三步：基于总结内容生成图片，只有第二步完成了才会进入到这个步骤，图片的生成我会给你一个html模版，你先生成html，然后通过html2canvas的方式生成图片

### 目标
- 升级现有的浏览器插件采集文章的交互和功能，支持对文章进行总结和基于总结内容生成图片
- 充分利用现有的实现方案和antd的组件来实现

### 上下文
- 浏览器插件端：./browser-extension/src/content/content.tsx
- 后端：
  - 文章总结：接口：/article/summarize，代码：server/controllers/article-controller.ts
  - 新增文章图片生成的接口：/article/generate-image，代码写到`server/controllers/article-controller.ts`中
    - 参数是文章总结的内容，调用AI，依据html的模版来生成html页面，然后走html2canvas的方式生成图片,图片需要同步到云端，拿到图片地址在插件端里面渲染
  - 文章采集：
    - 接口：/article/save，代码：server/controllers/article-controller.ts
    - 需要新增`summary`（总结内容）的写入

### 验收标准
- 刷新浏览器插件，然后走一遍流程