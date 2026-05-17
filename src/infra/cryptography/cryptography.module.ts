import { Module } from '@nestjs/common'
import { JwtEncrypter } from './jwt-encrypter'
import { IEncrypter } from '@/domain/help-desk/application/cryptography/encrypter'
import { JwtModule } from '@nestjs/jwt'
import { EnvModule } from '../env/env.module'
import { EnvService } from '../env/env.service'
import { BcryptHasher } from './bcrypt-hasher'
import { IHashGenerator } from '@/domain/help-desk/application/cryptography/hash-generator'
import { IHashComparer } from '@/domain/help-desk/application/cryptography/hash-comparer'

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (env: EnvService) => {
        const privateKey = env.get('JWT_PRIVATE_KEY')

        return {
          privateKey: Buffer.from(privateKey, 'base64'),
          signOptions: {
            algorithm: 'RS256',
            expiresIn: '1h',
          },
        }
      },
    }),
  ],
  providers: [
    {
      provide: IEncrypter,
      useClass: JwtEncrypter,
    },
    {
      provide: IHashGenerator,
      useClass: BcryptHasher,
    },
    {
      provide: IHashComparer,
      useClass: BcryptHasher,
    },
  ],
  exports: [IEncrypter, IHashGenerator, IHashComparer],
})
export class CryptographyModule {}
