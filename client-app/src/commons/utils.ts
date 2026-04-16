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

export {
  setStorage,
  getStorage,
  removeStorage,
};