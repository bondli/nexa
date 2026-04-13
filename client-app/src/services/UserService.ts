import DatabaseService from './DataBaseService';

export interface User {
  id: number;
  name: string;
  avatar: string;
  role: string;
};

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

  static async getUserList(): Promise<User[]> {
    try {
      const query = 'SELECT id, name FROM user';
      const result = await DatabaseService.executeQuery(query);
      return result as User[];
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

}

export default UserService;