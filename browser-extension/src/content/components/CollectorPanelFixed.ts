// 悬浮面板组件 - 使用 Shadow DOM 实现，不依赖 React

import { getLoginData } from '../../services/utils';
import { getCategories, saveNote, NoteData } from '../../services/note';
import { extractPageContent } from '../content';

// 面板样式
const PANEL_STYLES = `
  .nexa-panel {
    position: fixed;
    top: 20px;
    left: 20px;
    width: 400px;
    max-height: calc(100vh - 40px);
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .nexa-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #1677ff;
    color: #fff;
    cursor: move;
    user-select: none;
    -webkit-app-region: drag;
  }
  .nexa-panel-title {
    font-size: 14px;
    font-weight: 500;
  }
  .nexa-panel-close {
    background: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 4px 8px;
    font-size: 18px;
    line-height: 1;
    border-radius: 4px;
    -webkit-app-region: no-drag;
  }
  .nexa-panel-close:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  .nexa-panel-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    max-height: calc(100vh - 120px);
  }
  .nexa-extract-btn {
    width: 100%;
    padding: 10px 16px;
    background: #1677ff;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .nexa-extract-btn:hover {
    background: #4096ff;
  }
  .nexa-extract-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  .nexa-editor {
    width: 100%;
    min-height: 200px;
    padding: 12px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    box-sizing: border-box;
    margin-bottom: 16px;
  }
  .nexa-editor:focus {
    outline: none;
    border-color: #1677ff;
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
  }
  .nexa-action-row {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .nexa-category-select {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    font-size: 14px;
  }
  .nexa-save-btn {
    padding: 8px 20px;
    background: #1677ff;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
  }
  .nexa-save-btn:hover {
    background: #4096ff;
  }
  .nexa-save-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  .nexa-message {
    padding: 8px 12px;
    border-radius: 4px;
    margin-bottom: 12px;
    font-size: 14px;
  }
  .nexa-message-error {
    color: #ff4d4f;
    background: #fff2f0;
    border: 1px solid #ffccc7;
  }
  .nexa-message-success {
    color: #52c41a;
    background: #f6ffed;
    border: 1px solid #b7eb8f;
  }
  .nexa-loading {
    text-align: center;
    padding: 20px;
    color: #666;
  }
  .nexa-empty {
    text-align: center;
    padding: 40px 20px;
    color: #999;
  }
`;

interface PanelState {
  isOpen: boolean;
  content: string;
  title: string;
  url: string;
  categories: Array<{ id: number; name: string }>;
  selectedCategory: number | null;
  loading: boolean;
  extracting: boolean;
  saving: boolean;
  message: { type: 'error' | 'success'; text: string } | null;
}

class CollectorPanelFixed {
  private shadowRoot: ShadowRoot | null = null;
  private container: HTMLElement | null = null;
  private state: PanelState = {
    isOpen: false,
    content: '',
    title: '',
    url: '',
    categories: [],
    selectedCategory: null,
    loading: false,
    extracting: false,
    saving: false,
    message: null,
  };

  // 面板是否已创建
  private isCreated = false;

  // 面板是否打开
  get isOpen(): boolean {
    return this.state.isOpen;
  }

  // 初始化 - 创建 Shadow DOM 和面板
  async init(): Promise<void> {
    if (this.isCreated) {
      return;
    }

    // 检查登录状态
    const loginData = await getLoginData();
    if (!loginData || !loginData.id) {
      this.showLoginPrompt();
      return;
    }

    this.createPanel();
    await this.loadCategories();
    this.isCreated = true;
  }

