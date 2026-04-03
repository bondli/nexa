import { Request, Response } from 'express';
import logger from 'electron-log';
import path from 'path';
import fs from 'fs';

// 配置文件路径
const configPath = path.join(__dirname, '../config/config.json');

// 判断是否安装了
export const isInstalled = async (req: Request, res: Response) => {
  try {
    if (!fs.existsSync(configPath)) {
      res.json({ success: true, installed: false });
      return;
    }
    const config = fs.readFileSync(configPath, 'utf-8');
    const configObj = JSON.parse(config);
    if (configObj && configObj.DB_HOST) {
      res.json({ success: true, installed: true });
    }
    res.json({ success: true, installed: false });
  } catch (error) {
    logger.error('读取配置文件失败:', error);
    res.status(500).json({ installed: false });
  }
};

// 保存用户安装的配置
export const saveConfig = async (req: Request, res: Response) => {
  const { dbhost, dbport, dbname, dbuser, dbpwd } = req.body;
  try {
    const config = {
      DB_HOST: dbhost,
      DB_PORT: dbport,
      DB_NAME: dbname,
      DB_USERNAME: dbuser,
      DB_PASSWORD: dbpwd,
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    setTimeout(() => {
      // 通知主进程重启服务
      if (typeof process.send === 'function') {
        process.send('restart_server');
      }
    }, 1000);

    res.json({ success: true, message: '配置保存成功，请重启应用' });
  } catch (error) {
    logger.error('保存配置文件失败:', error);
    res.status(500).json({ success: false, message: '配置保存失败' });
  }
};