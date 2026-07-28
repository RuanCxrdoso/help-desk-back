import { Module } from '@nestjs/common'
import { EmployeeRegisterController } from './controllers/register/employee-register.controller'
import { DatabaseModule } from '../database/database.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { RegisterEmployeeUseCase } from '@/domain/help-desk/application/use-cases/register-employee'
import { APP_FILTER } from '@nestjs/core'
import { DomainErrorFilter } from './filters/domain-error.filter'
import { AuthModule } from './auth/auth.module'
import { AuthenticateController } from './controllers/auth/authenticate.controller'
import { AuthenticateUseCase } from '@/domain/help-desk/application/use-cases/authenticate'
import { AuthenticateSuperAdminController } from './controllers/auth/authenticate-super-admin.controller'
import { AdminRegisterController } from './controllers/register/admin-register.controller'
import { TechnicianRegisterController } from './controllers/register/technician-register.controller'
import { TenantAndAdminRegisterController } from './controllers/register/tenant-and-admin-register.controller'
import { GetProfileController } from './controllers/profile/get-profile.controller'

@Module({
  imports: [DatabaseModule, CryptographyModule, AuthModule],
  providers: [
    RegisterEmployeeUseCase,
    AuthenticateUseCase,
    {
      provide: APP_FILTER,
      useClass: DomainErrorFilter,
    },
  ],
  controllers: [
    AuthenticateSuperAdminController,
    AuthenticateController,
    TenantAndAdminRegisterController,
    AdminRegisterController,
    TechnicianRegisterController,
    EmployeeRegisterController,
    GetProfileController,
  ],
})
export class HttpModule {}
