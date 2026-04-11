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
 * 获取分类列表
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const userId = await getUserId();
    const response = await request.get<any>('/cate/list', {
      headers: { 'X-User-Id': String(userId) },
    });

    const resData = response.data;
    if (resData.code === 0) {
      return resData.data || [];
    }

    return [];
  } catch {
    console.error('获取分类列表失败');
    return [];
  }
};

/**
 * 笔记数据接口
 */
export interface NoteData {
  title: string;
  desc: string;
  url?: string;
  cateId: number;
  [key: string]: unknown;
}

/**
 * 保存笔记结果
 */
export interface SaveNoteResult {
  success: boolean;
  message?: string;
  data?: unknown;
}

/**
 * 保存笔记
 */
export const saveNote = async (data: NoteData): Promise<SaveNoteResult> => {
  try {
    const userId = await getUserId();
    const response = await request.post<any>('/note/add', data, {
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