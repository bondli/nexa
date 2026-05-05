import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * Skill 模型属性接口
 */
interface SkillAttributes {
  id: number;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string | null;
  tags: string | null;
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Skill 创建时的可选属性
 */
interface SkillCreationAttributes extends Optional<SkillAttributes, 'id' | 'enabled' | 'category' | 'tags'> {}

/**
 * Skill 模型实例接口
 */
interface SkillInstance extends Model<SkillAttributes, SkillCreationAttributes>, SkillAttributes {}

const Skill = sequelize.define<SkillInstance, SkillCreationAttributes>(
  'Skill',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      comment: 'skill名称',
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      comment: 'skill描述',
      type: DataTypes.TEXT,
      allowNull: false,
    },
    version: {
      comment: '版本号',
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      comment: '作者',
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      comment: '分类',
      type: DataTypes.STRING,
      allowNull: true,
    },
    tags: {
      comment: '标签，JSON数组格式',
      type: DataTypes.STRING,
      allowNull: true,
    },
    enabled: {
      comment: '是否启用',
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'skill',
  },
);

export default Skill;
export type { SkillInstance, SkillAttributes, SkillCreationAttributes };
