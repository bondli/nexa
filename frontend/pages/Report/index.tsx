import React, { memo, useContext, useEffect } from 'react';
import { Layout, App } from 'antd';
import { ReportContext, ReportProvider } from './context';
import Category from './Category';
import Header from './Header';
import Reports from './Reports';
import style from './index.module.less';

const { Sider, Content } = Layout;

const ReportPage: React.FC = () => {
  const { getReportList, currentCate, checkReportReminder, reminderData } = useContext(ReportContext);
  const { modal } = App.useApp();

  // 页面加载时检查报告提醒
  useEffect(() => {
    checkReportReminder();
  }, []);

  // 监听 reminderData 变化，弹出提醒 Modal
  useEffect(() => {
    if (!reminderData) return;

    const messages: string[] = [];
    if (reminderData.needDailyReport) {
      messages.push(`您还没有写 ${reminderData.yesterdayDate} 的日报`);
    }
    if (reminderData.needMonthlyReport && reminderData.lastMonth) {
      messages.push(`您还没有写 ${reminderData.lastMonth} 的月报`);
    }

    if (messages.length > 0) {
      modal.info({
        title: '报告提醒',
        content: (
          <div>
            {messages.map((msg, index) => (
              <p key={index} style={{ margin: '8px 0' }}>
                {msg}
              </p>
            ))}
          </div>
        ),
        okText: '知道了',
      });
    }
  }, [reminderData]);

  useEffect(() => {
    getReportList();
  }, [currentCate]);

  return (
    <Layout className={style.container}>
      <Sider trigger={null} collapsible theme={'light'} width={260} className={style.sider}>
        <Category />
      </Sider>
      <Layout>
        <Content className={style.content}>
          <Header />
          <div className={style.ReportContent}>
            <Reports />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

const ReportPageContainer: React.FC = () => {
  return (
    <ReportProvider>
      <ReportPage />
    </ReportProvider>
  );
};

export default memo(ReportPageContainer);
