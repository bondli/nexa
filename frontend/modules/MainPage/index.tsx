import React, { memo, useContext, useState } from 'react';
import { App, Layout } from 'antd';
import {
  AliwangwangOutlined,
  SnippetsOutlined,
  HddOutlined,
  UserSwitchOutlined,
  FileImageOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import { MainContext } from '@commons/context';
import { deleteStore } from '@commons/electron';
import User from '@components/User';
import Logo from '@components/Logo';
import Setting from '@components/Setting';
import ChatBox from '@pages/ChatBox';
import NoteBook from '@pages/NoteBook';
import Knowledge from '@pages/Knowledge';
import Picture from '@pages/Picture';
import Article from '@pages/Article';
import style from './index.module.less';

const { Sider, Content } = Layout;

const MainPage: React.FC = () => {
  const { message } = App.useApp();

  const { userInfo, setUserInfo } = useContext(MainContext);
  const [currentPage, setCurrentPage] = useState<string>('chat'); // 默认页面

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
          <Logo mode={'dark'} title={'NEXA'} hiddenText={true} />
        </div>

        <div className={style.list}>
          <div className={style.menu}>
            <div
              className={`${style.iconItem} ${currentPage === 'chat' ? style.active : ''}`}
              onClick={() => setCurrentPage('chat')}
            >
              <AliwangwangOutlined style={{ fontSize: 24 }} />
            </div>
            <div
              className={`${style.iconItem} ${currentPage === 'notebook' ? style.active : ''}`}
              onClick={() => setCurrentPage('notebook')}
            >
              <SnippetsOutlined style={{ fontSize: 24 }} />
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
              className={`${style.iconItem} ${currentPage === 'openclaw' ? style.active : ''}`}
              onClick={() => setCurrentPage('openclaw')}
            >
              <UserSwitchOutlined style={{ fontSize: 24 }} />
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
          {currentPage === 'chat' && <ChatBox />}
          {currentPage === 'notebook' && <NoteBook />}
          {currentPage === 'article' && <Article />}
          {currentPage === 'knowledge' && <Knowledge />}
          {currentPage === 'picture' && <Picture />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default memo(MainPage);
