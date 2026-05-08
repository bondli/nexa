import React, { useState, useEffect } from 'react';
import { Button, Spin, App as AntdApp } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import request from '../../../services/request';
import { getUserId } from '../../../services/utils';

interface Step2SummarizeProps {
  content: string;
  alreadySummary?: string;
  onComplete: (summary: string) => void;
}

const Step2Summarize: React.FC<Step2SummarizeProps> = ({
  content,
  alreadySummary,
  onComplete,
}) => {
  const { message } = AntdApp.useApp();
  const [summary, setSummary] = useState(alreadySummary || '');
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    // 自动触发总结
    if (content && !summary) {
      handleSummarize();
    }
  }, [content]);

  const handleSummarize = async () => {
    if (!content) {
      message.warning('没有内容可总结');
      return;
    }

    setSummarizing(true);
    setLoading(true);
    try {
      const userId = await getUserId();

      // 调用总结接口
      const response = await request.post<any>('/article/summarize-content', {
        content,
      }, {
        headers: { 'X-User-Id': String(userId) },
      });

      const resData = response.data;
      if (resData.code === 0) {
        setSummary(resData.data?.summary || '');
        message.success('总结完成');
      } else {
        message.error(resData.message || '总结失败');
      }
    } catch (error) {
      console.error('总结失败:', error);
      message.error('总结失败，请重试');
    } finally {
      setSummarizing(false);
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!summary.trim()) {
      message.warning('请先完成总结');
      return;
    }
    onComplete(summary);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 6 }}>AI 总结内容</div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" description="正在生成总结..." />
          </div>
        ) : (
          <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '16px', border: '1px solid #f0f0f0' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handleSummarize} loading={summarizing} disabled={loading}>
          {summarizing ? '总结中...' : '重新总结'}
        </Button>
        <Button
          type="primary"
          onClick={handleNext}
          disabled={!summary.trim() || loading}
        >
          下一步
          <RightOutlined />
        </Button>
      </div>
    </div>
  );
};

export default Step2Summarize;
