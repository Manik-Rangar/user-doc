import { ModuleType } from '@jkt/enums';
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const MODULE_KEY = 'module';

export const Permissions = (module: ModuleType) =>
  SetMetadata('permissions', [{ module }]);
