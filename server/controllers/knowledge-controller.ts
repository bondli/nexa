import { Request, Response } from 'express';
import logger from 'electron-log';
import Knowledge from '../models/Knowledge';

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

    res.json({ success: true, data: knowledgeBases });
  } catch (error) {
    logger.error('Error on get Knowledges:', error);
    res.status(500).json({ error: 'Internal server error' });
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
      res.status(404).json({ success: false, message: '知识库不存在' });
      return;
    }

    res.json({ success: true, data: knowledgeBase });
  } catch (error) {
    logger.error('Error on getKnowledgeById:', error);
    res.status(500).json({ error: 'Internal server error' });
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
      res.status(400).json({ success: false, message: '缺少必填字段' });
      return;
    }

    const result = await Knowledge.create({
      name,
      description: description || '',
      userId,
      counts: 0,
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    logger.error('Error on creating Knowledge:', error);
    res.status(500).json({ error: 'Internal server error' });
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
      res.status(404).json({ success: false, message: '知识库不存在' });
      return;
    }

    await result.update({
      ...(name && { name }),
      ...(description !== undefined && { description }),
    });

    await result.reload();

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error on update Knowledge:', error);
    res.status(500).json({ error: 'Internal server error' });
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
      res.status(404).json({ success: false, message: '知识库不存在' });
      return;
    }

    // 删除知识库
    await result.destroy();

    res.json({ success: true, message: '知识库删除成功' });
  } catch (error) {
    logger.error('Error on delete Knowledge:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
