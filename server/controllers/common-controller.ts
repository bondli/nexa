import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import logger from 'electron-log';
import { PORT, ALLOWED_IMAGE_EXTENSIONS } from '../config/constant';

/**
 * 验证图片文件扩展名是否在允许的类型中
 * @param filename 文件名
 * @returns 是否为允许的图片文件类型
 */
const isAllowedImageType = (filename: string): boolean => {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_IMAGE_EXTENSIONS.includes(ext);
};

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

// 配置图片存储位置
const imageStorage = multer.diskStorage({
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

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!isAllowedImageType(file.originalname)) {
      const allowedTypes = ALLOWED_IMAGE_EXTENSIONS.join('、');
      return cb(new Error(`只允许上传 ${allowedTypes} 图片文件`));
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

// 上传图片
export const uploadImage = (req: RequestWithFile, res: Response, next: NextFunction): void => {
  imageUpload(req as any, res as any, async (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        error: '图片上传失败',
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
          error: '没有上传图片',
        });
      }

      if (req.file.path) {
        // 获取文件名作为相对路径
        const fileName = path.basename(req.file.path);
        res.json({
          success: true,
          message: '图片上传成功',
          filePath: `http://localhost:${PORT}/files/${fileName}`, // 返回相对路径，有个硬编码
        });
      }
    } catch (error) {
      logger.error('图片上传处理错误:', error);
      res.status(500).json({
        success: false,
        error: '图片上传处理失败',
        details: error instanceof Error ? error.message : '未知错误',
      });
    }
  });
};
