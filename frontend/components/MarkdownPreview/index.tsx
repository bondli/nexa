/**
 * Markdown 内容预览器
 */
import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './index.module.less';

const MarkdownPreview: React.FC<{ content: string }> = (props) => {
  const { content } = props;
  return (
    <div className={styles.markdownContainer}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || '暂无内容'}</ReactMarkdown>
    </div>
  );
};

export default memo(MarkdownPreview);