  // 显示登录提示
  private showLoginPrompt(): void {
    // 创建一个简单的提示面板
    const div = document.createElement('div');
    div.id = 'nexa-collector-panel-root';
    div.innerHTML = `
      <style>${PANEL_STYLES}</style>
      <div class="nexa-panel">
        <div class="nexa-panel-header">
          <span class="nexa-panel-title">Nexa 采集面板</span>
          <button class="nexa-panel-close" id="nexa-panel-close">&times;</button>
        </div>
        <div class="nexa-panel-content">
          <div class="nexa-empty">
            <p>请先在插件弹窗中登录</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(div);
    this.container = div;

    // 绑定关闭事件
    div.querySelector('#nexa-panel-close')?.addEventListener('click', () => {
      this.close();
    });
  }

  // 创建面板
  private createPanel(): void {
    // 创建 Shadow DOM
    const host = document.createElement('div');
    host.id = 'nexa-collector-panel-root';
    document.body.appendChild(host);

    this.shadowRoot = host.attachShadow({ mode: 'open' });

    // 渲染面板
    this.render();

    // 绑定事件
    this.bindEvents();
  }

  // 渲染面板
  private render(): void {
    if (!this.shadowRoot) return;

    const html = `
      <style>${PANEL_STYLES}</style>
      <div class="nexa-panel">
        <div class="nexa-panel-header">
          <span class="nexa-panel-title">Nexa 采集面板</span>
          <button class="nexa-panel-close" id="nexa-panel-close">&times;</button>
        </div>
        <div class="nexa-panel-content">
          ${this.state.message ? `<div class="nexa-message nexa-message-${this.state.message.type}">${this.state.message.text}</div>` : ''}

          ${this.state.extracting ? '<div class="nexa-loading">提取中...</div>' : `
            <button class="nexa-extract-btn" id="nexa-extract-btn">
              ${this.state.extracting ? '提取中...' : '一键提取'}
            </button>
          `}

          ${this.state.content ? `
            <textarea class="nexa-editor" id="nexa-editor" placeholder="提取的内容将显示在这里，您可以编辑...">${this.state.content}</textarea>

            <div class="nexa-action-row">
              <select class="nexa-category-select" id="nexa-category-select">
                <option value="">选择笔记分类</option>
                ${this.state.categories.map(c => `<option value="${c.id}" ${this.state.selectedCategory === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
              <button class="nexa-save-btn" id="nexa-save-btn" ${!this.state.selectedCategory ? 'disabled' : ''}>
                ${this.state.saving ? '保存中...' : '保存到笔记'}
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    this.shadowRoot.innerHTML = html;
  }

  // 绑定事件
  private bindEvents(): void {
    if (!this.shadowRoot) return;

    // 关闭按钮
    this.shadowRoot.querySelector('#nexa-panel-close')?.addEventListener('click', () => {
      this.close();
    });

    // 提取按钮
    this.shadowRoot.querySelector('#nexa-extract-btn')?.addEventListener('click', () => {
      this.handleExtract();
    });

    // 编辑器内容变化
    this.shadowRoot.querySelector('#nexa-editor')?.addEventListener('input', (e) => {
      this.state.content = (e.target as HTMLTextAreaElement).value;
    });

    // 分类选择变化
    this.shadowRoot.querySelector('#nexa-category-select')?.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value;
      this.state.selectedCategory = value ? parseInt(value, 10) : null;
      this.updateSaveButton();
    });

    // 保存按钮
    this.shadowRoot.querySelector('#nexa-save-btn')?.addEventListener('click', () => {
      this.handleSave();
    });
  }

  // 更新保存按钮状态
  private updateSaveButton(): void {
    if (!this.shadowRoot) return;
    const saveBtn = this.shadowRoot.querySelector('#nexa-save-btn') as HTMLButtonElement;
    if (saveBtn) {
      saveBtn.disabled = !this.state.selectedCategory;
    }
  }

  // 加载分类列表
  private async loadCategories(): Promise<void> {
    this.state.loading = true;
    this.render();

    try {
      const categories = await getCategories();
      this.state.categories = categories;
    } catch (error) {
      console.error('加载分类失败:', error);
      this.showMessage('error', '加载分类失败');
    }

    this.state.loading = false;
    this.render();
  }

  // 处理提取
  private async handleExtract(): Promise<void> {
    this.state.extracting = true;
    this.render();

    try {
      const result = await extractPageContent();
      if (result.success) {
        this.state.content = result.content || '';
        this.state.title = result.title || '未命名';
        this.state.url = result.url || '';
        this.showMessage('success', '提取成功');
      } else {
        this.showMessage('error', result.message || '提取失败');
      }
    } catch (error) {
      console.error('提取失败:', error);
      this.showMessage('error', '提取失败，请稍后重试');
    }

    this.state.extracting = false;
    this.render();
  }

  // 处理保存
  private async handleSave(): Promise<void> {
    if (!this.state.selectedCategory) {
      this.showMessage('error', '请选择笔记分类');
      return;
    }
    if (!this.state.content.trim()) {
      this.showMessage('error', '内容不能为空');
      return;
    }

    this.state.saving = true;
    this.render();

    try {
      const noteData: NoteData = {
        title: this.state.title || '未命名',
        content: this.state.content,
        url: this.state.url,
        cateId: this.state.selectedCategory,
      };

      const result = await saveNote(noteData);

      if (result.success) {
        this.showMessage('success', '保存成功');
        // 清空内容
        this.state.content = '';
        this.state.title = '';
        this.state.url = '';
        this.state.selectedCategory = null;
      } else {
        this.showMessage('error', result.message || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      this.showMessage('error', '保存失败，请稍后重试');
    }

    this.state.saving = false;
    this.render();
  }

  // 显示消息
  private showMessage(type: 'error' | 'success', text: string): void {
    this.state.message = { type, text };
    this.render();

    // 3秒后自动清除
    setTimeout(() => {
      this.state.message = null;
      this.render();
    }, 3000);
  }

  // 打开面板
  async open(): Promise<void> {
    await this.init();
    this.state.isOpen = true;
    if (this.container) {
      this.container.style.display = 'block';
    }
    if (this.shadowRoot) {
      const panel = this.shadowRoot.querySelector('.nexa-panel') as HTMLElement;
      if (panel) {
        panel.style.display = 'flex';
      }
    }
  }

  // 关闭面板
  close(): void {
    this.state.isOpen = false;
    if (this.container) {
      this.container.style.display = 'none';
    }
    if (this.shadowRoot) {
      const panel = this.shadowRoot.querySelector('.nexa-panel') as HTMLElement;
      if (panel) {
        panel.style.display = 'none';
      }
    }
  }

  // 销毁面板
  destroy(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    this.isCreated = false;
    this.state.isOpen = false;
  }
}

// 导出单例
export const collectorPanel = new CollectorPanelFixed();