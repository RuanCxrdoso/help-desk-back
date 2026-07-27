import { Module } from '@nestjs/common'
import { EmployeeRegisterController } from './controllers/register/employee-register.controller'
import { DatabaseModule } from '../database/database.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { RegisterEmployeeUseCase } from '@/domain/help-desk/application/use-cases/register-employee'
import { APP_FILTER } from '@nestjs/core'
import { DomainErrorFilter } from './filters/domain-error.filter'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [DatabaseModule, CryptographyModule, AuthModule],
  providers: [
    RegisterEmployeeUseCase,
    {
      provide: APP_FILTER,
      useClass: DomainErrorFilter,
    },
  ],
  controllers: [EmployeeRegisterController],
})
export class HttpModule {}
