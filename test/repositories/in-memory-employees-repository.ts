import { IEmployeesRepository } from '@/domain/help-desk/application/repositories/employees-repository'
import { Employee } from '@/domain/help-desk/enterprise/entities/employee'
import { InMemoryUsersRepository } from './in-memory-users-repository'

export class InMemoryEmployeesRepository implements IEmployeesRepository {
  public items: Employee[] = []

  constructor(private usersRepository: InMemoryUsersRepository) {}

  async create(user: Employee) {
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
