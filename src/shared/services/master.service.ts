import { Injectable, Logger } from '@nestjs/common';
import { ModuleType } from '@jkt/enums';
import { Role, User } from '@jkt/models';
import { toHash } from '@jkt/nest-utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MasterService {
  private readonly logger = new Logger(MasterService.name);

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    await this.initializeDefaults();
  }
  async initializeDefaults() {
    const role = await this.createDefaultRole();
    if (role) await this.createDefaultUser(role);
  }

  private async createDefaultRole() {
    if ((await User.count()) > 0) return null;
    const permissions = {};
    Object.values(ModuleType).forEach((value) => {
      permissions[value] = '1111';
    });
    const role = {
      name: 'DEFAULT',
      permissions,
    };
    return await Role.create(role);
  }

  private async createDefaultUser(role: Role) {
    if (!role || (await User.count()) > 0) return;
    let defaultUser = this.config.get('defaultAdmin');
    defaultUser = {
      ...defaultUser,
      password: await toHash(defaultUser.password),
      roleId: role.id,
    };

    if ((await User.create(defaultUser)).id) {
      Logger.log('✔ Default User Created ✔');
    }
  }
}
