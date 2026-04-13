import MySQLManager from '@modules/MySQLManager';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

class DatabaseService {
  private static instance: DatabaseService;
  private isConnected: boolean = false;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async connect(config: DatabaseConfig): Promise<boolean> {
    try {
      if (this.isConnected) {
        console.log('Database is already connected');
        return true;
      }

      // console.log(`Attempting to connect to database at ${config.host}:${config.port}/${config.database} with user ${config.username}`);
      
      const result = await MySQLManager.connect(
        config.host,
        config.port,
        config.database,
        config.username,
        config.password
      );
      
      // console.log('Database connected:', result);
      this.isConnected = true;
      return true;
    } catch (error: any) {
      console.error('Database connection failed:', error);
      if (error.message) {
        console.error('Error message:', error.message);
      }
      if (error.code) {
        console.error('Error code:', error.code);
      }
      this.isConnected = false;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (!this.isConnected) {
        console.log('Database is not connected');
        return;
      }

      const result = await MySQLManager.disconnect();
      console.log('Database disconnected:', result);
      this.isConnected = false;
    } catch (error) {
      console.error('Database disconnection failed:', error);
      this.isConnected = false;
    }
  }

  async executeQuery(query: string): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('Database is not connected');
    }
    
    try {
      const result = await MySQLManager.executeQuery(query);
      return result;
    } catch (error) {
      console.error('Query execution failed:', error);
      throw error;
    }
  }

  async executeUpdate(query: string): Promise<number> {
    if (!this.isConnected) {
      throw new Error('Database is not connected');
    }
    
    try {
      const result = await MySQLManager.executeUpdate(query);
      return result;
    } catch (error) {
      console.error('Update execution failed:', error);
      throw error;
    }
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

export default DatabaseService.getInstance();