import { Request, Response } from 'express';
import Sequelize, { Op } from 'sequelize';
import dayjs from 'dayjs';
import logger from 'electron-log';
import { success, successWithPage, notFound, serverError, badRequest } from '../utils/response';
import { generateReport } from '../services/report-service';
import { extractDataForImage, fillHtmlTemplate, getHtmlTemplate } from '../services/report-template-service';
import Note from '../models/Note';
import Article from '../models/Article';
import Report from '../models/Reports';

/**
 * 生成报告
 * POST /api/report/generate
 */
export const generateReportHandler = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { reportType } = req.body;

    if (!reportType || !['daily', 'monthly'].includes(reportType)) {
      success(res, { error: 'reportType is required and must be daily or monthly' });
      return;
    }

    // 计算报告日期
    let startDate: Date;
    let endDate: Date;
    let reportDate: string;

    if (reportType === 'daily') {
      // 日报：基于昨日的数据
      const yesterday = dayjs().subtract(1, 'day');
      startDate = yesterday.startOf('day').toDate();
      endDate = yesterday.endOf('day').toDate();
      reportDate = yesterday.format('YYYY-MM-DD');
    } else {
      // 月报：基于上月的数据
      const lastMonth = dayjs().subtract(1, 'month');
      startDate = lastMonth.startOf('month').toDate();
      endDate = lastMonth.endOf('month').toDate();
      reportDate = lastMonth.format('YYYY-MM');
    }

    // 获取时间范围内的笔记和文章
    const [notes, articles] = await Promise.all([
      Note.findAll({
        where: {
          userId,
          status: 'done',
          updatedAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        },
      }),
      Article.findAll({
        where: {
          userId,
          status: 'normal',
          updatedAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        },
      }),
    ]);

    // 准备数据给 AI 生成报告
    const noteContents = notes.map((n) => `- 笔记：${n.title}${n.desc ? '\n  ' + n.desc : ''}`).join('\n');
    const articleContents = articles
      .map((a) => `- 文章：${a.title}${a.summary ? '\n  摘要：' + a.summary : ''}`)
      .join('\n');

    // 生成报告
    const reportResult = await generateReport(reportType, noteContents, articleContents);

    // 保存报告到数据库
    const report = await Report.create({
      reportDate,
      reportType,
      summary: reportResult.summary,
      content: reportResult.content,
      image: null,
      userId,
    });

    success(res, report.toJSON());
  } catch (error) {
    logger.error('Error generating report:', error);
    serverError(res, '生成报告失败');
  }
};

/**
 * 获取报告列表
 * GET /api/report/list
 */
export const getReportList = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const { reportType, month, page = 1, pageSize = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    const where: any = { userId };

    // 按类型筛选
    if (reportType && ['daily', 'monthly'].includes(reportType as string)) {
      where.reportType = reportType;
    }

    // 按月份筛选
    if (month) {
      where.reportDate = {
        [Op.like]: `${month}%`,
      };
    }

    const { count, rows } = await Report.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset,
    });

    successWithPage(res, rows || [], count || 0);
  } catch (error) {
    logger.error('Error getting report list:', error);
    serverError(res, '获取报告列表失败');
  }
};

/**
 * 更新报告
 * POST /api/report/update
 */
export const updateRepport = async (req: Request, res: Response) => {
  try {
    const { id, image } = req.body;
    const report = await Report.findByPk(id);

    if (!report) {
      notFound(res, '报告不存在');
      return;
    }

    await report.update({
      image,
    });

    success(res, report.toJSON());
  } catch (error) {
    logger.error('Error updating report:', error);
    serverError(res, '更新报告失败');
  }
};

/**
 * 检测报告生成提醒
 * GET /api/report/check
 */
export const checkReportReminder = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    const yesterdayStr = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

    // 检查昨日日报
    const yesterdayDailyReport = await Report.findOne({
      where: {
        userId,
        reportType: 'daily',
        reportDate: yesterdayStr,
      },
    });

    const needDailyReport = !yesterdayDailyReport;

    // 检查月初月报（每月5日前需要上月月报）
    const now = dayjs();
    const isEarlyMonth = now.date() <= 5;
    let needMonthlyReport = false;
    let lastMonthStr = '';

    if (isEarlyMonth) {
      const lastMonth = now.subtract(1, 'month');
      lastMonthStr = lastMonth.format('YYYY-MM');

      const lastMonthReport = await Report.findOne({
        where: {
          userId,
          reportType: 'monthly',
          reportDate: lastMonthStr,
        },
      });

      needMonthlyReport = !lastMonthReport;
    }

    success(res, {
      needDailyReport,
      needMonthlyReport,
      yesterdayDate: yesterdayStr,
      lastMonth: lastMonthStr,
    });
  } catch (error) {
    logger.error('Error checking report reminder:', error);
    serverError(res, '检查报告提醒失败');
  }
};

/**
 * 删除报告
 * DELETE /api/report/delete
 */
export const deleteReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Report.findByPk(Number(id));

    if (!result) {
      notFound(res, '报告不存在');
      return;
    }

    await result.destroy();
    success(res, result.toJSON());
  } catch (error) {
    logger.error('Error deleting report:', error);
    serverError(res, '删除报告失败');
  }
};

/**
 * 获取报告详情
 * GET /api/report/detail
 */
export const getReportDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Report.findByPk(Number(id));

    if (!result) {
      notFound(res, '报告不存在');
      return;
    }

    success(res, result.toJSON());
  } catch (error) {
    logger.error('Error getting report detail:', error);
    serverError(res, '获取报告详情失败');
  }
};

/**
 * 获取报告分组（按月份）
 * GET /api/report/group
 */
export const getReportGroups = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;

  try {
    // 查询每月日报数量
    const reports = await Report.findAll({
      where: {
        userId,
        reportType: 'daily',
      },
      attributes: ['reportDate'],
      order: [['reportDate', 'DESC']],
    });

    // 按月份统计数量
    const monthCountMap: Record<string, number> = {};
    reports.forEach((r) => {
      const month = r.reportDate.substring(0, 7);
      monthCountMap[month] = (monthCountMap[month] || 0) + 1;
    });

    // 构造成数组并倒序排列
    const groups = Object.entries(monthCountMap)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => b.month.localeCompare(a.month));

    success(res, groups);
  } catch (error) {
    logger.error('Error getting report groups:', error);
    serverError(res, '获取报告分组失败');
  }
};

// 获取虚拟分类下的报告数量
export const getReportCounts = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    // 使用一次查询获取按状态分组的统计数据
    const typeCounts = await Report.findAll({
      attributes: ['reportType', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      where: {
        userId,
      },
      group: ['reportType'],
      raw: true,
    });

    // 将结果转换为对象格式,便于访问
    const typeCountMap = typeCounts.reduce((acc: any, item: any) => {
      acc[item.reportType] = parseInt(item.count);
      return acc;
    }, {});

    const countData = {
      daily: typeCountMap.daily || 0,
      monthly: typeCountMap.monthly || 0,
      all: (typeCountMap.daily || 0) + (typeCountMap.monthly || 0),
    };
    success(res, countData);
  } catch (error) {
    logger.error('Error getting ReportCounts:', error);
    serverError(res, 'Error getting ReportCounts');
  }
};

// 基于总结内容生成HTML用于图片生成
export const generateReportImage = async (req: Request, res: Response) => {
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
    logger.error('[generateImage] Error:', error);
    serverError(res, '生成图片内容失败');
  }
};
