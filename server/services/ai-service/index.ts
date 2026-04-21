// 配置模块
import axios from 'axios';
import { loadLLMConfig, saveLLMConfig, getDefaultBaseUrl } from './config/llm-config';

// 兼容旧 API - chat, summarize, setAPIKey, getAPIKey
export type { LLMConfig } from './config/llm-config';

// Agent 模块
export { LangGraphAgent, createAgent } from './agent/langgraph-agent';
export type { AgentConfig, StreamCallback as AgentStreamCallback, ToolCall } from './agent/langgraph-agent';

// Human-in-the-loop 模块
export { HumanInTheLoopManager, getHumanInTheLoopManager } from './agent/human-in-loop';
export type { HumanInTheLoopState, PendingTask } from './agent/human-in-loop';

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

/**
 * 优化 OCR 识别文本 - 修正错别字、整理格式、优化表达
 * @param text OCR 识别后的原始文本
 * @returns 优化后的文本
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
  const baseUrl = config.baseUrl || getDefaultBaseUrl(config.provider);

  try {
    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model: config.model || 'gpt-4',
        messages,
        temperature: 0.3, // 低温度，更稳定的输出
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

// 重新导出配置函数
export { loadLLMConfig, saveLLMConfig, getDefaultBaseUrl } from './config/llm-config';
