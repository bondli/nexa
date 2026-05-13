import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Select, Input, Button, message } from 'antd';
import { UserInfo } from '../../services/utils';
import { getPictureCates, uploadImage, savePicture, PictureCate } from '../../services/picture';

interface ImageCollectorProps {
  user: UserInfo;
}

const ImageCollector: React.FC<ImageCollectorProps> = () => {
  const [collectModalVisible, setCollectModalVisible] = useState(false);
  const [currentImgSrc, setCurrentImgSrc] = useState('');
  const [currentImgAlt, setCurrentImgAlt] = useState('');
  const [categories, setCategories] = useState<PictureCate[]>([]);
  const [selectedCateId, setSelectedCateId] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [collecting, setCollecting] = useState(false);

  // 加载图片分类
  const loadCategories = useCallback(async () => {
    try {
      const data = await getPictureCates();
      setCategories(data);
    } catch (err) {
      console.error('加载分类失败:', err);
    }
  }, []);

  // 收藏图片
  const handleCollect = async () => {
    if (!currentImgSrc) {
      message.error('请选择图片');
      return;
    }

    setCollecting(true);
    try {
      const imgResponse = await fetch(currentImgSrc);
      const imgBlob = await imgResponse.blob();

      const fileName = currentImgAlt.substring(0, 50) + '.jpg';
      const uploadResult = await uploadImage(imgBlob, fileName);
      if (!uploadResult.success || !uploadResult.path) {
        throw new Error(uploadResult.message || '图片上传失败');
      }

      const saveResult = await savePicture({
        path: uploadResult.path,
        name: currentImgAlt,
        description: description || null,
        categoryId: selectedCateId || null,
        cloudUrl: uploadResult.cloudUrl || undefined,
      });

      if (!saveResult.success) {
        throw new Error(saveResult.message || '保存失败');
      }

      message.success('图片收藏成功！');
      setCollectModalVisible(false);
    } catch (err: any) {
      console.error('收藏失败:', err);
      message.error(err.message || '收藏失败，请重试');
    } finally {
      setCollecting(false);
    }
  };

  // 监听图片点击事件
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLImageElement;
      if (target.tagName !== 'IMG') return;

      const rect = target.getBoundingClientRect();
      if (rect.width <= 50 || rect.height <= 50) return;

      e.preventDefault();
      e.stopPropagation();

      setCurrentImgSrc(target.src);
      setCurrentImgAlt(target.alt || '未命名图片');
      setSelectedCateId(undefined);
      setDescription('');
      setCollectModalVisible(true);
      loadCategories();
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [loadCategories]);

  return (
    <Modal
      title="收藏图片"
      open={collectModalVisible}
      onCancel={() => setCollectModalVisible(false)}
      footer={
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'row', width: '400px', justifyContent: 'flex-start', alignItems: 'center' }}>
            <div style={{ fontWeight: 500, paddingRight: 10 }}>选择分类</div>
            <Select
              style={{ width: 200, textAlign: 'left' }}
              placeholder="请选择分类"
              allowClear
              value={selectedCateId}
              onChange={setSelectedCateId}
              options={categories.map((cate) => ({
                label: cate.name,
                value: cate.id,
              }))}
            />
          </div>
          <Button type="primary" loading={collecting} onClick={handleCollect}>
            一键收藏
          </Button>
        </div>
      }
      width={1200}
    >
      <div style={{ marginBottom: 16 }}>
        <img
          src={currentImgSrc}
          alt={currentImgAlt}
          style={{ width: '100%', objectFit: 'contain' }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>图片描述（可选）</div>
        <Input.TextArea
          rows={3}
          placeholder="请输入图片描述"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={100}
        />
      </div>
    </Modal>
  );
};

export default ImageCollector;
