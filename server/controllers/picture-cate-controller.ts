import { Request, Response } from 'express';
import logger from 'electron-log';
import { success, badRequest, notFound, serverError } from '../utils/response';
import PictureCate from '../models/PictureCate';

/**
 * 创建图片分类
 */
export const createCate = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { name, icon } = req.body;

    if (!name) {
      return badRequest(res, '分类名称不能为空');
    }

    // 获取当前用户的最大 orders 值
    const maxOrderCate = await PictureCate.findOne({
      where: { userId },
      order: [['orders', 'DESC']],
    });

    const newOrders = maxOrderCate ? (maxOrderCate.orders || 0) + 1 : 0;

    const cate = await PictureCate.create({
      name,
      icon: icon || null,
      orders: newOrders,
      counts: 0,
      userId,
    });

    success(res, cate);
  } catch (err) {
    logger.error('创建图片分类失败:', err);
    serverError(res, '创建分类失败');
  }
};

/**
 * 获取图片分类详情
 */
export const getCateInfo = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { id } = req.query;

    const cate = await PictureCate.findOne({
      where: { id: Number(id), userId },
    });

    if (!cate) {
      return notFound(res, '分类不存在');
    }

    success(res, cate);
  } catch (err) {
    logger.error('获取图片分类详情失败:', err);
    serverError(res, '获取分类详情失败');
  }
};

/**
 * 获取图片分类列表
 */
export const getCates = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const cates = await PictureCate.findAll({
      where: { userId },
      order: [['orders', 'ASC']],
    });

    success(res, cates);
  } catch (err) {
    logger.error('获取图片分类列表失败:', err);
    serverError(res, '获取分类列表失败');
  }
};

/**
 * 更新图片分类
 */
export const updateCate = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { id, name, icon, orders } = req.body;

    const cate = await PictureCate.findOne({
      where: { id: Number(id), userId },
    });

    if (!cate) {
      return notFound(res, '分类不存在');
    }

    await cate.update({
      name: name !== undefined ? name : cate.name,
      icon: icon !== undefined ? icon : cate.icon,
      orders: orders !== undefined ? orders : cate.orders,
    });

    success(res, cate);
  } catch (err) {
    logger.error('更新图片分类失败:', err);
    serverError(res, '更新分类失败');
  }
};

/**
 * 删除图片分类
 */
export const deleteCate = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { id } = req.query;

    const cate = await PictureCate.findOne({
      where: { id: Number(id), userId },
    });

    if (!cate) {
      return notFound(res, '分类不存在');
    }

    // 将该分类下的图片的 categoryId 设为 null
    const Picture = (await import('../models/Picture')).default;
    await Picture.update(
      { categoryId: null },
      { where: { categoryId: Number(id), userId } }
    );

    await cate.destroy();

    success(res, null);
  } catch (err) {
    logger.error('删除图片分类失败:', err);
    serverError(res, '删除分类失败');
  }
};
