// 配置模块
import { loadLLMConfig, saveLLMConfig, getDefaultBaseUrl } from './config/llm-config';
export type { LLMConfig } from './config/llm-config';

// Agent 模块
export { LangGraphAgent, createAgent } from './agent/langgraph-agent';
export type { AgentConfig, StreamCallback as AgentStreamCallback, ToolCall } from './agent/langgraph-agent';

// Human-in-the-loop 模块
export {
  HumanInTheLoopManager,
  getHumanInTheLoopManager,
} from './agent/human-in-loop';
export type { HumanInTheLoopState, PendingTask } from './agent/human-in-loop';

// 兼容旧 API - generateEmbedding, chat, summarize, setAPIKey, getAPIKey
import axios from 'axios';

/**
 * 生成文本嵌入向量 - 使用配置文件中的 API
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  const config = loadLLMConfig();
  const baseUrl = config.baseUrl || getDefaultBaseUrl(config.provider);

  try {
    const response = await axios.post(
      `${baseUrl}/embeddings`,
      {
        model: 'text-embedding-3-small',
        input: text,
      },
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.data[0].embedding;
  } catch (error) {
    console.error('生成嵌入向量失败:', error);
    throw new Error('生成嵌入向量失败');
  }
};

/**
 * 设置 API Key - 保存到配置文件
 */
export const setAPIKey = (apiKey: string): void => {
  const config = loadLLMConfig();
  config.apiKey = apiKey;
  saveLLMConfig(config);
};

/**
 * 获取 API Key - 从配置文件读取
 */
export const getAPIKey = (): string => {
  const config = loadLLMConfig();
  return config.apiKey;
};

/**
 * 聊天功能 - 使用配置文件中的 API
 */
export const chat = async (prompt: string, context?: string[]): Promise<string> => {
  const config = loadLLMConfig();
  const baseUrl = config.baseUrl || getDefaultBaseUrl(config.provider);

  const messages = [{ role: 'system', content: '你是一个有用的 AI 助手。' }];

  if (context && context.length > 0) {
    const contextContent = context.join('\n\n');
    messages.push({
      role: 'system',
      content: `以下是有用的上下文信息：\n${contextContent}`,
    });
  }

  messages.push({ role: 'user', content: prompt });

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
    console.error('API 调用失败:', error);
    throw new Error('AI 服务调用失败');
  }
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
  const baseUrl = config.baseUrl || getDefaultBaseUrl(config.provider);

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

// 重新导出配置函数
export { loadLLMConfig, saveLLMConfig, getDefaultBaseUrl } from './config/llm-config';