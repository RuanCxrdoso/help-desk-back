import { IEmployeesRepository } from '@/domain/help-desk/application/repositories/employees-repository'
import { Employee } from '@/domain/help-desk/enterprise/entities/employee'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { EmployeeMapper } from '../mappers/employee-mapper'
import { ROLE } from 'generated/prisma/enums'
import { PaginationParams, PaginatedResult } from '@/core/types/pagination'
import { AuthUser } from '@/domain/help-desk/enterprise/entities/auth-user'
import { UserWhereInput } from 'generated/prisma/models'
import { AuthUserMapper } from '../mappers/auth-user-mapper'

@Injectable()
export class PrismaEmployeesRepository implements IEmployeesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: Employee): Promise<void> {
    const employeePrisma = EmployeeMapper.toPrismaCreate(user)

    await this.prisma.user.create({
      data: employeePrisma,
    })
  }

  async findById(id: string, tenantId?: string): Promise<Employee | null> {
    const employee = await this.prisma.user.findFirst({
      where: {
        id,
        tenantId,
        role: ROLE.EMPLOYEE,
      },
      include: {
        employeeProfile: true,
      },
    })

    if (!employee || !employee.employeeProfile) return null

    return EmployeeMapper.toDomain(employee)
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
      role: ROLE.EMPLOYEE,
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

  async save(employee: Employee): Promise<void> {
    const prismaEmployee = EmployeeMapper.toPrismaUpsert(employee)

    await this.prisma.user.update({
      where: {
        id: employee.id.toString(),
      },
      data: prismaEmployee,
    })
  }
}
