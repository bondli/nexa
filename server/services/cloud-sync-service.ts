import path from 'path';
import fs from 'fs';
import axios from 'axios';
import logger from 'electron-log';
import Picture from '../models/Picture';
import Docs from '../models/Docs';
import { getConfigPath, ensureConfigDir, getApiConfig } from '../config/setting';

// 云端配置
interface CloudConfig {
  apiKey: string;
  endpoint: string;
}

// 文件类型：picture 对应图片，document 对应文档
type FileType = 'picture' | 'document';

// 同步队列项（通过 localPath 查找记录）
interface SyncQueueItem {
  id: number;
  type: FileType;
  localPath: string;
  retryCount: number;
  createdAt: string;
}

// 队列文件结构
interface SyncQueue {
  pending: SyncQueueItem[];
  failed: SyncQueueItem[];
}

/**
 * 获取云端配置（从 ~/.nexa/api.json 读取）
 */
const getCloudConfig = (): CloudConfig => {
  const apiConfig = getApiConfig();
  return {
    apiKey: apiConfig.cloudSyncApiKey || '',
    endpoint: apiConfig.cloudSyncEndpoint || '',
  };
};

/**
 * 获取队列文件路径
 */
const getQueueFilePath = (): string => {
  return path.join(path.dirname(getConfigPath()), 'sync-queue.json');
};

/**
 * 读取同步队列
 */
const readSyncQueue = (): SyncQueue => {
  const queuePath = getQueueFilePath();
  try {
    if (fs.existsSync(queuePath)) {
      const data = fs.readFileSync(queuePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    logger.error('读取同步队列失败:', error);
  }
  return { pending: [], failed: [] };
};

/**
 * 写入同步队列
 */
const writeSyncQueue = (queue: SyncQueue): void => {
  const queuePath = getQueueFilePath();
  ensureConfigDir();
  try {
    fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2), 'utf-8');
  } catch (error) {
    logger.error('写入同步队列失败:', error);
  }
};

/**
 * 将同步任务添加到队列
 */
const addToQueue = (item: Omit<SyncQueueItem, 'retryCount' | 'createdAt'>): void => {
  const queue = readSyncQueue();
  // 检查是否已存在相同的 localPath
  const exists = queue.pending.some((q) => q.localPath === item.localPath) ||
                 queue.failed.some((q) => q.localPath === item.localPath);
  if (!exists) {
    queue.pending.push({
      ...item,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    });
    writeSyncQueue(queue);
    logger.info(`同步任务已添加到队列: ${item.type} - ${item.localPath}`);
  }
};

/**
 * 从队列中移除已完成的任务（通过 localPath）
 */
const removeFromQueue = (localPath: string): void => {
  const queue = readSyncQueue();
  queue.pending = queue.pending.filter((item) => item.localPath !== localPath);
  queue.failed = queue.failed.filter((item) => item.localPath !== localPath);
  writeSyncQueue(queue);
};

/**
 * 增加重试次数并移动到 failed 列表
 */
const moveToFailed = (localPath: string): void => {
  const queue = readSyncQueue();
  const itemIndex = queue.pending.findIndex((item) => item.localPath === localPath);

  if (itemIndex !== -1) {
    const item = queue.pending[itemIndex];
    queue.pending.splice(itemIndex, 1);

    if (item.retryCount < 3) {
      item.retryCount += 1;
      queue.failed.push(item);
      logger.info(`同步任务重试次数+1: ${item.type} - ${item.localPath}, 次数: ${item.retryCount}`);
    } else {
      logger.warn(`同步任务重试次数超限: ${item.type} - ${item.localPath}`);
    }
  }

  writeSyncQueue(queue);
};

/**
 * 根据 localPath 查找记录并更新 cloudUrl
 */
