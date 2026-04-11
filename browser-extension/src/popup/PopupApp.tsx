import { useState, useEffect } from 'react';
import { Input, Button, message, Typography } from 'antd';
import { SaveOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

// 存储 key
const ALLOWED_DOMAINS_KEY = 'allowedDomains';

const PopupApp = () => {
  const [domains, setDomains] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  // 加载保存的域名列表
  useEffect(() => {
    const loadDomains = async () => {
      const result = await chrome.storage.local.get(ALLOWED_DOMAINS_KEY);
      const savedDomains = result[ALLOWED_DOMAINS_KEY] || '';
      setDomains(savedDomains);
    };
    loadDomains();
  }, []);

  // 保存域名配置
  const handleSave = async () => {
    setSaving(true);
    try {
      // 清理输入：去除首尾空白，过滤空行
      const cleanedDomains = domains
        .split('\n')
        .map(d => d.trim())
        .filter(d => d.length > 0)
        .join('\n');

      await chrome.storage.local.set({ [ALLOWED_DOMAINS_KEY]: cleanedDomains });
      setSaved(true);
      message.success('域名配置已保存');

      // 通知所有标签页刷新域名配置
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.reload(tab.id);
        }
      }

      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (error) {
      console.error('保存域名配置失败:', error);
      message.error('保存失败，请重试');
    }
    setSaving(false);
  };

  return (
    <div style={{ padding: '16px', width: '320px' }}>
      <div style={{ marginBottom: '12px' }}>
        <Text strong style={{ fontSize: '14px' }}>允许采集的域名</Text>
        <Text type="secondary" style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>
          在这些域名页面右侧会显示悬浮球，一行一个域名
        </Text>
      </div>

      <TextArea
        value={domains}
        onChange={(e) => setDomains(e.target.value)}
        placeholder="example.com&#10;blog.example.com&#10;*.github.io"
        rows={8}
        style={{ fontSize: '13px', fontFamily: 'monospace' }}
      />

      <Button
        type="primary"
        icon={saved ? <CheckCircleOutlined /> : <SaveOutlined />}
        onClick={handleSave}
        loading={saving}
        block
        style={{ marginTop: '12px' }}
      >
        {saved ? '已保存' : '保存配置'}
      </Button>

      <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          <CheckCircleOutlined style={{ marginRight: '4px' }} />
          支持精确域名如 <Text code>example.com</Text>
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: '12px' }}>
          支持通配符如 <Text code>*.github.io</Text>（仅支持前缀通配符）
        </Text>
      </div>
    </div>
  );
};

export default PopupApp;