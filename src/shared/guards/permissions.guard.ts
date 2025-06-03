import { ModuleType, PermissionType } from '@jkt/enums';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      {
        module: ModuleType;
        permission: PermissionType;
      }[]
    >('permissions', [context.getHandler(), context.getClass()]);

    const currentPermission = requiredPermissions?.length
      ? requiredPermissions[0]
      : null;
    if (!currentPermission) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    switch (request.method) {
      case 'GET':
        currentPermission.permission = PermissionType.READ;
        break;
      case 'POST':
        currentPermission.permission = PermissionType.CREATE;
        break;
      case 'PATCH':
        currentPermission.permission = PermissionType.UPDATE;
        break;
      case 'PUT':
        currentPermission.permission = PermissionType.UPDATE;
        break;
      case 'DELETE':
        currentPermission.permission = PermissionType.DELETE;
        break;
    }

    const user = request.user;
    if (user?.isCustomer) return true;
    const { role } = user;
    const userPermissions: {
      [key in ModuleType]?: string;
    } = role.permissions;

    request.user['permissions'] = userPermissions;

    const modulePermissions =
      userPermissions[currentPermission.module] ?? '0000';
    let access = false;
    switch (currentPermission.permission) {
      case PermissionType.CREATE:
        access = (+modulePermissions?.[0] || 0) as unknown as boolean;
        break;
      case PermissionType.READ:
        access = (+modulePermissions?.[1] || 0) as unknown as boolean;
        break;
      case PermissionType.UPDATE:
        access = (+modulePermissions?.[2] || 0) as unknown as boolean;
        break;
      case PermissionType.DELETE:
        access = (+modulePermissions?.[3] || 0) as unknown as boolean;
        break;
      default:
        access = false;
    }
    if (!access)
      throw new HttpException(
        `Unauthorized ${currentPermission.module.toLocaleLowerCase()} module`,
        HttpStatus.FORBIDDEN,
      );
    return access;
  }
}
