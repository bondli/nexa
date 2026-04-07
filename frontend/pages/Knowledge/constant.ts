import React from 'react';

// 知识库
export type KnowBaseType = {
  id: number | string;
  name: string;
  description: string;
  counts: number;
  icon: React.ReactNode;
  orders?: number;
};

// 文档
export type DocumentType = {
  id: number;
  name: string;
  desc: string;
  status: string;
  size?: number; // 文件大小（字节）
  type?: string;
  path?: string; // 文件路径
  createdAt: string;
};
