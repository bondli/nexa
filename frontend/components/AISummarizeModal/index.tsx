import React, { useState, useEffect } from 'react';
import { Drawer, Spin } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import request from '@commons/request';
import styles from './index.module.less';

type AISummarizeModalProps = {
  open: boolean;
  articleId?: number;
  onClose: () => void;
};

const AISummarizeModal: React.FC<AISummarizeModalProps> = (props) => {
  const { open, articleId, onClose } = props;
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 重置状态
  const resetState = () => {
    setLoading(false);
    setContent('');
    setError(null);
  };

  // 关闭时重置状态
  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);

  // 开始获取AI总结
  useEffect(() => {
    if (!open || !articleId) {
      return;
    }

    setLoading(true);
    setError(null);
    setContent('');

    // 发起普通请求
    request
      .get(`/article/summarize?id=${articleId}`)
      .then((data) => {
        if (data.code === 0 && data.data?.summary) {
          setContent(data.data.summary);
        } else {
          setError(data.message || '总结失败');
        }
      })
      .catch((err) => {
        setError('总结失败：' + err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, articleId]);

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Drawer title="AI总结结果" placement="right" open={open} onClose={handleClose} size={700} destroyOnHidden={true}>
      <div className={styles.content}>
        {loading && !content && !error && (
          <div className={styles.loadingContainer}>
            <Spin size="large" />
            <p className={styles.loadingText}>AI正在分析文章，请稍候...</p>
          </div>
        )}

        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        {content && (
          <div className={styles.markdownContainer}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}

        {!loading && !content && !error && (
          <div className={styles.emptyContainer}>
            <p>总结内容为空</p>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default AISummarizeModal;
