import { ISuperAdminsRepository } from '@/domain/help-desk/application/repositories/super-admins-repository'
import { SuperAdmin } from '@/domain/help-desk/enterprise/entities/super-admin'

export class InMemorySuperAdminsRepository implements ISuperAdminsRepository {
  public items: SuperAdmin[] = []

  async create(user: SuperAdmin) {
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
