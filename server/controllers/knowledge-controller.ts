import { Request, Response } from 'express';
import logger from 'electron-log';
import Knowledge from '../models/Knowledge';
import Docs from '../models/Docs';
import { success, notFound, badRequest, serverError } from '../utils/response';
import { createCollection, deleteCollection } from '../services/vector-store-service';

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

    if (!name) {
      badRequest(res, '请输入知识库名称');
      return;
    }

    const result = await Knowledge.create({
      name,
      description: description || '',
      userId,
      counts: 0,
    });

    // 创建知识库后，在 Qdrant 中创建对应的 collection
    try {
      await createCollection(result.id);
    } catch (collectionError) {
      logger.error('创建 Qdrant Collection 失败:', collectionError);
    }

    success(res, result.toJSON());
  } catch (error: any) {
    logger.error('Error on creating Knowledge:', error.message || error);
    serverError(res, 'Error creating Knowledge: ' + (error.message || ''));
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
    const { id } = req.query;
    const knowledgeId = Number(id);
    const result = await Knowledge.findByPk(knowledgeId);

    if (!result) {
      notFound(res, '知识库不存在');
      return;
    }

    // 先删除该知识库下的所有文档（MySQL）
    await Docs.destroy({
      where: { knowledgeId },
    });

    // 删除知识库
    await result.destroy();

    // 删除 Qdrant 中对应的 collection
    try {
      await deleteCollection(knowledgeId);
    } catch (collectionError) {
      logger.error('删除 Qdrant Collection 失败:', collectionError);
    }

    success(res, null, '知识库删除成功');
  } catch (error) {
    logger.error('Error on delete Knowledge:', error);
    serverError(res, 'Error deleting Knowledge');
  }
};
