import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  FilterUserDto,
  PageDto,
  ResponseWrapper,
  UpdateUserDto,
} from '@jkt/dto';
import { User } from '@jkt/models';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ModuleType } from '@jkt/enums';
import { Permissions } from '@jkt/nest-utils';
import { AdminGuard, PermissionsGuard } from '@jkt/guards';
import { Request } from 'express';

@UseGuards(PermissionsGuard)
@UseGuards(AdminGuard)
@Controller('users')
@Permissions(ModuleType.USER)
@ApiBearerAuth('token')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body() user: CreateUserDto,
  ): Promise<ResponseWrapper<User>> {
    return await this.userService.createUser(user);
  }

  @Get()
  async getUsers(
    @Query() data: FilterUserDto,
  ): Promise<ResponseWrapper<PageDto<User>>> {
    return await this.userService.getUsers(data);
  }
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<ResponseWrapper<User>> {
    return this.userService.getUserById(id);
  }

  @Put(':id')
  async updateUser(
    @Param('id') userId: string,
    @Body() user: UpdateUserDto,
  ): Promise<ResponseWrapper<null>> {
    return this.userService.updateUser(userId, user);
  }

  @Delete(':id')
  async deleteUser(
    @Param('id') userId: string,
  ): Promise<ResponseWrapper<null>> {
    return this.userService.deleteUser(userId);
  }
}
