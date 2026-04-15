import { useEffect, useState, useContext, useRef } from 'react';
import { View, DevSettings, Linking } from 'react-native';
import { Provider, ActivityIndicator, Modal } from '@ant-design/react-native';

import { getStorage } from '@commons/utils';

import MainPage from '@pages/Main';
import UserPage from '@pages/User';
import SharePage from '@/pages/Share';

import { MainContext, MainProvider } from '@/commons/context';

const AppContent = () => {
  const { userInfo, setUserInfo, isDBConnected, shareParams, setShareParams } = useContext(MainContext);
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

  // 解析 URL Scheme 参数
  const handleUrl = (url: string) => {
    console.log('Received URL:', url);
    try {
      // 解析 nexa://share/article?title=xxx&url=xxx 或 nexa://?title=xxx&url=xxx
      const parsed = new URL(url);
      // 检查是否是 nexa 协议
      if (parsed.protocol === 'nexa:') {
        // 获取参数：可能是 pathname=/share/article 或直接是 query string
        const title = parsed.searchParams.get('title') || '';
        const urlParam = parsed.searchParams.get('url') || '';
        if (urlParam) {
          setShareParams({ title, url: urlParam });
        }
      }
    } catch (error) {
      console.error('Failed to parse URL:', error);
    }
  };

  useEffect(() => {
    console.log('RN App mounted');
    checkUserInfo();

    // 监听 URL Scheme
    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    // 检查初始 URL（App 启动时从后台拉起的情况）
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl(url);
      }
    }).catch((err) => console.error('Failed to get initial URL:', err));

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
      subscription.remove();
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

  // 如果有分享参数，显示分享接收页面
  if (shareParams?.url) {
    return <SharePage navigationParams={shareParams} onClose={handleCloseShare} />;
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