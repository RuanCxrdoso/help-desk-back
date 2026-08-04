import { IEmployeesRepository } from '@/domain/help-desk/application/repositories/employees-repository'
import { Employee } from '@/domain/help-desk/enterprise/entities/employee'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { EmployeeMapper } from '../mappers/employee-mapper'
import { ROLE } from 'generated/prisma/enums'
import { PaginationParams, PaginatedResult } from '@/core/types/pagination'
import { AuthUser } from '@/domain/help-desk/enterprise/entities/auth-user'

@Injectable()
export class PrismaEmployeesRepository implements IEmployeesRepository {
  constructor(private readonly prisma: PrismaService) {}
  findMany(
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

  async create(user: Employee): Promise<void> {
    const employeePrisma = EmployeeMapper.toPrismaUser(user)

    await this.prisma.user.create({
      data: employeePrisma,
    })
  }

  async findById(id: string, tenantId: string): Promise<Employee | null> {
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
}
