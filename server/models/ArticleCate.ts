import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * ArticleCate 文章分类模型属性接口
 */
interface ArticleCateAttributes {
  id: number;
  icon: string | null;
  name: string;
  orders: number;
  counts: number;
  userId: number;
}

/**
 * ArticleCate 创建时的可选属性
 */
interface ArticleCateCreationAttributes extends Optional<ArticleCateAttributes, 'id' | 'icon' | 'orders' | 'counts'> {}

/**
 * ArticleCate 文章分类模型实例接口
 */
interface ArticleCateInstance extends Model<ArticleCateAttributes, ArticleCateCreationAttributes>, ArticleCateAttributes {}

const ArticleCate = sequelize.define<ArticleCateInstance, ArticleCateCreationAttributes>(
  'ArticleCate',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    icon: {
      comment: 'icon',
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      comment: '名称',
      type: DataTypes.STRING,
      allowNull: false,
    },
    orders: {
      comment: '排序',
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    counts: {
      comment: '数量',
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
    tableName: 'ArticleCate',
    indexes: [{ fields: ['userId'] }, { fields: ['orders'] }, { fields: ['userId', 'orders'] }],
  },
);

export default ArticleCate;
export type { ArticleCateInstance, ArticleCateAttributes, ArticleCateCreationAttributes };