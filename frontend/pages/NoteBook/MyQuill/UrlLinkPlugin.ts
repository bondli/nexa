import { Quill } from 'react-quill';

interface UrlLinkPluginOptions {
  container?: HTMLElement;
  className?: string;
  iconText?: string;
}

class UrlLinkPlugin {
  private quill: any;
  private options: UrlLinkPluginOptions;
  private tooltip: HTMLElement | null = null;
  private currentSelection: { index: number; length: number; text: string } | null = null;

  constructor(quill: any, options: UrlLinkPluginOptions = {}) {
    this.quill = quill;
    this.options = {
      className: 'url-link-tooltip',
      iconText: '🔗',
      ...options,
    };

    this.init();
  }

  private init() {
    // 监听选择变化事件
    this.quill.on('selection-change', this.handleSelectionChange.bind(this));

    // 监听文本变化事件，隐藏tooltip
    this.quill.on('text-change', this.hideTooltip.bind(this));

    // 添加样式
    this.addStyles();
  }

  private addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .${this.options.className} {
        position: absolute;
        background: #333;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        user-select: none;
        transition: opacity 0.2s ease;
      }
      
      .${this.options.className}:hover {
        background: #555;
      }
      
      .${this.options.className}::before {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 4px solid transparent;
        border-top-color: #333;
      }
    `;
    document.head.appendChild(style);
  }

  private handleSelectionChange(range: any) {
    // 如果没有选择或选择长度为0，隐藏tooltip
    if (!range || range.length === 0) {
      this.hideTooltip();
      return;
    }

    // 检查range是否有效
    if (typeof range.index !== 'number' || range.index < 0) {
      this.hideTooltip();
      return;
    }

    // 获取选中的文本
    const selectedText = this.quill.getText(range.index, range.length);

    // 检查是否为URL
    if (this.isValidUrl(selectedText.trim())) {
      // 保存当前有效的选择信息
      this.currentSelection = {
        index: range.index,
        length: range.length,
        text: selectedText.trim(),
      };
      this.showTooltip(selectedText.trim());
    } else {
      this.hideTooltip();
    }
  }

  private isValidUrl(text: string): boolean {
    // URL正则表达式，支持http、https、ftp等协议
    const urlRegex = /^(https?:\/\/|ftp:\/\/|www\.)[^\s/$.?#].[^\s]*$/i;

    // 也支持没有协议的URL（如 www.example.com 或 example.com）
    const domainRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;

    return urlRegex.test(text) || domainRegex.test(text);
  }

  private showTooltip(url: string) {
    // 检查当前选择是否有效
    if (!this.currentSelection || typeof this.currentSelection.index !== 'number') {
      return;
    }

    // 保存当前选择信息，避免在hideTooltip中被清空
    const currentSelection = this.currentSelection;

    // 先隐藏现有的tooltip（但不清空currentSelection）
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }

    // 创建tooltip元素
    this.tooltip = document.createElement('div');
    this.tooltip.className = this.options.className!;
    this.tooltip.textContent = `${this.options.iconText} 转换为链接`;
    this.tooltip.title = `点击将 "${url}" 转换为链接`;

    // 添加点击事件
    this.tooltip.addEventListener('click', () => {
      this.convertToLink(url);
    });

    // 计算tooltip位置
    const bounds = this.quill.getBounds(currentSelection.index, currentSelection.length);
    const editorBounds = this.quill.container.getBoundingClientRect();

    this.tooltip.style.left = `${editorBounds.left + bounds.left + bounds.width / 2}px`;
    this.tooltip.style.top = `${editorBounds.top + bounds.top - 35}px`;
    this.tooltip.style.transform = 'translateX(-50%)';

    document.body.appendChild(this.tooltip);

    // 添加点击外部隐藏tooltip的事件
    setTimeout(() => {
      document.addEventListener('click', this.handleDocumentClick.bind(this), { once: true });
    }, 0);
  }

  private hideTooltip() {
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
    this.currentSelection = null;
  }

  private handleDocumentClick(event: MouseEvent) {
    if (this.tooltip && !this.tooltip.contains(event.target as Node)) {
      this.hideTooltip();
    }
  }

  private convertToLink(url: string) {
    if (!this.currentSelection || typeof this.currentSelection.index !== 'number') {
      return;
    }

    // 保存当前选择信息，避免在操作过程中被清空
    const selectionIndex = this.currentSelection.index;
    const selectionLength = this.currentSelection.length;

    // 确保URL有协议前缀
    let formattedUrl = url;
    if (!url.match(/^https?:\/\//i) && !url.match(/^ftp:\/\//i)) {
      formattedUrl = `https://${url}`;
    }

    // 临时移除text-change事件监听，避免在操作过程中触发hideTooltip
    this.quill.off('text-change', this.hideTooltip);

    // 删除选中的文本
    this.quill.deleteText(selectionIndex, selectionLength);

    // 插入链接
    this.quill.insertText(selectionIndex, url, 'link', formattedUrl);

    // 设置光标位置到链接后面
    this.quill.setSelection(selectionIndex + url.length);

    // 重新添加text-change事件监听
    this.quill.on('text-change', this.hideTooltip.bind(this));

    // 隐藏tooltip
    this.hideTooltip();

    // 触发内容变化事件
    this.quill.root.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // 销毁插件
  destroy() {
    this.hideTooltip();
    // 移除事件监听器
    this.quill.off('selection-change', this.handleSelectionChange);
    this.quill.off('text-change', this.hideTooltip);
  }
}

// 注册为Quill模块
export default function registerUrlLinkPlugin() {
  Quill.register('modules/urlLink', UrlLinkPlugin);
}

export { UrlLinkPlugin };
