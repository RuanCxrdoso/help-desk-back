import { ITenantsRepository } from '@/domain/help-desk/application/repositories/tenants-repository'
import { Tenant } from '@/domain/help-desk/enterprise/entities/tenant'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { TenantMapper } from '../mappers/tenant-mapper'

@Injectable()
export class PrismaTenantsRepository implements ITenantsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Tenant | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: {
        id,
      },
    })

    if (!tenant) return null

    return TenantMapper.toDomain(tenant)
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: {
        slug,
      },
    })

    if (!tenant) return null

    return TenantMapper.toDomain(tenant)
  }
}
