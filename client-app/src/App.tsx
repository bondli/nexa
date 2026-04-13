import { useEffect, useState, useContext, useRef } from 'react';
import { View, DevSettings } from 'react-native';
import { Provider, ActivityIndicator, Modal } from '@ant-design/react-native';

import { getStorage } from '@commons/utils';

import MainPage from '@pages/Main';
import UserPage from '@pages/User';

import { MainContext, MainProvider } from '@/commons/context';

const AppContent = () => {
  const { userInfo, setUserInfo, isDBConnected } = useContext(MainContext);
  const [loading, setLoading] = useState(true);
  const isDBConnectedRef = useRef(isDBConnected);

  // 更新ref的值当isDBConnected变化时
  useEffect(() => {
    isDBConnectedRef.current = isDBConnected;
  }, [isDBConnected]);

  // 检查登录态
  const checkUserInfo = async () => {
    try {
      const userInfo = await getStorage('userInfo');
      console.log('userInfo from cache:', userInfo);
      
      if (userInfo?.id) {
        setUserInfo(userInfo);
      }
    } catch (error) {
      console.error('get user info error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('RN App mounted');
    checkUserInfo();
    
    // 5秒之后还是没有连上数据库，说明网络差，给出提示，刷新既可
    const timeoutId = setTimeout(() => {
      if (!isDBConnectedRef.current) {
        Modal.alert(
          '提示',
          '网络差，请检查网络连接',
          [
            { text: '重试', onPress: () => DevSettings.reload() }, // 修改这里，使用DevSettings.reload()
          ]
        );
      }
    }, 5000);

    // 清理函数
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  if (loading || !isDBConnected) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size={`large`} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {userInfo?.id ? <MainPage /> : <UserPage />}
    </View>
  );
};

const App = () => {
  return (
    <Provider
      theme={{
        brand_primary: '#18181b',  // 品牌基础色 #18181b
        primary_button_fill: '#18181b',     // 按钮背景颜色 <Button type="primary">
      }}
    >
      <MainProvider>
        <AppContent />
      </MainProvider>
    </Provider>
  );
};

export default App;