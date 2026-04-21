import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import Sequelize from 'sequelize';
import logger from 'electron-log';
import Docs from '../models/Docs';
import Knowledge from '../models/Knowledge';
import { generateEmbedding } from '../services/embedding-service';
import {
  addDocumentEmbedding,
  updateDocumentEmbedding,
  deleteDocumentEmbedding,
} from '../services/vector-store-service';
import { success, successWithPage, notFound, serverError } from '../utils/response';

/**
 * 读取文件内容
 */
const readFileContent = async (filePath: string): Promise<string | null> => {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  } catch (error) {
    logger.error('读取文件内容失败:', error);
    return null;
  }
};

// 新增文档
export const createDocs = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { name, desc, size, type, path: filePath, knowledgeId, cloudUrl } = req.body;

    // 读取文件内容
    const content = await readFileContent(filePath);

    const result = await Docs.create({
      name,
      desc,
      size,
      type,
      userId,
      path: filePath,
      knowledgeId,
      cloudUrl: cloudUrl || null,
      content: content,
    });

    // 更新知识库中的文档数量
    await Knowledge.update({ counts: Sequelize.literal('counts + 1') }, { where: { id: knowledgeId } });

    // 生成嵌入向量并存储到对应知识库的 collection
    try {
      // 将名称、描述、内容拼接后向量化
      const textToEmbed = `${name}\n${desc || ''}\n${content || ''}`;
      const embedding = await generateEmbedding(textToEmbed);
      await addDocumentEmbedding(result.id, knowledgeId, embedding, {
        title: name,
        desc: desc || '',
      });
    } catch (embeddingError) {
      logger.error('生成嵌入向量失败:', embeddingError);
    }

    success(res, result.toJSON());
  } catch (error) {
    console.error('Error creating Docs:', error);
    serverError(res, 'Error creating Docs');
  }
};

// 查询文档详情
export const getDocsInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Docs.findByPk(Number(id));
    if (result) {
      success(res, result.toJSON());
    } else {
      notFound(res, 'Docs not found');
    }
  } catch (error) {
    console.error('Error getting Docs by ID:', error);
    serverError(res, 'Error getting Docs');
  }
};

// 查询文档列表
export const getDocsList = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  const { knowledgeId } = req.query;
  try {
    const where = {
      userId,
      knowledgeId: Number(knowledgeId),
    };

    const { count, rows } = await Docs.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    successWithPage(res, rows || [], count || 0);
  } catch (error) {
    console.error('Error getting DocsList by knowledgeId:', error);
    serverError(res, 'Error getting DocsList');
  }
};

// 更新文档
export const updateDocs = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const { name, desc, status, size, type, path: filePath } = req.body;
    const result = await Docs.findByPk(Number(id));
    if (result) {
      // 读取新的文件内容
      const content = filePath ? await readFileContent(filePath) : result.content;

      await result.update({ name, desc, status, size, type, content });

      const knowledgeId = result.knowledgeId;
      try {
        const textToEmbed = `${name}\n${desc || ''}\n${content || ''}`;
        const embedding = await generateEmbedding(textToEmbed);
        await updateDocumentEmbedding(Number(id), knowledgeId, embedding, {
          title: name,
          desc: desc || '',
        });
      } catch (embeddingError) {
        logger.error('更新嵌入向量失败:', embeddingError);
      }
      success(res, result.toJSON());
    } else {
      notFound(res, 'Docs not found');
    }
  } catch (error) {
    console.error('Error updating Docs:', error);
    serverError(res, 'Error updating Docs');
  }
};

// 下载文档 - 不使用统一响应格式，因为需要发送文件
export const downloadDocs = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Docs.findByPk(Number(id));
    if (result) {
      const doc = result.toJSON() as any;
      const filePath = doc.path;

      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ code: 404, message: '文件不存在' });
      }

      // 设置响应头，处理中文文件名
      const fileName = encodeURIComponent(doc.name);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
      res.setHeader('Content-Type', 'application/octet-stream');

      // 发送文件
      res.sendFile(path.resolve(filePath));
    } else {
      return res.status(404).json({ code: 404, message: '文档不存在' });
    }
  } catch (error) {
    logger.error('Error downloadDocs:', error);
    return res.status(500).json({ code: 500, message: '文件下载失败' });
  }
};

// 删除文档
export const removeDocs = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Docs.findByPk(Number(id));
    if (result) {
      const doc = result.toJSON() as any;
      const knowledgeId = doc.knowledgeId;

      // 删除物理文件
      if (doc.path && fs.existsSync(doc.path)) {
        try {
          fs.unlinkSync(doc.path);
          logger.info('已删除物理文件:', doc.path);
        } catch (fileError) {
          logger.error('删除物理文件失败:', fileError);
        }
      }

      await result.destroy();

      // 更新知识库中文档数量
      await Knowledge.update(
        { counts: Sequelize.literal('counts - 1') },
        {
          where: { id: Number(knowledgeId) },
        },
      );

      // 删除嵌入向量（需要指定知识库 ID）
      try {
        await deleteDocumentEmbedding(Number(id), knowledgeId);
      } catch (embeddingError) {
        logger.error('删除嵌入向量失败:', embeddingError);
      }

      success(res, result.toJSON(), '文档删除成功');
    } else {
      notFound(res, '文档不存在');
    }
  } catch (error) {
    logger.error('Error removeDocs:', error);
    serverError(res, '文档删除失败');
  }
};
