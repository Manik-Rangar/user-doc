import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OTP, User } from '@jkt/models';

@Module({
  imports: [SequelizeModule.forFeature([User, OTP])],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
