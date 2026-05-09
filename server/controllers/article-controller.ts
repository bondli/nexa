import { Request, Response } from 'express';
import Sequelize, { Op } from 'sequelize';
import axios from 'axios';
import logger from 'electron-log';
import Article from '../models/Article';
import ArticleCate from '../models/ArticleCate';
import TempArticle from '../models/TempArticle';
import { success, successWithPage, badRequest, notFound, serverError } from '../utils/response';
import { loadLLMConfig } from '../services/llm-text-service';
import { extractDataForImage, fillHtmlTemplate } from '../services/article-template-service';

// 新增一篇文章
export const createArticle = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { title, desc, url, cateId, summary, image } = req.body;

    if (!title || !url || !cateId) {
      badRequest(res, 'Title, url and cateId are required');
      return;
    }

    // 使用事务确保数据一致性
    const result = await Article.sequelize!.transaction(async (t) => {
      // 创建Article记录
      const createData: any = {
        title,
        desc,
        url,
        cateId: Number(cateId),
        userId,
        status: 'normal',
      };

      // 如果有summary字段则添加
      if (summary !== undefined) {
        createData.summary = summary;
      }

      // 如果有image字段则添加
      if (image !== undefined) {
        createData.image = image;
      }

      const articleResult = await Article.create(createData, { transaction: t });

      // 更新分类计数
      await ArticleCate.update(
        { counts: Sequelize.literal('counts + 1') },
        {
          where: { id: Number(cateId) },
          transaction: t,
        },
      );

      return articleResult;
    });

    success(res, result.toJSON());
  } catch (error) {
    logger.error('Error creating Article:', error);
    serverError(res, 'Error creating Article');
  }
};

// 查询一篇文章详情
export const getArticleInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Article.findByPk(Number(id));
    if (result) {
      success(res, result.toJSON());
    } else {
      notFound(res, 'Article not found');
    }
  } catch (error) {
    logger.error('Error getting Article by ID:', error);
    serverError(res, 'Error getting Article');
  }
};

// 查询文章列表
export const getArticles = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { cateId, page = 1, pageSize = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let where: any = {
      userId,
    };

    // 全部文章
    if (cateId === 'all') {
      where.status = 'normal';
    }
    // 回收站
    else if (cateId === 'trash') {
      where.status = 'deleted';
    }
    // 临时文章 - 特殊处理，返回 TempArticle 表数据
    else if (cateId === 'temp') {
      const { count, rows } = await TempArticle.findAndCountAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: Number(pageSize),
        offset,
      });
      // 转换格式以保持一致
      const transformedRows = (rows || []).map((item) => ({
        id: item.id,
        title: item.title,
        url: item.url,
        createdAt: item.createdAt,
      }));
      successWithPage(res, transformedRows, count || 0);
      return;
    }
    // 正常查分类下的
    else {
      where.status = 'normal';
      where.cateId = Number(cateId);
    }

    const { count, rows } = await Article.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset,
    });
    successWithPage(res, rows || [], count || 0);
  } catch (error) {
    logger.error('Error getting ArticleList by cateId:', error);
    serverError(res, 'Error getting ArticleList');
  }
};

// 更新一篇文章
export const updateArticle = async (req: Request, res: Response) => {
  try {
    const { id, title, desc, url, cateId, status, opType } = req.body;
    const result = await Article.findByPk(Number(id));
    const operatorArticle = result.toJSON();
    if (result) {
      // 只更新传入的字段
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (desc !== undefined) updateData.desc = desc;
      if (url !== undefined) updateData.url = url;
      if (cateId !== undefined) updateData.cateId = Number(cateId);
      if (status !== undefined) updateData.status = status;

      await result.update(updateData);

      // 针对不同的操作类型，需要更新分类中的数量字段
      if (opType === 'delete' || opType === 'restore' || opType === 'move') {
        let updateNumCommand = '';
        if (opType === 'restore') {
          updateNumCommand = 'counts + 1';
        } else if (opType === 'delete') {
          updateNumCommand = 'counts - 1';
        } else if (opType === 'move') {
          // 源分类减1
          updateNumCommand = 'counts - 1';
        }
        const cateResult = await ArticleCate.findByPk(Number(operatorArticle.cateId));
        cateResult &&
          cateResult.update(
            {
              counts: Sequelize.literal(updateNumCommand),
            },
            {
              where: {
                id: operatorArticle.cateId,
              },
            },
          );
        if (opType === 'move') {
          // 移动文章时，需要同时更新源分类和目标分类的计数
          // 目标分类加1
          const targetCateResult = await ArticleCate.findByPk(Number(cateId));
          targetCateResult &&
            targetCateResult.update(
              {
                counts: Sequelize.literal('counts + 1'),
              },
              {
                where: {
                  id: cateId,
                },
              },
            );
        }
      }
      success(res, result.toJSON());
    } else {
      notFound(res, 'Article not found');
    }
  } catch (error) {
    logger.error('Error updating Article:', error);
    serverError(res, 'Error updating Article');
  }
};

