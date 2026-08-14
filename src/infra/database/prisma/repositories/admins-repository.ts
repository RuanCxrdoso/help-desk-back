import { IAdminsRepository } from '@/domain/help-desk/application/repositories/admins-repository'
import { Admin } from '@/domain/help-desk/enterprise/entities/admin'
import { PrismaService } from '../prisma.service'
import { Injectable } from '@nestjs/common'
import { AdminMapper } from '../mappers/admin-mapper'
import { ROLE } from 'generated/prisma/enums'
import { PaginationParams, PaginatedResult } from '@/core/types/pagination'
import { AuthUser } from '@/domain/help-desk/enterprise/entities/auth-user'
import { UserWhereInput } from 'generated/prisma/models'
import { AuthUserMapper } from '../mappers/auth-user-mapper'

@Injectable()
export class PrismaAdminsRepository implements IAdminsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: Admin): Promise<void> {
    const adminPrisma = AdminMapper.toPrismaCreate(user)

    await this.prisma.user.create({
      data: adminPrisma,
    })

    return
  }

  async findById(id: string, tenantId?: string): Promise<Admin | null> {
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
    const {
      q,
      page,
      perPage,
      order = 'asc',
      orderBy = 'firstName',
      status,
    } = params

    const skip = (page - 1) * perPage
    const take = perPage

    let isActive: boolean | undefined = undefined
    if (status === 'ACTIVE') {
      isActive = true
    } else if (status === 'INACTIVE') {
      isActive = false
    }
    const whereClause: UserWhereInput = {
      tenantId,
      role: ROLE.ADMIN,
      isActive,
      ...(q && {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      }),
    }

    const [totalCount, items] = await this.prisma.$transaction([
      this.prisma.user.count({ where: whereClause }),
      this.prisma.user.findMany({
        where: whereClause,
        take,
        skip,
        orderBy: {
          [orderBy]: order,
        },
      }),
    ])

    return {
      items: items.map(AuthUserMapper.toDomain),
      meta: {
        page,
        perPage,
        totalCount,
        totalPages: Math.ceil(totalCount / perPage),
        orderBy,
        order,
      },
    }
  }

  async save(admin: Admin): Promise<void> {
    const prismaAdmin = AdminMapper.toPrismaUpsert(admin)

    await this.prisma.user.update({
      where: {
        id: admin.id.toString(),
      },
      data: prismaAdmin,
    })

    return
  }
}
