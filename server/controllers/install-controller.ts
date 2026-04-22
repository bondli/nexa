import { Request, Response } from 'express';
import logger from 'electron-log';
import { getConfig, saveConfig as saveConfigToFile } from '../services/config-service';
import { success, serverError } from '../utils/response';

// 判断是否安装了
export const isInstalled = async (req: Request, res: Response) => {
  try {
    const config = getConfig();
    if (config.database && config.database.DB_HOST) {
      success(res, { installed: true });
      return;
    }
    success(res, { installed: false });
  } catch (error) {
    logger.error('读取配置文件失败:', error);
    res.status(500).json({ code: 500, message: '读取配置文件失败' });
  }
};

// 保存用户安装的配置
export const saveConfig = async (req: Request, res: Response) => {
  const { dbhost, dbport, dbname, dbuser, dbpwd } = req.body;
  try {
    const currentConfig = getConfig();
    currentConfig.database = {
      DB_HOST: dbhost,
      DB_PORT: dbport,
      DB_NAME: dbname,
      DB_USERNAME: dbuser,
      DB_PASSWORD: dbpwd,
    };

    const success_result = saveConfigToFile(currentConfig);

    if (success_result) {
      setTimeout(() => {
        // 通知主进程重启服务
        if (typeof process.send === 'function') {
          process.send('restart_server');
        }
      }, 1000);

      success(res, null, '配置保存成功，请重启应用');
    } else {
      serverError(res, '配置保存失败');
    }
  } catch (error) {
    logger.error('保存配置文件失败:', error);
    serverError(res, '配置保存失败');
  }
};