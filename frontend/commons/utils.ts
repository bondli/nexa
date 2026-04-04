// 生成 uuid作为sessionId
const generateUUID = () => {
  // 简单 uuid 生成
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * 休眠指定毫秒数
 * @param ms 毫秒数
 */
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 格式化文件大小
 * @param sizeInBytes 文件大小（字节）
 * @returns 格式化后的文件大小字符串
 */
const formatFileSize = (sizeInBytes: number): string => {
  if (sizeInBytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(sizeInBytes) / Math.log(k));

  if (i >= units.length) {
    return `${(sizeInBytes / Math.pow(k, units.length - 1)).toFixed(2)} ${units[units.length - 1]}`;
  }

  return `${(sizeInBytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
};

export { generateUUID, sleep, formatFileSize };
