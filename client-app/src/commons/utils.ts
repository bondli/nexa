import LocalStorageManager from '@modules/LocalStorageManager';
import ScannerManager from '@modules/ScannerManager';

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

const gotoScanner = async (onSuccess: (result: any) => void, onFail: (error: string) => void) => {
  try {
    console.log('Starting scan...');
    const result = await ScannerManager.scanQRCode();
    console.log('Scan result:', result);
    onSuccess(result);
  } catch (error: any) {
    console.log('Scan failed:', error);
    onFail(error?.message || 'Scan failed');
  }
};

export {
  setStorage,
  getStorage,
  removeStorage,
  gotoScanner,
}