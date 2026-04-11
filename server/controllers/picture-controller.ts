import { Request, Response } from 'express';
import { Op } from 'sequelize';
import logger from 'electron-log';
import { success, badRequest, notFound, serverError } from '../utils/response';
import Picture from '../models/Picture';
import PictureCate from '../models/PictureCate';

/**
 * 创建图片记录
 */
export const createPicture = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { path, name, description, categoryId } = req.body;

    if (!path || !name) {
      return badRequest(res, '图片路径和名称不能为空');
    }

    const picture = await Picture.create({
      path,
      name,
      description: description || null,
      categoryId: categoryId || null,
      userId,
      status: 'normal',
    });

    // 如果有关联分类，更新分类计数
    if (picture.categoryId) {
      await PictureCate.increment('counts', {
        where: { id: picture.categoryId, userId },
      });
    }

    success(res, picture);
  } catch (err) {
    logger.error('创建图片记录失败:', err);
    serverError(res, '创建图片记录失败');
  }
};

/**
 * 获取图片详情
 */
export const getPictureInfo = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { id } = req.query;

    const picture = await Picture.findOne({
      where: { id: Number(id), userId, status: 'normal' },
    });

    if (!picture) {
      return notFound(res, '图片不存在');
    }

    success(res, picture);
  } catch (err) {
    logger.error('获取图片详情失败:', err);
    serverError(res, '获取图片详情失败');
  }
};

/**
 * 获取图片列表（只返回正常状态）
 */
export const getPictures = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { categoryId, page = 1, pageSize = 20 } = req.query;

    const where: any = { userId, status: 'normal' };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const offset = (Number(page) - 1) * Number(pageSize);

    const { count, rows } = await Picture.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset,
    });

    success(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (err) {
    logger.error('获取图片列表失败:', err);
    serverError(res, '获取图片列表失败');
  }
};

/**
 * 获取回收站图片列表
 */
export const getTrashPictures = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    const { count, rows } = await Picture.findAndCountAll({
      where: { userId, status: 'deleted' },
      order: [['updatedAt', 'DESC']],
      limit: Number(pageSize),
      offset,
    });

    success(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (err) {
    logger.error('获取回收站图片列表失败:', err);
    serverError(res, '获取回收站图片列表失败');
  }
};

/**
 * 获取图片统计数量（全部/回收站）
 */
export const getPictureCounts = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const [totalCount, trashCount] = await Promise.all([
      Picture.count({ where: { userId, status: 'normal' } }),
      Picture.count({ where: { userId, status: 'deleted' } }),
    ]);

    success(res, {
      all: totalCount,
      trash: trashCount,
    });
  } catch (err) {
    logger.error('获取图片统计失败:', err);
    serverError(res, '获取图片统计失败');
  }
};

/**
 * 搜索图片（按名称或描述模糊搜索）
 */
export const searchPictures = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { keyword, page = 1, pageSize = 20 } = req.query;

    if (!keyword) {
      return badRequest(res, '搜索关键词不能为空');
    }

    const offset = (Number(page) - 1) * Number(pageSize);

    const { count, rows } = await Picture.findAndCountAll({
      where: {
        userId,
        status: 'normal',
        [Op.or]: [
          { name: { [Op.like]: `%${keyword}%` } },
          { description: { [Op.like]: `%${keyword}%` } },
        ],
      },
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset,
    });

    success(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (err) {
    logger.error('搜索图片失败:', err);
    serverError(res, '搜索图片失败');
  }
};

/**
 * 更新图片信息
 */
export const updatePicture = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { id, name, description, categoryId } = req.body;

    const picture = await Picture.findOne({
      where: { id: Number(id), userId, status: 'normal' },
    });

    if (!picture) {
      return notFound(res, '图片不存在');
    }

    const oldCategoryId = picture.categoryId;

    await picture.update({
      name: name !== undefined ? name : picture.name,
      description: description !== undefined ? description : picture.description,
      categoryId: categoryId !== undefined ? categoryId : picture.categoryId,
    });

    // 如果分类发生变化，更新原分类和新分类的计数
    if (categoryId !== undefined && oldCategoryId !== categoryId) {
      // 原分类计数减 1
      if (oldCategoryId) {
        await PictureCate.decrement('counts', {
          where: { id: oldCategoryId, userId },
        });
      }
      // 新分类计数加 1
      if (categoryId) {
        await PictureCate.increment('counts', {
          where: { id: categoryId, userId },
        });
      }
    }

    success(res, picture);
  } catch (err) {
    logger.error('更新图片信息失败:', err);
    serverError(res, '更新图片信息失败');
  }
};

/**
 * 软删除图片（移入回收站）
 */
export const deletePicture = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { id } = req.query;

    const picture = await Picture.findOne({
      where: { id: Number(id), userId, status: 'normal' },
    });

    if (!picture) {
      return notFound(res, '图片不存在');
    }

    const categoryId = picture.categoryId;

    await picture.update({ status: 'deleted' });

    // 如果有关联分类，更新分类计数
    if (categoryId) {
      await PictureCate.decrement('counts', {
        where: { id: categoryId, userId },
      });
    }

    success(res, null);
  } catch (err) {
    logger.error('删除图片失败:', err);
    serverError(res, '删除图片失败');
  }
};

/**
 * 从回收站恢复图片
 */
export const restorePicture = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { id } = req.query;

    const picture = await Picture.findOne({
      where: { id: Number(id), userId, status: 'deleted' },
    });

    if (!picture) {
      return notFound(res, '图片不存在');
    }

    await picture.update({ status: 'normal' });

    // 如果有关联分类，恢复分类计数
    if (picture.categoryId) {
      await PictureCate.increment('counts', {
        where: { id: picture.categoryId, userId },
      });
    }

    success(res, null);
  } catch (err) {
    logger.error('恢复图片失败:', err);
    serverError(res, '恢复图片失败');
  }
};

/**
 * 彻底删除图片（从回收站永久删除）
 */
export const forceDeletePicture = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { id } = req.query;

    const picture = await Picture.findOne({
      where: { id: Number(id), userId, status: 'deleted' },
    });

    if (!picture) {
      return notFound(res, '图片不存在');
    }

    await picture.destroy();

    success(res, null);
  } catch (err) {
    logger.error('彻底删除图片失败:', err);
    serverError(res, '彻底删除图片失败');
  }
};
