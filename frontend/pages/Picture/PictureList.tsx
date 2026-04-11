import React, { memo, useContext, useState } from 'react';
import { Empty, Image, Modal, App, Button, Space, Input } from 'antd';
import { DeleteOutlined, RollbackOutlined, EditOutlined } from '@ant-design/icons';
import { PictureContext, Picture } from './context';
import style from './index.module.less';
import { API_BASE_URL } from '@/commons/constant';

const PictureList: React.FC = () => {
  const { message } = App.useApp();
  const {
    currentCate,
    pictureList,
    deletePicture,
    setSelectedPicture,
    restorePicture,
    forceDeletePicture,
    updatePicture,
  } = useContext(PictureContext);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [editingPicture, setEditingPicture] = useState<Picture | null>(null);
  const [editDesc, setEditDesc] = useState('');

  const isTrash = currentCate?.id === -1;

  const handlePreview = (picture: Picture) => {
    if (isTrash) return;
    setSelectedPicture(picture);
    const fullPath = `${API_BASE_URL}${picture.path}`;
    setPreviewImage(fullPath);
    setPreviewVisible(true);
  };

  const handleEdit = (e: React.MouseEvent, picture: Picture) => {
    e.stopPropagation();
    setEditingPicture(picture);
    setEditDesc(picture.description || '');
  };

  const handleEditOk = async () => {
    try {
      await updatePicture(editingPicture.id, editDesc);
      message.success('修改成功');
      setEditingPicture(null);
    } catch (err) {
      message.error('修改失败');
    }
  };

  const handleEditCancel = () => {
    setEditingPicture(null);
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这张图片吗？删除后可在回收站找回。',
      onOk: async () => {
        try {
          await deletePicture(id);
          message.success('已移入回收站');
        } catch (err) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleRestore = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    Modal.confirm({
      title: '确认恢复',
      content: '确定要恢复这张图片吗？',
      onOk: async () => {
        try {
          await restorePicture(id);
          message.success('恢复成功');
        } catch (err) {
          message.error('恢复失败');
        }
      },
    });
  };

  const handleForceDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    Modal.confirm({
      title: '确认彻底删除',
      content: '彻底删除后将无法恢复，确定要继续吗？',
      okType: 'danger',
      onOk: async () => {
        try {
          await forceDeletePicture(id);
          message.success('已彻底删除');
        } catch (err) {
          message.error('删除失败');
        }
      },
    });
  };

  // 获取图片完整路径
  const getImageUrl = (path: string) => {
    return `${API_BASE_URL}${path}`;
  };

  if (!pictureList || pictureList.length === 0) {
    return (
      <div className={style.emptyWrapper}>
        <Empty description={isTrash ? '回收站为空' : '暂无图片'} />
      </div>
    );
  }

  return (
    <>
      <div className={style.pictureList}>
        {pictureList.map((picture) => (
          <div
            key={picture.id}
            className={`${style.pictureCard} ${isTrash ? style.trashCard : ''}`}
            onClick={() => handlePreview(picture)}
          >
            <div className={style.imageWrapper}>
              <img src={getImageUrl(picture.path)} alt={picture.name} loading="lazy" />
            </div>
            <div className={style.cardInfo}>
              <div className={style.name}>{picture.name}</div>
              {picture.description && <div className={style.description}>{picture.description}</div>}
            </div>
            {isTrash ? (
              <div className={style.trashActions} onClick={(e) => e.stopPropagation()}>
                <Space size={4}>
                  <Button
                    size="small"
                    type="text"
                    icon={<RollbackOutlined />}
                    onClick={(e) => handleRestore(e, picture.id)}
                    title="恢复"
                  />
                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => handleForceDelete(e, picture.id)}
                    title="彻底删除"
                  />
                </Space>
              </div>
            ) : (
              <div className={style.cardActions} onClick={(e) => e.stopPropagation()}>
                <Space size={4}>
                  <Button
                    size="small"
                    type="text"
                    icon={<EditOutlined />}
                    className={style.actionBtn}
                    onClick={(e) => handleEdit(e, picture)}
                    title="编辑"
                  />
                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    className={style.actionBtn}
                    onClick={(e) => handleDelete(e, picture.id)}
                    title="删除"
                  />
                </Space>
              </div>
            )}
          </div>
        ))}
      </div>

      {!isTrash && (
        <Image
          style={{ display: 'none' }}
          preview={{
            open: previewVisible,
            src: previewImage,
            onOpenChange: (visible) => {
              setPreviewVisible(visible);
              if (!visible) {
                setSelectedPicture(null);
              }
            },
          }}
        />
      )}

      <Modal
        title="编辑描述"
        open={!!editingPicture}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        okText="保存"
        cancelText="取消"
      >
        <Input.TextArea
          rows={3}
          placeholder="请输入图片描述"
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          maxLength={200}
          style={{ marginBottom: 12 }}
          showCount
        />
      </Modal>
    </>
  );
};

export default memo(PictureList);
