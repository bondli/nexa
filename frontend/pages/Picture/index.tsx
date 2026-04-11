import React, { memo, useContext, useEffect } from 'react';
import { Layout } from 'antd';
import { PictureContext, PictureProvider } from './context';
import Category from './Category';
import Header from './Header';
import PictureList from './PictureList';
import style from './index.module.less';

const { Sider, Content } = Layout;

const PicturePage: React.FC = () => {
  const { getPictureList, getTrashList, currentCate } = useContext(PictureContext);

  useEffect(() => {
    if (currentCate?.id === -1) {
      getTrashList();
    } else {
      getPictureList();
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
          <div className={style.pictureContent}>
            <PictureList />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

const PicturePageContainer: React.FC = () => {
  return (
    <PictureProvider>
      <PicturePage />
    </PictureProvider>
  );
};

export default memo(PicturePageContainer);
