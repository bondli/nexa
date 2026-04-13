import { NativeModules } from 'react-native';

const { MySQLManager } = NativeModules;

interface MySQLManagerInterface {
  /**
   * 连接到 MySQL 数据库
   * @param host 数据库主机地址
   * @param port 数据库端口
   * @param database 数据库名称
   * @param username 用户名
   * @param password 密码
   */
  connect(host: string, port: number, database: string, username: string, password: string): Promise<string>;

  /**
   * 执行查询语句
   * @param query SQL 查询语句
   */
  executeQuery(query: string): Promise<any[]>;

  /**
   * 执行更新语句（INSERT, UPDATE, DELETE）
   * @param query SQL 更新语句
   */
  executeUpdate(query: string): Promise<number>;

  /**
   * 关闭数据库连接
   */
  disconnect(): Promise<string>;
}

const MySQLManagerModule: MySQLManagerInterface = {
  connect: (host: string, port: number, database: string, username: string, password: string): Promise<string> => {
    if (!MySQLManager) {
      return Promise.reject(new Error('MySQLManager module not available'));
    }
    return MySQLManager.connect(host, port, database, username, password);
  },

  executeQuery: (query: string): Promise<any[]> => {
    if (!MySQLManager) {
      return Promise.reject(new Error('MySQLManager module not available'));
    }
    return MySQLManager.executeQuery(query);
  },

  executeUpdate: (query: string): Promise<number> => {
    if (!MySQLManager) {
      return Promise.reject(new Error('MySQLManager module not available'));
    }
    return MySQLManager.executeUpdate(query);
  },

  disconnect: (): Promise<string> => {
    if (!MySQLManager) {
      return Promise.reject(new Error('MySQLManager module not available'));
    }
    return MySQLManager.disconnect();
  }
};

export default MySQLManagerModule;