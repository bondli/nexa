import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * Chat 会话模型属性接口
 */
interface ChatAttributes {
  id: number;
  sessionId: string;
  title: string;
  userId: number;
}

/**
 * Chat 创建时的可选属性
 */
interface ChatCreationAttributes extends Optional<ChatAttributes, 'id'> {}

/**
 * Chat 会话模型实例接口
 */
interface ChatInstance extends Model<ChatAttributes, ChatCreationAttributes>, ChatAttributes {}

const Chat = sequelize.define<ChatInstance, ChatCreationAttributes>(
  'Chat',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sessionId: {
      comment: 'sessionId',
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      comment: 'title',
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      comment: '用户id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'Chat',
  },
);

export default Chat;
export type { ChatInstance, ChatAttributes, ChatCreationAttributes };
