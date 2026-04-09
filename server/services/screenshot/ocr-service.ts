import path from 'path';
import fs from 'fs';
import Tesseract from 'tesseract.js';
import logger from 'electron-log';
import { v4 as uuidv4 } from 'uuid';

/**
 * OCR 识别结果
 */
export interface OcrResult {
  text: string;
  confidence: number;
}

/**
 * 图片预处理
 * 压缩图片并返回处理后的 Buffer
 */
const preprocessImage = async (imagePath: string): Promise<Buffer> => {
  // 对于本地文件，直接读取
  // 实际生产中可能需要使用 sharp 或 canvas 进行压缩
  return fs.readFileSync(imagePath);
};

/**
 * 执行 OCR 文字识别
 * @param imageUrl 图片路径（本地路径或 URL）
 * @returns 识别结果
 */
export const recognizeText = async (imageUrl: string): Promise<OcrResult> => {
  try {
    logger.info('[OCR Service] Starting OCR recognition:', imageUrl);

    // 确定图片来源
    let imageSource: string = imageUrl;

    // 如果是本地路径，确保文件存在
    if (!imageUrl.startsWith('http')) {
      const fullPath = path.isAbsolute(imageUrl) ? imageUrl : path.join(process.cwd(), imageUrl);

      if (!fs.existsSync(fullPath)) {
        throw new Error(`图片文件不存在: ${fullPath}`);
      }

      imageSource = fullPath;
    }

    // 执行 OCR 识别
    const result = await Tesseract.recognize(imageSource, 'chi_sim+eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          logger.info(`[OCR Service] Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const text = result.data.text.trim();
    const confidence = result.data.confidence;

    logger.info(`[OCR Service] Recognition complete, confidence: ${confidence}%`);

    return {
      text,
      confidence,
    };
  } catch (error) {
    logger.error('[OCR Service] OCR recognition failed:', error);
    throw error;
  }
};

/**
 * 下载远程图片到本地临时文件
 */
export const downloadImage = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 保存到临时目录
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempPath = path.join(tempDir, `${uuidv4()}.png`);
    fs.writeFileSync(tempPath, buffer);

    return tempPath;
  } catch (error) {
    logger.error('[OCR Service] Failed to download image:', error);
    throw error;
  }
};

/**
 * 清理临时文件
 */
export const cleanupTempFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    logger.error('[OCR Service] Failed to cleanup temp file:', error);
  }
};

/**
 * 处理截图并识别文字
 * 支持本地路径和远程 URL
 */
export const processScreenshot = async (imageUrl: string): Promise<OcrResult> => {
  let tempFilePath: string | null = null;

  try {
    let imagePath = imageUrl;

    // 如果是远程 URL，先下载到本地
    if (imageUrl.startsWith('http')) {
      tempFilePath = await downloadImage(imageUrl);
      imagePath = tempFilePath;
    }

    // 执行 OCR
    const result = await recognizeText(imagePath);

    return result;
  } finally {
    // 清理临时文件
    if (tempFilePath) {
      cleanupTempFile(tempFilePath);
    }
  }
};
