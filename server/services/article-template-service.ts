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
const escapeHtml = (str: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (c) => map[c]);
};
