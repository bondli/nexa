import request from './request';
import { getUserId } from './utils';

/**
 * 分类接口
 */
export interface Category {
  id: number;
  name: string;
  [key: string]: unknown;
}

/**
 * 获取文章分类列表
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const userId = await getUserId();
    const response = await request.get<any>('/article_cate/list', {
      headers: { 'X-User-Id': String(userId) },
    });

    const resData = response.data;
    if (resData.code === 0) {
      return resData.data || [];
    }

    return [];
  } catch {
    console.error('获取文章分类列表失败');
    return [];
  }
};

/**
 * 文章数据接口
 */
export interface ArticleData {
  title: string;
  desc: string;
  url?: string;
  cateId: number;
  [key: string]: unknown;
}

/**
 * 保存文章结果
 */
export interface SaveArticleResult {
  success: boolean;
  message?: string;
  data?: unknown;
}

/**
 * 保存文章
 */
export const saveArticle = async (data: ArticleData): Promise<SaveArticleResult> => {
  try {
    const userId = await getUserId();
    const response = await request.post<any>('/article/add', data, {
      headers: { 'X-User-Id': String(userId) },
    });

    const resData = response.data;
    if (resData.code === 0) {
      return {
        success: true,
        data: resData.data,
      };
    }

    return {
      success: false,
      message: resData.message || '保存失败',
    };
  } catch {
    return { success: false, message: '保存失败' };
  }
};