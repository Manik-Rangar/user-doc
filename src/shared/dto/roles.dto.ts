import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ModuleType } from '@jkt/enums';
import { IsModulePermissions } from './users.dto';

enum sortByRole {
  NAME = 'name',
  CREATEDAT = 'createdAt',
}

export class CreateAndUpdateRoleDto {
  @ApiProperty({ description: 'Role Title' })
  @IsString({ message: 'Required field' })
  @MaxLength(50)
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Permissions' })
  @IsObject()
  @IsModulePermissions({
    message:
      'Each permission value must be a 4-character string consisting of only 0 and 1.',
  })
  permissions: {
    [key in ModuleType]?: string;
  };
}

export class UpdateRoleDto {
  @ApiProperty({ description: 'Role Title' })
  @IsString({ message: 'Required field' })
  @MaxLength(50)
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Permissions' })
  @IsObject()
  @IsModulePermissions({
    message:
      'Each permission value must be a 4-character string consisting of only 0 and 1.',
  })
  permissions: {
    [key in ModuleType]?: string;
  };
}

export class FilterRoleDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  search: string;

  @ApiProperty({
    required: false,
    enum: sortByRole,
  })
  @IsEnum(sortByRole)
  @IsOptional()
  declare sortBy: sortByRole;
}
