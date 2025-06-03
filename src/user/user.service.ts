import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '@jkt/models';
import { ConfigService } from '@nestjs/config';

import {
  CreateUserDto,
  FilterUserDto,
  PageDto,
  PageMetaDto,
  ResponseWrapper,
  ResponseStatus,
  UpdateUserDto,
} from '@jkt/dto';
import { toHash } from '@jkt/nest-utils';
import { Op } from 'sequelize';
import { Response } from '@jkt/constants';
import { Request } from 'express';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(userDeatils: CreateUserDto): Promise<ResponseWrapper<User>> {
    const isUserExist = await this.userModel.findOne({
      where: { email: userDeatils.email },
    });
    if (isUserExist) {
      throw new HttpException(
        Response.USER_ALREADY_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.userModel.create({
      ...userDeatils,
      password: await toHash(userDeatils.password),
    });
    return new ResponseWrapper(ResponseStatus.SUCCESS, user);
  }

  async getUsers(data: FilterUserDto): Promise<ResponseWrapper<PageDto<User>>> {
    const { limit, search, page, skip, sortBy, sortOrder } = data;
    const offset = skip;

    const adminEmail = this.configService.get<string>('DEFAULT_USER_EMAIL');

    const conditions = {
      email: { [Op.ne]: adminEmail },
    };
    if (search) {
      conditions[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await this.userModel.findAndCountAll({
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

  async getUserById(id: string): Promise<ResponseWrapper<User>> {
    const user = await this.userModel.findOne({ where: { id } });
    if (!user)
      throw new HttpException(Response.USER_NOT_FOUND, HttpStatus.NOT_FOUND);

    const adminEmail = this.configService.get<string>('DEFAULT_USER_EMAIL');

    if (user.email === adminEmail) {
      throw new HttpException(Response.CANNOT_GET_ADMIN, HttpStatus.FORBIDDEN);
    }

    return new ResponseWrapper(ResponseStatus.SUCCESS, user);
  }

  async updateUser(
    id: string,
    user: UpdateUserDto,
  ): Promise<ResponseWrapper<null>> {
    const existingUser = await this.userModel.findOne({ where: { id } });

    if (!existingUser) {
      throw new HttpException(Response.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const adminEmail = this.configService.get<string>('DEFAULT_USER_EMAIL');

    if (existingUser.email === adminEmail) {
      throw new HttpException(
        Response.CANNOT_UPDATE_ADMIN,
        HttpStatus.FORBIDDEN,
      );
    }

    const [isUserUpdated] = await this.userModel.update(
      { ...user },
      { where: { id } },
    );

    if (!isUserUpdated) {
      throw new HttpException(Response.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return new ResponseWrapper(
      ResponseStatus.SUCCESS,
      null,
      Response.USER_UPDATED,
    );
  }

  async deleteUser(id: string): Promise<ResponseWrapper<null>> {
    const user = await this.userModel.findOne({ where: { id } });

    if (!user) {
      throw new HttpException(Response.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const adminEmail = this.configService.get<string>('DEFAULT_USER_EMAIL');

    if (user.email === adminEmail) {
      throw new HttpException(
        Response.CANNOT_DELETE_ADMIN,
        HttpStatus.FORBIDDEN,
      );
    }

    await user.destroy();

    return new ResponseWrapper(
      ResponseStatus.SUCCESS,
      null,
      Response.USER_DELETED,
    );
  }
}
