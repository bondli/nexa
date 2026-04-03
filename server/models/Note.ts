import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * Note 笔记模型属性接口
 */
interface NoteAttributes {
  id: number;
  title: string;
  desc: string | null;
  cateId: number;
  userId: number;
  status: string;
  deadline: Date | null;
  priority: number;
  tags: string[];
}

/**
 * Note 创建时的可选属性
 */
interface NoteCreationAttributes extends Optional<NoteAttributes, 'id' | 'desc' | 'status' | 'deadline' | 'tags'> {}

/**
 * Note 笔记模型实例接口
 */
interface NoteInstance extends Model<NoteAttributes, NoteCreationAttributes>, NoteAttributes {}

const Note = sequelize.define<NoteInstance, NoteCreationAttributes>(
  'Note',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      comment: '笔记标题',
      type: DataTypes.STRING,
      allowNull: false,
    },
    desc: {
      comment: '笔记详情',
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cateId: {
      comment: '分类id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      comment: '用户id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      comment: '状态',
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'undo',
    },
    deadline: {
      comment: '截止时间',
      type: DataTypes.DATE,
      allowNull: true,
    },
    priority: {
      comment: '优先级',
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 4,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: '标签列表',
    },
  },
  {
    tableName: 'Note',
    indexes: [
      { fields: ['userId'] },
      { fields: ['cateId'] },
      { fields: ['status'] },
      { fields: ['userId', 'cateId'] },
      { fields: ['userId', 'status'] },
      { fields: ['deadline'] },
      { fields: ['updatedAt'] },
    ],
  },
);

export default Note;
export type { NoteInstance, NoteAttributes, NoteCreationAttributes };
