import React, { memo, useState, useEffect, useContext } from 'react';
import { Drawer, Layout } from 'antd';
import { KnowledgeContext, KnowledgeProvider } from './context';
import KnowBase from './KnowBase';
import Header from './Header';
import Documents from './Documents';
import Detail from './Detail';
import style from './index.module.less';

const { Sider, Content } = Layout;

const Knowledge: React.FC = () => {
  const { selectedDocument, setSelectedDocument, getDocumentList, currentKnowledge } = useContext(KnowledgeContext);

  const [showDetailModal, setShowDetailModal] = useState(false);

  // 关闭文档详情
  const closeDetail = () => {
    setShowDetailModal(false);
    if (currentKnowledge) {
      getDocumentList(currentKnowledge.id as number);
    }
  };

  // Drawer 完全关闭后再清空，避免关闭动画过程中 Detail 组件报错
  const handleDrawerAfterOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedDocument(null);
    }
  };

  // 展示/关闭 文档详情
  useEffect(() => {
    if (selectedDocument) {
      setShowDetailModal(true);
    }
  }, [selectedDocument]);

  return (
    <>
      <Layout>
        <Sider trigger={null} collapsible theme={'light'} width={260} className={style.sider}>
          <KnowBase />
        </Sider>
        <Layout>
          <Content className={style.content}>
            <Header />
            <Documents />
          </Content>
        </Layout>
      </Layout>

      <Drawer
        title={`文档详情`}
        open={showDetailModal}
        size={800}
        styles={{ body: { padding: 0 } }}
        destroyOnHidden={true}
        onClose={closeDetail}
        afterOpenChange={handleDrawerAfterOpenChange}
      >
        <Detail selectedDocument={selectedDocument} />
      </Drawer>
    </>
  );
};

const KnowledgeContainer: React.FC = () => {
  return (
    <KnowledgeProvider>
      <Knowledge />
    </KnowledgeProvider>
  );
};

export default memo(KnowledgeContainer);
