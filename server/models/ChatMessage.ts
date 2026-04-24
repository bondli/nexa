import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * 消息模型属性接口 - 每条消息一行记录
 */
interface MessageAttributes {
  id: number;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
}

/**
 * 消息创建时的可选属性
 */
interface MessageCreationAttributes extends Optional<
  MessageAttributes,
  'id' | 'createdAt'
> {}

/**
 * 消息模型实例接口
 */
interface MessageInstance extends Model<MessageAttributes, MessageCreationAttributes>, MessageAttributes {}

const ChatMessage = sequelize.define<MessageInstance, MessageCreationAttributes>(
  'ChatMessage',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sessionId: {
      type: DataTypes.STRING(255),
      field: 'session_id',
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'ChatMessage',
    timestamps: false,
    indexes: [
      {
        fields: ['session_id', 'created_at'],
      },
    ],
  },
);

export default ChatMessage;
export type { MessageInstance, MessageAttributes, MessageCreationAttributes };
