import React, { createContext, useState } from 'react';
import { AppInited, UserInfo } from '@commons/constant';

type MainContextType = {
  appInited: AppInited;
  setAppInited: React.Dispatch<React.SetStateAction<boolean>>;
  userInfo: UserInfo;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>;
};

export const MainContext = createContext<MainContextType | undefined>(undefined);
export const MainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appInited, setAppInited] = useState<AppInited>(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: 0,
    name: '',
    avatar: '',
  });

  return (
    <MainContext.Provider
      value={{
        appInited,
        setAppInited,
        userInfo,
        setUserInfo,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};
