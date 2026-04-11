import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * PictureCate 图片分类模型属性接口
 */
interface PictureCateAttributes {
  id: number;
  icon: string | null;
  name: string;
  orders: number;
  counts: number;
  userId: number;
}

/**
 * PictureCate 创建时的可选属性
 */
interface PictureCateCreationAttributes extends Optional<PictureCateAttributes, 'id' | 'icon' | 'orders' | 'counts'> {}

/**
 * PictureCate 图片分类模型实例接口
 */
interface PictureCateInstance
  extends Model<PictureCateAttributes, PictureCateCreationAttributes>,
    PictureCateAttributes {}

const PictureCate = sequelize.define<PictureCateInstance, PictureCateCreationAttributes>(
  'PictureCate',
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
    tableName: 'PictureCate',
    indexes: [{ fields: ['userId'] }, { fields: ['orders'] }, { fields: ['userId', 'orders'] }],
  },
);

export default PictureCate;
export type { PictureCateInstance, PictureCateAttributes, PictureCateCreationAttributes };