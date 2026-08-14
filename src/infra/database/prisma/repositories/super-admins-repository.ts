import { ISuperAdminsRepository } from '@/domain/help-desk/application/repositories/super-admins-repository'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { SuperAdmin } from '@/domain/help-desk/enterprise/entities/super-admin'
import { SuperAdminMapper } from '../mappers/super-admin-mapper'

@Injectable()
export class PrismaSuperAdminsRepository implements ISuperAdminsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: SuperAdmin): Promise<void> {
    const superAdminPrisma = SuperAdminMapper.toPrisma(user)

    await this.prisma.superAdmin.create({
      data: superAdminPrisma,
    })

    return
  }

  async findById(id: string): Promise<SuperAdmin | null> {
    const superAdmin = await this.prisma.superAdmin.findUnique({
      where: {
        id,
      },
    })

    if (!superAdmin) return null

    return SuperAdminMapper.toDomain(superAdmin)
  }

  async findByEmail(email: string): Promise<SuperAdmin | null> {
    const superAdmin = await this.prisma.superAdmin.findUnique({
      where: {
        email,
      },
    })

    if (!superAdmin) return null

    return SuperAdminMapper.toDomain(superAdmin)
  }
}
