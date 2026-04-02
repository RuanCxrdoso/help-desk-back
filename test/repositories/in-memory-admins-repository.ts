import { IAdminsRepository } from '@/domain/help-desk/application/repositories/admins-repository'
import { Admin } from '@/domain/help-desk/enterprise/entities/admin'
import { InMemoryUsersRepository } from './in-memory-users-repository'

export class InMemoryAdminsRepository implements IAdminsRepository {
  public items: Admin[] = []

  constructor(private usersRepository: InMemoryUsersRepository) {}

  async create(user: Admin) {
    this.items.push(user)
    this.usersRepository.items.push(user)
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
