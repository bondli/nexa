import fs from 'fs';
import { Sequelize } from 'sequelize';
import logger from 'electron-log';
import { getConfigPath, ensureConfigDir } from './setting';

const configPath = getConfigPath();

// 读取配置
const loadConfig = (): {
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
} => {
  ensureConfigDir();
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (error) {
      logger.error('读取配置文件失败，使用默认配置:', error);
    }
  }
  return {
    DB_HOST: 'localhost',
    DB_PORT: 3306,
    DB_NAME: 'nexa',
    DB_USERNAME: 'root',
    DB_PASSWORD: '',
  };
};

const configObj = loadConfig();

// 数据库配置
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: configObj.DB_HOST,
  port: Number(configObj.DB_PORT),
  username: configObj.DB_USERNAME,
  password: configObj.DB_PASSWORD,
  database: configObj.DB_NAME,
  logging: false,
  timezone: '+08:00',
});

// 建立模型关联（延迟导入避免循环依赖）
const setupAssociations = (): void => {
  // 延迟导入模型，避免循环依赖
  const User = require('../models/User').default;
  const Note = require('../models/Note').default;
  const Cate = require('../models/Cate').default;
  const Knowledge = require('../models/Knowledge').default;
  const Docs = require('../models/Docs').default;

  // 用户关联笔记
  User.hasMany(Note, { foreignKey: 'userId', as: 'notes' });
  Note.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // 用户关联分类
  User.hasMany(Cate, { foreignKey: 'userId', as: 'cates' });
  Cate.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // 分类自关联（父子分类）
  Cate.hasMany(Cate, { foreignKey: 'parentId', as: 'children' });
  Cate.belongsTo(Cate, { foreignKey: 'parentId', as: 'parent' });

  // 用户关联知识库
  User.hasMany(Knowledge, { foreignKey: 'userId', as: 'knowledges' });
  Knowledge.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // 知识库关联文档
  Knowledge.hasMany(Docs, {
    foreignKey: 'knowledgeId',
    as: 'documents',
  });
  Docs.belongsTo(Knowledge, {
    foreignKey: 'knowledgeId',
    as: 'knowledge',
  });

  // 笔记关联知识库文档
  Note.hasMany(Docs, { foreignKey: 'noteId', as: 'documents' });
  Docs.belongsTo(Note, { foreignKey: 'noteId', as: 'note' });
};

// 测试数据库连接
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
  } catch (error) {
    logger.error('数据库连接失败:', error);
    throw error;
  }
};

// 同步数据库模型
export const syncDatabase = async (force = false): Promise<void> => {
  try {
    // 建立模型关联
    setupAssociations();

    // 先尝试不强制创建，忽略已有表
    await sequelize.sync({ force: false });
    logger.info('数据库模型同步成功');
  } catch (error: any) {
    logger.error('数据库模型同步失败:', error.message || error);
    // 如果失败，尝试强制创建（会删除旧表）
    try {
      await sequelize.sync({ force: true });
      logger.info('数据库模型同步成功（强制重建）');
    } catch (retryError: any) {
      logger.error('数据库模型强制同步也失败:', retryError.message || retryError);
      throw retryError;
    }
  }

  // 确保 checkpoints 表存在且结构正确
  await ensureChatMessagesTable();
};

// 确保 chat_messages 表存在
const ensureChatMessagesTable = async (): Promise<void> => {
  try {
    // 检查表是否存在
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = 'chat_messages'
    `);

    const count = (results as Array<{ count: number }>)[0]?.count || 0;

    if (count === 0) {
      // 创建 chat_messages 表（简化版）
      await sequelize.query(`
        CREATE TABLE chat_messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          session_id VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_session (session_id, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      logger.info('chat_messages 表创建成功');
    }
  } catch (error) {
    logger.error('确保 chat_messages 表存在时出错:', error);
  }
};

export default sequelize;