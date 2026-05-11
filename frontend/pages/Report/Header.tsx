import React, { memo, useContext, useState } from 'react';
import { Button, Dropdown, Modal, Spin, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ReportContext, ReportType } from './context';
import style from './index.module.less';
import MarkdownPreview from '@/components/MarkdownPreview';

const Header: React.FC = () => {
  const { message: antdMessage } = App.useApp();
  const { currentCate, generateReport } = useContext(ReportContext);

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
    <div className={style.headerContainer}>
      <div className={style.headerLeft}>
        <span className={style.cateName}>{getCateName()}</span>
      </div>
      <div className={style.headerRight}>
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
          <div className={style.loadingContainer}>
            <Spin size="large" />
            <p className={style.loadingText}>正在基于您的笔记和文章生成报告，请稍候...</p>
          </div>
        )}

        {!generating && generatedContent && <MarkdownPreview content={generatedContent} />}
      </Modal>
    </div>
  );
};

export default memo(Header);
