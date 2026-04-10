import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// 服务端基础地址 - 与 frontend 对齐
const API_BASE_URL = 'http://localhost:7777/';

// 统一响应数据类型
export interface ApiResponse<T = unknown> {
  code: number;
  message?: string;
  data?: T;
  count?: number;
}

// 创建 axios 实例
const createRequest = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  // 请求拦截器
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      config.headers['X-From'] = 'Nexa-Browser-Extension';
      return config;
    },
    (error) => {
      console.error('request error:', error);
      return Promise.reject(error);
    }
  );

  // 响应拦截器 - 与 frontend 对齐
  client.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>): AxiosResponse<ApiResponse> => {
      const { code, message } = response.data;
      if (code !== 0) {
        console.error('操作失败:', message);
      }
      // 返回完整响应，调用方通过 response.data 获取数据
      return response;
    },
    (error) => {
      console.error('response error:', error);
      return Promise.reject(error);
    }
  );

  return client;
};

// 导出单例
const request = createRequest();

export default request;