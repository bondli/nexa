import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { getLoginData, clearLoginData, UserInfo } from '../../services/utils';
import LoginForm from './LoginForm';
import CollectorContent from './CollectorContent';
import ImageCollector from './ImageCollector';

// 存储 key
const ALLOWED_DOMAINS_KEY = 'allowedDomains';

// 检查域名是否在允许列表
const isDomainAllowed = async (): Promise<boolean> => {
  const result = await chrome.storage.local.get(ALLOWED_DOMAINS_KEY);
  const allowedDomains = (result[ALLOWED_DOMAINS_KEY] || '') as string;

  if (!allowedDomains.trim()) {
    return false;
  }

  const currentHost = window.location.hostname;
  const domainList = allowedDomains.split('\n').map(d => d.trim()).filter(d => d);

  for (const domain of domainList) {
    if (domain === currentHost) return true;
    if (domain.startsWith('*.') && currentHost.endsWith(domain.slice(1))) return true;
  }

  return false;
};

export const CollectorPanelApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [checkLoading, setCheckLoading] = useState(true);
  const [domainAllowed, setDomainAllowed] = useState(false);

  useEffect(() => {
    const initCheck = async () => {
      const allowed = await isDomainAllowed();
      setDomainAllowed(allowed);

      const loginData = await getLoginData();
      if (loginData && loginData.id) {
        setIsLoggedIn(true);
        setUser(loginData);
      }
      setCheckLoading(false);
    };
    initCheck();
  }, []);

  const handleLoginSuccess = (userInfo: UserInfo) => {
    setIsLoggedIn(true);
    setUser(userInfo);
  };

  const handleLogout = async () => {
    await clearLoginData();
    setIsLoggedIn(false);
    setUser(null);
  };

  // 域名未授权且检查完毕，不渲染任何内容
  if (!domainAllowed && !checkLoading) {
    return null;
  }

  return (
    <div id="nexa-collector-app">
      {/* 图片收藏功能 - 全局生效 */}
      {user && <ImageCollector user={user} />}

      {/* 悬浮球（面板关闭时显示） */}
      {!isOpen && (
        <div
          className="nexa-floating-ball"
          onClick={() => setIsOpen(true)}
          title="打开 Nexa 采集面板"
        >
          <svg viewBox="0 0 24 24">
            <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
          </svg>
        </div>
      )}

      {/* 采集面板（面板打开时显示） */}
      {isOpen && (
        <div className="nexa-collector-panel">
          <div className="nexa-panel-header">
            <span className="nexa-panel-title">Nexa 采集</span>
            <button
              className="nexa-panel-close"
              onClick={() => setIsOpen(false)}
              title="关闭"
            >
              ×
            </button>
          </div>
          <div className="nexa-panel-content">
            {checkLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Spin size="large" />
              </div>
            ) : !isLoggedIn ? (
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            ) : user ? (
              <CollectorContent user={user} onLogout={handleLogout} onClose={() => setIsOpen(false)} />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectorPanelApp;
