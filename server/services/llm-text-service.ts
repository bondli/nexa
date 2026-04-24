import axios from 'axios';
import logger from 'electron-log';
import { getConfig, getConfigFilePath } from './config-service';

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
 * 文本总结 - 使用配置文件中的 API
 */
export const summarize = async (text: string): Promise<string> => {
  const systemPrompt = '请对以下文本进行总结，突出关键信息和主要观点。';
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: text },
  ];

  const config = loadLLMConfig();
  const baseUrl = config.baseUrl;

  try {
    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model: config.model || 'gpt-4',
        messages,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('文本总结失败:', error);
    throw new Error('文本总结失败');
  }
};

/**
 * 优化 OCR 识别文本 - 修正错别字、整理格式、优化表达
 */
export const optimizeText = async (text: string): Promise<string> => {
  if (!text || !text.trim()) {
    throw new Error('文本不能为空');
  }

  const systemPrompt = `你是一个文本优化助手。你的任务是对 OCR 识别或用户输入的文本进行优化：

1. 修正明显的错别字
2. 整理混乱的格式和换行
3. 删除无意义的乱码字符
4. 优化表达，使文字更通顺
5. 保持原文的核心意思不变
6. 如果原文是 Markdown 格式，尽量保持 Markdown 格式

请直接返回优化后的文本，不要添加任何解释或前缀。`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `请优化以下文本：\n\n${text}` },
  ];

  const config = loadLLMConfig();
  const baseUrl = config.baseUrl;

  try {
    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model: config.model || 'gpt-4',
        messages,
        temperature: 0.3,
        max_tokens: config.maxTokens || 4000,
      },
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('文本优化失败:', error);
    // 优化失败时返回原始文本
    return text;
  }
};
