import { Column, Table, DataType } from 'sequelize-typescript';
import { BaseModel } from './base.model';

@Table({ tableName: 'documents' })
export class Document extends BaseModel {
  @Column({ type: DataType.STRING(255), allowNull: false })
  name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  url: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  mimetype: string;

  @Column({ type: DataType.BIGINT, allowNull: true })
  size: number;

  @Column({ type: DataType.STRING(255), allowNull: false, unique: true })
  path: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  width: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  height: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  duration: number;

  @Column({ type: DataType.UUID, allowNull: true })
  userId: string;
}
