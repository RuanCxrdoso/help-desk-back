import { IAdminsRepository } from '@/domain/help-desk/application/repositories/admins-repository'
import { Admin } from '@/domain/help-desk/enterprise/entities/admin'
import { PrismaService } from '../prisma.service'
import { Injectable } from '@nestjs/common'
import { AdminMapper } from '../mappers/admin-mapper'

@Injectable()
export class PrismaAdminsRepository implements IAdminsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: Admin): Promise<void> {
    const prismaAdmin = AdminMapper.toPrisma(user)

    await this.prisma.user.create({
      data: prismaAdmin,
    })
  }

  async findById(id: string, tenantId: string): Promise<Admin | null> {
    const admin = await this.prisma.user.findFirst({
      where: {
        id,
        tenantId,
      },
    })

    if (!admin) return null

    return AdminMapper.toDomain(admin)
  }
}
