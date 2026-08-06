import { ITechniciansRepository } from '@/domain/help-desk/application/repositories/technicians-repository'
import { Technician } from '@/domain/help-desk/enterprise/entities/technician'
import { InMemoryUsersRepository } from './in-memory-users-repository'
import { PaginationParams } from '@/core/types/pagination'

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

  async findMany(tenantId: string, params: PaginationParams) {
    const {
      q,
      page,
      perPage,
      orderBy = 'createdAt',
      order = 'asc',
      status = 'ACTIVE',
    } = params

    let filteredItems = this.items.filter(
      (item) => item.tenantId.toString() === tenantId,
    )

    if (status === 'ACTIVE') {
      filteredItems = filteredItems.filter((item) => item.isActive === true)
    } else if (status === 'INACTIVE') {
      filteredItems = filteredItems.filter((item) => item.isActive === false)
    }

    if (q) {
      filteredItems = filteredItems.filter(
        (item) =>
          item.firstName.toLowerCase().includes(q.toLowerCase()) ||
          item.lastName.toLowerCase().includes(q.toLowerCase()) ||
          item.email.value.toLowerCase().includes(q.toLowerCase()),
      )
    }

    filteredItems.sort((a, b) => {
      const valueA =
        orderBy === 'email'
          ? a.email.value.toLowerCase()
          : String(a[orderBy as keyof typeof a]).toLowerCase()
      const valueB =
        orderBy === 'email'
          ? b.email.value.toLowerCase()
          : String(b[orderBy as keyof typeof b]).toLowerCase()

      if (valueA < valueB) return order === 'asc' ? -1 : 1
      if (valueA > valueB) return order === 'asc' ? 1 : -1
      return 0
    })

    const totalCount = filteredItems.length
    const totalPages = Math.ceil(totalCount / perPage)
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage

    const paginatedItems = filteredItems.slice(startIndex, endIndex)

    return {
      items: paginatedItems,
      page,
      perPage,
      totalCount,
      totalPages,
      orderBy,
      order,
    }
  }

  async save(technician: Technician): Promise<void> {
    const technicianIndex = this.items.findIndex(
      (item) =>
        item.id.equals(technician.id) && item.tenantId === technician.tenantId,
    )

    this.items[technicianIndex] = technician

    return
  }
}
