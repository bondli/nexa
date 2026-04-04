import { notification } from 'antd';
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { userLog, getStore } from '@commons/electron';
import { API_BASE_URL } from '@commons/constant';

// 统一响应数据类型 - 与后端格式对齐
export interface ApiResponse<T = any> {
  code: number;
  message?: string;
  data?: T;
  count?: number;
  [key: string]: any;
}

// 扩展 AxiosInstance 类型
interface CustomAxiosInstance extends Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch'> {
  get<T = any>(url: string, config?: any): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
  delete<T = any>(url: string, config?: any): Promise<ApiResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
}

// 创建axios实例
const service = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
}) as CustomAxiosInstance;

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers['X-From'] = 'Nexa-App-Client';
    const loginData = getStore('loginData') || {};
    config.headers['X-User-Id'] = loginData.id || 0;
    return config;
  },
  (error) => {
    userLog('request error:', error);
    notification.error({
      message: '请求出错',
      description: error?.message || `unknown error`,
      duration: 3,
    });
    Promise.reject(error);
  },
);

// 响应拦截器 - 适配新的统一响应格式
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>): any => {
    const { code, message } = response.data;

    // 检查业务错误码
    if (code !== 0) {
      notification.error({
        message: '操作失败',
        description: message || '未知错误',
        duration: 3,
      });
      // 返回原始响应，包含 code 字段用于调用方判断
      return response.data;
    }

    // 成功时返回完整响应对象，包含 code、data、count
    // 调用方可以通过 response.data 获取数据，或通过 response.count 获取总数
    return response.data;
  },
  (error) => {
    userLog('response error:', error);
    notification.error({
      message: '服务器响应出错',
      description: error?.message || `unknown error`,
      duration: 3,
    });
    return Promise.reject(error);
  },
);

export default service;
