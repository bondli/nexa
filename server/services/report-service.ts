import axios from 'axios';
import logger from 'electron-log';
import { loadLLMConfig } from './llm-text-service';
import { extractDataForImage, fillHtmlTemplate } from './article-template-service';

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
 * 生成报告缩略图
 * @param report 报告数据
 */
export const generateReportImage = async (report: {
  reportDate: string;
  reportType: 'daily' | 'monthly';
  summary: string;
  content: string;
}): Promise<string> => {
  // 使用摘要内容生成图片
  const title = report.reportType === 'daily' ? '日报' : '月报';
  const dateStr = report.reportDate;

  try {
    // 提取前几条要点作为图片内容
    const extractedData = await extractDataForImage(report.summary, `${title} - ${dateStr}`);

    // 构建简单的 HTML 模板用于生成图片
    const htmlContent = fillHtmlTemplate(getReportHtmlTemplate(), {
      title: `${title} - ${dateStr}`,
      subtitle: '知识总结',
      kpis: extractedData.kpis || [{ label: '核心要点', value: '-', desc: '内容提取中' }],
      keyPoints: extractedData.keyPoints || [{ label: '重点信息', desc: '内容提取中', tags: [] }],
      conclusions: extractedData.conclusions || [{ id: 'R1', title: '总结', desc: '总结提取中' }],
    });

    return htmlContent;
  } catch (error) {
    logger.error('[generateReportImage] 生成失败:', error);
    // 返回一个默认图片URL或空字符串
    return '';
  }
};

/**
 * 报告 HTML 模板
 */
const getReportHtmlTemplate = (): string => {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>\${title}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap');

      * { margin: 0; padding: 0; box-sizing: border-box; }

      :root {
        --navy: #1b2a4a; --slate: #475569; --steel: #64748b; --sky: #e2e8f0;
        --ice: #f1f5f9; --white: #ffffff; --accent: #2563eb; --accent-light: #dbeafe;
        --warn: #dc2626; --warn-light: #fef2f2; --success: #059669;
      }

      body {
        display: flex; justify-content: center; align-items: flex-start;
        min-height: 100vh; padding: 40px 20px; background: #94a3b8;
        font-family: 'Noto Sans SC', 'DM Sans', sans-serif;
      }

      .container { width: 952px; background: var(--white); position: relative; display: flex; flex-direction: column; }

      .header-bar { background: var(--navy); padding: 56px 72px 48px; position: relative; }
      .header-bar::after { content: ''; position: absolute; bottom: 0; left: 72px; width: 80px; height: 6px; background: var(--accent); }
      .header-bar h1 { font-size: 72px; font-weight: 700; color: var(--white); line-height: 1.25; margin-bottom: 16px; }
      .header-bar .subtitle { font-size: 30px; font-weight: 300; color: var(--steel); line-height: 1.6; }

      .content-area { flex: 1; padding: 40px 72px; display: flex; flex-direction: column; gap: 32px; }

      .sec-head { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
      .sec-head .num { font-family: 'DM Sans', sans-serif; font-size: 28px; font-weight: 700; color: var(--accent); background: var(--accent-light); width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
      .sec-head h2 { font-size: 40px; font-weight: 700; color: var(--navy); }

      .kpi-row { display: grid; grid-template-columns: repeat(<!-- KPI数量 -->, 1fr); gap: 24px; }
      .kpi-card { background: var(--ice); border-radius: 12px; padding: 28px 24px; border-left: 5px solid var(--accent); }
      .kpi-card .label { font-size: 26px; font-weight: 500; color: var(--steel); margin-bottom: 10px; }
      .kpi-card .number { font-family: 'DM Sans', sans-serif; font-size: 56px; font-weight: 700; color: var(--navy); line-height: 1; }
      .kpi-card .number .unit { font-size: 32px; font-weight: 400; color: var(--steel); }
      .kpi-card .desc { font-size: 26px; word-break: break-all; font-weight: 500; color: var(--slate); margin-top: 8px; line-height: 1.4; }

      .grid-60-40 { display: grid; gap: 32px; }

      .spectrum { display: flex; flex-direction: column; gap: 16px; }
      .spectrum-item { background: var(--ice); border-radius: 12px; padding: 24px 28px; border-left: 5px solid var(--accent); display: flex; align-items: flex-start; gap: 20px; }
      .spectrum-item.mid { border-left-color: #93c5fd; }
      .spectrum-item.low { border-left-color: var(--sky); }
      .spectrum-item .s-left { min-width: 140px; }
      .spectrum-item .s-label { font-size: 28px; font-weight: 700; color: var(--navy); }
      .spectrum-item .s-en { font-family: 'DM Sans', sans-serif; font-size: 24px; font-weight: 500; color: var(--steel); display: block; margin-top: 4px; }
      .spectrum-item .s-desc { font-size: 26px; word-break: break-all; color: var(--slate); line-height: 1.6; }
      .spectrum-item .s-tag { font-size: 20px; font-weight: 600; padding: 4px 12px; border-radius: 4px; display: inline-block; margin-top: 8px; }
      .s-tag.high { background: #dcfce7; color: #166534; }
      .s-tag.medium { background: #fef9c3; color: #854d0e; }
      .s-tag.zero { background: #fee2e2; color: #991b1b; }

      .risk-box { background: var(--warn-light); border: 1px solid #fecaca; border-radius: 12px; padding: 28px 32px; }
      .risk-box .sec-head .num { background: #fee2e2; color: var(--warn); }
      .risk-box .sec-head h2 { color: var(--warn); }
      .risk-item { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid #fecaca; font-size: 30px; color: #7f1d1d; line-height: 1.6; }
      .risk-item:last-child { border-bottom: none; }
      .risk-item .idx { font-family: 'DM Sans', sans-serif; font-weight: 700; color: var(--warn); flex-shrink: 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header-bar">
        <h1></h1>
        <div class="subtitle"></div>
      </div>

      <div class="content-area">
        <div>
          <div class="sec-head">
            <span class="num">01</span>
            <h2>核心指标</h2>
          </div>
          <div class="kpi-row" style="grid-template-columns: repeat(<!-- KPI数量 -->, 1fr);">
            <!-- KPI 动态替换 -->
          </div>
        </div>

        <div class="grid-60-40">
          <div>
            <div class="sec-head">
              <span class="num">02</span>
              <h2>重点信息</h2>
            </div>
            <div class="spectrum">
              <!-- 重点信息动态替换 -->
            </div>
          </div>
        </div>

        <div class="risk-box">
          <div class="sec-head">
            <span class="num">!</span>
            <h2>结论总结</h2>
          </div>
          <!-- 结论动态替换 -->
        </div>
      </div>
    </div>
  </body>
</html>`;
};
