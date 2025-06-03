import { Response } from '@jkt/constants';
import { Role } from '@jkt/models';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  FilterRoleDto,
  PageDto,
  PageMetaDto,
  CreateAndUpdateRoleDto,
  UpdateRoleDto,
  ResponseWrapper,
} from '@jkt/dto';
import { Op } from 'sequelize';
import { ResponseStatus } from '@jkt/dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role)
    private readonly roleModel: typeof Role,
    private readonly configService: ConfigService,
  ) {}

  async createRole(
    role: CreateAndUpdateRoleDto,
  ): Promise<ResponseWrapper<Role>> {
    const existingRole = await this.roleModel.findOne({
      where: { name: role.name },
    });
    if (existingRole) {
      throw new HttpException(
        Response.ROLE_ALREADY_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
    const data = await this.roleModel.create({ ...role });
    return new ResponseWrapper(
      ResponseStatus.SUCCESS,
      data,
      Response.PASSOWRD_RESET_SENT,
    );
  }

  async getRoles(data: FilterRoleDto): Promise<ResponseWrapper<PageDto<Role>>> {
    const { limit, search, page, sortBy, sortOrder } = data;
    const offset = (page - 1) * limit;

    const adminName = this.configService.get<string>('DEFAULT_USER_NAME');

    const conditions = {
      name: { [Op.ne]: adminName },
    };
    if (search) {
      conditions[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }];
    }

    const { rows, count } = await this.roleModel.findAndCountAll({
      where: conditions,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
    });

    return new ResponseWrapper(
      ResponseStatus.SUCCESS,
      new PageDto(
        rows,
        new PageMetaDto({ count, pageOptions: { page, limit, skip: offset } }),
      ),
    );
  }

  async getRoleById(id: string): Promise<ResponseWrapper<Role>> {
    const role = await this.roleModel.findOne({ where: { id } });
    if (!role)
      throw new HttpException(Response.ROLE_NOT_FOUND, HttpStatus.NOT_FOUND);

    const adminName = this.configService.get<string>('DEFAULT_USER_NAME');

    if (role.name === adminName) {
      throw new HttpException(Response.CANNOT_GET_ADMIN, HttpStatus.FORBIDDEN);
    }
    return new ResponseWrapper(ResponseStatus.SUCCESS, role);
  }

  async updateRole(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<ResponseWrapper<Role>> {
    const adminName = this.configService.get<string>('DEFAULT_USER_NAME');

    const existingRole = await this.roleModel.findOne({ where: { id } });

    if (!existingRole) {
      throw new HttpException(Response.ROLE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Prevent updating admin email
    if (existingRole.name === adminName) {
      throw new HttpException(
        Response.CANNOT_UPDATE_ADMIN,
        HttpStatus.FORBIDDEN,
      );
    }

    const duplicateRole = await this.roleModel.findOne({
      where: { name: updateRoleDto.name, id: { [Op.ne]: id } },
    });

    if (duplicateRole) {
      throw new HttpException(
        Response.ROLE_ALREADY_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    const [affectedCount, affectedRows] = await this.roleModel.update(
      { ...updateRoleDto },
      { where: { id }, returning: true },
    );

    if (!affectedCount) {
      throw new HttpException(Response.ROLE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return new ResponseWrapper(ResponseStatus.SUCCESS, affectedRows[0]);
  }

  async deleteRole(id: string): Promise<ResponseWrapper<null>> {
    const role = await this.roleModel.findOne({ where: { id } });

    if (!role) {
      throw new HttpException(Response.ROLE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const adminName = this.configService.get<string>('DEFAULT_USER_NAME');

    const adminExists = await this.roleModel.findOne({
      where: { name: adminName },
    });

    if (role.id === adminExists?.id) {
      throw new HttpException(
        Response.CANNOT_DELETE_ADMIN,
        HttpStatus.FORBIDDEN,
      );
    }

    await role.destroy();

    return new ResponseWrapper(
      ResponseStatus.SUCCESS,
      null,
      Response.ROLE_DELETED,
    );
  }
}
