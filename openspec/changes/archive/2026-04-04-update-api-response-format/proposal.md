# Proposal: 统一前后端 API 响应格式

## 背景

当前项目的 API 响应格式不统一，后端 controller 返回格式混乱，前端处理逻辑需要适配多种格式。

## 问题描述

### 后端问题
- 成功响应：有的用 `res.json(data)`，有的用 `res.status(200).json(result)`
- 错误响应：格式不统一 `{ error: 'xxx' }`、`{ message: 'xxx' }` 混用
- 共9个 controller 文件需要统一

### 前端问题
- `request.ts` 已有基础适配，但需要与新的统一格式对齐
- 各处调用接口后的处理逻辑需要统一

## 目标

统一所有 API 响应格式：
- **成功**：`{ code: 0, message: "xxx", data: any }`
- **失败**：`{ code: x, message: "xxx" }`

## 变更范围

### 后端 (server/controllers)
1. 创建统一的响应工具函数
2. 修改所有 controller 的返回格式

### 前端 (frontend)
1. 更新 `request.ts` 的响应拦截器
2. 更新调用方处理逻辑（如需要）

## 收益

- 前后端交互更清晰、可预测
- 错误处理更统一
- 维护成本降低