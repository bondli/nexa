import { Request, Response } from 'express';
import Sequelize, { Op } from 'sequelize';
import logger from 'electron-log';
import { generateEmbedding } from '../services/ai-service';
import {
  addDocumentEmbedding,
  updateDocumentEmbedding,
  deleteDocumentEmbedding,
} from '../services/vector-store-service';
import Note from '../models/Note';
import Cate from '../models/Cate';
import Knowledge from '../models/Knowledge';
import Docs from '../models/Docs';

// 新增一条代办Note
export const createNote = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { title, desc, cateId, deadline, priority } = req.body;

    // 使用事务确保数据一致性并提升性能
    const result = await Note.sequelize!.transaction(async (t) => {
      // 创建Note记录
      const noteResult = await Note.create({ title, desc, cateId, deadline, priority, userId }, { transaction: t });

      // 更新分类计数
      await Cate.update(
        { counts: Sequelize.literal('counts + 1') },
        {
          where: { id: Number(cateId) },
          transaction: t,
        },
      );

      return noteResult;
    });

    res.status(200).json(result.toJSON());
  } catch (error) {
    logger.error('Error creating Note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 查询一条代办详情
export const getNoteInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Note.findByPk(Number(id));
    if (result) {
      res.json(result.toJSON());
    } else {
      res.json({ error: 'Note not found' });
    }
  } catch (error) {
    logger.error('Error getting Note by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 查询代办列表
export const getNotes = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { cateId } = req.query;
    const where = {
      userId,
    };
    // 所有代办
    if (cateId === 'all') {
      where['status'] = 'undo';
    }
    // 所有已完成
    else if (cateId === 'done') {
      where['status'] = 'done';
    }
    // 今日到期
    else if (cateId === 'today') {
      const today = new Date();
      const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      where['deadline'] = {
        [Op.gte]: todayAtMidnight,
        [Op.lte]: endOfToday,
      };
      where['status'] = 'undo';
    }
    // 已删除
    else if (cateId === 'trash') {
      where['status'] = 'deleted';
    }
    // 正常查笔记本下的
    else {
      where['status'] = 'undo';
      where['cateId'] = cateId;
    }
    const { count, rows } = await Note.findAndCountAll({
      where,
      order: [['updatedAt', 'DESC']],
    });
    res.json({
      count: count || 0,
      data: rows || [],
    });
  } catch (error) {
    logger.error('Error getting NoteList by cateId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 更新一条代办
export const updateNote = async (req: Request, res: Response) => {
  try {
    const { id, title, desc, cateId, status, priority, deadline, opType } = req.body;
    const result = await Note.findByPk(Number(id));
    if (result) {
      const op = opType || 'update';
      await result.update({ title, desc, cateId, status, priority, deadline });
      // 针对不同的操作类型，需要更新笔记本中的数量字段
      if (op === 'done' || op === 'delete' || op === 'restore' || op === 'undo') {
        const operatorNote = result.toJSON();
        let updateNumCommand = '';
        if (op === 'restore' || op === 'undo') {
          updateNumCommand = 'counts + 1';
        } else if (op === 'done' || op === 'delete') {
          updateNumCommand = 'counts - 1';
        }
        const CateResult = await Cate.findByPk(Number(operatorNote.cateId));
        CateResult &&
          CateResult.update(
            {
              counts: Sequelize.literal(updateNumCommand),
            },
            {
              where: {
                id: operatorNote.cateId,
              },
            },
          );
      }
      // todo:如果内容或标题有变化，而且之前已经加入到知识库中，则需要更新嵌入向量
      // if (title || desc) {
      //   try {
      //     const embedding = await generateEmbedding(`${result.title}\n${result.desc}`);
      //     await updateDocumentEmbedding(result.id, embedding, {
      //       title: result.title,
      //       desc: result.desc || '',
      //     });
      //   } catch (embeddingError) {
      //     logger.error('更新嵌入向量失败:', embeddingError);
      //   }
      // }
      res.json(result.toJSON());
    } else {
      res.json({ error: 'Note not found' });
    }
  } catch (error) {
    logger.error('Error updating Note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 移动一个笔记
export const moveNote = async (req: Request, res: Response) => {
  try {
    const { id, status } = req.query;
    const { oldCateId, newCateId } = req.body;
    const result = await Note.findByPk(Number(id));
    if (result) {
      await result.update({ cateId: Number(newCateId) });
      if (status === 'undo') {
        // 只针对当前的代办还没有完结的情况下
        // 给新的分类中增加代办记录数，给老的分类减少代办记录数
        const newCateResult = await Cate.findByPk(Number(newCateId));
        newCateResult &&
          newCateResult.update(
            {
              counts: Sequelize.literal('counts + 1'),
            },
            {
              where: {
                id: Number(newCateId),
              },
            },
          );
        const oldCateResult = await Cate.findByPk(Number(oldCateId));
        oldCateResult &&
          oldCateResult.update(
            {
              counts: Sequelize.literal('counts - 1'),
            },
            {
              where: {
                id: Number(oldCateId),
              },
            },
          );
      }
      res.json(result.toJSON());
    } else {
      res.json({ error: 'Note not found' });
    }
  } catch (error) {
    logger.error('Error moving Note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 获取虚拟分类下的代办数量
export const getNoteCounts = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    // 优化：使用一次查询获取按状态分组的统计数据
    const statusCounts = await Note.findAll({
      attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      where: {
        userId,
        status: {
          [Op.in]: ['undo', 'done', 'deleted'],
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

    // 单独查询今日到期的代办数量
    const today = new Date();
    const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    const todayDeadline = await Note.count({
      where: {
        userId,
        status: {
          [Op.eq]: 'undo',
        },
        deadline: {
          [Op.gte]: todayAtMidnight,
          [Op.lte]: endOfToday,
        },
      },
    });
    res.json({
      all: statusCountMap.undo || 0,
      today: todayDeadline || 0,
      done: statusCountMap.done || 0,
      deleted: statusCountMap.deleted || 0,
    });
  } catch (error) {
    logger.error('Error getting NoteCounts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 搜素代办列表
export const searchNotes = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { cateId } = req.query;
    const { searchKey } = req.body;

    let status: string = 'undo';
    let deadline: any = null;

    // 所有笔记
    if (cateId === 'all') {
      status = 'undo';
    }
    // 所有已完成
    else if (cateId === 'done') {
      status = 'done';
    }
    // 今日到期
    else if (cateId === 'today') {
      const today = new Date();
      const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      deadline = {
        [Op.gte]: todayAtMidnight,
        [Op.lte]: endOfToday,
      };
    }
    // 已删除
    else if (cateId === 'trash') {
      status = 'deleted';
    }

    const commonCondition: any = [];
    commonCondition.push({
      userId,
    });
    commonCondition.push({
      status,
    });

    if (deadline) {
      commonCondition.push({
        deadline,
      });
    }

    let where: any = {
      [Op.and]: commonCondition,
    };

    if (searchKey) {
      where = {
        [Op.and]: commonCondition,
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${searchKey}%`,
            },
          },
          {
            desc: {
              [Op.like]: `%${searchKey}%`,
            },
          },
        ],
      };
    }

    const { count, rows } = await Note.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    res.json({
      count: count || 0,
      data: rows || [],
    });
  } catch (error) {
    logger.error('Error search NoteList by cateId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 彻底删除一个笔记
export const removeNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Note.findByPk(Number(id));
    if (result) {
      await result.destroy();
      // 删除嵌入向量
      try {
        // todo:先查询该笔记有没有被向量化到知识库中

        await deleteDocumentEmbedding(Number(id));
      } catch (embeddingError) {
        logger.error('删除嵌入向量失败:', embeddingError);
      }

      res.json(result.toJSON());
    } else {
      res.json({ error: 'Note not found' });
    }
  } catch (error) {
    logger.error('Error deletedFromTrash:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 将笔记添加到知识库（进行向量化处理）
export const addNoteToKnowledge = async (req: Request, res: Response) => {
  try {
    const { id, knowledgeId } = req.query;
    const result = await Note.findByPk(Number(id));
    if (result) {
      // todo: 先判断是否已经向量化过了
      const embedding = await generateEmbedding(result.title + '\n' + result.desc);
      if (embedding) {
        await addDocumentEmbedding(Number(id), embedding, {
          title: result.title,
          desc: result.desc || '',
        });
        // 知识库文档量+1
        await Knowledge.update({ counts: Sequelize.literal('counts + 1') }, { 
          where: { id: Number(knowledgeId) } 
        });
        // 知识库对应的文档表新增一条记录
        await Docs.create({
          knowledgeId: Number(knowledgeId),
          noteId: Number(id),
          name: result.title,
          desc: result.desc,
          path: '',
          userId: result.userId,
          type: 'note',
          indexedAt: new Date(),
        });
        res.json({ message: 'ok' });
      } else {
        res.status(500).json({ error: '生成向量失败' });
      }
    } else {
      res.json({ error: 'Note not found' });
    }
  } catch (error) {
    logger.error('Error on adding Note to knowledge:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
