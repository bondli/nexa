import { useEffect, useState, useContext, useRef } from 'react';
import { View, DevSettings } from 'react-native';
import { Provider, ActivityIndicator, Modal, Toast } from '@ant-design/react-native';

import { checkUserInfo, checkPendingShareUrl } from '@commons/utils';
import Popup from '@/components/Popup';
import Share from '@/components/Share';

import MainPage from '@pages/Main';
import UserPage from '@pages/User';

import { MainContext, MainProvider } from '@/commons/context';

const AppContent = () => {
  Toast.config({ duration: 1 }); // 全局设置toast显示1s
  const { userInfo, setUserInfo, isDBConnected, shareParams, setShareParams } = useContext(MainContext);
  const [loading, setLoading] = useState(true);
  const isDBConnectedRef = useRef(isDBConnected);

  // 更新ref的值当isDBConnected变化时
  useEffect(() => {
    isDBConnectedRef.current = isDBConnected;
    if (isDBConnected) {
      setLoading(false);
      checkPendingShareUrl().then((data) => {
        data?.url && setShareParams(data);
      });
    }
  }, [isDBConnected]);

  useEffect(() => {
    console.log('RN App mounted');

    checkUserInfo().then((info) => {
      info?.id && setUserInfo(info);
    });

    // 5秒之后还是没有连上数据库，说明网络差，给出提示，刷新既可
    const timeoutId = setTimeout(() => {
      if (!isDBConnectedRef.current) {
        Modal.alert(
          '提示',
          '网络差，请检查网络连接',
          [
            { text: '重试', onPress: () => DevSettings.reload() },
          ]
        );
      }
    }, 5000);

    // 清理函数
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // 处理关闭分享页面
  const handleCloseShare = () => {
    setShareParams(null);
  };

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
      <Popup
        visible={!!shareParams?.url}
        onClose={handleCloseShare}
        content={shareParams?.url ? <Share navigationParams={shareParams} onClose={handleCloseShare} /> : null}
        showCloseBtn={true}
      />
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