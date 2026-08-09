import { ITechniciansRepository } from '@/domain/help-desk/application/repositories/technicians-repository'
import { PrismaService } from '../prisma.service'
import { Technician } from '@/domain/help-desk/enterprise/entities/technician'
import { TechnicianMapper } from '../mappers/technician-mapper'
import { Injectable } from '@nestjs/common'
import { ROLE } from 'generated/prisma/enums'
import { PaginationParams, PaginatedResult } from '@/core/types/pagination'
import { AuthUser } from '@/domain/help-desk/enterprise/entities/auth-user'
import { UserWhereInput } from 'generated/prisma/models'
import { AuthUserMapper } from '../mappers/auth-user-mapper'

@Injectable()
export class PrismaTechniciansRepository implements ITechniciansRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(user: Technician): Promise<void> {
    const technicianPrisma = TechnicianMapper.toPrismaUser(user)

    await this.prisma.user.create({
      data: technicianPrisma,
    })
  }

  async findById(id: string, tenantId: string): Promise<Technician | null> {
    const technician = await this.prisma.user.findFirst({
      where: {
        id,
        tenantId,
        role: ROLE.TECHNICIAN,
      },
      include: {
        technicianProfile: true,
      },
    })

    if (!technician || !technician.technicianProfile) return null

    return TechnicianMapper.toDomain(technician)
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

  async save(technician: Technician): Promise<void> {
    console.log(technician)

    throw new Error('Method not implemented.')
  }
}
