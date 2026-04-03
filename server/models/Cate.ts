import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * Cate 分类模型属性接口
 */
interface CateAttributes {
  id: number;
  icon: string | null;
  name: string;
  orders: number;
  counts: number;
  userId: number;
}

/**
 * Cate 创建时的可选属性
 */
interface CateCreationAttributes extends Optional<CateAttributes, 'id' | 'icon' | 'orders' | 'counts'> {}

/**
 * Cate 分类模型实例接口
 */
interface CateInstance extends Model<CateAttributes, CateCreationAttributes>, CateAttributes {}

const Cate = sequelize.define<CateInstance, CateCreationAttributes>(
  'Cate',
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
    tableName: 'Cate',
    indexes: [{ fields: ['userId'] }, { fields: ['orders'] }, { fields: ['userId', 'orders'] }],
  },
);

export default Cate;
export type { CateInstance, CateAttributes, CateCreationAttributes };
