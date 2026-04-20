import path from 'path';
import os from 'os';
import fs from 'fs';

// 配置文件存储在用户主目录下的隐藏文件夹 .nexa 中
export const getConfigPath = (): string => {
  const homeDir = os.homedir();
  return path.join(homeDir, '.nexa', 'setting.json');
};

// API配置文件路径
export const getApiConfigPath = (): string => {
  const homeDir = os.homedir();
  return path.join(homeDir, '.nexa', 'api.json');
};

// 确保配置目录存在
export const ensureConfigDir = (): void => {
  const configDir = path.dirname(getConfigPath());
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
};

// 读取API配置
export interface ApiConfig {
  cloudSyncApiKey?: string;
  cloudSyncEndpoint?: string;
}

export const getApiConfig = (): ApiConfig => {
  const configPath = getApiConfigPath();
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('读取API配置失败:', error);
  }
  return {};
};
