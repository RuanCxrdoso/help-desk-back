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
import { DeleteAdminUseCase } from '@/domain/help-desk/application/use-cases/delete-admin'
import { DeleteAdminController } from './controllers/delete-users/delete-admin.controller'
import { DeleteTechnicianUseCase } from '@/domain/help-desk/application/use-cases/delete-technician'
import { DeleteEmployeeUseCase } from '@/domain/help-desk/application/use-cases/delete-employee'
import { FetchAdminsUseCase } from '@/domain/help-desk/application/use-cases/fetch-admins'
import { FetchEmployeesUseCase } from '@/domain/help-desk/application/use-cases/fetch-employees'
import { FetchTechniciansController } from './controllers/fetch-users/fetch-technicians.controller'
import { FetchTechniciansUseCase } from '@/domain/help-desk/application/use-cases/fetch-technicians'
import { UpdateAdminUseCase } from '@/domain/help-desk/application/use-cases/update-admin'
import { UpdateEmployeeUseCase } from '@/domain/help-desk/application/use-cases/update-employee'
import { UpdateTechnicianUseCase } from '@/domain/help-desk/application/use-cases/update-technician'
import { DeleteEmployeeController } from './controllers/delete-users/delete-employee.controller'
import { DeleteTechnicianController } from './controllers/delete-users/delete-technician.controller'
import { FetchAdminsController } from './controllers/fetch-users/fetch-admins.controller'
import { FetchEmployeesController } from './controllers/fetch-users/fetch-employees.controller'
import { UpdateAdminController } from './controllers/update-users/update-admin.controller'
import { UpdateEmployeeController } from './controllers/update-users/update-employee.controller'
import { UpdateTechnicianController } from './controllers/update-users/update-technician.controller'

@Module({
  imports: [DatabaseModule, CryptographyModule, AuthModule],
  providers: [
    AuthenticateSuperAdminUseCase,
    AuthenticateUseCase,
    DeleteAdminUseCase,
    DeleteEmployeeUseCase,
    DeleteTechnicianUseCase,
    FetchAdminsUseCase,
    FetchEmployeesUseCase,
    FetchTechniciansUseCase,
    GetAdminProfileUseCase,
    GetEmployeeProfileUseCase,
    GetSuperAdminProfileUseCase,
    GetTechnicianProfileUseCase,
    RegisterAdminUseCase,
    RegisterEmployeeUseCase,
    RegisterTechnicianUseCase,
    RegisterTenantAndAdminUseCase,
    UpdateAdminUseCase,
    UpdateEmployeeUseCase,
    UpdateTechnicianUseCase,
    {
      provide: APP_FILTER,
      useClass: DomainErrorFilter,
    },
  ],
  controllers: [
    AuthenticateSuperAdminController,
    AuthenticateController,
    DeleteAdminController,
    DeleteEmployeeController,
    DeleteTechnicianController,
    FetchAdminsController,
    FetchEmployeesController,
    FetchTechniciansController,
    GetProfileController,
    AdminRegisterController,
    EmployeeRegisterController,
    TechnicianRegisterController,
    TenantAndAdminRegisterController,
    UpdateAdminController,
    UpdateEmployeeController,
    UpdateTechnicianController,
  ],
})
export class HttpModule {}
