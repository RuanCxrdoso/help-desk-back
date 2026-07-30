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
import { AuthenticateSuperAdminUseCase } from '@/domain/help-desk/application/use-cases/authenticate-super-admin'
import { RegisterTenantAndAdminUseCase } from '@/domain/help-desk/application/use-cases/register-tenant-and-admin'
import { RegisterTechnicianUseCase } from '@/domain/help-desk/application/use-cases/register-technician'
import { RegisterAdminUseCase } from '@/domain/help-desk/application/use-cases/register-admin'
import { GetSuperAdminProfileUseCase } from '@/domain/help-desk/application/use-cases/get-super-admin-profile'
import { GetAdminProfileUseCase } from '@/domain/help-desk/application/use-cases/get-admin-profile'
import { GetTechnicianProfileUseCase } from '@/domain/help-desk/application/use-cases/get-technician-profile'
import { GetEmployeeProfileUseCase } from '@/domain/help-desk/application/use-cases/get-employee-profile'

@Module({
  imports: [DatabaseModule, CryptographyModule, AuthModule],
  providers: [
    AuthenticateSuperAdminUseCase,
    AuthenticateUseCase,
    RegisterTenantAndAdminUseCase,
    RegisterAdminUseCase,
    RegisterTechnicianUseCase,
    RegisterEmployeeUseCase,
    GetSuperAdminProfileUseCase,
    GetAdminProfileUseCase,
    GetTechnicianProfileUseCase,
    GetEmployeeProfileUseCase,
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
