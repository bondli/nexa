import { Request, Response } from 'express';
import logger from 'electron-log';
import Knowledge from '../models/Knowledge';
import { success, notFound, badRequest, serverError } from '../utils/response';

/**
 * 获取所有知识库
 */
export const getKnowledges = async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const where: any = {};

    if (userId) where.userId = Number(userId);

    const knowledgeBases = await Knowledge.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    success(res, knowledgeBases);
  } catch (error) {
    logger.error('Error on get Knowledges:', error);
    serverError(res, 'Error getting Knowledges');
  }
};

/**
 * 获取单个知识库
 */
export const getKnowledgeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const knowledgeBase = await Knowledge.findByPk(Number(id));

    if (!knowledgeBase) {
      notFound(res, '知识库不存在');
      return;
    }

    success(res, knowledgeBase);
  } catch (error) {
    logger.error('Error on getKnowledgeById:', error);
    serverError(res, 'Error getting Knowledge');
  }
};

/**
 * 创建知识库
 */
export const createKnowledge = async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { name, description } = req.body;

    if (!name || !userId) {
      badRequest(res, '缺少必填字段');
      return;
    }

    const result = await Knowledge.create({
      name,
      description: description || '',
      userId,
      counts: 0,
    });

    success(res, result.toJSON());
  } catch (error) {
    logger.error('Error on creating Knowledge:', error);
    serverError(res, 'Error creating Knowledge');
  }
};

/**
 * 更新知识库
 */
export const updateKnowledge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const result = await Knowledge.findByPk(Number(id));
    if (!result) {
      notFound(res, '知识库不存在');
      return;
    }

    await result.update({
      ...(name && { name }),
      ...(description !== undefined && { description }),
    });

    await result.reload();

    success(res, result.toJSON());
  } catch (error) {
    logger.error('Error on update Knowledge:', error);
    serverError(res, 'Error updating Knowledge');
  }
};

/**
 * 删除知识库
 */
export const deleteKnowledge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await Knowledge.findByPk(Number(id));

    if (!result) {
      notFound(res, '知识库不存在');
      return;
    }

    // 删除知识库
    await result.destroy();

    success(res, null, '知识库删除成功');
  } catch (error) {
    logger.error('Error on delete Knowledge:', error);
    serverError(res, 'Error deleting Knowledge');
  }
};
