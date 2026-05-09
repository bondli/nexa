import React, { useState, useEffect } from 'react';
import { Spin, Button, App as AntdApp } from 'antd';
import { getCategories, saveArticle, ArticleData, Category } from '../../services/article';
import { getLoginData, clearLoginData, UserInfo } from '../../services/utils';
import LoginForm from './LoginForm';
import CollectorContent from './CollectorContent';
import ArticleCollectModal from './ArticleCollectModal';
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
  const domainList = allowedDomains
    .split('\n')
    .map((d) => d.trim())
    .filter((d) => d);

  for (const domain of domainList) {
    if (domain === currentHost) return true;
    if (domain.startsWith('*.') && currentHost.endsWith(domain.slice(1))) return true;
  }

  return false;
};

export const CollectorPanelApp: React.FC = () => {
  const { message } = AntdApp.useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [checkLoading, setCheckLoading] = useState(true);
  const [domainAllowed, setDomainAllowed] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // 文章相关
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
      // 默认选择第一个分类
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].id);
      }
    } catch {
      console.error('加载分类失败');
    }
  };

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
    loadCategories();
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

  // 收藏成功后的处理逻辑
  const handleCollected = (result: any) => {
    const { title, content, url } = result;
    setTitle(title);
    setContent(content);
    setUrl(url);
    loadCategories();
    setIsOpen(false);
    setShowModal(true);
  };

  // 最终保存
  const handleModalSave = async (data: {
    title: string;
    desc: string;
    url: string;
    cateId: number;
    summary: string;
    image: string;
  }) => {
    try {
      const noteData: ArticleData = {
        title: data.title || '未命名',
        desc: data.desc,
        url: data.url,
        cateId: data.cateId,
        summary: data.summary,
        image: data.image,
      };
      const result = await saveArticle(noteData);
      if (result.success) {
        message.success('保存成功');
        setShowModal(false);
      } else {
        message.error(result.message || '保存失败');
      }
    } catch {
      message.error('保存失败');
    }
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
        <div className="nexa-floating-ball" onClick={() => setIsOpen(true)} title="打开 Nexa 采集面板">
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

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '13px' }}>欢迎，{user.name}</span>
              <Button type="text" size="small" onClick={handleLogout} style={{ color: '#fff' }}>
                退出
              </Button>
              <Button type="text" size="small" onClick={() => setIsOpen(false)} style={{ color: '#fff' }}>
                关闭
              </Button>
            </div>
          </div>
          <div className="nexa-panel-content">
            {checkLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Spin size="large" />
              </div>
            ) : !isLoggedIn ? (
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            ) : user ? (
              <CollectorContent onCollected={handleCollected} />
            ) : null}
          </div>
        </div>
      )}

      <ArticleCollectModal
        open={showModal}
        onClose={() => setShowModal(false)}
        initialData={{ title, content, url }}
        selectedCategory={selectedCategory || 0}
        categories={categories}
        onSave={handleModalSave}
      />
    </div>
  );
};

export default CollectorPanelApp;
