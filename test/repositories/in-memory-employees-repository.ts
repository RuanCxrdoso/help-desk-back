import { IEmployeesRepository } from '@/domain/help-desk/application/repositories/employees-repository'
import { Employee } from '@/domain/help-desk/enterprise/entities/employee'

export class InMemoryEmployeesRepository implements IEmployeesRepository {
  public items: Employee[] = []

  async create(user: Employee) {
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
