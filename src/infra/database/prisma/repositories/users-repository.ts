import { IUsersRepository } from '@/domain/help-desk/application/repositories/users-repository'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { User } from '@/domain/help-desk/enterprise/entities/user'
import { AdminMapper } from '../mappers/admin-mapper'
import { EmployeeMapper } from '../mappers/employee-mapper'
import { TechnicianMapper } from '../mappers/technician-mapper'

@Injectable()
export class PrismaUsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(
    email: string,
    tenantId: string,
  ): Promise<User<any> | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        tenantId,
      },
    })

    if (!user) return null

    if (user.role === 'ADMIN') return AdminMapper.toDomain(user)
    if (user.role === 'EMPLOYEE') return EmployeeMapper.toDomain(user)
    if (user.role === 'TECHNICIAN') return TechnicianMapper.toDomain(user)

    return null
  }
}
