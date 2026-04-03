import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * Knowledge 知识库模型属性接口
 */
interface KnowledgeAttributes {
  id: number;
  name: string;
  description: string | null;
  counts: number;
  userId: number;
}

/**
 * Knowledge 创建时的可选属性
 */
interface KnowledgeCreationAttributes extends Optional<KnowledgeAttributes, 'id' | 'description' | 'counts'> {}

/**
 * Knowledge 知识库模型实例接口
 */
interface KnowledgeInstance extends Model<KnowledgeAttributes, KnowledgeCreationAttributes>, KnowledgeAttributes {}

const Knowledge = sequelize.define<KnowledgeInstance, KnowledgeCreationAttributes>(
  'Knowledge',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '知识库名称',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '知识库描述',
    },
    counts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '知识库条目数量',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID',
      field: 'user_id',
    },
  },
  {
    tableName: 'Knowledge',
  },
);

export default Knowledge;
export type { KnowledgeInstance, KnowledgeAttributes, KnowledgeCreationAttributes };
