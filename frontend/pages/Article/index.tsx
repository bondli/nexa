import React, { memo, useState, useEffect, useContext } from 'react';
import { Drawer, Layout } from 'antd';
import { ArticleContext, ArticleProvider } from './context';
import Category from './Category';
import Header from './Header';
import Articles from './Articles';
import Detail from './Detail';
import style from './index.module.less';

const { Sider, Content } = Layout;

const ArticlePage: React.FC = () => {
  const { getArticleList, selectedArticle, setSelectedArticle, getTempArticleList, isTempCategory } =
    useContext(ArticleContext);

  const [showDetailModal, setShowDetailModal] = useState(false);

  // 关闭文章详情
  const closeDetail = () => {
    setShowDetailModal(false);
    if (isTempCategory) {
      getTempArticleList();
    } else {
      getArticleList();
    }
  };

  // Drawer 完全关闭后再清空，避免关闭动画过程中 Detail 组件报错
  const handleDrawerAfterOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedArticle(null);
    }
  };

  // 展示/关闭 文章详情
  useEffect(() => {
    if (selectedArticle) {
      setShowDetailModal(true);
    }
  }, [selectedArticle]);

  return (
    <>
      <Layout>
        <Sider trigger={null} collapsible theme={'light'} width={260} className={style.sider}>
          <Category />
        </Sider>
        <Layout>
          <Content className={style.content}>
            <Header />
            <Articles />
          </Content>
        </Layout>
      </Layout>

      <Drawer
        title={`文章详情`}
        open={showDetailModal}
        size={800}
        styles={{ body: { padding: 0 } }}
        destroyOnHidden={true}
        onClose={closeDetail}
        afterOpenChange={handleDrawerAfterOpenChange}
      >
        <Detail selectedArticle={selectedArticle} />
      </Drawer>
    </>
  );
};

const ArticleBookContainer: React.FC = () => {
  return (
    <ArticleProvider>
      <ArticlePage />
    </ArticleProvider>
  );
};

export default memo(ArticleBookContainer);
