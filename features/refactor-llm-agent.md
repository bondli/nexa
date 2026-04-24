# Nexa - AI 知识库桌面应用

## 需求功能
- 重构和LLM聊天的服务端，以及内部的agent体系
- 目前已有的实现：前端（ChatBox页面） -> 服务端（server/chat-controller.ts/chatToLLM）-> AI服务（server/services/ai-service.ts）
- 内部实现的消息持久化切换成mysql了，个人感觉还不错，可以不用动，当然有优化空间也可以优化
- 目前实现agent是langchain.js,但感觉内部太乱了，需要重构

## 需求要求
- 使用 langchain.js + langchain体系下的deepagent 重新实现agent体系；
- llm的配置，之前已经实现，不需要考虑太多的LLM的provider了，就按我已有的配置（~/.nexa/config.json）来；
- 需要有工具调用能力，且调用工具的时候缺少参数，要能具备human-in-the-loop机制，让用户补充信息；
- 需要有持久化记忆能力，比如消息的持久化，目前已经有消息的mysql表来存储；
- 需要具备上下文压缩的能力，当上下文过长的时候，要能压缩上下文，保证LLM的输入在合理范围内；
- 需要具备回答问题前具备利用我有的向量知识库文档来做RAG，我目前已经部署了向量服务，已经有知识库，知识库内的文档也向量化存储了；
- 需要具备skill的能力，我把一些skill通过前端界面安装给agent，agent在执行的时候能够调用我安装的skill；
- 需要有多agent的设计，我后续需要拓展多agent协作

## 实现要求
- 使用 typescript 来实现
- 尽量模块化，每个文件的功能要内聚，不能写的太长
- 目录结构划分合理，一看就懂