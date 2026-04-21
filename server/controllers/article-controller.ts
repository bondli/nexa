import { Request, Response } from 'express';
import Sequelize, { Op } from 'sequelize';
import logger from 'electron-log';
import Article from '../models/Article';
import ArticleCate from '../models/ArticleCate';
import TempArticle from '../models/TempArticle';
import { success, successWithPage, badRequest, notFound, serverError } from '../utils/response';

// 新增一篇文章
export const createArticle = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { title, desc, url, cateId } = req.body;

    if (!title || !url || !cateId) {
      badRequest(res, 'Title, url and cateId are required');
      return;
    }

    // 使用事务确保数据一致性
    const result = await Article.sequelize!.transaction(async (t) => {
      // 创建Article记录
      const articleResult = await Article.create(
        {
          title,
          desc,
          url,
          cateId: Number(cateId),
          userId,
          status: 'normal',
        },
        { transaction: t },
      );

      // 更新分类计数
      await ArticleCate.update(
        { counts: Sequelize.literal('counts + 1') },
        {
          where: { id: Number(cateId) },
          transaction: t,
        },
      );

      return articleResult;
    });

    success(res, result.toJSON());
  } catch (error) {
    logger.error('Error creating Article:', error);
    serverError(res, 'Error creating Article');
  }
};

// 查询一篇文章详情
export const getArticleInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Article.findByPk(Number(id));
    if (result) {
      success(res, result.toJSON());
    } else {
      notFound(res, 'Article not found');
    }
  } catch (error) {
    logger.error('Error getting Article by ID:', error);
    serverError(res, 'Error getting Article');
  }
};

// 查询文章列表
export const getArticles = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { cateId, page = 1, pageSize = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let where: any = {
      userId,
    };

    // 全部文章
    if (cateId === 'all') {
      where.status = 'normal';
    }
    // 回收站
    else if (cateId === 'trash') {
      where.status = 'deleted';
    }
    // 临时文章 - 特殊处理，返回 TempArticle 表数据
    else if (cateId === 'temp') {
      const { count, rows } = await TempArticle.findAndCountAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: Number(pageSize),
        offset,
      });
      // 转换格式以保持一致
      const transformedRows = (rows || []).map((item) => ({
        id: item.id,
        title: item.title,
        url: item.url,
        createdAt: item.createdAt,
      }));
      successWithPage(res, transformedRows, count || 0);
      return;
    }
    // 正常查分类下的
    else {
      where.status = 'normal';
      where.cateId = Number(cateId);
    }

    const { count, rows } = await Article.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset,
    });
    successWithPage(res, rows || [], count || 0);
  } catch (error) {
    logger.error('Error getting ArticleList by cateId:', error);
    serverError(res, 'Error getting ArticleList');
  }
};

// 更新一篇文章
export const updateArticle = async (req: Request, res: Response) => {
  try {
    const { id, title, desc, url, cateId, status, opType } = req.body;
    const result = await Article.findByPk(Number(id));
    if (result) {
      await result.update({ title, desc, url, cateId: Number(cateId), status });

      // 针对不同的操作类型，需要更新分类中的数量字段
      if (opType === 'delete' || opType === 'restore') {
        const operatorArticle = result.toJSON();
        let updateNumCommand = '';
        if (opType === 'restore') {
          updateNumCommand = 'counts + 1';
        } else if (opType === 'delete') {
          updateNumCommand = 'counts - 1';
        }
        const cateResult = await ArticleCate.findByPk(Number(operatorArticle.cateId));
        cateResult &&
          cateResult.update(
            {
              counts: Sequelize.literal(updateNumCommand),
            },
            {
              where: {
                id: operatorArticle.cateId,
              },
            },
          );
      }
      success(res, result.toJSON());
    } else {
      notFound(res, 'Article not found');
    }
  } catch (error) {
    logger.error('Error updating Article:', error);
    serverError(res, 'Error updating Article');
  }
};

// 删除文章到回收站（软删除）
export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Article.findByPk(Number(id));
    if (result) {
      await result.update({ status: 'deleted' });

      // 更新分类计数
      const operatorArticle = result.toJSON();
      const cateResult = await ArticleCate.findByPk(Number(operatorArticle.cateId));
      cateResult &&
        cateResult.update(
          {
            counts: Sequelize.literal('counts - 1'),
          },
          {
            where: {
              id: operatorArticle.cateId,
            },
          },
        );

      success(res, result.toJSON());
    } else {
      notFound(res, 'Article not found');
    }
  } catch (error) {
    logger.error('Error deleting Article:', error);
    serverError(res, 'Error deleting Article');
  }
};

// 从回收站恢复文章
export const recoverArticle = async (req: Request, res: Response) => {
  try {
    const { id, cateId } = req.query;
    const result = await Article.findByPk(Number(id));
    if (result) {
      await result.update({ status: 'normal', cateId: Number(cateId) });

      // 更新分类计数
      const cateResult = await ArticleCate.findByPk(Number(cateId));
      cateResult &&
        cateResult.update(
          {
            counts: Sequelize.literal('counts + 1'),
          },
          {
            where: {
              id: Number(cateId),
            },
          },
        );

      success(res, result.toJSON());
    } else {
      notFound(res, 'Article not found');
    }
  } catch (error) {
    logger.error('Error recovering Article:', error);
    serverError(res, 'Error recovering Article');
  }
};

// 彻底删除文章（从回收站）
export const removeArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Article.findByPk(Number(id));
    if (result) {
      await result.destroy();
      success(res, result.toJSON());
    } else {
      notFound(res, 'Article not found');
    }
  } catch (error) {
    logger.error('Error removing Article:', error);
    serverError(res, 'Error removing Article');
  }
};

// 搜索文章列表
export const searchArticles = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { cateId, searchKey, page = 1, pageSize = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let where: any = {
      userId,
    };

    // 全部文章
    if (cateId === 'all') {
      where.status = 'normal';
    }
    // 回收站
    else if (cateId === 'trash') {
      where.status = 'deleted';
    }
    // 正常查分类下的
    else {
      where.status = 'normal';
      where.cateId = Number(cateId);
    }

    // 搜索标题
    if (searchKey) {
      where = {
        ...where,
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${searchKey}%`,
            },
          },
        ],
      };
    }

    const { count, rows } = await Article.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset,
    });
    successWithPage(res, rows || [], count || 0);
  } catch (error) {
    logger.error('Error searching ArticleList:', error);
    serverError(res, 'Error searching Articles');
  }
};

// 获取虚拟分类下的文章数量
export const getArticleCounts = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    // 使用一次查询获取按状态分组的统计数据
    const statusCounts = await Article.findAll({
      attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      where: {
        userId,
        status: {
          [Op.in]: ['normal', 'deleted'],
        },
      },
      group: ['status'],
      raw: true,
    });

    // 将结果转换为对象格式，便于访问
    const statusCountMap = statusCounts.reduce((acc: any, item: any) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});

    // 临时文章数量
    const tempCount = await TempArticle.count({
      where: { userId },
    });

    const countData = {
      all: statusCountMap.normal || 0,
      temp: tempCount || 0,
      deleted: statusCountMap.deleted || 0,
    };
    success(res, countData);
  } catch (error) {
    logger.error('Error getting ArticleCounts:', error);
    serverError(res, 'Error getting ArticleCounts');
  }
};
