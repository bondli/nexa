import DatabaseService from './DataBaseService';

export interface User {
  id: number;
  name: string;
  avatar: string;
  role: string;
};

export interface SummaryData {
  totalNotes: number;
  totalArticles: number;
  totalPictures: number;
}

class UserService {
  static async userLogin(username: string, password: string): Promise<User> {
    try {
      const query = `SELECT id, name FROM user WHERE name = '${username}' AND password = '${password}'`;
      const result = await DatabaseService.executeQuery(query);
      console.log(result);
      if (result.length > 0) {
        return result[0];
      } else {
        throw { code: 401, message: '用户名或者密码错误' };
      }
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  // 获取应用数据
  static async getSystemData(): Promise<SummaryData> {
    try {
      const query1 = 'SELECT COUNT(*) as totalNotes FROM `Note` where status = \'undo\'';
      const result1 = await DatabaseService.executeQuery(query1);

      const query2 = 'SELECT COUNT(*) as totalArticles FROM `Article` where status = \'normal\'';
      const result2 = await DatabaseService.executeQuery(query2);

      const query3 = 'SELECT COUNT(*) as totalPictures FROM `Picture` where status = \'normal\'';
      const result3 = await DatabaseService.executeQuery(query3);

      return {
        totalNotes: result1[0].totalNotes,
        totalArticles: result2[0].totalArticles,
        totalPictures: result3[0].totalPictures,
      };
    } catch (error) {
      console.error('Error fetching System Data:', error);
      throw error;
    }
  }

}

export default UserService;