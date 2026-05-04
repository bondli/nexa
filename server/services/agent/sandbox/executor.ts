import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import logger from 'electron-log';
import os from 'os';

/**
 * 沙箱工具执行结果
 */
export interface SandboxResult {
  success: boolean;
  result?: string;
  error?: string;
}

/**
 * 沙箱工具参数
 */
export interface SandboxToolParams {
  tool: string;
  params: Record<string, unknown>;
}

/**
 * 允许的文件扩展名
 */
const ALLOWED_EXTENSIONS = [
  '.txt', '.md', '.json', '.csv', '.xml', '.html', '.css', '.js', '.ts',
  '.xlsx', '.xls', '.docx', '.pdf',
];

/**
 * 单次最大读取字节数 (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Excel 最大行数
 */
const MAX_EXCEL_ROWS = 1000;

/**
 * 沙箱工具执行器
 * 用于在独立环境中执行系统级工具，保证安全隔离
 */
class SandboxExecutor {
  private static instance: SandboxExecutor;

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): SandboxExecutor {
    if (!SandboxExecutor.instance) {
      SandboxExecutor.instance = new SandboxExecutor();
    }
    return SandboxExecutor.instance;
  }

  /**
   * 执行沙箱工具
   */
  async execute(tool: string, params: Record<string, unknown>): Promise<SandboxResult> {
    logger.info(`[SandboxExecutor] Executing tool: ${tool}`, params);

    try {
      switch (tool) {
        case 'list_directory':
          return this.listDirectory(params.path as string);

        case 'read_file':
          return this.readFile(params.path as string);

        case 'read_document':
          return this.readDocument(params.path as string);

        default:
          return { success: false, error: `Unknown tool: ${tool}` };
      }
    } catch (error) {
      logger.error(`[SandboxExecutor] Tool execution error:`, error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * 列出目录内容
   */
  private listDirectory(dirPath: string): SandboxResult {
    if (!dirPath) {
      return { success: false, error: '缺少目录路径参数' };
    }

    // 展开 ~ 到用户目录
    const expandedPath = this.expandPath(dirPath);

    // 安全校验：只允许访问用户目录
    if (!this.isPathAllowed(expandedPath)) {
      return { success: false, error: '该路径不在允许访问范围内' };
    }

    try {
      if (!fs.existsSync(expandedPath)) {
        return { success: false, error: '目录不存在' };
      }

      const stats = fs.statSync(expandedPath);
      if (!stats.isDirectory()) {
        return { success: false, error: '路径不是目录' };
      }

      const files = fs.readdirSync(expandedPath);
      const fileList = files.map((name) => {
        const fullPath = path.join(expandedPath, name);
        const fileStats = fs.statSync(fullPath);
        return {
          name,
          type: fileStats.isDirectory() ? 'directory' : 'file',
          size: fileStats.size,
          modified: fileStats.mtime.toISOString(),
        };
      });

      return { success: true, result: JSON.stringify({ files: fileList, count: fileList.length }) };
    } catch (error) {
      logger.error(`[SandboxExecutor] listDirectory error:`, error);
      return { success: false, error: `读取目录失败: ${String(error)}` };
    }
  }

  /**
   * 读取文本文件
   */
  private readFile(filePath: string): SandboxResult {
    if (!filePath) {
      return { success: false, error: '缺少文件路径参数' };
    }

    const expandedPath = this.expandPath(filePath);

    // 安全校验
    if (!this.isPathAllowed(expandedPath)) {
      return { success: false, error: '该路径不在允许访问范围内' };
    }

    // 检查扩展名
    const ext = path.extname(expandedPath).toLowerCase();
    if (!['.txt', '.md', '.json', '.csv', '.xml', '.html', '.css', '.js', '.ts'].includes(ext)) {
      return { success: false, error: `不支持的文本文件格式: ${ext}，支持的格式: txt, md, json, csv, xml, html, css, js, ts` };
    }

    try {
      if (!fs.existsSync(expandedPath)) {
        return { success: false, error: '文件不存在' };
      }

      const stats = fs.statSync(expandedPath);
      if (stats.size > MAX_FILE_SIZE) {
        return { success: false, error: `文件过大 (${Math.round(stats.size / 1024 / 1024)}MB)，最大支持 ${MAX_FILE_SIZE / 1024 / 1024}MB` };
      }

      const content = fs.readFileSync(expandedPath, 'utf-8');
      return {
        success: true,
        result: JSON.stringify({
          content,
          size: stats.size,
          lines: content.split('\n').length,
          truncated: stats.size > MAX_FILE_SIZE,
        }),
      };
    } catch (error) {
      logger.error(`[SandboxExecutor] readFile error:`, error);
      return { success: false, error: `读取文件失败: ${String(error)}` };
    }
  }

  /**
   * 通用文档解析（根据扩展名选择解析器）
   */
  private async readDocument(filePath: string): Promise<SandboxResult> {
    if (!filePath) {
      return { success: false, error: '缺少文件路径参数' };
    }

    const expandedPath = this.expandPath(filePath);

    // 安全校验
    if (!this.isPathAllowed(expandedPath)) {
      return { success: false, error: '该路径不在允许访问范围内' };
    }

    // 检查扩展名
    const ext = path.extname(expandedPath).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return { success: false, error: `不支持的文件格式: ${ext}，支持的格式: ${ALLOWED_EXTENSIONS.join(', ')}` };
    }

    try {
      if (!fs.existsSync(expandedPath)) {
        return { success: false, error: '文件不存在' };
      }

      const stats = fs.statSync(expandedPath);
      if (stats.size > MAX_FILE_SIZE) {
        return { success: false, error: `文件过大 (${Math.round(stats.size / 1024 / 1024)}MB)，最大支持 ${MAX_FILE_SIZE / 1024 / 1024}MB` };
      }

      // 根据扩展名选择解析方法
      if (ext === '.xlsx' || ext === '.xls') {
        return this.parseExcel(expandedPath);
      } else if (ext === '.pdf') {
        return this.parsePdf(expandedPath);
      } else if (ext === '.docx') {
        return this.parseDocx(expandedPath);
      } else if (ext === '.csv') {
        return this.parseCsv(expandedPath);
      } else {
        // 其他文本文件
        return this.readFile(expandedPath);
      }
    } catch (error) {
      logger.error(`[SandboxExecutor] readDocument error:`, error);
      return { success: false, error: `解析文档失败: ${String(error)}` };
    }
  }

  /**
   * 解析 Excel 文件
   */
  private parseExcel(filePath: string): SandboxResult {
    try {
      // dynamic import xlsx to avoid loading issues
      const XLSX = require('xlsx');
      const workbook = XLSX.readFile(filePath);

      const sheets: Record<string, unknown> = {};
      let totalRows = 0;

      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

        // 限制行数
        const limitedData = data.slice(0, MAX_EXCEL_ROWS + 1);
        totalRows += limitedData.length;

        sheets[sheetName] = {
          rows: limitedData.length,
          headers: limitedData.length > 0 ? limitedData[0] : [],
          data: limitedData.slice(1), // 去掉表头
          truncated: data.length > MAX_EXCEL_ROWS,
        };
      }

      return {
        success: true,
        result: JSON.stringify({
          type: 'excel',
          sheets: workbook.SheetNames.length,
          sheetNames: workbook.SheetNames,
          sheetsData: sheets,
          totalRows,
          truncated: totalRows > MAX_EXCEL_ROWS,
        }),
      };
    } catch (error) {
      logger.error(`[SandboxExecutor] parseExcel error:`, error);
      return { success: false, error: `解析 Excel 失败: ${String(error)}` };
    }
  }

  /**
   * 解析 PDF 文件
   */
  private parsePdf(filePath: string): SandboxResult {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);

      // pdf-parse 默认会截断过大文件
      const data = pdfParse(dataBuffer);

      return {
        success: true,
        result: JSON.stringify({
          type: 'pdf',
          pages: data.numpages,
          content: data.text,
          truncated: data.text.length > MAX_FILE_SIZE,
        }),
      };
    } catch (error) {
      logger.error(`[SandboxExecutor] parsePdf error:`, error);
      return { success: false, error: `解析 PDF 失败: ${String(error)}` };
    }
  }

  /**
   * 解析 Word DOCX 文件
   */
  private parseDocx(filePath: string): SandboxResult {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mammoth = require('mammoth');
      const result = mammoth.extractRawText({ path: filePath });

      return {
        success: true,
        result: JSON.stringify({
          type: 'docx',
          content: result.value,
          messages: result.messages,
          truncated: result.value.length > MAX_FILE_SIZE,
        }),
      };
    } catch (error) {
      logger.error(`[SandboxExecutor] parseDocx error:`, error);
      return { success: false, error: `解析 DOCX 失败: ${String(error)}` };
    }
  }

  /**
   * 解析 CSV 文件
   */
  private parseCsv(filePath: string): SandboxResult {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter((line) => line.trim());
      const headers = lines[0]?.split(',').map((h) => h.trim().replace(/^"|"$/g, '')) || [];
      const maxLines = Math.min(lines.length, MAX_EXCEL_ROWS + 1);
      const data = lines.slice(1, maxLines).map((line) => {
        const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        return row;
      });

      return {
        success: true,
        result: JSON.stringify({
          type: 'csv',
          headers,
          data,
          totalRows: lines.length - 1,
          truncated: lines.length > MAX_EXCEL_ROWS + 1,
        }),
      };
    } catch (error) {
      logger.error(`[SandboxExecutor] parseCsv error:`, error);
      return { success: false, error: `解析 CSV 失败: ${String(error)}` };
    }
  }

  /**
   * 展开路径中的 ~ 到用户目录
   */
  private expandPath(filePath: string): string {
    if (filePath.startsWith('~/')) {
      return path.join(os.homedir(), filePath.slice(2));
    }
    return filePath;
  }

  /**
   * 检查路径是否在允许访问的范围内
   * 目前允许：桌面、下载文件夹、用户主目录
   */
  private isPathAllowed(filePath: string): boolean {
    const homeDir = os.homedir();
    const desktopDir = path.join(homeDir, 'Desktop');
    const downloadsDir = path.join(homeDir, 'Downloads');
    const documentsDir = path.join(homeDir, 'Documents');

    const allowedDirs = [homeDir, desktopDir, downloadsDir, documentsDir];

    for (const allowedDir of allowedDirs) {
      if (filePath.startsWith(allowedDir)) {
        return true;
      }
    }

    return false;
  }
}

// 导出单例
export const getSandboxExecutor = (): SandboxExecutor => {
  return SandboxExecutor.getInstance();
};

export default SandboxExecutor;
