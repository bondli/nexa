import axios from 'axios';

// URL正则表达式 - 修复路径部分连字符问题
const URL_REGEX =
  /(https?:\/\/(?:[-\w.])+(?::[0-9]+)?(?:\/(?:[\w\/_.-])*)?(?:\?(?:[\w&%=.~-])+)?(?:#(?:[\w.~-])+)?|www\.(?:[-\w.])+(?::[0-9]+)?(?:\/(?:[\w\/_.-])*)?(?:\?(?:[\w&%=.~-])+)?(?:#(?:[\w.~-])+)?|(?:[-\w.])+\.(?:com|org|net|edu|gov|mil|int|cn|jp|uk|fr|de|it|es|nl|ru|in|au|ca|br|mx|za|kr|sg|hk|tw|th|vn|my|ph|id|ae|sa|eg|tr|il|gr|se|no|dk|fi|pl|cz|hu|ro|bg|hr|si|sk|lt|lv|ee|is|mt|cy|lu|li|mc|sm|va|ad|ie|pt|be|at|ch|cl|ar|pe|co|ve|uy|py|bo|ec|gf|sr|gu|fk|bz|gt|hn|sv|ni|cr|pa|jm|ht|do|cu|bb|tt|gd|lc|vc|ag|dm|kn|bs|tc|vg|vi|pr|aw)(?::[0-9]+)?(?:\/(?:[\w\/_.-])*)?(?:\?(?:[\w&%=.~-])+)?(?:#(?:[\w.~-])+)?)/gi;

// 匹配已经被链接包围的URL的正则
const EXISTING_LINK_REGEX = /<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi;

/**
 * 自动转换文本中的URL为可点击的超链接
 * @param html HTML字符串
 * @returns 转换后的HTML字符串
 */
const autoLinkify = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return html;
  }

  // 首先收集所有已存在的链接URL，避免重复处理
  const existingLinks = new Set<string>();

  // 使用传统方式获取所有匹配的链接
  let linkMatch;
  const linkRegex = new RegExp(EXISTING_LINK_REGEX.source, EXISTING_LINK_REGEX.flags);

  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const linkText = linkMatch[2]; // 链接显示文本
    existingLinks.add(linkText);
  }

  // 查找所有URL并替换为链接（排除已存在的链接）
  return html.replace(URL_REGEX, (url) => {
    // 如果URL已经在现有链接中，不处理
    if (existingLinks.has(url)) {
      return url;
    }

    // 如果是localhost链接，不处理
    if (url.startsWith('http://localhost') || url.startsWith('https://localhost')) {
      return url;
    }

    // 生成href属性
    const href = url.startsWith('http') ? url : `https://${url}`;

    // 返回链接HTML
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
};

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
 * 检查本地模型服务是否可用
 * 使用 axios 发起 GET 请求，状态码为 200 返回 true，否则返回 false
 */
const checkModelStatus = async (): Promise<boolean> => {
  const CHECK_STATUS_API = 'http://localhost:11434/';
  try {
    const response = await axios.get(CHECK_STATUS_API, {
      timeout: 3000,
      // 不让非 2xx 状态抛错，便于统一用 status 判断
      validateStatus: () => true,
    });
    return response.status === 200;
  } catch {
    return false;
  }
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

export { autoLinkify, generateUUID, checkModelStatus, sleep, formatFileSize };
