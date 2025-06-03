import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule as JwtRootModule, JwtSecretRequestType } from '@nestjs/jwt';
import { PathOrFileDescriptor, readFileSync } from 'fs';

@Global()
@Module({
  imports: [
    JwtRootModule.registerAsync({
      useFactory: async (config: ConfigService) => {
        return {
          secretOrKeyProvider(type: JwtSecretRequestType) {
            switch (type) {
              case JwtSecretRequestType.SIGN:
                return readFileSync(
                  config.get('jwtPrivateKey') as PathOrFileDescriptor,
                  'utf8',
                );

              case JwtSecretRequestType.VERIFY:
                return readFileSync(
                  config.get('jwtPublicKey') as PathOrFileDescriptor,
                  'utf8',
                );
            }
          },
          signOptions: {
            expiresIn: config.get('jwtExpiry'),
            issuer: config.get('jwtIssuer'),
            algorithm: config.get('jwtAlgorithm'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [JwtRootModule],
})
export class JwtModule {}
