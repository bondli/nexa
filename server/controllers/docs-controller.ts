import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import Sequelize from 'sequelize';
import multer from 'multer';
import logger from 'electron-log';
import Docs from '../models/Docs';
import Knowledge from '../models/Knowledge';
import { generateEmbedding } from '../services/ai-service';
import {
  addDocumentEmbedding,
  updateDocumentEmbedding,
  deleteDocumentEmbedding,
} from '../services/vector-store-service';
import { success, successWithPage, notFound, badRequest, serverError } from '../utils/response';

/**
 * 获取应用文件存储目录
 */
const getFilesDirectory = (): string => {
  const isElectron = !!(process as any).resourcesPath;

  let filesDir: string;
  if (isElectron) {
    filesDir = path.join((process as any).resourcesPath, 'files');
  } else {
    filesDir = path.join(process.cwd(), 'files');
  }

  if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
    logger.info('创建文件存储目录:', filesDir);
  }

  return filesDir;
};

/**
 * 生成安全的文件名
 */
const generateSafeFilename = (originalName: string): string => {
  const filename = Buffer.from(originalName, 'utf8').toString('utf8');
  const timestamp = Date.now();
  const ext = path.extname(filename);
  const nameWithoutExt = path.basename(filename, ext);

  return `${nameWithoutExt}-${timestamp}${ext}`;
};

const ALLOWED_FILE_EXTENSIONS = ['.md', '.txt'];

/**
 * 验证文件扩展名
 */
const isAllowedFileType = (filename: string): boolean => {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_FILE_EXTENSIONS.includes(ext);
};

// 配置文件存储位置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const filesDir = getFilesDirectory();
      cb(null, filesDir);
    } catch (error) {
      logger.error('创建文件目录失败:', error);
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    try {
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const safeFilename = generateSafeFilename(originalName);
      cb(null, safeFilename);
    } catch (error) {
      logger.error('生成文件名失败:', error);
      cb(error as Error, '');
    }
  },
});

const upload = multer({
  storage,
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!isAllowedFileType(file.originalname)) {
      const allowedTypes = ALLOWED_FILE_EXTENSIONS.join('、');
      return cb(new Error(`只允许上传 ${allowedTypes} 文件`));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single('file');

interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

// 上传文档
export const uploadDocs = (req: RequestWithFile, res: Response): void => {
  const userId = Number(req.headers['x-user-id']) || 0;
  upload(req as any, res as any, async (err: any) => {
    if (err instanceof multer.MulterError) {
      return badRequest(res, `文件上传失败: ${err.message}`);
    } else if (err) {
      return badRequest(res, err.message);
    }

    try {
      if (!req.file) {
        return badRequest(res, '没有上传文件');
      }

      if (req.file.path) {
        const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

        success(
          res,
          {
            name: originalName,
            size: req.file.size,
            type: path.extname(originalName).toLowerCase(),
            path: req.file.path,
          },
          '文档上传成功',
        );
      }
    } catch (error) {
      logger.error('文档上传处理错误:', error);
      serverError(res, '文档上传处理失败');
    }
  });
};

// 新增文档
export const createDocs = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { name, desc, size, type, path: filePath, knowledgeId, cloudUrl } = req.body;
    const result = await Docs.create({
      name,
      desc,
      size,
      type,
      userId,
      path: filePath,
      knowledgeId,
      cloudUrl: cloudUrl || null,
    });
    // 更新知识库中的文档数量
    await Knowledge.update({ counts: Sequelize.literal('counts + 1') }, { where: { id: knowledgeId } });
    // 生成嵌入向量
    try {
      const embedding = await generateEmbedding(`${name}\n${desc}`);
      await addDocumentEmbedding(result.id, embedding, {
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
    const { name, desc, status, size, type } = req.body;
    const result = await Docs.findByPk(Number(id));
    if (result) {
      await result.update({ name, desc, status, size, type });

      try {
        const embedding = await generateEmbedding(`${name}\n${desc}`);
        await updateDocumentEmbedding(Number(id), embedding, {
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
          where: { id: Number(doc.knowledgeId) },
        },
      );

      // 删除嵌入向量
      try {
        await deleteDocumentEmbedding(Number(id));
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
