import { ITechniciansRepository } from '@/domain/help-desk/application/repositories/technicians-repository'
import { Technician } from '@/domain/help-desk/enterprise/entities/technician'
import { InMemoryUsersRepository } from './in-memory-users-repository'

export class InMemoryTechniciansRepository implements ITechniciansRepository {
  public items: Technician[] = []

  constructor(private usersRepository: InMemoryUsersRepository) {}

  async create(user: Technician) {
    this.items.push(user)

    const userAlreadyExists = this.usersRepository.items.some((item) =>
      item.id.equals(user.id),
    )

    if (!userAlreadyExists) {
      this.usersRepository.items.push(user)
    }
  }

  async findById(id: string, tenantId: string) {
    const user = this.items.find(
      (item) =>
        item.id.toString() === id && item.tenantId.toString() === tenantId,
    )

    if (!user) return null

    return user
  }
}
