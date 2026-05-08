import React, { useState } from 'react';
import { Button, Input, App as AntdApp } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { extractPageContent } from '../../../services/contentExtractor';

const { TextArea } = Input;

interface Step1CollectProps {
  initialTitle: string;
  initialContent: string;
  onComplete: (data: { title: string; content: string }) => void;
}

const Step1Collect: React.FC<Step1CollectProps> = ({
  initialTitle,
  initialContent,
  onComplete,
}) => {
  const { message } = AntdApp.useApp();
  const [title, setTitle] = useState(initialTitle || '');
  const [content, setContent] = useState(initialContent || '');
  const [extracting, setExtracting] = useState(false);

  const handleExtract = () => {
    setExtracting(true);
    try {
      const result = extractPageContent();
      if (result.success) {
        setContent(result.content || '');
        setTitle(result.title || '未命名');
        message.success('内容提取成功');
      } else {
        message.error(result.message || '提取失败');
      }
    } catch {
      message.error('提取失败');
    } finally {
      setExtracting(false);
    }
  };

  const handleNext = () => {
    if (!content.trim()) {
      message.warning('请先提取内容');
      return;
    }
    onComplete({ title, content });
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 6 }}>标题</div>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="文章标题"
          style={{ fontSize: 14 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 6 }}>内容（Markdown）</div>
        {
          content ? (
            <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '16px', border: '1px solid #f0f0f0' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          ) : (
            <TextArea
              value={`提取的文章内容将显示在这里`}
              disabled
              autoSize={{ minRows: 10, maxRows: 20 }}
              style={{ fontSize: 13, fontFamily: 'monospace', resize: 'vertical' }}
            />
          )
        }
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={handleExtract}
          loading={extracting}
          disabled={!!content.trim()}
        >
          {extracting ? '提取中...' : '重新提取'}
        </Button>
        <Button
          type="primary"
          onClick={handleNext}
          disabled={!content.trim()}
        >
          下一步
          <RightOutlined />
        </Button>
      </div>
    </div>
  );
};

export default Step1Collect;
