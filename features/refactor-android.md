# Nexa - AI 知识库桌面应用

## 需求功能
- 重构./client-app/android下的实现；
- 目前存在的问题：
  - 打包特别乱，配置特别乱
  - 存在无法启动应用的情况
  - 打包完成安装之后存在风险提示
- 期望：
  - 不会破坏现有功能
  - 代码结构清晰
  - 配置文件规整
  - 可以正常打包运行
- 期望后续的工作流：
  - dev: 在./client-app/下执行npm run dev:android，进行rn的metro server启动，连接本机的模拟器进行应用启动，并加载metro server提供的热更新的bundle
  - build: 在./client-app/下执行npm run build:android:release，进行打包生成apk
    - 先打包rn的bundle,然后copy到android的指定目录下
    - 再打包出签名的apk（消灭一些打包过程中的warn信息）
    - 要求，脚本都统一放在./client-app/scripts下
