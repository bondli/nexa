import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import logger from 'electron-log';
import { PORT } from './config/constant';
import { getConfigPath } from './config/setting';
import { testConnection, syncDatabase } from './config/database';
import { initVectorDB } from './config/vectorDB';
import router from './routers/index';
import { initSyncQueue, startSyncScheduler } from './services/cloud-sync-service';

// 引入所有模型，确保数据库同步时能创建所有表
import './models/User';
import './models/Note';
import './models/Cate';
import './models/Knowledge';
import './models/Docs';
import './models/Chat';
import './models/Picture';

const app = express();

// 检查是否已配置数据库
const isDatabaseConfigured = (): boolean => {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    return false;
  }
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return !!(config && config.DB_HOST);
  } catch {
    return false;
  }
};

// 解析 JSON 请求体，最大 50MB
app.use(express.json({ limit: '50mb' }));

// 解析 URL-encoded 请求体，最大 50MB
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cors());
app.options('*', cors());

// 添加静态文件服务，使files目录下的文件可以通过Web访问
const getFilesDirectory = (): string => {
  // 检查是否在 Electron 环境中
  const isElectron = !!(process as any).resourcesPath;

  let filesDir: string;
  if (isElectron) {
    // Electron 环境：使用 resourcesPath
    filesDir = path.join((process as any).resourcesPath, 'files');
  } else {
    // Node.js 环境：使用项目根目录下的 files 文件夹
    filesDir = path.join(process.cwd(), 'files');
  }

  return filesDir;
};

// 提供files目录下的静态文件服务，添加缓存头
app.use('/files', express.static(getFilesDirectory(), {
  maxAge: '1y', // 缓存1年
  etag: true,
  lastModified: true,
}));

app.use(router);

app.all('*', (req, res, next) => {
  res.header('X-Powered-By', 'NEXA');
  next();
});

(async () => {
  try {
    // 如果已配置数据库，则连接
    if (isDatabaseConfigured()) {
      await testConnection();
      await syncDatabase();
      await initVectorDB();
    } else {
      logger.info('[API Server] 数据库未配置，跳过数据库连接');
    }

    // 初始化云端同步队列
    initSyncQueue();
    // 启动同步调度器（每5分钟扫描一次）
    startSyncScheduler();

    // 启动服务器
    app.listen(PORT, () => {
      logger.info(`[API Server] server is running on port ${PORT}`);
      if (typeof process.send === 'function') {
        process.send('server is ready');
      }
    });
  } catch (error) {
    logger.error('[API Server] Error starting server:', error);
  }
})();
