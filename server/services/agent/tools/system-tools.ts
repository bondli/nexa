import type { ToolDefinition, ToolResult } from '../types';
import { getSandboxExecutor } from '../sandbox';
import logger from 'electron-log';

/**
 * 创建列表目录工具
 */
const createListDirectoryTool = (): ToolDefinition => {
  return {
    name: 'list_directory',
    description: '列出指定目录下的文件和文件夹。输入应为 path（目录路径）。支持 ~/Desktop、~/Downloads 等路径。',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '目录路径，如 ~/Desktop 或完整路径' },
      },
      required: ['path'],
    },
    execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
      const path = params.path as string;

      if (!path) {
        return { success: false, error: '缺少必要参数 path' };
      }

      try {
        const executor = getSandboxExecutor();
        const result = await executor.execute('list_directory', { path });
        return result;
      } catch (error) {
        logger.error('[list_directory] 执行失败:', error);
        return { success: false, error: String(error) };
      }
    },
  };
};

/**
 * 创建读取文本文件工具
 */
const createReadFileTool = (): ToolDefinition => {
  return {
    name: 'read_file',
    description: '读取文本文件内容。输入应为 path（文件路径）。支持 txt, md, json, csv, xml, html, css, js, ts 等文本格式。',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '文件路径，如 ~/Documents/readme.txt' },
      },
      required: ['path'],
    },
    execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
      const path = params.path as string;

      if (!path) {
        return { success: false, error: '缺少必要参数 path' };
      }

      try {
        const executor = getSandboxExecutor();
        const result = await executor.execute('read_file', { path });
        return result;
      } catch (error) {
        logger.error('[read_file] 执行失败:', error);
        return { success: false, error: String(error) };
      }
    },
  };
};

/**
 * 创建通用文档解析工具
 */
const createReadDocumentTool = (): ToolDefinition => {
  return {
    name: 'read_document',
    description: '解析并读取文档内容，支持 Excel (.xlsx, .xls)、Word (.docx)、PDF (.pdf)、CSV 等格式。根据文件扩展名自动选择解析方法。',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '文档路径，如 ~/Desktop/report.pdf 或 ~/Documents/data.xlsx' },
      },
      required: ['path'],
    },
    execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
      const path = params.path as string;

      if (!path) {
        return { success: false, error: '缺少必要参数 path' };
      }

      try {
        const executor = getSandboxExecutor();
        const result = await executor.execute('read_document', { path });
        return result;
      } catch (error) {
        logger.error('[read_document] 执行失败:', error);
        return { success: false, error: String(error) };
      }
    },
  };
};

/**
 * 获取所有系统工具
 */
export const getSystemTools = (): ToolDefinition[] => {
  return [createListDirectoryTool(), createReadFileTool(), createReadDocumentTool()];
};

/**
 * 注册所有系统工具到注册表
 */
export const registerSystemTools = (): void => {
  const { getToolRegistry } = require('./registry');
  const registry = getToolRegistry();
  const tools = getSystemTools();
  registry.registerTools(tools);
  logger.info('[SystemTools] Registered', tools.length, 'system tools');
};

export default getSystemTools;
