import fs from 'fs';
import path from 'path';
import os from 'os';
import logger from 'electron-log';

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
 * 获取默认配置文件路径
 */
const getConfigPath = (): string => {
  const homeDir = os.homedir();
  return path.join(homeDir, '.nexa', 'llm.json');
};

/**
 * 加载 LLM 配置
 * @returns LLM 配置对象
 */
export const loadLLMConfig = (): LLMConfig => {
  const configPath = getConfigPath();

  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(configData) as LLMConfig;
      logger.info('[LLMConfig] 已加载配置文件:', configPath);
      return config;
    }
  } catch (error) {
    logger.error('[LLMConfig] 加载配置文件失败:', error);
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
 * 保存 LLM 配置
 * @param config LLM 配置对象
 */
export const saveLLMConfig = (config: LLMConfig): void => {
  const configPath = getConfigPath();
  const configDir = path.dirname(configPath);

  try {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    logger.info('[LLMConfig] 配置文件已保存:', configPath);
  } catch (error) {
    logger.error('[LLMConfig] 保存配置文件失败:', error);
    throw error;
  }
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
