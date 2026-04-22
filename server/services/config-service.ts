import * as fs from 'fs';
import * as path from 'path';
import logger from 'electron-log';

/**
 * 配置目录路径
 */
const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '', '.nexa');

/**
 * 统一配置文件路径
 */
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

/**
 * 统一配置结构
 */
export interface UnifiedConfig {
  database?: {
    DB_HOST?: string;
    DB_PORT?: number;
    DB_NAME?: string;
    DB_USERNAME?: string;
    DB_PASSWORD?: string;
  };
  llm?: {
    provider?: string;
    apiKey?: string;
    baseUrl?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  embedding?: {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
  };
  qdrant?: {
    url?: string;
  };
  cloudapi?: {
    apiKey?: string;
    endpoint?: string;
  };
}

/**
 * 读取 JSON 文件
 */
const readJsonFile = <T>(filePath: string): T | null => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (error) {
    logger.error(`[ConfigService] Error reading ${filePath}:`, error);
  }
  return null;
};

/**
 * 写入 JSON 文件
 */
const writeJsonFile = (filePath: string, data: unknown): boolean => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    logger.error(`[ConfigService] Error writing ${filePath}:`, error);
    return false;
  }
};

/**
 * 获取统一配置
 */
export const getConfig = (): UnifiedConfig => {
  const config = readJsonFile<UnifiedConfig>(CONFIG_FILE);

  if (config) {
    logger.info('[ConfigService] Loaded config from config.json');
    return config;
  }

  // 配置文件不存在，返回空对象
  logger.info('[ConfigService] No config file found, returning empty config');
  return {};
};

/**
 * 保存统一配置
 */
export const saveConfig = (config: UnifiedConfig): boolean => {
  // 确保配置目录存在
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  const success = writeJsonFile(CONFIG_FILE, config);

  if (success) {
    logger.info('[ConfigService] Config saved successfully');
  }

  return success;
};

/**
 * 获取配置文件路径（供其他服务使用）
 */
export const getConfigFilePath = (): string => {
  return CONFIG_FILE;
};

/**
 * 获取 LLM 配置的便捷方法
 */
export const getLlmConfig = (): UnifiedConfig['llm'] => {
  const config = getConfig();
  return config.llm;
};

/**
 * 获取 Embedding 配置的便捷方法
 */
export const getEmbeddingConfig = (): UnifiedConfig['embedding'] => {
  const config = getConfig();
  return config.embedding;
};

/**
 * 获取 Qdrant 配置的便捷方法
 */
export const getQdrantConfig = (): UnifiedConfig['qdrant'] => {
  const config = getConfig();
  return config.qdrant;
};

/**
 * 获取云端 API 配置的便捷方法
 */
export const getCloudApiConfig = (): UnifiedConfig['cloudapi'] => {
  const config = getConfig();
  return config.cloudapi;
};

/**
 * 获取数据库配置的便捷方法
 */
export const getDatabaseConfig = (): UnifiedConfig['database'] => {
  const config = getConfig();
  return config.database;
};