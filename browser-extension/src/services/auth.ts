import request from './request';
import { setLoginData, clearLoginData, UserInfo } from './utils';

// 登录结果
export interface LoginResult {
  success: boolean;
  message?: string;
  user?: UserInfo;
}

/**
 * 用户登录
 */
export const login = async (username: string, password: string): Promise<LoginResult> => {
  try {
    const response = await request.post<any>('/user/login', {
      name: username,
      password,
    });

    const resData = response.data;

    if (resData.code === 0) {
      const user = resData.data as UserInfo;
      if (user && user.id) {
        await setLoginData(user);
        return { success: true, user };
      }
      return { success: false, message: '登录成功但未返回用户信息' };
    }

    return {
      success: false,
      message: resData.message || '用户名或密码错误',
    };
  } catch {
    return {
      success: false,
      message: '网络错误，请稍后重试',
    };
  }
};

/**
 * 退出登录
 */
export const logout = async (): Promise<void> => {
  await clearLoginData();
};