import LocalStorageManager from '@modules/LocalStorageManager';

const setStorage = (key: string, value: any) => {
  const storeValue = typeof value === 'object' ? JSON.stringify(value) : value;
  LocalStorageManager.setItem(key, storeValue as string);
};

const getStorage = async (key: string) => {
  const value = await LocalStorageManager.getItem(key);
  if (!value) return null;

  try {
    return JSON.parse(value as string);
  } catch {
    return value;
  }
};

const removeStorage = (key: string) => {
  LocalStorageManager.removeItem(key);
};

type UserInfo = {
  id: number;
  name: string;
};

// 检查登录态
const checkUserInfo = async (): Promise<UserInfo | null | undefined> => {
  try {
    const userInfo = await getStorage('userInfo');
    console.log('userInfo from cache:', userInfo);
    return userInfo;
  } catch (error) {
    console.error('get user info error:', error);
    return null;
  }
};

// 解析 URL Scheme 参数
const getUrlParams = (url: string) => {
  console.log('Received Native URL:', url);
  try {
    // 解析 nexa://share/article?title=xxx&url=xxx 或 nexa://?title=xxx&url=xxx
    const parsed = new URL(url);
    // 检查是否是 nexa 协议
    if (parsed.protocol === 'nexa:') {
      // 获取参数：可能是 pathname=/share/article 或直接是 query string
      const title = parsed.searchParams.get('title') || '';
      const url = parsed.searchParams.get('url') || '';
      if (url) {
        return { title, url };
      }
      return null;
    }
  } catch (error) {
    console.error('Failed to parse URL:', error);
    return null;
  }
};

const PENDING_SHARE_URL_KEY = 'pending_share_url';
type ShareParams = {
  title: string;
  url: string;
};

// 从 SharedPreferences 检查并获取待处理的分享 URL
const checkPendingShareUrl = async (): Promise<ShareParams | null | undefined> => {
  try {
    const pendingUrl = await getStorage(PENDING_SHARE_URL_KEY);
    if (pendingUrl) {
      console.log('Found pending URL from SharedPreferences:', pendingUrl);
      // 读取后立即清除，避免重复处理
      removeStorage(PENDING_SHARE_URL_KEY);
      console.log('Cleared pending URL from SharedPreferences');
      return getUrlParams(pendingUrl);
    }
  } catch (err) {
    console.error('Failed to get pending URL:', err);
  }
  return null;
};

export {
  setStorage,
  getStorage,
  removeStorage,
  checkUserInfo,
  getUrlParams,
  checkPendingShareUrl,
};