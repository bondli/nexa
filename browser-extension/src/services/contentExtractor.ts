import TurndownService from 'turndown';

/**
 * 提取结果
 */
export interface ExtractResult {
  success: boolean;
  content?: string;
  title?: string;
  url?: string;
  message?: string;
}

// 创建 Turndown 服务实例
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emphasis: '_',
  strong: '**',
});

/**
 * 特定平台的精确内容选择器（按优先级排列，命中即停止）
 * 精确匹配比通用排除法更可靠
 */
const PLATFORM_SELECTORS = [
  // 微信公众号
  '#js_content',
  // 飞书文档
  '.document-content-wrapper',
  '.suite-markdown-container',
  // 语雀
  '.lake-content',
  '.ne-viewer-body',
  // Notion
  '.notion-page-content',
  // 掘金
  '.article-content',
  '.markdown-body',
  // CSDN
  '#article_content',
  // 知乎
  '.Post-RichText',
  '.RichText',
  // 简书
  '.show-content-free',
  '.show-content',
  // GitHub README / issue
  '#readme article',
  '.markdown-body',
  // 通用语义化标签
  'article',
  '[role="main"]',
  'main',
  // 通用 class
  '.post-content',
  '.entry-content',
  '.article-body',
  '.content-body',
  '.prose',
  '#content',
];

/**
 * 从页面提取内容（直接在当前页面执行）
 */
export const extractPageContent = (): ExtractResult => {
  try {
    // 获取页面标题
    const title =
      document.title ||
      document.querySelector('h1')?.textContent ||
      '未命名';

    // 获取页面 URL
    const url = window.location.href;

    // 获取主要内容
    const html = extractMainContent();

    // 将 HTML 转换为 Markdown
    const markdown = turndownService.turndown(html);

    // 构建带链接的内容
    const fullContent = `# ${title}\n\n来源: [${url}](${url})\n\n---\n\n${markdown}`;

    return {
      success: true,
      content: fullContent,
      title,
      url,
    };
  } catch (error) {
    console.error('提取页面内容失败:', error);
    return { success: false, message: '提取失败，请稍后重试' };
  }
};

/**
 * 提取页面主要内容
 * 策略：优先匹配平台精确选择器，命中即用；兜底时做基本清理
 */
function extractMainContent(): string {
  // 1. 按优先级尝试精确选择器，命中直接返回
  for (const selector of PLATFORM_SELECTORS) {
    const el = document.querySelector(selector);
    if (el && el.textContent && el.textContent.trim().length > 100) {
      return cleanElement(el);
    }
  }

  // 2. 兜底：取 body，做基本清理
  return cleanElement(document.body);
}

/**
 * 克隆元素并移除无意义的噪音节点（仅移除绝对无用的标签）
 */
function cleanElement(el: Element): string {
  const cloned = el.cloneNode(true) as Element;

  // 只移除脚本、样式等绝对无内容价值的标签
  const noiseSelectors = ['script', 'style', 'noscript', 'iframe', 'svg'];
  for (const selector of noiseSelectors) {
    cloned.querySelectorAll(selector).forEach((node) => node.remove());
  }

  return cloned.innerHTML;
}
