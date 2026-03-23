import { ITechniciansRepository } from '@/domain/help-desk/application/repositories/technicians-repository'
import { Technician } from '@/domain/help-desk/enterprise/entities/technician'

export class InMemoryTechniciansRepository implements ITechniciansRepository {
  public items: Technician[] = []

  async create(user: Technician) {
    this.items.push(user)
  }

  async findById(id: string, tenantId: string) {
    const user = this.items.find(
      (item) =>
        item.id.toString() === id && item.tenantId.toString() === tenantId,
    )

    if (!user) return null

    return user
  }

  async findByEmail(email: string, tenantId: string) {
    const user = this.items.find(
      (item) =>
        item.email.value === email && item.tenantId.toString() === tenantId,
    )

    if (!user) return null

    return user
  }
}
