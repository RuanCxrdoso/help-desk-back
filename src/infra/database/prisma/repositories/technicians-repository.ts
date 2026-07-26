import { ITechniciansRepository } from '@/domain/help-desk/application/repositories/technicians-repository'
import { PrismaService } from '../prisma.service'
import { Technician } from '@/domain/help-desk/enterprise/entities/technician'
import { TechnicianMapper } from '../mappers/technician-mapper'
import { Injectable } from '@nestjs/common'

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
      },
      include: {
        technicianProfile: true,
      },
    })

    if (!technician || !technician.technicianProfile) return null

    return TechnicianMapper.toDomain(technician)
  }
}
