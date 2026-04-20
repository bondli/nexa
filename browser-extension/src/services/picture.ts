import request from './request';
import { getUserId } from './utils';

/**
 * 图片分类接口
 */
export interface PictureCate {
  id: number;
  name: string;
  counts: number;
}

/**
 * 获取图片分类列表
 */
export const getPictureCates = async (): Promise<PictureCate[]> => {
  try {
    const userId = await getUserId();
    const response = await request.get<any>('/pictureCate/list', {
      headers: { 'X-User-Id': String(userId) },
    });

    const resData = response.data;
    if (resData.code === 0) {
      return resData.data || [];
    }

    return [];
  } catch {
    console.error('获取图片分类列表失败');
    return [];
  }
};

/**
 * 上传图片结果
 */
export interface UploadImageResult {
  success: boolean;
  path?: string;
  cloudUrl?: string | null;
  message?: string;
}

/**
 * 上传图片文件（使用统一上传接口）
 * 返回: { name, size, type, path, cloudUrl }
 */
export const uploadImage = async (blob: Blob, fileName: string): Promise<UploadImageResult> => {
  try {
    const userId = await getUserId();
    const formData = new FormData();
    formData.append('file', blob, fileName);

    // 使用统一上传接口
    const response = await request.post<any>('/common/uploadFile?fileType=image', formData, {
      headers: {
        'X-User-Id': String(userId),
      },
    });

    const resData = response.data;
    if (resData.data) {
      // 统一接口返回 { name, size, type, path, cloudUrl }
      const { path, cloudUrl } = resData.data || {};
      return {
        success: true,
        path,
        cloudUrl,
      };
    }

    return { success: false, message: '图片上传失败' };
  } catch {
    return { success: false, message: '图片上传失败' };
  }
};

/**
 * 保存图片记录参数
 */
export interface SavePictureData {
  path: string;
  name: string;
  description?: string | null;
  categoryId?: number | null;
  cloudUrl?: string;
}

/**
 * 保存图片记录结果
 */
export interface SavePictureResult {
  success: boolean;
  message?: string;
}

/**
 * 保存图片记录
 */
export const savePicture = async (data: SavePictureData): Promise<SavePictureResult> => {
  try {
    const userId = await getUserId();
    const response = await request.post<any>('/picture/add', data, {
      headers: { 'X-User-Id': String(userId) },
    });

    const resData = response.data;
    if (resData.code === 0) {
      return { success: true };
    }

    return { success: false, message: resData.msg || '保存失败' };
  } catch {
    return { success: false, message: '保存失败' };
  }
};
