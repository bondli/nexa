import React, { memo, useContext, useState, Suspense, lazy } from 'react';
import { App, Layout } from 'antd';
import {
  AliwangwangOutlined,
  SnippetsOutlined,
  HddOutlined,
  TeamOutlined,
  FileImageOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import { MainContext } from '@commons/context';
import { deleteStore } from '@commons/electron';
import User from '@components/User';
import Logo from '@components/Logo';
import Setting from '@components/Setting';
import style from './index.module.less';

// 懒加载各页面，Vite 自动拆分 chunk，减少首屏 JS 体积
const ChatBox = lazy(() => import('@pages/ChatBox'));
const NoteBook = lazy(() => import('@pages/NoteBook'));
const Knowledge = lazy(() => import('@pages/Knowledge'));
const Picture = lazy(() => import('@pages/Picture'));
const Article = lazy(() => import('@pages/Article'));
const Report = lazy(() => import('@pages/Report'));

const { Sider, Content } = Layout;

const MainPage: React.FC = () => {
  const { message } = App.useApp();

  const { userInfo, setUserInfo } = useContext(MainContext);
  const [currentPage, setCurrentPage] = useState<string>('notebook'); // 默认页面

  const onLogout = () => {
    deleteStore('loginData');
    message.success(`退出系统成功`);
    setUserInfo(null);
  };

  return (
    <Layout className={style.container}>
      <Sider trigger={null} collapsible theme={'light'} width={80} className={style.sider}>
        {/* logo */}
        <div className={style.logo}>
          <Logo title={'NEXA'} hiddenText={true} />
        </div>

        <div className={style.list}>
          <div className={style.menu}>
            <div
              className={`${style.iconItem} ${currentPage === 'notebook' ? style.active : ''}`}
              onClick={() => setCurrentPage('notebook')}
            >
              <SnippetsOutlined style={{ fontSize: 24 }} />
            </div>
            <div
              className={`${style.iconItem} ${currentPage === 'chat' ? style.active : ''}`}
              onClick={() => setCurrentPage('chat')}
            >
              <AliwangwangOutlined style={{ fontSize: 24 }} />
            </div>
            <div
              className={`${style.iconItem} ${currentPage === 'article' ? style.active : ''}`}
              onClick={() => setCurrentPage('article')}
            >
              <FilePdfOutlined style={{ fontSize: 24 }} />
            </div>
            <div
              className={`${style.iconItem} ${currentPage === 'picture' ? style.active : ''}`}
              onClick={() => setCurrentPage('picture')}
            >
              <FileImageOutlined style={{ fontSize: 24 }} />
            </div>
            <div
              className={`${style.iconItem} ${currentPage === 'knowledge' ? style.active : ''}`}
              onClick={() => setCurrentPage('knowledge')}
            >
              <HddOutlined style={{ fontSize: 24 }} />
            </div>
            <div
              className={`${style.iconItem} ${currentPage === 'report' ? style.active : ''}`}
              onClick={() => setCurrentPage('report')}
            >
              <TeamOutlined style={{ fontSize: 24 }} />
            </div>
          </div>
        </div>

        {/* 用户信息 */}
        <div className={style.user}>
          <Setting />
          <User info={userInfo} onLogout={onLogout} hiddenText={true} />
        </div>
      </Sider>

      <Layout>
        <Content className={style.content}>
          <Suspense fallback={null}>
            {currentPage === 'chat' && <ChatBox />}
            {currentPage === 'notebook' && <NoteBook />}
            {currentPage === 'article' && <Article />}
            {currentPage === 'knowledge' && <Knowledge />}
            {currentPage === 'picture' && <Picture />}
            {currentPage === 'report' && <Report />}
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
};

export default memo(MainPage);
