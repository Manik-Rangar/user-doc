import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { FilterRoleDto, PageDto, CreateAndUpdateRoleDto } from '@jkt/dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard, PermissionsGuard } from '@jkt/guards';
import { ResponseWrapper } from '@jkt/dto';
import { Role } from '@jkt/models';
import { ModuleType } from '@jkt/enums';
import { Permissions } from '@jkt/nest-utils';

@UseGuards(PermissionsGuard)
@UseGuards(AdminGuard)
@Controller('roles')
@Permissions(ModuleType.ROLE)
@ApiBearerAuth('token')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  async getRoles(
    @Query() data: FilterRoleDto,
  ): Promise<ResponseWrapper<PageDto<Role>>> {
    return this.roleService.getRoles(data);
  }

  @Get(':id')
  async getRoleById(@Param('id') id: string): Promise<ResponseWrapper<Role>> {
    return this.roleService.getRoleById(id);
  }

  @Post()
  async createRole(
    @Body() role: CreateAndUpdateRoleDto,
  ): Promise<ResponseWrapper<Role>> {
    return await this.roleService.createRole(role);
  }

  @Put(':id')
  async updateRole(
    @Param('id') roleId: string,
    @Body() updateRole: CreateAndUpdateRoleDto,
  ): Promise<ResponseWrapper<Role>> {
    return this.roleService.updateRole(roleId, updateRole);
  }

  @Delete(':id')
  async deleteRole(
    @Param('id') roleId: string,
  ): Promise<ResponseWrapper<null>> {
    return this.roleService.deleteRole(roleId);
  }
}
