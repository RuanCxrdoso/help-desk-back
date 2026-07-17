import { IEmployeesRepository } from '@/domain/help-desk/application/repositories/employees-repository'
import { Employee } from '@/domain/help-desk/enterprise/entities/employee'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { EmployeeMapper } from '../mappers/employee-mapper'
import { ROLE } from 'generated/prisma/enums'

@Injectable()
export class PrismaEmployeesRepository implements IEmployeesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: Employee): Promise<void> {
    const employeePrisma = EmployeeMapper.toPrisma(user)

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
