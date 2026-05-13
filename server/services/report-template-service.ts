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
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>工作日报</title>
  <style>
    @page {
      size: portrait;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #f5f5f7;
      color: #1d1d1f;
      line-height: 1.5;
      padding: 24px 32px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 14px;
      border-bottom: 1px solid #e5e5e5;
    }

    .header h1 {
      font-size: 22px;
      font-weight: 600;
      color: #1d1d1f;
    }

    .header .date {
      font-size: 13px;
      color: #86868b;
    }

    .focus-card {
      background: linear-gradient(135deg, #0071e3 0%, #0077ed 100%);
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 12px;
      color: #ffffff;
    }

    .focus-card .card-tag {
      background: rgba(255,255,255,0.2);
      color: #ffffff;
    }

    .focus-card .card-title {
      color: #ffffff;
    }

    .focus-card .card-content {
      color: rgba(255,255,255,0.9);
    }

    .focus-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }

    .focus-item:last-child {
      margin-bottom: 0;
    }

    .focus-number {
      width: 22px;
      height: 22px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .focus-text {
      font-size: 14px;
      font-weight: 500;
      padding-top: 2px;
    }

    .card {
      background: #ffffff;
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }

    .card-tag {
      display: inline-block;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      padding: 3px 9px;
      border-radius: 10px;
      margin-bottom: 8px;
    }

    .tag-focus {
      background: #0071e3;
      color: #ffffff;
    }

    .tag-article {
      background: #e8f4fd;
      color: #0071e3;
    }

    .tag-note {
      background: #fdf3e8;
      color: #d97706;
    }

    .tag-task {
      background: #fef2f2;
      color: #dc2626;
    }

    .tag-learn {
      background: #ecfdf5;
      color: #059669;
    }

    .card-title {
      font-size: 15px;
      font-weight: 600;
      color: #1d1d1f;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .card-content {
      font-size: 13px;
      color: #424245;
      line-height: 1.6;
    }

    .card-content p {
      margin-bottom: 5px;
    }

    .card-content p:last-child {
      margin-bottom: 0;
    }

    .stats {
      display: flex;
      gap: 20px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #e5e5e5;
    }

    .stat-item {
      display: flex;
      align-items: center;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 600;
      color: #0071e3;
      margin-right: 6px;
    }

    .stat-label {
      font-size: 12px;
      color: #86868b;
    }
  </style>
</head>
<body>
<div class="body">
  <div class="header">
    <h1>工作日报</h1>
    <span class="date" id="reportDate"></span>
  </div>

  <!-- 今日重点 -->
  <div class="focus-card">
    <span class="card-tag tag-focus">重点</span>
    <div class="card-content">
      <div class="focus-item">
        <span class="focus-number">1</span>
        <span class="focus-text">完成 xxx 功能模块的代码评审</span>
      </div>
      <div class="focus-item">
        <span class="focus-number">2</span>
        <span class="focus-text">跟进上周的 xxx 需求进度</span>
      </div>
    </div>
  </div>

  <!-- 昨日文章 · 认知 -->
  <div class="card">
    <span class="card-tag tag-article">认知</span>
    <div class="card-title">知识点：边际成本</div>
    <div class="card-content">
      <p>新认知：之前以为规模越大成本越低，但实际上边际成本在某个节点会反升。</p>
      <p>行动：重新审视当前项目的规模扩张是否真的划算。</p>
    </div>
  </div>

  <div class="card">
    <span class="card-tag tag-article">认知</span>
    <div class="card-title">知识点：确认偏误</div>
    <div class="card-content">
      <p>新认知：我们倾向于只收集支持自己观点的信息，而忽略反驳的证据。</p>
      <p>行动：做决策前，主动列出三条反对意见。</p>
    </div>
  </div>

  <!-- 昨日笔记 -->
  <div class="card">
    <span class="card-tag tag-note">笔记</span>
    <div class="card-title">笔记主题示例</div>
    <div class="card-content">
      <p>记录的关键内容，包含学到的概念和思考。</p>
      <p>后续需要跟进的方向或行动项。</p>
    </div>
  </div>

  <!-- 待办任务 -->
  <div class="card">
    <span class="card-tag tag-task">任务</span>
    <div class="card-title">需要完成的具体任务</div>
    <div class="card-content">
      <p>任务的背景说明，为什么要做这件事。</p>
    </div>
  </div>

  <!-- 今日学习 -->
  <div class="card">
    <span class="card-tag tag-learn">待学</span>
    <div class="card-title">需要深入学习的知识点</div>
    <div class="card-content">
      <p>来自某篇文章的某个概念，值得今天花时间研究。</p>
    </div>
  </div>

  <div class="stats">
    <div class="stat-item">
      <span class="stat-value">2</span>
      <span class="stat-label">个认知</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">1</span>
      <span class="stat-label">条笔记</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">1</span>
      <span class="stat-label">项任务</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">1</span>
      <span class="stat-label">个待学</span>
    </div>
  </div>
</div>
</body>
</html>`;
};

/**
 * 从文章总结内容中提取结构化数据
 */
export const extractDataForImage = async (content: string): Promise<ImageGenerateData> => {
  const config = loadLLMConfig();

  if (!config.apiKey) {
    throw new Error('请先配置 LLM API Key');
  }

  const systemPrompt = `你是一个专业的日报分析助手。请从用户提供的日报内容中提取结构化信息，用于生成可视化图文报告，严格以JSON格式返回。

【字段说明】

1. title（string）
   - 提炼或优化日报标题，简明点明主题，不超过20字

2. subtitle（string）
   - 生成一句话副标题，描述本期日报的核心亮点或周期，不超过30字

3. kpis（array，2~3条）
   - 从日报中提取可量化的核心数据指标，例如完成任务数、覆盖用户数、完成率等
   - 每条字段：
     · label: 指标名称（如"完成任务数"）
     · value: 数值（纯数字字符串，如"12"）
     · unit: 单位（可选，如"项"、"%"、"人"）
     · desc: 一句话补充说明，不超过20字
   - 若日报中无明显数据指标，可从工作量/进度/覆盖面中归纳

4. keyPoints（array，3~5条）
   - 提取日报中每个重要工作事项或进展
   - 每条字段：
     · label: 模块或工作项名称，不超过8字
     · desc: 内容摘要，不超过40字，保留关键细节
     · tags: 标签数组（1~2个），如["已完成"]、["进行中"]、["待跟进"]

5. conclusions（array，2~3条）
   - 提炼本期日报的核心结论、风险提示或下一步重点
   - 每条字段：
     · id: 编号，格式为 R1 / R2 / R3
     · title: 结论标题，不超过15字
     · desc: 结论解释，不超过30字

【输出要求】
- 直接返回合法 JSON 对象，不添加任何解释、注释或 markdown 代码块标记
- 所有文字使用中文
- JSON 结构示例：
{
  "title": "...",
  "subtitle": "...",
  "kpis": [{ "label": "...", "value": "...", "unit": "...", "desc": "..." }],
  "keyPoints": [{ "label": "...", "desc": "...", "tags": ["..."] }],
  "conclusions": [{ "id": "R1", "title": "...", "desc": "..." }]
}`;

  const userPrompt = `日报内容：\n${content}`;

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
    if (!extractedData.title) {
      extractedData.title = '工作日报';
    }
    if (!extractedData.subtitle) {
      extractedData.subtitle = '日报核心内容汇总';
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
 * 根据 keyPoint 的 tags 推断对应的 CSS 类和标签文字
 */
const resolveTagStyle = (tags: string[]): { cssClass: string; label: string } => {
  const tagStr = (tags || []).join('');
  if (tagStr.includes('待学') || tagStr.includes('学习')) {
    return { cssClass: 'tag-learn', label: '待学' };
  }
  if (tagStr.includes('任务') || tagStr.includes('待跟进') || tagStr.includes('进行中')) {
    return { cssClass: 'tag-task', label: tagStr.includes('进行中') ? '进行中' : '待跟进' };
  }
  if (tagStr.includes('笔记')) {
    return { cssClass: 'tag-note', label: '笔记' };
  }
  if (tagStr.includes('认知') || tagStr.includes('文章')) {
    return { cssClass: 'tag-article', label: '认知' };
  }
  // 默认：已完成的工作事项用笔记样式
  return { cssClass: 'tag-note', label: tags[0] || '事项' };
};

/**
 * 构建今日重点卡片的 focus-item 列表（取 keyPoints 中标签含"已完成"或前几条）
 */
const buildFocusItemsHtml = (keyPoints: ImageGenerateData['keyPoints']): string => {
  // 优先取标有"已完成"的，否则取前3条
  const focusPoints = keyPoints.filter((p) => (p.tags || []).includes('已完成'));
  const items = focusPoints.length > 0 ? focusPoints.slice(0, 3) : keyPoints.slice(0, 3);
  return items
    .map(
      (p, idx) => `
      <div class="focus-item">
        <span class="focus-number">${idx + 1}</span>
        <span class="focus-text">${escapeHtml(p.label)}${p.desc ? '：' + escapeHtml(p.desc) : ''}</span>
      </div>`,
    )
    .join('\n');
};

/**
 * 构建普通卡片列表（keyPoints 中非"已完成"的，或全部）
 */
const buildCardItemsHtml = (keyPoints: ImageGenerateData['keyPoints']): string => {
  // 取未放入 focus 区的事项，或全量
  const nonFocusPoints = keyPoints.filter((p) => !(p.tags || []).includes('已完成'));
  const items = nonFocusPoints.length > 0 ? nonFocusPoints : keyPoints;
  return items
    .map((p) => {
      const { cssClass, label } = resolveTagStyle(p.tags);
      return `
  <div class="card">
    <span class="card-tag ${cssClass}">${escapeHtml(label)}</span>
    <div class="card-title">${escapeHtml(p.label)}</div>
    <div class="card-content">
      <p>${escapeHtml(p.desc)}</p>
    </div>
  </div>`;
    })
    .join('\n');
};

/**
 * 构建结论卡片（作为一张独立 card 插入）
 */
const buildConclusionCardHtml = (conclusions: ImageGenerateData['conclusions']): string => {
  if (!conclusions || conclusions.length === 0) return '';
  const items = conclusions
    .slice(0, 3)
    .map((c, idx) => {
      const id = c.id || `R${idx + 1}`;
      return `
      <p><strong>${escapeHtml(id)} ${escapeHtml(c.title)}</strong>${c.desc ? '：' + escapeHtml(c.desc) : ''}</p>`;
    })
    .join('\n');
  return `
  <div class="card">
    <span class="card-tag tag-task">总结</span>
    <div class="card-title">核心结论</div>
    <div class="card-content">${items}
    </div>
  </div>`;
};

/**
 * 构建底部统计数字（基于 kpis）
 */
const buildStatsHtml = (kpis: ImageGenerateData['kpis']): string => {
  return kpis
    .slice(0, 5)
    .map(
      (kpi) => `
    <div class="stat-item">
      <span class="stat-value">${escapeHtml(kpi.value)}</span>
      <span class="stat-label">${escapeHtml(kpi.unit || '')}${escapeHtml(kpi.label)}</span>
    </div>`,
    )
    .join('\n');
};

/**
 * 使用提取的数据填充HTML模版
 */
export const fillHtmlTemplate = (template: string, data: ImageGenerateData): string => {
  let html = template;

  // 1. 替换 <title> 标签内容
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(data.title || '工作日报')}</title>`);

  // 2. 替换 header 中的 <h1>
  html = html.replace(/<h1>工作日报<\/h1>/, `<h1 style="margin: 0">[工作日报]${escapeHtml(data.title)}</h1>`);

  // 3. 写上日报日期
  if (data.subtitle) {
    html = html.replace(
      /<span class="date" id="reportDate"><\/span>/,
      `<span class="date" id="reportDate">${new Date().toLocaleDateString('zh-CN')}<\/span>`,
    );
  }

  // 4. 替换今日重点卡片内容
  const focusItemsHtml = buildFocusItemsHtml(data.keyPoints);
  html = html.replace(
    /(<div class="focus-card">[\s\S]*?<div class="card-content">)([\s\S]*?)(<\/div>\s*<\/div>\s*<!-- 昨日)/,
    `$1\n${focusItemsHtml}\n    $3`,
  );

  // 5. 替换普通卡片区域（昨日文章/笔记/任务/待学 等静态示例）
  // 将从"<!-- 昨日文章"到"<!-- 待办任务"末尾的所有静态卡片替换为动态内容
  const cardItemsHtml = buildCardItemsHtml(data.keyPoints);
  const conclusionCardHtml = buildConclusionCardHtml(data.conclusions);
  html = html.replace(
    /<!-- 昨日文章 · 认知 -->[\s\S]*?<!-- 待办任务 -->[\s\S]*?<\/div>\s*\n\s*<!-- 今日学习/,
    `${cardItemsHtml}\n\n  <!-- 今日学习`,
  );

  // 6. 替换今日学习卡片（用结论卡片替代）
  html = html.replace(
    /<!-- 今日学习 -->[\s\S]*?<\/div>\s*\n\s*<div class="stats">/,
    `${conclusionCardHtml}\n\n  <div class="stats">`,
  );

  // 7. 替换底部统计数据
  const statsHtml = buildStatsHtml(data.kpis);
  html = html.replace(
    /(<div class="stats">)([\s\S]*?)(<\/div>\s*\n\s*<\/body>)/,
    `$1\n${statsHtml}\n  $3`,
  );

  return html;
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
