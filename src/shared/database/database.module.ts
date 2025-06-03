import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { createNamespace } from 'cls-hooked';
import { models } from './models';

const namespace = createNamespace('jtk_dbTransaction');
Sequelize.useCLS(namespace);

@Module({
  imports: [
    ConfigModule, // make sure it's imported
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): SequelizeModuleOptions => {
        const sslEnabled = config.get<boolean>('dbSSL');
        const dialectOptions = sslEnabled
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {};

        return {
          dialect: 'postgres',
          name: 'jkt',
          host: config.get<string>('dbHost') || '127.0.0.1',
          port: config.get<number>('dbPort') || 5432,
          username: config.get<string>('dbUser') || 'postgres',
          password: config.get<string>('dbPassword') || '',
          database: config.get<string>('dbName') || 'jkt_db',
          dialectOptions,
          synchronize: true,
          autoLoadModels: true,
          models,
          logging: console.log,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
