import { Request, Response } from 'express';
import Sequelize from 'sequelize';
import logger from 'electron-log';
import { generateEmbedding } from '../services/embedding-service';
import { addDocumentEmbedding } from '../services/vector-store-service';
import Note from '../models/Note';
import Article from '../models/Article';
import Knowledge from '../models/Knowledge';
import Docs from '../models/Docs';
import { success, notFound, serverError } from '../utils/response';

// 将 笔记/文章 添加到知识库（进行向量化处理）
export const addToKnowledge = async (req: Request, res: Response) => {
  try {
    const { id, knowledgeId, type } = req.query;
    let result = null;
    if (type === 'note') {
      result = await Note.findByPk(Number(id));
    } else {
      result = await Article.findByPk(Number(id));
    }
    
    if (result) {
      // todo: 先判断是否已经向量化过了
      const embedding = await generateEmbedding(result.title + '\n' + result.desc);
      if (embedding) {
        await addDocumentEmbedding(Number(id), Number(knowledgeId), embedding, {
          title: result.title,
          desc: result.desc || '',
        });
        // 知识库文档量+1
        await Knowledge.update(
          { counts: Sequelize.literal('counts + 1') },
          {
            where: { id: Number(knowledgeId) },
          },
        );
        // 知识库对应的文档表新增一条记录
        await Docs.create({
          knowledgeId: Number(knowledgeId),
          noteId: Number(id),
          name: result.title,
          desc: result.desc,
          content: result.desc,
          path: '',
          userId: result.userId,
          type: type === 'article' ? 'article' : 'note',
          indexedAt: new Date(),
        });
        success(res, null, '加入知识库成功');
      } else {
        serverError(res, '生成向量失败');
      }
    } else {
      notFound(res, 'Note/Article not found');
    }
  } catch (error) {
    logger.error('Error on adding Note/Article to knowledge:', error);
    serverError(res, 'Error adding Note/Article to knowledge');
  }
};