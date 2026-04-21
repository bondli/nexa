import path from 'path';
import os from 'os';
import fs from 'fs';
import { QdrantClient } from '@qdrant/js-client-rest';

let qdrantClient: QdrantClient | null = null;

/**
 * Qdrant 配置接口
 */
export interface QdrantConfig {
  url: string;
  apiKey?: string;
}

/**
 * 获取 Qdrant 配置文件路径
 */
export const getQdrantConfigPath = (): string => {
  const homeDir = os.homedir();
  return path.join(homeDir, '.nexa', 'qdrant.json');
};

/**
 * 读取 Qdrant 配置
 */
export const getQdrantConfig = (): QdrantConfig => {
  const configPath = getQdrantConfigPath();
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('读取 Qdrant 配置失败:', error);
  }
  return { url: '' };
};

/**
 * 初始化 Qdrant 向量数据库连接
 */
export const initVectorDB = async (): Promise<void> => {
  try {
    const config = getQdrantConfig();
    if (!config.url) {
      throw new Error('Qdrant 配置无效：缺少 url');
    }

    qdrantClient = new QdrantClient({
      url: config.url,
      ...(config.apiKey && { apiKey: config.apiKey }),
    });

    // 测试连接
    await qdrantClient.getCollections();
    console.log('Qdrant 向量数据库连接成功');
  } catch (error) {
    console.error('Qdrant 向量数据库连接失败:', error);
    throw error;
  }
};

/**
 * 获取 Qdrant 客户端
 */
export const getVectorDBClient = (): QdrantClient => {
  if (!qdrantClient) {
    throw new Error('Qdrant 向量数据库未初始化');
  }
  return qdrantClient;
};

/**
 * 关闭向量数据库连接
 */
export const closeVectorDB = async (): Promise<void> => {
  qdrantClient = null;
  console.log('Qdrant 向量数据库连接已关闭');
};

export default qdrantClient;