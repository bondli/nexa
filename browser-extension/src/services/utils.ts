// 存储 key - 与 frontend 对齐
const LOGIN_DATA_KEY = 'loginData';

// 用户信息类型
export interface UserInfo {
  id: number;
  name: string;
  avatar?: string;
  [key: string]: unknown;
}

/**
 * 获取存储的登录信息
 */
export const getLoginData = async (): Promise<UserInfo | null> => {
  const result = await chrome.storage.local.get(LOGIN_DATA_KEY);
  return result[LOGIN_DATA_KEY] || null;
};

/**
 * 保存登录信息
 */
export const setLoginData = async (user: UserInfo): Promise<void> => {
  await chrome.storage.local.set({ [LOGIN_DATA_KEY]: user });
};

/**
 * 清除登录信息
 */
export const clearLoginData = async (): Promise<void> => {
  await chrome.storage.local.remove(LOGIN_DATA_KEY);
};

/**
 * 获取用户 ID
 */
export const getUserId = async (): Promise<number> => {
  const loginData = await getLoginData();
  return loginData?.id || 0;
};

/**
 * 判断是否已登录
 */
export const isLoggedIn = async (): Promise<boolean> => {
  const loginData = await getLoginData();
  return !!(loginData && loginData.id);
};