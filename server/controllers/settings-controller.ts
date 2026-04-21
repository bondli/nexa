import { Request, Response, NextFunction } from 'express';
import { setAPIKey, getAPIKey } from '../services/ai-service';
import { getCollectionCount } from '../services/vector-store-service';
import { success, badRequest } from '../utils/response';

/**
 * 获取当前设置
 */
export const getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const apiKey = getAPIKey();
    const vectorDBCount = await getCollectionCount();

    success(res, {
      apiKey: apiKey ? '******' : '',
      hasApiKey: !!apiKey,
      vectorDBCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新 AI API Key
 */
export const updateAPIKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      badRequest(res, '缺少 API Key');
      return;
    }

    setAPIKey(apiKey);

    success(res, null, 'API Key 更新成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取向量数据库状态
 */
export const getVectorDBStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const count = await getCollectionCount();

    success(res, {
      count,
      status: count > 0 ? 'active' : 'empty',
    });
  } catch (error) {
    next(error);
  }
};
