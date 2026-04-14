import React, { createContext, useState, useEffect } from 'react';

import DatabaseService from '@/services/DataBaseService';
import { DB_CONFIG } from '@commons/constants';

type UserInfo = {
  id: number;
  name: string;
};

type MainContextType = {
  userInfo: UserInfo;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>;
  currentPage: string;
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
  dbService: typeof DatabaseService;
  isDBConnected: boolean;
};

const defaultContext: MainContextType = {
  userInfo: {
    id: 0,
    name: '',
  },
  setUserInfo: () => {},
  currentPage: 'Note',
  setCurrentPage: () => {},
  dbService: DatabaseService,
  isDBConnected: false,
};

export const MainContext = createContext<MainContextType>(defaultContext);

export const MainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: 0,
    name: '',
  });
  const [currentPage, setCurrentPage] = useState('Note');
  const [isDBConnected, setIsDBConnected] = useState(false);

  const initDatabase = async () => {
    try {
      console.log('开始初始化数据库连接...');
      
      const connected = await DatabaseService.connect(DB_CONFIG);
      setIsDBConnected(connected);
      if (connected) {
        console.log('数据库连接成功');
      } else {
        console.error('数据库连接失败');
      }
    } catch (error) {
      console.error('数据库初始化错误:', error);
      setIsDBConnected(false);
    }
  };

  useEffect(() => {
    // 延迟初始化数据库，给应用一些启动时间
    const timer = setTimeout(() => {
      initDatabase();
    }, 1000);

    // 组件卸载时断开数据库连接
    return () => {
      clearTimeout(timer);
      DatabaseService.disconnect();
    };
  }, []);

  return (
    <MainContext.Provider
      value={{
        userInfo,
        setUserInfo,
        currentPage,
        setCurrentPage,
        dbService: DatabaseService,
        isDBConnected,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};