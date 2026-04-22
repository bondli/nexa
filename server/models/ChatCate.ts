import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * ChatCate 聊天会话分组模型属性接口
 */
interface ChatCateAttributes {
  id: number;
  name: string;
  counts: number;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * ChatCate 创建时的可选属性
 */
interface ChatCateCreationAttributes extends Optional<ChatCateAttributes, 'id' | 'counts'> {}

/**
 * ChatCate 聊天会话分组模型实例接口
 */
interface ChatCateInstance extends Model<ChatCateAttributes, ChatCateCreationAttributes>, ChatCateAttributes {}

const ChatCate = sequelize.define<ChatCateInstance, ChatCateCreationAttributes>(
  'ChatCate',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      comment: '分组名称',
      type: DataTypes.STRING,
      allowNull: false,
    },
    counts: {
      comment: '会话数量',
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    userId: {
      comment: '用户id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'ChatCate',
  },
);

export default ChatCate;
export type { ChatCateInstance, ChatCateAttributes, ChatCateCreationAttributes };