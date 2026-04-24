import React, { useState, useEffect, useContext } from 'react';
import { userLog, getStore } from '@commons/electron';
import { MainContext } from '@commons/context';
import ThemeProvider from '@components/ThemeProvider';
import BootPage from './modules/BootPage';
import UserPage from '@/modules/UserPage';
import MainPage from '@/modules/MainPage';

import './styles/global.less';

const AppContainer: React.FC = () => {
  const { appInited, setAppInited, userInfo, setUserInfo } = useContext(MainContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 判断系统是否完成初始化
    const bootstrapData = getStore('bootstrapData') || {};
    userLog('[Client] app installed:', bootstrapData);
    if (bootstrapData?.installed) {
      setAppInited(true);
    }
    // 判断用户是否完成登录
    const loginData = getStore('loginData') || {};
    userLog('[Client] app startup:', loginData);
    const { id, name } = loginData;
    if (id && name) {
      setUserInfo(loginData);
    }
    setLoading(false);
  }, []);

  // 避免一进来还在获取本地缓存数据的时候显示了登录的问题
  if (loading) {
    return <div style={{ color: '#eee', fontSize: '24px' }}>loading...</div>;
  }

  // 判断是否初始化，没有初始化则定位到安装页面
  if (!appInited) {
    return <BootPage />;
  }

  // 判断是否登录，没有登录则定位到登录页面
  if (!userInfo || !userInfo.id) {
    return <UserPage />;
  }

  return (
    <ThemeProvider>
      <MainPage />
    </ThemeProvider>
  );
};

export default AppContainer;
