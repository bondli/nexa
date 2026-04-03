#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

// 检查是否有 package.json
if (!fs.existsSync('package.json')) {
  console.log('⚠️  跳过格式化：当前目录不是项目根目录');
  process.exit(0);
}

// 格式化代码
try {
  console.log('🎨 正在格式化代码...');
  execSync('npx prettier --write "src/**/*.{ts, less}"');
  console.log('✅ 代码格式化完成');
} catch (e) {
  console.log('⚠️  格式化失败：', e.message);
}
