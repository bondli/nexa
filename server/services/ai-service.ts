import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const GLM_API_KEY = process.env.GLM_API_KEY || '';
const GLM_API_URL = process.env.GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const GLM_EMBEDDING_URL = process.env.GLM_EMBEDDING_URL || 'https://open.bigmodel.cn/api/paas/v4/embeddings';

/**
 * AI 服务基础结构
 * 提供 GLM4.7 模型的统一调用接口
 */

/**
 * 调用 GLM4.7 API
 */
const callGLMAPI = async (messages: Array<{ role: string; content: string }>): Promise<string> => {
  try {
    const response = await axios.post(
      GLM_API_URL,
      {
        model: 'glm-4',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${GLM_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('GLM API 调用失败:', error);
    throw new Error('AI 服务调用失败');
  }
};

/**
 * 生成文本嵌入向量
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await axios.post(
      GLM_EMBEDDING_URL,
      {
        model: 'embedding-2',
        input: text,
      },
      {
        headers: {
          Authorization: `Bearer ${GLM_API_KEY}`,
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
 * 聊天功能
 */
export const chat = async (prompt: string, context?: string[]): Promise<string> => {
  const messages = [{ role: 'system', content: '你是一个有用的 AI 助手。' }];

  // 添加上下文
  if (context && context.length > 0) {
    const contextContent = context.join('\n\n');
    messages.push({
      role: 'system',
      content: `以下是有用的上下文信息：\n${contextContent}`,
    });
  }

  messages.push({ role: 'user', content: prompt });

  return await callGLMAPI(messages);
};

/**
 * 文本生成（通用）
 */
export const generate = async (prompt: string, systemPrompt = ''): Promise<string> => {
  const messages: Array<{ role: string; content: string }> = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: prompt });

  return await callGLMAPI(messages);
};

/**
 * 设置 API Key
 */
export const setAPIKey = (apiKey: string): void => {
  // 更新环境变量（仅在当前进程有效）
  process.env.GLM_API_KEY = apiKey;
};

/**
 * 获取 API Key
 */
export const getAPIKey = (): string => {
  return GLM_API_KEY;
};

/**
 * 文本总结
 */
export const summarize = async (text: string): Promise<string> => {
  const systemPrompt = '请对以下文本进行总结，突出关键信息和主要观点。';
  return await generate(text, systemPrompt);
};

/**
 * 文本改写
 */
export const rewrite = async (text: string, tone = 'professional'): Promise<string> => {
  const toneMap: Record<string, string> = {
    professional: '专业正式',
    casual: '轻松口语',
    academic: '学术严谨',
    concise: '简洁明了',
  };
  const systemPrompt = `请以${toneMap[tone] || '专业正式'}的语调改写以下文本，保持原意不变。`;
  return await generate(text, systemPrompt);
};

/**
 * 内容扩写
 */
export const expand = async (text: string): Promise<string> => {
  const systemPrompt = '请对以下内容进行扩展和详细说明，增加更多背景信息和细节。';
  return await generate(text, systemPrompt);
};

/**
 * 语气调整
 */
export const adjustTone = async (
  text: string,
  targetTone: 'formal' | 'casual' | 'professional' | 'friendly',
): Promise<string> => {
  const tonePrompts: Record<string, string> = {
    formal: '正式',
    casual: '口语化',
    professional: '专业',
    friendly: '友好亲切',
  };
  const systemPrompt = `请将以下文本调整为${tonePrompts[targetTone]}语调。`;
  return await generate(text, systemPrompt);
};

/**
 * 提取关键点
 */
export const extractKeyPoints = async (text: string): Promise<string[]> => {
  const systemPrompt = '请从以下文本中提取关键点，以列表形式返回，每个关键点不超过50字。';
  const response = await generate(text, systemPrompt);

  // 解析关键点列表
  return response
    .split('\n')
    .map((line) =>
      line
        .trim()
        .replace(/^[-*]\s*/, '')
        .trim(),
    )
    .filter((line) => line.length > 0);
};

/**
 * 自动生成标签
 */
export const autoGenerateTags = async (text: string): Promise<string[]> => {
  const systemPrompt = '请从以下文本中提取3-5个合适的标签，以逗号分隔返回，标签不超过10个字。';
  const response = await generate(text, systemPrompt);

  // 解析标签列表
  return response
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0 && tag.length <= 10);
};

/**
 * 生成结构化摘要
 */
export const generateStructuredSummary = async (
  text: string,
): Promise<{
  mainIdea: string;
  keyPoints: string[];
  details: string[];
}> => {
  const systemPrompt = `请对以下文本进行结构化摘要，以 JSON 格式返回：
{
  "mainIdea": "主要观点（不超过100字）",
  "keyPoints": ["关键点1", "关键点2", ...],
  "details": ["详细说明1", "详细说明2", ...]
}`;
  const response = await generate(text, systemPrompt);

  try {
    const summary = JSON.parse(response);
    return {
      mainIdea: summary.mainIdea || '',
      keyPoints: Array.isArray(summary.keyPoints) ? summary.keyPoints : [],
      details: Array.isArray(summary.details) ? summary.details : [],
    };
  } catch (error) {
    console.error('解析结构化摘要失败:', error);
    // 如果解析失败，返回默认结构
    return {
      mainIdea: text.substring(0, 100),
      keyPoints: await extractKeyPoints(text),
      details: [],
    };
  }
};