// 删除文章到回收站（软删除）
export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Article.findByPk(Number(id));
    if (result) {
      await result.update({ status: 'deleted' });

      // 更新分类计数
      const operatorArticle = result.toJSON();
      const cateResult = await ArticleCate.findByPk(Number(operatorArticle.cateId));
      cateResult &&
        cateResult.update(
          {
            counts: Sequelize.literal('counts - 1'),
          },
          {
            where: {
              id: operatorArticle.cateId,
            },
          },
        );

      success(res, result.toJSON());
    } else {
      notFound(res, 'Article not found');
    }
  } catch (error) {
    logger.error('Error deleting Article:', error);
    serverError(res, 'Error deleting Article');
  }
};

// 从回收站恢复文章
export const recoverArticle = async (req: Request, res: Response) => {
  try {
    const { id, cateId } = req.query;
    const result = await Article.findByPk(Number(id));
    if (result) {
      await result.update({ status: 'normal', cateId: Number(cateId) });

      // 更新分类计数
      const cateResult = await ArticleCate.findByPk(Number(cateId));
      cateResult &&
        cateResult.update(
          {
            counts: Sequelize.literal('counts + 1'),
          },
          {
            where: {
              id: Number(cateId),
            },
          },
        );

      success(res, result.toJSON());
    } else {
      notFound(res, 'Article not found');
    }
  } catch (error) {
    logger.error('Error recovering Article:', error);
    serverError(res, 'Error recovering Article');
  }
};

// 彻底删除文章（从回收站）
export const removeArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Article.findByPk(Number(id));
    if (result) {
      await result.destroy();
      success(res, result.toJSON());
    } else {
      notFound(res, 'Article not found');
    }
  } catch (error) {
    logger.error('Error removing Article:', error);
    serverError(res, 'Error removing Article');
  }
};

