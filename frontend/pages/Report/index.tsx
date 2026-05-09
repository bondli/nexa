import React, { memo, useContext, useEffect } from 'react';
import { Layout } from 'antd';
import { ReportContext, ReportProvider } from './context';
import Category from './Category';
import Header from './Header';
import Reports from './Reports';
import style from './index.module.less';

const { Sider, Content } = Layout;

const ReportPage: React.FC = () => {
  const { getReportList, getTrashList, currentCate } = useContext(ReportContext);

  useEffect(() => {
    if (currentCate?.id === -1) {
      getTrashList();
    } else {
      getReportList();
    }
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
