import React, { useState } from 'react';
import { Button, App as AntdApp } from 'antd';
import { ScissorOutlined } from '@ant-design/icons';

import { extractPageContent } from '../../services/contentExtractor';

interface CollectorContentProps {
  onCollected: (result: any) => void;
}

const CollectorContent: React.FC<CollectorContentProps> = ({ onCollected }) => {
  const { message } = AntdApp.useApp();
  
  const [extracting, setExtracting] = useState(false);

  const handleExtract = () => {
    setExtracting(true);
    try {
      const result = extractPageContent();
      if (result.success) {
        message.success('内容提取成功');
        // 提取成功后关闭面板，打开3步Modal
        onCollected({
          content: result.content || '',
          title: result.title || '未命名',
          url: result.url || '',
        });
      } else {
        message.error(result.message || '提取失败，请稍后重试');
      }
    } catch {
      message.error('提取失败，请稍后重试');
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <Button
        type="primary"
        icon={<ScissorOutlined />}
        onClick={handleExtract}
        loading={extracting}
        block
        size="large"
      >
        {extracting ? '提取中...' : '一键提取'}
      </Button>
    </div>
  );
};

export default CollectorContent;
