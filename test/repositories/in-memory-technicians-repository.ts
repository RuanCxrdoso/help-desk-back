import { ITechniciansRepository } from '@/domain/help-desk/application/repositories/technicians-repository'
import { Technician } from '@/domain/help-desk/enterprise/entities/technician'

export class InMemoryTechniciansRepository implements ITechniciansRepository {
  public items: Technician[] = []

  async create(user: Technician) {
    this.items.push(user)
  }

  async findById(id: string) {
    const user = this.items.find((item) => item.id.toString() === id)

    if (!user) return null

    return user
  }

  async findByEmail(email: string) {
    const user = this.items.find((item) => item.email.value === email)

    if (!user) return null

    return user
  }
}
