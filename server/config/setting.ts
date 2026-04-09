import path from 'path';
import os from 'os';

// 配置文件存储在用户主目录下的隐藏文件夹 .nexa 中
export const getConfigPath = (): string => {
  const homeDir = os.homedir();
  return path.join(homeDir, '.nexa', 'setting.json');
};

// 确保配置目录存在
export const ensureConfigDir = (): void => {
  const configDir = path.dirname(getConfigPath());
  const fs = require('fs');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
};
