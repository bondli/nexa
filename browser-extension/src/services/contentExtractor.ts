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
 * 从页面提取内容
 */
export const extractPageContent = async (): Promise<ExtractResult> => {
  try {
    // 获取当前活动标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      return { success: false, message: '无法获取当前标签页' };
    }

    // 通过执行脚本获取页面内容
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractContentFromPage,
    });

    if (!results || results.length === 0) {
      return { success: false, message: '无法提取页面内容' };
    }

    const pageData = results[0].result;

    if (!pageData || !pageData.html) {
      return { success: false, message: '页面内容为空' };
    }

    // 将 HTML 转换为 Markdown
    const markdown = turndownService.turndown(pageData.html);

    // 构建带链接的内容
    const fullContent = `# ${pageData.title}\n\n来源: [${pageData.url}](${pageData.url})\n\n---\n\n${markdown}`;

    return {
      success: true,
      content: fullContent,
      title: pageData.title,
      url: pageData.url,
    };
  } catch (error) {
    console.error('提取页面内容失败:', error);
    return { success: false, message: '提取失败，请稍后重试' };
  }
};

/**
 * 在页面中执行的提取函数
 */
function extractContentFromPage(): {
  title: string;
  url: string;
  html: string;
} {
  // 获取页面标题
  const title =
    document.title ||
    document.querySelector('h1')?.textContent ||
    '未命名';

  // 获取页面 URL
  const url = window.location.href;

  // 获取主要内容
  const html = extractMainContent();

  return { title, url, html };
}

/**
 * 提取页面主要内容
 */
function extractMainContent(): string {
  // 优先查找常见的主要内容容器
  const selectors = [
    'article',
    '[role="main"]',
    'main',
    '.content',
    '.article',
    '.post-content',
    '.entry-content',
    '.markdown-body',
    '.prose',
    '#content',
    '.content-body',
  ];

  let mainElement: Element | null = null;

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      mainElement = element;
      break;
    }
  }

  // 如果没有找到主要内容容器，获取 body
  if (!mainElement) {
    mainElement = document.body;
  }

  // 清理不必要的内容
  const cloned = mainElement.cloneNode(true) as Element;

  // 移除不需要的元素
  const removeSelectors = [
    'script',
    'style',
    'noscript',
    'iframe',
    'nav',
    'header',
    'footer',
    '.nav',
    '.navigation',
    '.menu',
    '.sidebar',
    '.advertisement',
    '.ad',
    '.ads',
    '.social-share',
    '.comments',
    '.related',
    '[role="navigation"]',
    '[role="banner"]',
    '[role="contentinfo"]',
  ];

  for (const selector of removeSelectors) {
    cloned.querySelectorAll(selector).forEach((el) => el.remove());
  }

  return cloned.innerHTML;
}