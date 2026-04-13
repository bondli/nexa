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
  scateId: number;
  userId: number;
  status: string;
  deadline: Date | null;
  priority: number;
  tags: string[];
  createdAt: string;
};

class NoteService {
  static async getNoteList(page: number = 1, pageSize: number = 20, NoteTime?: string): Promise<{ data: Note[], total: number }> {
    try {
      const offset = (page - 1) * pageSize;
      
      // 构建查询条件
      const whereClause = `WHERE 1=1`;
      
      
      const query = `SELECT * FROM \`Note\` ${whereClause} Note BY createdAt DESC LIMIT ${pageSize} OFFSET ${offset}`;
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
        throw { code: 404, message: '没有找到订单' };
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