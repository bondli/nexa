import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// content script 专用构建配置（IIFE 格式，单文件，无 import）
export default defineConfig({
  plugins: [react()],
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
