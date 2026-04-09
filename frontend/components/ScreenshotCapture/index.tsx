import { useState, useEffect } from 'react';
import { Button, message, Progress, Spin, Input, Select } from 'antd';
import { CloseOutlined, InboxOutlined } from '@ant-design/icons';
import { closeScreenshotCapture, readClipboardImage } from '@commons/electron';
import request from '@commons/request';
import styles from './index.module.less';

const { TextArea } = Input;

/**
 * 截图快存组件
 * 用于快速将截图内容保存到笔记
 */
const ScreenshotCapture = () => {
  // 状态：waiting（等待粘贴）/ uploading（上传中）/ processing（OCR+AI处理中）/ result（显示结果）
  const [status, setStatus] = useState<'waiting' | 'uploading' | 'processing' | 'result'>('waiting');
  const [progress, setProgress] = useState(0);
  const [editedText, setEditedText] = useState('');
  const [cateList, setCateList] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedCateId, setSelectedCateId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // 监听粘贴事件
  useEffect(() => {
    const handlePaste = async () => {
      // 从剪贴板读取图片
      const base64Image = readClipboardImage();

      if (!base64Image) {
        message.warning('剪贴板中没有图片，请先截图后粘贴');
        return;
      }

      setStatus('uploading');
      setProgress(30);

      try {
        // 将 Base64 转换为 Blob 上传
        const byteCharacters = atob(base64Image);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });

        const formData = new FormData();
        formData.append('file', blob, 'screenshot.png');

        setProgress(50);

        // 上传图片
        const uploadRes = await request.post('/common/uploadImage', formData);
        setProgress(70);

        if (!uploadRes || !uploadRes.data || !uploadRes.data.url) {
          throw new Error('上传失败');
        }

        const imageUrl = uploadRes.data.url;
        setProgress(90);

        // 调用 OCR + AI 优化
        setStatus('processing');
        const ocrRes = await request.post('/common/ocr', {
          imageUrl,
        });

        setProgress(100);

        if (ocrRes && ocrRes.data) {
          setEditedText(ocrRes.data.text || '');
          setStatus('result');

          // 获取分类列表
          const cateRes = await request.get('/cate/list');
          if (cateRes && cateRes.data) {
            setCateList(cateRes.data);
          }
        }
      } catch (error) {
        console.error('处理截图失败:', error);
        message.error('处理失败，请重试');
        setStatus('waiting');
        setProgress(0);
      }
    };

    // 绑定粘贴事件（使用 document 级别确保能捕获）
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  // 按 ESC 关闭窗口
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeScreenshotCapture();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 保存到笔记
  const handleSave = async () => {
    if (!selectedCateId) {
      message.warning('请选择笔记分类');
      return;
    }

    if (!editedText.trim()) {
      message.warning('内容为空，无法保存');
      return;
    }

    setSaving(true);
    try {
      await request.post('/note/add', {
        title: editedText.trim().split('\n')[0].substring(0, 50),
        desc: editedText.trim(),
        cateId: selectedCateId,
        priority: 3,
      });

      message.success('保存成功');
      setTimeout(() => {
        closeScreenshotCapture();
      }, 1500);
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 关闭
  const handleClose = () => {
    closeScreenshotCapture();
  };

  // 重新粘贴
  const handleRetry = () => {
    setStatus('waiting');
    setProgress(0);
    setEditedText('');
    setSelectedCateId(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.overlay}>
        <div className={styles.header}>
          <span className={styles.title}>截图快存</span>
          <Button icon={<CloseOutlined />} type="primary" onClick={handleClose} size="small" />
        </div>

        <div className={styles.content}>
          {/* 等待粘贴状态 */}
          {status === 'waiting' && (
            <div className={styles.waiting}>
              <InboxOutlined className={styles.icon} />
              <p>请按下 Cmd+V 粘贴截图</p>
            </div>
          )}

          {/* 上传中状态 */}
          {(status === 'uploading' || status === 'processing') && (
            <div className={styles.processing}>
              <Spin description={status === 'uploading' ? '上传图片中...' : 'OCR 识别与 AI 优化中...'} />
              <Progress percent={progress} status="active" />
            </div>
          )}

          {/* 显示结果状态 */}
          {status === 'result' && (
            <div className={styles.result}>
              <div className={styles.textEditor}>
                <TextArea
                  className={styles.textarea}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  placeholder="OCR 识别结果，可在此编辑..."
                  autoSize={{ minRows: 3, maxRows: 8 }}
                />
              </div>
              <div className={styles.notebookSelect}>
                <Select
                  className={styles.select}
                  placeholder="选择笔记分类..."
                  value={selectedCateId}
                  onChange={setSelectedCateId}
                  style={{ width: '100%' }}
                  options={cateList.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                />
              </div>
              <div className={styles.actions}>
                <Button onClick={handleRetry} size="small">
                  重新截图
                </Button>
                <Button type="primary" onClick={handleSave} loading={saving} disabled={!selectedCateId}>
                  存到笔记
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenshotCapture;
