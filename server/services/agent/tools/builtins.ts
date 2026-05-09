import logger from 'electron-log';
import { Op } from 'sequelize';
import type { ToolDefinition, ToolResult } from '../types';
import Note from '../../../models/Note';
import Cate from '../../../models/Cate';
import Article from '../../../models/Article';
import { getWeather, formatWeatherResult } from './weather-service';
import { setAlarm } from './alarm-service';

/**
 * 获取用户 ID（从工具参数中注入）
 */
const getUserId = (params: Record<string, unknown>): number => {
  return (params._userId as number) || 0;
};

/**
 * 创建笔记工具
 * 支持参数：title（标题）、content（内容）、cateId（分类ID，可选）
 * 当 cateId 缺失时，返回分类列表让用户选择
 */
const createWriteNoteTool = (): ToolDefinition => {
  return {
    name: 'write_note',
    description:
      '创建一条新笔记。输入应包含 title（标题）、content（内容）和 cateId（分类ID）。当分类ID缺失时，会返回分类列表供用户选择。',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '笔记标题' },
        content: { type: 'string', description: '笔记内容' },
        cateId: { type: 'number', description: '分类ID（可选，如果不提供会返回分类列表）' },
      },
      required: ['title', 'content'],
    },
    execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
      const title = params.title as string;
      const content = params.content as string;
      let cateId = params.cateId as number | undefined;

      if (!title || !content) {
        return { success: false, error: '缺少必要参数 title 或 content' };
      }

      try {
        // 如果没有提供分类ID，查询所有分类返回给用户选择
        if (!cateId) {
          const categories = await Cate.findAll({
            where: { userId: getUserId(params) },
            order: [
              ['orders', 'ASC'],
              ['createdAt', 'DESC'],
            ],
          });

          if (!categories || categories.length === 0) {
            return {
              success: true,
              result: JSON.stringify({
                success: false,
                requiresAction: true,
                actionType: 'select_category',
                message: '您还没有创建任何笔记分类，请先创建分类后再试',
              }),
            };
          }

          const categoryList = categories.map((c, index) => `${index + 1}. ${c.name} (ID: ${c.id})`).join('\n');
          return {
            success: true,
            result: JSON.stringify({
              success: false,
              requiresAction: true,
              actionType: 'select_category',
              message: `请选择要创建笔记的分类：\n${categoryList}\n\n请回复分类的数字编号`,
              categories: categories.map((c) => ({ id: c.id, name: c.name })),
            }),
          };
        }

        // 创建笔记
        logger.info('[write_note] 创建笔记:', { title, contentLength: content.length, cateId });

        const note = await Note.create({
          title,
          desc: content,
          cateId,
          userId: getUserId(params),
          status: 'undo',
          priority: 4,
        });

        // 更新分类计数
        await Cate.update({ counts: Note.sequelize!.literal('counts + 1') }, { where: { id: cateId } });

        return {
          success: true,
          result: JSON.stringify({
            success: true,
            message: '✅ 笔记创建成功！',
            noteId: note.id,
            title: note.title,
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
 * 支持参数：searchQuery（搜索关键词）
 * 首次调用返回列表，用户选择后传入 noteId 获取详情
 */
const createSearchNotesTool = (): ToolDefinition => {
  return {
    name: 'search_notes',
    description:
      '根据关键词搜索笔记。输入应为 searchQuery（搜索关键词）。返回笔记列表，用户选择后传入 noteId 获取详情。',
    parameters: {
      type: 'object',
      properties: {
        searchQuery: { type: 'string', description: '搜索关键词' },
        noteId: { type: 'number', description: '笔记ID（查看详情时使用）' },
      },
      required: ['searchQuery'],
    },
    execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
      const searchQuery = params.searchQuery as string | undefined;
      // 支持 value 参数（当用户直接发送数字选择时）
      const noteId = (params.noteId || params.value) as number | undefined;

      try {
        // 如果提供了 noteId，返回笔记详情
        if (noteId) {
          const note = await Note.findByPk(noteId);
          if (!note) {
            return { success: false, error: `未找到 ID 为 ${noteId} 的笔记` };
          }

          // 获取分类名称
          const category = await Cate.findByPk(note.cateId);

          return {
            success: true,
            result: JSON.stringify({
              success: true,
              note: {
                id: note.id,
                title: note.title,
                content: note.desc || '',
                category: category?.name || '未分类',
                status: note.status,
                priority: note.priority,
                deadline: note.deadline,
                createdAt: (note as any).createdAt,
                updatedAt: (note as any).updatedAt,
              },
            }),
          };
        }

        // 执行搜索
        // 如果既没有 searchQuery 也没有 noteId（value），返回错误
        if (!searchQuery && !noteId) {
          return { success: false, error: '缺少必要参数 searchQuery 或 noteId' };
        }

        // 如果只有 searchQuery 且为数字类型，尝试作为 noteId 处理
        if (typeof searchQuery === 'number') {
          const numericNoteId = searchQuery;
          const note = await Note.findByPk(numericNoteId);
          if (note) {
            const category = await Cate.findByPk(note.cateId);
            return {
              success: true,
              result: JSON.stringify({
                success: true,
                note: {
                  id: note.id,
                  title: note.title,
                  content: note.desc || '',
                  category: category?.name || '未分类',
                  status: note.status,
                  priority: note.priority,
                  deadline: note.deadline,
                  createdAt: (note as any).createdAt,
                  updatedAt: (note as any).updatedAt,
                },
              }),
            };
          }
        }

        logger.info('[search_notes] 搜索:', searchQuery);

        const notes = await Note.findAll({
          where: {
            userId: getUserId(params),
            status: 'undo',
            [Op.or]: [{ title: { [Op.like]: `%${searchQuery}%` } }, { desc: { [Op.like]: `%${searchQuery}%` } }],
          },
          order: [['updatedAt', 'DESC']],
          limit: 20,
        });

        if (!notes || notes.length === 0) {
          return {
            success: true,
            result: JSON.stringify({
              success: true,
              results: [],
              message: `没有找到包含「${searchQuery}」的笔记`,
            }),
          };
        }

        // 获取分类信息
        const categoryIds = [...new Set(notes.map((n) => n.cateId))];
        const categories = await Cate.findAll({
          where: { id: { [Op.in]: categoryIds } },
        });
        const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

        const results = notes.map((note) => ({
          id: note.id,
          title: note.title,
          content: note.desc ? note.desc.substring(0, 100) + (note.desc.length > 100 ? '...' : '') : '',
          category: categoryMap.get(note.cateId) || '未分类',
        }));

        return {
          success: true,
          result: JSON.stringify({
            success: true,
            results,
            count: results.length,
            message: `找到 ${results.length} 条笔记，请选择要查看的笔记（回复笔记编号）`,
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
 * 支持参数：city（城市名称）
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
        logger.info('[get_weather] 查询城市:', city);
        const result = await getWeather(city);

        if (!result.success) {
          return {
            success: true,
            result: JSON.stringify({
              success: false,
              message: `查询天气失败：${result.error}`,
            }),
          };
        }

        const formattedResult = formatWeatherResult(result);
        return {
          success: true,
          result: JSON.stringify({
            success: true,
            message: formattedResult,
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
 * 闹钟工具
 * 支持参数：title（闹钟标题）、time（闹钟时间，自然语言表达）
 */
const createAlarmClockTool = (): ToolDefinition => {
  return {
    name: 'alarm_clock',
    description:
      '设置一个闹钟。输入应包含 title（闹钟标题）和 time（闹钟时间，支持自然语言如：2小时后、明天下午3点、今天上午9点30分等）。到点时会收到桌面通知提醒。',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '闹钟标题' },
        time: { type: 'string', description: '闹钟时间（自然语言表达，如：2小时后、明天下午3点、今天上午9点30分）' },
      },
      required: ['title', 'time'],
    },
    execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
      const title = params.title as string;
      const time = params.time as string;

      if (!title || !time) {
        return { success: false, error: '缺少必要参数 title 或 time' };
      }

      try {
        logger.info('[alarm_clock] 设置闹钟:', { title, time });
        const result = await setAlarm(title, time);

        return {
          success: true,
          result: JSON.stringify({
            success: result.success,
            message: result.message,
            alarmId: result.alarmId,
            scheduledTime: result.scheduledTime,
          }),
        };
      } catch (error) {
        logger.error('[alarm_clock] 设置闹钟失败:', error);
        return { success: false, error: String(error) };
      }
    },
  };
};

/**
 * 搜索文章工具
 * 支持参数：searchQuery（搜索关键词）
 * 首次调用返回列表，用户选择后传入 articleId 获取详情
 */
const createSearchArticlesTool = (): ToolDefinition => {
  return {
    name: 'search_articles',
    description:
      '根据关键词搜索文章。输入应为 searchQuery（搜索关键词）。返回文章列表，用户选择后传入 articleId 获取详情。',
    parameters: {
      type: 'object',
      properties: {
        searchQuery: { type: 'string', description: '搜索关键词' },
        articleId: { type: 'number', description: '文章ID（查看详情时使用）' },
      },
      required: ['searchQuery'],
    },
    execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
      const searchQuery = params.searchQuery as string | undefined;
      // 支持 value 参数（当用户直接发送数字选择时）
      const articleId = (params.articleId || params.value) as number | undefined;

      try {
        // 如果提供了 articleId，返回文章详情
        if (articleId) {
          const article = await Article.findByPk(articleId);
          if (!article) {
            return { success: false, error: `未找到 ID 为 ${articleId} 的文章` };
          }

          return {
            success: true,
            result: JSON.stringify({
              success: true,
              article: {
                id: article.id,
                title: article.title,
                desc: article.desc || '',
                url: article.url,
                summary: article.summary,
                createdAt: (article as any).createdAt,
              },
            }),
          };
        }

        // 执行搜索
        // 如果既没有 searchQuery 也没有 articleId（value），返回错误
        if (!searchQuery && !articleId) {
          return { success: false, error: '缺少必要参数 searchQuery 或 articleId' };
        }

        // 如果只有 searchQuery 且为数字类型，尝试作为 articleId 处理
        if (typeof searchQuery === 'number') {
          const numericArticleId = searchQuery;
          const article = await Article.findByPk(numericArticleId);
          if (article) {
            return {
              success: true,
              result: JSON.stringify({
                success: true,
                article: {
                  id: article.id,
                  title: article.title,
                  desc: article.desc || '',
                  url: article.url,
                  summary: article.summary,
                  createdAt: (article as any).createdAt,
                },
              }),
            };
          }
        }

        logger.info('[search_articles] 搜索:', searchQuery);

        const articles = await Article.findAll({
          where: {
            userId: getUserId(params),
            status: 'normal',
            title: { [Op.like]: `%${searchQuery}%` },
          },
          order: [['createdAt', 'DESC']],
          limit: 20,
        });

        if (!articles || articles.length === 0) {
          return {
            success: true,
            result: JSON.stringify({
              success: true,
              results: [],
              message: `没有找到包含「${searchQuery}」的文章`,
            }),
          };
        }

        const results = articles.map((article) => ({
          id: article.id,
          title: article.title,
          desc: article.desc ? article.desc.substring(0, 100) + (article.desc.length > 100 ? '...' : '') : '',
          url: article.url,
          summary: article.summary,
        }));

        return {
          success: true,
          result: JSON.stringify({
            success: true,
            results,
            count: results.length,
            message: `找到 ${results.length} 篇文章，请选择要查看的文章（回复文章编号）`,
          }),
        };
      } catch (error) {
        logger.error('[search_articles] 搜索失败:', error);
        return { success: false, error: String(error) };
      }
    },
  };
};

/**
 * 获取所有内置工具
 */
export const getBuiltInTools = (): ToolDefinition[] => {
  return [
    createWriteNoteTool(),
    createSearchNotesTool(),
    createGetWeatherTool(),
    createAlarmClockTool(),
    createSearchArticlesTool(),
  ];
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
