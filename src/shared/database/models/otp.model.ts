import { Column, DataType, Table } from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { OtpType } from '@jkt/enums';

@Table({ tableName: 'otps' })
export class OTP extends BaseModel {
  @Column(DataType.INTEGER)
  otp: number;

  @Column(DataType.STRING)
  userId: string;

  @Column({
    type: DataType.ENUM({
      values: Object.keys(OtpType),
    }),
  })
  type: string;

  @Column(DataType.DATE)
  expiration: Date;
}
