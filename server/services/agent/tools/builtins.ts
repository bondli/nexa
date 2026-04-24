import type { ToolDefinition, ToolResult } from '../types';
import logger from 'electron-log';

/**
 * 创建笔记工具
 */
const createWriteNoteTool = (): ToolDefinition => {
  return {
    name: 'write_note',
    description: '创建一条新笔记。输入应包含 title（标题）和 content（内容）。',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '笔记标题' },
        content: { type: 'string', description: '笔记内容' },
      },
      required: ['title', 'content'],
    },
    execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
      const title = params.title as string;
      const content = params.content as string;

      if (!title || !content) {
        return { success: false, error: '缺少必要参数 title 或 content' };
      }

      try {
        // TODO: 调用实际的笔记服务创建笔记
        logger.info('[write_note] 创建笔记:', { title, contentLength: content.length });

        return {
          success: true,
          result: JSON.stringify({
            success: true,
            message: '笔记创建成功',
            noteId: `note_${Date.now()}`,
            title,
          }),
        };
      } catch (error) {
        logger.error('[write_note] 创建笔记失败:', error);
        return { success: false, error: String(error) };
      }
    },
  };
};

/**
 * 搜索笔记工具
 */
const createSearchNotesTool = (): ToolDefinition => {
  return {
    name: 'search_notes',
    description: '根据关键词搜索笔记。输入应为 searchQuery（搜索关键词）。',
    parameters: {
      type: 'object',
      properties: {
        searchQuery: { type: 'string', description: '搜索关键词' },
      },
      required: ['searchQuery'],
    },
    execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
      const searchQuery = params.searchQuery as string;

      if (!searchQuery) {
        return { success: false, error: '缺少必要参数 searchQuery' };
      }

      try {
        // TODO: 调用实际的搜索服务
        logger.info('[search_notes] 搜索:', searchQuery);

        // 模拟搜索结果
        const mockResults = [
          { id: 1, title: '学习笔记', content: '今天学习了 TypeScript...' },
          { id: 2, title: 'React 笔记', content: 'React 组件开发...' },
        ];

        return {
          success: true,
          result: JSON.stringify({
            success: true,
            results: mockResults,
            count: mockResults.length,
          }),
        };
      } catch (error) {
        logger.error('[search_notes] 搜索失败:', error);
        return { success: false, error: String(error) };
      }
    },
  };
};

/**
 * 天气查询工具
 */
const createGetWeatherTool = (): ToolDefinition => {
  return {
    name: 'get_weather',
    description: '查询指定城市的天气。输入应为 city（城市名称）。',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: '城市名称' },
      },
      required: ['city'],
    },
    execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
      const city = params.city as string;

      if (!city) {
        return { success: false, error: '缺少必要参数 city' };
      }

      try {
        // TODO: 调用实际的天气 API
        logger.info('[get_weather] 查询城市:', city);

        const weatherConditions = ['晴', '多云', '阴', '小雨', '大雨', '雪'];
        const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        const temperature = Math.floor(Math.random() * 30) + 5;

        return {
          success: true,
          result: JSON.stringify({
            success: true,
            city,
            weather: randomCondition,
            temperature: `${temperature}°C`,
          }),
        };
      } catch (error) {
        logger.error('[get_weather] 查询失败:', error);
        return { success: false, error: String(error) };
      }
    },
  };
};

/**
 * 获取所有内置工具
 */
export const getBuiltInTools = (): ToolDefinition[] => {
  return [createWriteNoteTool(), createSearchNotesTool(), createGetWeatherTool()];
};

/**
 * 注册所有内置工具到注册表
 */
export const registerBuiltInTools = (): void => {
  const registry = require('./registry').getToolRegistry();
  const tools = getBuiltInTools();
  registry.registerTools(tools);
  logger.info('[BuiltInTools] Registered', tools.length, 'built-in tools');
};
