import { Sequelize } from 'sequelize';
import logger from 'electron-log';
import { getDatabaseConfig } from '../services/config-service';

// 读取配置
const loadConfig = (): {
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
} => {
  const dbConfig = getDatabaseConfig();

  if (dbConfig && dbConfig.DB_HOST && dbConfig.DB_PORT && dbConfig.DB_NAME) {
    return {
      DB_HOST: dbConfig.DB_HOST,
      DB_PORT: dbConfig.DB_PORT,
      DB_NAME: dbConfig.DB_NAME,
      DB_USERNAME: dbConfig.DB_USERNAME || 'root',
      DB_PASSWORD: dbConfig.DB_PASSWORD || '',
    };
  }

  // 返回默认配置
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
  const Chat = require('../models/Chat').default;
  const ChatCate = require('../models/ChatCate').default;

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

  // 用户关联聊天会话分组
  User.hasMany(ChatCate, { foreignKey: 'userId', as: 'chatCates' });
  ChatCate.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // 用户关联聊天会话
  User.hasMany(Chat, { foreignKey: 'userId', as: 'chats' });
  Chat.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // 分组关联会话
  ChatCate.hasMany(Chat, { foreignKey: 'cateId', as: 'chats' });
  Chat.belongsTo(ChatCate, { foreignKey: 'cateId', as: 'chatCate' });
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
};

export default sequelize;