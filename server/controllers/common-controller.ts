import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import logger from 'electron-log';
import { PORT, ALLOWED_IMAGE_EXTENSIONS } from '../config/constant';
import { success, badRequest, serverError } from '../utils/response';
import { processScreenshot } from '../services/screenshot/ocr-service';
import { optimizeText } from '../services/ai-service';

/**
 * 验证图片文件扩展名是否在允许的类型中
 */
const isAllowedImageType = (filename: string): boolean => {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_IMAGE_EXTENSIONS.includes(ext);
};

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
    fileSize: 5 * 1024 * 1024,
  },
}).single('file');

interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

// 上传图片
export const uploadImage = (req: RequestWithFile, res: Response, next: NextFunction): void => {
  imageUpload(req as any, res as any, async (err: any) => {
    if (err instanceof multer.MulterError) {
      return badRequest(res, `图片上传失败: ${err.message}`);
    } else if (err) {
      return badRequest(res, err.message);
    }

    try {
      if (!req.file) {
        return badRequest(res, '没有上传图片');
      }

      if (req.file.path) {
        const fileName = path.basename(req.file.path);
        const url = `http://localhost:${PORT}/files/${fileName}`;
        success(res, { url, filePath: url }, '图片上传成功');
      }
    } catch (error) {
      logger.error('图片上传处理错误:', error);
      serverError(res, '图片上传处理失败');
    }
  });
};

/**
 * 图片 OCR 识别接口
 * POST /api/common/ocr
 * Body: { imageUrl: string }
 */
export const imageOcr = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      badRequest(res, '缺少 imageUrl 参数');
      return;
    }

    logger.info('[Common Controller] Processing OCR:', imageUrl);

    // 1. OCR 识别
    const ocrResult = await processScreenshot(imageUrl);

    // 2. AI 优化
    let optimizedText = ocrResult.text;
    try {
      optimizedText = await optimizeText(ocrResult.text);
    } catch (aiError) {
      logger.warn('[Common Controller] AI optimization failed, using raw OCR result:', aiError);
    }

    logger.info('[Common Controller] OCR processed successfully');

    success(
      res,
      {
        text: optimizedText,
        rawText: ocrResult.text,
        confidence: ocrResult.confidence,
      },
      'OCR 识别成功',
    );
  } catch (error: any) {
    logger.error('[Common Controller] OCR Error:', error);
    serverError(res, error.message || 'OCR 识别失败');
  }
};
