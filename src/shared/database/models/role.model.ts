import { Column, Table, DataType } from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { ModuleType } from '@jkt/enums';

@Table({ tableName: 'roles' })
export class Role extends BaseModel {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    validate: {
      isValidPermissions(value: { [key in ModuleType]?: string }) {
        Object.values(value).forEach((permission) => {
          if (!/^[01]{4}$/.test(permission)) {
            throw new Error(
              'Each permission value must be a 4-character string consisting of only 0 and 1.',
            );
          }
        });
      },
    },
  })
  permissions: {
    [key in ModuleType]?: string;
  };
}
