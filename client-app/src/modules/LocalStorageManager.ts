import { NativeModules } from 'react-native';

const { LocalStorageManager } = NativeModules;

interface LocalStorageManagerInterface {
  /**
   * 设置字符串值
   * @param key 键
   * @param value 值
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * 获取字符串值
   * @param key 键
   */
  getItem(key: string): Promise<string | null>;

  /**
   * 移除指定键
   * @param key 键
   */
  removeItem(key: string): Promise<void>;

  /**
   * 清空所有数据
   */
  clear(): Promise<void>;

  /**
   * 获取所有键
   */
  getAllKeys(): Promise<readonly string[]>;

  /**
   * 检查键是否存在
   * @param key 键
   */
  hasKey(key: string): Promise<boolean>;
}

const LocalStorageManagerModule: LocalStorageManagerInterface = {
  setItem: (key: string, value: string): Promise<void> => {
    return LocalStorageManager.setItem(key, value);
  },

  getItem: (key: string): Promise<string | null> => {
    return LocalStorageManager.getItem(key);
  },

  removeItem: (key: string): Promise<void> => {
    return LocalStorageManager.removeItem(key);
  },

  clear: (): Promise<void> => {
    return LocalStorageManager.clear();
  },

  getAllKeys: (): Promise<readonly string[]> => {
    return LocalStorageManager.getAllKeys();
  },

  hasKey: (key: string): Promise<boolean> => {
    return LocalStorageManager.hasKey(key);
  }
};

export default LocalStorageManagerModule;