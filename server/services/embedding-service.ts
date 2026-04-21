import path from 'path';
import os from 'os';
import fs from 'fs';
import axios from 'axios';
import logger from 'electron-log';

/**
 * Embedding 配置接口
 */
export interface EmbeddingConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

/**
 * 获取 Embedding 配置文件路径
 */
export const getEmbeddingConfigPath = (): string => {
  const homeDir = os.homedir();
  return path.join(homeDir, '.nexa', 'embedding.json');
};

/**
 * 读取 Embedding 配置
 */
export const getEmbeddingConfig = (): EmbeddingConfig => {
  const configPath = getEmbeddingConfigPath();
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(data);
      if (config.baseUrl && config.apiKey && config.model) {
        return config;
      }
    }
  } catch (error) {
    logger.error('读取 Embedding 配置失败:', error);
  }
  throw new Error('Embedding 配置无效，请检查 ~/.nexa/embedding.json 文件');
};

/**
 * 生成文本嵌入向量
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  const config = getEmbeddingConfig();

  try {
    const response = await axios.post(
      `${config.baseUrl}/embeddings`,
      {
        model: config.model,
        input: text,
        encoding_format: "float",
      },
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      },
    );

    if (response.data.data && response.data.data.length > 0) {
      const embedding = response.data.data[0].embedding;
      logger.info(`Embedding 生成成功，向量维度: ${embedding.length}`);
      return embedding;
    }

    throw new Error('Embedding 响应格式错误');
  } catch (error: any) {
    logger.error('generateEmbedding失败:', error.response?.data || error.message);
    throw new Error('generateEmbedding失败: ' + (error.response?.data?.error?.message || error.message));
  }
};