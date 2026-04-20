import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * Picture 图片模型属性接口
 */
interface PictureAttributes {
  id: number;
  path: string;
  name: string;
  description: string | null;
  categoryId: number | null;
  userId: number;
  status: 'normal' | 'deleted';
  cloudUrl: string | null;
}

/**
 * Picture 创建时的可选属性
 */
interface PictureCreationAttributes extends Optional<PictureAttributes, 'id' | 'description' | 'categoryId' | 'status' | 'cloudUrl'> {}

/**
 * Picture 图片模型实例接口
 */
interface PictureInstance extends Model<PictureAttributes, PictureCreationAttributes>, PictureAttributes {}

const Picture = sequelize.define<PictureInstance, PictureCreationAttributes>(
  'Picture',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    path: {
      comment: '图片相对路径',
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      comment: '图片名称',
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      comment: '图片描述',
      type: DataTypes.STRING,
      allowNull: true,
    },
    categoryId: {
      comment: '分类id',
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userId: {
      comment: '用户id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      comment: '状态 normal=正常 deleted=已删除',
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'normal',
    },
    cloudUrl: {
      comment: '云端链接',
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'Picture',
    indexes: [
      { fields: ['userId'] },
      { fields: ['categoryId'] },
      { fields: ['userId', 'categoryId'] },
      { fields: ['createdAt'] },
    ],
  },
);

export default Picture;
export type { PictureInstance, PictureAttributes, PictureCreationAttributes };