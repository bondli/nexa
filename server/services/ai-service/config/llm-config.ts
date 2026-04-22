import logger from 'electron-log';
import { getConfig, getConfigFilePath } from '../../config-service';

/**
 * LLM 配置接口
 */
export interface LLMConfig {
  provider: 'openai' | 'qwen' | 'glm' | 'minimax';
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemMessage?: string;
}

/**
 * 加载 LLM 配置
 * @returns LLM 配置对象
 */
export const loadLLMConfig = (): LLMConfig => {
  const config = getConfig();

  if (config.llm && config.llm.apiKey && config.llm.baseUrl && config.llm.model) {
    logger.info('[LLMConfig] 已加载配置文件:', getConfigFilePath());
    return config.llm as LLMConfig;
  }

  // 返回默认配置
  logger.warn('[LLMConfig] 使用默认配置');
  return {
    provider: 'openai',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
  };
};

/**
 * 获取指定 provider 的默认 Base URL
 */
export const getDefaultBaseUrl = (provider: string): string => {
  const baseUrlMap: Record<string, string> = {
    openai: 'https://api.openai.com/v1',
    qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    glm: 'https://open.bigmodel.cn/api/paas/v4',
    minimax: 'https://api.minimax.chat/v1',
  };

  return baseUrlMap[provider] || baseUrlMap['openai'];
};
