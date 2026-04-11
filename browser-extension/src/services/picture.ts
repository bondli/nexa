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
  message?: string;
}

/**
 * 上传图片文件
 */
export const uploadImage = async (blob: Blob, fileName: string): Promise<UploadImageResult> => {
  try {
    const userId = await getUserId();
    const formData = new FormData();
    formData.append('file', blob, fileName);

    const response = await request.post<any>('/common/uploadImage', formData, {
      headers: {
        'X-User-Id': String(userId),
      },
    });

    const resData = response.data;
    if (resData.data) {
      // 上传接口返回 { url: "http://host/files/xxx.jpg", filePath: "..." }
      // path 只取 pathname 部分，去掉域名和端口
      const fullUrl: string = resData.data.url || resData.data.filePath || resData.data;
      let path = fullUrl;
      try {
        path = new URL(fullUrl).pathname.replace(/^\//, '');
      } catch {
        // fullUrl 本身就是相对路径，直接使用
      }
      return { success: true, path };
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