// 搜索文章列表
export const searchArticles = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { cateId, searchKey, page = 1, pageSize = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let where: any = {
      userId,
    };

    // 全部文章
    if (cateId === 'all') {
      where.status = 'normal';
    }
    // 回收站
    else if (cateId === 'trash') {
      where.status = 'deleted';
    }
    // 正常查分类下的
    else {
      where.status = 'normal';
      where.cateId = Number(cateId);
    }

    // 搜索标题
    if (searchKey) {
      where = {
        ...where,
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${searchKey}%`,
            },
          },
        ],
      };
    }

    const { count, rows } = await Article.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset,
    });
    successWithPage(res, rows || [], count || 0);
  } catch (error) {
    logger.error('Error searching ArticleList:', error);
    serverError(res, 'Error searching Articles');
  }
};

// 获取虚拟分类下的文章数量
export const getArticleCounts = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    // 使用一次查询获取按状态分组的统计数据
    const statusCounts = await Article.findAll({
      attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      where: {
        userId,
        status: {
          [Op.in]: ['normal', 'deleted'],
        },
      },
      group: ['status'],
      raw: true,
    });

    // 将结果转换为对象格式，便于访问
    const statusCountMap = statusCounts.reduce((acc: any, item: any) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});

    // 临时文章数量
    const tempCount = await TempArticle.count({
      where: { userId },
    });

    const countData = {
      all: statusCountMap.normal || 0,
      temp: tempCount || 0,
      deleted: statusCountMap.deleted || 0,
    };
    success(res, countData);
  } catch (error) {
    logger.error('Error getting ArticleCounts:', error);
    serverError(res, 'Error getting ArticleCounts');
  }
};

// AI 总结文章
export const summarizeArticle = async (req: Request, res: Response) => {
  const { id } = req.query;

  if (!id) {
    badRequest(res, '文章ID不能为空');
    return;
  }

  try {
    // 查询文章
    const article = await Article.findByPk(Number(id));
    if (!article) {
      notFound(res, '文章不存在');
      return;
    }

    const articleData = article.toJSON();

    // 如果已有总结，直接返回
    if (articleData.summary) {
      success(res, { summary: articleData.summary, cached: true });
      return;
    }

    const content = articleData.desc || articleData.title;

    if (!content || content.trim() === '') {
      badRequest(res, '文章内容为空，无法总结');
      return;
    }

    // 加载 LLM 配置
    const config = loadLLMConfig();

    if (!config.apiKey) {
      badRequest(res, '请先配置 LLM API Key');
      return;
    }

    // 构建提示词
    const systemPrompt =
      '你是一个文章总结助手。请对用户提供的内容进行总结，突出关键信息和主要观点。用 Markdown 格式输出总结结果。';
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `请总结以下内容：\n\n${content}` },
    ];

    // 调用 LLM 非流式接口
    const response = await axios.post(
      `${config.baseUrl}/chat/completions`,
      {
        model: config.model || 'gpt-4',
        messages,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const summary = response.data.choices?.[0]?.message?.content || '';

    // 保存总结到数据库
    if (summary) {
      await article.update({ summary });
    }

    success(res, { summary, cached: false });
  } catch (error) {
    logger.error('[summarizeArticle] Error:', error);
    serverError(res, '总结失败，请稍后重试');
  }
};

// 直接对内容进行总结（不依赖文章ID）
export const summarizeContent = async (req: Request, res: Response) => {
  const { content } = req.body;

  if (!content) {
    badRequest(res, '内容不能为空');
    return;
  }

  try {
    // 加载 LLM 配置
    const config = loadLLMConfig();

    if (!config.apiKey) {
      badRequest(res, '请先配置 LLM API Key');
      return;
    }

    // 构建提示词
    const systemPrompt =
      '你是一个文章总结助手。请对用户提供的内容进行总结，突出关键信息和主要观点。用 Markdown 格式输出总结结果。';
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `请总结以下内容：\n\n${content}` },
    ];

    // 调用 LLM 非流式接口
    const response = await axios.post(
      `${config.baseUrl}/chat/completions`,
      {
        model: config.model || 'gpt-4',
        messages,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const summary = response.data.choices?.[0]?.message?.content || '';

    success(res, { summary });
  } catch (error) {
    logger.error('[summarizeContent] Error:', error);
    serverError(res, '总结失败，请稍后重试');
  }
};

// 基于文章总结内容生成HTML用于图片生成
export const generateImageArticle = async (req: Request, res: Response) => {
  try {
    const { summary, title } = req.body;

    if (!summary) {
      badRequest(res, '总结内容不能为空');
      return;
    }

    // 1. 调用AI提取结构化数据
    const extractedData = await extractDataForImage(summary, title);

    // 2. 使用内联HTML模板填充数据
    const htmlContent = fillHtmlTemplate(getHtmlTemplate(), extractedData);

    // 返回HTML内容，前端可以使用html2canvas转换为图片
    success(res, { htmlContent });
  } catch (error) {
    logger.error('[generateImageArticle] Error:', error);
    serverError(res, '生成图片内容失败');
  }
};

// HTML图文模板
function getHtmlTemplate(): string {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>\${title}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap');

      * { margin: 0; padding: 0; box-sizing: border-box; }

      :root {
        --navy: #1b2a4a; --slate: #475569; --steel: #64748b; --sky: #e2e8f0;
        --ice: #f1f5f9; --white: #ffffff; --accent: #2563eb; --accent-light: #dbeafe;
        --warn: #dc2626; --warn-light: #fef2f2; --success: #059669;
      }

      body {
        display: flex; justify-content: center; align-items: flex-start;
        min-height: 100vh; padding: 40px 20px; background: #94a3b8;
        font-family: 'Noto Sans SC', 'DM Sans', sans-serif;
      }

      .container { width: 952px; background: var(--white); position: relative; display: flex; flex-direction: column; }

      .header-bar { background: var(--navy); padding: 56px 72px 48px; position: relative; }
      .header-bar::after { content: ''; position: absolute; bottom: 0; left: 72px; width: 80px; height: 6px; background: var(--accent); }
      .header-bar h1 { font-size: 72px; font-weight: 700; color: var(--white); line-height: 1.25; margin-bottom: 16px; }
      .header-bar .subtitle { font-size: 30px; font-weight: 300; color: var(--steel); line-height: 1.6; }

      .content-area { flex: 1; padding: 40px 72px; display: flex; flex-direction: column; gap: 32px; }

      .sec-head { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
      .sec-head .num { font-family: 'DM Sans', sans-serif; font-size: 28px; font-weight: 700; color: var(--accent); background: var(--accent-light); width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
      .sec-head h2 { font-size: 40px; font-weight: 700; color: var(--navy); }

      .kpi-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
      .kpi-card { background: var(--ice); border-radius: 12px; padding: 28px 24px; border-left: 5px solid var(--accent); }
      .kpi-card .label { font-size: 26px; font-weight: 500; color: var(--steel); margin-bottom: 10px; }
      .kpi-card .number { font-family: 'DM Sans', sans-serif; font-size: 56px; font-weight: 700; color: var(--navy); line-height: 1; }
      .kpi-card .number .unit { font-size: 32px; font-weight: 400; color: var(--steel); }
      .kpi-card .desc { font-size: 24px; word-break: break-all; font-weight: 500; color: var(--slate); margin-top: 8px; line-height: 1.4; }

      .grid-60-40 { display: grid; gap: 32px; }

      .spectrum { display: flex; flex-direction: column; gap: 16px; }
      .spectrum-item { background: var(--ice); border-radius: 12px; padding: 24px 28px; border-left: 5px solid var(--accent); display: flex; align-items: flex-start; gap: 20px; }
      .spectrum-item.mid { border-left-color: #93c5fd; }
      .spectrum-item.low { border-left-color: var(--sky); }
      .spectrum-item .s-left { min-width: 140px; }
      .spectrum-item .s-label { font-size: 28px; font-weight: 700; color: var(--navy); }
      .spectrum-item .s-en { font-family: 'DM Sans', sans-serif; font-size: 24px; font-weight: 500; color: var(--steel); display: block; margin-top: 4px; }
      .spectrum-item .s-desc { font-size: 26px; word-break: break-all; color: var(--slate); line-height: 1.6; }
      .spectrum-item .s-tag { font-size: 20px; font-weight: 600; padding: 4px 12px; border-radius: 4px; display: inline-block; margin-top: 8px; }
      .s-tag.high { background: #dcfce7; color: #166534; }
      .s-tag.medium { background: #fef9c3; color: #854d0e; }
      .s-tag.zero { background: #fee2e2; color: #991b1b; }

      .risk-box { background: var(--warn-light); border: 1px solid #fecaca; border-radius: 12px; padding: 28px 32px; }
      .risk-box .sec-head .num { background: #fee2e2; color: var(--warn); }
      .risk-box .sec-head h2 { color: var(--warn); }
      .risk-item { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid #fecaca; font-size: 30px; color: #7f1d1d; line-height: 1.6; }
      .risk-item:last-child { border-bottom: none; }
      .risk-item .idx { font-family: 'DM Sans', sans-serif; font-weight: 700; color: var(--warn); flex-shrink: 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header-bar">
        <h1></h1>
        <div class="subtitle"></div>
      </div>

      <div class="content-area">
        <div>
          <div class="sec-head">
            <span class="num">01</span>
            <h2>核心指标</h2>
          </div>
          <div class="kpi-row" style="grid-template-columns: repeat(<!-- KPI数量 -->, 1fr);">
            <!-- KPI 动态替换 -->
          </div>
        </div>

        <div class="grid-60-40">
          <div>
            <div class="sec-head">
              <span class="num">02</span>
              <h2>重点信息</h2>
            </div>
            <div class="spectrum">
              <!-- 重点信息动态替换 -->
            </div>
          </div>
        </div>

        <div class="risk-box">
          <div class="sec-head">
            <span class="num">!</span>
            <h2>结论总结</h2>
          </div>
          <!-- 结论动态替换 -->
        </div>
      </div>
    </div>
  </body>
</html>`;
}
