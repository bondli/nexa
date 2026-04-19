import LocalStorageManager from '@modules/LocalStorageManager';
import ShareModuleInterface from '@modules/ShareModule';

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

// 解析 URL Scheme 参数（nexa://share/article?title=xxx&url=xxx）
const parseShareUrl = (url: string): ShareParams | null => {
  console.log('Parsing share URL:', url);
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'nexa:') {
      const title = parsed.searchParams.get('title') || '';
      const articleUrl = parsed.searchParams.get('url') || '';
      if (articleUrl) {
        return { title, url: articleUrl };
      }
    }
  } catch (error) {
    console.error('Failed to parse share URL:', error);
  }
  return null;
};

type ShareParams = {
  title: string;
  url: string;
};

/**
 * 冷启动场景：从 ShareModule（Native 内存）获取分享 URL 并解析
 * 取走后 Native 侧自动清空，不会重复弹出
 */
const getInitialShareParams = async (): Promise<ShareParams | null> => {
  try {
    const rawUrl = await ShareModuleInterface.getInitialShareUrl();
    if (!rawUrl) return null;
    console.log('Got initial share URL from ShareModule:', rawUrl);
    return parseShareUrl(rawUrl);
  } catch (error) {
    console.error('Failed to get initial share URL:', error);
    return null;
  }
};

export {
  setStorage,
  getStorage,
  removeStorage,
  checkUserInfo,
  parseShareUrl,
  getInitialShareParams,
};
