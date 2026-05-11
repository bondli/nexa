import React, { createContext, useState, useCallback } from 'react';
import request from '@commons/request';

/**
 * 报告类型
 */
export type ReportType = 'daily' | 'monthly';

/**
 * 报告数据结构
 */
export interface Report {
  id: number;
  reportDate: string;
  reportType: ReportType;
  summary: string | null;
  content: string | null;
  image: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 报告提醒数据
 */
export interface ReportReminder {
  needDailyReport: boolean;
  needMonthlyReport: boolean;
  yesterdayDate: string;
  lastMonth: string;
}

/**
 * 报告分类
 */
export interface ReportCate {
  id: string | number;
  name: string;
  type: 'all' | 'daily' | 'monthly' | 'month';
  isVirtual?: boolean;
}

type ReportContextType = {
  currentCate: ReportCate;
  setCurrentCate: React.Dispatch<React.SetStateAction<ReportCate>>;
  reportList: Report[];
  setReportList: React.Dispatch<React.SetStateAction<Report[]>>;
  selectedReport: Report | null;
  setSelectedReport: React.Dispatch<React.SetStateAction<Report | null>>;
  reportCounts: { all: number; daily: number; monthly: number };
  getReportCounts: () => Promise<void>;
  setReportCounts: React.Dispatch<React.SetStateAction<{ all: number; daily: number; monthly: number }>>;
  getReportList: (isLoadMore?: boolean) => Promise<void>;
  getReportDetail: (id: number) => Promise<Report | null>;
  generateReport: (reportType: ReportType) => Promise<Report | null>;
  deleteReport: (id: number) => Promise<boolean>;
  getReportGroups: () => Promise<{ month: string; count: number }[]>;
  checkReportReminder: () => Promise<ReportReminder | null>;
  searchKey: string;
  setSearchKey: React.Dispatch<React.SetStateAction<string>>;
  total: number;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  reportLoading: boolean;
  reportHasMore: boolean;
  reminderData: ReportReminder | null;
};

// 默认分类 - 全部报告
const DEFAULT_CATE: ReportCate = {
  id: 'all',
  name: '全部报告',
  type: 'all',
};

export const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCate, setCurrentCate] = useState<ReportCate>(DEFAULT_CATE);
  const [reportList, setReportList] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportCounts, setReportCounts] = useState({ all: 0, daily: 0, monthly: 0 });
  const [searchKey, setSearchKey] = useState('');
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportHasMore, setReportHasMore] = useState(true);
  const [reminderData, setReminderData] = useState<ReportReminder | null>(null);

  // 获取报告列表（支持分页加载更多）
  const getReportList = useCallback(
    async (isLoadMore = false) => {
      const targetPage = isLoadMore ? currentPage + 1 : 1;

      if (!isLoadMore) {
        setReportLoading(true);
      } else if (reportLoading) {
        return;
      }

      try {
        const params: any = {
          page: targetPage,
          pageSize,
        };

        // 根据当前分类添加筛选条件
        if (currentCate.type === 'daily') {
          params.reportType = 'daily';
        } else if (currentCate.type === 'monthly') {
          params.reportType = 'monthly';
        } else if (currentCate.type === 'month') {
          // 月份筛选
          params.month = currentCate.name;
        }

        const response = await request.get('/report/list', { params });
        const newList = response.data || [];
        const responseTotal = response.count || 0;

        if (isLoadMore) {
          setReportList((prev) => [...prev, ...newList]);
        } else {
          setReportList(newList);
        }

        setTotal(responseTotal);
        setCurrentPage(targetPage);
        setReportHasMore(targetPage * pageSize < responseTotal);
      } catch (error) {
        console.error('获取报告列表失败:', error);
      } finally {
        setReportLoading(false);
      }
    },
    [currentCate, currentPage, pageSize, reportLoading],
  );

  // 获取报告详情
  const getReportDetail = async (id: number): Promise<Report | null> => {
    try {
      const response = await request.get('/report/detail', {
        params: { id },
      });
      return response.data || null;
    } catch (error) {
      console.error('获取报告详情失败:', error);
      return null;
    }
  };

  // 生成报告
  const generateReport = async (reportType: ReportType): Promise<Report | null> => {
    try {
      const response = await request.post('/report/generate', { reportType });
      // 生成后刷新列表
      await getReportList(false);
      // 更新计数
      await getReportCounts();
      return response.data || null;
    } catch (error) {
      console.error('生成报告失败:', error);
      return null;
    }
  };

  // 删除报告
  const deleteReport = async (id: number): Promise<boolean> => {
    try {
      await request.get('/report/delete', {
        params: { id },
      });
      await getReportList(false);
      return true;
    } catch (error) {
      console.error('删除报告失败:', error);
      return false;
    }
  };

  // 获取报告月份分组
  const getReportGroups = async (): Promise<{ month: string; count: number }[]> => {
    try {
      const response = await request.get('/report/group');
      return response.data || [];
    } catch (error) {
      console.error('获取报告分组失败:', error);
      return [];
    }
  };

  // 检查报告提醒
  const checkReportReminder = async (): Promise<ReportReminder | null> => {
    try {
      const response = await request.get('/report/check');
      const data = response.data || {};
      setReminderData(data);
      return data;
    } catch (error) {
      console.error('检查报告提醒失败:', error);
      return null;
    }
  };

  // 获取报告数量统计
  const getReportCounts = async () => {
    try {
      const response = await request.get('/report/counts');
      setReportCounts(response.data || {});
    } catch (error) {
      console.error('获取报告数量统计失败:', error);
    }
  };

  return (
    <ReportContext.Provider
      value={{
        currentCate,
        setCurrentCate,
        reportList,
        setReportList,
        selectedReport,
        setSelectedReport,
        reportCounts,
        getReportCounts,
        setReportCounts,
        getReportList,
        getReportDetail,
        generateReport,
        deleteReport,
        getReportGroups,
        checkReportReminder,
        searchKey,
        setSearchKey,
        total,
        setTotal,
        currentPage,
        setCurrentPage,
        pageSize,
        reportLoading,
        reportHasMore,
        reminderData,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};
