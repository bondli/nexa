import React from 'react';

// 笔记本分类
export type Cate = {
  id: number | string;
  name: string;
  counts: number;
  icon: React.ReactNode;
  isVirtual?: boolean;
  orders?: number;
};

// 文章
export type Note = {
  id: number;
  title: string;
  desc?: string;
  priority?: number;
  status?: string;
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
  cateId?: number;
};

export const DEFAULT_CATE = {
  id: 'all',
  name: '所有笔记',
  counts: 0,
  icon: null,
  isVirtual: true,
};