const updateCloudUrlByLocalPath = async (
  localPath: string,
  fileType: FileType,
  cloudUrl: string,
): Promise<boolean> => {
  try {
    let updated = false;
    if (fileType === 'picture') {
      // 通过 path 字段查找 Picture 记录
      const result = await Picture.update({ cloudUrl }, { where: { path: localPath } });
      updated = result[0] > 0;
    } else {
      // 通过 path 字段查找 Docs 记录
      const result = await Docs.update({ cloudUrl }, { where: { path: localPath } });
      updated = result[0] > 0;
    }

    if (updated) {
      logger.info(`更新 cloud_url 成功: ${fileType} - ${localPath}, cloudUrl: ${cloudUrl}`);
    } else {
      logger.warn(`未找到对应的记录: ${fileType} - ${localPath}`);
    }

    return updated;
  } catch (error) {
    logger.error(`更新 cloud_url 失败: ${fileType} - ${localPath}`, error);
    return false;
  }
};

/**
 * 同步文件到云端
 * 通过 localPath 查找记录并更新 cloudUrl
 */
export const syncFileToCloud = async (params: {
  fileType: FileType;
  localPath: string;
  originalName?: string;
}): Promise<string | null> => {
  const { fileType, localPath } = params;
  const config = getCloudConfig();

  try {
    // 检查本地文件是否存在
    if (!fs.existsSync(localPath)) {
      logger.error(`本地文件不存在: ${localPath}`);
      addToQueue({ id: Date.now(), type: fileType, localPath });
      return null;
    }

    // 读取文件内容
    const fileBuffer = fs.readFileSync(localPath);
    const fileName = path.basename(localPath);

    // 调用云端 API 上传文件
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer]), fileName);

    const response = await axios.post(config.endpoint, formData, {
      headers: {
        'x-api-key': config.apiKey,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60秒超时
    });

    // 假设云端返回 { url: 'https://...' }
    const cloudUrl = response.data?.url || response.data?.data?.url;

    if (cloudUrl) {
      // 通过 localPath 查找记录并更新 cloudUrl
      await updateCloudUrlByLocalPath(localPath, fileType, cloudUrl);
      // 从队列中移除
      removeFromQueue(localPath);
      logger.info(`文件同步成功: ${fileType} - ${localPath}, cloudUrl: ${cloudUrl}`);
      return cloudUrl;
    } else {
      throw new Error('云端未返回 URL');
    }
  } catch (error: any) {
    logger.error(`文件同步失败: ${fileType} - ${localPath}`, error.message);

    // 同步失败，添加到队列
    addToQueue({ id: Date.now(), type: fileType, localPath });
    return null;
  }
};

/**
 * 处理队列中的同步任务
 */
const processQueue = async (): Promise<void> => {
  const queue = readSyncQueue();
  const allItems = [...queue.pending, ...queue.failed];

  logger.info(`开始处理同步队列，共 ${allItems.length} 个任务`);

  for (const item of allItems) {
    if (item.retryCount >= 3) {
      continue;
    }

    try {
      const cloudUrl = await syncFileToCloud({
        fileType: item.type,
        localPath: item.localPath,
      });

      if (!cloudUrl) {
        // 失败，增加重试次数
        moveToFailed(item.localPath);
      }
    } catch (error) {
      logger.error(`处理队列任务失败: ${item.localPath}`, error);
      moveToFailed(item.localPath);
    }
  }
};

/**
 * 服务启动时扫描队列
 */
export const initSyncQueue = (): void => {
  logger.info('初始化同步队列...');
  processQueue();
};

/**
 * 定时扫描队列（每5分钟）
 */
let syncIntervalId: NodeJS.Timeout | null = null;

export const startSyncScheduler = (intervalMs: number = 5 * 60 * 1000): void => {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
  }

  // 立即执行一次
  processQueue();

  // 设置定时任务
  syncIntervalId = setInterval(() => {
    processQueue();
  }, intervalMs);

  logger.info(`同步调度器已启动，间隔: ${intervalMs / 1000}秒`);
};

/**
 * 停止同步调度器
 */
export const stopSyncScheduler = (): void => {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
    logger.info('同步调度器已停止');
  }
};