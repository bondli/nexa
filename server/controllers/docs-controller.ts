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

/**
 * 获取应用文件存储目录
 * @returns 文件存储目录路径
 */
const getFilesDirectory = (): string => {
  // 检查是否在 Electron 环境中
  const isElectron = !!(process as any).resourcesPath;

  let filesDir: string;
  if (isElectron) {
    // Electron 环境：使用 resourcesPath
    filesDir = path.join((process as any).resourcesPath, 'files');
  } else {
    // Node.js 环境：使用项目根目录下的 files 文件夹
    filesDir = path.join(process.cwd(), 'files');
  }

  // 确保目录存在
  if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
    logger.info('创建文件存储目录:', filesDir);
  }

  return filesDir;
};

/**
 * 生成安全的文件名（处理中文乱码问题）
 * @param originalName 原始文件名
 * @returns 安全的文件名
 */
const generateSafeFilename = (originalName: string): string => {
  // 使用 Buffer 确保中文文件名正确编码
  const filename = Buffer.from(originalName, 'utf8').toString('utf8');
  const timestamp = Date.now();
  const ext = path.extname(filename);
  const nameWithoutExt = path.basename(filename, ext);

  // 生成带时间戳的文件名，避免重名冲突
  return `${nameWithoutExt}-${timestamp}${ext}`;
};

// 允许上传的文件扩展名配置
const ALLOWED_FILE_EXTENSIONS = ['.md', '.txt'];

/**
 * 验证文件扩展名是否在允许的类型中
 * @param filename 文件名
 * @returns 是否为允许的文件类型
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
      // 确保中文文件名正确编码
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
    fileSize: 5 * 1024 * 1024, // 限制文件大小为 5MB
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
      return res.status(400).json({
        success: false,
        error: '文件上传失败',
        details: err.message,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: '没有上传文件',
        });
      }

      if (req.file.path) {
        // 确保原始文件名正确编码存储到数据库
        const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

        res.json({
          success: true,
          message: '文档上传成功',
          data: {
            name: originalName,
            size: req.file.size,
            type: path.extname(originalName).toLowerCase(),
            path: req.file.path,
          }
        });
      }
    } catch (error) {
      logger.error('文档上传处理错误:', error);
      res.status(500).json({
        success: false,
        error: '文档上传处理失败',
        details: error instanceof Error ? error.message : '未知错误',
      });
    }
  });
};

// 新增文档
export const createDocs = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { name, desc, size, type, path, knowledgeId } = req.body;
    const result = await Docs.create({ name, desc, size, type, userId, path, knowledgeId });
    // 更新知识库中的文档数量
    await Knowledge.update({ counts: Sequelize.literal('counts + 1') }, { where: { id: knowledgeId } });
    // todo:读取文档内容，生成嵌入向量
    try {
      const embedding = await generateEmbedding(`${name}\n${desc}`);
      await addDocumentEmbedding(result.id, embedding, {
        title: name,
        desc: desc || '',
      });
    } catch (embeddingError) {
      logger.error('生成嵌入向量失败:', embeddingError);
      // 不影响笔记创建，只记录错误
    }
    res.status(200).json(result.toJSON());
  } catch (error) {
    console.error('Error creating Docs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 查询文档详情
export const getDocsInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Docs.findByPk(Number(id));
    if (result) {
      res.json(result.toJSON());
    } else {
      res.json({ error: 'Docs not found' });
    }
  } catch (error) {
    console.error('Error getting Docs by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 查询文档列表
export const getDocsList = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  const { knowledgeId, page = 1, pageSize = 10 } = req.query;
  try {
    const where = {
      userId,
      knowledgeId: Number(knowledgeId),
    };

    const { count, rows } = await Docs.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    res.json({
      count: count || 0,
      data: rows || [],
    });
  } catch (error) {
    console.error('Error getting DocsList by knowledgeId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 更新文档
export const updateDocs = async (req: Request, res: Response) => {
  try {
    const { id, op } = req.query;
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
      res.json(result.toJSON());
    } else {
      res.json({ error: 'Docs not found' });
    }
  } catch (error) {
    console.error('Error updating Docs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 下载文档
export const downloadDocs = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Docs.findByPk(Number(id));
    if (result) {
      const doc = result.toJSON() as any;
      const filePath = doc.path;

      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: '文件不存在',
        });
      }

      // 设置响应头，处理中文文件名
      const fileName = encodeURIComponent(doc.name);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
      res.setHeader('Content-Type', 'application/octet-stream');

      // 发送文件
      res.sendFile(path.resolve(filePath));
    } else {
      res.status(404).json({
        success: false,
        error: '文档不存在',
      });
    }
  } catch (error) {
    logger.error('Error downloadDocs:', error);
    res.status(500).json({
      success: false,
      error: '文件下载失败',
      details: error instanceof Error ? error.message : '未知错误',
    });
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
          // 继续删除数据库记录，即使物理文件删除失败
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

      res.json({
        success: true,
        message: '文档删除成功',
        data: result.toJSON(),
      });
    } else {
      res.status(404).json({
        success: false,
        error: '文档不存在',
      });
    }
  } catch (error) {
    logger.error('Error removeDocs:', error);
    res.status(500).json({
      success: false,
      error: '文档删除失败',
      details: error instanceof Error ? error.message : '未知错误',
    });
  }
};
