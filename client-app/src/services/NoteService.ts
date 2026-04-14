import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 扩展 dayjs 插件
dayjs.extend(utc);
dayjs.extend(timezone);

// 设置默认时区为 Asia/Shanghai
dayjs.tz.setDefault('Asia/Shanghai');

import DatabaseService from './DataBaseService';

export interface Note {
  id: number;
  title: string;
  desc: string;
  cateId: number;
  userId: number;
  status: string;
  deadline: Date | null;
  priority: number;
  tags: string[];
  createdAt: string;
};

class NoteService {
  static async getNoteList(page: number = 1, pageSize: number = 20, cateId?: string): Promise<{ data: Note[], total: number }> {
    try {
      const offset = (page - 1) * pageSize;
      
      // 构建查询条件
      let whereClause = `WHERE 1=1`;
      if (cateId) {
        // 如果cateId是all/done/today/trash的时候
        if (['all', 'done', 'today', 'trash'].includes(cateId)) {
          if (cateId === 'all') {
            whereClause += ` AND status = 'undo'`;
          } else if (cateId === 'done') {
            whereClause += ` AND status = 'done'`;
          } else if (cateId === 'today') {
            const today = dayjs().startOf('day').toISOString();
            const tomorrow = dayjs().endOf('day').toISOString();
            whereClause += ` AND deadline >= '${today}' AND deadline <= '${tomorrow}' AND status = 'undo'`;
          } else if (cateId === 'trash') {
            whereClause += ` AND status = 'deleted'`;
          }
        } else {
          // 否则就是普通的分类ID
          whereClause += ` status = 'undo' AND cateId = \`${cateId}\``;
        }
      }
      
      
      const query = `SELECT * FROM \`Note\` ${whereClause} Order BY createdAt DESC LIMIT ${pageSize} OFFSET ${offset}`;
      const countQuery = `SELECT COUNT(*) as total FROM \`Note\` ${whereClause}`;
      
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
        data: formattedResult as Note[],
        total: countResult[0]?.total || 0
      };
    } catch (error) {
      console.error('Error fetching note list:', error);
      throw error;
    }
  }

  static async getNoteDetail(NoteId: number): Promise<{ detailInfo: Note }> {
    let NoteDetailInfo = null;
    try {
      const result = await DatabaseService.executeQuery(`SELECT * FROM \`Note\` WHERE id = '${NoteId}'`);
      if (result.length > 0) {
        // 使用 dayjs 处理时区
        result[0].createdAt = dayjs(result[0].createdAt).format('YYYY-MM-DD HH:mm:ss');
        NoteDetailInfo = result[0] as Note;
      } else {
        throw { code: 404, message: '没有找到笔记' };
      }
      return {
        detailInfo: NoteDetailInfo,
      };
    } catch (error) {
      console.error(`Error fetching Note with Note ${NoteId}:`, error);
      throw error;
    }
  }

}

export default NoteService;