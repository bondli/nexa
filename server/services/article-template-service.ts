import axios from 'axios';
import logger from 'electron-log';
import { loadLLMConfig } from './llm-text-service';

/**
 * 图片生成数据结构 - 用于填充HTML模版
 */
export interface ImageGenerateData {
  title: string;
  subtitle: string;
  kpis: Array<{
    label: string;
    value: string;
    unit?: string;
    desc: string;
  }>;
  keyPoints: Array<{
    label: string;
    desc: string;
    tags: string[];
  }>;
  conclusions: Array<{
    id: string;
    title: string;
    desc: string;
  }>;
}

// HTML图文模板
export function getHtmlTemplate(): string {
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

      .container { width: 950px; border: 1px solid var(--navy); background: var(--white); position: relative; display: flex; flex-direction: column; }

      .header-bar { background: var(--navy); padding: 56px 72px 48px; position: relative; }
      .header-bar::after { content: ''; position: absolute; bottom: 0; left: 72px; width: 80px; height: 6px; background: var(--accent); }
      .header-bar h1 { font-size: 44px; font-weight: 700; color: var(--white); line-height: 1.25; margin-bottom: 16px; }
      .header-bar .subtitle { font-size: 20px; font-weight: 300; color: var(--steel); line-height: 1.6; }

      .content-area { flex: 1; padding: 40px 72px; display: flex; flex-direction: column; gap: 32px; }

      .sec-head { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
      .sec-head .num { font-family: 'DM Sans', sans-serif; font-size: 28px; font-weight: 700; color: var(--accent); background: var(--accent-light); width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
      .sec-head h2 { font-size: 36px; font-weight: 700; color: var(--navy); margin-bottom: 0; }

      .kpi-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
      .kpi-card { background: var(--ice); border-radius: 12px; padding: 28px 24px; border-left: 5px solid var(--accent); }
      .kpi-card .label { font-size: 18px; font-weight: 500; color: var(--steel); margin-bottom: 10px; }
      .kpi-card .number { font-family: 'DM Sans', sans-serif; font-size: 40px; font-weight: 700; color: var(--navy); line-height: 1; }
      .kpi-card .number .unit { font-size: 24px; font-weight: 400; color: var(--steel); }
      .kpi-card .desc { font-size: 14px; word-break: break-all; font-weight: 500; color: var(--slate); margin-top: 12px; line-height: 1.4; }

      .grid-60-40 { display: grid; gap: 32px; }

      .spectrum { display: flex; flex-direction: column; gap: 16px; }
      .spectrum-item { background: var(--ice); border-radius: 12px; padding: 24px 28px; border-left: 5px solid var(--accent); display: flex; align-items: flex-start; gap: 20px; }
      .spectrum-item.mid { border-left-color: #93c5fd; }
      .spectrum-item.low { border-left-color: var(--sky); }
      .spectrum-item .s-left { min-width: 140px; }
      .spectrum-item .s-label { font-size: 20px; font-weight: 700; color: var(--navy); }
      .spectrum-item .s-en { font-family: 'DM Sans', sans-serif; font-size: 18px; font-weight: 500; color: var(--steel); display: block; margin-top: 4px; }
      .spectrum-item .s-desc { font-size: 16px; word-break: break-all; color: var(--slate); line-height: 1.6; }
      .spectrum-item .s-tag { font-size: 14px; font-weight: 600; padding: 4px 12px; border-radius: 4px; display: inline-block; margin-top: 8px; }
      .s-tag.high { background: #dcfce7; color: #166534; }
      .s-tag.medium { background: #fef9c3; color: #854d0e; }
      .s-tag.zero { background: #fee2e2; color: #991b1b; }

      .risk-box { background: var(--warn-light); border: 1px solid #fecaca; border-radius: 12px; padding: 28px 32px; }
      .risk-box .sec-head .num { background: #fee2e2; color: var(--warn); }
      .risk-box .sec-head h2 { color: var(--warn); }
      .risk-item { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid #fecaca; font-size: 18px; color: #7f1d1d; line-height: 1.6; }
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

/**
 * 从文章总结内容中提取结构化数据
 */
export const extractDataForImage = async (content: string, title?: string): Promise<ImageGenerateData> => {
  const config = loadLLMConfig();

  if (!config.apiKey) {
    throw new Error('请先配置 LLM API Key');
  }

  const systemPrompt = `你是一个专业的文章分析助手。请分析用户提供的内容，提取关键信息并以JSON格式返回。

要求：
1. 根据文章内容，提取2-3条核心指标（kpis），每条包含：指标名称(label)、数值(value)、单位(unit,可选)、描述(desc)
2. 提取每个重要段落/章节的要点（keyPoints），每个包含：label(中文名)、描述(desc)、标签(tags)
3. 提取2-3条核心结论（conclusions），每条包含：编号(id格式为R1/R2/R3)、结论标题、结论解释
4. 优化文章标题(title)和生成一个简短的描述性副标题(subtitle)
5. 生成的描述/解释需要简洁明了，控制在20个字内

请直接返回JSON，不要添加任何解释或markdown代码块标记。`;

  const userPrompt = title ? `文章标题：${title}\n\n文章内容：\n${content}` : `文章内容：\n${content}`;

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
        temperature: 0.7,
        max_tokens: config.maxTokens || 4000,
      },
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const rawContent = response.data.choices?.[0]?.message?.content || '';

    // 解析JSON
    let jsonStr = rawContent.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();

    const extractedData = JSON.parse(jsonStr) as ImageGenerateData;

    // 验证并补全数据
    if (!extractedData.title && title) {
      extractedData.title = title;
    }
    if (!extractedData.subtitle) {
      extractedData.subtitle = '文章核心内容解读';
    }
    if (!extractedData.kpis || extractedData.kpis.length === 0) {
      extractedData.kpis = [{ label: '关键指标', value: '-', desc: '数据提取中' }];
    }
    if (!extractedData.keyPoints || extractedData.keyPoints.length === 0) {
      extractedData.keyPoints = [{ label: '核心要点', desc: '内容提取中', tags: [] }];
    }
    if (!extractedData.conclusions || extractedData.conclusions.length === 0) {
      extractedData.conclusions = [{ id: 'R1', title: '核心结论', desc: '结论提取中' }];
    }

    logger.info('[extractDataForImage] 成功提取结构化数据');
    logger.info('[extractDataForImage] 提取的数据:', extractedData);
    return extractedData;
  } catch (error) {
    logger.error('[extractDataForImage] 提取失败:', error);
    throw error;
  }
};

/**
 * 使用提取的数据填充HTML模版
 */
export const fillHtmlTemplate = (template: string, data: ImageGenerateData): string => {
  let html = template;

  // 1. 替换标题和副标题
  html = html.replace(/<h1><\/h1>/, `<h1>${escapeHtml(data.title || '')}</h1>`);
  html = html.replace(
    /<div class="subtitle"><\/div>/,
    `<div class="subtitle">${escapeHtml(data.subtitle || '')}</div>`,
  );

  // 2. 替换 KPI 区域
  const kpiHtml = buildKpiHtml(data.kpis);
  html = html.replace('<!-- KPI 动态替换 -->', kpiHtml);

  // 2.1 替换 KPT数量
  html = html.replace('<!-- KPI数量 -->', data.kpis.length.toString());

  // 3. 替换重点信息区域
  const spectrumHtml = buildSpectrumHtml(data.keyPoints);
  html = html.replace('<!-- 重点信息动态替换 -->', spectrumHtml);

  // 4. 替换结论总结区域
  const conclusionsHtml = buildConclusionsHtml(data.conclusions);
  html = html.replace('<!-- 结论动态替换 -->', conclusionsHtml);

  return html;
};

/**
 * 构建 KPI HTML
 */
const buildKpiHtml = (kpis: ImageGenerateData['kpis']): string => {
  return kpis
    .slice(0, 4)
    .map(
      (kpi) => `
            <div class="kpi-card">
              <div class="label">${escapeHtml(kpi.label)}</div>
              <div class="number">${escapeHtml(kpi.value)}<span class="unit">${escapeHtml(kpi.unit || '')}</span></div>
              <div class="desc">${escapeHtml(kpi.desc)}</div>
            </div>`,
    )
    .join('\n');
};

/**
 * 构建重点信息 HTML
 */
const buildSpectrumHtml = (keyPoints: ImageGenerateData['keyPoints']): string => {
  return keyPoints
    .map((point) => {
      const tagText = point.tags ? point.tags.join(' · ') : '';
      return `
              <div class="spectrum-item">
                <div class="s-left">
                  <div class="s-label">${escapeHtml(point.label)}</div>
                </div>
                <div>
                  <div class="s-desc">${escapeHtml(point.desc)}</div>
                  <span class="s-tag medium">${tagText}</span>
                </div>
              </div>`;
    })
    .join('\n');
};

/**
 * 构建结论 HTML
 */
const buildConclusionsHtml = (conclusions: ImageGenerateData['conclusions']): string => {
  return conclusions
    .slice(0, 3)
    .map((c, idx) => {
      const id = c.id || 'R' + (idx + 1);
      return `
          <div class="risk-item">
            <span class="idx">${escapeHtml(id)}</span>
            <span><strong>${escapeHtml(c.title)}</strong>${c.desc ? ` — ${escapeHtml(c.desc)}` : ''}</span>
          </div>`;
    })
    .join('\n');
};

/**
 * HTML特殊字符转义
 */
const escapeHtml = (str: string | undefined | null): string => {
  if (str == null) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return String(str).replace(/[&<>"']/g, (c) => map[c]);
};
