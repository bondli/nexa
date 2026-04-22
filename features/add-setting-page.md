# Nexa - AI 知识库桌面应用

## 需求功能
-  添加设置页面，允许用户配置应用相关的数据
- 前端：
  - 在左下角用户信息组件(在frontend/modules/MainPage/index.tsx里面调用的)对应的图标上面多一个设置的入口，antd的设置图标展示，封装成一个React组件：Setting（放在组件目录：frontend/components/Setting）
  - 点击图标，使用antd的Drawer组件从页面右边拉出抽屉，加载设置界面
  - 里面是表单分组，有：数据库配置，LLM设置，embedding设置，qdrant服务器设置，图片服务器设置 5个分组表单
  - 这五个分组表单分别对应~/.nexa/里面的：setting.json/llm.json/embedding.json/qdrant.json/api.json
  - 打开抽屉需要通过接口获取这五个json的数据，然后渲染的时候填充这些表单
  - 底部有个保存的按钮，点击保存通过接口对这些数据做保存和更新
- 后端：
  - 添加接口：/api/settings/get  获取设置数据
  - 添加接口：/api/settings/save  保存设置数据
- 其他：
  - 目前分散成5个配置文件有点多，我想合并成一个，最终只保留一个~/.nexa/config.json文件，包含所有配置项