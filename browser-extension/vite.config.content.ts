import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// 将提取的 CSS 自动注入到 document.head 的插件
const injectCssPlugin = (): Plugin => {
  let cssContent = '';
  return {
    name: 'inject-css',
    apply: 'build',
    generateBundle(_, bundle) {
      // 收集所有 CSS 文件内容并从 bundle 中删除（避免生成独立 .css 文件）
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'asset' && fileName.endsWith('.css')) {
          cssContent += chunk.source as string;
          delete bundle[fileName];
        }
      }
    },
    renderChunk(code) {
      if (!cssContent) return null;
      // 在 IIFE 代码头部注入样式
      const injectCode = `
(function() {
  const __nexaStyle = document.createElement('style');
  __nexaStyle.id = 'nexa-modules-style';
  __nexaStyle.textContent = ${JSON.stringify(cssContent)};
  document.head.appendChild(__nexaStyle);
})();
`;
      return { code: injectCode + code, map: null };
    },
  };
};

// content script 专用构建配置（IIFE 格式，单文件，无 import）
export default defineConfig({
  plugins: [react(), injectCssPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env': '{"NODE_ENV":"production"}',
    'process.nextTick': 'setTimeout',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/content/content.tsx'),
      name: 'NexaContent',
      formats: ['iife'],
      fileName: () => 'assets/content.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
