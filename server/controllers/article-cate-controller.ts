import { Request, Response } from 'express';
import logger from 'electron-log';
import ArticleCate from '../models/ArticleCate';
import { success, successWithPage, badRequest, notFound, serverError } from '../utils/response';

// 新增一个分类
export const createArticleCate = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { icon, name, orders } = req.body;
    if (!name) {
      badRequest(res, 'Name is required');
      return;
    }
    const result = await ArticleCate.create({
      icon,
      name,
      orders,
      counts: 0,
      userId,
    });
    success(res, result.toJSON());
  } catch (error) {
    logger.error('Error creating ArticleCate:', error);
    serverError(res, 'Error creating ArticleCate');
  }
};

// 查询所有分类
export const getArticleCates = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { count, rows } = await ArticleCate.findAndCountAll({
      where: { userId },
      order: [
        ['orders', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });
    successWithPage(res, rows || [], count || 0);
  } catch (error) {
    logger.error('Error getting ArticleCates:', error);
    serverError(res, 'Error getting ArticleCates');
  }
};

// 更新分类
export const updateArticleCate = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const { icon, name, orders } = req.body;
    const result = await ArticleCate.findByPk(Number(id));
    if (result) {
      await result.update({ icon, name, orders });
      success(res, result.toJSON());
    } else {
      notFound(res, 'ArticleCate not found');
    }
  } catch (error) {
    logger.error('Error updating ArticleCate:', error);
    serverError(res, 'Error updating ArticleCate');
  }
};

// 删除分类
export const deleteArticleCate = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await ArticleCate.findByPk(Number(id));
    if (result) {
      await result.destroy();
      success(res, null, 'ArticleCate deleted successfully');
    } else {
      notFound(res, 'ArticleCate not found');
    }
  } catch (error) {
    logger.error('Error deleting ArticleCate:', error);
    serverError(res, 'Error deleting ArticleCate');
  }
};