# Design: 统一前后端 API 响应格式

## 1. 响应格式定义

### 成功响应
```typescript
{
  code: 0,           // 0 表示成功
  message: "操作成功", // 可选的成功信息
  data: any          // 实际数据
}
```

### 失败响应
```typescript
{
  code: number,      // 非0的错误码
  message: string    // 错误信息
}
```

### 分页响应
```typescript
{
  code: 0,
  message: "success",
  data: T[],
  count: number      // 总数
}
```

## 2. 后端实现方案

### 2.1 创建响应工具函数

在 `server/utils/` 下创建 `response.ts`：

```typescript
// 成功响应
export const success = (res: Response, data?: any, message = 'success'): void => {
  res.status(200).json({ code: 0, message, data });
};

// 分页成功响应
export const successWithPage = (res: Response, data: any[], count: number): void => {
  res.status(200).json({ code: 0, message: 'success', data, count });
};

// 失败响应
export const fail = (res: Response, code: number, message: string): void => {
  res.status(code).json({ code, message });
};

// 快捷方法
export const badRequest = (res: Response, message: string) => fail(res, 400, message);
export const unauthorized = (res: Response, message = 'Unauthorized') => fail(res, 401, message);
export const forbidden = (res: Response, message = 'Forbidden') => fail(res, 403, message);
export const notFound = (res: Response, message = 'Not found') => fail(res, 404, message);
export const serverError = (res: Response, message = 'Internal server error') => fail(res, 500, message);
```

### 2.2 Controller 修改模式

每个 controller 需要：
1. 引入响应工具函数
2. 替换所有 `res.json()` 和 `res.status().json()` 调用
3. 使用统一的错误码

### 2.3 需要修改的文件列表

1. `server/controllers/note-controller.ts`
2. `server/controllers/cate-controller.ts`
3. `server/controllers/chat-controller.ts`
4. `server/controllers/common-controller.ts`
5. `server/controllers/docs-controller.ts`
6. `server/controllers/knowledge-controller.ts`
7. `server/controllers/settings-controller.ts`
8. `server/controllers/user-controller.ts`
9. `server/controllers/install-controller.ts`

## 3. 前端实现方案

### 3.1 更新 request.ts

响应拦截器需要适配新格式：

```typescript
// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<{ code: number; message: string; data?: any; count?: number }>) => {
    const { code, message, data } = response.data;
    if (code !== 0) {
      notification.error({
        message: '操作失败',
        description: message || '未知错误',
        duration: 3,
      });
      return Promise.reject(new Error(message));
    }
    return response.data;
  },
  (error) => {
    // 错误处理
  }
);
```

### 3.2 调用方处理

前端调用方可以简化为：
```typescript
const result = await noteService.getNotes(cateId);
// 直接使用 result.data 和 result.count
```

## 4. 错误码规范

| 错误码 | 含义 |
|--------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未登录 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 5. 实施顺序

1. 创建 `server/utils/response.ts` 工具函数
2. 逐个修改后端 controller
3. 更新前端 `request.ts`
4. 全量分析调用了接口的地方，去检查是否要更新获取接口返回的值存在不对的情况，进行调整对齐
5. 测试验证