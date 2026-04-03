import 'express';

/**
 * 扩展 Express Request 类型，添加自定义请求头
 */
declare module 'express' {
  interface Request {
    /**
     * 用户ID，从请求头 x-user-id 获取
     */
    'x-user-id'?: string;
  }
}
