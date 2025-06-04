import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from '@jkt/models';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  CreateUserDto,
  FilterUserDto,
  ResponseStatus,
  UpdateUserDto,
} from '@jkt/dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Response } from '@jkt/constants';
import { Op } from 'sequelize';
import * as nestUtils from '@jkt/nest-utils';

enum sortByUser {
  NAME = 'name',
  EMAIL = 'email',
  PHONE = 'phone',
  ROLE_ID = 'roleId',
  CREATEDAT = 'createdAt',
}

jest.mock('@jkt/nest-utils', () => ({
  toHash: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let userModel: typeof User;

  const mockUser = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
    password: 'hashed_password',
    roleId: 'test-role-id',
    destroy: jest.fn(),
  };

  const adminUser = {
    id: 'admin-user-id',
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '0987654321',
    password: 'admin_password',
    roleId: 'admin-role-id',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            findAndCountAll: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('admin@example.com'),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<typeof User>(getModelToken(User));
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'password123',
      roleId: 'test-role-id',
    };

    it('should create a new user successfully', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);
      (nestUtils.toHash as jest.Mock).mockResolvedValue('hashed_password');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(userModel, 'create').mockResolvedValue(mockUser as any);

      const result = await service.createUser(createUserDto);

      expect(result.status).toBe(ResponseStatus.SUCCESS);
      expect(result.response).toEqual(mockUser);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userModel.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashed_password',
      });
    });

    it('should throw error if user already exists', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser as any);

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        new HttpException(Response.USER_ALREADY_EXIST, HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('getUsers', () => {
    const filterDto = new FilterUserDto();
    filterDto.page = 1;
    filterDto.limit = 10;
    filterDto.search = 'test';
    filterDto.sortBy = sortByUser.NAME;

    it('should return paginated users', async () => {
      const mockUsers = {
        rows: [mockUser],
        count: 1,
      };

      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest
        .spyOn(userModel, 'findAndCountAll')
        .mockResolvedValue(mockUsers as any);

      const result = await service.getUsers(filterDto);

      expect(result.status).toBe(ResponseStatus.SUCCESS);
      expect(result.response?.data).toEqual(mockUsers.rows);
      expect(result.response?.meta.count).toBe(mockUsers.count);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userModel.findAndCountAll).toHaveBeenCalledWith({
        where: {
          email: { [Op.ne]: 'admin@example.com' },
          [Op.or]: [
            { name: { [Op.iLike]: '%test%' } },
            { email: { [Op.iLike]: '%test%' } },
            { phone: { [Op.iLike]: '%test%' } },
          ],
        },
        limit: filterDto.limit,
        offset: filterDto.skip,
        order: [[filterDto.sortBy, filterDto.sortOrder]],
      });
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser as any);

      const result = await service.getUserById('test-user-id');

      expect(result.status).toBe(ResponseStatus.SUCCESS);
      expect(result.response).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

      await expect(service.getUserById('non-existent-id')).rejects.toThrow(
        new HttpException(Response.USER_NOT_FOUND, HttpStatus.NOT_FOUND),
      );
    });

    it('should throw error if trying to get admin user', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(userModel, 'findOne').mockResolvedValue(adminUser as any);

      await expect(service.getUserById('admin-user-id')).rejects.toThrow(
        new HttpException(Response.CANNOT_GET_ADMIN, HttpStatus.FORBIDDEN),
      );
    });
  });

  describe('updateUser', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated User',
      phone: '9876543210',
      roleId: 'test-role-id',
    };

    it('should update user successfully', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser as any);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(userModel, 'update').mockResolvedValue([1] as any);

      const result = await service.updateUser('test-user-id', updateUserDto);

      expect(result.status).toBe(ResponseStatus.SUCCESS);
      expect(result.message).toBe(Response.USER_UPDATED);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userModel.update).toHaveBeenCalledWith(updateUserDto, {
        where: { id: 'test-user-id' },
      });
    });

    it('should throw error if user not found', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateUser('non-existent-id', updateUserDto),
      ).rejects.toThrow(
        new HttpException(Response.USER_NOT_FOUND, HttpStatus.NOT_FOUND),
      );
    });

    it('should throw error if trying to update admin user', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(userModel, 'findOne').mockResolvedValue(adminUser as any);

      await expect(
        service.updateUser('admin-user-id', updateUserDto),
      ).rejects.toThrow(
        new HttpException(Response.CANNOT_UPDATE_ADMIN, HttpStatus.FORBIDDEN),
      );
    });

    it('should throw error if update fails', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser as any);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(userModel, 'update').mockResolvedValue([0] as any);

      await expect(
        service.updateUser('test-user-id', updateUserDto),
      ).rejects.toThrow(
        new HttpException(Response.USER_NOT_FOUND, HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser as any);
      mockUser.destroy.mockResolvedValue(undefined);

      const result = await service.deleteUser('test-user-id');

      expect(result.status).toBe(ResponseStatus.SUCCESS);
      expect(result.message).toBe(Response.USER_DELETED);
      expect(mockUser.destroy).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

      await expect(service.deleteUser('non-existent-id')).rejects.toThrow(
        new HttpException(Response.USER_NOT_FOUND, HttpStatus.NOT_FOUND),
      );
    });

    it('should throw error if trying to delete admin user', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(userModel, 'findOne').mockResolvedValue(adminUser as any);

      await expect(service.deleteUser('admin-user-id')).rejects.toThrow(
        new HttpException(Response.CANNOT_DELETE_ADMIN, HttpStatus.FORBIDDEN),
      );
    });
  });
});
