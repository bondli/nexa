/**
 * Eletron.js
 * 封装了 web 与 electron 的通信
 */

const win: any = window;

const isInElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;
const ipcRenderer = win.electron?.ipcRenderer || {};

export const setStore = (key, value) => {
  if (!isInElectron) {
    win.localStorage.setItem(key, value);
    return;
  }
  ipcRenderer.setStoreValue(key, value);
};

export const getStore = (key) => {
  if (!isInElectron) {
    return win.localStorage.getItem(key);
  }
  return ipcRenderer.getStoreValue(key);
};

export const deleteStore = (key) => {
  if (!isInElectron) {
    win.localStorage.removeItem(key);
    return;
  }
  ipcRenderer.deleteStore(key);
};

// 打日志
export const userLog = (msg: any, msgData?: any) => {
  msgData ? console.log(msg, msgData) : console.log(msg);

  let outMsg = typeof msg === 'string' ? msg : JSON.stringify(msg);
  if (msgData) {
    if (typeof msgData === 'string') {
      outMsg += ` ${msgData}`;
    } else {
      try {
        outMsg += ` ${JSON.stringify(msgData)}`;
      } catch (err) {
        outMsg += ` [Unserializable object: ${Object.prototype.toString.call(msgData)}]`;
        outMsg += JSON.stringify(err);
      }
    }
  }
  ipcRenderer?.userLog?.(outMsg);
};

// 关闭快速笔记窗口
export const closeQuickNote = (): void => {
  if (isInElectron) {
    ipcRenderer.closeQuickNote?.();
  }
};

// 关闭截图快存窗口
export const closeScreenshotCapture = (): void => {
  if (isInElectron) {
    ipcRenderer.closeScreenshotCapture?.();
  }
};

// 读取剪贴板图片
export const readClipboardImage = (): string | null => {
  if (isInElectron) {
    return ipcRenderer.readClipboardImage?.() || null;
  }
  return null;
};

const ElectronBridge = {
  setStore,
  getStore,
  deleteStore,
  userLog,
  closeQuickNote,
  closeScreenshotCapture,
  readClipboardImage,
};

export default ElectronBridge;
