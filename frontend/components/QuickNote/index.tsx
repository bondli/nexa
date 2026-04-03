import { useState, useEffect } from 'react';
import { Input, Button, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { closeQuickNote } from '@commons/electron';
import request from '@commons/request';
import styles from './index.module.less';

const { TextArea } = Input;

/**
 * 快速笔记组件
 * 用于在独立窗口中快速记录笔记
 */
const QuickNote = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // 按 ESC 关闭窗口
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeQuickNote();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 处理保存笔记
  const handleSave = async () => {
    if (!content.trim()) {
      message.warning('请输入笔记内容');
      return;
    }

    setLoading(true);
    try {
      const title = content.trim().split('\n')[0].substring(0, 50); // 取第一行作为标题，最多50字符
      const desc = content.trim();

      await request.post('/note/add', {
        title,
        desc,
        cateId: 1, // 默认分类
        priority: 3, // 默认优先级
      });

      message.success('笔记保存成功');
      closeQuickNote(); // 保存成功后关闭窗口
    } catch (error) {
      console.error('保存笔记失败:', error);
      message.error('保存笔记失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理取消/关闭
  const handleClose = () => {
    closeQuickNote();
  };

  return (
    <div className={styles.container}>
      <div className={styles.overlay}>
        <div className={styles.header}>
          <span className={styles.title}>快速记录</span>
          <Button icon={<CloseOutlined />} type="primary" onClick={handleClose} size="small" />
        </div>
        <div className={styles.content}>
          <TextArea
            className={styles.textarea}
            placeholder="在此输入笔记内容..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
            onPressEnter={handleSave}
          />
        </div>
        <div className={styles.footer}>
          <Button onClick={handleSave} loading={loading}>
            保存
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickNote;
