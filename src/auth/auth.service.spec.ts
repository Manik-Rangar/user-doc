import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/sequelize';
import { User, OTP } from '@jkt/models';
import { LoginRequestDto, ResponseStatus } from '@jkt/dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Response } from '@jkt/constants';
import * as nestUtils from '@jkt/nest-utils';

jest.mock('@jkt/nest-utils', () => ({
  checkHash: jest.fn(),
  toHash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userModel: typeof User;

  const mockUser = {
    id: 'test-id',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed_password',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
        {
          provide: getModelToken(User),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getModelToken(OTP),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            destroy: jest.fn().mockResolvedValue(1),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get<typeof User>(getModelToken(User));
  });

  describe('login', () => {
    const loginDto: LoginRequestDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login user with valid credentials', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser as any);
      (nestUtils.checkHash as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.status).toBe(ResponseStatus.SUCCESS);
      expect(result.response?.token).toBe('mock-jwt-token');
      expect(result.response?.user).toEqual(mockUser);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userModel.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        raw: true,
      });
    });

    it('should throw error for invalid credentials', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser as any);
      (nestUtils.checkHash as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        new HttpException(Response.INVALID_CREDENTIALS, HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw error for non-existent user', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new HttpException(Response.INVALID_CREDENTIALS, HttpStatus.BAD_REQUEST),
      );
    });
  });
});
