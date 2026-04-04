# Nexa - AI 知识库桌面应用

## 需求功能

- 将server/controllers下的接口返回格式统一
  - 成功：
    - 原来是：res.status(200)：
    - 原来是：res.json
    - 都给到前端是：{"code": 0, message: "xxx", data: any}
  - 失败：
    - 原来是：res.status(x).json
    - 原来是：res.json({ error: 'xxx' });
    - 都给到前端是：{"code": x, message: "xxx"}

- 将前端处理请求的工具（frontend/commons/request.ts）看看如何对齐
- 将前端调用了接口的地方的处理，看看如何对齐