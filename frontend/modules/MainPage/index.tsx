import React, { memo, useContext, useState } from 'react';
import { App, Layout, Button, Space } from 'antd';
import { WechatFilled, FileTextFilled, FolderOpenFilled } from '@ant-design/icons';
import { MainContext } from '@commons/context';
import { deleteStore } from '@commons/electron';
import User from '@components/User';
import Logo from '@components/Logo';
import ChatBox from '@pages/ChatBox';
import NoteBook from '@pages/NoteBook';
import Knowledge from '@pages/Knowledge';
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
            <div className={style.iconItem} onClick={() => setCurrentPage('chat')}>
              <WechatFilled style={{ fontSize: 24 }} />
            </div>
            <div className={style.iconItem}>
              <FileTextFilled style={{ fontSize: 24 }} onClick={() => setCurrentPage('notebook')} />
            </div>
            <div className={style.iconItem}>
              <FolderOpenFilled style={{ fontSize: 24 }} onClick={() => setCurrentPage('knowledge')} />
            </div>
          </div>
        </div>

        {/* 用户信息 */}
        <div className={style.user}>
          <User info={userInfo} onLogout={onLogout} hiddenText={true} />
        </div>
      </Sider>

      <Layout>
        <Content className={style.content}>
          {currentPage === 'chat' && <ChatBox />}
          {currentPage === 'notebook' && <NoteBook />}
          {currentPage === 'knowledge' && <Knowledge />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default memo(MainPage);
