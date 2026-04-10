// Content Script - 在页面中运行的脚本
// 用于与页面交互，提取内容，显示采集面板等

import TurndownService from 'turndown';

console.log('Nexa 采集插件已加载');

// 导入面板组件
import { collectorPanel } from './components/CollectorPanelFixed';

// 创建 Turndown 服务实例
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emphasis: '_',
  strong: '**',
});

/**
 * 监听来自 popup 或 background 的消息
 */
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'extractContent') {
    // 提取内容
    const result = extractPageContent();
    sendResponse(result);
  } else if (request.action === 'openCollectorPanel') {
    // 打开采集面板
    collectorPanel.open();
    sendResponse({ success: true });
  } else if (request.action === 'closeCollectorPanel') {
    // 关闭采集面板
    collectorPanel.close();
    sendResponse({ success: true });
  } else if (request.action === 'checkPanelStatus') {
    // 检查面板状态
    sendResponse({ isOpen: collectorPanel.isOpen });
  }
  return true;
});

/**
 * 提取页面主要内容（供面板组件内部调用）
 */
export function extractPageContent(): {
  success: boolean;
  content?: string;
  title?: string;
  url?: string;
  message?: string;
} {
  try {
    const title =
      document.title ||
      document.querySelector('h1')?.textContent ||
      '未命名';

    const url = window.location.href;
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
}

/**
 * 提取页面主要内容
 */
function extractMainContent(): string {
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

  if (!mainElement) {
    mainElement = document.body;
  }

  const cloned = mainElement.cloneNode(true) as Element;

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

export {};