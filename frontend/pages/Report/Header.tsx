import React, { memo, useContext, useState } from 'react';
import { Button, Dropdown, Modal, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { ReportContext, ReportType } from './context';
import styles from './index.module.less';

const Header: React.FC = () => {
  const { message: antdMessage } = App.useApp();
  const { currentCate, generateReport, setReportCounts } = useContext(ReportContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');

  // 新增报告下拉菜单
  const menuItems = [
    {
      key: 'daily',
      label: '写日报',
      onClick: () => handleGenerateReport('daily'),
    },
    {
      key: 'monthly',
      label: '写月报',
      onClick: () => handleGenerateReport('monthly'),
    },
  ];

  // 生成报告
  const handleGenerateReport = async (reportType: ReportType) => {
    setModalVisible(true);
    setGenerating(true);
    setGeneratedContent('');

    try {
      const report = await generateReport(reportType);
      if (report) {
        setGeneratedContent(report.content || report.summary || '');
        // 更新计数
        if (reportType === 'daily') {
          setReportCounts((prev) => ({ ...prev, daily: prev.daily + 1, all: prev.all + 1 }));
        } else {
          setReportCounts((prev) => ({ ...prev, monthly: prev.monthly + 1, all: prev.all + 1 }));
        }
        antdMessage.success(`${reportType === 'daily' ? '日报' : '月报'}生成成功`);
      } else {
        antdMessage.error('生成报告失败，请重试');
        setModalVisible(false);
      }
    } catch (error) {
      console.error('生成报告失败:', error);
      antdMessage.error('生成报告失败，请重试');
      setModalVisible(false);
    } finally {
      setGenerating(false);
    }
  };

  // Modal关闭后的回调
  const handleModalAfterClose = () => {
    setGeneratedContent('');
    setGenerating(false);
  };

  // 获取当前分类名称
  const getCateName = () => {
    return currentCate.name || '全部报告';
  };

  // Modal footer 按钮
  const modalFooter = generating ? null : (
    <Button key="close" onClick={() => setModalVisible(false)}>
      关闭
    </Button>
  );

  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerLeft}>
        <span className={styles.cateName}>{getCateName()}</span>
      </div>
      <div className={styles.headerRight}>
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <Button type="primary" icon={<PlusOutlined />} size="small">
            新增报告
          </Button>
        </Dropdown>
      </div>

      <Modal
        title={generating ? '正在生成报告...' : '报告预览'}
        open={modalVisible}
        onCancel={() => !generating && setModalVisible(false)}
        footer={modalFooter}
        width={800}
        afterClose={handleModalAfterClose}
      >
        {generating && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p>正在基于您的笔记和文章生成报告，请稍候...</p>
          </div>
        )}

        {!generating && generatedContent && (
          <div className={styles.markdownContainer}>
            <ReactMarkdown>{generatedContent}</ReactMarkdown>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default memo(Header);
