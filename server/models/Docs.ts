import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * Docs 文档模型属性接口
 */
interface DocsAttributes {
  id: number;
  name: string;
  desc: string | null;
  path: string | null;
  userId: number;
  noteId: number | null;
  knowledgeId: number;
  status: string;
  size: number | null;
  type: string | null;
  indexedAt: Date | null;
  cloudUrl: string | null;
  content: string | null;
}

/**
 * Docs 创建时的可选属性
 */
interface DocsCreationAttributes extends Optional<
  DocsAttributes,
  'id' | 'desc' | 'path' | 'noteId' | 'status' | 'size' | 'type' | 'indexedAt' | 'cloudUrl' | 'content'
> {}

/**
 * Docs 文档模型实例接口
 */
interface DocsInstance extends Model<DocsAttributes, DocsCreationAttributes>, DocsAttributes {}

const Docs = sequelize.define<DocsInstance, DocsCreationAttributes>(
  'Docs',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      comment: '文档名',
      type: DataTypes.STRING,
      allowNull: false,
    },
    desc: {
      comment: '文档描述',
      type: DataTypes.TEXT,
      allowNull: true,
    },
    path: {
      comment: '文档路径',
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      comment: '用户id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    noteId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '笔记ID',
    },
    knowledgeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '知识库ID',
    },
    status: {
      comment: '状态',
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'normal',
    },
    size: {
      comment: '文档大小',
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    type: {
      comment: '文档类型',
      type: DataTypes.STRING,
      allowNull: true,
    },
    indexedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '索引时间',
    },
    cloudUrl: {
      comment: '云端链接',
      type: DataTypes.STRING,
      allowNull: true,
    },
    content: {
      comment: '文档文本内容（用于 RAG）',
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'Docs',
  },
);

export default Docs;
export type { DocsInstance, DocsAttributes, DocsCreationAttributes };
