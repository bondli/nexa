import React from 'react';

// 文章分类
export type ArticleCate = {
  id: number | string;
  name: string;
  counts: number;
  icon: React.ReactNode;
  isVirtual?: boolean;
  orders?: number;
};

// 文章
export type Article = {
  id: number;
  title: string;
  desc?: string;
  url: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  cateId?: number;
};

// 临时文章
export type TempArticle = {
  id: number;
  url: string;
  createdAt?: string;
};

// 默认分类 - 全部文章
export const DEFAULT_CATE = {
  id: 'all',
  name: '全部文章',
  counts: 0,
  icon: null,
  isVirtual: true,
};

// 虚拟分类
export const VIRTUAL_CATES = [
  { id: 'all', name: '全部文章', counts: 0, icon: null, isVirtual: true },
  { id: 'temp', name: '临时文章', counts: 0, icon: null, isVirtual: true },
  { id: 'trash', name: '回收站', counts: 0, icon: null, isVirtual: true },
];
