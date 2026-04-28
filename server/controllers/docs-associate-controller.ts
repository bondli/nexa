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
      // 检查是否已经添加到该知识库
      const existingDoc = await Docs.findOne({
        where: {
          knowledgeId: Number(knowledgeId),
          ...(type === 'note' ? { noteId: Number(id) } : {}),
          ...(type === 'article' ? { type: 'article', name: result.title } : {}),
        },
      });

      if (existingDoc) {
        return success(res, null, '该文档已在知识库中，无需重复添加');
      }

      const desc = '';
      const content = result.desc || '';
      const textToEmbed = `${result.title}\n${desc}\n${content}`;
      const embedding = await generateEmbedding(textToEmbed);
      if (embedding) {
        await addDocumentEmbedding(Number(id), Number(knowledgeId), embedding, {
          title: result.title,
          desc,
          content, // 存储 content 以便 RAG 检索时使用
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
          noteId: type === 'note' ? Number(id) : null, // 只有 note 类型才设置 noteId
          name: result.title,
          desc: '',
          size: 0,
          type: type === 'article' ? 'article' : 'note',
          userId: result.userId,
          content: result.desc,
          path: null,
          cloudUrl: null,
          indexedAt: new Date(),
        });
        success(res, null, '加入知识库成功');
      } else {
        serverError(res, '生成向量失败');
      }
    } else {
      notFound(res, 'Note/Article not found');
    }
  } catch (error: any) {
    logger.error('Error on adding Note/Article to knowledge:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      original: error.original,
    });
    serverError(res, 'Error adding Note/Article to knowledge');
  }
};
