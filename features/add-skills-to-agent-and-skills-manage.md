# Nexa - AI 知识库桌面应用

## 需求功能
- 支持对系统的skills管理和添加skills到agent中
- 具体功能点：
  - 在桌面端聊天页面，目前左上角的“New Chat”按钮，改成一个skills管理的入口，点击右侧拉出一个Drawer，对用户自定义的skills进行管理
  - skills管理页面中能看到自己安装的skill列表，可以对一个skill进行禁用也支持永久删除
  - skills管理页面右上角有一个新增skills的入口，点击弹出一个Modal对话框，可以上传一个skill的目录，将skill写入到agents下，同时写入一个skill数据表（需新增）
  - 用户在和agent聊天中，可以使用到这些已经安装的skills

### 目标
- 在桌面端聊天页面，左上角有个按钮支持点击打开skills管理drawer
- 支持在skills管理页面中，上传新的skill目录，后台接收到后，能够解析skill的元数据，并写入到数据库中
- 支持在聊天过程中，调用已经安装的skills来完成任务

### 上下文
- skill：是业内标准的skill格式，有name、desciption、version、author等元数据信息，里面有可能有一些node和python脚本都需要支持到
- 前端代码：./frontend/pages/ChatBox/index.tsx，这是入口文件，目前这个地方是一个NewChatButton，需要你新建一个SkillManage的组件来承载所有skill管理的能力（包含的是一个按钮，点击内部控制Drawer的展示和关闭）
- 后端：
  - 新增一个skill的controller来实现skill管理相关的接口：./server/controllers/skill-controller.ts
  - 新增一个skill的数据模型：./server/models/skill.ts
  - skill上传到哪里？skill的元数据如何解析？以及自定义的skill如何能被agent消费，你自行根据目前的视线设计方案


### 验收标准
- 进入桌面端，进入聊天页面，点击左上角的skills管理按钮，进入skills管理页面，能看到已安装的skills列表
- 在聊天过程中，调用已经安装的skills来完成任务