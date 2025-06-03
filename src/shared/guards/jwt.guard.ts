import { Role, User } from '@jkt/models';
import {
  HttpStatus,
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    if (!token) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    try {
      const verified = await this.jwtService.verifyAsync(token);
      const userId = verified.id;

      if (!userId) {
        throw new HttpException(
          'Invalid token payload.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const account = await User.findOne({
        where: { id: userId },
        include: [Role],
      });

      if (!account) {
        throw new HttpException('User not found.', HttpStatus.UNAUTHORIZED);
      }

      req['user'] = { ...account.toJSON(), ...verified };
      return true;
    } catch (e) {
      console.error('JWT Verification Error:', e);
      throw new HttpException('Unauthorized.', HttpStatus.UNAUTHORIZED);
    }
  }
}
