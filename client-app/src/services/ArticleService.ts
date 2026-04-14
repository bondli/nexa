import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 扩展 dayjs 插件
dayjs.extend(utc);
dayjs.extend(timezone);

// 设置默认时区为 Asia/Shanghai
dayjs.tz.setDefault('Asia/Shanghai');

import DatabaseService from './DataBaseService';

export interface Article {
  id: number;
  title: string;
  desc: string;
  url: string;
  cateId: number;
  userId: number;
  status: string;
  createdAt: string;
};

class ArticleService {
  static async getArticleList(page: number = 1, pageSize: number = 20, cateId?: string): Promise<{ data: Article[], total: number }> {
    try {
      const offset = (page - 1) * pageSize;

      let isTemp = false;
      
      // 构建查询条件
      let whereClause = `WHERE 1=1`;
      if (cateId === 'trash') {
        whereClause += ` AND status = 'deleted'`;
      } else if (cateId === 'all') {
        whereClause += ` AND status = 'normal'`;
      } else if (cateId === 'temp') {
        // 记录是查临时表，后续需要根据这个字段换个表查询
        isTemp = true;
      } else {
        // 否则就是普通的分类ID
        whereClause += ` status = 'undo' AND cateId = \`${cateId}\``;
      }
      
      
      let query = `SELECT * FROM \`Article\` ${whereClause} Order BY createdAt DESC LIMIT ${pageSize} OFFSET ${offset}`;
      let countQuery = `SELECT COUNT(*) as total FROM \`Article\` ${whereClause}`;

      if (isTemp) {
        query = `SELECT * FROM \`TempArticle\` ${whereClause} Order BY createdAt DESC LIMIT ${pageSize} OFFSET ${offset}`;
        countQuery = `SELECT COUNT(*) as total FROM \`TempArticle\` ${whereClause}`;
      }
      
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
        data: formattedResult as Article[],
        total: countResult[0]?.total || 0
      };
    } catch (error) {
      console.error('Error fetching Article list:', error);
      throw error;
    }
  }

  static async getArticleDetail(ArticleId: number): Promise<{ detailInfo: Article }> {
    let ArticleDetailInfo = null;
    try {
      const result = await DatabaseService.executeQuery(`SELECT * FROM \`Article\` WHERE id = '${ArticleId}'`);
      if (result.length > 0) {
        // 使用 dayjs 处理时区
        result[0].createdAt = dayjs(result[0].createdAt).format('YYYY-MM-DD HH:mm:ss');
        ArticleDetailInfo = result[0] as Article;
      } else {
        throw { code: 404, message: '没有找到笔记' };
      }
      return {
        detailInfo: ArticleDetailInfo,
      };
    } catch (error) {
      console.error(`Error fetching Article with Article ${ArticleId}:`, error);
      throw error;
    }
  }

}

export default ArticleService;