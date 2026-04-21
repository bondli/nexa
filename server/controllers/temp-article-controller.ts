import { Request, Response } from 'express';
import logger from 'electron-log';
import TempArticle from '../models/TempArticle';
import { success, successWithPage, badRequest, notFound, serverError } from '../utils/response';

// 查询临时文章列表
export const getTempArticles = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    const { count, rows } = await TempArticle.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset,
    });
    successWithPage(res, rows || [], count || 0);
  } catch (error) {
    logger.error('Error getting TempArticleList:', error);
    serverError(res, 'Error getting TempArticleList');
  }
};

// 删除临时文章（物理删除）
export const deleteTempArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await TempArticle.findByPk(Number(id));
    if (result) {
      await result.destroy();
      success(res, result.toJSON());
    } else {
      notFound(res, 'TempArticle not found');
    }
  } catch (error) {
    logger.error('Error deleting TempArticle:', error);
    serverError(res, 'Error deleting TempArticle');
  }
};

// 导入临时文章（外部渠道调用）
export const importTempArticle = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { title, url } = req.body;

    if (!url) {
      badRequest(res, 'URL is required');
      return;
    }

    const result = await TempArticle.create({
      title: title || '',
      url,
      userId,
    });

    success(res, result.toJSON());
  } catch (error) {
    logger.error('Error importing TempArticle:', error);
    serverError(res, 'Error importing TempArticle');
  }
};