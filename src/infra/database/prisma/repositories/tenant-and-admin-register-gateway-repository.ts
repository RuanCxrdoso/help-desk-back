import { ITenantAndAdminRegisterGateway } from '@/domain/help-desk/application/repositories/tenant-and-admin-register-gateway'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { Admin } from '@/domain/help-desk/enterprise/entities/admin'
import { Tenant } from '@/domain/help-desk/enterprise/entities/tenant'
import { TenantMapper } from '../mappers/tenant-mapper'
import { AdminMapper } from '../mappers/admin-mapper'

@Injectable()
export class PrismaTenantAndAdminRegisterGatewayRepository implements ITenantAndAdminRegisterGateway {
  constructor(private readonly prisma: PrismaService) {}

  async register(tenant: Tenant, admin: Admin): Promise<void> {
    const tenantPrisma = TenantMapper.toPrisma(tenant)
    const adminPrisma = AdminMapper.toPrisma(admin)

    await this.prisma.$transaction(async (tx) => {
      await tx.tenant.create({
        data: tenantPrisma,
      })

      await tx.user.create({
        data: adminPrisma,
      })
    })
  }
}
