import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 扩展 dayjs 插件
dayjs.extend(utc);
dayjs.extend(timezone);

// 设置默认时区为 Asia/Shanghai
dayjs.tz.setDefault('Asia/Shanghai');

import config from '../../config.json';
import DatabaseService from './DataBaseService';

export interface Picture {
  id: number;
  path: string;
  name: string;
  description: string | null;
  categoryId: number | null;
  userId: number;
  status: 'normal' | 'deleted';
  cloudUrl: string | null;
  createdAt: string;
}

// 图片分类
export interface PictureCate {
  id: number;
  name: string;
  counts: number;
}

// 云端 API 配置
const CLOUD_API = config.cloudApi || {
  endpoint: 'http://davebella.top/pos/common/upload',
  apiKey: ''
};

class PictureService {
  /**
   * 上传图片到云端
   * @param uri 图片本地 URI
   * @param fileName 文件名
   * @returns 云端返回的图片 URL
   */
  static async uploadToCloud(uri: string, fileName: string): Promise<string> {
    try {
      // 构建 formData
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        name: fileName,
        type: getMimeType(fileName),
      } as any);

      // 调用云端上传接口
      const response = await fetch(CLOUD_API.endpoint, {
        method: 'POST',
        headers: {
          'x-api-key': CLOUD_API.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`上传失败: ${response.status}`);
      }

      const result = await response.json();

      // 提取云端返回的图片 URL
      // 根据云端返回格式可能需要调整
      const cloudUrl = result?.url || result?.data?.url || result?.path;

      if (!cloudUrl) {
        throw new Error('云端未返回图片地址');
      }

      return cloudUrl;
    } catch (error) {
      console.error('Error uploading to cloud:', error);
      throw error;
    }
  }

  /**
   * 获取图片列表
   * @param page 页码
   * @param pageSize 每页数量
   * @param categoryId 可选的分类ID筛选
   */
  static async getPictureList(page: number = 1, pageSize: number = 20, categoryId?: number | null): Promise<{ data: Picture[], total: number }> {
    try {
      const offset = (page - 1) * pageSize;

      // 构建查询条件
      let whereClause = `WHERE status = 'normal'`;
      if (categoryId !== undefined && categoryId !== null) {
        whereClause += ` AND categoryId = ${categoryId}`;
      }

      const query = `SELECT * FROM \`Picture\` ${whereClause} ORDER BY createdAt DESC LIMIT ${pageSize} OFFSET ${offset}`;
      const countQuery = `SELECT COUNT(*) as total FROM \`Picture\` ${whereClause}`;

      const result = await DatabaseService.executeQuery(query);
      const countResult = await DatabaseService.executeQuery(countQuery);

      // 处理时间格式
      const formattedResult = result.map((item: any) => {
        return {
          ...item,
          createdAt: dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss')
        };
      });

      return {
        data: formattedResult as Picture[],
        total: countResult[0]?.total || 0
      };
    } catch (error) {
      console.error('Error fetching picture list:', error);
      throw error;
    }
  }

  /**
   * 获取图片分类列表
   */
  static async getCategories(): Promise<PictureCate[]> {
    try {
      const query = `SELECT id, name, counts FROM \`PictureCate\` ORDER BY orders ASC`;
      const result = await DatabaseService.executeQuery(query);
      return result as PictureCate[];
    } catch (error) {
      console.error('Error fetching picture categories:', error);
      throw error;
    }
  }

  /**
   * 创建图片记录（包含云端 URL）
   * @param cloudUrl 云端图片地址
   * @param name 图片名称
   * @param userId 用户ID
   * @param categoryId 可选的分类ID
   */
  static async createPicture(cloudUrl: string, name: string, userId: number = 1, categoryId?: number | null): Promise<void> {
    try {
      // 对输入进行转义处理，防止 SQL 注入
      const escapedCloudUrl = cloudUrl.replace(/'/g, "''");
      const escapedName = name.replace(/'/g, "''");

      // 同时存储 path 和 cloudUrl（path 存云端地址，cloudUrl 存同一地址用于兼容）
      const categoryPart = categoryId ? `, categoryId = ${categoryId}` : '';
      const query = `INSERT INTO \`Picture\` (path, cloudUrl, name, userId, status, createdAt, updatedAt${categoryPart}) VALUES ('${escapedCloudUrl}', '${escapedCloudUrl}', '${escapedName}', ${userId}, 'normal', now(), now())`;
      await DatabaseService.executeUpdate(query);
    } catch (error) {
      console.error('Error creating picture:', error);
      throw error;
    }
  }

  /**
   * 获取图片详情
   * @param pictureId 图片ID
   */
  static async getPictureDetail(pictureId: number): Promise<{ detailInfo: Picture }> {
    let pictureDetailInfo = null;
    try {
      const result = await DatabaseService.executeQuery(`SELECT * FROM \`Picture\` WHERE id = '${pictureId}'`);
      if (result.length > 0) {
        result[0].createdAt = dayjs(result[0].createdAt).format('YYYY-MM-DD HH:mm:ss');
        pictureDetailInfo = result[0] as Picture;
      } else {
        throw { code: 404, message: '没有找到图片' };
      }
      return {
        detailInfo: pictureDetailInfo,
      };
    } catch (error) {
      console.error(`Error fetching picture with id ${pictureId}:`, error);
      throw error;
    }
  }
}

/**
 * 根据文件名获取 MIME 类型
 */
function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    default:
      return 'image/jpeg';
  }
}

export default PictureService;
