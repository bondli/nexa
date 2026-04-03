import { notification } from 'antd';
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { userLog, getStore } from '@commons/electron';
import { API_BASE_URL } from '@commons/constant';

// 定义统一的响应数据类型
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  [key: string]: any;
}

// 扩展 AxiosInstance 类型，使其返回 ApiResponse 而不是 AxiosResponse
interface CustomAxiosInstance extends Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch'> {
  get<T = any>(url: string, config?: any): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
  delete<T = any>(url: string, config?: any): Promise<ApiResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
}

// 创建axios实例
const service = axios.create({
  baseURL: API_BASE_URL, // api的base_url
  timeout: 10000, // 请求超时时间
}) as CustomAxiosInstance;

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 可以在这里添加请求头部，例如token
    config.headers['X-From'] = 'Nexa-App-Client';
    const loginData = getStore('loginData') || {};
    config.headers['X-User-Id'] = loginData.id || 0;
    return config;
  },
  (error) => {
    // 请求错误处理
    userLog('request error:', error);
    notification.error({
      message: '请求出错',
      description: error?.message || `unknown error`,
      duration: 3,
    });
    Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    if (response.data?.error) {
      notification.error({
        message: '服务器响应出错',
        description: response.data?.error || `unknown error`,
        duration: 3,
      });
    }
    return response.data as unknown as AxiosResponse;
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
