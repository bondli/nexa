import React from 'react';
import { createRoot } from 'react-dom/client';
import { StyleProvider } from '@ant-design/cssinjs';
import { App as AntdApp } from 'antd';
import { CollectorPanelApp } from './components/CollectorPanelApp';
import contentCss from './styles/content.css?inline';

const init = () => {
  // 注入 content 样式到 document.head（和 Antd 样式同处，避免 shadow DOM 隔离问题）
  const style = document.createElement('style');
  style.id = 'nexa-content-style';
  style.textContent = contentCss;
  document.head.appendChild(style);

  // 创建渲染容器，直接挂到 body（不用 Shadow DOM）
  const renderRoot = document.createElement('div');
  renderRoot.id = 'nexa-content-root';
  document.body.appendChild(renderRoot);

  // 渲染 React 应用
  const root = createRoot(renderRoot);
  root.render(
    <React.StrictMode>
      <StyleProvider container={document.head}>
        <AntdApp>
          <CollectorPanelApp />
        </AntdApp>
      </StyleProvider>
    </React.StrictMode>
  );
};

console.log('Nexa 采集插件已加载');
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
