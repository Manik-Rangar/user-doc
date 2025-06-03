import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config/configuration';
import { DatabaseModule } from './shared/database/database.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@jkt/jwt';
import { MasterService } from './shared/services/master.service';
import { DocumentModule } from './document/document.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    JwtModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    RoleModule,
    DocumentModule,
  ],
  controllers: [AppController],
  providers: [AppService, MasterService],
})
export class AppModule {}
