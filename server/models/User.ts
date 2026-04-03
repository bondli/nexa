import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * User 用户模型属性接口（用于查询和更新）
 */
interface UserAttributes {
  id: number;
  avatar: string | null;
  name: string;
  password: string;
  email: string | null;
  status: string;
  extra: string | null;
}

/**
 * User 创建时的可选属性
 */
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'avatar' | 'email' | 'status' | 'extra'> {}

/**
 * User 用户模型实例接口
 */
interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {}

const User = sequelize.define<UserInstance, UserCreationAttributes>(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    avatar: {
      comment: '头像',
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      comment: '用户名',
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      comment: '密码',
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '123456',
    },
    email: {
      comment: '邮箱',
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      comment: '状态',
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'normal',
    },
    extra: {
      comment: '额外信息',
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'User',
  },
);

export default User;
export type { UserInstance, UserAttributes, UserCreationAttributes };
