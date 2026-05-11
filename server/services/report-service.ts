import axios from 'axios';
import logger from 'electron-log';
import { loadLLMConfig } from './llm-text-service';

/**
 * 报告生成结果
 */
export interface ReportResult {
  summary: string;
  content: string;
}

/**
 * 日报生成提示词模板
 */
const DAILY_REPORT_PROMPT = `你是一个个人工作学习助手。请根据用户提供的笔记和文章内容，生成一份每日工作报告。

## 要求
请严格按照以下五部分结构生成报告：
1. 核心记录的笔记内容
2. 主要完成的工作
3. 所收藏的文章的核心知识点
4. 总结过去一天的知识收获
5. 后续重点可以跟进的事项

## 注意事项
- 用 Markdown 格式输出
- 内容要简洁有力，突出重点
- 每部分用 ## 标题区分

## 用户数据
### 笔记内容：
{noteContents}

### 文章内容：
{articleContents}

请生成报告：`;

/**
 * 月报生成提示词模板
 */
const MONTHLY_REPORT_PROMPT = `你是一个个人工作学习助手。请根据用户提供的笔记和文章内容，生成一份月度工作报告。

## 要求
请严格按照以下五部分结构生成报告：
1. 核心记录的笔记内容
2. 主要完成的工作
3. 所收藏的文章的核心知识点
4. 总结过去一月的知识收获
5. 后续重点可以跟进的事项

## 注意事项
- 用 Markdown 格式输出
- 内容要简洁有力，突出重点
- 每部分用 ## 标题区分
- 月报比日报更详细，需要总结整个月的学习和工作情况

## 用户数据
### 笔记内容：
{noteContents}

### 文章内容：
{articleContents}

请生成报告：`;

/**
 * 从报告内容中提取一句话摘要
 * @param content 报告内容
 */
const extractSummary = async (content: string): Promise<string> => {
  const config = loadLLMConfig();

  if (!config.apiKey) {
    throw new Error('请先配置 LLM API Key');
  }

  const systemPrompt =
    '你是一个专业的总结助手。请从用户提供的报告内容中，提取一句话摘要（50字以内），直接返回摘要文字，不要任何解释或格式。';
  const userPrompt = `请从以下报告内容中提取一句话摘要：\n\n${content}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const response = await axios.post(
      `${config.baseUrl}/chat/completions`,
      {
        model: config.model || 'gpt-4',
        messages,
        temperature: 0.3,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const summary = response.data.choices?.[0]?.message?.content || '';
    return summary.trim();
  } catch (error) {
    logger.error('[extractSummary] 摘要提取失败:', error);
    // 提取失败时，截取前100字作为摘要
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  }
};

/**
 * 生成报告
 * @param reportType daily: 日报, monthly: 月报
 * @param noteContents 笔记内容
 * @param articleContents 文章内容
 */
export const generateReport = async (
  reportType: 'daily' | 'monthly',
  noteContents: string,
  articleContents: string,
): Promise<ReportResult> => {
  const config = loadLLMConfig();

  if (!config.apiKey) {
    throw new Error('请先配置 LLM API Key');
  }

  // 构建提示词
  const template = reportType === 'daily' ? DAILY_REPORT_PROMPT : MONTHLY_REPORT_PROMPT;
  const prompt = template
    .replace('{noteContents}', noteContents || '暂无笔记记录')
    .replace('{articleContents}', articleContents || '暂无文章收藏');

  const messages = [
    { role: 'system', content: '你是一个专业的个人工作学习助手，擅长总结和归纳。' },
    { role: 'user', content: prompt },
  ];

  try {
    const response = await axios.post(
      `${config.baseUrl}/chat/completions`,
      {
        model: config.model || 'gpt-4',
        messages,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 4000,
      },
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const content = response.data.choices?.[0]?.message?.content || '';

    // 使用 AI 提取一句话摘要
    const summary = await extractSummary(content);

    logger.info(`[generateReport] ${reportType} 报告生成成功`);
    return { summary, content };
  } catch (error) {
    logger.error('[generateReport] 报告生成失败:', error);
    throw error;
  }
};
