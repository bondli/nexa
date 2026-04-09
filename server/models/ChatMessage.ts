import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * Checkpoint 模型属性接口 - 用于 langgraph 状态持久化
 */
interface CheckpointAttributes {
  sessionId: string;
  checkpointNs: string;
  checkpointId?: string;
  parentCheckpointId?: string;
  checkpoint: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

/**
 * Checkpoint 创建时的可选属性
 */
interface CheckpointCreationAttributes extends Optional<
  CheckpointAttributes,
  'checkpointId' | 'parentCheckpointId' | 'metadata' | 'createdAt'
> {}

/**
 * Checkpoint 模型实例接口
 */
interface CheckpointInstance extends Model<CheckpointAttributes, CheckpointCreationAttributes>, CheckpointAttributes {}

const ChatMessage = sequelize.define<CheckpointInstance, CheckpointCreationAttributes>(
  'ChatMessage',
  {
    sessionId: {
      type: DataTypes.STRING(255),
      field: 'session_id',
      primaryKey: true,
    },
    checkpointNs: {
      type: DataTypes.STRING(255),
      field: 'checkpoint_ns',
      primaryKey: true,
    },
    checkpointId: {
      type: DataTypes.STRING(255),
      field: 'checkpoint_id',
      allowNull: true,
    },
    parentCheckpointId: {
      type: DataTypes.STRING(255),
      field: 'parent_checkpoint_id',
      allowNull: true,
    },
    checkpoint: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
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
        fields: ['session_id', 'checkpoint_ns', 'checkpoint_id', 'created_at'],
      },
    ],
  },
);

export default ChatMessage;
export type { CheckpointInstance, CheckpointAttributes, CheckpointCreationAttributes };
