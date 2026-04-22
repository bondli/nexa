import axios from 'axios';
import logger from 'electron-log';
import { getEmbeddingConfig as getConfigFromService } from './config-service';

/**
 * Embedding 配置接口
 */
export interface EmbeddingConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

/**
 * 读取 Embedding 配置
 */
export const getEmbeddingConfig = (): EmbeddingConfig => {
  const config = getConfigFromService();
  if (config && config.baseUrl && config.apiKey && config.model) {
    return config as EmbeddingConfig;
  }
  throw new Error('Embedding 配置无效，请检查 config.json 文件');
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