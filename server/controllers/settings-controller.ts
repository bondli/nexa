import { Request, Response, NextFunction } from 'express';
import { getConfig, saveConfig, UnifiedConfig } from '../services/config-service';
import { success, badRequest } from '../utils/response';

/**
 * 获取统一配置
 */
export const getAllSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const config = getConfig();
    success(res, config);
  } catch (error) {
    next(error);
  }
};

/**
 * 保存统一配置
 */
export const saveAllSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const config: UnifiedConfig = req.body;

    if (!config || typeof config !== 'object') {
      badRequest(res, '配置格式错误');
      return;
    }

    const success_result = saveConfig(config);

    if (success_result) {
      success(res, null, '配置保存成功');
    } else {
      badRequest(res, '配置保存失败');
    }
  } catch (error) {
    next(error);
  }
};
