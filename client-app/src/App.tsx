import { useEffect, useState, useContext, useRef } from 'react';
import { View, DevSettings, DeviceEventEmitter } from 'react-native';
import { Provider, ActivityIndicator, Modal, Toast } from '@ant-design/react-native';

import { checkUserInfo, checkPendingShareUrl } from '@commons/utils';
import ArticleService from '@services/ArticleService';

import MainPage from '@pages/Main';
import UserPage from '@pages/User';

import { MainContext, MainProvider } from '@/commons/context';

const AppContent = () => {
  Toast.config({ duration: 1 }); // 全局设置toast显示1s
  const { userInfo, setUserInfo, isDBConnected, shareParams, setShareParams } = useContext(MainContext);
  const [loading, setLoading] = useState(true);
  const isDBConnectedRef = useRef(isDBConnected);
  const shareParamsRef = useRef(shareParams);

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

  // shareParams 有值时弹出 prompt 让用户输入标题保存
  useEffect(() => {
    if (!shareParams?.url) return;
    shareParamsRef.current = shareParams;
    // 延迟弹出，确保 Provider/渲染树完全挂载后再显示 Modal
    const timer = setTimeout(() => {
      console.log('showPrompt shareParams:', shareParamsRef.current);
      Modal.prompt(
        '保存文章',
        `请输入文章标题\n${shareParamsRef.current?.url}`,
        async (inputTitle: string) => {
          const current = shareParamsRef.current;
          if (!current?.url) return;
          try {
            await ArticleService.shareToTempArticle(
              (inputTitle || '').trim() || current.url,
              current.url,
              userInfo?.id ?? 1,
            );
            Toast.success('保存成功');
          } catch (error) {
            console.error('保存临时文章失败:', error);
            Toast.fail('保存失败，请重试');
          } finally {
            setShareParams(null);
          }
        },
        'default',
        shareParamsRef.current?.title || '',
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [shareParams?.url]);

  // 监听热启动事件：App 在后台被微信唤起时，Native 通过 DeviceEventEmitter 通知 RN
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('onPendingShareUrl', async () => {
      console.log('Received onPendingShareUrl event from Native (hot start)');
      const data = await checkPendingShareUrl();
      if (data?.url) {
        setShareParams(data);
      }
    });
    return () => subscription.remove();
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