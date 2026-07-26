import { IUsersRepository } from '@/domain/help-desk/application/repositories/users-repository'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { AuthUser } from '@/domain/help-desk/enterprise/entities/auth-user'
import { AuthUserMapper } from '../mappers/auth-user-mapper'

@Injectable()
export class PrismaUsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string, tenantId: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        tenantId,
      },
    })

    if (!user) return null

    if (
      user.role === 'ADMIN' ||
      user.role === 'EMPLOYEE' ||
      user.role === 'TECHNICIAN'
    ) {
      return AuthUserMapper.toDomain(user)
    }

    return null
  }
}
