# Nexa - AI 知识库桌面应用

## 需求功能

- 实现一个和LLM聊天的功能
  - 前端页面是pages/ChatBox，和服务端对话需要是SSE的返回，服务端接口是: /chat/withllm
  - LLM需要一个配置文件来保存apikey，baseurl,modelname等关键必要信息，配置文件：~/.nexa/llm.json
  - 支持多种大语言模型,如OpenAI, Qwen, ChatGLM，minimax等
  - 不是简单的和大模型对话，需要支持：
    - 内部的工具调用，如写笔记，查天气等
    - 支持外部的skill安装和调用，目前预留既可，后续在界面上让用户上传skills到指定的目录下，扫描目录来加载
    - 支持多agent协同工作
    - 调用工具时，如果缺少必要参数，需要支持human-in-the-loop的交互
    - 每次新对话发起的时候往chat表中写入sessionId和生成一个临时的会话标题
    - 如果大模型返回了消息，后续需要总结会话的主题，并在页面左侧的会话列表中刷新标题
    - 删除会话的时候，同时删除会话下所有的消息
    - 预留后续选择知识库来对话，知识库的内容被向量化了，目前不用实现
    - 倾向于采用langchain.js + langgraph.js来实现agent
    - 目前会话相关的接口和功能已经实现，数据表Chat来保存了，并且在页面pages/ChatBox中前端和服务端都已实现
    - 会话的标题支持手动编辑，目前已经实现，希望随着对话轮次的增加能自动总结和提取合理的标题，实现更新，同步UI更新
    - 一个会话的消息需要持久化，使用mysql数据表来保存会话的消息，类似于langchain.js/langgraph.js的checkpoint机制，消息完整后一次性写入，不需要实时存储部分消息
    - agent的实现代码写到server/services/ai-service.ts中，如果复杂需要分模块，将ai-service改成目录，里面有很多模块文件
