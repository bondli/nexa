import { Request, Response, NextFunction } from 'express';
import { setAPIKey, getAPIKey } from '../services/ai-service';
import { getCollectionCount, clearCollection } from '../services/vector-store-service';

/**
 * 获取当前设置
 */
export const getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const apiKey = getAPIKey();
    const vectorDBCount = await getCollectionCount();

    res.json({
      success: true,
      data: {
        apiKey: apiKey ? '******' : '', // 不返回完整密钥
        hasApiKey: !!apiKey,
        vectorDBCount,
      },
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
      res.status(400).json({ success: false, message: '缺少 API Key' });
      return;
    }

    setAPIKey(apiKey);

    res.json({ success: true, message: 'API Key 更新成功' });
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

    res.json({
      success: true,
      data: {
        count,
        status: count > 0 ? 'active' : 'empty',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 清空向量数据库
 */
export const clearVectorDB = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await clearCollection();

    res.json({ success: true, message: '向量数据库已清空' });
  } catch (error) {
    next(error);
  }
};
