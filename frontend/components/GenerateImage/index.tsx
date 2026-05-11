import React, { useState, useRef } from 'react';
import { Modal, Button, App as AntdApp, Spin } from 'antd';
import { CheckOutlined, ReloadOutlined } from '@ant-design/icons';
import request from '@commons/request';
import html2canvas from 'html2canvas';
import styles from './index.module.less';

export type GenerateImageModalProps = {
  visible: boolean;
  /** 文章标题 */
  title: string;
  /** 文章摘要/描述 */
  summary?: string;
  /** 生成HTML内容的接口路径，默认 /article/generate-image */
  generateApiPath?: string;
  /** 上传图片的接口路径，默认 /common/uploadFile?fileType=image */
  uploadApiPath?: string;
  onClose: () => void;
  /** 图片上传成功后的回调，返回云端图片URL */
  onSuccess: (cloudUrl: string) => void;
};

// 步骤状态
type Step = 'generate' | 'upload' | 'done';

const GenerateImage: React.FC<GenerateImageModalProps> = ({
  visible,
  title,
  summary = '',
  generateApiPath = '/article/generate-image',
  uploadApiPath = '/common/uploadFile?fileType=image',
  onClose,
  onSuccess,
}) => {
  const { message: antdMessage } = AntdApp.useApp();
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 步骤状态
  const [step, setStep] = useState<Step>('generate');
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // 重置状态
  const resetState = () => {
    setStep('generate');
    setGenerating(false);
    setUploading(false);
    setHtmlContent('');
    setImageUrl('');
  };

  // 关闭时重置
  const handleClose = () => {
    resetState();
    onClose();
  };

  // 生成 HTML 内容
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await request.post<any>(generateApiPath, {
        summary,
        title,
      });

      if (response.code === 0) {
        const html = response.data?.htmlContent || '';
        setHtmlContent(html);
        setStep('upload');
        antdMessage.success('HTML内容生成成功');
      } else {
        antdMessage.error(response.message || '生成失败');
      }
    } catch (error) {
      console.error('生成图片内容失败:', error);
      antdMessage.error('生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  // 转换为图片并上传
  const handleConvertAndUpload = async () => {
    if (!htmlContent || !previewRef.current || !containerRef.current) {
      antdMessage.warning('请先生成图片内容');
      return;
    }

    setUploading(true);
    try {
      const previewEl = previewRef.current;
      const containerEl = containerRef.current;

      // 记录原始样式
      const originalOverflow = containerEl.style.overflow;
      const originalMaxHeight = containerEl.style.maxHeight;
      const originalHeight = previewEl.style.height;

      // 临时展开元素以获取完整内容
      containerEl.style.overflow = 'visible';
      containerEl.style.maxHeight = 'none';
      previewEl.style.height = 'auto';

      // 等待 DOM 更新
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 使用 html2canvas 捕获完整内容
      const canvas = await html2canvas(previewEl, {
        scale: 1, // 不缩放
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        height: previewEl.scrollHeight, // 明确指定高度为内容实际高度
      });

      // 恢复原始样式
      containerEl.style.overflow = originalOverflow;
      containerEl.style.maxHeight = originalMaxHeight;
      previewEl.style.height = originalHeight;

      // 转换为 blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Canvas to Blob failed'));
          },
          'image/png',
          1.0,
        );
      });

      // 创建 FormData 上传
      const formData = new FormData();
      formData.append('file', blob, 'article-image.png');
      formData.append('originalName', 'article-image.png');
      formData.append('fileType', 'image');

      const uploadResponse = await request.post<any>(uploadApiPath, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (uploadResponse.code === 0) {
        const cloudUrl = uploadResponse.data?.cloudUrl || uploadResponse.data?.path || '';
        setImageUrl(cloudUrl);
        setStep('done');
        antdMessage.success('图片上传成功');
      } else {
        antdMessage.error(uploadResponse.message || '上传失败');
      }
    } catch (error) {
      console.error('转换图片失败:', error);
      antdMessage.error('转换图片失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  // 完成，关闭并回调
  const handleFinish = () => {
    handleClose();
    onSuccess(imageUrl);
  };

  // 重新生成
  const handleRegenerate = () => {
    resetState();
  };

  // 渲染主体内容
  const renderContent = () => {
    if (step === 'generate') {
      return (
        <div className={styles.content}>
          <Spin spinning={generating}>
            <div className={styles.generateContent}>
              <p className={styles.hint}>点击下方按钮，生成用于图片分享的 HTML 内容</p>
            </div>
          </Spin>
        </div>
      );
    }

    if (step === 'upload') {
      return (
        <div className={styles.content} style={{ padding: 0 }}>
          <div ref={containerRef} className={styles.previewContainer}>
            <div ref={previewRef} className={styles.preview} dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        </div>
      );
    }

    // done
    return (
      <div className={styles.content}>
        <p className={styles.successHint}>图片上传成功！</p>
        {imageUrl && (
          <div className={styles.previewWrapper}>
            <img src={imageUrl} alt="生成的图片" className={styles.previewImage} />
          </div>
        )}
      </div>
    );
  };

  // 渲染 footer 按钮
  const renderFooter = () => {
    if (step === 'generate') {
      return (
        <Button type="primary" onClick={handleGenerate} loading={generating} size="middle">
          {generating ? '生成中...' : '生成图片内容'}
        </Button>
      );
    }

    if (step === 'upload') {
      return (
        <Button
          type="primary"
          onClick={handleConvertAndUpload}
          loading={uploading}
          size="middle"
          disabled={!htmlContent}
        >
          {uploading ? '转换中...' : '转换为图片并上传'}
        </Button>
      );
    }

    // done
    return (
      <>
        <Button onClick={handleRegenerate} icon={<ReloadOutlined />} size="middle">
          重新生成
        </Button>
        <Button type="primary" onClick={handleFinish} icon={<CheckOutlined />} size="middle">
          完成
        </Button>
      </>
    );
  };

  return (
    <Modal
      title="AI生成概览图片"
      mask={{
        closable: false,
      }}
      open={visible}
      onCancel={handleClose}
      footer={renderFooter()}
      width={1016}
      destroyOnHidden
    >
      {renderContent()}
    </Modal>
  );
};

export default GenerateImage;
