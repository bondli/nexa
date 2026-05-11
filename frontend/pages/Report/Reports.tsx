import React, { memo, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { List, Empty, Image, Drawer, Button, Tag } from 'antd';
import { GithubFilled, DeleteOutlined } from '@ant-design/icons';
import { format as timeAgoFormat } from 'timeago.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ReportContext, Report } from './context';
import styles from './index.module.less';

const Reports: React.FC = () => {
  const { currentCate, reportList, getReportList, reportLoading, reportHasMore, deleteReport, total } =
    useContext(ReportContext);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImgUrl, setPreviewImgUrl] = useState<string>('');
  const [currentReport, setCurrentReport] = useState<Report | null>(null);

  useEffect(() => {
    getReportList(false);
  }, [currentCate]);

  // 查看详情
  const handleViewDetail = (report: Report) => {
    setCurrentReport(report);
    setDrawerVisible(true);
  };

  // 图片预览
  const previewImage = (imgUrl: string) => {
    setPreviewImgUrl(imgUrl);
    setPreviewVisible(true);
  };

  // 查看缩略图
  const handleViewImage = (report: Report) => {
    if (!report.image) {
      return;
    }
    previewImage(report.image);
  };

  // 删除报告
  const handleDelete = async (report: Report, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await deleteReport(report.id);
    if (success) {
      // 删除成功，无需额外提示
    }
  };

  // 渲染报告类型标签
  const renderReportType = (type: 'daily' | 'monthly') => {
    return type === 'daily' ? <Tag color="magenta">日报</Tag> : <Tag color="volcano">月报</Tag>;
  };

  // 渲染头像
  const renderAvatar = (report: Report) => {
    const color = '#1677ff';
    if (report.image) {
      return <GithubFilled style={{ fontSize: 28, color }} onClick={() => handleViewImage(report)} />;
    }
    return <GithubFilled style={{ fontSize: 28, color }} />;
  };

  // 渲染标题（报告日期 + 类型）
  const renderTitle = (report: Report) => {
    return (
      <div className={styles.listTitle} onClick={() => handleViewDetail(report)}>
        {renderReportType(report.reportType)}
        <span style={{ marginLeft: 8 }}>{report.reportDate}</span>
      </div>
    );
  };

  // 渲染描述（摘要）
  const renderDesc = (report: Report) => {
    const displayDesc =
      report.summary?.length > 50 ? report.summary.substring(0, 50) + '...' : report.summary || '暂无摘要';
    return (
      <div className={styles.listDesc} onClick={() => handleViewDetail(report)}>
        {displayDesc}
      </div>
    );
  };

  // 触底加载更多
  const handleLoadMore = useCallback(() => {
    if (reportHasMore && !reportLoading) {
      getReportList(true);
    }
  }, [reportHasMore, reportLoading, getReportList]);

  // 使用 Intersection Observer 监听触底
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && reportHasMore && !reportLoading) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [reportHasMore, reportLoading, handleLoadMore]);

  // 加载中且列表为空时不渲染任何内容
  if (!reportList?.length && reportLoading) {
    return null;
  }

  if (!reportList?.length) {
    return (
      <div className={styles.listContainer} style={{ paddingTop: 100 }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无报告" />
      </div>
    );
  }

  // 渲染列表项操作区域
  const renderExtra = (report: Report) => (
    <div className={styles.listExtra}>
      <span className={styles.extraText}>{`created: ${timeAgoFormat(report.createdAt)}`}</span>
      <div className={styles.extraActions}>
        <Button onClick={(e) => handleDelete(report, e)} size="small" type="text">
          <DeleteOutlined />
        </Button>
      </div>
    </div>
  );

  return (
    <div className={styles.listContainer}>
      <List
        loading={false}
        itemLayout="horizontal"
        dataSource={reportList}
        renderItem={(report: Report) => (
          <List.Item extra={renderExtra(report)}>
            <List.Item.Meta
              avatar={renderAvatar(report)}
              title={renderTitle(report)}
              description={renderDesc(report)}
            />
          </List.Item>
        )}
      />
      {/* 加载更多触发区域 */}
      <div ref={loadMoreRef} style={{ textAlign: 'center', padding: '16px 0' }}>
        {!reportHasMore && reportList.length > 0 && (
          <span style={{ color: 'var(--ant-color-text-description)' }}>没有更多数据了（共 {total} 条）</span>
        )}
      </div>

      {/* 报告详情 Drawer */}
      <Drawer
        title="报告详情"
        placement="right"
        size={800}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {currentReport && (
          <div className={styles.markdownContainer}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentReport.content || '暂无内容'}</ReactMarkdown>
          </div>
        )}
      </Drawer>

      {/* 隐藏的 Image 组件，用于触发图片预览 */}
      <Image
        style={{ display: 'none' }}
        src={previewImgUrl}
        preview={{
          open: previewVisible,
          onOpenChange: (visible) => setPreviewVisible(visible),
        }}
      />
    </div>
  );
};

export default memo(Reports);
