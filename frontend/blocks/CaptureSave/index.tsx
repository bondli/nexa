import { useState, useEffect } from 'react';
import { Button, message, Progress, Spin, Input, Select } from 'antd';
import { CloseOutlined, InboxOutlined } from '@ant-design/icons';
import { closeScreenshotCapture, readClipboardImage } from '@commons/electron';
import request from '@commons/request';
import styles from './index.module.less';

const { TextArea } = Input;

interface PictureCate {
  id: number;
  name: string;
  icon?: string;
  orders: number;
  counts: number;
}

/**
 * 截图快存组件
 * 用于快速将截图内容保存到笔记或图片库
 */
const CaptureSave = () => {
  // 状态：waiting（等待粘贴）/ preview（预览截图）/ uploading（上传中）/ processing（OCR+AI处理中）/ result（显示结果）/ imageUpload（图片库上传表单）
  const [status, setStatus] = useState<'waiting' | 'preview' | 'uploading' | 'processing' | 'result' | 'imageUpload'>(
    'waiting',
  );
  const [progress, setProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [cateList, setCateList] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedCateId, setSelectedCateId] = useState<number | null>(null);
  const [pictureCateList, setPictureCateList] = useState<PictureCate[]>([]);
  const [selectedPictureCateId, setSelectedPictureCateId] = useState<number | null>(null);
  const [imageDescription, setImageDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // Base64 转 Blob 工具函数
  const base64ToBlob = (base64: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/png' });
  };

  // 监听粘贴事件
  useEffect(() => {
    const handlePaste = async () => {
      // 从剪贴板读取图片
      const base64Image = readClipboardImage();

      if (!base64Image) {
        message.warning('剪贴板中没有图片,请先截图后粘贴');
        return;
      }

      // 保存图片并切换到预览状态
      setPreviewImage(base64Image);
      setStatus('preview');
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

  // OCR 识别文字流程
  const handleOcrRecognition = async () => {
    if (!previewImage) return;

    setStatus('uploading');
    setProgress(30);

    try {
      // 将 Base64 转换为 Blob 上传
      const blob = base64ToBlob(previewImage);
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
      setUploadedImageUrl(imageUrl);
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

        // 获取笔记分类列表
        const cateRes = await request.get('/cate/list');
        if (cateRes && cateRes.data) {
          setCateList(cateRes.data);
        }
      }
    } catch (error) {
      console.error('OCR 识别失败:', error);
      message.error('识别失败,请重试');
      setStatus('preview');
      setProgress(0);
    }
  };

  // 上传到图片库流程
  const handleUploadToLibrary = async () => {
    // 切换到图片库上传表单状态
    setStatus('imageUpload');

    try {
      // 获取图片分类列表
      const cateRes = await request.get('/pictureCate/list');
      if (cateRes && cateRes.data) {
        setPictureCateList(cateRes.data);
      }
    } catch (error) {
      console.error('获取图片分类失败:', error);
      message.error('获取分类列表失败');
      setStatus('preview');
    }
  };

  // 保存到图片库
  const handleSaveToLibrary = async () => {
    if (!selectedPictureCateId) {
      message.warning('请选择图片分类');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = uploadedImageUrl;

      // 如果还没上传,先上传图片
      if (!imageUrl && previewImage) {
        const blob = base64ToBlob(previewImage);
        const formData = new FormData();
        formData.append('file', blob, 'screenshot.png');

        const uploadRes = await request.post('/common/uploadImage', formData);
        if (!uploadRes || !uploadRes.data || !uploadRes.data.url) {
          throw new Error('上传失败');
        }
        imageUrl = uploadRes.data.url || uploadRes.data?.filePath;
        setUploadedImageUrl(imageUrl);
      }

      // 保存到图片库
      const relativePath = imageUrl.replace(/^https?:\/\/[^/]+\//, ''); // 提取相对路径（去掉 host 部分）
      await request.post('/picture/add', {
        path: relativePath,
        name: `截图_${new Date().getTime()}`,
        description: imageDescription || null,
        categoryId: selectedPictureCateId,
      });

      message.success('保存成功');
      setTimeout(() => {
        closeScreenshotCapture();
      }, 1500);
    } catch (error) {
      console.error('保存到图片库失败:', error);
      message.error('保存失败,请重试');
    } finally {
      setSaving(false);
    }
  };

  // 从图片库表单返回预览
  const handleBackToPreview = () => {
    setStatus('preview');
    setSelectedPictureCateId(null);
    setImageDescription('');
  };

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
    setPreviewImage(null);
    setUploadedImageUrl(null);
    setEditedText('');
    setSelectedCateId(null);
    setSelectedPictureCateId(null);
    setImageDescription('');
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

          {/* 预览状态 */}
          {status === 'preview' && previewImage && (
            <div className={styles.preview}>
              <div className={styles.imagePreview}>
                <img src={`data:image/png;base64,${previewImage}`} alt="截图预览" />
              </div>
              <div className={styles.previewActions}>
                <Button onClick={handleOcrRecognition}>识别文字</Button>
                <Button onClick={handleUploadToLibrary}>上传到图片库</Button>
                <Button onClick={handleRetry}>重新粘贴</Button>
              </div>
            </div>
          )}

          {/* 上传中状态 */}
          {(status === 'uploading' || status === 'processing') && (
            <div className={styles.processing}>
              <Spin
                description={status === 'uploading' ? '上传图片中...' : 'OCR 识别与 AI 优化中...'}
                styles={{
                  description: {
                    color: '#fff',
                  },
                }}
              />
              <Progress
                percent={progress}
                status="active"
                styles={{
                  indicator: {
                    color: '#fff',
                  },
                }}
              />
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
                <Button onClick={handleBackToPreview} size="small">
                  返回
                </Button>
                <Button
                  onClick={handleSave}
                  loading={saving}
                  disabled={!selectedCateId}
                  size="small"
                  style={{ color: !selectedCateId ? '#ccc' : '#000' }}
                >
                  存到笔记
                </Button>
              </div>
            </div>
          )}

          {/* 图片库上传表单状态 */}
          {status === 'imageUpload' && previewImage && (
            <div className={styles.imageUpload}>
              <div className={styles.imageThumbnail}>
                <img src={`data:image/png;base64,${previewImage}`} alt="截图缩略图" />
              </div>
              <div className={styles.uploadForm}>
                <div className={styles.formItem}>
                  <label>图片分类</label>
                  <Select
                    placeholder="选择图片分类..."
                    value={selectedPictureCateId}
                    onChange={setSelectedPictureCateId}
                    style={{ width: '100%' }}
                    options={pictureCateList.map((item) => ({
                      label: item.name,
                      value: item.id,
                    }))}
                  />
                </div>
                <div className={styles.formItem}>
                  <label>图片描述</label>
                  <TextArea
                    value={imageDescription}
                    onChange={(e) => setImageDescription(e.target.value)}
                    placeholder="请输入图片描述(可选)..."
                    autoSize={{ minRows: 2, maxRows: 4 }}
                  />
                </div>
              </div>
              <div className={styles.actions}>
                <Button onClick={handleBackToPreview} size="small">
                  返回
                </Button>
                <Button
                  onClick={handleSaveToLibrary}
                  loading={saving}
                  disabled={!selectedPictureCateId}
                  size="small"
                  style={{ color: !selectedPictureCateId ? '#ccc' : '#000' }}
                >
                  保存到图片库
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaptureSave;
