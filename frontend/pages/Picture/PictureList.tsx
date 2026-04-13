import React, { memo, useContext, useState } from 'react';
import { Empty, Image } from 'antd';
import { PictureContext, Picture } from './context';
import Actions from './Actions';
import style from './index.module.less';
import { API_BASE_URL } from '@/commons/constant';

const PictureList: React.FC = () => {
  const { currentCate, pictureList, setSelectedPicture, getCateList, getPictureList, getTrashList, getPictureCounts } =
    useContext(PictureContext);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const isTrash = currentCate?.id === -1;

  // 刷新数据
  const handleUpdated = () => {
    getPictureCounts();
    getCateList();
    if (isTrash) {
      getTrashList();
    } else {
      getPictureList();
    }
  };

  const handlePreview = (picture: Picture) => {
    if (isTrash) return;
    setSelectedPicture(picture);
    const fullPath = `${API_BASE_URL}${picture.path}`;
    setPreviewImage(fullPath);
    setPreviewVisible(true);
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
            <div className={style.cardActions} onClick={(e) => e.stopPropagation()}>
              <Actions picture={picture} isTrash={isTrash} onUpdated={handleUpdated} />
            </div>
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
    </>
  );
};

export default memo(PictureList);
