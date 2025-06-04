import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { getModelToken } from '@nestjs/sequelize';
import { Role } from '@jkt/models';
import { ConfigService } from '@nestjs/config';
import {
  CreateAndUpdateRoleDto,
  FilterRoleDto,
  ResponseStatus,
  UpdateRoleDto,
} from '@jkt/dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Response } from '@jkt/constants';
import { Op } from 'sequelize';
import { ModuleType } from '@jkt/enums';

enum sortByRole {
  NAME = 'name',
  CREATEDAT = 'createdAt',
}

describe('RoleService', () => {
  let service: RoleService;
  let roleModel: typeof Role;

  const mockRole = {
    id: 'test-role-id',
    name: 'Test Role',
    permissions: {
      [ModuleType.USER]: '1111',
      [ModuleType.ROLE]: '1111',
      [ModuleType.DOCUMENT]: '1111',
    },
    destroy: jest.fn(),
  };

  const adminRole = {
    id: 'admin-role-id',
    name: 'admin',
    permissions: {
      [ModuleType.USER]: '1111',
      [ModuleType.ROLE]: '1111',
      [ModuleType.DOCUMENT]: '1111',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getModelToken(Role),
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
            get: jest.fn().mockReturnValue('admin'),
          },
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    roleModel = module.get<typeof Role>(getModelToken(Role));
  });

  describe('createRole', () => {
    const createRoleDto: CreateAndUpdateRoleDto = {
      name: 'Test Role',
      permissions: {
        [ModuleType.USER]: '1111',
        [ModuleType.ROLE]: '1111',
        [ModuleType.DOCUMENT]: '1111',
      },
    };

    it('should create a new role successfully', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(roleModel, 'findOne').mockResolvedValue(null);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(roleModel, 'create').mockResolvedValue(mockRole as any);

      const result = await service.createRole(createRoleDto);

      expect(result.status).toBe(ResponseStatus.SUCCESS);
      expect(result.response).toEqual(mockRole);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(roleModel.create).toHaveBeenCalledWith(createRoleDto);
    });

    it('should throw error if role already exists', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(roleModel, 'findOne').mockResolvedValue(mockRole as any);

      await expect(service.createRole(createRoleDto)).rejects.toThrow(
        new HttpException(Response.ROLE_ALREADY_EXIST, HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('getRoles', () => {
    const filterDto = new FilterRoleDto();
    filterDto.page = 1;
    filterDto.limit = 10;
    filterDto.search = 'test';
    filterDto.sortBy = sortByRole.NAME;
    filterDto.sortOrder = 'ASC';

    it('should return paginated roles', async () => {
      const mockRoles = {
        rows: [mockRole],
        count: 1,
      };

      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest
        .spyOn(roleModel, 'findAndCountAll')
        .mockResolvedValue(mockRoles as any);

      const result = await service.getRoles(filterDto);

      expect(result.status).toBe(ResponseStatus.SUCCESS);
      expect(result.response?.data).toEqual(mockRoles.rows);
      expect(result.response?.meta.count).toBe(mockRoles.count);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(roleModel.findAndCountAll).toHaveBeenCalledWith({
        where: {
          name: { [Op.ne]: 'admin' },
          [Op.or]: [{ name: { [Op.iLike]: '%test%' } }],
        },
        limit: filterDto.limit,
        offset: filterDto.skip,
        order: [[filterDto.sortBy, filterDto.sortOrder]],
      });
    });
  });

  describe('getRoleById', () => {
    it('should return a role by id', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(roleModel, 'findOne').mockResolvedValue(mockRole as any);

      const result = await service.getRoleById('test-role-id');

      expect(result.status).toBe(ResponseStatus.SUCCESS);
      expect(result.response).toEqual(mockRole);
    });

    it('should throw error if role not found', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(roleModel, 'findOne').mockResolvedValue(null);

      await expect(service.getRoleById('non-existent-id')).rejects.toThrow(
        new HttpException(Response.ROLE_NOT_FOUND, HttpStatus.NOT_FOUND),
      );
    });

    it('should throw error if trying to get admin role', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(roleModel, 'findOne').mockResolvedValue(adminRole as any);

      await expect(service.getRoleById('admin-role-id')).rejects.toThrow(
        new HttpException(Response.CANNOT_GET_ADMIN, HttpStatus.FORBIDDEN),
      );
    });
  });

  describe('updateRole', () => {
    const updateRoleDto: UpdateRoleDto = {
      name: 'Updated Role',
      permissions: {
        [ModuleType.USER]: '1111',
        [ModuleType.ROLE]: '1111',
        [ModuleType.DOCUMENT]: '1111',
      },
    };

    it('should update role successfully', async () => {
      const updatedRole = { ...mockRole, ...updateRoleDto };
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(roleModel, 'findOne').mockResolvedValueOnce(mockRole as any);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(roleModel, 'findOne').mockResolvedValueOnce(null);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest
        .spyOn(roleModel, 'update')
        .mockResolvedValue([1, [updatedRole]] as any);

      const result = await service.updateRole('test-role-id', updateRoleDto);

      expect(result.status).toBe(ResponseStatus.SUCCESS);
      expect(result.response).toEqual(updatedRole);
    });

    it('should throw error if role not found', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(roleModel, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateRole('non-existent-id', updateRoleDto),
      ).rejects.toThrow(
        new HttpException(Response.ROLE_NOT_FOUND, HttpStatus.NOT_FOUND),
      );
    });

    it('should throw error if trying to update admin role', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(roleModel, 'findOne').mockResolvedValue(adminRole as any);

      await expect(
        service.updateRole('admin-role-id', updateRoleDto),
      ).rejects.toThrow(
        new HttpException(Response.CANNOT_UPDATE_ADMIN, HttpStatus.FORBIDDEN),
      );
    });
  });

  describe('deleteRole', () => {
    it('should delete role successfully', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest
        .spyOn(roleModel, 'findOne')
        .mockResolvedValueOnce(mockRole as any)
        .mockResolvedValueOnce(adminRole as any);
      mockRole.destroy.mockResolvedValue(undefined);

      const result = await service.deleteRole('test-role-id');

      expect(result.status).toBe(ResponseStatus.SUCCESS);
      expect(result.message).toBe(Response.ROLE_DELETED);
      expect(mockRole.destroy).toHaveBeenCalled();
    });

    it('should throw error if role not found', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(roleModel, 'findOne').mockResolvedValue(null);

      await expect(service.deleteRole('non-existent-id')).rejects.toThrow(
        new HttpException(Response.ROLE_NOT_FOUND, HttpStatus.NOT_FOUND),
      );
    });

    it('should throw error if trying to delete admin role', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest
        .spyOn(roleModel, 'findOne')
        .mockResolvedValueOnce(adminRole as any)
        .mockResolvedValueOnce(adminRole as any);

      await expect(service.deleteRole('admin-role-id')).rejects.toThrow(
        new HttpException(Response.CANNOT_DELETE_ADMIN, HttpStatus.FORBIDDEN),
      );
    });
  });
});
