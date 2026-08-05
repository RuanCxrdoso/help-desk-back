import { IAdminsRepository } from '@/domain/help-desk/application/repositories/admins-repository'
import { Admin } from '@/domain/help-desk/enterprise/entities/admin'
import { PrismaService } from '../prisma.service'
import { Injectable } from '@nestjs/common'
import { AdminMapper } from '../mappers/admin-mapper'
import { ROLE } from 'generated/prisma/enums'
import { PaginationParams, PaginatedResult } from '@/core/types/pagination'
import { AuthUser } from '@/domain/help-desk/enterprise/entities/auth-user'

@Injectable()
export class PrismaAdminsRepository implements IAdminsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: Admin): Promise<void> {
    const adminPrisma = AdminMapper.toPrismaUser(user)

    await this.prisma.user.create({
      data: adminPrisma,
    })
  }

  async findById(id: string, tenantId: string): Promise<Admin | null> {
    const admin = await this.prisma.user.findFirst({
      where: {
        id,
        tenantId,
        role: ROLE.ADMIN,
      },
      include: {
        adminProfile: true,
      },
    })

    if (!admin || !admin.adminProfile) return null

    return AdminMapper.toDomain(admin)
  }

  async findMany(
    tenantId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<AuthUser>> {
    console.log(
      '🚀 ~ PrismaTechniciansRepository ~ findMany ~ tenantId:',
      tenantId,
    )
    console.log('🚀 ~ PrismaTechniciansRepository ~ findMany ~ params:', params)
    throw new Error('Method not implemented.')
  }

  async save(admin: Admin): Promise<void> {
    console.log(admin)

    throw new Error('Method not implemented.')
  }
}
