import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * Report 报告模型属性接口
 */
interface ReportAttributes {
  id: number;
  reportDate: string;
  reportType: 'daily' | 'monthly';
  summary: string | null;
  content: string | null;
  image: string | null;
  userId: number;
}

/**
 * Report 创建时的可选属性
 */
interface ReportCreationAttributes extends Optional<ReportAttributes, 'id' | 'summary' | 'content' | 'image'> {}

/**
 * Report 报告模型实例接口
 */
interface ReportInstance extends Model<ReportAttributes, ReportCreationAttributes>, ReportAttributes {}

const Report = sequelize.define<ReportInstance, ReportCreationAttributes>(
  'Report',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    reportDate: {
      comment: '报告日期',
      type: DataTypes.STRING,
      allowNull: false,
    },
    reportType: {
      comment: '报告类型 daily:日报 monthly:月报',
      type: DataTypes.ENUM('daily', 'monthly'),
      allowNull: false,
    },
    summary: {
      comment: '报告摘要',
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content: {
      comment: '报告内容（Markdown格式）',
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      comment: '报告缩略图',
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      comment: '用户id',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'Report',
    indexes: [
      { fields: ['userId'] },
      { fields: ['reportType'] },
      { fields: ['reportDate'] },
      { fields: ['userId', 'reportType'] },
      { fields: ['userId', 'reportDate'] },
    ],
  },
);

export default Report;
export type { ReportInstance, ReportAttributes, ReportCreationAttributes };
