import React, { createContext, useState, useCallback } from 'react';
import request from '@commons/request';

export interface PictureCate {
  id: number;
  icon?: string;
  name: string;
  orders: number;
  counts: number;
  userId: number;
  isVirtual?: boolean;
}

export interface Picture {
  id: number;
  path: string;
  name: string;
  description: string | null;
  categoryId: number | null;
  userId: number;
  status: 'normal' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

interface PictureContextType {
  currentCate: PictureCate | null;
  setCurrentCate: React.Dispatch<React.SetStateAction<PictureCate | null>>;
  cateList: PictureCate[];
  setCateList: React.Dispatch<React.SetStateAction<PictureCate[]>>;
  pictureList: Picture[];
  setPictureList: React.Dispatch<React.SetStateAction<Picture[]>>;
  selectedPicture: Picture | null;
  setSelectedPicture: React.Dispatch<React.SetStateAction<Picture | null>>;
  getCateList: () => Promise<void>;
  getPictureList: (isLoadMore?: boolean) => Promise<void>;
  getTrashList: (isLoadMore?: boolean) => Promise<void>;
  searchPictureList: (keyword: string) => Promise<void>;
  getPictureCounts: () => Promise<void>;
  pictureCounts: { all: number; trash: number };
  createCate: (name: string, icon?: string) => Promise<void>;
  updateCate: (id: number, name: string) => Promise<void>;
  deleteCate: (id: number) => Promise<void>;
  createPicture: (data: { path: string; name: string; description?: string; categoryId?: number }) => Promise<void>;
  deletePicture: (id: number) => Promise<void>;
  updatePicture: (id: number, description: string) => Promise<void>;
  movePicture: (id: number, categoryId: number) => Promise<void>;
  restorePicture: (id: number) => Promise<void>;
  forceDeletePicture: (id: number) => Promise<void>;
  picturesLoading: boolean;
  picturesHasMore: boolean;
  picturesTotal: number;
}

export const PictureContext = createContext<PictureContextType | undefined>(undefined);

export const PictureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCate, setCurrentCate] = useState<PictureCate | null>(null);
  const [cateList, setCateList] = useState<PictureCate[]>([]);
  const [pictureList, setPictureList] = useState<Picture[]>([]);
  const [selectedPicture, setSelectedPicture] = useState<Picture | null>(null);
  const [picturesLoading, setPicturesLoading] = useState(true);
  const [pictureCounts, setPictureCounts] = useState<{ all: number; trash: number }>({ all: 0, trash: 0 });
  const [picturesOffset, setPicturesOffset] = useState(0);
  const [picturesHasMore, setPicturesHasMore] = useState(true);
  const [picturesTotal, setPicturesTotal] = useState(0);
  const PICTURE_LIMIT = 20;

  // const isTrash = currentCate?.id === -1;

  // 获取图片统计数量
  const getPictureCounts = async () => {
    const response = await request.get('/picture/getCounts');
    setPictureCounts(response.data || { all: 0, trash: 0 });
  };

  // 获取分类列表
  const getCateList = async () => {
    const response = await request.get('/pictureCate/list');
    setCateList(response.data || []);
  };

  // 获取图片列表（支持分页）
  const getPictureList = useCallback(
    async (isLoadMore = false) => {
      if (!isLoadMore) {
        setPicturesLoading(true);
        setPicturesOffset(0);
      } else if (picturesLoading) {
        return;
      }

      const currentOffset = isLoadMore ? picturesOffset : 0;

      try {
        const categoryId = currentCate?.id;
        const url = categoryId
          ? `/picture/getList?categoryId=${categoryId}&limit=${PICTURE_LIMIT}&offset=${currentOffset}`
          : `/picture/getList?limit=${PICTURE_LIMIT}&offset=${currentOffset}`;
        const response = await request.get(url);
        const newList = response.data?.list || [];
        const total = response.data?.total || 0;

        if (isLoadMore) {
          setPictureList((prev) => [...prev, ...newList]);
        } else {
          setPictureList(newList);
        }

        setPicturesTotal(total);
        setPicturesHasMore(currentOffset + newList.length < total);
        setPicturesOffset(currentOffset + newList.length);
      } finally {
        setPicturesLoading(false);
      }
    },
    [currentCate?.id, picturesOffset, picturesLoading],
  );

  // 获取回收站图片列表（支持分页）
  const getTrashList = useCallback(
    async (isLoadMore = false) => {
      if (!isLoadMore) {
        setPicturesLoading(true);
        setPicturesOffset(0);
      } else if (picturesLoading) {
        return;
      }

      const currentOffset = isLoadMore ? picturesOffset : 0;

      try {
        const response = await request.get(`/picture/getTrash?limit=${PICTURE_LIMIT}&offset=${currentOffset}`);
        const newList = response.data?.list || [];
        const total = response.data?.total || 0;

        if (isLoadMore) {
          setPictureList((prev) => [...prev, ...newList]);
        } else {
          setPictureList(newList);
        }

        setPicturesTotal(total);
        setPicturesHasMore(currentOffset + newList.length < total);
        setPicturesOffset(currentOffset + newList.length);
      } finally {
        setPicturesLoading(false);
      }
    },
    [picturesOffset, picturesLoading],
  );

  // 搜索图片
  const searchPictureList = async (keyword: string) => {
    setPicturesLoading(true);
    const response = await request.get(`/picture/search?keyword=${encodeURIComponent(keyword)}`);
    setPictureList(response.data || []);
    setPicturesLoading(false);
  };

  // 创建分类
  const createCate = async (name: string, icon?: string) => {
    await request.post('/pictureCate/create', { name, icon });
    await getCateList();
  };

  // 更新分类
  const updateCate = async (id: number, name: string) => {
    await request.post('/pictureCate/update', { id, name });
    await getCateList();
  };

  // 删除分类
  const deleteCate = async (id: number) => {
    await request.get('/pictureCate/delete', { params: { id } });
    await getCateList();
    await getPictureList();
  };

  // 创建图片
  const createPicture = async (data: { path: string; name: string; description?: string; categoryId?: number }) => {
    await request.post('/picture/add', data);
    await getPictureList();
    await getCateList();
    await getPictureCounts();
  };

  // 更新图片信息
  const updatePicture = async (id: number, description: string) => {
    await request.post('/picture/update', { id, description });
    await getPictureList();
  };

  // 移动图片到其他分类
  const movePicture = async (id: number, categoryId: number) => {
    await request.post('/picture/update', { id, categoryId });
    await getPictureList();
    await getCateList();
  };

  // 软删除图片（移入回收站）
  const deletePicture = async (id: number) => {
    await request.get('/picture/delete', { params: { id } });
    await getPictureList();
    await getCateList();
    await getPictureCounts();
  };

  // 从回收站恢复图片
  const restorePicture = async (id: number) => {
    await request.get('/picture/restore', { params: { id } });
    await getTrashList();
    await getCateList();
    await getPictureCounts();
  };

  // 彻底删除图片
  const forceDeletePicture = async (id: number) => {
    await request.get('/picture/forceDelete', { params: { id } });
    await getTrashList();
    await getPictureCounts();
  };

  return (
    <PictureContext.Provider
      value={{
        currentCate,
        setCurrentCate,
        cateList,
        setCateList,
        pictureList,
        setPictureList,
        selectedPicture,
        setSelectedPicture,
        getCateList,
        getPictureList,
        getTrashList,
        searchPictureList,
        getPictureCounts,
        pictureCounts,
        createCate,
        updateCate,
        deleteCate,
        createPicture,
        deletePicture,
        updatePicture,
        restorePicture,
        movePicture,
        forceDeletePicture,
        picturesLoading,
        picturesHasMore,
        picturesTotal,
      }}
    >
      {children}
    </PictureContext.Provider>
  );
};
