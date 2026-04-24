import React, { memo, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Empty, Image, Card } from 'antd';
import { PictureContext, Picture } from './context';
import Actions from './Actions';
import style from './index.module.less';
import { API_BASE_URL } from '@/commons/constant';

const { Meta } = Card;

const PictureList: React.FC = () => {
  const {
    currentCate,
    pictureList,
    setSelectedPicture,
    getCateList,
    getPictureList,
    getTrashList,
    getPictureCounts,
    picturesLoading,
    picturesHasMore,
    picturesTotal,
  } = useContext(PictureContext);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const isTrash = currentCate?.id === -1;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

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
    const fullPath = getImageUrl(picture);
    setPreviewImage(fullPath);
    setPreviewVisible(true);
  };

  // 获取图片完整路径，优先使用云端链接
  const getImageUrl = (picture: Picture) => {
    // 优先使用云端链接
    if (picture.cloudUrl) {
      return picture.cloudUrl;
    }
    // 降级使用本地链接
    return `${API_BASE_URL}${picture.path}`;
  };

  // 触底加载更多
  const handleLoadMore = useCallback(() => {
    if (picturesHasMore && !picturesLoading) {
      if (isTrash) {
        getTrashList(true);
      } else {
        getPictureList(true);
      }
    }
  }, [picturesHasMore, picturesLoading, isTrash, getPictureList, getTrashList]);

  // 使用 Intersection Observer 监听触底
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && picturesHasMore && !picturesLoading) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [picturesHasMore, picturesLoading, handleLoadMore]);

  // 加载中且列表为空时不渲染任何内容
  if ((!pictureList || pictureList.length === 0) && picturesLoading) {
    return null;
  }

  if (!pictureList || pictureList.length === 0) {
    return (
      <div style={{ paddingTop: 100 }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={isTrash ? '回收站为空' : '暂无图片'} />
      </div>
    );
  }

  return (
    <>
      <div className={style.pictureList}>
        {pictureList.map((picture) => (
          <Card
            key={picture.id}
            className={style.pictureCard}
            hoverable={!isTrash}
            cover={
              <div className={style.imageWrapper} onClick={() => handlePreview(picture)}>
                <img src={getImageUrl(picture)} alt={picture.name} loading="lazy" />
              </div>
            }
          >
            <Meta title={<div className={style.name}>{picture.name}</div>} description={picture.description || ''} />
            <div className={style.cardActions} onClick={(e) => e.stopPropagation()}>
              <Actions picture={picture} isTrash={isTrash} onUpdated={handleUpdated} />
            </div>
          </Card>
        ))}
      </div>

      {/* 加载更多触发区域 */}
      <div ref={loadMoreRef} style={{ textAlign: 'center', padding: '16px 0' }}>
        {!picturesHasMore && pictureList.length > 0 && (
          <span style={{ color: 'var(--ant-color-text-description)' }}>没有更多数据了（共 {picturesTotal} 条）</span>
        )}
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
