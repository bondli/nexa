const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../');
const androidAssets = path.join(projectRoot, 'android/app/src/main/assets');
const distDir = path.join(__dirname, '..', 'dist');
const bundleSrc = path.join(distDir, 'index.android.bundle');
const bundleDest = path.join(androidAssets, 'index.android.bundle');

// 字体资源路径
const fontSrcDir = path.join(__dirname, '..', 'node_modules/@ant-design/icons-react-native/fonts');
const fontDestDir = path.join(androidAssets, 'fonts');

if (!fs.existsSync(distDir)) {
  console.error('dist 不存在，请先运行 npm run bundle:android');
  process.exit(1);
}

if (!fs.existsSync(bundleSrc)) {
  console.error('未找到 index.android.bundle，请确认打包已完成');
  process.exit(1);
}

if (!fs.existsSync(androidAssets)) {
  fs.mkdirSync(androidAssets, { recursive: true });
}

// 复制bundle文件
fs.copyFileSync(bundleSrc, bundleDest);
console.log('已拷贝 bundle 到:', bundleDest);

// 复制字体文件
if (fs.existsSync(fontSrcDir)) {
  if (!fs.existsSync(fontDestDir)) {
    fs.mkdirSync(fontDestDir, { recursive: true });
  }
  
  const fontFiles = fs.readdirSync(fontSrcDir);
  fontFiles.forEach(file => {
    const srcFile = path.join(fontSrcDir, file);
    const destFile = path.join(fontDestDir, file);
    fs.copyFileSync(srcFile, destFile);
    console.log('已拷贝字体文件到:', destFile);
  });
} else {
  console.warn('未找到Ant Design字体资源目录:', fontSrcDir);
}