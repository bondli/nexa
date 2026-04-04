import { Request, Response } from 'express';
import logger from 'electron-log';
import Cate from '../models/Cate';
import { success, successWithPage, badRequest, notFound, forbidden, serverError } from '../utils/response';

// 新增一个分类
export const createCate = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { icon, name, orders } = req.body;
    if (!name) {
      badRequest(res, 'Name is required');
      return;
    }
    const result = await Cate.create({
      icon,
      name,
      orders,
      counts: 0,
      userId,
    });
    success(res, result.toJSON());
  } catch (error) {
    logger.error('Error on creating cate:', error);
    serverError(res, 'Error creating cate');
  }
};

// 查询一个分类详情
export const getCateInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Cate.findByPk(Number(id));
    if (result) {
      success(res, result.toJSON());
    } else {
      notFound(res, 'Cate not found');
    }
  } catch (error) {
    logger.error('Error on getting cate by ID:', error);
    serverError(res, 'Error getting cate');
  }
};

// 查询所有分类
export const getCates = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { count, rows } = await Cate.findAndCountAll({
      where: { userId },
      order: [
        ['orders', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });
    successWithPage(res, rows || [], count || 0);
  } catch (error) {
    logger.error('Error on getting cates:', error);
    serverError(res, 'Error getting cates');
  }
};

// 更新分类
export const updateCate = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const { icon, name, orders } = req.body;
    // 针对虚拟分类，不能修改
    if (id === 'all' || id === 'today' || id === 'done' || id === 'trash') {
      badRequest(res, 'Virtual cate cannot be modified');
      return;
    }
    const result = await Cate.findByPk(Number(id));
    if (result) {
      await result.update({ icon, name, orders });
      success(res, result.toJSON());
    } else {
      notFound(res, 'Cate not found');
    }
  } catch (error) {
    logger.error('Error on updating cate:', error);
    serverError(res, 'Error updating cate');
  }
};

// 删除分类
export const deleteCate = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { id } = req.query;
    const result = await Cate.findByPk(Number(id));
    if (result) {
      // 判断这个分类是否属于自己的
      if (result.userId !== Number(userId)) {
        forbidden(res, '权限不足');
        return;
      }
      await result.destroy();
      success(res, null, 'cate deleted successfully');
    } else {
      notFound(res, 'Cate not found');
    }
  } catch (error) {
    logger.error('Error on deleting cate:', error);
    serverError(res, 'Error deleting cate');
  }
};
