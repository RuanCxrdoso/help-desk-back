import { IAdminsRepository } from '@/domain/help-desk/application/repositories/admins-repository'
import { Admin } from '@/domain/help-desk/enterprise/entities/admin'

export class InMemoryAdminsRepository implements IAdminsRepository {
  public items: Admin[] = []

  async create(user: Admin) {
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
