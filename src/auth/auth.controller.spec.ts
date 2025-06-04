import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginRequestDto, ResponseStatus } from '@jkt/dto';
import { ResponseWrapper } from '@jkt/dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue(
              new ResponseWrapper(ResponseStatus.SUCCESS, {
                token: 'mock-token',
                user: { id: 'user-id', email: 'test@example.com' },
              }),
            ),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('POST /auth/login', () => {
    it('should authenticate user and return token', async () => {
      const loginDto: LoginRequestDto = {
        email: 'default@imp.com',
        password: '123456',
      };

      const result = await controller.login(loginDto);

      expect(result.status).toBe('success');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result.response?.token).toBe('mock-token');
      expect(result.response?.user).toEqual({
        id: 'user-id',
        email: 'test@example.com',
      });
    });
  });
});
