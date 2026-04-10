import { useState, useEffect } from 'react';
import { Button, Spin, message } from 'antd';
import { ScissorOutlined } from '@ant-design/icons';
import LoginForm from './components/LoginForm';
import { isLoggedIn } from '../services/utils';

const PopupApp = () => {
  const [isLoggedInState, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // 检查登录状态
  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await isLoggedIn();
      setIsLoggedIn(loggedIn);
      setLoading(false);
    };
    checkAuth();
  }, []);

  // 打开页面左侧的采集面板
  const handleOpenPanel = async () => {
    try {
      // 通过 background script 注入并打开面板
      const response = await chrome.runtime.sendMessage({ action: 'openCollectorPanel' });
      if (response?.success) {
        window.close();
      } else {
        alert(response?.error || '打开面板失败')
        message.error(response?.error || '打开面板失败');
      }
    } catch (error) {
      alert( error);
      console.error('打开面板失败:', error);
      message.error('打开采集面板失败');
    }
  };

  // 处理登录成功
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    message.success('登录成功，请点击"打开采集面板"');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!isLoggedInState) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ padding: '16px', textAlign: 'center' }}>
      <Button
        type="primary"
        icon={<ScissorOutlined />}
        onClick={handleOpenPanel}
        size="large"
        block
      >
        打开采集面板
      </Button>
      <p style={{ marginTop: '12px', color: '#666', fontSize: '12px' }}>
        点击后页面出现采集面板
      </p>
    </div>
  );
};

export default PopupApp;