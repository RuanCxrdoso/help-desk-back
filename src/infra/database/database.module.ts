import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { EnvModule } from '../env/env.module'
import { IAdminsRepository } from '@/domain/help-desk/application/repositories/admins-repository'
import { PrismaAdminsRepository } from './prisma/repositories/admins-repository'
import { IEmployeesRepository } from '@/domain/help-desk/application/repositories/employees-repository'
import { PrismaEmployeesRepository } from './prisma/repositories/employees-repository'
import { ISuperAdminsRepository } from '@/domain/help-desk/application/repositories/super-admins-repository'
import { PrismaSuperAdminsRepository } from './prisma/repositories/super-admins-repository'
import { ITechniciansRepository } from '@/domain/help-desk/application/repositories/technicians-repository'
import { PrismaTechniciansRepository } from './prisma/repositories/technicians-repository'
import { ITenantAndAdminRegisterGateway } from '@/domain/help-desk/application/repositories/tenant-and-admin-register-gateway'
import { PrismaTenantAndAdminRegisterGatewayRepository } from './prisma/repositories/tenant-and-admin-register-gateway-repository'
import { ITenantsRepository } from '@/domain/help-desk/application/repositories/tenants-repository'
import { PrismaTenantsRepository } from './prisma/repositories/tenants-repository'
import { IUsersRepository } from '@/domain/help-desk/application/repositories/users-repository'
import { PrismaUsersRepository } from './prisma/repositories/users-repository'

@Module({
  imports: [EnvModule],
  providers: [
    PrismaService,
    {
      provide: IAdminsRepository,
      useClass: PrismaAdminsRepository,
    },
    {
      provide: IEmployeesRepository,
      useClass: PrismaEmployeesRepository,
    },
    {
      provide: ISuperAdminsRepository,
      useClass: PrismaSuperAdminsRepository,
    },
    {
      provide: ITechniciansRepository,
      useClass: PrismaTechniciansRepository,
    },
    {
      provide: ITenantAndAdminRegisterGateway,
      useClass: PrismaTenantAndAdminRegisterGatewayRepository,
    },
    {
      provide: ITenantsRepository,
      useClass: PrismaTenantsRepository,
    },
    {
      provide: IUsersRepository,
      useClass: PrismaUsersRepository,
    },
  ],
  exports: [
    PrismaService,
    IAdminsRepository,
    IEmployeesRepository,
    ISuperAdminsRepository,
    ITechniciansRepository,
    ITenantAndAdminRegisterGateway,
    ITenantsRepository,
    IUsersRepository,
  ],
})
export class DatabaseModule {}
