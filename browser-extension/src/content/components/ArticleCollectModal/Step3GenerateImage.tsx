import React, { useState, useRef } from 'react';
import { Button, Select, App as AntdApp } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import request from '../../../services/request';
import { getUserId } from '../../../services/utils';
import { Category } from '../../../services/article';

interface Step3GenerateImageProps {
  summary: string;
  title: string;
  selectedCategory: number | null;
  categories: Category[];
  onComplete: (imageUrl: string, category: number | null) => void;
}

const Step3GenerateImage: React.FC<Step3GenerateImageProps> = ({
  summary,
  title,
  onComplete,
  selectedCategory,
  categories,
}) => {
  const { message: antdMessage } = AntdApp.useApp();
  const previewRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [category, setCategory] = useState<number | null>(selectedCategory || null);

  // 步骤状态
  const [step, setStep] = useState<'generate' | 'upload' | 'done'>('generate');

  const handleGenerateImage = async () => {
    setGenerating(true);
    try {
      const userId = await getUserId();

      // 调用后端生成HTML内容
      const response = await request.post<any>(
        '/article/generate-image',
        {
          summary,
          title,
        },
        {
          headers: { 'X-User-Id': String(userId) },
        },
      );

      const resData = response.data;
      if (resData.code === 0) {
        const html = resData.data?.htmlContent || '';
        setHtmlContent(html);
        setStep('upload');
        antdMessage.success('HTML内容生成成功');
      } else {
        antdMessage.error(resData.message || '生成失败');
      }
    } catch (error) {
      console.error('生成图片内容失败:', error);
      antdMessage.error('生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  const handleConvertToImage = async () => {
    if (!htmlContent || !previewRef.current) {
      antdMessage.warning('请先生成内容');
      return;
    }

    setLoading(true);
    try {
      // 使用 html2canvas 直接捕获预览 div
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(previewRef.current, {
        scale: 1,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

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

      // 上传到服务器
      const uploadResponse = await request.post<any>('/common/uploadFile?fileType=image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadData = uploadResponse.data;
      if (uploadData.code === 0) {
        const url = uploadData.data?.cloudUrl || uploadData.data?.path || '';
        setImageUrl(url);
        setPreviewUrl(url);
        setStep('done');
        antdMessage.success('图片上传成功');
      } else {
        antdMessage.error(uploadData.message || '上传失败');
      }
    } catch (error) {
      console.error('转换图片失败:', error);
      antdMessage.error('转换图片失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (!imageUrl) {
      antdMessage.warning('请先生成并上传图片');
      return;
    }
    onComplete(imageUrl, category);
  };

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        {step === 'generate' && (
          <>
            <p style={{ marginBottom: 16, color: '#8c8c8c' }}>点击下方按钮，生成用于图片分享的 HTML 内容</p>
            <Button type="primary" onClick={handleGenerateImage} loading={generating} size="large">
              {generating ? '生成中...' : '生成图片内容'}
            </Button>
          </>
        )}

        {step === 'upload' && (
          <>
            <p style={{ marginBottom: 16, color: '#8c8c8c' }}>HTML 内容已生成，点击转换为图片并上传</p>
            <div
              ref={previewRef}
              style={{
                background: '#f5f5f5',
                borderRadius: 8,
                marginBottom: 16,
                overflow: 'hidden',
                textAlign: 'left',
              }}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
            <Button type="primary" onClick={handleConvertToImage} loading={loading} size="large">
              {loading ? '转换中...' : '转换为图片并上传'}
            </Button>
          </>
        )}

        {step === 'done' && (
          <>
            <p style={{ marginBottom: 16, color: '#52c41a' }}>图片上传成功！</p>
            {previewUrl && (
              <div style={{ marginBottom: 16 }}>
                <img
                  src={previewUrl}
                  alt="生成的图片"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 600,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginRight: 8 }}>文章分类</div>
          <Select
            value={category}
            onChange={setCategory}
            placeholder="请选择文章分类"
            style={{ width: 200 }}
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
        </div>
        <Button type="primary" onClick={handleFinish} disabled={step !== 'done'} icon={<CheckOutlined />}>
          提交保存
        </Button>
      </div>
    </div>
  );
};

export default Step3GenerateImage;
