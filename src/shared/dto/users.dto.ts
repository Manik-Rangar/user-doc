import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { USER_MIN_NAME_SIZE, USER_MIN_PASSWORD_SIZE } from '@jkt/constants';
import { ModuleType } from '@jkt/enums';

enum sortByUser {
  NAME = 'name',
  EMAIL = 'email',
  PHONE = 'phone',
  ROLE_ID = 'roleId',
  CREATEDAT = 'createdAt',
}

enum sortByRole {
  NAME = 'name',
  CREATEDAT = 'createdAt',
}

@ValidatorConstraint({ async: false })
export class ModulePermissionsValidator
  implements ValidatorConstraintInterface
{
  validate(value: any) {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const validKeys = Object.values(ModuleType) as string[];
    return (
      Object.values(value).every((permission) =>
        /^[01]{4}$/.test(permission as string),
      ) && Object.keys(value).every((key) => validKeys.includes(key))
    );
  }

  defaultMessage() {
    return 'Each permission value must be a 4-character string consisting of only 0 and 1, and keys must be valid module types.';
  }
}

export function IsModulePermissions(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ModulePermissionsValidator,
    });
  };
}

export class CreateUserDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(USER_MIN_NAME_SIZE, {
    message: `Name must be at least '${USER_MIN_NAME_SIZE} characters long.`,
  })
  name: string;

  @ApiProperty({ required: true })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(USER_MIN_PASSWORD_SIZE, {
    message: `Password must be at least '${USER_MIN_PASSWORD_SIZE} characters long.`,
  })
  password: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty({ required: true })
  @IsUUID()
  roleId: string;
}

export class UpdateUserDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsOptional()
  @MinLength(USER_MIN_NAME_SIZE, {
    message: `Name must be at least '${USER_MIN_NAME_SIZE} characters long.`,
  })
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty({ required: true })
  @IsUUID()
  @IsOptional()
  roleId: string;
}

export class FilterUserDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  search: string;

  @ApiProperty({
    required: false,
    enum: sortByUser,
  })
  @IsEnum(sortByUser)
  @IsOptional()
  declare sortBy: sortByUser;
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
